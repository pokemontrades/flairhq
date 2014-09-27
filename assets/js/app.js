var fapp = angular.module("fapp", []);

fapp.controller("referenceCtrl", function ($scope) {
  $scope.newComment = "";
  $scope.modSaveError = "";
  $scope.newStuff = {};
  $scope.refUser = {
    name: window.location.pathname.substring(3)
  };
  $scope.numberOfTrades = function () {
    if (!$scope.refUser.references) {
      return 0;
    }
    var refs = $scope.refUser.references;
    return refs.events.length + refs.shinies.length + refs.casuals.length;
  };

  io.socket.get("/user/get/" + $scope.refUser.name, function (data, res) {
    if (res.statusCode === 200) {
      $scope.refUser = data;
      if(!$scope.refUser.friendCodes || $scope.refUser.friendCodes.length === 0) {
        $scope.refUser.friendCodes = [""];
      }
      if($scope.refUser.games.length === 0) {
        $scope.refUser.games = [{tsv: "", ign: ""}];
      }
      $scope.$apply();
    }
  });

  $scope.addComment = function () {
    var comment = $scope.newComment,
      url = "/reference/comment/add";

    io.socket.post(url, {
      "refUser": $scope.refUser.id,
      "comment": comment
    }, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.comments.push(data);
        $scope.$apply();
      }
      else {
        console.log("Error");
      }
    });
  };


  $scope.modSaveProfile = function () {
    if (!$scope.user.isMod) {
      return;
    }
    var intro = $scope.refUser.intro,
      fcs = $scope.refUser.friendCodes,
      games = $scope.refUser.games,
      url = "/user/edit";

    var patt = /([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
    for (fc in fcs) {
      if (!patt.test(fcs[fc])) {
        $scope.modSaveError = "One of the friend codes wasn't in the correct format.";
        return;
      }
    }

    io.socket.post(url, {
      "userid": $scope.refUser.id,
      "intro": intro,
      "fcs": fcs,
      "games": games
    }, function (data, res) {
      console.log(res);
      if (res.statusCode === 200) {

      } else if (res.statusCode === 400) {
        $scope.modSaveError = "Your friend code was not correct.";
      } else if (res.statusCode === 500) {
        $scope.modSaveError = "There was some issue saving.";
      }
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
      console.log(res);
      if (res.statusCode === 200) {
        console.log(data);
      } else if (res.statusCode === 400) {
        $scope.modSaveError = "Your friend code was not correct.";
      } else if (res.statusCode === 500) {
        $scope.modSaveError = "There was some issue saving.";
      }
    });
  };

  $scope.approve = function (id, approve) {
    var url = "/reference/approve"

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

  $scope.banUser = function (ban) {
    var url = "/user/ban";

    io.socket.post(url, {userId: $scope.refUser.id, ban: ban}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.banned = data.banned;
        $scope.$apply();
      } else {
        console.log("Error");
      }
    });
  };


});

