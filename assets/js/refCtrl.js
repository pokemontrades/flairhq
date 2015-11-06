var socket = require("socket.io-client");
var io = require("sails.io.js")(socket);
var $ = require('jquery');
var flairService = require('../../api/services/Flairs.js');
var referenceService = require('../../api/services/References.js');
var sharedService = require('./sharedClientFunctions.js');

module.exports = function ($scope, $filter) {
  $scope.newStuff = {
    newComment: ""
  };
  $scope.modSaveError = "";
  $scope.ok = {
    approveAll: {}
  };
  $scope.spin = {
    approveAll: {}
  };
  $scope.saving = {};
  $scope.refUser = {
    name: window.location.pathname.substring(3)
  };
  $scope.selectedRef = {};
  $scope.referenceToRevert = {};
  $scope.indexOk = {};
  $scope.indexSpin = {};


  $scope.editReference = function (ref) {
    $scope.selectedRef = ref;
    $scope.referenceToRevert = $.extend(true, {}, ref);
  };

  $scope.revertRef = function () {
    var index = $scope.user.references.indexOf($scope.selectedRef);
    $scope.user.references[index] = $.extend(true, {}, $scope.referenceToRevert);
  };

  $scope.isEvent = referenceService.isEvent;
  $scope.isShiny = referenceService.isShiny;
  $scope.isCasual = referenceService.isCasual;
  $scope.isEggCheck = referenceService.isEggCheck;

  $scope.numberOfTrades = function () {
    return referenceService.numberOfTrades($scope.refUser);
  };
  $scope.numberOfGivenAway = function () {
    return referenceService.numberOfGivenAway($scope.refUser);
  };
  $scope.numberOfEggsGivenAway = function () {
    return referenceService.numberOfEggsGivenAway($scope.refUser);
  };
  $scope.numberOfEggChecks = function () {
    return referenceService.numberOfEggChecks($scope.refUser);
  };
  $scope.getFlairTextForSVEx = function () {
    return flairService.getFlairTextForUserForSVEx($scope.refUser);
  };

  io.socket.get("/user/get/" + $scope.refUser.name, function (data, res) {
    if (res.statusCode === 200) {
      $scope.refUser = data;
      if (!$scope.refUser.friendCodes || $scope.refUser.friendCodes.length === 0) {
        $scope.refUser.friendCodes = [""];
      }
      if ($scope.refUser.games.length === 0) {
        $scope.refUser.games = [{tsv: "", ign: ""}];
      }
      window.document.title = data.name + "'s reference";
      $scope.$apply();
    }
  });

  $scope.editRef = function () {
    return sharedService.editRef($scope);
  };

  $scope.addComment = function () {
    var comment = $scope.newStuff.newComment,
      url = "/reference/comment/add";

    if (!comment || comment === "") {
      return;
    }

    io.socket.post(url, {
      "refUsername": $scope.refUser.name,
      "comment": comment
    }, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.comments.unshift(data);
        $scope.newStuff.newComment = "";
        $scope.$apply();
      }
      else {
        console.log("Error");
      }
    });
  };

  $scope.deleteComment = function (id, index) {
    var url = "/reference/comment/del";

    io.socket.post(url, {id: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.comments.splice(index, 1);
        $scope.$apply();
      } else {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

  $scope.modSaveProfile = function () {
    $scope.ok.modSaveProfile = false;
    $scope.spin.modSaveProfile = true;
    if (!$scope.user.isMod) {
      return;
    }
    var intro = $scope.refUser.intro,
      fcs = $scope.refUser.friendCodes.slice(0),
      games = $scope.refUser.games,
      url = "/user/edit";

    var patt = /\d{4}(-?)\d{4}\1\d{4}/;
    for (var fcID = 0; fcID < fcs.length; fcID++) {
      if (!patt.test(fcs[fcID])) {
        $scope.spin.modSaveProfile = false;
        $scope.modSaveError = "One of the friend codes wasn't in the correct format.";
        return;
      }
    }

    for (var gameID = 0; gameID < games.length; gameID++) {
      if (isNaN(games[gameID].tsv)) {
        $scope.spin.modSaveProfile = false;
        $scope.modSaveError = "One of the tsvs is not a number.";
        return;
      }
    }

    io.socket.post(url, {
      "username": $scope.refUser.name,
      "intro": intro,
      "fcs": fcs,
      "games": games
    }, function (data, res) {
      $scope.spin.modSaveProfile = false;
      if (res.statusCode === 200) {
        $scope.ok.modSaveProfile = true;
        setTimeout(function () {
          $scope.ok.modSaveProfile = false;
          $scope.$apply();
        }, 1500);
      } else {
        $scope.modSaveError = "There was some issue saving.";
      }
      $scope.$apply();
    });

  };

  $scope.addNote = function () {
    var newNote = $scope.newStuff.newNote,
      url = "/user/addNote";

    if (newNote) {
      io.socket.post(url, {
        "username": $scope.refUser.name,
        "note": newNote
      }, function (data, res) {
        if (res.statusCode === 200) {
          $scope.refUser.modNotes.push(data);
          $scope.newStuff.newNote = "";
        } else {
          $scope.modSaveError = "There was some issue adding a note.";
        }
        $scope.$apply();
      });
    }
  };

  $scope.delNote = function (id) {
    var url = "/user/delNote";

    io.socket.post(url, {id: id}, function (data, res) {
      if (res.statusCode === 200) {
        for (var note in $scope.refUser.modNotes) {
          if (id === $scope.refUser.modNotes[note].id) {
            $scope.refUser.modNotes.splice(note, 1);
            break;
          }
        }
      } else if (res.statusCode === 400) {
        $scope.modSaveError = "Your friend code was not correct.";
      } else if (res.statusCode === 500) {
        $scope.modSaveError = "There was some issue saving.";
      }
      $scope.$apply();
    });
  };

  $scope.approve = function (id, approve) {
    var url = "/reference/approve";
    io.socket.post(url, {
      id: id,
      approve: approve
    }, function (data, res) {
      if (res.statusCode !== 200) {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

  $scope.approveAll = function (type) {
    var url = "/reference/approve/all";
    $scope.ok.approveAll[type] = false;
    $scope.spin.approveAll[type] = true;

    io.socket.post(url, {
      username: $scope.refUser.name,
      type: type
    }, function (data, res) {
      if (res.statusCode !== 200) {
        console.log(res.statusCode + ": " + data);
      } else {
        $scope.ok.approveAll[type] = true;
        if (type === "event") {
          $scope.refUser.references = $filter("filter")($scope.refUser.references, {type: "!redemption"});
        }
        $scope.refUser.references = $filter("filter")($scope.refUser.references, {type: "!" + type});
        $scope.refUser.references = $scope.refUser.references.concat(data);
      }
      $scope.spin.approveAll[type] = false;
      $scope.$apply();
    });
  };

  $scope.setLocalBan = function (ban) {
    return sharedService.setLocalBan($scope, $scope.refUser.name, ban);
  };

  $scope.deleteRef = function (id) {
    return sharedService.deleteRef($scope, $filter, id);
  };
};
