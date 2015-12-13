/**
 * A module to give us a nice, easy way to use markdown in the app
 */

var angular = require("angular");
var Snudown = require("snudown-js");
var remapURLs = require("./remapURLs");

module.exports = angular.module("fapp.md", [])
  .directive("md", function () {
    return {
      restrict: "E",
      require: "?ngModel",
      link: function ($scope, $elem, $attrs, ngModel) {
        if (!ngModel) {
          var html = remapURLs(Snudown.markdown($elem.text()));
          $elem.html(html);
          return;
        }
        ngModel.$render = function () {
          var html = remapURLs(Snudown.markdown(ngModel.$viewValue || ""));
          $elem.html(html);
        };
      }
    };
  });