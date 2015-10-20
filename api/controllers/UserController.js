/* global module, User, Game, Reference, ModNote, Application */
/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 */

var Q = require('q');

module.exports = {

  edit: function (req, res) {
    req.params = req.allParams();
    User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        return res.notFound("Can't find user");
      } else if (user.name !== req.user.name && !req.user.isMod) {
        return res.forbidden("You can't edit another user's information unless you are a mod.");
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
            res.serverError(err);
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
                    res.serverError(err);
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
                    res.serverError(err);
                  } else {
                    games.push(game);
                  }
                }
              ));
            }
          });

          Q.all(promises).then(function () {
            up.games = games;
            res.ok(up);
          });
        });
      }
    });
  },

  mine: function (req, res) {
    Game.find()
      .where({user: req.user.id})
      .exec(function (err, games) {
        req.user.games = games;

        var appData = {
          user: req.user.name
        };

        Application.find(appData).exec(function (err, app) {
          if (err) {
            return res.serverError(err);
          }
          req.user.apps = app;
          res.ok(req.user);
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
                      //Censor confidential/classified info
                      publicReferences.forEach(function(entry) {
                        if (!req.user || req.user.id !== entry.user) {
                          entry.privatenotes = undefined;
                        }
                        if (!req.user || !req.user.isMod) {
                          entry.approved = undefined;
                          entry.verified = undefined;
                        }
                      });
                      if (req.user && req.user.isMod) {
                        user.modNotes = notes;
                      } else {
                        user.loggedFriendCodes = undefined;
                      }
                      user.references = publicReferences;
                      user.games = games;
                      user.comments = comments;
                      user.redToken = undefined;
                      return res.ok(user);
                    });
                });
            });
        });
    });
  },

  addNote: function (req, res) {
    req.params = req.allParams();
    User.findOne({id: req.params.userid}).exec(function (err, user) {

      if (!user) {
        return res.notFound("Can't find user");
      }

      ModNote.create({user: req.user.name, refUser: user.id, note: req.params.note})
        .exec(function (err, note) {
          if (err) {
            res.serverError(err);
          } else {
            res.ok(note);
          }
        });
    });

  },

  delNote: function (req, res) {
    req.params = req.allParams();
    User.findOne({id: req.params.userid}).exec(function (err, user) {
      if (!user) {
        return res.notFound("Can't find user");
      }
      ModNote.destroy({id: req.params.id})
        .exec(function (err, note) {
          if (err) {
            res.serverError(err);
          } else {
            res.ok(note);
          }
        });
    });
  },

  ban: function (req, res) {
    /*  Form parameters:
          req.params.username: The user who is being banned (String)
          req.params.banNote: The ban reason to go on the mod log (not visible to banned user, 300 characters max) (String)
          req.params.banMessage: The note that gets sent with the "you are banned" PM (String)
          req.params.banlistEntry: The ban reason to appear on the public banlist (String)
          req.params.duration: The number of days that the user will be banned for. (Integer)
          req.params.additionalFCs: A list of additional friend codes that should be banned. (Array of Strings)
        Ban process:
          1. Ban user from /r/pokemontrades
          2. Ban user from /r/SVExchange
          3. Add "BANNED USER" to user's flair on /r/pokemontrades
          4. Add "BANNED USER" to user's flair on /r/SVExchange
          5. Add user's friend code to /r/pokemontrades AutoModerator config (2 separate lists)
          6. Add user's friend code to /r/SVExchange AutoModerator config (2 separate lists)
          7. Remove all of the user's TSV threads on /r/SVExchange
          8. Add user's info to banlist wiki on /r/pokemontrades
          9. Locally ban user from FlairHQ
    */

    req.params = req.allParams();

    if (typeof req.params.username !== 'string' || !req.params.username.match(/^[A-Za-z0-9_-]{1,20}$/)) {
      return res.status(400).json({error: "Invalid username"});
    }

    if (typeof req.params.banNote !== 'string') {
      return res.status(400).json({error: "Invalid ban note"});
    }
    if (req.params.banNote.length > 300) {
      return res.status(400).json({error: "Ban note too long"});
    }

    if (typeof req.params.banMessage !== 'string') {
      return res.status(400).json({error: "Invalid ban message"});
    }

    if (typeof req.params.banlistEntry !== 'string') {
      return res.status(400).json({error: "Invalid banlist entry"});
    }

    if (req.params.duration && (typeof req.params.duration !== 'number' || req.params.duration < 0 || req.params.duration > 999 || req.params.duration % 1 !== 0)) {
      return res.status(400).json({error: "Invalid duration"});
    }

    if (!(req.params.additionalFCs instanceof Array)) {
      return res.status(400).json({error: "Invalid friendcode list"});
    }
    for (var FC = 0; FC < req.params.additionalFCs.length; FC++) {
      if (typeof req.params.additionalFCs[FC] !== 'string' || !req.params.additionalFCs[FC].match(/^(\d{4}-){2}\d{4}$/g)) {
        return res.status(400).json({error: "Invalid friendcode list"});
      }
    }

    User.findOne({name: req.params.username}, function (finding_user_error, user) {
      Reddit.getFlair(req.user.redToken, req.params.username, function (err, flair1, flair2) {
        if (err) {
          return res.serverError(err);
        }
        if (flair1 && flair1.flair_css_class && flair1.flair_text) {
          if (flair1.flair_css_class.indexOf(' ') === -1) {
            flair1.flair_css_class += ' banned';
          } else {
            flair1.flair_css_class = flair1.flair_css_class.substring(0, flair1.flair_css_class.indexOf(' ')) + ' banned';
          }
        } else {
          flair1 = {flair_css_class: 'default banned'};
          flair1.flair_text = '';
        }
        if (flair2 && flair2.flair_text) {
          if (flair2.flair_css_class) {
            flair2.flair_css_class+=' banned';
          }
          else {
            flair2.flair_css_class = 'banned';
          }
        } else {
          flair2 = {flair_css_class: 'banned'};
          flair2.flair_text = '';
        }
        var logged_fcs;
        if (user) {
          logged_fcs = user.loggedFriendCodes;
        }
        var unique_fcs = _.union(
          flair1.flair_text.match(/(\d{4}-){2}\d{4}/g),
          flair2.flair_text.match(/(\d{4}-){2}\d{4}/g),
          logged_fcs,
          req.params.additionalFCs
        );
        var igns = flair1.flair_text.substring(flair1.flair_text.indexOf("||") + 3);
        var ptradesBan = Ban.banFromSub(req.user.redToken, req.params.username, req.params.banMessage, req.params.banNote, 'pokemontrades', req.params.duration);
        var svexBan = Ban.banFromSub(req.user.redToken, req.params.username, req.params.banMessage, req.params.banNote, 'SVExchange', req.params.duration);
        var promises;
        if (req.params.duration) {
          promises = [ //Tasks for tempbanning
            ptradesBan, 
            svexBan
          ];
        } else {
          var ptradesFlair = Ban.giveBannedUserFlair(req.user.redToken, req.params.username, flair1.flair_css_class, flair1.flair_text, 'pokemontrades');
          var svexFlair = Ban.giveBannedUserFlair(req.user.redToken, req.params.username, flair2.flair_css_class, flair2.flair_text, 'SVExchange');
          var ptradesAutomod = Ban.updateAutomod(req.user.redToken, req.params.username, 'pokemontrades', unique_fcs);
          var svexAutomod = Ban.updateAutomod(req.user.redToken, req.params.username, 'SVExchange', unique_fcs);
          var removeTSV = Ban.removeTSVThreads(req.user.redToken, req.params.username);
          var updateBanlist = Ban.updateBanlist(req.user.redToken, req.params.username, req.params.banlistEntry, unique_fcs, igns);
          var localBan = Ban.localBanUser(req.params.username);
          promises = [ //Tasks for permabanning
            ptradesBan,
            svexBan,
            ptradesFlair,
            svexFlair,
            ptradesAutomod,
            svexAutomod,
            removeTSV,
            updateBanlist,
            localBan
          ];
        }
        Promise.all(promises).then(function(result) {
          res.ok();
        }, function(error) {
          console.log(error);
          res.status(500).json(error);
        });
      });
    });
  },

  setLocalBan: function (req, res) {
    User.findOne(req.allParams().userId).exec(function (err, user) {
      if (!user) {
        return res.notFound("Can't find user");
      }

      user.banned = req.allParams().ban;
      user.save(function (err) {
        if (err) {
          return res.serverError(err);
        }
        res.ok(user);
      });
    });
  },
  
  bannedUsers: function (req, res) {
    User.find({banned: true}).exec(function (err, users) {
      res.ok(users);
    });
  },

  clearSession: function (req, res) {
    Reddit.checkModeratorStatus(
      sails.config.reddit.adminRefreshToken,
      req.user.name,
      'pokemontrades',
      function(err, response) {
        if (err) {
          console.log('Failed to check whether /u/' + user.name + ' is a moderator.');
          console.log(err);
          return res.serverError();
        }
        if (response.data.children.length) { //User is a mod, clear session
          User.findOne({name: req.allParams().name}, function (err, user) {
            if (err) {
              return res.serverError(err);
            }
            if (!user) {
              return status(404).json("That user could not be found.");
            }
            Sessions.destroy({session: new RegExp('"user":"' + user.id + '"')}, function (err, sessions) {
              if (err) {
                return res.serverError(err);
              }
              res.status(200).json("Successfully cleared /u/" + req.allParams().name + "'s sessions.");
            });
          });
        }
      }
    );
  }
};
