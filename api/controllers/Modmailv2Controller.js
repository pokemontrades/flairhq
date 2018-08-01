/**
 * NewModmailController
 *
 * @description :: Server-side logic for managing Modmails
 */

var refreshToken = sails.config.reddit.adminRefreshToken;

module.exports = {

  get: async function (req, res) {
    req.params = req.allParams();
    res.ok(await Reddit.getNewModmail(refreshToken, ['pokemontrades','svexchange'], '', 'all'));
  }


};
