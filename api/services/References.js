exports.approve = function (ref, name, approve) {
  return new Promise(function (resolve, reject) {
    if (!ref) {
      return reject({statusCode: 404});
    }
    ref.approved = approve;
    ref.save(function (err) {
      if (err) {
        return reject({statusCode: 500});
      }
      return resolve({statusCode: 200});
    });
    if (ref.type === 'casual' || ref.type === 'shiny' || ref.type === 'event') {
      User.findOne({name: ref.user2.substring(3)}, function(err, otherUser) {
        if (!otherUser) {
          return;
        }
        var query = {
          user: otherUser.id,
          url: new RegExp(ref.url.substring(ref.url.indexOf("/r/"))),
          user2: '/u/' + name,
          $or: [
            {type: 'casual'},
            {type: 'shiny'},
            {type: 'event'}
          ],
        };
        Reference.findOne(query, function (err, otherRef) {
          if (!otherRef) {
            return;
          }
          otherRef.approved = approve;
          ref.verified = approve;
          otherRef.verified = approve;
          ref.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
          otherRef.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
        });
      });
    }
  });
};