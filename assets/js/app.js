var fapp = angular.module("fapp", ['angularSpinner', 'ngReallyClickModule']);

fapp.controller("referenceCtrl", ['$scope', function ($scope) {
  $scope.newComment = "";
  $scope.modSaveError = "";
  $scope.newStuff = {};
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
    for (fc in fcs) {
      if (!patt.test(fcs[fc])) {
        $scope.spin.modSaveProfile = false;
        $scope.modSaveError = "One of the friend codes wasn't in the correct format.";
        return;
      }
    }

    for (game in games) {
      if (isNaN(games[game].tsv)) {
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
        $scope.refUser.references[type] = data;
      }
      $scope.spin.approveAll[type] = false;
      $scope.$apply();
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

  $scope.deleteRef = function (id, index, type) {
    var url = "/reference/delete";
    io.socket.post(url, {refId: id, type: type}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.references[type].splice(index, 1);
        $scope.$apply();
      } else {
        console.log(res.statusCode + ": " + data);
      }
    });
  };

}]);

fapp.controller("indexCtrl", ['$scope', function ($scope) {
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

  $scope.addReference = function () {
    $scope.addRefError = "";
    var url = "/reference/add",
      user2 = $scope.user2,
      regexp = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((pokemontrades)|(SVExchange)|(poketradereferences))\/comments\/([a-z\d]*)\/([^\/]+)\/([a-z\d]+)(\?[a-z\d]+)?/,
      regexpGive = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((SVExchange)|(poketradereferences)|(pokemongiveaway))\/comments\/([a-z\d]*)\/([^\/]+)\/?/;

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
    if (($scope.type === "giveaway" && !regexpGive.test($scope.refUrl)) ||
      ($scope.type !== "giveaway" && !regexp.test($scope.refUrl))) {
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

}]);

fapp.controller("userCtrl", ['$scope', function ($scope) {
  $scope.scope = $scope;
  $scope.user = undefined;
  $scope.flairs = {};
  $scope.selectedTradeFlair = undefined;
  $scope.selectedExchFlair = undefined;
  $scope.loaded = false;
  $scope.userok = {};
  $scope.errors = {};
  $scope.userspin = {};
  $scope.flairNames = [
    {name: "pokeball"},
    {name: "greatball"},
    {name: "ultraball"},
    {name: "masterball"},
    {name: "cherishball"},
    {name: "gsball"},
    {name: "default"},
    {name: "premierball"},
    {name: "safariball"},
    {name: "luxuryball"},
    {name: "dreamball"},
    {name: "ovalcharm"},
    {name: "shinycharm"},
    {name: "egg"},
    {name: "eevee"},
    {name: "togepi"},
    {name: "manaphy"},
  ];
  $scope.subNames = [
    {name: "pokemontrades", view: "Pokemon Trades"},
    {name: "svexchange", view: "SV Exchange"}
  ];

  $scope.isApproved = function (el) {
    return el.approved;
  }

  $scope.formattedName = function (name) {
    if (!name) {
      return "";
    }
    var formatted = "";
    if (name.indexOf("ball") > -1) {
      formatted += name.charAt(0).toUpperCase();
      formatted += name.slice(1, -4);
      formatted += " Ball";
    } else if (name.indexOf("charm") > -1) {
      formatted += name.charAt(0).toUpperCase();
      formatted += name.slice(1, -5);
      formatted += " Charm";
    } else {
      formatted += name.charAt(0).toUpperCase();
      formatted += name.slice(1);
      formatted += " Egg";
    }
    return formatted;
  };

  $scope.getName = function (id) {
    var name;
    $scope.flairs.forEach(function (flair) {
      if (flair.id === id) {
        name = $scope.formattedName(flair.name);
      }
    });
    return name;
  };

  $scope.canApplyForAFlair = function () {
    return (($scope.selectedTradeFlair &&
      $scope.user.flair.ptrades.flair_css_class !== $scope.selectedTradeFlair)
    || ($scope.selectedExchFlair &&
      $scope.user.flair.svex.flair_css_class !== $scope.selectedExchFlair));
  };

  $scope.applyFlair = function () {
    var done = 0;
    $scope.errors.flairApp = "";
    $scope.userok.applyFlair = false;
    $scope.userspin.applyFlair = true;
    if ($scope.selectedTradeFlair &&
      $scope.user.flair.ptrades.flair_css_class !== $scope.selectedTradeFlair) {
      io.socket.post("/flair/apply", {
        flair: $scope.selectedTradeFlair,
        sub: "pokemontrades"
      }, function (data, res) {
        if (res.statusCode === 200) {
          if (done) {
            $scope.selectedTradeFlair = undefined;
            $scope.userok.applyFlair = true;
            $scope.userspin.applyFlair = false;
            $scope.$apply();
          } else {
            done++;
          }
        } else if (res.statusCode === 400) {
          $scope.errors.flairApp = "You have already applied for that flair.";
          $scope.userspin.applyFlair = false;
          $scope.$apply();
        } else {
          $scope.errors.flairApp = "Something unexpected happened.";
          $scope.userspin.applyFlair = false;
          $scope.$apply();
          console.log(data);
        }
      });
    } else {
      done++;
    }
    if ($scope.selectedExchFlair &&
      $scope.user.flair.svex.flair_css_class !== $scope.selectedExchFlair) {
      io.socket.post("/flair/apply", {
        flair: $scope.selectedExchFlair,
        sub: "svexchange"
      }, function (data, res) {
        if (res.statusCode === 200) {
          if (done) {
            $scope.userok.applyFlair = true;
            $scope.userspin.applyFlair = false;
            $scope.selectedExchFlair = undefined;
            $scope.$apply();
          } else {
            done++;
          }
        } else {
          console.log(data);
        }
      });
    } else {
      done++;
    }

    if (done === 2) {
      $scope.userspin.applyFlair = false;
    }
  };

  $scope.setSelectedTradeFlair = function (id, bool) {
    if (bool) {
      $scope.selectedTradeFlair = id;
    }
  };

  $scope.setSelectedExchFlair = function (id, bool) {
    if (bool) {
      $scope.selectedExchFlair = id;
    }
  };

  $scope.inPokemonTradesCasual = function (flair) {
    return flair.sub === "pokemontrades"
      && !flair.events
      && !flair.shinyevents;
  };

  $scope.inPokemonTradesCollector = function (flair) {
    return flair.sub === "pokemontrades"
      && (flair.events > 0
      || flair.shinyevents > 0);
  };

  $scope.inSVExchange = function (flair) {
    return flair.sub === "svexchange";
  };

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

      $scope.getReferences();
      $scope.$apply();
    } else {
      $scope.loaded = true;
      $scope.$apply();
    }
  });

  $scope.getReferences = function () {
    if ($scope.user) {
      io.socket.get("/user/get/" + $scope.user.name, function (data, res) {
        if (res.statusCode === 200) {
          $scope.user = data;
          if ($scope.user.flair && $scope.user.flair.ptrades) {
            for (var flairId in $scope.flairs) {
              var flair = $scope.flairs[flairId];
              if (flair.name === $scope.user.flair.ptrades.flair_css_class) {
                $scope.selectedTradeFlair = flair.name;
              }
              if (flair.name === $scope.user.flair.svex.flair_css_class) {
                $scope.selectedExchFlair = flair.name;
              }
            }
          }
          if (!$scope.user.friendCodes || !$scope.user.friendCodes.length) {
            $scope.user.friendCodes = [""];
          }
          if (!$scope.user.games || !$scope.user.games.length) {
            $scope.user.games = [{tsv: "", ign: ""}];
          }
        }
        $scope.$apply();
        $scope.loaded = true;
        $scope.$apply();
      })
    } else {
      window.setTimeout($scope.getReferences, 1000);
    }
  };

  $scope.canUserApply = function (flair) {
    if (!$scope.user || !$scope.user.references) {
      return false;
    }
    var user = $scope.user,
        refs = $scope.user.references,
        trades = flair.trades || 0,
        shinyevents = flair.shinyevents || 0,
        events = flair.events || 0,
        eggs = flair.eggs || 0,
        userTrades = refs.events.length +
          refs.shinies.length +
          refs.casuals.length,
        usershinyevents = refs.events.length +
          refs.shinies.length;

    return (userTrades >= trades &&
      usershinyevents >= shinyevents &&
      refs.events.length >= events &&
      refs.eggs.length >= eggs);
  };

  $scope.addFc = function () {
    $scope.user.friendCodes.push("");
  };

  $scope.delFc = function (index) {
    $scope.user.friendCodes.splice(index, 1);
  };

  $scope.addGame = function () {
    $scope.user.games.push({tsv: "", ign: ""});
  };

  $scope.delGame = function (index) {
    $scope.user.games.splice(index, 1);
  };

  $scope.saveProfile = function () {
    $scope.userok.saveProfile = false;
    $scope.userspin.saveProfile = true;
    var intro = $scope.user.intro,
      fcs = $scope.user.friendCodes.slice(0),
      games = $scope.user.games,
      url = "/user/edit";
    var len = fcs.length
    while (len--) {
      if (fcs[len] === "") {
        fcs.splice(len, 1);
      }
    }

    var patt = /([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
    for (fc in fcs) {
      if (!patt.test(fcs[fc])) {
        $scope.userspin.saveProfile = false;
        $("#saveError").html("One of your friend codes wasn't in the correct format.").show();
        return;
      }
    }

    for (game in games) {
      if (isNaN(games[game].tsv)) {
        $scope.userspin.saveProfile = false;
        $("#saveError").html("One of the tsvs is not a number.").show();
        return;
      }
    }

    io.socket.post(url, {
      "userid": $scope.user.id,
      "intro": intro,
      "fcs": fcs,
      "games": games
    }, function (data, res) {
      if (res.statusCode === 200) {
        $scope.userok.saveProfile = true;
      } else if (res.statusCode === 400) {
        $("#saveError").html("Your friend code was not correct.").show();
      } else if (res.statusCode === 500) {
        $("#saveError").html("There was some issue saving.").show();
      }
      $scope.userspin.saveProfile = false;
      $scope.$apply();
    });

  };

  $scope.getFlairs = function () {
    var url = "/flair/all";

    io.socket.get(url, function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairs = data;
        if (data.length === 0) {
          $scope.flairs[0] = {
            name: "",
            trades: "",
            shinyevents: "",
            eggs: "",
            sub: ""
          };
        }
      }
    });
  };

  $scope.addFlair = function () {
    $scope.flairs.push({});
  };

  $scope.saveFlairs = function () {
    var url = "/flair/save";

    io.socket.post(url, {flairs: $scope.flairs}, function (data, res) {
      if (res.statusCode === 200) {
        console.log(data);
      } else {
        console.log(res);
      }
    });
  };

  $scope.getFlairs();
}]);

