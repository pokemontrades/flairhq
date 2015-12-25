var _ = require('lodash');
exports.getComplement = function (ref) {
  if (exports.isTrade(ref)) {
    var query = {user: ref.user2, url: {endsWith: ref.url.substring(ref.url.indexOf('/r/'))}, user2: ref.user, type: ['casual', 'shiny', 'event']};
    return Reference.findOne(query).then(function (ref) {
      return ref;
    });
  }
};
exports.approve = function (ref, approve) {
  if (!exports.isApprovable(ref)) {
    throw 'Unapprovable ref';
  }
  ref.approved = approve;
  return exports.getComplement(ref).then(function (complement) {
    var promises = [];
    if (complement) {
      complement.approved = approve;
      ref.verified = approve;
      complement.verified = approve;
      promises.push(complement.save());
    }
    promises.unshift(ref.save());
    return Promise.all(promises).then(function (results) {
      return results[0];
    });
  });
};
exports.expectedFields = function (ref) {
  var optionalTypes = ['notes', 'privatenotes'];
  var requiredTypes = ['url', 'type'];
  if (exports.isTrade(ref) || exports.isBank(ref)) {
    requiredTypes = requiredTypes.concat(['user2', 'gave', 'got']);
  } else {
    requiredTypes.push('description');
  }
  if (exports.isGiveaway(ref) || exports.isEggCheck(ref)) {
    optionalTypes.push('number');
  }
  return {optional: optionalTypes, required: requiredTypes};
};
exports.validateRef = function (ref) {
  var regexp = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((pokemontrades)|(SVExchange)|(poketradereferences))\/comments\/([a-z\d]*)\/([^\/]+)\/([a-z\d]+)(\?[a-z\d]+)?/,
    regexpGive = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com\/r\/((SVExchange)|(pokemontrades)|(poketradereferences)|(Pokemongiveaway)|(SVgiveaway))\/comments\/([a-z\d]*)\/([^\/]+)\/?/,
    regexpMisc = /(http(s?):\/\/)?(www|[a-z]*\.)?reddit\.com.*/,
    regexpUser = /^[A-Za-z0-9_-]{1,20}$/;
  if (!ref.type) {
    throw 'Please choose a type.';
  }
  var expected = exports.expectedFields(ref);
  for (var i = 0; i < expected.required.length; i++) {
    if (!ref[expected.required[i]]) {
      throw 'Make sure you enter all the information';
    }
  }
  ref = _.pick(ref, expected.required.concat(expected.optional));
  if (((ref.type === "giveaway" || ref.type === "eggcheck") && !regexpGive.test(ref.url)) ||
    (ref.type !== "giveaway" && ref.type !== "misc" && ref.type !== "eggcheck" && !regexp.test(ref.url)) ||
    (ref.type === "misc" && !regexpMisc.test(ref.url))) {
    throw "Looks like you didn't input a proper permalink";
  }
  ref.user2 = ref.user2.replace(/^\/?u\//, '');
  if (expected.optional.indexOf('number') !== -1 && !ref.number) {
    ref.number = 0;
  }
  if (ref.number && isNaN(ref.number)) {
    throw 'Number must be a number.';
  }
  if (ref.user2 && !regexpUser.test(ref.user2)) {
    throw 'Please put a username on its own, or in format: /u/username. Not the full url, or anything else.';
  }
  return ref;
};
exports.isApproved = function (el) {
  return el.approved;
};
exports.isTrade = function (el) {
  return exports.isEvent(el) || exports.isShiny(el) || exports.isCasual(el);
};
exports.isInvolvement = function (el) {
  return el.type === "involvement";
};
exports.isEvent = function (el) {
  return el.type === "event" || el.type === "redemption";
};
exports.isShiny = function (el) {
  return el.type === "shiny";
};
exports.isCasual = function (el) {
  return el.type === "casual";
};
exports.isEgg = function (el) {
  return el.type === "egg";
};
exports.isBank = function (el) {
  return el.type === "bank";
};
exports.isGiveaway = function (el) {
  return el.type === "giveaway";
};
exports.isEggCheck = function (el) {
  return el.type === "eggcheck";
};
exports.isMisc = function (el) {
  return el.type === "misc";
};
exports.isApprovable = function (el) {
  return ['event', 'shiny', 'casual', 'egg', 'giveaway', 'involvement', 'eggcheck'].indexOf(el.type) !== -1;
};
exports.isNotNormalTrade = function (type) {
  return type === 'egg' || type === 'giveaway' || type === 'misc' || type === 'eggcheck' || type === 'involvement';
};
exports.hasNumber = function (type) {
  return type === 'giveaway' || type === 'eggcheck';
};
exports.getRedditUser = function (username) {
  if (username && username.indexOf("/u/") === -1) {
    return "/u/" + username;
  } else {
    return username;
  }
};
exports.numberOfPokemonGivenAway = function (refs) {
  var givenAway = 0;
  if (!refs) {
    return 0;
  }
  refs.filter(function (item) {
    return exports.isGiveaway(item) && item.url.indexOf("pokemontrades") !== -1;
  }).forEach(function (ref) {
    givenAway += (ref.number || 0);
  });
  return givenAway;
};
exports.numberOfEggsGivenAway = function (refs) {
  var givenAway = 0;
  if (!refs) {
    return 0;
  }
  refs.filter(function (item) {
    return exports.isGiveaway(item) && item.url.indexOf("SVExchange") > -1;
  }).forEach(function (ref) {
    givenAway += (ref.number || 0);
  });
  return givenAway;
};
exports.numberOfEggChecks = function (refs) {
  var givenAway = 0;
  if (!refs) {
    return 0;
  }
  refs.filter(function (item) {
    return exports.isEggCheck(item);
  }).forEach(function (ref) {
    givenAway += (ref.number || 0);
  });
  return givenAway;
};
exports.numberOfApprovedEggChecks = function (refs) {
  var num = 0;
  if (!refs) {
    return 0;
  }
  refs.filter(function (item) {
    return exports.isEggCheck(item) && exports.isApproved(item);
  }).forEach(function (ref) {
    num += ref.number || 0;
  });
  return num;
};
exports.numberOfTrades = function (refs) {
  if (!refs) {
    return 0;
  }
  return refs.filter(exports.isTrade).length;
};
