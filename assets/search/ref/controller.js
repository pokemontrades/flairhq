/* global Search */
module.exports = function (req, res) {
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
};