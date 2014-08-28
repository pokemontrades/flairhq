var reddit = require('redwrap');


module.exports = {

  user: function (req, res) {
    
    reddit.user(req.params.userid, function (err, data, re) {
      res.json(data, 200);
    });
  }
};

