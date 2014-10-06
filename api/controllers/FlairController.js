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

  getApps: function (req, res) {
    if (!req.user || !req.user.isMod) {
      return res.json("Not a mod", 403);
    }

    Application.find().exec(function (err, apps) {
      res.json(apps, 200);
    });
  }
};

