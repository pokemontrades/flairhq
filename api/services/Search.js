/* global Reference, User */

exports.quick = function (searchData, cb) {
  var appData = {
    limit: 20,
    sort: "createdAt DESC"
  };
  var orData = [];

  if (searchData.description) {
    orData.push({description: {'contains': searchData.description}});
    orData.push({gave: {'contains': searchData.description}});
    orData.push({got: {'contains': searchData.description}});
  }

  if (searchData.user && searchData.user === searchData.description) {
    orData.push({user2: {'contains': searchData.user}});
  } else if (searchData.user) {
    appData.user2 = {'contains': searchData.user};
  }

  if (searchData.categories) {
    appData.type = searchData.categories;
  }

  if (orData) {
    appData.or = orData;
  }

  console.log(appData);
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