var ng = require('angular');
var $ = require('jquery');
var _csrf = $('#app').attr('_csrf');

var refCtrl = require('./refCtrl');
var indexCtrl = require('./indexCtrl');
var adminCtrl = require('./adminCtrl');
var banCtrl = require('./banCtrl');
var userCtrl = require('./userCtrl');
require('./search/search.module');
require('./markdown/markdown.module');
require('angular-spinner');
require('angular-bootstrap-npm');
require('angular-mask');
require('bootstrap');
require('./ngReallyClick');
require('./tooltip/tooltip.module');
require('./numberPadding');
//require('spin');

var fapp = ng.module("fapp", [
  'angularSpinner',
  'ngReallyClickModule',
  'numberPaddingModule',
  'tooltipModule',
  'ngMask',
  'fapp.search',
  'fapp.md'
]);

fapp.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

fapp.service('io', function () {
  var socket = require('socket.io-client');
  var io = require('sails.io.js')(socket);
  io.socket.post = function (url, data, callback) {
    data._csrf = _csrf;
    io.socket.request({method: 'post', url: url, params: data}, callback);
  };
  return io;
});

// Define controllers, and their angular dependencies
fapp.controller("referenceCtrl", ['$scope', 'io', refCtrl]);
fapp.controller("indexCtrl", ['$scope', 'io', indexCtrl]);
fapp.controller("userCtrl", ['$scope', '$location', 'io', userCtrl]);
fapp.controller("adminCtrl", ['$scope', 'io', adminCtrl]);
fapp.controller("banCtrl", ['$scope', 'io', banCtrl]);

// Bug fix for iOS safari
$(function () {
  $("[data-toggle='collapse']").click(function () {
    // For some reason, iOS safari doesn't let collapse work on a div if it
    // doesn't have a click handler. The click handler doesn't need to do anything.
  });
});

ng.bootstrap(document, ['fapp'], {strictDi: true});
