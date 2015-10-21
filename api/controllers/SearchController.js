/* global module, Reference, Search, User */

module.exports = {

  quick: function (req, res) {
    var params = req.allParams();
    var searchData = {
      description: params.keyword
    };

    if (params.categories) {
      searchData.categories = params.categories.split(",");
    }

    Search.quick(searchData, function (results) {
      return res.ok(results);
    });
  },

  normal: function (req, res) {
    var params = req.allParams();
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
      return res.ok(results);
    });
  }
};

