var regex = require("regex");
var _ = require("lodash");
var $ = require("jquery");
var shared = require('./sharedClientFunctions.js');
var flairService = require('../api/services/Flairs.js');

module.exports = function ($scope, $location, io) {
  shared.addRepeats($scope, io);
  $scope.regex = regex;
  $scope.selectedFlair = undefined;
  $scope.loaded = false;
  $scope.userok = {};
  $scope.errors = {};
  $scope.userspin = {};
  $scope.flairNames = [
    {name: "gen2"},
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
    {name: "toughribbon"}
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
    {name: "bank", display: "Gen 3-5 Event"},
    {name: "egg", display: "Egg Hatch"},
    {name: "giveaway", display: "Giveaway"},
    {name: "eggcheck", display: "Egg/TSV Check"},
    {name: "misc", display: "Miscellaneous"}
  ];

  $scope.onSearchPage = $location.absUrl().indexOf('search') !== -1;
  $scope.onIndexPage = location.pathname === '/';
  $scope.query = require('querystring').parse(location.search.slice(1));

  if (window.location.hash === "#/comments") {
    $('#tabList li:eq(1) a').tab('show');
  } else if (window.location.hash === "#/info") {
    $('#tabList li:eq(2) a').tab('show');
  } else if (window.location.hash === "#/modEdit") {
    $('#tabList li:eq(3) a').tab('show');
  } else if (window.location.hash === "#/privacypolicy") {
    $('#privacypolicy').modal('show');
  } else if (window.location.hash === "#/flairtext") {
    $('#flairText').modal('show');
  }

  $scope.applyFlair = function () {
    $scope.errors.flairApp = "";
    $scope.userok.applyFlair = false;
    $scope.userspin.applyFlair = true;
    var flair = $scope.getFlair($scope.selectedFlair, $scope.flairs);
    if ($scope.selectedFlair && $scope.canUserApply(flair)) {
      io.socket.post("/flair/apply", {flair: $scope.selectedFlair, sub: flair.sub}, function (data, res) {
        if (res.statusCode === 200) {
          $scope.refUser.apps.push(data);
          $scope.selectedFlair = undefined;
          $scope.userok.applyFlair = true;
          $scope.userspin.applyFlair = false;
          $scope.$apply();
        } else {
          $scope.errors.flairApp = res.body.error || "Something unexpected happened.";
          $scope.userspin.applyFlair = false;
          $scope.$apply();
        }
      });
    } else {
      $scope.errors.flairApp = "You can't apply for that flair.";
      $scope.userspin.applyFlair = false;
      $scope.$apply();
    }
  };

  $scope.setSelectedFlair = function (id, bool) {
    if (bool) {
      $scope.selectedFlair = id;
    }
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

  $scope.delflairGame = function (index) {
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

    var patt = /(?:SW-)?([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
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
      "username": $scope.user.name,
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

  $scope.renderFlairTextString = function (format) {
    if (!$scope.user) {
      return "";
    }
    return format.replace(/\{([^\}]+?)\}/g, function (match, replacement, offset, string) {
      if (replacement === "fcs") {
        if (!$scope.user.flairFriendCodes) {
          return "";
        }
        var validFCs = [];
        $scope.user.flairFriendCodes.forEach(function (fc) {
          if (fc.match(regex.fc)) {
            validFCs.push(fc);
          }
        });
        if (validFCs.length > 0) {
          return validFCs.join(", ");
        } else {
          return "";
        }
      }
      if (replacement === "games") {
        if (!$scope.user.flairGames) {
          return "";
        }
        return flairService.formatGames($scope.user.flairGames);
      }
      if (replacement === "tsvs") {
        var validTSVs = [];
        $scope.user.flairGames.forEach(function (game) {
          if (game.tsv && game.tsv < 4096) {
            validTSVs.push(game.tsv.toString().padStart(4, "0"));
          }
        });
        if (validTSVs.length > 0) {
          return validTSVs.join(", ");
        } else {
          return "XXXX";
        }
      }
      return string;
    });
  };

  $scope.isCorrectFlairText = function () {
    var svex = $scope.renderFlairTextString("{fcs} || {games} || {tsvs}");
    var ptrades = $scope.renderFlairTextString("{fcs} || {games}");
    if (!$scope.user || !$scope.user.flairFriendCodes || !$scope.user.flairGames) {
      return;
    }

    if (svex.length > 55 || ptrades.length > 55) {
      return {correct: false, error: "Your flair text is too long; it may be at most 55 characters. If you have multiple games or friend codes listed, please consider removing the least frequently used one from your flair."};
    }

    for (var i = 0; i < $scope.user.flairFriendCodes.length; i++) {
      var fc = $scope.user.flairFriendCodes[i];
      if (!fc || !fc.match(regex.fcSingle)) {
        return {correct: false, error: "Please fill in all friend codes and in-game names."};
      }
    }

    for (i = 0; i < $scope.user.console.length; i++) {
      var console = $scope.user.console[i];
      if (!console || !console.match(regex.consoleSingle)) {
        return {correct: false, error: "Please select the appropriate game console type for each friend code."};
      }
    }

    var hasIGN = false;
    for (var j = 0; j < $scope.user.flairGames.length; j++) {
      var game = $scope.user.flairGames[j];
      if (game.ign) {
        hasIGN = true;
        if (game.ign.length > 12) {
          return {correct: false, error: 'In-game names have a maximum length of 12 characters.'};
        }
        var illegal_match = game.ign.match(/\(|\)|\||,/);
        if (illegal_match) {
          return {correct: false, error: 'Your in-game name contains an illegal character: ' + illegal_match};
        }

        // Since Reddit's flair_text system is emoji based, we want to prevent users from submitting an IGN with colons to prevent conflicts.
        var has_colon = game.ign.match(/:/);
        if (has_colon) {
          return {correct: false, error: 'Your in-game name contains a colon. Please omit the colons to prevent conflicts with emoji-based flair text.'};
        }
      }
      if (game.tsv >= 4096) {
        return {correct: false, error: "Invalid TSV, they should be between 0 and 4095."};
      }
    }
    if (!hasIGN) {
      return {correct: false, error: "Please fill in all friend codes and in-game names."};
    }
    return {correct: true};
  };

  $scope.possibleConsoles = ["Switch", "3DS"];
  $scope.possibleGames = ["X", "Y", "ΩR", "αS", "S", "M", "US", "UM", "LGP", "LGE", "SW", "SH", "BD", "SP", "PLA"];

  $scope.setFlairText = function () {
    $("#setTextError").html("").hide();
    $scope.userok.setFlairText = false;
    $scope.userspin.setFlairText = true;

    var url = "/flair/setText";

    io.socket.post(url, {
      "ptrades": $scope.renderFlairTextString("{fcs} || {games}"),
      "svex": $scope.renderFlairTextString("{fcs} || {games} || {tsvs}"),
      "eventFlair": $scope.user.eventFlair
    }, function (data, res) {
      if (res.statusCode === 200) {
        if ($('#event-selection:not(".already-selected")')) {
          $('#event-selection button').attr('disabled', 'disabled');
          $('#event-text').html("You have selected your starter. Good luck!");
        }
        $scope.userok.setFlairText = true;
      } else if (res.statusCode === 400) {
        $("#setTextError").html(data.error).show();
        console.log(data);
      } else if (res.statusCode === 500) {
        $("#setTextError").html("There was some issue setting flair.").show();
      }
      $scope.userspin.setFlairText = false;
      $scope.$apply();
    });

  };

  $scope.addFlair = function () {
    $scope.flairs.push({});
  };

  $scope.saveFlairs = function () {
    var url = "/flair/save";
    $scope.userok.saveFlairs = false;
    $scope.userspin.saveFlairs = true;
    for (var i = 0; i < $scope.flairs.length; i++) {
      for (var key in $scope.flairs[i]) {
        if ($scope.flairs[i].hasOwnProperty(key) && !$scope.flairs[i][key]) {
          $scope.flairs[i][key] = 0;
        }
      }
    }

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

  // Since window functions can't be directly used in embedded expressions, use this in embedded expressions instead.
  $scope.$encodeURIComponent = encodeURIComponent;

  $scope.init = function (params) {
    $scope = _.assign($scope, params);
    $scope.user.console = new Array();
    console.log("Created console array");
    for (var subreddit in $scope.user.flair) {
      if ($scope.user.flair[subreddit].flair_text) {
        $scope.user.flair[subreddit].flair_text = $scope.user.flair[subreddit].flair_text.replace(/:[^:]+:/,'');
      }
    }
    if ($scope.user) {
      $scope.user.isFlairMod = $scope.user.isMod && ($scope.user.modPermissions.includes('all') || $scope.user.modPermissions.includes('flair'));
      try {
        var parsed = $scope.flairCheck($scope.user.flair.ptrades.flair_text, $scope.user.flair.svex.flair_text);
        $scope.user.flairFriendCodes = parsed.fcs;
        for (var i = 0; i < parsed.fcs.length; i++) {
          $scope.user.console.push(parsed.fcs[i].match(/^SW-/) ? "Switch" : "3DS");
        }
        $scope.user.flairGames = parsed.games;
        for (i = 0; i < parsed.games.length; i++) {
          $scope.user.flairGames[i].tsv = parsed.tsvs[i];
        }
        $scope.user.friendCodes = $scope.user.flairFriendCodes;
        if (!$scope.user.games.length) {
          $scope.user.games = $scope.user.flairGames;
        }
      } catch (err) {
        $scope.user.flairFriendCodes = [""];
        $scope.user.flairGames = [{tsv: "", ign: "", game: ""}];
        $scope.user.games = $scope.user.flairGames;
        $scope.user.friendCodes = [""];
      }
    }
  };
  $(document).ready(function () {
    $scope.loaded = true;
    $scope.$apply();
    $scope.$watchCollection('user.console', function(modifiedArray) {
      for (var i = 0; i < modifiedArray.length; i++) {
        console.log("Checking fc "+i);
        console.log("New Value is "+$scope.user.flairFriendCodes[i]);
        if ($scope.user.console[i] === 'Switch' && !$scope.user.flairFriendCodes[i].match(/^SW-/)) {
          $scope.user.flairFriendCodes[i] = "SW-" + $scope.user.flairFriendCodes[i];
        }
        if ($scope.user.console[i] === '3DS') {
          var switchFormatMatch = $scope.user.flairFriendCodes[i].match(/^SW-(\d{0,4}-?\d{0,4}-?\d{0,4})/);
          $scope.user.flairFriendCodes[i] = switchFormatMatch[1];
        }
      }
    });
    $scope.$watchCollection('user.flairFriendCodes', function(modifiedArray, prevArray) {
      for (var i = 0; i < modifiedArray.length; i++) {
        console.log("Checking fc "+i);
        console.log("New Value is "+$scope.user.flairFriendCodes[i]);
        if (!$scope.user.flairFriendCodes[i]
          || ($scope.user.console[i] === 'Switch' && $scope.user.flairFriendCodes[i].match(/^SW-(?:\d{0,3}|\d{4}(?:-\d{0,3}|-\d{4}(?:-\d{0,4})?)?)$/))
          || ($scope.user.console[i] === '3DS' && $scope.user.flairFriendCodes[i].match(/^(?:\d{0,3}|\d{4}(?:-\d{0,3}|-\d{4}(?:-\d{0,4})?)?)$/))
          || (!$scope.user.console[i] && $scope.user.flairFriendCodes[i].match(/^(?:S|SW|SW-)?(?:\d{0,3}|\d{4}(?:-\d{0,3}|-\d{4}(?:-\d{0,4})?)?)$/))) {
          continue;
        }
        var regexMatch = $scope.user.flairFriendCodes[i].match(/^(?:SW-)?(\d{0,4})-?(\d{0,4})-?(\d{0,4})/);
        if (regexMatch) {
          var output = $scope.user.console[i] === 'Switch' ? 'SW-' : '';
          var codeSection = 1;
          console.log(regexMatch);
          while (codeSection < 3 && regexMatch[codeSection].length > 3) {
            output += regexMatch[codeSection];
            codeSection++;
            if ((regexMatch[codeSection]).length > 0) {
              output += '-';
            }
          }
          output += regexMatch[codeSection];
          $scope.user.flairFriendCodes[i] = output;
        } else {
          $scope.user.flairFriendCodes[i] = prevArray[i];
        }
      }
    });
    $('.plus-minus').parent().parent().on('click', function () {
      var plusminus = $(this).find('.plus-minus');
      plusminus.text(plusminus.text() === '+' ? '-' : '+');
    });
    $('.bigspinner').hide();
  });
};
