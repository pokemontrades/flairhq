/* global io, define */
define([

], function () {

    var userCtrl = function ($scope, $filter) {
        $scope.scope = $scope;
        $scope.user = undefined;
        $scope.flairs = {};
        $scope.selectedTradeFlair = undefined;
        $scope.selectedExchFlair = undefined;
        $scope.loaded = false;
        $scope.userok = {};
        $scope.errors = {};
        $scope.userspin = {};
        $scope.flairNames = [
            {name: "pokeball"},
            {name: "greatball"},
            {name: "ultraball"},
            {name: "masterball"},
            {name: "cherishball"},
            {name: "gsball"},
            {name: "default"},
            {name: "premierball"},
            {name: "safariball"},
            {name: "luxuryball"},
            {name: "dreamball"},
            {name: "ovalcharm"},
            {name: "shinycharm"},
            {name: "lucky"},
            {name: "egg"},
            {name: "eevee"},
            {name: "togepi"},
            {name: "manaphy"},
            {name: "ditto"},
            {name: "eggcup"},
            {name: "cuteribbon"},
            {name: "coolribbon"},
            {name: "beautyribbon"},
            {name: "smartribbon"},
            {name: "toughribbon"},
        ];
        $scope.subNames = [
            {name: "pokemontrades", view: "Pokemon Trades"},
            {name: "svexchange", view: "SV Exchange"}
        ];

        $scope.isApproved = function (el) {
            return el.approved;
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

        $scope.isEgg = function (el) {
            return el.type === "egg";
        };

        $scope.isBank = function (el) {
            return el.type === "bank";
        };

        $scope.isGiveaway = function (el) {
            return el.type === "giveaway";
        };

        $scope.isEggCheck = function (el) {
            return el.type === "eggcheck";
        };

        $scope.isMisc = function (el) {
            return el.type === "misc";
        };

        $scope.formattedName = function (name) {
            if (!name) {
                return "";
            }
            var formatted = "",
                numberToSliceTill,
                suffix;

            if (name.indexOf("ball") > -1) {
                suffix = "Ball";
                numberToSliceTill = -4;
            } else if (name.indexOf("charm") > -1) {
                suffix = "Charm";
                numberToSliceTill = -5;
            } else if (name.indexOf("ribbon") > -1) {
                suffix = "Ribbon";
                numberToSliceTill = -6;
            } else if (name !== "egg") {
                suffix = "Egg";
            }

            formatted += name.charAt(0).toUpperCase();
            formatted += name.slice(1, numberToSliceTill);
            if (suffix) {
                suffix = " " + suffix;
                formatted += suffix;
            }

            return formatted;
        };

        $scope.getName = function (id) {
            var name = "";
            $scope.flairs.forEach(function (flair) {
                if (flair.id === id) {
                    name = $scope.formattedName(flair.name);
                }
            });
            return name;
        };

        $scope.canApplyForAnyFlair = function () {
            return (($scope.selectedTradeFlair &&
            $scope.user.flair.ptrades.flair_css_class !== $scope.selectedTradeFlair) ||
            ($scope.selectedExchFlair &&
            $scope.user.flair.svex.flair_css_class !== $scope.selectedExchFlair));
        };

        $scope.applyFlair = function () {
            var done = 0;
            $scope.errors.flairApp = "";
            $scope.userok.applyFlair = false;
            $scope.userspin.applyFlair = true;
            if ($scope.selectedTradeFlair &&
                $scope.user.flair.ptrades.flair_css_class !== $scope.selectedTradeFlair) {
                io.socket.post("/flair/apply", {
                    flair: $scope.selectedTradeFlair,
                    sub: "pokemontrades"
                }, function (data, res) {
                    if (res.statusCode === 200) {
                        if (done) {
                            $scope.selectedTradeFlair = undefined;
                            $scope.userok.applyFlair = true;
                            $scope.userspin.applyFlair = false;
                            $scope.$apply();
                        } else {
                            done++;
                        }
                    } else if (res.statusCode === 400) {
                        $scope.errors.flairApp = "You have already applied for that flair.";
                        $scope.userspin.applyFlair = false;
                        $scope.$apply();
                    } else {
                        $scope.errors.flairApp = "Something unexpected happened.";
                        $scope.userspin.applyFlair = false;
                        $scope.$apply();
                        console.log(data);
                    }
                });
            } else {
                done++;
            }
            if ($scope.selectedExchFlair &&
                $scope.user.flair.svex.flair_css_class !== $scope.selectedExchFlair) {
                io.socket.post("/flair/apply", {
                    flair: $scope.selectedExchFlair,
                    sub: "svexchange"
                }, function (data, res) {
                    if (res.statusCode === 200) {
                        if (done) {
                            $scope.userok.applyFlair = true;
                            $scope.userspin.applyFlair = false;
                            $scope.selectedExchFlair = undefined;
                            $scope.$apply();
                        } else {
                            done++;
                        }
                    } else {
                        console.log(data);
                    }
                });
            } else {
                done++;
            }

            if (done === 2) {
                $scope.userspin.applyFlair = false;
            }
        };

        $scope.setSelectedTradeFlair = function (id, bool) {
            if (bool) {
                $scope.selectedTradeFlair = id;
            }
        };

        $scope.setSelectedExchFlair = function (id, bool) {
            if (bool) {
                $scope.selectedExchFlair = id;
            }
        };

        $scope.inPokemonTradesCasual = function (flair) {
            if (flair) {
                return flair.sub === "pokemontrades" && !flair.events && !flair.shinyevents;
            }
        };

        $scope.inPokemonTradesCollector = function (flair) {
            if (flair) {
                return flair.sub === "pokemontrades" && (flair.events > 0 || flair.shinyevents > 0);
            }
        };

        $scope.inSVExchangeHatcher = function (flair) {
            if (flair) {
                return flair.sub === "svexchange" && flair.eggs > 0;
            }
        };

        $scope.inSVExchangeGiver = function (flair) {
            if (flair) {
                return flair.sub === "svexchange" && flair.giveaways > 0;
            }
        };

        $scope.getRedditUser = function (username) {
            if (username && username.indexOf("/u/") === -1) {
                return "/u/" + username;
            } else {
                return username;
            }
        };

        io.socket.get("/user/mine", function (data, res) {
            if (res.statusCode === 200) {
                $scope.user = data;
                if (!$scope.user.friendCodes) {
                    $scope.user.friendCodes = [""];
                }
                if (!$scope.user.games.length) {
                    $scope.user.games = [{tsv: "", ign: ""}];
                }

                $scope.getReferences();
                $scope.$apply();
            } else {
                $scope.loaded = true;
                $scope.$apply();
                if (window.location.hash === "#/comments") {
                    $('#tabList li:eq(1) a').tab('show');
                } else if (window.location.hash === "#/info") {
                    $('#tabList li:eq(2) a').tab('show');
                } else if (window.location.hash === "#/modEdit") {
                    $('#tabList li:eq(3) a').tab('show');
                } else if (window.location.hash === "#/privacypolicy") {
                    $('#privacypolicy').modal('show');
                }
            }
        });

        $scope.getReferences = function () {
            if ($scope.user) {
                io.socket.get("/user/get/" + $scope.user.name, function (data, res) {
                    if (res.statusCode === 200) {
                        $scope.user = data;
                        if ($scope.user.flair && $scope.user.flair.ptrades) {
                            for (var i = 0; i < $scope.flairs.length; i++) {
                                var flair = $scope.flairs[i];
                                if (flair.name === $scope.user.flair.ptrades.flair_css_class) {
                                    $scope.selectedTradeFlair = flair.name;
                                }
                                if (flair.name === $scope.user.flair.svex.flair_css_class) {
                                    $scope.selectedExchFlair = flair.name;
                                }
                            }
                        }
                        if (!$scope.user.friendCodes || !$scope.user.friendCodes.length) {
                            $scope.user.friendCodes = [""];
                        }
                        if (!$scope.user.games || !$scope.user.games.length) {
                            $scope.user.games = [{tsv: "", ign: ""}];
                        }
                    }
                    $scope.$apply();
                    $scope.loaded = true;
                    $scope.$apply();
                    if (window.location.hash === "#/comments") {
                        $('#tabList li:eq(1) a').tab('show');
                    } else if (window.location.hash === "#/info") {
                        $('#tabList li:eq(2) a').tab('show');
                    } else if (window.location.hash === "#/modEdit") {
                        $('#tabList li:eq(3) a').tab('show');
                    } else if (window.location.hash === "#/privacypolicy") {
                        $('#privacypolicy').modal('show');
                    }
                });
            } else {
                window.setTimeout($scope.getReferences, 1000);
            }
        };

        $scope.getUserFlair = function () {
            for (var i = 0; i < $scope.flairs.length; i++) {
                if (($scope.flairs[i].name === $scope.user.flair.ptrades.flair_css_class &&
                    $scope.flairs[i].sub === "pokemontrades") ||
                    ($scope.flairs[i].name === $scope.user.flair.svex.flair_css_class &&
                    $scope.flairs[i].sub === "svexchange")) {
                    return $scope.flairs[i];
                }
            }
        };

        $scope.numberOfGivenAway = function () {
            var givenAway = 0;
            $filter("filter")($scope.user.references,
                function (item) {
                    return $scope.isGiveaway(item) || $scope.isEggCheck(item);
                }
            ).forEach(
                function (ref) {
                    if (ref.url.indexOf("SVExchange") > -1) {
                        givenAway += (ref.number || 0);
                    }
                }
            );
            return givenAway;
        };

        $scope.numberOfEggsGivenAway = function () {
            var givenAway = 0;
            $filter("filter")($scope.user.references,
                function (item) {
                    return $scope.isGiveaway(item);
                }
            ).forEach(
                function (ref) {
                    if (ref.url.indexOf("SVExchange") > -1) {
                        givenAway += (ref.number || 0);
                    }
                }
            );
            return givenAway;
        };

        $scope.numberOfEggChecks = function () {
            var givenAway = 0;
            $filter("filter")($scope.user.references,
                function (item) {
                    return $scope.isEggCheck(item);
                }
            ).forEach(
                function (ref) {
                    if (ref.url.indexOf("SVExchange") > -1) {
                        givenAway += (ref.number || 0);
                    }
                }
            );
            return givenAway;
        };

        $scope.canUserApply = function (applicationFlair) {
            if (!$scope.user || !$scope.user.references) {
                return false;
            }
            var refs = $scope.user.references,
                trades = applicationFlair.trades || 0,
                shinyevents = applicationFlair.shinyevents || 0,
                events = applicationFlair.events || 0,
                eggs = applicationFlair.eggs || 0,
                giveaways = applicationFlair.giveaways || 0,
                userevent = $filter("filter")(refs, $scope.isEvent).length,
                usershiny = $filter("filter")(refs, $scope.isShiny).length,
                usercasual = $filter("filter")(refs, $scope.isCasual).length,
                userEgg = $filter("filter")(refs, $scope.isEgg).length,
                usershinyevents = userevent + usershiny,
                userTrades = usershinyevents + usercasual,
                userGiveaway = $scope.numberOfGivenAway(),
                currentFlair = $scope.getUserFlair();

            if (applicationFlair === currentFlair) {
                return false;
            }

            if ($scope.inPokemonTradesCasual(applicationFlair) &&
                $scope.inPokemonTradesCollector(currentFlair)) {
                return false;
            }

            if (applicationFlair.sub === "pokemontrades" &&
                currentFlair &&
                currentFlair.trades > trades &&
                currentFlair.shinyevents > shinyevents &&
                currentFlair.events > events) {
                return false;
            }

            if (applicationFlair.sub === "svexchange" &&
                currentFlair &&
                currentFlair.eggs > eggs &&
                currentFlair.giveaways > giveaways) {
                return false;
            }

            return (userTrades >= trades &&
            usershinyevents >= shinyevents &&
            userevent >= events &&
            userEgg >= eggs &&
            userGiveaway >= giveaways);
        };

        $scope.addFc = function () {
            $scope.user.friendCodes.push("");
        };

        $scope.delFc = function (index) {
            $scope.user.friendCodes.splice(index, 1);
        };

        $scope.addGame = function () {
            $scope.user.games.push({tsv: "", ign: ""});
        };

        $scope.delGame = function (game) {
            var index = $scope.user.games.indexOf(game);
            $scope.user.games.splice(index, 1);
        };

        $scope.saveProfile = function () {
            $scope.userok.saveProfile = false;
            $scope.userspin.saveProfile = true;
            var intro = $scope.user.intro,
                fcs = $scope.user.friendCodes.slice(0),
                games = $scope.user.games,
                url = "/user/edit";
            var len = fcs.length;
            while (len--) {
                if (fcs[len] === "") {
                    fcs.splice(len, 1);
                }
            }

            var patt = /([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
            for (var i = 0; i < fcs.length; i++) {
                if (!patt.test(fcs[i])) {
                    $scope.userspin.saveProfile = false;
                    $("#saveError").html("One of your friend codes wasn't in the correct format.").show();
                    return;
                }
            }

            for (var gameID = 0; gameID < games.length; gameID++) {
                if (isNaN(games[gameID].tsv)) {
                    $scope.userspin.saveProfile = false;
                    $("#saveError").html("One of the tsvs is not a number.").show();
                    return;
                }
                if (games[gameID].tsv === "") {
                    games[gameID].tsv = -1;
                }
            }

            io.socket.post(url, {
                "userid": $scope.user.id,
                "intro": intro,
                "fcs": fcs,
                "games": games
            }, function (data, res) {
                if (res.statusCode === 200) {
                    $scope.userok.saveProfile = true;
                } else if (res.statusCode === 400) {
                    $("#saveError").html("There was some issue.").show();
                    console.log(data);
                } else if (res.statusCode === 500) {
                    $("#saveError").html("There was some issue saving.").show();
                }
                $scope.userspin.saveProfile = false;
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

        $scope.addFlair = function () {
            $scope.flairs.push({});
        };

        $scope.saveFlairs = function () {
            var url = "/flair/save";
            $scope.userok.saveFlairs = false;
            $scope.userspin.saveFlairs = true;

            io.socket.post(url, {flairs: $scope.flairs}, function (data, res) {
                if (res.statusCode === 200) {
                    $scope.userok.saveFlairs = true;
                    console.log(data);
                } else {
                    console.log(res);
                }
                $scope.userspin.saveFlairs = false;
                $scope.$apply();
            });
        };

        $scope.getFlairs();
    };

    return userCtrl;
});