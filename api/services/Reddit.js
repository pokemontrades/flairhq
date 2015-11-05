var request = require("request"),
  moment = require('moment'),
  left = 600,
  resetTime = moment().add(600, "seconds"),
  userAgent = "Webpage:hq.porygon.co:v" + sails.config.version;

exports.refreshToken = async function(refreshToken) {
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
      return body.access_token;
    } else {
      console.log("Error retrieving token.");
      throw "Error retrieving token";
    }
  });
};

var makeRequest = async function (refreshToken, requestType, url, data, rateLimitRemainingThreshold) {
  var token = await exports.refreshToken(refreshToken);
  if (left < rateLimitRemainingThreshold && moment().before(resetTime)) {
    throw "Rate limited";
  }
  var parseResponse = function (err, response, body) {
    updateRateLimits(response);
    var bodyJson;
    try {
      bodyJson = JSON.parse(body);
    } catch (error) {
      console.log("Error with parsing: " + body);
      throw "Error with parsing: " + body;
    }

    if (err) {
      console.log(err);
      throw err;
    } else if (response.statusCode != 200) {
      console.log('Reddit error: ' + requestType + ' request sent to ' + url + ' returned ' + response.statusCode +
      ' - ' + response.statusMessage + '.\nResponse body: ' + JSON.stringify(bodyJson) + '\nForm data sent: ' + JSON.stringify(data));
      throw response.statusMessage;
    }
    return bodyJson;
  };

  var headers = {Authorization: "bearer " + token, "User-Agent": userAgent};
  if (requestType === 'POST') {
    request.post({url: url, formData: data, headers: headers}, parseResponse);
  } else if (requestType === 'GET') {
    request.get({url: url, headers: headers}, parseResponse);
  } else {
    throw 'Invalid makeRequest() call';
  }
};

exports.getFlair = async function (refreshToken, user, subreddit) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/api/flairselector';
  var data = {name: user};
  return makeRequest(refreshToken, 'POST', url, data, 20);
};

exports.getBothFlairs = async function (refreshToken, user) {
  var ptradesFlairPromise = exports.getFlair(refreshToken, user, 'pokemontrades');
  var svexFlairPromise = exports.getFlair(refreshToken, user, 'SVExchange');
  return Promise.all([ptradesFlairPromise, svexFlairPromise]);
};

exports.setFlair = function (refreshToken, name, cssClass, text, subreddit) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : subreddit;
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/api/flair';
  var data = {api_type: 'json', css_class: cssClass, name: name, text: text};
  return makeRequest(refreshToken, 'POST', url, data, 5);
};

exports.banUser = function (refreshToken, username, ban_message, note, subreddit, duration) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : subreddit;
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/api/friend';
  var data = {api_type: 'json', ban_message: ban_message, duration: (duration ? duration : 'undefined'), name: username, note: note, type: 'banned'};
  return makeRequest(refreshToken, 'POST', url, data, 5);
};

exports.getWikiPage = function (refreshToken, subreddit, page) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/wiki/' + page + '?raw_json=1';
  return makeRequest(refreshToken, 'GET', url, undefined, 5);
};

exports.editWikiPage = function (refreshToken, subreddit, page, content, reason) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : subreddit;
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/api/wiki/edit';
  var data = {content: content, page: page, reason: reason};
  return makeRequest(refreshToken, 'POST', url, data, 5);
};

exports.searchTSVThreads = function (refreshToken, username) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : 'SVExchange';
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/search?q=flair%3Ashiny+AND+author%3A' + username + '&restrict_sr=on&sort=new&t=all';
  return makeRequest(refreshToken, 'GET', url, undefined, 15);
};

exports.removePost = function (refreshToken, id, isSpam) {
  var url = 'https://oauth.reddit.com/api/remove';
  var data = {id: 't3_' + id, spam: isSpam};
  return makeRequest(refreshToken, 'POST', url, data, 5);
};

exports.sendPrivateMessage = function (refreshToken, subject, text, recipient) {
  var url = 'https://oauth.reddit.com/api/compose';
  var data = {api_type: 'json', subject: subject, text: text, to: recipient};
  return makeRequest(refreshToken, 'POST', url, data, 25);
};

exports.sendReply = function (refreshToken, text, parent_id) {
  var url = 'https://oauth.reddit.com/api/comment';
  var data = {api_type: 'json', text: text, thing_id: parent_id};
  return makeRequest(refreshToken, 'POST', url, data, 30);
};

exports.checkModeratorStatus = function (refreshToken, username, subreddit) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/about/moderators?user=' + username;
  return makeRequest(refreshToken, 'GET', url, undefined, 5);
};

var updateRateLimits = function (res) {
  if (res && res.headers && res.headers['x-ratelimit-remaining'] && res.headers['x-ratelimit-reset']) {
    left = res.headers['x-ratelimit-remaining'];
    resetTime = moment().add(res.headers['x-ratelimit-reset'], "seconds");
  }
};
