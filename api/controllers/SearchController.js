/* global module, Application, User, Reddit */
var reddit = require('redwrap');


module.exports = {

  quick: function (req, res) {
    if (!req.user) {
      return res.json("Not logged in", 403);
    }

    var searchTerm = req.params.searchterm;

    var appData = {
      or: [
        {user2: {'contains': searchTerm}},
        {description: {'contains': searchTerm}},
        {gave: {'contains': searchTerm}},
        {got: {'contains': searchTerm}}
      ],
      limit: 10
    };

    Reference.find(appData).exec(function (err, apps) {
      async.map(apps, function (ref, callback) {
        User.findOne({id: ref.user}).exec(function (err, refUser) {
          ref.user = refUser.name;
          callback(null, ref);
        });
      }, function (err, results) {
        return res.json(results);
      });
      return res.json(apps, 200);
    });
  },

  all: function (req, res) {
    if (!req.user) {
      return res.json("Not logged in", 403);
    }

    var searchTerm = req.params.searchterm;

    var appData = {
      or: [
        {user2: {'contains': searchTerm}},
        {description: {'contains': searchTerm}},
        {gave: {'contains': searchTerm}},
        {got: {'contains': searchTerm}}
      ]
    };

    Reference.find(appData).exec(function (err, apps) {
      return res.json(apps, 200);
    });
  }
};

