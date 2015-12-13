var $ = require('jquery');
var shared = require('./sharedClientFunctions.js');

module.exports = function ($scope, io) {
  shared.addRepeats($scope, io);
  $scope.addInfo = {
    refUrl: $scope.query.refUrl || '',
    type: $scope.query.type || '',
    user2: $scope.query.user2 || '',
    gave: $scope.query.gave || '',
    got: $scope.query.got || '',
    number: $scope.query.number || '',
    descrip: $scope.query.descrip || '',
    notes: $scope.query.notes || '',
    privatenotes: $scope.query.privatenotes || ''
  };

  $scope.selectedRef = {};
  $scope.referenceToRevert = {};
  $scope.addRefError = "";
  $scope.editRefError = "";
  $scope.indexOk = {};
  $scope.indexSpin = {};

  $scope.focus = {
    gavegot: false
  };

  $scope.isFocused = function () {
    return $scope.focus.gavegot || $scope.got || $scope.gave;
  };


  $scope.editReference = function (ref) {
    $scope.selectedRef = ref;
    $scope.referenceToRevert = $.extend(true, {}, ref);
  };

  $scope.addReference = function () {
    $scope.addRefError = "";
    $scope.indexOk.addRef = false;
    $scope.indexSpin.addRef = true;
    var url = "/reference/add";
    $scope.addRefError = $scope.validateRef($scope.addInfo);
    if ($scope.addRefError) {
      $scope.indexSpin.addRef = false;
      return;
    }
    var post = {
      "url": $scope.addInfo.refUrl,
      "user2": $scope.addInfo.user2,
      "type": $scope.addInfo.type,
      "notes": $scope.addInfo.notes,
      "privatenotes": $scope.addInfo.privatenotes,
      "number": $scope.addInfo.number
    };
    if ($scope.isNotNormalTrade($scope.addInfo.type)) {
      post.descrip = $scope.addInfo.descrip;
    } else {
      post.got = $scope.addInfo.got;
      post.gave = $scope.addInfo.gave;
    }
    io.socket.post(url, post, function (data, res) {
      $scope.indexSpin.addRef = false;
      if (res.statusCode === 200) {
        $scope.addInfo.refUrl = "";
        $scope.addInfo.descrip = "";
        $scope.addInfo.got = "";
        $scope.addInfo.gave = "";
        $scope.addInfo.user2 = "";
        $scope.addInfo.notes = "";
        $scope.addInfo.privatenotes = "";
        $scope.addInfo.number = "";
        $scope.refUser.references.push(data);

        if (data.type === "redemption") {
          $('#collapseevents').prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapseevents').prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
        } else if (data.type === "shiny") {
          $('#collapseshinies').prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapseshinies').prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
        } else {
          $('#collapse' + $scope.addInfo.type + "s").prev().children().animate({
            backgroundColor: "yellow"
          }, 200, function () {
            $('#collapse' + $scope.addInfo.type + "s").prev().children().animate({
              backgroundColor: "white"
            }, 200);
          });
        }
        $scope.indexOk.addRef = true;
        window.setTimeout(function () {
          $scope.indexOk.addRef = false;
          $scope.$apply();
        }, 1500);
        $scope.$apply();
      } else {
        $scope.indexOk.addRef = false;
        if (data && data.err) {
          $scope.addRefError = data.err;
        } else {
          $scope.addRefError = "There was an error.";
        }
        $scope.$apply();
      }
    });
  };
};
