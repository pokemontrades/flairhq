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

  index: function (req, res) {
    res.view();
  },

  logout: function (req, res) {
    req.logout();
    res.redirect('/');
  },

  reddit: function (req, res) {
    /* Pass the redirect info as JSON with the OAuth state. This behavior is more intuitive than storing it in the session, because otherwise the user 
     * might fail to complete the login and then be confused when they get redirected somewhere unexpected the next time they visit the site. */
    var login_info = {type: req.query.loginType, redirect: req.query.redirect || '/', validation: crypto.randomBytes(32).toString('hex')};
    req.session.validation = login_info.validation;
    var auth_data = {state: JSON.stringify(login_info), duration: 'permanent', failureRedirect: '/login'};
    if (req.query.loginType !== 'mod') {
      auth_data.scope = 'identity';
    }
    passport.authenticate('reddit', auth_data)(req, res);
  },

  callback: function (req, res) {
    passport.authenticate('reddit', {duration: 'permanent', failureRedirect: '/login'}, async function (err, user) {
      let login_info = JSON.parse(req.query.state);
      if (login_info.validation !== req.session.validation) {
        sails.warn("Failed login for /u/" + user.name + ": invalid session state");
        return res.forbidden();
      }
      let finishLogin = function () {
        req.logIn(user, function (err) {
          if (err) {
            sails.error('Failed login: ' + err);
            return res.forbidden(err);
          }
          var url = decodeURIComponent(login_info.redirect);
          // Don't redirect to other callback urls (this may cause infinite loops) or to absolute url paths (which might lead to other sites).
          if (url.indexOf('/auth/reddit/callback') === 0 || /^(?:[a-z]+:)?\/\//i.test(url)) {
            url = '/';
          }
          req.session.validation = '';
          return res.redirect(url);
        });
      };
      let modStatus = await Reddit.checkModeratorStatus(sails.config.reddit.adminRefreshToken, user.name, 'pokemontrades');
      if (modStatus) { //User is a mod, set isMod to true
        User.update(user.name, {isMod: true}).exec(function () {
          /* Redirect to the mod authentication page, or to the desired url if this was mod authentication.*/
          if (login_info.type !== 'mod') {
            return res.redirect('/auth/reddit?loginType=mod' + (login_info.redirect ? '&redirect=' + encodeURIComponent(login_info.redirect) : ''));
          }
          finishLogin();
        });
      }
      else if (user.isMod) { // User is not a mod, but had isMod set for some reason (e.g. maybe the user used to be a mod). Set isMod to false.
        User.update(user.name, {isMod: false}).exec(finishLogin);
      } else { // Regular user
        finishLogin();
      }
    })(req, res);
  }
};
