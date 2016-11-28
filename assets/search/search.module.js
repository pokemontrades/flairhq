/**
 *
 */

var angular = require("angular");
var controller = require("./search.controller.js");

var searchModule = angular.module("fapp.search", []);
searchModule.controller("SearchController", ['$scope', '$timeout', controller]);

module.exports = searchModule;
