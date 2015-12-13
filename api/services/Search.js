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
    user = searchData.user,
    types = searchData.categories;

  if (types) {
    appData.type = types;
  }
  tempOrData.push({description: {'contains': keyword}});
  tempOrData.push({gave: {'contains': keyword}});
  tempOrData.push({got: {'contains': keyword}});

  User.find({name: {contains: user}}).exec(function (err, users) {
    if (!user) {
      orData = tempOrData;
      orData.push({user2: {'contains': keyword}});
    } else if (!users || users.length === 0) {
      orData = tempOrData;
      appData.user2 = {'contains': user};
    } else {
      var usernames = [];
      users.forEach(function (user) {
        usernames.push(user.name);
      });
      tempOrData.forEach(function (elUser1) {
        var elUser2 = _.cloneDeep(elUser1);
        elUser1.user = usernames;
        orData.push(elUser1);
        elUser2.user2 = {'contains': user};
        orData.push(elUser2);
      });
    }

    appData.or = orData;

    Reference.find(appData).exec(function (err, apps) {
      async.map(apps, function (ref, callback) {
        User.findOne({name: ref.user}).exec(function (err, refUser) {
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
      {"user": {'contains': searchData.keyword}},
      {"type": {'contains': searchData.keyword}}
    ]
  };

  Event.find(appData).exec(function (err, apps) {
    cb(apps);
  });
};

module.exports.users = function (searchData, cb) {
  var data = {
    "$or": [
      {
        "_id": {
          "$regex": "(?i)" + searchData.keyword
        }
      },
      {
        "flair.ptrades.flair_text": {
          "$regex": "(?i)" + searchData.keyword
        }
      },
      {
        "flair.svex.flair_text": {
          "$regex": "(?i)" + searchData.keyword
        }
      }
    ]
  };

  // We can't do deep searching on the flair using waterline, so let's use mongo natively
  // I guess this means we can't use any other databases in the future anymore. Ach well.
  User.native(function (err, collection) {
    collection.find(data)
      .limit(20)
      .skip(0)
      .toArray(function (err, results) {
        cb(results);
      });
  });
};

module.exports.modmails = function (searchData, cb) {
  var words = searchData.keyword.split(' ');
  var fields = ['body', 'author', 'subject'];
  var requirements = [];
  for (let i = 0; i < words.length; i++) {
    var current_req = {'$or': []};
    for (let j = 0; j < fields.length; j++) {
      let obj = {};
      obj[fields[j]] = {'$regex': words[i], '$options': 'i'};
      current_req['$or'].push(obj);
    }
    requirements.push(current_req);
  }
  //Finds modmails where all of the words in the search query appear somewhere in either the body, subject, or author.
  var mailData = {'$and': requirements};
  Modmail.native(function (err, collection) {
    collection.find(mailData).sort({created_utc: -1}).skip(searchData.skip ? parseInt(searchData.skip) : 0).limit(20).toArray().then(function (mail) {
      mail.forEach(function (message) {
        message.name = message._id;
        delete message._id;
      });
      cb(mail);
    });
  });
};
