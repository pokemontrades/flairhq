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
  var user = await User.findOne(username);
  if (!user) {
    throw {statusCode: 404};
  }
  var promises = [];

  promises.push(Game.find({user: user.name}).sort({createdAt: 'desc'}).then(function (result) {
    user.games = result;
  }));

  promises.push(Comment.find({user: user.name}).sort({createdAt: 'desc'}).then(function (result) {
    user.comments = result;
  }));

  if (Users.hasModPermission(requester, 'posts') && Users.hasModPermission(requester, 'wiki')) {
    promises.push(ModNote.find({refUser: user.name}).sort({createdAt: 'desc'}).then(function (result) {
      user.modNotes = result;
    }));
  }

  if (requester && requester.name === user.name) {
    promises.push(Flairs.getApps(user.name).then(function (result) {
      user.apps = result;
    }));
  }

  promises.push(Reference.find({user: user.name}).sort({type: 'asc', createdAt: 'desc'}).then(function (result) {
    result.forEach(function (ref) {
      if (!requester || requester.name !== user.name) {
        ref.privatenotes = undefined;
      }
      if (!Users.hasModPermission(requester, 'flair')) {
        ref.approved = undefined;
        ref.verified = undefined;
      }
    });
    user.references = result;
  }));
  await* promises;
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
