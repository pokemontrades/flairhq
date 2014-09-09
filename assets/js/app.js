var fapp = angular.module("fapp", []);

fapp.controller("referenceCtrl", function ($scope) {
  $scope.newComment = "";
  $scope.refUser = {
    name: window.location.pathname.substring(3)
  };
  $scope.numberOfTrades = function () {
    if(!$scope.refUser.references){
      return 0;
    }
    var refs = $scope.refUser.references;
    return refs.events.length + refs.shinies.length + refs.casuals.length;
  };

  io.socket.get("/user/get/" + $scope.refUser.name, function (data, res) {
    if(res.statusCode === 200){
      $scope.refUser = data;
      $scope.$apply();
    }
  });

  $scope.addComment = function () {
    var comment = $scope.newComment,
        url = "/reference/comment/add";

    io.socket.post(url, {"refUser": $scope.refUser.id,
                         "comment": comment}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.comments.push(data);
        $scope.$apply();
      }
      else {
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

  $scope.addRefError = "";

  $scope.numberOfTrades = function () {
    if(!$scope.user || !$scope.user.references){
      return 0;
    }
    var refs = $scope.user.references;
    return refs.events.length + refs.shinies.length + refs.casuals.length;
  };

  $scope.getReferences = function () {
    if ($scope.user) {
      io.socket.get("/user/get/" + $scope.user.name, function (data, res) {
        if(res.statusCode === 200){
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
    var url = "/reference/add"
        regexp = /(http(s?):\/\/)?(www|[a-z]*.)?reddit.com\/r\/((pokemontrades)|(SVExchange))\/comments\/([a-z\d]*)\/([a-z\d_-]*)\/([a-z\d]*)/;

    if (!$scope.type) {
      $scope.addRefError = "Please choose a type.";
      return;
    }
    if (!$scope.refUrl || !$scope.user2 || !$scope.gave || !$scope.got) {
      $scope.addRefError = "Make sure you enter all the information";
      return;
    }
    if (!regexp.test($scope.refUrl)) {
      $scope.addRefError = "Looks like you didn't input a proper permalink";
      return;
    }
   
    io.socket.post(url, {"userid": $scope.user.id,
                         "url": $scope.refUrl,
                         "user2": $scope.user2,
                         "gave": $scope.gave,
                         "got": $scope.got,
                         "type": $scope.type}, function (data, res) {
      console.log(res);
      if (res.statusCode === 200) {
        if(data.type === "event" || data.type === "redemption") {
          $scope.user.references.events.push(res);
          $scope.$apply();
        }
      } else {
        $scope.addRefError = "Already added that URL.";
      }
    });

  };

  $scope.deleteRef = function (id, index, type) {
    var url = "/reference/delete";
    io.socket.post(url, {"refId": id}, function (data, res) {
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

  io.socket.get("/user/mine", function (data, res) {
    if(res.statusCode === 200){
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

    io.socket.post(url, {"userid": $scope.user.id,
                         "intro": intro,
                         "fcs": fcs,
                         "games": games}, function (data, res) {
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
