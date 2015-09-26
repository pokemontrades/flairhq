/* global module, User, Event */
/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 */

module.exports = {

  get: function (req, res) {
    if (!req.user || !req.user.isMod) {
      return res.json("Not a mod", 403);
    }
    var appData = {
      limit: 20,
      sort: "createdAt DESC"
    };

    Event.find(appData).exec(function (err, events) {
      return res.json(events, 200);
    });
  }
};

