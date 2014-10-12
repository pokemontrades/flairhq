var reddit = require('redwrap');


module.exports = {

  apply: function (req, res) {
    if (!req.user) {
      return res.json("Not logged in", 403);
    }

    Application.create({
      user: req.user.name,
      flair: req.allParams().flair,
      sub: req.allParams().sub
    }).exec(function (err, apps) {
      if (err) {
        return res.json("Error: " + err, 500);
      }
      if (apps) {
        return res.json(apps, 200);
      }
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
        var flair;
        if (true) {
          flair = user.flair.ptrades.flair_text;
        } else {
          flair = user.flair.ptrades.flair_text;
        }
        Reddit.setFlair(req.user.redToken, user.name, app.flair, flair, app.sub, function (err, css_class) {
          if (err) {
            return res.json(err, 500);
          }
          Application.destroy({id: req.allParams().id}).exec(function (err, app) {
            if (err) {
              return res.json(err, 500);
            }
            return res.json(app, 200);
          });
        });
      });
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

