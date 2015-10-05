/* global module */
/**
 * AuthController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var passport = require('passport'),
    crypto = require('crypto');

module.exports = {

  index: function(req, res) {
    res.view();
  },

  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },

  reddit: function(req, res) {
    req.session.state = crypto.randomBytes(32).toString('hex');
    if (req.query.url) {
      req.session.redirectUrl = req.query.url;
    }
    passport.authenticate('reddit', {
      state: req.session.state,
      duration: 'permanent',
      failureRedirect: '/login'
    },
    function (err, user) {
      var url = req.session.redirectUrl;
      req.session.redirectUrl = "";
      req.logIn(user, function(err) {
        if (err) {
          console.log("Failed login: " + err);
          res.view(403, {error: err});
          return;
        }
        if (url) {
          return res.redirect(url);
        }
        return res.redirect('/');
      });
    })(req, res);
  },

  modAuth: function(req, res) {
    res.redirect("https://www.reddit.com/api/v1/authorize?client_id=" + sails.config.reddit.clientID + "&response_type=code&state=" + req.session.state + "&redirect_uri=" + encodeURIComponent(sails.config.reddit.redirectURL) + "&duration=permanent&scope=flair,modflair,modcontributors,wikiread,wikiedit,read,modposts");
  }
};
