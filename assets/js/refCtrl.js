var socket = require("socket.io-client");
var io = require("sails.io.js")(socket);
var $ = require('jquery');

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

  $scope.editRef = function () {
    $scope.editRefError = "";
    $scope.indexOk.editRef = false;
    var ref = $scope.selectedRef,
      url = "/reference/edit",
      regexp = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((pokemontrades)|(SVExchange)|(poketradereferences))\/comments\/([a-z\d]*)\/([^\/]+)\/([a-z\d]+)(\?[a-z\d]+)?/,
      regexpGive = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((SVExchange)|(pokemontrades)|(poketradereferences)|(Pokemongiveaway)|(SVgiveaway))\/comments\/([a-z\d]*)\/([^\/]+)\/?/,
      regexpMisc = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com.*/,
      regexpUser = /^(\/u\/)?[A-Za-z0-9_\-]*$/;

    if (!ref.type) {
      $scope.editRefError = "Please choose a type.";
      return;
    }
    if (ref.type === "egg" || ref.type === "giveaway" || ref.type === "misc" || ref.type === "eggcheck" || ref.type === "involvement") {
      if (!ref.description) {
        $scope.editRefError = "Make sure you enter all the information";
        return;
      }
    } else {
      if (!ref.got || !ref.gave) {
        $scope.editRefError = "Make sure you enter all the information";
        return;
      }
    }
    if (!ref.url ||
      ((ref.type !== "giveaway" && ref.type !== "misc" && ref.type !== "eggcheck") && !ref.user2)) {
      $scope.editRefError = "Make sure you enter all the information";
      return;
    }
    if (((ref.type === "giveaway" || ref.type === "eggcheck") && !regexpGive.test(ref.url)) ||
      (ref.type !== "giveaway" && ref.type !== "misc" && ref.type !== "eggcheck" && !regexp.test(ref.url)) ||
      (ref.type === "misc" && !regexpMisc.test(ref.url))) {
      $scope.editRefError = "Looks like you didn't input a proper permalink";
      return;
    }

    if (ref.user2.indexOf("/u/") === -1) {
      ref.user2 = "/u/" + ref.user2;
    }

    if (ref.user2 === ("/u/" + $scope.user.name)) {
      $scope.addRefError = "Don't put your own username there.";
      return;
    }

    if (($scope.type !== "giveaway" && $scope.type !== "misc") && !regexpUser.test(ref.user2)) {
      $scope.addRefError = "Please put a username on it's own, or in format: /u/username. Not the full url, or anything else.";
      return;
    }

    $scope.indexSpin.editRef = true;
    io.socket.post(url, ref, function (data, res) {
      $scope.indexSpin.editRef = false;
      if (res.statusCode !== 200) {
        $scope.editRefError = "There was an issue.";
        console.log(res);
      } else {
        $scope.indexOk.editRef = true;
      }
      $scope.$apply();
    });

  };

  $scope.isEvent = function (el) {
    return el.type === "event" || el.type === "redemption";
  };

  $scope.isShiny = function (el) {
    return el.type === "shiny";
  };

  $scope.isCasual = function (el) {
    return el.type === "casual";
  };

  $scope.isEggCheck = function (el) {
    return el.type === "eggcheck";
  };

  $scope.numberOfTrades = function () {
    if (!$scope.refUser.references) {
      return 0;
    }
    var refs = $scope.refUser.references;
    var event = $filter("filter")(refs, $scope.isEvent).length;
    var shiny = $filter("filter")(refs, $scope.isShiny).length;
    var casual = $filter("filter")(refs, $scope.isCasual).length;
    return event + shiny + casual;
  };

  $scope.numberOfGivenAway = function () {
    if (!$scope.refUser || !$scope.refUser.references) {
      return;
    }
    var givenAway = 0;
    $filter("filter")($scope.refUser.references,
      function (item) {
        return $scope.isGiveaway(item);
      }
    ).forEach(
      function (ref) {
        givenAway += (ref.number || 0);
      }
    );
    return givenAway;
  };

  $scope.numberOfEggsGivenAway = function () {
    var givenAway = 0;
    if (!$scope.refUser || !$scope.refUser.references) {
      return;
    }
    $filter("filter")($scope.refUser.references,
      function (item) {
        return $scope.isGiveaway(item);
      }
    ).forEach(
      function (ref) {
        if (ref.url.indexOf("SVExchange") > -1) {
          givenAway += (ref.number || 0);
        }
      }
    );
    return givenAway;
  };

  $scope.getFlairTextForSVEx = function () {
    if (!$scope.refUser || !$scope.refUser.flair) {
      return;
    }
    var flairs = $scope.refUser.flair.svex.flair_css_class.split(' '),
      flairText = "";
    for (var i = 0; i < flairs.length; i++) {
      flairText += "flair-" + flairs[i] + " ";
    }
    return flairText;
  };

  $scope.numberOfEggChecks = function () {
    if (!$scope.refUser || !$scope.refUser.references) {
      return;
    }
    var givenAway = 0;
    $filter("filter")($scope.refUser.references,
      function (item) {
        return $scope.isEggCheck(item);
      }
    ).forEach(
      function (ref) {
        if (ref.url.indexOf("SVExchange") > -1) {
          givenAway += (ref.number || 0);
        }
      }
    );
    return givenAway;
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

  $scope.addComment = function () {
    var comment = $scope.newStuff.newComment,
      url = "/reference/comment/add";

    if (!comment || comment === "") {
      return;
    }

    io.socket.post(url, {
      "refUser": $scope.refUser.id,
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

    io.socket.post(url, {refUser: $scope.refUser.id, id: id}, function (data, res) {
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
      "userid": $scope.refUser.id,
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
      } else if (res.statusCode === 400) {
        $scope.modSaveError = "Your friend code was not correct.";
      } else if (res.statusCode === 500) {
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
        "userid": $scope.refUser.id,
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

    io.socket.post(url, {
      "userid": $scope.refUser.id,
      "id": id
    }, function (data, res) {
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
      userid: $scope.refUser.id,
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
      userid: $scope.refUser.id,
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
    var url = "/mod/setlocalban";
    io.socket.post(url, {userId: $scope.refUser.id, ban: ban}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.banned = data.banned;
        $scope.$apply();
      } else {
        console.log("Error");
      }
    });
  };

  $scope.deleteRef = function (id, index, type) {
    var url = "/reference/delete";
    io.socket.post(url, {refId: id, type: type}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.references = $filter("filter")($scope.refUser.references, {id: "!" + id});
        $scope.$apply();
      } else {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

};
