/* global io, define */
define([

], function () {

    var banCtrl = function ($scope) {

        $scope.banInfo = {
            username: "",
            banNote: "",
            banMessage: "",
            banlistEntry: "",
            duration: ""
        };

        $scope.banError = "";
        $scope.indexOk = {};
        $scope.indexSpin = {};

        $scope.focus = {
            gavegot: false
        };

        $scope.banUser = function (user) {
            $scope.banError = "";
            $scope.indexOk.ban = false;
            $scope.indexSpin.ban = true;
            var url = "/user/ban";
            if (!$scope.banInfo.username) {
                $scope.banError = "Please enter a username.";
                $scope.indexSpin.ban = false;
                return;
            }

            if ($scope.banInfo.banNote.length > 300) {
                $scope.banError = "The ban note cannot be longer than 300 characters.";
                $scope.indexSpin.ban = false;
                return;
            }

            if ($scope.banInfo.username.substring(0,3) === '/u/') {
                $scope.banInfo.username = $scope.banInfo.username.substring(3);
            }

            if ($scope.banInfo.duration) {
                try {
                    if (parseInt($scope.banInfo) < 0) {
                        $scope.banError = "Invalid duration";
                        $scope.indexSpin.ban = false;
                        return;
                    }
                } catch (err) {
                    $scope.banError = "Invalid duration";
                    $scope.indexSpin.ban = false;
                    return;
                }
            }

            var post = {
                "username": $scope.banInfo.username,
                "banNote": $scope.banInfo.banNote,
                "banMessage": $scope.banInfo.banMessage,
                "banlistEntry": $scope.banInfo.banlistEntry,
                "duration": $scope.banInfo.duration
            };

            io.socket.post(url, post, function (data, res) {
                $scope.indexSpin.ban = false;
                if (res.statusCode === 200) {
                    console.log(res.statusCode);
                    $scope.banInfo.username = "";
                    $scope.banInfo.banNote = "";
                    $scope.banInfo.banMessage = "";
                    $scope.banInfo.banlistEntry = "";
                    $scope.banInfo.duration = "";
                    $scope.indexOk.ban = true;
                    window.setTimeout(function () {
                      $scope.indexOk.addRef = false;
                      $scope.$apply();
                    }, 1500);
                    $scope.$apply();
                    $scope.getBannedUsers();
                    $scope.$apply();
                } else {
                    $scope.indexOk = false;
                    if (res.body.error) {
                        $scope.banError = "Something went wrong; you might have to do stuff manually. ERROR: " + res.body.error;
                    } else {
                        $scope.banError = "Something went wrong; you might have to do stuff manually.";
                    }
                    $scope.$apply();
                }
            });
        };
    };
    return banCtrl;
});