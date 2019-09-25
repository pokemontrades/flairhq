/**
 * HomeController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require("fs");
var _ = require("lodash");

module.exports = {
  
  ui: function(req, res) {
    if (sails.config.environment === 'production') {
      fs.createReadStream(__dirname + "/../../.tmp/public/index.html").pipe(res);
    } else {
      res.redirect("http://localhost:8080/");
    }
  },

  // TODO: Delete this, after the code has been moved elsewhere
  index: async function (req, res) {
    res.view({refUser: await Users.get(req.user, req.user.name)});
    Reddit.getBothFlairs(sails.config.reddit.adminRefreshToken, req.user.name).then(function (flairs) {
      if (flairs[0] || flairs[1]) {
        var ptrades_fcs, svex_fcs;
        if (flairs[0] && flairs[0].flair_text) {
          ptrades_fcs = flairs[0].flair_text.match(/(\d{4}-){2}\d{4}/g);
        }
        if (flairs[1] && flairs[1].flair_text) {
          svex_fcs = flairs[1].flair_text.match(/(\d{4}-){2}\d{4}/g);
        }
        User.update({id: req.user.id})
          .set({flair: {ptrades: flairs[0], svex: flairs[1]}, loggedFriendCodes: _.union(ptrades_fcs, svex_fcs, req.user.loggedFriendCodes)})
          .catch((err) => sails.log.error(err));
      }
    }, sails.log.error);
  },

  version: function(req, res) {
    res.ok(sails.config.version);
  },
  
  discord: function (req, res) {
    let redirect_uri = encodeURIComponent(sails.config.discord.redirect_host + '/discord/callback');
    let authorize_uri = 'https://discordapp.com/api/oauth2/authorize?client_id='+ sails.config.discord.client_id + '&redirect_uri='+ redirect_uri + '&response_type=code&scope=identify%20guilds.join';
    res.redirect(authorize_uri);
  }
  
};
