/* global module, User, Game, Reference, ModNote, Application */
/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 */

var Q = require('q');
var Reddit = require('redwrap');

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
    sails.log("ban() called (bad)");
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
    sails.log("permaBan() called (good)");
    /*  Form parameters:
          req.params.username: The user who is being banned
          req.params.banNote: The ban reason to go on the mod log (not visible to banned user, 300 characters max)
          req.params.banMessage: The note that gets sent with the "you are banned" PM
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

    //Ban user from the two subs
    for (sub in ["pokemontrades","SVExchange"])
    {
      Reddit.banUser(
      req.user.redToken,
      req.params.username,
      req.params.banMessage,
      req.params.banNote,
      sub,
      function (err, css_class) {
          if (err) {
            sails.log(err);
            return res.json(err, 500);
          } else {
            sails.log("Banned " + user.name + "from /r/" + sub);
            Application.destroy({id: req.allParams().id}).exec(function (err, app) {
              if (err) {
                return res.json(err, 500);
              }
              return res.json(app, 200);
            });
          }
      });
    }
    sails.log("should be banned by now");
    //Give the "BANNED USER" flair on pokemontrades
    var flair;
    Reddit.getFlair(req.user.redToken, function (flair1, flair2) {
      if (flair1 || flair2) {
        flair = {ptrades: flair1, svex: flair2};
        user.save(function (err) {
          if (err) {
            console.log(err);
          }
        });
      } else {
        flair = {ptrades: {flair_text: '', flair_css_class: ''}};
      }
    }, req.params.username);
    var temp_css = flair.ptrades.flair_css_class;
    if (!flair.ptrades.flair_css_class) {
      flair.ptrades.flair_css_class = 'banned';
    } else if (flair.ptrades.flair_css_class.indexOf(' ') === -1) {
      flair.ptrades.flair_css_class += ' banned';
    } else {
      flair.ptrades.flair_css_class = flair.ptrades.flair_css_class.substring(0, flair.ptrades.flair_css_class.indexOf(' ')) + ' banned';
    }
    Reddit.setFlair(
      req.user.redToken,
      req.params.username,
      flair.ptrades.flair_css_class,
      flair.ptrades.flair_text,
      'pokemontrades', function (err, css_class) {
      if (err) {
        return res.json(err, 500);
      } else {
          console.log("Changed " + user.name + "'s flair to " + css_class);
          Application.destroy({id: req.allParams().id}).exec(function (err, app) {
          if (err) {
            return res.json(err, 500);
          }
          return res.json(app, 200);
        });
      }
    });

    //
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

