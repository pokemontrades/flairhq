var http = require("http");

module.exports = function(req, res, next){
  if (!req.user) {
    return next();
  }
  http.get("http://www.reddit.com/r/pokemontrades/about/moderators.json?user=" + req.user.name, function (res) {
    res.setEncoding("utf8");
    res.on("data", function (body) {
      try {
        if (JSON.parse(body).data.children.length === 1) {
          req.user.isMod = true;
        }
return next();
      } catch(err) {
        console.log("Error getting if " + req.user.name + " is a moderator.");
        console.log("response: " + body);
return next();
      }
      
    });
  });
};
