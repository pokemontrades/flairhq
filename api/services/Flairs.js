var sha1 = require('node-sha1');
var _ = require('lodash');
var referenceService = require('./References.js');
var NodeCache = require('node-cache');
var app_claim_cache = new NodeCache({stdTTL: 300});

exports.formattedName = function(name) {
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
  } else if (name === "eggcup") {
    suffix = "Cup";
    numberToSliceTill = -3;
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

exports.validFC = function(code) {
  code = code.replace(/-/g,'');
  if (!code.match(/^\d{12}$/) || code > 549755813887) {
    return 0;
  }
  var checksum = Math.floor(code/4294967296);
  var byte_seq = (code % 4294967296).toString(16);
  while (byte_seq.length < 8) {
    byte_seq = "0" + byte_seq;
  }
  var byte_arr = byte_seq.match(/../g).reverse();
  var hash_seq = "";
  for (var i = 0; i < 4; i++) {
    hash_seq += String.fromCharCode(parseInt(byte_arr[i], 16));
  }
  var new_chk = (parseInt(sha1(hash_seq).substring(0, 2), 16) >> 1);
  return (new_chk == checksum) ? 1 : 0;
};
exports.getFlair = function (name, flairs) {
  return _.find(flairs, function (flair) {
    return flair.name === name;
  });
};
exports.applied = function (apps, flair) {
  if (!apps || !flair) {
    return false;
  }
  return _.find(apps, function (app) {
    return app.flair === flair.name && app.sub === flair.sub;
  });
};
exports.inPokemonTradesTrader = function (flair) {
  if (flair) {
    return flair.sub === "pokemontrades" && !flair.involvement && !flair.giveaways;
  }
};
exports.inPokemonTradesHelper = function (flair) {
  if (flair) {
    return flair.sub === "pokemontrades" && (flair.involvement > 0 || flair.giveaways > 0);
  }
};
exports.inSVExchangeHatcher = function (flair) {
  if (flair) {
    return flair.sub === "svexchange" && flair.eggs > 0;
  }
};
exports.inSVExchangeGiver = function (flair) {
  if (flair) {
    return flair.sub === "svexchange" && flair.giveaways > 0;
  }
};
exports.userHasFlair = function (user, flair) {
  if (flair.sub === 'pokemontrades') {
    if (!user || !user.flair || !user.flair.ptrades || !user.flair.ptrades.flair_css_class) {
      return false;
    }
    if (flair.name === 'involvement' && user.flair.ptrades.flair_css_class.indexOf('1') !== -1) {
      return true;
    }
    return user.flair.ptrades.flair_css_class.replace(/1/g, '').split(' ').indexOf(flair.name) !== -1;
  } else {
    if (!user || !user.flair || !user.flair.svex || !user.flair.svex.flair_css_class) {
      return false;
    }
    return user.flair.svex.flair_css_class.split(' ').indexOf(flair.name) !== -1;
  }
};
exports.getUserFlairs = function (user, allflairs) {
  return _.filter(allflairs, function (flair) {
    return exports.userHasFlair(user, flair);
  });
};
exports.getFlairTextForSVEx = function (user) {
  if (!user || !user.flair || !user.flair.svex || !user.flair.svex.flair_css_class) {
    return;
  }
  var flairs = user.flair.svex.flair_css_class.split(' '),
    flairText = "";
  for (var i = 0; i < flairs.length; i++) {
    flairText += "flair-" + flairs[i] + " ";
  }
  return flairText;
};
exports.canUserApply = function (refs, applicationFlair, currentFlairs) {
  if (!applicationFlair) {
    return false;
  }
  var userHasDefaultFlair = currentFlairs.filter(function (flair) {
    return flair.sub === 'pokemontrades';
  }).length === 0;
  if (userHasDefaultFlair && applicationFlair.name === 'involvement') {
    return false;
  }
  var trades = applicationFlair.trades || 0,
    involvement = applicationFlair.involvement || 0,
    eggs = applicationFlair.eggs || 0,
    giveaways = applicationFlair.giveaways || 0,
    userTrades = referenceService.numberOfTrades(refs),
    userInvolvement = _.filter(refs, referenceService.isInvolvement).length,
    userEgg = _.filter(refs, referenceService.isEgg).length,
    userGiveaway = referenceService.numberOfEggChecks(refs) + referenceService.numberOfEggsGivenAway(refs);
  if (applicationFlair.sub === "pokemontrades") {
    userGiveaway = _.filter(refs, function (e) {
      return referenceService.isGiveaway(e) && e.url.indexOf("pokemontrades") > -1;
    }).length;
  }
  for (var i = 0; i < currentFlairs.length; i++) {
    var flair = currentFlairs[i]; 
    if (flair.trades >= trades && flair.involvement >= involvement && flair.eggs >= eggs && flair.giveaways >= giveaways) {
      return false;
    }
  }
  return (userTrades >= trades &&
  userInvolvement >= involvement &&
  userEgg >= eggs &&
  userGiveaway >= giveaways);
};
exports.formattedRequirements = function (flair, flairs) {
  var reqs;
  for (var i = 0; i < flairs.length; i++) {
    if (flairs[i].name === flair) {
      reqs = flairs[i];
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
    formatted += reqs.involvement + (reqs.involvement > 1 ? ' free tradebacks/redemptions, ' : ' free tradeback/redemption, ');
  }
  if (reqs.giveaways) {
    if (reqs.sub === 'pokemontrades') { // reqs.giveaways means two different things on the two subs
      formatted += reqs.giveaways + (reqs.giveaways > 1 ? ' giveaways, ' : ' giveaway, ');
    } else {
      formatted += reqs.giveaways + (reqs.giveaways > 1 ? ' eggs checked/given away, ' : ' egg checked/given away, ');
    }
  }
  if (reqs.eggs) {
    formatted += reqs.eggs + (reqs.eggs > 1 ? ' hatches, ' : ' hatch, ');
  }
  formatted = formatted.slice(0,-2);
  return formatted;
};

exports.flairCheck = function (ptrades, svex) {
  if (!ptrades || !svex) {
    throw "Need both flairs.";
  }
  if (ptrades.length > 64 || svex.length > 64) {
    throw "Flairs too long";
  }
  const gameOptions = ['X', 'Y', 'ΩR', 'αS'].join('|');
  const legalIgn = '[^()|,]{1,12}';
  const friendCodeGroup = /((?:\d{4}-){2}\d{4}(?:, (?:\d{4}-){2}\d{4})*)/;
  const gameGroup = '^(' + legalIgn + '(?: \\((?:' + gameOptions + ')(?:, (?:' + gameOptions + '))*\\))(?:, (?:' + legalIgn + ')?(?: \\((?:' +
    gameOptions + ')(?:, (?:' + gameOptions + '))*\\))?)*)$';
  var tradesParts = ptrades.split(' || ');
  var svexParts = svex.split(' || ');
  if (tradesParts.length !== 2 || svexParts.length !== 3) {
    throw "Error with format.";
  }
  if (!tradesParts[0].match(friendCodeGroup) || !svexParts[0].match(friendCodeGroup)) {
    throw "Error with FCs";
  }
  if (!tradesParts[1].match(RegExp(gameGroup)) || !svexParts[1].match(RegExp(gameGroup))) {
    throw "We need at least 1 game.";
  }
  var games = [];
  var ignBlocks = _.union(tradesParts[1].split(/(?!\([^)]*), (?![^(]*\))/), svexParts[1].split(/(?!\([^)]*), (?![^(]*\))/));
  // Parse the games. e.g. 'ExampleName (X, Y)' --> [{ign: 'ExampleName', game: 'X'}, {ign: 'ExampleName', game: 'Y'}]
  // The regex is more complicated than necessary at the moment, but this should make it easier if we decide to allow special characters in the future.
  ignBlocks.forEach(function (block) {
    var parts = RegExp('^(' + legalIgn + ')(?: \\(((?:' + gameOptions + ')(?:, (?:' + gameOptions + '))*)\\))?$').exec(block);
    if (parts[2]) {
      parts[2].split(', ').forEach(function (game) {
        if (_.findIndex(games, {ign: parts[1], game: game}) === -1) {
          games.push({ign: parts[1], game: game});
        }
      });
    }
    else if (!_.includes(_.map(games, 'ign'), parts[1])) {
      games.push({ign: parts[1], game: ''});
    }
  });
  var response = {
    ptrades: ptrades,
    svex: svex,
    games: games,
    tsvs: svexParts[2].split(', '),
    fcs: _.union(tradesParts[0].split(', '), svexParts[0].split(', '))
  };

  return response;
};

exports.makeNewCSSClass = function (previous_flair, new_addition, subreddit) {
  if (!previous_flair) {
    return new_addition;
  }
  if (new_addition === 'banned') {
    if (subreddit === 'pokemontrades') {
      return previous_flair.replace(/^banned$/, '').replace(/([^ ]+)( .*)?$/, '$1 ') + 'banned';
    }
    return previous_flair.replace(/ ?banned/, '').replace(/(.)$/, '$1 ') + 'banned';
  }
  if (new_addition === 'involvement') {
    return previous_flair.replace(/( |$)/, '1$1');
  }
  if (subreddit === 'pokemontrades' || !/ribbon/.test(previous_flair + new_addition)) {
    return previous_flair.replace(/[^ 1]*/, new_addition);
  }
  if (/ribbon/.test(previous_flair)) {
    if (/ribbon/.test(new_addition)) {
      return previous_flair.replace(/(([^ ]* )*)[^ ]*ribbon(.*)/, '$1' + new_addition + '$3');
    }
    return previous_flair.replace(/^.*?([^ ]*ribbon.*)/, new_addition + ' $1');
  }
  return previous_flair.replace(/([^ ]*)(.*)/, '$1 ' + new_addition + '$2');
};

// Get the Damerau–Levenshtein distance (edit distance) between two strings.
exports.edit_distance = function (string1, string2) {
  var distance_matrix = {};
  var dist = function (str1, str2) {
    if (!distance_matrix[[str1.length, str2.length]]) {
      if (!str1 || !str2) {
        distance_matrix[[str1.length, str2.length]] = str1.length || str2.length;
      } else {
        var vals = [
          dist(str1.slice(0, -1), str2) + 1,
          dist(str1, str2.slice(0, -1)) + 1,
          dist(str1.slice(0, -1), str2.slice(0, -1)) + (str1.slice(-1) === str2.slice(-1) ? 0 : 1)
        ];
        if (str1.slice(-2, -1) === str2.slice(-1) && str1.slice(-1) === str2.slice(-2, -1) && str1.slice(-2) !== str2.slice(-2)) {
          vals.push(dist(str1.slice(0, -2), str1.slice(0, -2)) + 1);
        }
        distance_matrix[[str1.length, str2.length]] = _.min(vals);
      }
    }
    return distance_matrix[[str1.length, str2.length]];
  };
  return dist(string1, string2);
};

// Given a friend code, return all banned friend codes that have an edit distance of less than 3 to the given friend code.
exports.getSimilarBannedFCs = function (fc) {
  return User.find({banned: true}).then(function (bannedUsers) {
    return _(bannedUsers).map('loggedFriendCodes').flatten().compact().filter(function (banned_fc) {
      return exports.edit_distance(fc, banned_fc) < 3;
    }).value();
  });
};

// Returns a promise of all flair apps for a particular username. If username is undefined, returns flair apps for all users.
// Note: This will include the claimedBy property, which we probably don't want the user to see.
exports.getApps = function (username) {
  var query = username ? {user: username} : {};
  return Application.find(query).then(function (apps) {
    apps.forEach(function (app) {
      app.claimedBy = app_claim_cache.get(app.id) || app_claim_cache.get(app.user);
    });
    return apps;
  });
};

// Returns a promise for all flairs
exports.getFlairs = function () {
  return Flair.find({});
};

exports.refreshAppClaim = function (ref, mod_username) {
  // Guess what app a mod is working on based on the links they click
  var query = {};
  if (References.isTrade(ref)) {
    query = {sub: 'pokemontrades', flair: {not: 'involvement'}};
  } else if (References.isInvolvement(ref) || References.isGiveaway(ref) && /reddit\.com\/r\/pokemontrades/.test(ref.url)) {
    query = {sub: 'pokemontrades', flair: 'involvement'};
  } else if (References.isEgg(ref)) {
    query = {sub: 'svexchange', flair: {not: {endsWith: 'ribbon'}}};
  } else if (References.isEggCheck(ref) || References.isGiveaway(ref) && /reddit\.com\/r\/SVExchange/.test(ref.url)) {
    query = {sub: 'svexchange', flair: {endsWith: 'ribbon'}};
  } else {
    return [];
  }
  query.user = ref.user;
  return Application.find(query).then(function (apps) {
    apps.forEach(function (app) {
      app_claim_cache.set(app.id, mod_username);
    });
    return apps;
  });
};
