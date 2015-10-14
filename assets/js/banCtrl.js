/* global io, define */
define([
    'sails',
    'socket'
], function (sails, socket) {

    var io = sails(socket);

    var banCtrl = function ($scope) {

        $scope.banInfo = {
            username: "",
            banNote: "",
            banMessage: "",
            banlistEntry: "",
            duration: "",
            additionalFCs: ""
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

            if ($scope.banInfo.username.substring(0,3) === '/u/') {
                $scope.banInfo.username = $scope.banInfo.username.substring(3);
            }

            else if ($scope.banInfo.username.substring(0,2) === 'u/') {
                $scope.banInfo.username = $scope.banInfo.username.substring(2);
            }

            if (!$scope.banInfo.username.match(/^[A-Za-z0-9_-]{1,20}$/)) {
                $scope.banError = "Invalid username";
                $scope.indexSpin.ban = false;
                return;
            }

            if ($scope.banInfo.banNote.length > 300) {
                $scope.banError = "The ban note cannot be longer than 300 characters.";
                $scope.indexSpin.ban = false;
                return;
            }

            if ($scope.banInfo.duration) {
                if (isNaN($scope.banInfo.duration) || parseInt($scope.banInfo.duration) < 0) {
                    $scope.banError = "Invalid duration";
                    $scope.indexSpin.ban = false;
                    return;
                }
                if (parseInt($scope.banInfo.duration) > 999) {
                    $scope.banError = "The duration cannot be longer than 999 days. For a permanent ban, leave the duration field blank.";
                    $scope.indexSpin.ban = false;
                    return;
                }
            }
            var FCs = [];
            if ($scope.banInfo.additionalFCs) {
                $scope.banInfo.additionalFCs.match(/(^|[^-])(\d{4}-){2}\d{4}($|[^-])/g);
                if (!$scope.banInfo.additionalFCs.match(/(^|[^-])(\d{4}-){2}\d{4}($|[^-])/g)) {
                    $scope.banError = "Invalid friend code(s)";
                    $scope.indexSpin.ban = false;
                    return;
                }
                FCs = $scope.banInfo.additionalFCs.match(/(\d{4}-){2}\d{4}/g);
            }
            var post = {
                "username": $scope.banInfo.username,
                "banNote": $scope.banInfo.banNote,
                "banMessage": $scope.banInfo.banMessage,
                "banlistEntry": $scope.banInfo.banlistEntry,
                "duration": parseInt($scope.banInfo.duration),
                "additionalFCs": FCs
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
                    $scope.banInfo.additionalFCs = "";
                    $scope.indexOk.ban = true;
                    window.setTimeout(function () {
                      $scope.indexOk.addRef = false;
                      $scope.$apply();
                    }, 1500);
                    $scope.$apply();
                } else {
                    $scope.indexOk = false;
                    if (res.body.error) {
                        $scope.banError = "Something went wrong; you might have to do stuff manually. Error " + res.statusCode + ": " + res.body.error;
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