fapp.controller("indexCtrl", function ($scope) {
  $scope.refUrl = "";
  $scope.user2 = "";
  $scope.gave = "";
  $scope.got = "";
  $scope.type = "";
  $scope.descrip = "";

  $scope.addRefError = "";

  $scope.numberOfTrades = function () {
    if (!$scope.user || !$scope.user.references) {
      return 0;
    }
    var refs = $scope.user.references;
    return refs.events.length + refs.shinies.length + refs.casuals.length;
  };

  $scope.getReferences = function () {
    if ($scope.user) {
      io.socket.get("/user/get/" + $scope.user.name, function (data, res) {
        if (res.statusCode === 200) {
          $scope.user = data;
          $scope.$apply();
        }
      })
    } else {
      window.setTimeout($scope.getReferences, 1000);
    }
  };

  $scope.getReferences();


  $scope.addReference = function () {
    $scope.addRefError = "";
    var url = "/reference/add",
      user2 = $scope.user2,
      regexp = /(http(s?):\/\/)?(www|[a-z]*.)?reddit.com\/r\/((pokemontrades)|(SVExchange))\/comments\/([a-z\d]*)\/([a-z\d_-]*)\/([a-z\d]*)/;

    if (!$scope.type) {
      $scope.addRefError = "Please choose a type.";
      return;
    }
    if ($scope.type === "egg" || $scope.type === "giveaway") {
      if (!$scope.descrip) {
        $scope.addRefError = "Make sure you enter all the information";
        return;
      }
    } else {
      if (!$scope.got || !$scope.gave) {
        $scope.addRefError = "Make sure you enter all the information";
        return;
      }
    }
    if (!$scope.refUrl || (($scope.type !== "giveaway") && !$scope.user2)) {
      $scope.addRefError = "Make sure you enter all the information";
      return;
    }
    if (!regexp.test($scope.refUrl)) {
      $scope.addRefError = "Looks like you didn't input a proper permalink";
      return;
    }
    if (user2.indexOf("/u/") === -1) {
      user2 = "/u/" + user2;
    }

    var post = {
      "userid": $scope.user.id,
      "url": $scope.refUrl,
      "user2": user2,
      "type": $scope.type
    };

    if ($scope.type === "egg" || $scope.type === "giveaway") {
      post.descrip = $scope.descrip;
    } else {
      post.got = $scope.got;
      post.gave = $scope.gave;
    }

    io.socket.post(url, post, function (data, res) {
      console.log(res);
      if (res.statusCode === 200) {
        $scope.refUrl = "";
        $scope.descrip = "";6
        $scope.got = "";
        $scope.gave = "";
        $scope.user2 = "";

        if (data.type === "redemption") {
          $scope.user.references.events.push(data);
          $('#collapseevents').prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapseevents').prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
          $scope.$apply();
        } else if (data.type === "shiny") {
          $scope.user.references.shinies.push(data);
          $('#collapseshinies').prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapseshinies').prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
          $scope.$apply();
        } else {
          $scope.user.references[$scope.type + "s"].push(data);
          $('#collapse' + $scope.type + "s").prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapse' + $scope.type + "s").prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
          $scope.$apply();
        }
      } else {
        $scope.addRefError = "Already added that URL.";
        $scope.$apply();
      }
    });

  };

  $scope.deleteRef = function (id, index, type) {
    var url = "/reference/delete";
    io.socket.post(url, {refId: id, type: type}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.user.references[type].splice(index, 1);
        $scope.$apply();
      } else {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

});

fapp.controller("userCtrl", function ($scope) {
  $scope.user = undefined;
  $scope.getRedditUser = function (username) {
    if (username && username.indexOf("/u/") === -1) {
      return "/u/" + username;
    } else {
      return username;
    }
  };

  io.socket.get("/user/mine", function (data, res) {
    if (res.statusCode === 200) {
      $scope.user = data;
      if (!$scope.user.friendCodes) {
        $scope.user.friendCodes = [""];
      }
      if (!$scope.user.games.length) {
        $scope.user.games = [{tsv: "", ign: ""}];
      }
      $scope.$apply();
    }
  });

  $scope.addFc = function () {
    $scope.user.friendCodes.push("");
  };

  $scope.addGame = function () {
    $scope.user.games.push({tsv: "", ign: ""});
  };

  $scope.saveProfile = function () {
    var intro = $scope.user.intro,
      fcs = $scope.user.friendCodes,
      games = $scope.user.games,
      url = "/user/edit";

    var patt = /([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
    for (fc in fcs) {
      if (!patt.test(fcs[fc])) {
        $("#saveError").html("One of your friend codes wasn't in the correct format.").show();
        return;
      }
    }

    io.socket.post(url, {
      "userid": $scope.user.id,
      "intro": intro,
      "fcs": fcs,
      "games": games
    }, function (data, res) {
      console.log(res);
      if (res.statusCode === 200) {
        $("#profileModal").modal("toggle");
      } else if (res.statusCode === 400) {
        $("#saveError").html("Your friend code was not correct.").show();
      } else if (res.statusCode === 500) {
        $("#saveError").html("There was some issue saving.").show();
      }
    });

  };

});

fapp.controller("adminCtrl", function ($scope) {
  $scope.users = [];

  $scope.getBannedUsers = function () {
    io.socket.get("/user/banned", function (data, res) {
      if (res.statusCode === 200) {
        $scope.users = data;
        $scope.$apply();
      }
    });
  };

  $scope.banUser = function (user, ban) {
    var url = "/user/ban";

    io.socket.post(url, {userId: user.id, ban: ban}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.getBannedUsers();
        $scope.$apply();
      } else {
        console.log("Error");
      }
    });
  };

  $scope.getBannedUsers();
});