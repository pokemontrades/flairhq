var $ = require('jquery');
var shared = require('./sharedClientFunctions.js');

module.exports = function ($scope, io) {
  shared.addRepeats($scope, io);
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
  $scope.selectedRef = {};
  $scope.referenceToRevert = {};
  $scope.indexOk = {};
  $scope.indexSpin = {};

  $scope.editReference = function (ref) {
    $scope.selectedRef = ref;
    $scope.referenceToRevert = $.extend(true, {}, ref);
  };

  $scope.revertRef = function () {
    var index = $scope.refUser.references.indexOf($scope.selectedRef);
    $scope.refUser.references[index] = $.extend(true, {}, $scope.referenceToRevert);
  };

  $scope.addComment = function () {
    var comment = $scope.newStuff.newComment,
      url = "/reference/comment/add";

    if (!comment.trim()) {
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

  $scope.modClearSessions = function (username) {
    var url = `/clearsession/${username}`;

    $scope.ok.modClearSessions = false;
    $scope.spin.modClearSessions = true;

    io.socket.post(url, {}, function (data, res) {
      $scope.spin.modClearSessions = false;
      if (res.statusCode === 200) {
        $scope.ok.modClearSessions = true;
        setTimeout(function () {
          $scope.ok.modClearSessions = false;
          $scope.$apply();
        }, 1500);
      } else {
        $scope.modSaveError = "There was some issue clearing sessions.";
      }
      $scope.$apply();
    });
  };

  $scope.addNote = function () {
    var newNote = $scope.newStuff.newNote,
      url = "/user/addNote";

    if (newNote.trim()) {
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
    io.socket.post(url, {id: id, approve: approve}, function (data, res) {
      if (res.statusCode === 200) {
        var index = $scope.refUser.references.findIndex(function (ref) {
          return ref.id === id;
        });
        $scope.refUser.references[index].verified = data.verified;
        $scope.$apply();
      } else {
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
          $scope.refUser.references = $scope.refUser.references.filter(function (ref) {
            return ref.type !== 'redemption';
          });
        }
        $scope.refUser.references = $scope.refUser.references.filter(function (ref) {
          return ref.type !== type;
        });
        $scope.refUser.references = $scope.refUser.references.concat(data);
      }
      $scope.spin.approveAll[type] = false;
      $scope.$apply();
    });
  };
};
