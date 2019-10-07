'use strict';

const _ = require('lodash');

var removeSecretInformation = function (user) {
  user.redToken = undefined;
  user.loggedFriendCodes = undefined;
  if (user.apps) {
    user.apps.forEach(function (app) {
      app.claimedBy = undefined;
    });
  }
  return user;
};

exports.get = async function (requester, username) {
  var user = await User.findOne(username).catch((err) => sails.log.warn(`There was an error fetching ${username}`));
  if (!user) {
    throw {statusCode: 404};
  }
  var promises = [];

  promises.push(Game.find({user: user.id}).sort('createdAt DESC').then(function (result) {
    user.games = result;
  }));

  promises.push(Comment.find({user: user.id}).sort('createdAt DESC').then(function (result) {
    user.comments = result;
  }));

  if (Users.hasModPermission(requester, 'posts') && Users.hasModPermission(requester, 'wiki')) {
    promises.push(ModNote.find({refUser: user.id}).sort('createdAt DESC').then(function (result) {
      user.modNotes = result;
    }));
  }

  if (requester && requester.id === user.id) {
    promises.push(Flairs.getApps(user.id).then(function (result) {
      user.apps = result;
    }));
  }

  promises.push(Reference.find({user: user.id}).sort([{type: 'asc'}, {createdAt: 'desc'}]).then(function (result) {
    result.forEach(function (ref) {
      if (!requester || requester.id !== user.id) {
        ref.privatenotes = undefined;
      }
      if (!Users.hasModPermission(requester, 'flair')) {
        ref.approved = undefined;
        ref.verified = undefined;
      }
    });
    user.references = result;
  }));
  await Promise.all(promises);
  return removeSecretInformation(user);
};

// Returns a promise for all banned users
exports.getBannedUsers = function () {
  return User.find({banned: true}).then(function (results) {
    return results.map(removeSecretInformation);
  });
};

exports.hasModPermission = (user, modPermission) => {
  return user && user.isMod && user.modPermissions && (_.includes(user.modPermissions, 'all') || _.includes(user.modPermissions, modPermission));
};
