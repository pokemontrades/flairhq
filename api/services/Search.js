/* global Reference, User */

var _ = require('lodash');
var async = require('async');

module.exports.refs = function (searchData, cb) {
  var appData = {
      limit: 20,
      sort: "createdAt DESC",
      skip: searchData.skip || 0
    },
    orData = [],
    tempOrData = [],
    keyword = searchData.description,
    userName = searchData.user,
    types = searchData.categories;

  if (types) {
    appData.type = types;
  }

  tempOrData.push({description: {'contains': keyword}});
  tempOrData.push({gave: {'contains': keyword}});
  tempOrData.push({got: {'contains': keyword}});

  User.find({name: {contains: userName}}).exec(function (err, users) {
    if (!userName) {
      orData = tempOrData;
      orData.push({user2: {'contains': keyword}});
    } else if (!users || users.length === 0) {
      orData = tempOrData;
      appData.user2 = {'contains': userName};
    } else {
      var userIds = [];
      users.forEach(function (user) {
        userIds.push(user.id);
      });
      tempOrData.forEach(function (elUser1) {
        var elUser2 = _.cloneDeep(elUser1);
        elUser1.user = userIds;
        orData.push(elUser1);
        elUser2.user2 = {'contains': userName};
        orData.push(elUser2);
      });
    }

    appData.or = orData;

    Reference.find(appData).exec(function (err, apps) {
      async.map(apps, function (ref, callback) {
        User.findOne({id: ref.user}).exec(function (err, refUser) {
          if (refUser) {
            ref.user = refUser.name;
            callback(null, ref);
          } else {
            callback();
          }
        });
      }, function (err, results) {
        cb(results);
      });
    });
  });
};

module.exports.logs = function (searchData, cb) {
  var appData = {
      "limit": 20,
      "sort": "createdAt DESC",
      "skip": searchData.skip || 0,
      "or": [
        {"content": {'contains': searchData.keyword}},
        {"userName": {'contains': searchData.keyword}},
        {"type": {'contains': searchData.keyword}}
      ]
    };

  Event.find(appData).exec(function (err, apps) {
    cb(apps);
  });
};