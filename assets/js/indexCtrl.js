/* global io, angular */
define([

], function () {

    var indexCtrl = function ($scope, $filter) {
        $scope.refUrl = "";
        $scope.user2 = "";
        $scope.gave = "";
        $scope.got = "";
        $scope.number = "";
        $scope.type = "";
        $scope.descrip = "";
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
            var url = "/reference/add",
                user2 = $scope.user2,
                regexp = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((pokemontrades)|(SVExchange)|(poketradereferences))\/comments\/([a-z\d]*)\/([^\/]+)\/([a-z\d]+)(\?[a-z\d]+)?/,
                regexpGive = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((SVExchange)|(pokemontrades)|(poketradereferences)|(Pokemongiveaway)|(SVgiveaway))\/comments\/([a-z\d]*)\/([^\/]+)\/?/,
                regexpMisc = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com.*/,
                regexpUser = /^(\/u\/)?[A-Za-z0-9_\-]*$/;

            if (!$scope.type) {
                $scope.addRefError = "Please choose a type.";
                return;
            }
            if ($scope.type === "egg" || $scope.type === "giveaway" || $scope.type === "misc" || $scope.type === "eggcheck") {
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
            if (!$scope.refUrl ||
                (($scope.type !== "giveaway" && $scope.type !== "misc" && $scope.type !== "eggcheck") && !$scope.user2)) {
                $scope.addRefError = "Make sure you enter all the information";
                return;
            }
            if ((($scope.type === "giveaway" || $scope.type === "eggcheck") && !regexpGive.test($scope.refUrl)) ||
                ($scope.type !== "giveaway" && $scope.type !== "misc" && $scope.type !== "eggcheck" && !regexp.test($scope.refUrl)) ||
                ($scope.type === "misc" && !regexpMisc.test($scope.refUrl))) {
                $scope.addRefError = "Looks like you didn't input a proper permalink";
                return;
            }

            if (user2.indexOf("/u/") === -1) {
                user2 = "/u/" + user2;
            }

            if (user2 === ("/u/" + $scope.user.name)) {
                $scope.addRefError = "Don't put your own username there.";
                return;
            }

            if (($scope.type !== "giveaway" && $scope.type !== "misc") && !regexpUser.test(user2)) {
                $scope.addRefError = "Please put a username on it's own, or in format: /u/username. Not the full url, or anything else.";
                return;
            }

            var post = {
                "userid": $scope.user.id,
                "url": $scope.refUrl,
                "user2": user2,
                "type": $scope.type,
                "notes": $scope.notes,
                "number": $scope.number
            };

            if ($scope.type === "egg" || $scope.type === "giveaway" || $scope.type === "misc" || $scope.type === "eggcheck") {
                post.descrip = $scope.descrip;
            } else {
                post.got = $scope.got;
                post.gave = $scope.gave;
            }

            io.socket.post(url, post, function (data, res) {
                console.log(res);
                if (res.statusCode === 200) {
                    $scope.refUrl = "";
                    $scope.descrip = "";
                    $scope.got = "";
                    $scope.gave = "";
                    $scope.user2 = "";
                    $scope.notes = "";
                    $scope.number = "";
                    $scope.user.references.push(data);

                    if (data.type === "redemption") {
                        $('#collapseevents').prev().children().animate({
                            backgroundColor: "yellow"
                        }, 200, function () {
                            $('#collapseevents').prev().children().animate({
                                backgroundColor: "white"
                            }, 200);
                        });
                        $scope.$apply();
                    } else if (data.type === "shiny") {
                        $('#collapseshinies').prev().children().animate({
                            backgroundColor: "yellow"
                        }, 200, function () {
                            $('#collapseshinies').prev().children().animate({
                                backgroundColor: "white"
                            }, 200);
                        });
                        $scope.$apply();
                    } else {
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