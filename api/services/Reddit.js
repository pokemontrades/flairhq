//
var request = require("request"),
  moment = require('moment'),
  left = 600,
  resetTime = moment().add(600, "seconds");

exports.data = {
  clientID: sails.config.reddit.clientID,
  clientIDSecret: sails.config.reddit.clientIDSecret,
  redirectURL: sails.config.reddit.redirectURL,
  adminRefreshToken: sails.config.reddit.adminRefreshToken,
  userAgent: "Webpage:hq.porygon.co:v" + sails.config.version;
};

/* If sails.config.debug.reddit is set to true, all modifying actions are redirected to sails.config.debug.subreddit. This prevents accidental damage 
to a live sub while debugging. This also makes the searchTSVThreads() function only return posts from sails.config.debug.subreddit. However, note that
removePost() will still remove any post sent to it, because it doesn't have a subreddit parameter. */

exports.refreshToken = function (refreshToken, error, callback) {
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
      "User-Agent": exports.data.userAgent,
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": data.length
    }
  }, function(err, response, body){
    if (body && body.access_token) {
      callback(body.access_token);
    } else {
      console.log("Error retrieving token.");
      error("Error retrieving token");
    }
  });
};

var createHeaders = function (token) {
  return {Authorization: "bearer " + token, "User-Agent": exports.data.userAgent};
};

var parseResponse = function (err, response, body, callback) {
  updateRateLimits(response);
  var bodyJson;
  try {
    bodyJson = JSON.parse(body);
  }
  catch (error) {
    console.log("Error with parsing: " + body);
    callback("Error with parsing: " + body);
    return;
  }
  callback(err, bodyJson)
};

exports.getFlair = function (refreshToken, user, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
    user = user || '';
    var body = {
      name: user
    };
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited");
    }
    var url1 = 'https://oauth.reddit.com/r/pokemontrades/api/flairselector',
      url2 = 'https://oauth.reddit.com/r/SVExchange/api/flairselector';
    request.post(
      {url: url1, formData: body, headers: createHeaders(token)},
      function (err, response, body1) {
        updateRateLimits(response);
        request.post(
          {url: url2, formData: body, headers: createHeaders(token)},
          function (err, response, body2){
            updateRateLimits(response);
            if (body1 && body2) {
              callback(err, body1.current, body2.current);
            } else if (body1 && !body2) {
              callback(err, body1.current);
            } else if (!body1 && body2) {
              callback(err, undefined, body2.current);
            }
        });
    });
  });
};

exports.setFlair = function (refreshToken, name, cssClass, text, sub, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
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
    var url = 'https://oauth.reddit.com/r/' + sub + '/api/flair';
    request.post(
      {url: url, formData: data, headers: createHeaders(token)},
      function(err, response, body){
        parseResponse(err, response, body, callback);
    });
  });
};
exports.banUser = function (refreshToken, username, ban_message, note, subreddit, duration, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
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
    var url = 'https://oauth.reddit.com/r/' + subreddit + '/api/friend';
    request.post(
      {url: url, formData: data, headers: createHeaders(token)},
      function(err, response, body){
        parseResponse(err, response, body, callback);
    });
  });
};

exports.getWikiPage = function (refreshToken, subreddit, page, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    var url = 'https://oauth.reddit.com/r/' + subreddit + '/wiki/' + page + '?raw_json=1';
    request.get(
      {url: url, headers: createHeaders(token)},
      function(err, response, body){
        parseResponse(err, response, body, callback);
    });
  });
};

exports.editWikiPage = function (refreshToken, subreddit, page, content, reason, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
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
    var url = 'https://oauth.reddit.com/r/' + subreddit + '/api/wiki/edit';
    request.post(
      {url: url, formData: data, headers: createHeaders(token)},
      function(err, response, body){
        parseResponse(err, response, body, callback);
    });
  });
};

exports.searchTSVThreads = function (refreshToken, username, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    var sub = 'SVExchange';
    if (sails.config.debug.reddit) {
      sub = sails.config.debug.subreddit;
    }
    var url = 'https://oauth.reddit.com/r/' + sub + '/search?q=flair%3Ashiny+AND+author%3A' + username + '&restrict_sr=on&sort=new&t=all';
    request.get(
      {url: url, headers: createHeaders(token)},
      function(err, response, body){
        parseResponse(err, response, body, callback);
    });
  });
};

exports.removePost = function (refreshToken, id, spam, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
    var data = {
      id: 't3_' + id,
      spam: spam
    };
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    var url = 'https://oauth.reddit.com/api/remove';
    request.post(
      {url: url, formData: data, headers: createHeaders(token)},
      function(err, response, body){
        parseResponse(err, response, body, callback);
    });
  });
};

exports.sendPrivateMessage = function (refreshToken, subject, text, recipient, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
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
    var url = 'https://oauth.reddit.com/api/compose';
    request.post(
      {url: url, formData: data, headers: createHeaders(token)},
      function(err, response, body){
        parseResponse(err, response, body, callback);
    });
  });
};

exports.checkModeratorStatus = function (refreshToken, username, subreddit, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
    if (left < 25 && moment().before(resetTime)) {
      return callback("Rate limited.");
    }
    if (subreddit.substring(0,3) === '/r/') {
      subreddit = subreddit.substring(3);
    } else if (subreddit.substring(0,2) === 'r/') {
      subreddit = subreddit.substring(2);
    }
    var url = 'https://oauth.reddit.com/r/' + subreddit + '/about/moderators?user=' + username;
    request.get(
      {url: url, headers: createHeaders(token)},
      function(err, response, body){
        parseResponse(err, response, body, callback);
    });
  });
};

var updateRateLimits = function (res) {
  if (res.headers['x-ratelimit-remaining'] && res.headers['x-ratelimit-reset']) {
    left = res.headers['x-ratelimit-remaining'];
    resetTime = moment().add(res.headers['x-ratelimit-reset'], "seconds");
  }
};
