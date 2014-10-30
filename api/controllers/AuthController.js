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
    passport.authenticate('reddit', {
      state: req.session.state,
      duration: 'permanent',
      failureRedirect: '/login'
    },
    function (err, user) {
      req.logIn(user, function(err) {
        if (err) {
          console.log("Failed login: " + err);
          res.view(403, {error: err});
          return;
        }
        res.redirect('/');
        return;
      });
    })(req, res);

  }
};
