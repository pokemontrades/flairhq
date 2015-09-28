/* global io, define */
define([

], function () {

    var adminCtrl = function ($scope) {

        $scope.banInfo = {
            username: "",
            banNote: "",
            banMessage: "",
            banlistEntry: "",
            duration: ""
        };
        $scope.users = [];
        $scope.flairApps = [];
        $scope.flairAppError = "";
        $scope.adminok = {
            appFlair: {}
        };
        $scope.adminspin = {
            appFlair: {}
        };

        $scope.permaBanError = "";
        $scope.indexOk = {};
        $scope.indexSpin = {};

        $scope.focus = {
            gavegot: false
        };

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

        $scope.permaBanUser = function (user) {
            $scope.permaBanError = "";
            $scope.indexOk.permaBan = false;
            $scope.indexSpin.permaBan = true;
            var url = "/user/permaBan";
            if (!$scope.banInfo.username) {
                $scope.permaBanError = "Please enter a username.";
                return $scope.indexSpin.permaBan = false;
            }

            if ($scope.banInfo.banNote.length > 300) {
                $scope.permaBanError = "The ban note cannot be longer than 300 characters.";
                return $scope.indexSpin.permaBan = false;
            }

            if (!$scope.banInfo.banlistEntry) {
                $scope.permaBanError = "Please enter a ban reason for the public banlist.";
                return $scope.indexSpin.permaBan = false;
            }

            if ($scope.banInfo.username.substring(0,3) === '/u/') {
                $scope.banInfo.username = $scope.banInfo.username.substring(3);
            }

            if ($scope.banInfo.duration) {
                try {
                    if (parseInt($scope.banInfo) < 0) {
                        $scope.permaBanError = "Invalid duration";
                        return scope.indexSpin.permaBan = false;
                    }
                } catch (err) {
                    $scope.permaBanError = "Invalid duration";
                    return scope.indexSpin.permaBan = false;
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
                $scope.indexSpin.permaBan = false;
                if (res.statusCode === 200) {
                    console.log(res.statusCode);
                    $scope.banInfo.username = "";
                    $scope.banInfo.banNote = "";
                    $scope.banInfo.banMessage = "";
                    $scope.banInfo.banlistEntry = "";
                    $scope.banInfo.duration = ""
                    $scope.indexOk.permaBan = true;
                    window.setTimeout(function () {
                      $scope.indexOk.addRef = false;
                      $scope.$apply();
                    }, 1500);
                    $scope.$apply();
                    $scope.getBannedUsers();
                    $scope.$apply();
                } else {
                    $scope.indexOk = false;
                    $scope.permaBanError = "Sorry, something went wrong. You might have to do some stuff manually.";
                    $scope.$apply();
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
            $scope.adminok.appFlair[id] = false;
            $scope.adminspin.appFlair[id] = true;
            $scope.flairAppError = "";
            var url = "/flair/app/approve";

            io.socket.post(url, {id: id}, function (data, res) {
                if (res.statusCode === 200) {
                    $scope.adminok.appFlair[id] = true;
                    $scope.flairApps.splice($index, 1);
                } else {
                    $scope.flairAppError = "Couldn't approve, for some reason.";
                    console.log(data);
                }
                $scope.adminspin.appFlair[id] = false;
                $scope.$apply();
            });
        };

        $scope.getBannedUsers();
        $scope.getFlairApps();
    };

    return adminCtrl;
});