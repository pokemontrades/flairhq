/* global module, User, Game, Reference, ModNote, Application */
/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 */

var Q = require('q');
var reddit = require('redwrap');

module.exports = {

  edit: function (req, res) {
    req.params = req.allParams();
    User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        return res.json({error: "Can't find user"}, 404);
      } else if (user.name !== req.user.name && !req.user.isMod) {
        return res.json("You can't edit another user's information. " +
        "Unless you are a mod.", 403);
      } else {
        var updatedUser = {};
        if (req.params.intro !== undefined) {
          updatedUser.intro = req.params.intro;
        }
        if (req.params.fcs !== undefined) {
          updatedUser.friendCodes = req.params.fcs;
        }

        User.update({id: user.id}, updatedUser).exec(function (err, up) {
          if (err) {
            res.json(err, 400);
          }

          var promises = [],
            games = [];

          Game.find()
            .where({user: user.id}).exec(function (err, games) {
            games.forEach(function (game) {
              var deleteGame = true;
              req.params.games.forEach(function (game2) {
                if (game.id === game2.id) {
                  deleteGame = false;
                }
              });
              if (deleteGame) {
                promises.push(
                  Game.destroy(game.id).exec(function () {})
                );
              }
            });
          });

          req.params.games.forEach(function (game) {
            if (game.id && (game.tsv || game.ign)) {
              promises.push(Game.update(
                {id: game.id},
                {tsv: parseInt(game.tsv), ign: game.ign})
                .exec(function (err, game) {
                  if (err) {
                    console.log(err);
                    res.json(err, 400);
                  } else {
                    games.push(game);
                  }
                }
              ));
            } else if (!game.id && (game.tsv || game.ign)) {
              promises.push(Game.create(
                {user: user.id, tsv: parseInt(game.tsv), ign: game.ign})
                .exec(function (err, game) {
                  if (err) {
                    console.log(err);
                    res.json(err, 400);
                  } else {
                    games.push(game);
                  }
                }
              ));
            }
          });

          Q.all(promises).then(function () {
            up.games = games;
            res.json(up, 200);
          });
        });
      }
    });
  },

  mine: function (req, res) {
    if(!req.user) {
      return res.json(403);
    }

    Game.find()
      .where({user: req.user.id})
      .exec(function (err, games) {
        req.user.games = games;

        var appData = {
          user: req.user.name
        };

        Application.find(appData).exec(function (err, app) {
          if (err) {
            return res.json({error: err}, 500);
          }
          req.user.apps = app;
          res.json(req.user, 200);
        });
      });
  },

  get: function (req, res) {
    User.findOne({name: req.params.name}, function (err, user) {
      if (!user) {
        return res.notFound();
      }
      Game.find()
        .where({user: user.id})
        .sort({createdAt: "desc"})
        .exec(function (err, games) {

          Reference.find()
            .where({user: user.id})
            .sort({type: "asc", createdAt: "desc"})
            .exec(function (err, references) {

              Comment.find()
                .where({user: user.id})
                .sort({createdAt: "desc"})
                .exec(function (err, comments) {

                  ModNote.find()
                    .where({refUser: user.id})
                    .sort({createdAt: "desc"})
                    .exec(function (err, notes) {

                      if (req.user && user.name === req.user.name) {
                        user.isMod = req.user.isMod;
                      }
                      var publicReferences = references;
                      publicReferences.forEach(function(entry) {
                        //If the current user is not the user that submitted the trade, remove the private notes before sending the trade info.
                        if (!req.user || req.user.id !== entry.user)
                          entry.privatenotes=null;
                      });
                      user.references = publicReferences;
                      user.modNotes = notes;
                      user.games = games;
                      user.comments = comments;
                      user.redToken = undefined;
                      res.json(user, 200);
                    });
                });
            });
        });
    });
  },

  addNote: function (req, res) {
    req.params = req.allParams();

    if (!req.user.isMod) {
      res.json("Not a mod.", 403);
      return;
    }

    User.findOne({id: req.params.userid}).exec(function (err, user) {

      if (!user) {
        res.json({error: "Can't find user"}, 404);
        return;
      }

      ModNote.create({user: req.user.name, refUser: user.id, note: req.params.note})
        .exec(function (err, note) {
          if (err) {
            res.json(err, 400);
          } else {
            res.json(note, 200);
          }
        });
    });

  },

  delNote: function (req, res) {
    req.params = req.allParams();

    if (!req.user.isMod) {
      res.json("Not a mod.", 403);
      return;
    }

    User.findOne({id: req.params.userid}).exec(function (err, user) {

      if (!user) {
        res.json({error: "Can't find user"}, 404);
        return;
      }

      ModNote.destroy({id: req.params.id})
        .exec(function (err, note) {
          if (err) {
            res.json(err, 400);
          } else {
            res.json(note, 200);
          }
        });
    });
  },

  ban: function (req, res) {
    if (!req.user.isMod) {
      res.json("Not a mod", 403);
      return;
    }

    User.findOne(req.allParams().userId).exec(function (err, user) {
      if (!user) {
        return res.json("Can't find user", 404);
      }

      user.banned = req.allParams().ban;
      user.save(function (err) {
        if (err) {
          return res.json(err, 500);
        }
        res.json(user, 200);
      });
    });
  },

  permaBan: function (req, res) {
    /*  Form parameters:
          req.params.username: The user who is being banned
          req.params.banNote: The ban reason to go on the mod log (not visible to banned user, 300 characters max)
          req.params.banMessage: The note that gets sent with the "you are banned" PM
          req.params.banlistEntry: The ban reason to appear on the public banlist
          req.params.duration: The number of days that the user will be banned for.
        Permaban process:
          1. Ban user from /r/pokemontrades
          2. Ban user from /r/SVExchange
          3. Add "BANNED USER" to user's flair on /r/pokemontrades
          4. Add user's friend code to /r/pokemontrades AutoModerator config (2 separate lists)
          5. Add user's friend code to /r/SVExchange AutoModerator config (2 separate lists)
          6. Remove all of the user's TSV threads on /r/SVExchange
          7. Add user's info to banlist wiki on /r/pokemontrades
    */
    if (!req.user.isMod) {
      res.json("Not a mod", 403);
      return;
    }
    req.params = req.allParams();
    if (!req.params.username) {
      res.json("No username", 400);
      return;
    }
    if (req.params.banNote.length > 300) {
      res.json("Ban note too long", 400);
    }
    try {
      var duration = req.params.duration ? parseInt(req.params.duration) : 0;
      if (duration < 0) {
        res.json("Invalid duration", 400);
      }
    } catch (err) {
      res.json("Invalid duration", 400);
    }

    var number_of_tasks = duration ? 2 : 7;
    var completed_tasks = 0;

    //Ban user from the two subs
    var banFromSub = function (subreddit) {
      Reddit.banUser(
      req.user.redToken,
      req.params.username,
      req.params.banMessage,
      req.params.banNote,
      subreddit,
      duration,
      function (err) {
          if (err) {
            console.log(err);
            return res.json('Failed to ban user from /r/' + subreddit, 500);
          } else {
            console.log("Banned " + req.params.username + " from /r/" + subreddit);
            Application.destroy({id: req.allParams().id}).exec(function (err, app) {
              if (err) {
                console.log(err);
                return res.json('Error while banning user from /r/' + subreddit, 500);
              }
              completed_tasks++;
              if (completed_tasks >= number_of_tasks) {
                return res.json('ok', 200);
              }
            });
          }
      });
    }

    //Give the "BANNED USER" flair on pokemontrades
    var giveBannedUserFlair = function (css_class, flair_text) {
      if (!css_class) {
        css_class = 'default banned';
      } else if (css_class.indexOf(' ') === -1) {
        css_class += ' banned';
      } else {
        css_class = css_class.substring(0, css_class.indexOf(' ')) + ' banned';
      }
      Reddit.setFlair(
        req.user.redToken,
        req.params.username,
        css_class,
        flair_text,
        'pokemontrades',
        function (err) {
          if (err) {
            console.log(err);
            return res.json('Failed to give banned user flair', 500);
          } else {
              console.log("Changed " + req.params.username + "'s flair to " + css_class);
              Application.destroy({id: req.allParams().id}).exec(function (err, app) {
                if (err) {
                  console.log(err);
                  return res.json('Error while giving banned user flair', 500);
                }
                  completed_tasks++;
                  if (completed_tasks >= number_of_tasks) {
                    return res.json('ok', 200);
                  }
              });
          }
        }
      );
    }

    //Update the AutoModerator config with the user's friend codes
    var updateAutomod = function (subreddit, friend_codes) {
      Reddit.getWikiPage(
        req.user.redToken,
        subreddit,
        'config/automoderator',
        function (err, current_config) {
          if (err) {
            console.log(err);
            return res.json('Error retrieving /r/' + subreddit + ' AutoModerator config', 500);
          }
          else {
            var lines = current_config.data.content_md.split("\r\n");
            var fclist_indices = [lines.indexOf("#FCList1") + 1, lines.indexOf("#FCList2") + 1];
            if (fclist_indices.indexOf(0) != -1) {
              console.log("Error: Could not find #FCList tags in /r/" + subreddit + " AutoModerator config");
              return res.json('Error parsing /r/' + subreddit + ' AutoModerator config', 500);
            }
            try {
              for (var listno = 0; listno < fclist_indices.length; listno++) {
                var before_bracket = lines[fclist_indices[listno]].substring(0,lines[fclist_indices[listno]].indexOf("]"));
                for (var i = 0; i < friend_codes.length; i++) {
                  before_bracket += ", \"" + friend_codes[i] + "\"";
                }
                lines[fclist_indices[listno]] = before_bracket + "]";
              }
            }
            catch (err) {
              console.log('Error parsing /r/" + subreddit + " AutoModerator config');
              return res.json('Error parsing /r/" + subreddit + " AutoModerator config', 500);
            }
            var content = lines.join("\r\n");
            Reddit.editWikiPage(
              req.user.redToken,
              subreddit,
              'config/automoderator',
              content,
              'FlairHQ: Updated banned friend codes',
              function (err, response) {
                if (err) {
                  console.log(err);
                  return res.json('Failed to update /r/' + subreddit + ' AutoModerator config', 500);
                } else {
                    console.log("Added /u/" + req.params.username + "'s friend codes to /r/" + subreddit + " AutoModerator blacklist");
                    Application.destroy({id: req.allParams().id}).exec(function (err, app) {
                      if (err) {
                        console.log(err);
                        return res.json('Error while updating /r/' + subreddit + 'AutoModerator config', 500);
                      }
                        completed_tasks++;
                        if (completed_tasks >= number_of_tasks) {
                          return res.json('ok', 200);
                        }
                    });
                }
              }
            );
          }
        }
      );
    };

    //Remove the user's TSV threads on /r/SVExchange.
    var removeTSVThreads = function() {
      Reddit.searchTSVThreads(
        req.user.redToken,
        req.params.username,
        function (err, response) {
          if (err) {
            console.log(err);
            return res.json('Failed to search for user\'s TSV threads', 500);
          } else {
            response.data.children.forEach(function (entry) {
              Reddit.removePost(
                req.user.redToken,
                entry.data.id,
                function (err) {
                  if (err) {
                    console.log(err);
                    return res.json('Failed to remove the TSV thread at redd.it/' + entry.data.id, 500);
                  } else {
                      console.log('Removed the TSV thread at redd.it/' + entry.data.id + ' (OP banned)');
                      Application.destroy({id: req.allParams().id}).exec(function (err, app) {
                        if (err) {
                          return res.json('Error while removing the user\'s TSV threads', 500);
                        }
                      });
                  }
                }
              );
            });
            Application.destroy({id: req.allParams().id}).exec(function (err, app) {
              if (err) {
                console.log(err);
                return res.json('Error while removing the user\'s TSV threads', 500);
              }
              completed_tasks++;
              if (completed_tasks >= number_of_tasks) {
                return res.json('ok', 200);
              }
            });
          }
        }
      );
    };

    //Update the public banlist with the user's information
    var updateBanlist = function (friend_codes, igns) {
      Reddit.getWikiPage(
        req.user.redToken,
        'pokemontrades',
        'banlist',
        function (err, current_list) {
          if (err) {
            console.log(err);
            return res.json('Failed to retrieve current banlist', 500);
          }
          else {
            var lines = current_list.data.content_md.split("\r\n");
            var start_index = lines.indexOf("[//]:# (BEGIN BANLIST)") + 3;
            if (start_index == 2) {
              console.log("Error: Could not find start marker in public banlist");
              return res.json('Error while parsing public banlist', 500);
            }
            var line_to_add = '/u/' + req.params.username + ' | ' + friend_codes.join(", ") + ' | ' + req.params.banlistEntry + ' | ' + igns;
            var content = lines.slice(0,start_index).join("\r\n") + "\r\n" + line_to_add + "\r\n" + lines.slice(start_index).join("\r\n");
            Reddit.editWikiPage(
              req.user.redToken,
              'pokemontrades',
              'banlist',
              content,
              '',
              function (err, response) {
                if (err) {
                  console.log(err);
                  return res.json('Failed to update public banlist', 500);
                } else {
                    console.log("Added /u/" + req.params.username + " to public banlist");
                    Application.destroy({id: req.allParams().id}).exec(function (err, app) {
                      if (err) {
                        console.log(err);
                        return res.json('Error while updating public banlist', 500);
                      }
                        completed_tasks++;
                        if (completed_tasks >= number_of_tasks) {
                          return res.json('ok', 200);
                        }
                    });
                }
              }
            );
          }
        }
      );
    };

    Reddit.getFlair(req.user.redToken, function (flair1, flair2) {
      if (flair1) {
        if (flair1.flair_css_class.indexOf(' ') === -1) {
          flair1.flair_css_class += ' banned';
        } else {
          flair1.flair_css_class = flair1.flair_css_class.substring(0, flair1.flair_css_class.indexOf(' ')) + ' banned';
        }
      } else {
        flair1 = {flair_css_class: 'banned'};
        flair1.flair_text = '';
      }
      if (!flair2) {
        flair2 = {flair_text: ''};
      }
      var ptrades_fcs = flair1.flair_text.match(/(\d{4}-){2}\d{4}/g) || [];
      var svex_fcs = flair2.flair_text.match(/(\d{4}-){2}\d{4}/g) || [];
      var combined = ptrades_fcs.concat(svex_fcs);
      var unique_fcs = combined.filter(function(elem, pos) {
        return combined.indexOf(elem) == pos;
      });
      var igns = flair1.flair_text.substring(flair1.flair_text.indexOf("||") + 3);
      banFromSub('pokemontrades');
      banFromSub('SVExchange');
      if (!duration) { // Permanent ban
        giveBannedUserFlair(flair1.flair_css_class, flair1.flair_text);
        updateAutomod('pokemontrades', unique_fcs);
        updateAutomod('SVExchange', unique_fcs)
        removeTSVThreads();
        updateBanlist(unique_fcs, igns);
      }

    }, req.params.username);
  },
  
  bannedUsers: function (req, res) {
    if (!req.user.isMod) {
      res.json("Not a mod", 403);
      return;
    }

    User.find({banned: true}).exec(function (err, users) {
      res.json(users, 200);
    });
  }
};
