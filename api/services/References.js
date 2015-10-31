exports.approve = function (ref, approve) {
  return new Promise(function (resolve, reject) {
    ref.approved = approve;
    ref.save(function (err) {
      if (err) {
        return reject({statusCode: 500});
      }
      return resolve({statusCode: 200});
    });
    if (ref.type === 'casual' || ref.type === 'shiny' || ref.type === 'event') {
      var query = {
        user: ref.user2.slice(3),
        url: {endsWith: ref.url.substring(ref.url.indexOf("/r/"))},
        user2: '/u/' + ref.user,
        or: [
          {type: 'casual'},
          {type: 'shiny'},
          {type: 'event'}
        ],
      };
      Reference.findOne(query, function (err, otherRef) {
        if (otherRef) {
          otherRef.approved = approve;
          ref.verified = approve;
          otherRef.verified = approve;
          ref.save(function (err) {});
          otherRef.save(function (err) {});
        }
      });
    }
  });
};