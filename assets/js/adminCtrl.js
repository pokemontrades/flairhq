/* global io, define */
define([
    'sails',
    'socket'
], function (sails, socket) {

    var io = sails(socket);

    var adminCtrl = function ($scope) {
        $scope.users = [];
        $scope.flairApps = [];
        $scope.flairAppError = "";
        $scope.adminok = {
            appFlair: {}
        };
        $scope.adminspin = {
            appFlair: {}
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

        $scope.setLocalBan = function (user, ban) {
            var url = "/user/setLocalBan";

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

        $scope.formattedRequirements = function (flair) {
            var reqs;
            for (var i = 0; i < $scope.flairs.length; i++) {
                if ($scope.flairs[i].name === flair) {
                    reqs = $scope.flairs[i];
                }
            }
            if (!reqs) {
                return 'Unknown requirements';
            }
            var formatted = '';
            if (reqs.trades) {
                formatted += reqs.trades + (reqs.trades > 1 ? ' trades, ' : ' trade, ');
            }
            if (reqs.involvement) {
                formatted += reqs.involvement + (reqs.involvement > 1 ? ' free tradebacks/redemptions, ' : 'free tradeback/redemption, ');
            }
            if (reqs.giveaways) {
                formatted += reqs.giveaways + (reqs.giveaways > 1 ? ' giveaways, ' : 'giveaway, ');
            }
            if (reqs.eggs) {
                formatted += reqs.eggs + (reqs.eggs > 1 ? ' hatches, ' : ' hatch, ');
            }
            formatted = formatted.slice(0,-2);
            return formatted;
        };

        $scope.getBannedUsers();
        $scope.getFlairApps();
        $scope.getFlairs();
    };

    return adminCtrl;
});