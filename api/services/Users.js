'use strict';

const _ = require('lodash');
var yaml = require('js-yaml');

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

  if (Users.hasModPermission(requester, 'access')) {
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


exports.checkAutomod = async function(subreddit, user, FCs) {

  var returnMessage = "";


  var automodText = await Reddit.getWikiPage(sails.config.reddit.adminRefreshToken, subreddit, 'config/automoderator');

  var splittedText = automodText.split("---\r\n");
  var rulesConverted = new Array();

  splittedText.forEach(function(rule) {

    var convertedRule = yaml.safeLoad(rule);
    if (convertedRule instanceof Object) { // skips all the commented rules
      try {
        var firstComment = rule.match(' *#.*')[0].toString().replace("#", "").trim();
      } catch (e) {
        firstComment = null;
      }
      if (firstComment) {
        convertedRule.firstComment = firstComment;
      }
    }
    rulesConverted.push(convertedRule);
  });

  FCs.forEach(function(FC) {
    rulesConverted.forEach(function(rule) {

      for (var name in rule) {

        var property = rule[name];

        // for cases where 'author' is array of nicknames
        if (name.includes("author") && !(name.includes("~author")) && (Array.isArray(rule[name]))) {

          if (property.includes(user)) {
            returnMessage += ("User " + user + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
          }
        }

        // for author with additional properties
        if (name.includes("author") && !(name.includes("~author")) && rule[name] instanceof Object) {
          for (var propName in property) {
            if (propName.includes("name") && !(propName.includes("~name"))) {
              if (property[propName].includes(user)) {
                returnMessage += ("User " + user + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
              }
            }

            if (propName.includes("flair_text") && !(propName.includes("~flair_text"))) {
              if ((rule.author['~name'] && (!(rule.author['~name'].includes(user)))) || !(rule.author['~name'])) {
                if (FC) {
                  if (propName.includes("regex")) {

                    if (FC.match(property[propName][0])) {
                      returnMessage += ("FC " + FC + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
                    }
                  } else {
                    if (property[propName].includes(FC)) {
                      returnMessage += ("FC " + FC + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
                    }
                  }

                }

              }

            }


          }

        }

        // title and/or body regex checking
        if (name.includes("title") || (name.includes("body"))) {


          if (FC) {
            var expression = "";
            if (typeof property === "string") {
              expression = property;
            } else {
              expression = property[0];
            }
            if (FC.match(expression)) {
              returnMessage += ("FC " + FC + " found in " + ((rule.action_reason) ? rule.action_reason : rule.firstComment) + "\n\n");
            }
          }
        }


      }
    });
  });
  return returnMessage;

};
