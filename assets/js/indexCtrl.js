/* global io, define */
define([
  'sails',
  'socket'
], function (sails, socket) {

  var io = sails(socket);

    var indexCtrl = function ($scope, $filter) {
      $scope.addInfo = {
        refUrl: "",
        type: "",
        user2: "",
        gave: "",
        got: "",
        number: "",
        descrip: "",
        notes: "",
        privatenotes: ""
      };

      $scope.isNotNormalTrade = function (type) {
        return type === 'egg' || type === 'giveaway' || type === 'misc' || type === 'eggcheck' || type === 'involvement';
      };

      $scope.hasNumber = function (type) {
        return type === 'giveaway' || type === 'eggcheck';
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

        $scope.revertRef = function () {
            var index = $scope.user.references.indexOf($scope.selectedRef);
            $scope.user.references[index] = $.extend(true, {}, $scope.referenceToRevert);
        };

        $scope.editRef = function () {
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
            if (ref.type === "egg" || ref.type === "giveaway" || ref.type === "misc" || ref.type === "eggcheck") {
                if (!ref.description) {
                    $scope.editRefError = "Make sure you enter all the information";
                    return;
                }
            } else {
                if (!ref.got || !ref.gave) {
                    $scope.editRefError = "Make sure you enter all the information";
                    return;
                }
            }
            if (!ref.url ||
                ((ref.type !== "giveaway" && ref.type !== "misc" || ref.type !== "eggcheck") && !ref.user2)) {
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

        };

        $scope.isEvent = function (el) {
            return el.type === "event" || el.type === "redemption";
        };

        $scope.isShiny = function (el) {
            return el.type === "shiny";
        };

        $scope.isCasual = function (el) {
            return el.type === "casual";
        };

        $scope.isEggCheck = function (el) {
            return el.type === "eggcheck";
        };

        $scope.numberOfTrades = function () {
            if (!$scope.user || !$scope.user.references) {
                return 0;
            }
            var refs = $scope.user.references;
            var event = $filter("filter")(refs, $scope.isEvent).length;
            var shiny = $filter("filter")(refs, $scope.isShiny).length;
            var casual = $filter("filter")(refs, $scope.isCasual).length;
            return event + shiny + casual;
        };

        $scope.addReference = function () {
            $scope.addRefError = "";
            $scope.indexOk.addRef = false;
            $scope.indexSpin.addRef = true;
            var url = "/reference/add",
                user2 = $scope.addInfo.user2,
                regexp = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((pokemontrades)|(SVExchange)|(poketradereferences))\/comments\/([a-z\d]*)\/([^\/]+)\/([a-z\d]+)(\?[a-z\d]+)?/,
                regexpGive = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((SVExchange)|(pokemontrades)|(poketradereferences)|(Pokemongiveaway)|(SVgiveaway))\/comments\/([a-z\d]*)\/([^\/]+)\/?/,
                regexpMisc = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com.*/,
                regexpUser = /^(\/u\/)?[A-Za-z0-9_\-]*$/;

            if (!$scope.addInfo.type) {
                $scope.addRefError = "Please choose a type.";
              $scope.indexSpin.addRef = false;
              return;
            }
            if ($scope.isNotNormalTrade($scope.addInfo.type)) {
                if (!$scope.addInfo.descrip) {
                    $scope.addRefError = "Make sure you enter all the information";
                    $scope.indexSpin.addRef = false;
                    return;
                }
            } else {
                if (!$scope.addInfo.got || !$scope.addInfo.gave) {
                    $scope.addRefError = "Make sure you enter all the information";
                    $scope.indexSpin.addRef = false;
                    return;
                }
            }
            if (!$scope.addInfo.refUrl ||
                (($scope.addInfo.type !== "giveaway" && $scope.addInfo.type !== "misc" && $scope.addInfo.type !== "eggcheck") && !$scope.addInfo.user2)) {
                $scope.addRefError = "Make sure you enter all the information";
                $scope.indexSpin.addRef = false;
                return;
            }
            if ((($scope.addInfo.type === "giveaway" || $scope.addInfo.type === "eggcheck") && !regexpGive.test($scope.addInfo.refUrl)) ||
                ($scope.addInfo.type !== "giveaway" && $scope.addInfo.type !== "misc" && $scope.addInfo.type !== "eggcheck" && !regexp.test($scope.addInfo.refUrl)) ||
                ($scope.addInfo.type === "misc" && !regexpMisc.test($scope.addInfo.refUrl))) {
                $scope.addRefError = "Looks like you didn't input a proper permalink";
                $scope.indexSpin.addRef = false;
                return;
            }

            if (user2.indexOf("/u/") === -1) {
                user2 = "/u/" + user2;
            }

            if (user2 === ("/u/" + $scope.user.name)) {
                $scope.addRefError = "Don't put your own username there.";
                $scope.indexSpin.addRef = false;
                return;
            }

            if (($scope.addInfo.type !== "giveaway" && $scope.addInfo.type !== "misc") && !regexpUser.test(user2)) {
                $scope.addRefError = "Please put a username on it's own, or in format: /u/username. Not the full url, or anything else.";
                $scope.indexSpin.addRef = false;
                return;
            }

            var post = {
                "userid": $scope.user.id,
                "url": $scope.addInfo.refUrl,
                "user2": user2,
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
                    $scope.user.references.push(data);

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
                    $scope.addRefError = "Already added that URL.";
                    $scope.$apply();
                }
            });

        };

        $scope.deleteRef = function (id, ref, type) {
            var url = "/reference/delete";
            io.socket.post(url, {refId: id, type: type}, function (data, res) {
                if (res.statusCode === 200) {
                    var index = $scope.user.references.indexOf(ref);
                    $scope.user.references.splice(index, 1);
                    $scope.$apply();
                } else {
                    console.log(res.statusCode + ": " + data);
                }
            });
        };

    };

    return indexCtrl;
});