/* global module */
/**
 * AuthController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

'use strict';

const passport = require('passport');
const crypto = require('crypto');
const _ = require('lodash');

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
    var auth_data = {state: JSON.stringify(login_info)};
    if (req.query.loginType === 'mod') {
      auth_data.duration = 'permanent'; //Mods have a permanent access token. Scope is not specified here, so the scope from config/express.js is used.
    } else {
      auth_data.scope = 'identity'; //Regular users only need a temporary access token with reduced scope.
    }
    passport.authenticate('reddit', auth_data)(req, res);
  },

  callback: function (req, res) {
    passport.authenticate('reddit', async function (err, user) {
      try {
        if (err) {
          if (err === 'banned') {
            return res.view(403, {error: 'You have been banned from FlairHQ'});
          }
          sails.log.error(err);
          return res.view(403, {error: 'Sorry, something went wrong. Try logging in again.'});
        }
        var login_info;
        try {
          login_info = JSON.parse(req.query.state);
        } catch (err) {
          sails.log.warn('/u/' + user.name + '\'s session state was in an invalid format.');
          return res.badRequest(err);
        }
        if (login_info.validation !== req.session.validation) {
          sails.log.warn("Failed login for /u/" + user.name + ": invalid session state");
          return res.view(403, {error: 'You have an invalid session state. (Try logging in again.)'});
        }
        let finishLogin = function () {
          req.logIn(user, function (err) {
            if (err) {
              sails.log.error('Failed login: ' + err);
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
        let modPermissions = await Reddit.getModeratorPermissions(sails.config.reddit.adminRefreshToken, user.name, 'pokemontrades');
        if (modPermissions) { //User is a mod, set isMod to true
          User.update(user.name, {isMod: true, modPermissions}).exec(function () {
            /* Redirect to the mod authentication page, or to the desired url if this was mod authentication.*/
            if (login_info.type !== 'mod' && ['all', 'access', 'mail', 'flair', 'wiki'].some(permission => _.includes(modPermissions, permission))) {
              return res.redirect('/auth/reddit?loginType=mod' + (login_info.redirect ? '&redirect=' + encodeURIComponent(login_info.redirect) : ''));
            }
            return finishLogin();
          });
        }
        else if (user.isMod || user.modPermissions) { // User is not a mod, but had isMod set for some reason (e.g. maybe the user used to be a mod). Set isMod to false.
          User.update(user.name, {isMod: false, modPermissions: null}).exec(finishLogin);
        } else { // Regular user
          return finishLogin();
        }
      } catch (err) {
        return res.serverError(err);
      }
    })(req, res);
  },
  
  discordCallback: async function (req, res) {
    const code = req.allParams().code;
    const user = req.user;
    const ptradesFlair = user.flair.ptrades.flair_text;
    const svexFlair = user.flair.svex.flair_text;
    if (!code) {
      return res.view(403, {error: 'Sorry, something went wrong. Please try again.'});
    }
    if (_.isNull(ptradesFlair) && _.isNull(svexFlair)) {
      return res.view(403, {error: 'Please set your flair.'});
    }
    try {
      const response = await Discord.getAccessToken(code);
      const accessToken = response.access_token;
      const currentUser = await Discord.getCurrentUser(accessToken);
      const nick = req.user.name;
      const joinedUser = await Discord.addUserToGuild(accessToken, currentUser.id, nick);
      const serverUrl = 'https://discordapp.com/channels/' + sails.config.discord.server_id;
      if (!joinedUser) {
        return res.redirect(serverUrl);
      }
      await Event.create({type: "discordJoin", user: nick,content: "Joined Discord as @" + currentUser.username + "#" + currentUser.discriminator + " (ID: " + currentUser.id + ")"});
      return res.redirect(serverUrl);
    } catch (err) {
      if (err.statusCode === 429){
        return res.view(403, {error: 'Discord servers refused to cooperate due to high number of requests. Please try again later'});
      }
      return res.serverError(err);
    }
  }
};
