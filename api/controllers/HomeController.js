/* global module, User, Reddit */
/**
 * HomeController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {
    User.findOne({id: req.user.id}, function(err, user) {
      if (user) {
        res.view();
        Reddit.getBothFlairs(sails.config.reddit.adminRefreshToken, req.user.name, function (err, flair1, flair2) {
          if (flair1 || flair2) {
            user.flair = {ptrades: flair1, svex: flair2};
            var ptrades_fcs, svex_fcs;
            if (flair1 && flair1.flair_text) {
              ptrades_fcs = flair1.flair_text.match(/(\d{4}-){2}\d{4}/g);
            }
            if (flair2 && flair2.flair_text) {
              svex_fcs = flair2.flair_text.match(/(\d{4}-){2}\d{4}/g);
            }
            user.loggedFriendCodes = _.union(ptrades_fcs, svex_fcs, user.loggedFriendCodes);
            user.save(function (err) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      } else {
        return res.badRequest();
      }
    });
  },

  reference: function(req, res) {
    User.findOne({name: req.params.user}).exec(function (err, user){
      if (user) {
        res.view();
      } else {
        res.view('404', {data: {user: req.params.user, error: "User not found"}});
      }
    });
  },

  search: function(req, res) {
    return res.view({searchTerm: decodeURIComponent(req.params.searchterm)});
  },

  banlist: function (req, res) {
    res.view();
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
