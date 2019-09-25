var searchTypes = require("../../ui/search/types.js");
var exportObject = {};

for (let i = 0; i < searchTypes.length; i++) {
  // And here we will programmatically add the search functions
  let type = searchTypes[i];
  exportObject[type.short] = type.controller;
}


module.exports = exportObject;