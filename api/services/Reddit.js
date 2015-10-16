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

/* If sails.config.debug.reddit is set to true, all modifying actions are redirected to sails.config.debug.subreddit. This prevents accidental damage 
to a live sub while debugging. This also makes the searchTSVThreads() function only return posts from sails.config.debug.subreddit. However, note that
removePost() will still remove any post sent to it, because it doesn't have a subreddit parameter. */

exports.refreshToken = function (refreshToken, callback, error) {
  var data = "client_secret=" + exports.data.clientIDSecret +
    "&client_id=" + exports.data.clientID +
    "&duration=permanent" +
    "&state=fapprefresh" +
    "&scope=identity" +
    "&grant_type=refresh_token" +
    "&refresh_token=" + refreshToken +
    "&redirect_uri=" + exports.data.redirectURL;
  var auth = "Basic " + new Buffer(exports.data.clientID + ":" + exports.data.clientIDSecret).toString("base64");

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

exports.getFlair = function (refreshToken, user, callback) {
  exports.refreshToken(refreshToken, function (token) {
    user = user || '';
    var body = {
      api_type: 'json',
      name: user
    };
    request.post({
      url: 'https://oauth.reddit.com/r/pokemontrades/api/flairselector',
      formData: body,
      json: true,
      headers: { Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"}
    }, function(err, response, body1){
      updateRateLimits(response);
      request.post({
        url: 'https://oauth.reddit.com/r/SVExchange/api/flairselector',
        formData: body,
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
  exports.refreshToken(refreshToken, function (token) {
    var data = {
      api_type: 'json',
      css_class: cssClass,
      name: name,
      text: text
    };
    if (left < 10 && moment().before(resetTime)) {
      return callback("Rate limited");
    }
    if (sails.config.debug.reddit) {
      sub = sails.config.debug.subreddit;
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
        } else if (!bodyJson.json || bodyJson.json.errors.length === 0) {
          callback(undefined, data.css_class);
        } else {
          callback(bodyJson.json.errors);
        }
      } catch(e) {
        console.log("Error with parsing: " + body);
      }
    });
  }, function () {
    console.log("Error retrieving token.");
    callback("Error retrieving token.");
  });
};
exports.banUser = function (refreshToken, username, ban_message, note, subreddit, duration, callback) {
  exports.refreshToken(refreshToken, function (token) {
    var data = {
      api_type: 'json',
      ban_message: ban_message,
      name: username,
      note: note,
      type: 'banned'
    };
    if (duration) {
      data.duration = duration;
    }
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    if (sails.config.debug.reddit) {
      subreddit = sails.config.debug.subreddit;
    }
    request.post({
      url: 'https://oauth.reddit.com/r/' + subreddit + '/api/friend',
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
        } else if (!bodyJson.json || bodyJson.json.errors.length === 0) {
          callback(undefined);
        } else {
          callback(bodyJson.json.errors);
        }
      } catch(banusererr) {
        console.log("Error with parsing: " + body);
      }
    });
  }, function () {
    console.log("Error retrieving token.");
    callback("Error retrieving token.");
  });
};

exports.getWikiPage = function (refreshToken, subreddit, page, callback) {
  exports.refreshToken(refreshToken, function (token) {
    var data = {
      page: page
    };
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    request.get({
      url: 'https://oauth.reddit.com/r/' + subreddit + '/wiki/' + page + '?raw_json=1',
      formData: data,
      headers: {
        Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"
      }
    }, function(err, response, body){
      updateRateLimits(response);
        var bodyJson;
        try {
          bodyJson = JSON.parse(body);
        }
        catch (getwikipageerror) {
          console.log("Error with parsing: " + body);
        }
        if (bodyJson.error) {
          callback(bodyJson.error,bodyJson,subreddit);
        } else if (!bodyJson.json || !bodyJson.json.errors || bodyJson.json.errors.length === 0) {
          callback(undefined,bodyJson,subreddit);
        } else {
          callback(bodyJson.json.errors,bodyJson,subreddit);
        }
    });
  }, function () {
    console.log("Error retrieving token.");
    callback("Error retrieving token.");
  });
};

exports.editWikiPage = function (refreshToken, subreddit, page, content, reason, callback) {
  exports.refreshToken(refreshToken, function (token) {
    var data = {
      content: content,
      page: page,
      reason: reason
    };
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    if (sails.config.debug.reddit) {
      subreddit = sails.config.debug.subreddit;
    }
    request.post({
      url: 'https://oauth.reddit.com/r/' + subreddit + '/api/wiki/edit',
      formData: data,
      headers: {
        Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"
      }
    }, function(err, response, body){
      updateRateLimits(response);
        var bodyJson;
        try {
          bodyJson = JSON.parse(body);
        }
        catch (editwikipageerror) {
          console.log("Error with parsing: " + body);
        }
        if (bodyJson.reason) {
          callback(bodyJson.reason, bodyJson);
        } else if (!bodyJson.json || !bodyJson.json.errors || bodyJson.json.errors.length === 0) {
          callback(undefined, bodyJson);
        } else {
          callback(bodyJson.json.errors, bodyJson);
        }
    });
  }, function () {
    console.log("Error retrieving token.");
    callback("Error retrieving token.");
  });
};

exports.searchTSVThreads = function (refreshToken, username, callback) {
  exports.refreshToken(refreshToken, function (token) {
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    var sub = 'SVExchange';
    if (sails.config.debug.reddit) {
      sub = sails.config.debug.subreddit;
    }
    request.get({
      url: 'https://oauth.reddit.com/r/' + sub + '/search?q=flair%3Ashiny+AND+author%3A' + username + '&restrict_sr=on&sort=new&t=all',
      headers: {
        Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"
      }
    }, function(err, response, body){
      updateRateLimits(response);
        var bodyJson;
        try {
          bodyJson = JSON.parse(body);
        } catch (tsvsearcherr) {
          console.log("Error with parsing: " + body);
        }
          if (bodyJson.error) {
            callback(bodyJson.error);
          } else if (!bodyJson.json || bodyJson.json.errors.length === 0) {
            callback(undefined,bodyJson);
          } else {
            callback(bodyJson.json.errors,bodyJson);
          }
    });
  }, function () {
    console.log("Error retrieving token.");
    callback("Error retrieving token.");
  });
};

exports.removePost = function (refreshToken, id, spam, callback) {
  exports.refreshToken(refreshToken, function (token) {
    var data = {
      id: 't3_' + id,
      spam: spam
    };
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    request.post({
      url: 'https://oauth.reddit.com/api/remove',
      formData: data,
      headers: {
        Authorization: "bearer " + token,
        "User-Agent": "fapp/1.0"
      }
    }, function(err, response, body){
      updateRateLimits(response);
      var bodyJson;
      try {
        bodyJson = JSON.parse(body);
      }
      catch (removeposterr) {
        console.log("Error with parsing: " + body);
      }
      if (bodyJson.error) {
        callback(bodyJson.error,bodyJson);
      } else if (!bodyJson.json || bodyJson.json.errors.length === 0) {
        callback(undefined,bodyJson);
      } else {
        callback(bodyJson.json.errors,bodyJson);
      }
    });
  }, function () {
    console.log("Error retrieving token.");
    callback("Error retrieving token.");
  });
};

exports.sendPrivateMessage = function (refreshToken, subject, text, recipient, callback) {
  exports.refreshToken(refreshToken, function (token) {
    var data = {
      api_type: 'json',
      subject: subject,
      text: text,
      to: recipient
    };
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    if (sails.config.debug.reddit && recipient.substring(0,3) === "/r/") {
      data.to = '/r/' + sails.config.debug.subreddit;
    }
    request.post({
      url: 'https://oauth.reddit.com/api/compose',
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
        } else if (!bodyJson.json || bodyJson.json.errors.length === 0) {
          callback(undefined);
        } else {
          callback(bodyJson.json.errors);
        }
      } catch(sendpmerr) {
        console.log("Error with parsing: " + body);
      }
    });
  }, function () {
    console.log("Error retrieving token.");
    callback("Error retrieving token.");
  });
};

var updateRateLimits = function (res) {
  if (res.headers['x-ratelimit-remaining'] && res.headers['x-ratelimit-reset']) {
    left = res.headers['x-ratelimit-remaining'];
    resetTime = moment().add(res.headers['x-ratelimit-reset'], "seconds");
  }
};
