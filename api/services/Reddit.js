var request = require("request"),
  moment = require('moment'),
  left = 600,
  resetTime = moment().add(600, "seconds"),
  userAgent = "Webpage:hq.porygon.co:v" + sails.config.version;

exports.refreshToken = function (refreshToken, error, callback) {
  var data = "grant_type=refresh_token&refresh_token=" + refreshToken;
  var auth = "Basic " + new Buffer(sails.config.reddit.clientID + ":" + sails.config.reddit.clientIDSecret).toString("base64");
  request.post({
    url: 'https://www.reddit.com/api/v1/access_token',
    body: data,
    json: true,
    headers: {
      "Authorization": auth,
      "User-Agent": userAgent,
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

var makeRequest = function (refreshToken, requestType, url, data, rateLimitRemainingThreshold, callback) {
  exports.refreshToken(refreshToken, callback, function (token) {
    if (left < rateLimitRemainingThreshold && moment().before(resetTime)) {
      return callback("Rate limited");
    }
    var parseResponse = function (err, response, body) {
      updateRateLimits(response);
      var bodyJson;
      try {
        bodyJson = JSON.parse(body);
      } catch (error) {
        console.log("Error with parsing: " + body);
        return callback("Error with parsing: " + body);
      }
      var callback_error;
      if (err) {
        console.log(err);
        callback_error = err;
      } else if (response.statusCode != 200) {
        console.log('Reddit error: ' + requestType + ' request sent to ' + url + ' returned ' + response.statusCode +
        ' - ' + response.statusMessage + '.\nResponse body: ' + JSON.stringify(bodyJson) + '\nForm data sent: ' + JSON.stringify(data));
        callback_error = response.statusMessage;
      }
      callback(callback_error, bodyJson);
    };
    var headers = {Authorization: "bearer " + token, "User-Agent": userAgent};
    if (requestType === 'POST') {
      request.post({url: url, formData: data, headers: headers}, parseResponse);
    } else if (requestType === 'GET') {
      request.get({url: url, headers: headers}, parseResponse);
    } else {
      callback('Invalid makeRequest() call');
    }
  });
};

exports.getFlair = function (refreshToken, user, subreddit, callback) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/api/flairselector';
  var data = {name: user};
  makeRequest(refreshToken, 'POST', url, data, 20, callback);
};

exports.getBothFlairs = function (refreshToken, user, callback) {
  var ptradesFlairPromise = new Promise(function (resolve, reject) {
    exports.getFlair(refreshToken, user, 'pokemontrades', function(err, flair) {
      if (err) {
        reject(err);
      } else {
        resolve(flair);
      }
    });
  });
  var svexFlairPromise = new Promise(function (resolve, reject) {
    exports.getFlair(refreshToken, user, 'SVExchange', function(err, flair) {
      if (err) {
        reject(err);
      } else {
        resolve(flair);
      }
    });
  });
  Promise.all([ptradesFlairPromise, svexFlairPromise]).then(function (results) {
    callback(undefined, results[0].current, results[1].current);
  }, function (error) {
    callback(error);
  });
};

exports.setFlair = function (refreshToken, name, cssClass, text, subreddit, callback) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : subreddit;
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/api/flair';
  var data = {api_type: 'json', css_class: cssClass, name: name, text: text};
  makeRequest(refreshToken, 'POST', url, data, 5, callback);
};

exports.banUser = function (refreshToken, username, ban_message, note, subreddit, duration, callback) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : subreddit;
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/api/friend';
  var data = {api_type: 'json', ban_message: ban_message, duration: (duration ? duration : 'undefined'), name: username, note: note, type: 'banned'};
  makeRequest(refreshToken, 'POST', url, data, 5, callback);
};

exports.getWikiPage = function (refreshToken, subreddit, page, callback) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/wiki/' + page + '?raw_json=1';
  makeRequest(refreshToken, 'GET', url, undefined, 5, callback);
};

exports.editWikiPage = function (refreshToken, subreddit, page, content, reason, callback) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : subreddit;
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/api/wiki/edit';
  var data = {content: content, page: page, reason: reason};
  makeRequest(refreshToken, 'POST', url, data, 5, callback);
};

exports.searchTSVThreads = function (refreshToken, username, callback) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : 'SVExchange';
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/search?q=flair%3Ashiny+AND+author%3A' + username + '&restrict_sr=on&sort=new&t=all';
  makeRequest(refreshToken, 'GET', url, undefined, 15, callback);
};

exports.removePost = function (refreshToken, id, isSpam, callback) {
  var url = 'https://oauth.reddit.com/api/remove';
  var data = {id: 't3_' + id, spam: isSpam};
  makeRequest(refreshToken, 'POST', url, data, 5, callback);
};

exports.sendPrivateMessage = function (refreshToken, subject, text, recipient, callback) {
  var url = 'https://oauth.reddit.com/api/compose';
  var data = {api_type: 'json', subject: subject, text: text, to: recipient};
  makeRequest(refreshToken, 'POST', url, data, 25, callback);
};

exports.checkModeratorStatus = function (refreshToken, username, subreddit, callback) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/about/moderators?user=' + username;
  makeRequest(refreshToken, 'GET', url, undefined, 5, callback);
};

var updateRateLimits = function (res) {
  if (res.headers && res.headers['x-ratelimit-remaining'] && res.headers['x-ratelimit-reset']) {
    left = res.headers['x-ratelimit-remaining'];
    resetTime = moment().add(res.headers['x-ratelimit-reset'], "seconds");
  }
};