fapp.controller("adminCtrl", ['$scope', function ($scope) {
  $scope.users = [];
  $scope.flairApps = [];
  $scope.flairAppError = "";
  $scope.adminok = {
    appFlair: {}
  };
  $scope.adminspin = {
    appFlair: {}
  }

  $scope.getFlairApps = function () {
    io.socket.get("/flair/apps/all", function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairApps = data;
        $scope.$apply();
      }
    });
  };

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

  $scope.denyApp = function (id, $index) {
    var url = "/flair/app/deny";
    $scope.flairAppError = "";

    io.socket.post(url, {id: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairApps.splice($index, 1);
        $scope.$apply();
      } else {
        $scope.flairAppError = "Couldn't deny, for some reason.";
        $scope.$apply();
        console.log(data);
      }
    });
  };

  $scope.approveApp = function (id, $index) {
    $scope.adminok.appFlair[$index] = false;
    $scope.adminspin.appFlair[$index] = true;
    $scope.flairAppError = "";
    var url = "/flair/app/approve";

    io.socket.post(url, {id: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairApps.splice($index, 1);
        $scope.adminok.appFlair[$index] = true;
      } else {
        $scope.flairAppError = "Couldn't approve, for some reason.";
        console.log(data);
      }
      $scope.adminspin.appFlair[$index] = false;
      $scope.$apply();
    });
  };

  $scope.getBannedUsers();
  $scope.getFlairApps();
}]);

angular.module('ngReallyClickModule', ['ui.bootstrap'])
  .directive('ngReallyClick', ['$modal',
    function($modal) {

      var ModalInstanceCtrl = function($scope, $modalInstance) {
        $scope.ok = function() {
          $modalInstance.close();
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      };

      return {
        restrict: 'A',
        scope: {
          ngReallyClick:"&"
        },
        link: function(scope, element, attrs) {
          element.bind('click', function() {
            var user = attrs.ngReallyUser;
            var flair = attrs.ngReallyFlair;

            var modalHtml = '<div class="modal-body">Are you sure you want ' +
              'to give <strong>' + user +
              '</strong> the <strong>' + flair + '</strong> flair?</div>';
            modalHtml += '<div class="modal-footer">' +
            '<button class="btn btn-primary" ng-click="ok()">Yes</button>' +
            '<button class="btn btn-default" ng-click="cancel()">No</button>' +
            '</div>';

            var modalInstance = $modal.open({
              template: modalHtml,
              controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function() {
              scope.ngReallyClick();
            }, function() {
              //Modal dismissed
            });

          });

        }
      }
    }
  ]);