//
var request = require("request"),
  moment = require('moment'),
  left = 600,
  resetTime = moment().add(600, "seconds");

exports.data = {
  clientID: sails.config.reddit.clientID,
  clientIDSecret: sails.config.reddit.clientIDSecret,
  redirectURL: sails.config.reddit.redirectURL,
  adminRefreshToken: sails.config.reddit.adminRefreshToken
};

exports.refreshToken = function (refreshToken, callback, error) {
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
    if (body && body.access_token) {
      callback(body.access_token);
    } else {
      error();
    }
  });
};

exports.getFlair = function (refreshToken, callback) {
  exports.refreshToken(refreshToken, function (token) {
    var body = {
      api_type: 'json'
    };

    if (left < 100 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }

    request.post({
      url: 'https://oauth.reddit.com/r/pokemontrades/api/flairselector',
      body: body,
      json: true,
      headers: { Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"}
    }, function(err, response, body1){
      updateRateLimits(response);
      request.post({
        url: 'https://oauth.reddit.com/r/SVExchange/api/flairselector',
        body: body,
        json: true,
        headers: { Authorization: "bearer " + token,
          "User-Agent": "fapp/1.0"}
      }, function(err, response, body2){
        updateRateLimits(response);
        if (body1 && body2) {
          callback(undefined, body1.current, body2.current);
        } else if (body1 && !body2) {
          callback(undefined, body1.current);
        } else if (!body1 && body2) {
          callback(undefined, undefined, body2.current);
        }
      });
    });
  }, function () {
    console.log("Error retrieving token.");
  });
};

exports.setFlair = function (refreshToken, name, cssClass, text, sub, callback) {
  exports.refreshToken(exports.data.adminRefreshToken, function (token) {
    var data = {
      api_type: 'json',
      css_class: cssClass,
      text: text,
      name: name
    };

    if (left < 10 && moment().before(resetTime)) {
      return callback("Rate limited");
    }

    request.post({
      url: 'https://oauth.reddit.com/r/' + sub + '/api/flair',
      formData: data,
      headers: {
        Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"
      }
    }, function(err, response, body){
      updateRateLimits(response);
      try {
        var bodyJson = JSON.parse(body);
        if (bodyJson.error) {
          callback(bodyJson.error);
        } else if (bodyJson.json.errors.length === 0) {
          callback(undefined, data.css_class);
        } else {
          callback(bodyJson.json.errors);
        }
      } catch(err) {
        console.log("Error with parsing: " + body);
      }
    });
  }, function () {
    console.log("Error retrieving token.");
    callback("Error retrieving token.");
  });
};

var updateRateLimits = function (res) {
  if (res && res.headers && res.headers['x-ratelimit-remaining'] && res.headers['x-ratelimit-reset']) {
    left = res.headers['x-ratelimit-remaining'];
    resetTime = moment().add(res.headers['x-ratelimit-reset'], "seconds");
  }
};