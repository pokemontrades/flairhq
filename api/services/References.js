exports.approve = function (ref, approve) {
  return new Promise(function (resolve, reject) {
    ref.approved = approve;
    var query = {
      user: ref.user2,
      url: {endsWith: ref.url.substring(ref.url.indexOf("/r/"))},
      user2: ref.user,
      or: [
        {type: 'casual'},
        {type: 'shiny'},
        {type: 'event'}
      ]
    };
    Reference.findOne(query, function (searcherr, otherRef) {
      if (searcherr) {
        sails.log.error(searcherr);
        return reject(searcherr);
      }
      if (otherRef && (ref.type === 'casual' || ref.type === 'shiny' || ref.type === 'event')) {
        otherRef.approved = approve;
        ref.verified = approve;
        otherRef.verified = approve;
        ref.save(function (err1, newRef) {
          otherRef.save(function (err2) {
            if (err1 || err2) {
              return reject(err1 || err2);
            }
            resolve(newRef);
          });
        });
      } else {
        ref.save(function (err, newRef) {
          if (err) {
            return reject(err);
          }
          resolve(newRef);
        });
      }
    });
  });
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
exports.isApprovable = function (type) {
  return ['event', 'shiny', 'casual', 'egg', 'giveaway', 'involvement', 'eggcheck'].indexOf(type) !== -1;
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
