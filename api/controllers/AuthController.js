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
      failureRedirect: '/login',
      scope: 'identity'
    })(req, res);
  },

  modAuth: function(req, res) {
    req.session.state = crypto.randomBytes(32).toString('hex') + '_modlogin'; //The bit at the end prevents an infinite loop, see below
    if (req.query.url) {
      req.session.redirectUrl = req.query.url;
    }
    passport.authenticate('reddit', {
      state: req.session.state,
      duration: 'permanent',
      failureRedirect: '/login',
    })(req, res);
  },

  callback: function(req, res) {
    passport.authenticate('reddit', {
      state: req.session.state,
      duration: 'permanent',
      failureRedirect: '/login'
    },
    function (err, user) {
      var url = req.session.redirectUrl ? req.session.redirectUrl : '/';
      req.session.redirectUrl = "";
      req.logIn(user, function(err) {
        if (err) {
          console.log("Failed login: " + err);
          return res.forbidden();
        }

        Reddit.checkModeratorStatus(
          sails.config.reddit.adminRefreshToken,
          user.name,
          'pokemontrades',
          function(err, response) {
            if (err) {
              console.log('Failed to check whether /u/' + user.name + ' is a moderator.');
              console.log(err);
              return res.redirect(url);
            }

            if (response.data.children.length) { //User is a mod, set isMod to true
              user.isMod = true;
              user.save(function (err) {
                if (err) {
                  console.log('Failed to give /u/' + user.name + ' moderator status');
                  return res.view(500, {error: "You appear to be a mod, but you weren't given moderator status for some reason.\nTry logging in again."});
                }
                // Redirect to the mod authentication page. If the state ends in '_modlogin', the user was just there, so don't redirect there again.
                if (req.session.state.substr(-9) === '_modlogin') {
                  return res.redirect(url);
                }
                return res.redirect('/auth/modauth');
              });
            }

            else if (user.isMod) { // User is not a mod, but had isMod set for some reason (e.g. maybe the user used to be a mod). Set isMod to false.
              user.isMod = false;
              user.save(function (err) {
                if (err) {
                  console.log('Failed to demote user /u/' + user.name + 'from moderator status');
                  return res.view(500, {error: err});
                }
                return res.redirect(url);
              });
            } else { // Regular user
              return res.redirect(url);
            }
          }
        );

      });
    })(req, res);
  }

};
