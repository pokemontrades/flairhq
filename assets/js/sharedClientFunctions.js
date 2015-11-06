var socket = require("socket.io-client");
var io = require("sails.io.js")(socket);

module.exports = {
  editRef: function ($scope) {
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
    } else if (!ref.got || !ref.gave) {
      $scope.editRefError = "Make sure you enter all the information";
      return;
    }
    if (!ref.url || ref.type !== "giveaway" && ref.type !== "misc" && ref.type !== "eggcheck" && !ref.user2) {
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
  },
  setLocalBan: function ($scope, username, ban) {
    var url = "/mod/setlocalban";
    io.socket.post(url, {username: username, ban: ban}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.banned = data.banned;
        $scope.$apply();
      } else {
        console.log("Error banning " + username + ": " + res.statusCode);
      }
    });
  },
  deleteRef: function ($scope, $filter, id) {
    var url = "/reference/delete";
    io.socket.post(url, {refId: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.refUser.references = $filter("filter")($scope.refUser.references, {id: "!" + id});
        $scope.$apply();
      } else {
        console.log(res.statusCode + ": " + data);
      }
    });
  }
};
