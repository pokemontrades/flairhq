exports.approve = function (ref, approve) {
  if (!exports.isVerifiable(ref)) {
    return Reference.update({id: ref.id}).set({approved: approve}.fetch());
  }
  return Reference.findOne({
    user: ref.user2,
    user2: ref.user,
    url: {endsWith: ref.url.slice(ref.url.indexOf('/r/'))},
    or: exports.verifiableTypes.map(refType => ({type: refType}))
  }).then(otherRef => {
    var refsToSave = [];
    if (otherRef) {
      refsToSave.push(Reference.update({id: ref.id}).set({approved: approve, verified: approve}).fetch());
      refsToSave.push(Reference.update({id: otherRef.id}).set({approved: approve, verified: approve}));
    } else {
      refsToSave.push(Reference.update({id: ref.id}).set({approved: approve}).fetch());
    }
    return Promise.all(refsToSave).then(refs => refs[0]);
  });
};
exports.verifyIfNeeded = function (ref) {
  if (!exports.isVerifiable(ref)) {
    return Promise.resolve(ref);
  }
  return Reference.findOne({
    user: ref.user2,
    user2: ref.user,
    url: {endsWith: ref.url.slice(ref.url.indexOf('/r/'))},
    or: exports.verifiableTypes.map(refType => ({type: refType})),
    approved: true
  }).then(otherRef => {
    var refsToSave = [];
    if (otherRef) {
      refsToSave.push(Reference.update({id: ref.id}).set({approved: true, verified: true}).fetch());
      refsToSave.push(Reference.update({id: otherRef.id}).set({approved: true, verified: true}));
    } else {
      refsToSave.push(Reference.update({id: ref.id}).set({approved: true}).fetch());
    }
    return Promise.all(refsToSave).then(refs => refs[0]);
  });
};
exports.omitModOnlyProperties = function (ref) {
  return _.omit(ref, ['approved', 'verified', 'edited']);
};
exports.isApproved = function (el) {
  return el.approved;
};
exports.isTrade = function (el) {
  return exports.isEvent(el) || exports.isShiny(el) || exports.isCasual(el) || exports.isBank(el);
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
  return ['event', 'shiny', 'casual', 'bank', 'egg', 'giveaway', 'involvement', 'eggcheck'].indexOf(el.type) !== -1;
};
exports.verifiableTypes = ['casual', 'shiny', 'event', 'bank'];
exports.isVerifiable = function (el) {
  return exports.verifiableTypes.indexOf(el.type) !== -1;
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
