/* global io, define */
define(['lodash'], function (_) {

  var userCtrl = function ($scope, $filter, $location, $timeout) {
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
      {name: "involvement"},
      {name: "lucky"},
      {name: "egg"},
      {name: "eevee"},
      {name: "togepi"},
      {name: "torchic"},
      {name: "pichu"},
      {name: "manaphy"},
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
    $scope.types = [
      {name: "event", display: "Event"},
      {name: "redemption", display: "Redemption"},
      {name: "shiny", display: "Shiny"},
      {name: "casual", display: "Competitive/Casual"},
      {name: "bank", display: "Bank"},
      {name: "egg", display: "Egg Hatch"},
      {name: "giveaway", display: "Giveaway"},
      {name: "eggcheck", display: "Egg/TSV Check"},
      {name: "misc", display: "Miscellaneous"}
    ];
    $scope.onSearchPage = $location.absUrl().indexOf('search') === -1;

    $scope.isApproved = function (el) {
      return el.approved;
    };

    $scope.isTrade = function (el) {
      return el.type === "event" || el.type === "shiny" || el.type === "casual" || el.type === "redemption";
    };

    $scope.isInvolvement = function (el) {
      return el.type === "involvement";
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
      } else if (name !== "egg" && name !== "involvement") {
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

    $scope.applied = function (flair) {
      if (!$scope.user || !$scope.user.apps) {
        return false;
      }
      var flairs = $scope.user.apps;
      for (var i = 0; i < flairs.length; i++) {
        if (flairs[i].flair === flair.name && flairs[i].sub === flair.sub) {
          return true;
        }
      }
      return false;
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
            $scope.user.apps.push(data);
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
            $scope.user.apps.push(data);
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

    $scope.inPokemonTradesTrader = function (flair) {
      if (flair) {
        return flair.sub === "pokemontrades" && !flair.involvement && !flair.giveaways;
      }
    };

    $scope.inPokemonTradesHelper = function (flair) {
      if (flair) {
        return flair.sub === "pokemontrades" && (flair.involvement > 0 || flair.giveaways > 0);
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
            _.merge($scope.user, data);
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
              $scope.user.flairFriendCodes = [];
              $scope.user.flairGames = [{tsv: "", ign: ""}];
              var trades = $scope.user.flair.ptrades.flair_text;
              var sv = $scope.user.flair.svex.flair_text;
              var fxReg = /([0-9]{4}-){2}[0-9]{4}/g;
              var gameReg = /\([X|Y|ΩR|αS]\)/g;
              var ignReg = /\|\| .* \(/g;
              var tsvReg = /\|\| [0-9]{4}/g;

              var fcs = _.merge(trades.match(fxReg), sv.match(fxReg));
              var games = _.merge(trades.match(gameReg), sv.match(gameReg));
              var igns = _.merge(trades.match(ignReg), sv.match(ignReg));
              var tsvs = sv.match(tsvReg);


              for (var j = 0; j < fcs.length; j++) {
                $scope.user.flairFriendCodes.push(fcs[j]);
              }

              $scope.user.flairGames = [];
              for (var j = 0; j < games.length || j < igns.length || j < tsvs.length; j++) {
                $scope.user.flairGames.push({
                  game: j < games.length ? games[j].replace(/\(/g,"").replace(/\)/g,"") : "",
                  ign: j < igns.length ? igns[j].replace(/\|\| /g, "").replace(/ \(/g, "") : "",
                  tsv: j < tsvs.length ? tsvs[j].replace(/\|\| /g, "") : ""
                });
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
      if (!$scope.user || !$scope.user.references) {
        return;
      }
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
      if (!$scope.user || !$scope.user.references) {
        return;
      }
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
      if (!$scope.user || !$scope.user.references) {
        return;
      }
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

    $scope.getFlairTextForUserForSVEx = function () {
      if (!$scope.user || !$scope.user.flair) {
        return;
      }
      var flairs = $scope.user.flair.svex.flair_css_class.split(' '),
        flairText = "";
      for(var i = 0; i < flairs.length; i++) {
        flairText += "flair-" + flairs[i] + " ";
      }
      return flairText;
    };

    $scope.canUserApply = function (applicationFlair) {
      if (!$scope.user || !$scope.user.references) {
        return false;
      }
      var refs = $scope.user.references,
        trades = applicationFlair.trades || 0,
        involvement = applicationFlair.involvement || 0,
        eggs = applicationFlair.eggs || 0,
        giveaways = applicationFlair.giveaways || 0,
        userTrades = $filter("filter")(refs, $scope.isTrade).length,
        userInvolvement = $filter("filter")(refs, $scope.isInvolvement).length,
        userEgg = $filter("filter")(refs, $scope.isEgg).length,
        userGiveaway = $scope.numberOfGivenAway(),
        currentFlair = $scope.getUserFlair();

      if (applicationFlair === currentFlair || ($scope.user.flair.ptrades.flair_css_class === "default" && applicationFlair.name === "involvement")) {
        return false;
      }

      if ($scope.inPokemonTradesTrader(applicationFlair) &&
        $scope.inPokemonTradesHelper(currentFlair)) {
        return false;
      }

      if (applicationFlair.sub === "pokemontrades") {
        userGiveaway = $filter("filter")(refs, function (e) {
          return $scope.isGiveaway(e) && e.url.indexOf("pokemontrades") > -1;
        }).length;
      }

      if (applicationFlair.sub === "pokemontrades" &&
        currentFlair &&
        currentFlair.trades > trades &&
        currentFlair.involvement > involvement &&
        currentFlair.giveaways > giveaways) {
        return false;
      }

      if (applicationFlair.sub === "svexchange" &&
        currentFlair &&
        currentFlair.eggs > eggs &&
        currentFlair.giveaways > giveaways) {
        return false;
      }

      return (userTrades >= trades &&
      userInvolvement >= involvement &&
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

    $scope.addflairFc = function () {
      $scope.user.flairFriendCodes.push("");
    };

    $scope.delflairFc = function (index) {
      $scope.user.flairFriendCodes.splice(index, 1);
    };

    $scope.addflairGame = function () {
      $scope.user.flairGames.push({tsv: "", ign: ""});
    };

    $scope.delflairGame = function (game) {
      var index = $scope.user.games.indexOf(game);
      $scope.user.flairGames.splice(index, 1);
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

    $scope.ptradesCreatedFlair = function () {
      if (!$scope.user || !$scope.user.flairFriendCodes) {
        return "";
      }
      var fcs = $scope.user.flairFriendCodes.slice(0),
        games = $scope.user.flairGames,
        text = "";

      for (var i = 0; i < fcs.length; i++) {
        text += fcs[i];
        if (i+1 !== fcs.length) {
          text += ", ";
        }
      }

      text += " || ";

      for (var j = 0; j < games.length; j++) {
        text += games[j] ? games[j].ign : "";
        text += games[j] && games[j].game ? " (" + games[j].game + ")" : "";
      }

      return text;
    };

    $scope.svexCreatedFlair = function () {
      if (!$scope.user || !$scope.user.flairFriendCodes) {
        return "";
      }
      var fcs = $scope.user.flairFriendCodes.slice(0),
        games = $scope.user.flairGames,
        text = "";

      for (var i = 0; i < fcs.length; i++) {
        text += fcs ? fcs[i] : "";
        if (i+1 !== fcs.length) {
          text += ", ";
        }
      }

      text += " || ";

      for (var j = 0; j < games.length; j++) {
        text += games[j] ? games[j].ign : "";
        text += games[j] && games[j].game ? " (" + games[j].game + ")" : "";
      }

      text += " || ";

      for (var k = 0; k < games.length; k++) {
        text += games[k] ? games[k].tsv : "XXXX";
      }

      return text;
    };

    $scope.isCorrectFlairText = function () {
      var svex = $scope.svexCreatedFlair();
      var ptrades = $scope.ptradesCreatedFlair();
      if (!$scope.user || !$scope.user.flairFriendCodes || !$scope.user.flairGames) {
        return;
      }

      if (svex.length > 64 || ptrades.length > 64) {
        return {correct: false, error: "Your flair is too long, maximum is 64 characters, please delete something."};
      }

      for (var i = 0; i < $scope.user.flairFriendCodes.length; i++) {
        var fc = $scope.user.flairFriendCodes[i];
        if (fc === "") {
          return {correct: false, error: "Please fill in all empty information."};
        }
      }

      for (var i = 0; i < $scope.user.flairGames.length; i++) {
        var game = $scope.user.flairGames[i];
        if (!game.tsv || !game.game || !game.ign) {
          return {correct: false, error: "Please fill in all empty information."};
        }
      }

      return {correct: true};
    };

    $scope.possibleGames = ["X", "Y", "ΩR", "αS"];

    $scope.setFlairText = function () {
      $scope.userok.setFlairText = false;
      $scope.userspin.setFlairText = true;
      var ptrades = $scope.ptradesCreatedFlair(),
        svex = $scope.svexCreatedFlair(),
        url = "/flair/setText";

      io.socket.post(url, {
        "ptrades": ptrades,
        "svex": svex
      }, function (data, res) {
        if (res.statusCode === 200) {
          $scope.userok.setFlairText = true;
        } else if (res.statusCode === 400 && res.data === "Changed string") {
          $("#setTextError").html("Don't modify the text.").show();
          console.log(data);
        } else if (res.statusCode === 500) {
          $("#setTextError").html("There was some issue setting flair.").show();
        }
        $scope.userspin.setFlairText = false;
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

    $scope.deleteFlair = function (index) {
      $scope.flairs.splice(index, 1);
    };

    $scope.searchInfo = {
      keyword: "",
      category: [],
      user: "",
      quick: true
    };
    $scope.searchInfo.uriKeyword = function () {
      return encodeURIComponent($scope.searchInfo.keyword.replace(/\//g, "%2F"));
    };
    $scope.searching = false;
    $scope.searchResults = [];
    $scope.searchedFor = "";
    $scope.lastSearch = "";
    $scope.numberSearched = 0;

    $scope.toggleCategory = function (name) {
      var index = $scope.searchInfo.category.indexOf(name);

      if(index > -1) {
        $scope.searchInfo.category.splice(index, 1);
      } else {
        $scope.searchInfo.category.push(name);
      }

      if ($scope.searchInfo.keyword) {
        $scope.search();
      }
    };

    $scope.getMore = function () {
      if ($scope.searching) {
        return;
      }
      $scope.numberSearched += 20;
      $scope.search($scope.numberSearched);
    };

    $scope.search = function (skip) {
      $('.search-results').show();
      $scope.searching = true;
      if (!$scope.searchInfo.keyword) {
        $scope.searching = false;
        $scope.searchResults = [];
        $scope.numberSearched = 0;
        return;
      }

      if (!skip) {
        $scope.numberSearched = 0;
        skip = 0;
      }

      var url = "/search";
      if ($scope.searchInfo.quick) {
        url += "/quick";
      } else {
        url += "/normal";
      }
      url += "?keyword=" + $scope.searchInfo.keyword;
      if ($scope.searchInfo.category.length > 0) {
        url += "&categories=" + $scope.searchInfo.category;
      }
      if ($scope.searchInfo.user) {
        url += "&user=" + $scope.searchInfo.user
      }
      url += "&skip=" + skip;

      console.log(url);
      $scope.searchedFor = url;
      io.socket.get(url, function (data, res) {
        if (res.statusCode === 200 && $scope.searchedFor === url) {
          console.log($scope.searchResults);
          if (skip) {
            $scope.searchResults = $scope.searchResults.concat(data);
          } else {
            $scope.searchResults = data;
          }
          $scope.searching = false;
          $scope.$apply();
        } else if (res.statusCode !== 200) {
          // Some error
          console.log(res);
        }
      });
    };

    var searchTimeout;
    $scope.searchMaybe = function () {
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
      }

      searchTimeout = $timeout(function () {
        if (!_.isEqual($scope.lastSearch, $scope.searchInfo)) {
          $scope.lastSearch = _.cloneDeep($scope.searchInfo);
          $scope.search();
          console.log("searching " + $scope.searchInfo);
        }
      }, 500);
    };

    $timeout(function () {
      if ($scope.searchInfo.keyword) {
        $scope.search();
      }
    }, 300);
    $scope.getFlairs();
  };

  return userCtrl;
});