/* global module, Application, User, Reddit */
var reddit = require('redwrap');


module.exports = {

  apply: function (req, res) {
    if (!req.user) {
      return res.json("Not logged in", 403);
    }

    var appData = {
      user: req.user.name,
      flair: req.allParams().flair,
      sub: req.allParams().sub
    };

    Application.find(appData).exec(function (err, app) {
      if (err) {
        return res.json({error: err}, 500)
      }
      if (app.length > 0) {
        return res.json({error: "Application already exists"}, 400)
      }
      Application.create(appData).exec(function (err, apps) {
        if (err) {
          return res.json({error: err}, 500);
        }
        if (apps) {
          return res.json(appData, 200);
        }
      });
    });
  },

  denyApp: function (req, res) {
    if (!req.user || !req.user.isMod) {
      return res.json("Not a mod", 403);
    }

    Application.destroy({id: req.allParams().id}).exec(function (err, app) {
      if (err) {
        return res.json(err, 500);
      }
      return res.json(app, 200);
    });
  },

  approveApp: function (req, res) {
    if (!req.user || !req.user.isMod) {
      return res.json("Not a mod", 403);
    }
    var appId = req.allParams().id;

    Application.findOne(appId).exec(function (err, app) {
      if (!app) {
        return res.json("Application not found.", 404);
      }
      User.findOne({name: app.user}).exec(function (err, user) {
        if (err) {
          return res.json(err, 500);
        }
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
            return res.json(err, 500);
          } else {
            Event.create({
              type: "flairTextChange",
              user: req.user.id,
              content: "Changed " + user.name + "'s flair to " + css_class
            }).exec(function () {

            });
            console.log("Changed " + user.name + "'s flair to " + css_class);
            Application.destroy({id: req.allParams().id}).exec(function (err, app) {
              if (err) {
                return res.json(err, 500);
              }
              return res.json(app, 200);
            });
          }
        });
      });
    });
  },

  setText: function (req, res) {
    if (!req.user) {
      return res.json("Not logged in", 403);
    }

    var ptrades = /(([0-9]{4}-){2}[0-9]{4})(, (([0-9]{4}-){2}[0-9]{4}))* \|\| ([^ ,|(]*( \((X|Y|ΩR|αS)\))?)(, ([^ ,|(]* \((X|Y|ΩR|αS)\)))*/g;
    var svex = /(([0-9]{4}-){2}[0-9]{4})(, (([0-9]{4}-){2}[0-9]{4}))* \|\| ([^ ,|(]*( \((X|Y|ΩR|αS)\))?)(, ([^ ,|(]* \((X|Y|ΩR|αS)\)))* \|\| ([0-9]{4}|XXXX)(, (([0-9]{4})|XXXX))*/g;

    if (!req.allParams().ptrades.match(ptrades) || !req.allParams().svex.match(svex)) {
      return res.json("Changed string", 400);
    }

    Reddit.setFlair(
      Reddit.data.adminRefreshToken,
      req.user.name,
      req.user.flair.ptrades.flair_css_class,
      req.allParams().ptrades,
      "PokemonTrades", function (err, css_class) {
        if (err) {
          return res.json(err, 500);
        } else {
          Reddit.setFlair(
            Reddit.data.adminRefreshToken,
            req.user.name,
            req.user.flair.svex.flair_css_class,
            req.allParams().svex,
            "SVExchange", function (err, css_class) {
              if (err) {
                return res.json(err, 500);
              } else {
                var ipAddress = req.headers['x-forwarded-for'] || req.ip;
                Event.create([{
                  type: "flairTextChange",
                  user: req.user.id,
                  content: "Changed PokemonTrades flair text to: " + req.allParams().ptrades + ". IP: " + ipAddress
                }, {
                  type: "flairTextChange",
                  user: req.user.id,
                  content: "Changed SVExchange flair text to: " + req.allParams().svex + ". IP: " + ipAddress
                }]).exec(function () {

                });
                return res.json(req.user, 200);
              }
            });
        }
      });
  },

  getApps: function (req, res) {
    if (!req.user || !req.user.isMod) {
      return res.json("Not a mod", 403);
    }

    Application.find().exec(function (err, apps) {
      res.json(apps, 200);
    });
  }
};

