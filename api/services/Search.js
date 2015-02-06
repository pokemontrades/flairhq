/* global Reference, User */

exports.quick = function (searchData, cb) {
  var appData = {
    limit: 20
  };
  var orData = [];

  if (searchData.description) {
    orData.push({description: {'contains': searchData.description}});
    orData.push({gave: {'contains': searchData.description}});
    orData.push({got: {'contains': searchData.description}});
  }

  if (searchData.user) {
    orData.push({user2: {'contains': searchData.user}});
  }

  if (searchData.categories) {
    appData.type = searchData.categories;
  }

  if (orData) {
    appData.or = orData;
  }

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
};