var searchTypes = require("../../assets/search/types.js");
var exportObject = {};

for (let i = 0; i < searchTypes.length; i++) {
  // Let's programmatically add the views, because we can.
  let type = searchTypes[i];
  exportObject[type.short + "View"] = function (req, res) {
    return res.view("../search/main", {
      searchType: type.short,
      searchTerm: decodeURIComponent(req.params.searchterm)
    });
  };
}

for (let i = 0; i < searchTypes.length; i++) {
  // And here we will programmatically add the search functions
  let type = searchTypes[i];
  exportObject[type.short] = type.controller;
}


module.exports = exportObject;