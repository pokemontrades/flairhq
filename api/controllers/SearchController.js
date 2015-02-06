/* global module, Reference, Search, User */
var reddit = require('redwrap');


module.exports = {

  quick: function (req, res) {
    var params = req.allParams();
    if (!req.user) {
      return res.json("Not logged in", 403);
    }

    var searchData = {
      description: params.keyword,
      user: params.keyword
    };

    if (params.categories) {
      searchData.categories = params.categories.split(",");
    }

    Search.quick(searchData, function (results) {
      return res.json(results);
    });
  },

  normal: function (req, res) {
    var params = req.allParams();
    if (!req.user) {
      return res.json("Not logged in", 403);
    }

    var searchData = {
      description: params.keyword,
      user: params.user
    };

    if (params.categories) {
      searchData.categories = params.categories.split(",");
    }

    Search.quick(searchData, function (results) {
      return res.json(results);
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

