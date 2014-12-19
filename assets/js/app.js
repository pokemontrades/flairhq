define([
  'angular',
  'jquery',
  'refCtrl',
  'indexCtrl',
  'userCtrl',
  'adminCtrl',
  'angular-spinner',
  'angular-bootstrap',
  'angular-md'
], function (
    ng,
    $,
    refCtrl,
    indexCtrl,
    userCtrl,
    adminCtrl
    ) {

  var fapp = ng.module("fapp", [
    'angularSpinner',
    'ngReallyClickModule',
    'numberPaddingModule',
    'yaru22.md'
  ]);

  // Define controllers, and their angular dependencies
  fapp.controller("referenceCtrl", ['$scope', '$filter', refCtrl]);
  fapp.controller("indexCtrl", ['$scope', '$filter', indexCtrl]);
  fapp.controller("userCtrl", ['$scope', '$filter', userCtrl]);
  fapp.controller("adminCtrl", ['$scope', adminCtrl]);

  // Bug fix for iOS safari
  $(function () {
    $("[data-toggle='collapse']").click(function () {
        // For some reason, iOS safari doesn't let collapse work on a div if it
        // doesn't have a click handler. The click handler doesn't need to do anything.
    });
  });

  return fapp;
});