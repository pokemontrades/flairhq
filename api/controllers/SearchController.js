/* global module, Reference, Search, User */
var reddit = require('redwrap');


module.exports = {

  quick: function (req, res) {
    var params = req.allParams();
    if (!req.user) {
      return res.json("Not logged in", 403);
    }

    var searchData = {
      description: params.keyword
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
      description: params.keyword
    };

    if (params.user) {
      searchData.user = params.user;
    }

    if (params.categories) {
      searchData.categories = params.categories.split(",");
    }

    searchData.skip = params.skip || 0;

    Search.quick(searchData, function (results) {
      return res.json(results);
    });
  }
};

