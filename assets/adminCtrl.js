var shared = require('./sharedClientFunctions.js');
module.exports = function ($scope, io) {
  shared.addRepeats($scope, io);
  $scope.users = [];
  $scope.flairAppError = "";
  $scope.adminok = {
    appFlair: {}
  };
  $scope.adminspin = {
    appFlair: {}
  };

  $scope.denyApp = function (id) {
    var url = "/flair/app/deny";
    $scope.flairAppError = "";

    io.socket.post(url, {id: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.flairApps = data;
      } else if (res.statusCode === 404) {
        $scope.flairApps = data;
        $scope.flairAppError = "That app no longer exists.";
      } else {
        $scope.flairAppError = "Couldn't deny, for some reason.";
        console.log(data);
      }
      $scope.$apply();
    });
  };

  $scope.approveApp = function (id) {
    $scope.adminok.appFlair[id] = false;
    $scope.adminspin.appFlair[id] = true;
    $scope.flairAppError = "";
    var url = "/flair/app/approve";

    io.socket.post(url, {id: id}, function (data, res) {
      if (res.statusCode === 200) {
        $scope.adminok.appFlair[id] = true;
        $scope.flairApps = data;
      } else if (res.statusCode === 404) {
        $scope.flairApps = data;
        $scope.flairAppError = "That app no longer exists.";
      } else {
        $scope.flairAppError = "Couldn't approve, for some reason.";
        console.log(data);
      }
      $scope.adminspin.appFlair[id] = false;
      $scope.$apply();
    });
  };
};
