var http = require("http");

module.exports = function(req, res, next){
  http.get("http://www.reddit.com/r/pokemontrades/about/moderators.json?user=" + req.user.name, function (res) {
    res.setEncoding("utf8");
    res.on("data", function (body) {
      if (JSON.parse(body).data.children.length === 1) {
        req.user.isMod = true;
      }
      return next();
    });
  });
};
