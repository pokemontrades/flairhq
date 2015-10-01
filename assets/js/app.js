define([
  'angular',
  'jquery',
  'refCtrl',
  'indexCtrl',
  'userCtrl',
  'adminCtrl',
  'banCtrl',
  'angular-spinner',
  'angular-md'
], function (
    ng,
    $,
    refCtrl,
    indexCtrl,
    userCtrl,
    adminCtrl,
    banCtrl
    ) {

  var fapp = ng.module("fapp", [
    'angularSpinner',
    'ngReallyClickModule',
    'numberPaddingModule',
    'yaru22.md',
    'tooltipModule',
    'genericTooltipModule',
    'ngMask'
  ]);

  // Define controllers, and their angular dependencies
  fapp.controller("referenceCtrl", ['$scope', '$filter', refCtrl]);
  fapp.controller("indexCtrl", ['$scope', '$filter', indexCtrl]);
  fapp.controller("userCtrl", ['$scope', '$filter', '$location', '$timeout', userCtrl]);
  fapp.controller("adminCtrl", ['$scope', adminCtrl]);
  fapp.controller("banCtrl", ['$scope', banCtrl]);

  // Bug fix for iOS safari
  $(function () {
    $("[data-toggle='collapse']").click(function () {
        // For some reason, iOS safari doesn't let collapse work on a div if it
        // doesn't have a click handler. The click handler doesn't need to do anything.
    });
  });

  return fapp;
});