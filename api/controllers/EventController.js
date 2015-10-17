/* global module, User, Event */
/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 */

module.exports = {

  get: function (req, res) {
    var appData = {
      limit: 20,
      sort: "createdAt DESC"
    };

    Event.find(appData).exec(function (err, events) {
      return res.ok(events);
    });
  }
};

