var shared = require('./sharedClientFunctions.js');
module.exports = function ($scope, io) {
  shared.addRepeats($scope, io);
  
  const messageAddition = '\n\n***\n**Please review [this page](https://www.reddit.com/r/pokemontrades/wiki/appeals) for important information before replying or taking any other action.**';
  
  $scope.banInfo = {
    username: $scope.query.username || '',
    banNote: $scope.query.banNote || '',
    banMessage: ($scope.query.banMessage || '') + messageAddition,
    banlistEntry: $scope.query.banlistEntry || '',
    tradeNote: $scope.query.tradeNote || '',
    duration: $scope.query.duration || '',
    knownAlt: $scope.query.knownAlt || '',
    additionalFCs: $scope.query.additionalFCs || ''
  };

  $scope.banError = "";
  $scope.indexOk = {};
  $scope.indexSpin = {};

  $scope.focus = {
    gavegot: false
  };

  $scope.banUser = function () {
    $scope.banError = "";
    $scope.indexOk.ban = false;
    $scope.indexSpin.ban = true;
    var url = "/user/ban";
    if (!$scope.banInfo.username) {
      $scope.banError = "Please enter a username.";
      $scope.indexSpin.ban = false;
      return;
    }

    var names = ['username', 'knownAlt'];
    for (let i = 0; i < names.length; i++) {

      if ($scope.banInfo[names[i]].match(/^\/?u\//)) {
        $scope.banInfo[names[i]] = $scope.banInfo[names[i]].substring($scope.banInfo[names[i]].indexOf('u/') + 2);
      }
      if ($scope.banInfo[names[i]] && !$scope.banInfo[names[i]].match(/^[A-Za-z0-9_-]{1,20}$/)) {
        $scope.banError = "Invalid " + names[i];
        $scope.indexSpin.ban = false;
        return;
      }
    }

    if ($scope.banInfo.banNote.length > 300) {
      $scope.banError = "The ban note cannot be longer than 300 characters.";
      $scope.indexSpin.ban = false;
      return;
    }
    
    if ($scope.banInfo.banMessage.length > 1000) {
      $scope.banError = "The ban note cannot be longer than 1000 characters.";
      $scope.indexSpin.ban = false;
      return;
    }

    if ($scope.banInfo.duration) {
      if (isNaN($scope.banInfo.duration) || parseInt($scope.banInfo.duration) < 0) {
        $scope.banError = "Invalid duration";
        $scope.indexSpin.ban = false;
        return;
      }
      if (parseInt($scope.banInfo.duration) > 999) {
        $scope.banError = "The duration cannot be longer than 999 days. For a permanent ban, leave the duration field blank.";
        $scope.indexSpin.ban = false;
        return;
      }
    }
    var FCs = [];
    if ($scope.banInfo.additionalFCs) {
      $scope.banInfo.additionalFCs.match(/(^|[^-])(\d{4}-){2}\d{4}($|[^-])/g);
      if (!$scope.banInfo.additionalFCs.match(/(^|[^-])(\d{4}-){2}\d{4}($|[^-])/g)) {
        $scope.banError = "Invalid friend code(s)";
        $scope.indexSpin.ban = false;
        return;
      }
      FCs = $scope.banInfo.additionalFCs.match(/(\d{4}-){2}\d{4}/g);
    }
    var post = {
      "username": $scope.banInfo.username,
      "banNote": $scope.banInfo.banNote,
      "banMessage": $scope.banInfo.banMessage,
      "banlistEntry": $scope.banInfo.banlistEntry,
      "tradeNote": $scope.banInfo.tradeNote,
      "duration": parseInt($scope.banInfo.duration),
      "knownAlt": $scope.banInfo.knownAlt,
      "additionalFCs": FCs
    };

    io.socket.post(url, post, function (data, res) {
      $scope.indexSpin.ban = false;
      if (res.statusCode === 200) {
        console.log(res.statusCode);
        $scope.banInfo.username = "";
        $scope.banInfo.banNote = "";
        $scope.banInfo.banMessage = "";
        $scope.banInfo.banlistEntry = "";
        $scope.banInfo.tradeNote = "";
        $scope.banInfo.duration = "";
        $scope.banInfo.knownAlt = "";
        $scope.banInfo.additionalFCs = "";
        $scope.indexOk.ban = true;
        window.setTimeout(function () {
          $scope.indexOk.addRef = false;
          $scope.$apply();
        }, 1500);
        $scope.$apply();
      } else {
        $scope.indexOk.ban = false;
        if (res.body.error) {
          $scope.banError = "Error " + res.statusCode + ": " + res.body.error;
        } else {
          $scope.banError = "Error " + res.statusCode;
        }
        $scope.$apply();
      }
    });
  };
};
