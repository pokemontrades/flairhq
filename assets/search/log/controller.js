/* global Search */
module.exports = function (req, res) {
  var params = req.allParams();
  if (!params.keyword) {
    return res.view("../search/main", {searchType: 'log', searchTerm: ''});
  }
  var searchData = {
    keyword: params.keyword
  };

  searchData.skip = params.skip || 0;

  Search.logs(searchData, function (results) {
    return res.ok(results);
  });
};