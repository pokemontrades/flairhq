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
    /*  Form parameters:
          req.params.username: The user who is being banned
          req.params.banNote: The ban reason to go on the mod log (not visible to banned user, 300 characters max)
          req.params.banMessage: The note that gets sent with the "you are banned" PM
          req.params.banlistEntry: The ban reason to appear on the public banlist
          req.params.duration: The number of days that the user will be banned for.
          req.params.additionalFCs: A list of additional friend codes that should be banned.
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

    if (!req.user.isMod) {
      return res.json({error: "Not a mod"}, 403);
    }
    req.params = req.allParams();
    if (!req.params.username) {
      return res.json({error: "No username"}, 400);
    }
    if (req.params.banNote.length > 300) {
      return res.json({error: "Ban note too long"}, 400);
    }
    try {
      var duration = req.params.duration ? parseInt(req.params.duration) : 0;
      if (duration < 0) {
        return res.json({error: "Invalid duration"}, 400);
      }
    } catch (err) {
      return res.json({error: "Invalid duration"}, 400);
    }
    try {
      for (var FC = 0; FC < req.params.additionalFCs.length; FC++) {
        if (!req.params.additionalFCs[FC].match(/^(\d{4}-){2}\d{4}$/g)) {
          return res.json({error: "Invalid friendcode list"}, 400);
        }
      }
    }
    catch (invalidfcerr) {
      return res.json({error: "Invalid friendcode list"}, 400);
    }
    User.findOne({name: req.params.username}, function (finding_user_error, user) {
      Reddit.getFlair(req.user.redToken, req.params.username, function (err, flair1, flair2) {
        if (err) {
          return res.json(err, 500);
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
        var ptradesBan = Ban.banFromSub(req.user.redToken, req.params.username, req.params.banMessage, req.params.banNote, 'pokemontrades', duration);
        var svexBan = Ban.banFromSub(req.user.redToken, req.params.username, req.params.banMessage, req.params.banNote, 'SVExchange', duration);
        var promises;
        if (duration) {
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
          res.json('ok', 200);
        }, function(error) {
          console.log(error);
          res.json({error: error}, 500);
        });
      });
    });
  },

  // Sets a local ban on a user. There's no frontend, but an authorized mod can call it directly through a POST request from the JS console.
  // io.socket.post("/mod/setlocalban", {username: "example_user", ban: true});
  setLocalBan: function(req, res) {
    if (!req.user.isMod) {
      return res.json({errors: "Not a mod"}, 403);
    }
    if (req.allParams().ban !== true && req.allParams().ban !== false) {
      //Requires an explicit statement of true or false, to prevent accidental unbans if the parameter is undefined.
      return res.json({errors: "Unspecified ban state"}, 400);
    }
    User.update({name: req.allParams().username}, {banned: req.allParams().ban}, function (err, updated) {
      if (err) {
        return res.json({errors: "Internal server error"}, 500);
      }
      if (req.allParams().ban) {
        console.log("Locally banned " + req.allParams().username);
      } else {
        console.log("Locally unbanned " + req.allParams().username);
      }
      return res.json({errors: ''}, 200);
    });
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
