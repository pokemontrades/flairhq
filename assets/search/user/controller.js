/* global Search */
module.exports = function (req, res) {
  var params = req.allParams();
  if (!params.keyword) {
    return res.view("../search/main", {searchType: 'user', searchTerm: ''});
  }
  var searchData = {
    keyword: params.keyword
  };

  searchData.skip = params.skip || 0;

  Search.users(searchData, function (results) {
    return res.ok(results);
  });
};