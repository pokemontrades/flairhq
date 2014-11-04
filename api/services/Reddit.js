//
var request = require("request");

exports.data = {
  clientID: sails.config.reddit.clientID,
  clientIDSecret: sails.config.reddit.clientIDSecret,
  redirectURL: sails.config.reddit.redirectURL
};

exports.refreshToken = function (refreshToken, callback) {
  var data = "client_secret=" + exports.data.clientIDSecret
    + "&client_id=" + exports.data.clientID
    + "&duration=permanent"
    + "&state=fapprefresh"
    + "&scope=identity"
    + "&grant_type=refresh_token"
    + "&refresh_token=" + refreshToken
    + "&redirect_uri=" + exports.data.redirectURL;
  var auth = "Basic "
    + new Buffer(exports.data.clientID + ":" + exports.data.clientIDSecret)
      .toString("base64");

  request.post({
    url: 'https://ssl.reddit.com/api/v1/access_token',
    body: data,
    json: true,
    headers: {
      "Authorization": auth,
      "User-Agent": "fapp/1.0",
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": data.length
    }
  }, function(err, response, body){
    callback(body.access_token);
  });
};

exports.getFlair = function (refreshToken, callback) {
  exports.refreshToken(refreshToken, function (token) {
    var body = {
      api_type: 'json'
    };

    request.post({
      url: 'https://oauth.reddit.com/r/pokemontrades/api/flairselector',
      body: body,
      json: true,
      headers: { Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"}
    }, function(err, response, body1){
      request.post({
        url: 'https://oauth.reddit.com/r/SVExchange/api/flairselector',
        body: body,
        json: true,
        headers: { Authorization: "bearer " + token,
          "User-Agent": "fapp/1.0"}
      }, function(err, response, body2){
        if (body1 && body2) {
          callback(body1.current, body2.current);
        } else if (body1 && !body2) {
          callback(body1.current);
        } else if (!body1 && body2) {
          callback(undefined, body2.current);
        }
      });
    });
  });
};

exports.setFlair = function (refreshToken, name, cssClass, text, sub, callback) {
  exports.refreshToken(refreshToken, function (token) {
    var data = {
      api_type: 'json',
      css_class: cssClass,
      text: text,
      name: name
    };

    request.post({
      url: 'https://oauth.reddit.com/r/' + sub + '/api/flair',
      formData: data,
      headers: {
        Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"
      }
    }, function(err, response, body){
      var bodyJson = JSON.parse(body);
      if (bodyJson.error) {
        callback(bodyJson.error);
      } else if (bodyJson.json.errors.length === 0) {
        callback(undefined, data.css_class);
      } else {
        callback(bodyJson.json.errors);
      }
    });
  });
};