/* global module, Application, User, Reddit */
var moment = require('moment');

module.exports = {

  apply: function (req, res) {
    var appData = {
      user: req.user.name,
      flair: req.allParams().flair,
      sub: req.allParams().sub
    };

    Application.find(appData).exec(function (err, app) {
      if (err) {
        return res.serverError(err);
      }
      if (app.length > 0) {
        return res.badRequest("Application already exists");
      }
      Application.create(appData).exec(function (err, apps) {
        if (err) {
          return res.serverError(err);
        }
        if (apps) {
          return res.ok(appData);
        }
      });
    });
  },

  denyApp: function (req, res) {
    Application.destroy({id: req.allParams().id}).exec(function (err, app) {
      if (err) {
        return res.serverError(err);
      }
      return res.ok(app);
    });
  },

  approveApp: function (req, res) {
    var appId = req.allParams().id;
    Application.findOne(appId).exec(function (err, app) {
      if (!app) {
        return res.notFound("Application not found.");
      }
      User.findOne({name: app.user}).exec(function (err, user) {
        if (err) {
          return res.serverError(err);
        }
        var formatted = Flairs.formattedName(app.flair);
        var flair,
            css_class;
        if (app.sub === "pokemontrades" && user.flair.ptrades) {
          flair = user.flair.ptrades.flair_text;
          css_class = user.flair.ptrades.flair_css_class;
        } else if (app.sub === "svexchange" && user.flair.svex) {
          flair = user.flair.svex.flair_text;
          css_class = user.flair.svex.flair_css_class;
        }
        if (app.flair === "involvement" && css_class && css_class.indexOf("1") === -1) {
          app.flair = user.flair.ptrades.flair_css_class + "1";
        } else if (app.flair === "involvement") {
          app.flair = user.flair.ptrades.flair_css_class;
        } else if (css_class && css_class.indexOf("1") > -1) {
          app.flair += "1";
        }
        if (css_class && css_class.slice(-1) === "2") {
          app.flair += "2";
        }
        if (css_class && css_class.indexOf(' ') > -1) {
          if (app.flair.indexOf('ribbon') > -1) {
            css_class = css_class.substr(0, css_class.indexOf(' ')) + " " + app.flair;
          } else {
            css_class = app.flair + " " + css_class.substr(css_class.indexOf(' ') + 1);
          }
        } else {
          if (app.flair.indexOf('ribbon') > -1 && css_class && css_class.indexOf('ribbon') === -1) {
            css_class = css_class + " " + app.flair;
          } else if (app.flair.indexOf('ribbon') === -1 && css_class && css_class.indexOf('ribbon') > -1) {
            css_class = app.flair + " " + css_class;
          } else {
            css_class = app.flair;
          }
        }

        Reddit.setFlair(
          req.user.redToken,
          user.name,
          css_class,
          flair,
          app.sub, function (err, css_class) {
          if (err) {
            return res.badRequest(err);
          } else {
            Event.create({
              type: "flairTextChange",
              user: req.user.id,
              userName: req.user.name,
              content: "Changed " + user.name + "'s flair to " + css_class
            }).exec(function () {

            });
            console.log("Changed " + user.name + "'s flair to " + css_class);
            Reddit.sendPrivateMessage(
              sails.config.reddit.adminRefreshToken,
              'FlairHQ Notification',
              'Your application for ' + formatted + ' flair has been approved.',
              user.name,
              function (err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('Sent a confirmation PM to ' + user.name);
                }
              }
            );
            Application.destroy({id: req.allParams().id}).exec(function (err, app) {
              if (err) {
                return res.serverError(err);
              }
              return res.ok(app);
            });
          }
        });
      });
    });
  },

  setText: function (req, res) {
    var ptradesFlair = "(([0-9]{4}-){2}[0-9]{4})(, (([0-9]{4}-){2}[0-9]{4}))* \\|\\| ([^,|(]*( \\((X|Y|ΩR|αS)(, (X|Y|ΩR|αS))*\\))?)(, ([^,|(]*( \\((X|Y|ΩR|αS)(, (X|Y|ΩR|αS))*\\))?))*";
    var svExFlair = ptradesFlair + " \\|\\| ([0-9]{4}|XXXX)(, (([0-9]{4})|XXXX))*";

    if (!req.allParams().ptrades.match(new RegExp(ptradesFlair)) || !req.allParams().svex.match(new RegExp(svExFlair))) {
      return res.status(400).json({error: "Please don't change the string."});
    }


    var appData = {
      limit: 1,
      sort: "createdAt DESC",
      user: req.user.id,
      type: "flairTextChange"
    };

    Event.find(appData).exec(function (err, events) {
      if (err) {
        res.status(500).json({error: "Unknown error"});
      }
      var now = moment();
      if (events.length) {
        var then = moment(events[0].createdAt);
        then.add(2, 'minutes');
        if (then.isAfter(now)) {
          return res.status(400).json({error: "You set your flair too recently, please try again in a few minutes."});
        }
      }

      var flair_FCs = _.union(req.allParams().ptrades.match(/(\d{4}-){2}\d{4}/g), req.allParams().svex.match(/(\d{4}-){2}\d{4}/g));
      var flagged = [];

      for (var i = 0; i < flair_FCs.length; i++) {
        if (!Flairs.isValid(flair_FCs[i])) {
          flagged.push(flair_FCs[i]);
        }
      }

      var friend_codes = _.union(flair_FCs, req.user.loggedFriendCodes);

      User.update({id: req.user.id}, {loggedFriendCodes: friend_codes}, function (err, updated) {
        if (err) {
          console.log("Failed to update /u/" + req.user.name + "'s logged friend codes, for some reason");
          return;
        }
      });

      var newPFlair = req.user.flair && req.user.flair.ptrades && req.user.flair.ptrades.flair_css_class ? req.user.flair.ptrades.flair_css_class : "default";
      var newsvFlair = req.user.flair && req.user.flair.svex ? req.user.flair.svex.flair_css_class : "";
      newsvFlair = newsvFlair.replace(/2/, "");
      
      Reddit.setFlair(
        Reddit.data.adminRefreshToken,
        req.user.name,
        newPFlair,
        req.allParams().ptrades,
        "PokemonTrades", function (err, css_class) {
          if (err) {
            return res.serverError(err);
          } else {
            Reddit.setFlair(
              Reddit.data.adminRefreshToken,
              req.user.name,
              newsvFlair,
              req.allParams().svex,
              "SVExchange", function (err, css_class) {
                if (err) {
                  return res.status(500).json({error: err});
                } else {
                  var ipAddress = req.headers['x-forwarded-for'] || req.ip;
                  Event.create([{
                    type: "flairTextChange",
                    user: req.user.id,
                    userName: req.user.name,
                    content: "Changed PokemonTrades flair text to: " + req.allParams().ptrades + ". IP: " + ipAddress
                  }, {
                    type: "flairTextChange",
                    user: req.user.id,
                    userName: req.user.name,
                    content: "Changed SVExchange flair text to: " + req.allParams().svex + ". IP: " + ipAddress
                  }]).exec(function () {

                  });
                  return res.ok(req.user);
                }
              });
          }
        });
      if (flagged.length) {
        var message = "The user /u/" + req.user.name + " set a flair containing " +
        (flagged.length == 1 ? "an invalid friend code" : flagged.length + " invalid friend codes") + ".\n\n";
        if (req.allParams().ptrades) {
          message += "/u/" + req.user.name + " " + req.allParams().ptrades + " (/r/pokemontrades)\n\n";
        }
        if (req.allParams().svex) {
          message += "/u/" + req.user.name + " " + req.allParams().svex + " (/r/SVExchange)\n\n";
        }
        message += "The following friend code" + (flagged.length == 1 ? " is" : "s are") + " invalid:\n\n";
        for (i = 0; i < flagged.length; i++) {
          message += flagged[i] + "\n\n";
        }
        Reddit.sendPrivateMessage(
          Reddit.data.adminRefreshToken,
          "FlairHQ report: Invalid friend code" + (flagged.length == 1 ? "" : "s"),
          message,
          "/r/pokemontrades",
          function (err) {
            if (err) {
              console.log("Failed to send a modmail reporting /u/" + req.user.name + "'s invalid friend code(s).");
            } else {
              console.log("Sent a modmail reporting /u/" + req.user.name + "'s invalid friend code(s).");
            }
          }
        );
      }
    });
  },

  getApps: function (req, res) {
    Application.find().exec(function (err, apps) {
      return res.ok(data);
    });
  }
};

