/* global module, Reference, Search, User */

module.exports = {

  refView: function(req, res) {
    return res.view("search/refs", {searchTerm: decodeURIComponent(req.params.searchterm)});
  },

  logView: function(req, res) {
    return res.view("search/logs", {searchTerm: decodeURIComponent(req.params.searchterm)});
  },

  refs: function (req, res) {
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

    Search.refs(searchData, function (results) {
      return res.ok(results);
    });
  },

  log: function (req, res) {
    var params = req.allParams();
    var searchData = {
      keyword: params.keyword
    };

    searchData.skip = params.skip || 0;

    Search.logs(searchData, function (results) {
      return res.ok(results);
    });
  }
};

