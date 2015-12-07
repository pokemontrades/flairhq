/**
 * HomeController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var _ = require("lodash");

module.exports = {

  index: async function (req, res) {
    res.view({refUser: await Users.get(req.user, req.user.name)});
    Reddit.getBothFlairs(sails.config.reddit.adminRefreshToken, req.user.name).then(function (flairs) {
      if (flairs[0] || flairs[1]) {
        req.user.flair = {ptrades: flairs[0], svex: flairs[1]};
        var ptrades_fcs, svex_fcs;
        if (flairs[0] && flairs[0].flair_text) {
          ptrades_fcs = flairs[0].flair_text.match(/(\d{4}-){2}\d{4}/g);
        }
        if (flairs[1] && flairs[1].flair_text) {
          svex_fcs = flairs[1].flair_text.match(/(\d{4}-){2}\d{4}/g);
        }
        req.user.loggedFriendCodes = _.union(ptrades_fcs, svex_fcs, req.user.loggedFriendCodes);
        req.user.save(function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  },

  reference: async function(req, res) {
    try {
      return res.view({refUser: await Users.get(req.user, req.params.user)});
    } catch (err) {
      if (err.statusCode === 404) {
        return res.view('404', {data: {user: req.params.user, error: "User not found"}});
      }
      return res.serverError(err);
    }
  },

  banlist: async function (req, res) {
    try {
      return res.view({bannedUsers: await Users.getBannedUsers()});
    } catch (err) {
      return res.serverError(err);
    }
  },

  banuser: function (req, res) {
    res.view();
  },

  applist: function (req, res) {
    res.view();
  },

  info: function (req, res) {
    res.view();
  },

  version: function(req, res) {
    res.ok(sails.config.version);
  }
};
