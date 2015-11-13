var request = require("request-promise"),
  moment = require('moment'),
  NodeCache = require('node-cache'),
  left = 600,
  resetTime = moment().add(600, "seconds"),
  userAgent = "Webpage:hq.porygon.co:v" + sails.config.version;
var cache = new NodeCache({stdTTL: 3480}); // Cached tokens expire after 58 minutes, leave a bit of breathing room in case stuff is slow

exports.refreshToken = async function(refreshToken) {
  let token = await cache.get(refreshToken);
  if (token) {
    return token;
  }
  var data = "grant_type=refresh_token&refresh_token=" + refreshToken;
  var auth = "Basic " + new Buffer(sails.config.reddit.clientID + ":" + sails.config.reddit.clientIDSecret).toString("base64");
  var body = await request.post({
    url: 'https://www.reddit.com/api/v1/access_token',
    body: data,
    json: true,
    headers: {
      "Authorization": auth,
      "User-Agent": userAgent,
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": data.length
    }
  });
  if (body && body.access_token) {
    cache.set(refreshToken, body.access_token);
    return body.access_token;
  } else {
    throw "Error retrieving token";
  }
};

var makeRequest = async function (refreshToken, requestType, url, data, rateLimitRemainingThreshold) {
  let token = await exports.refreshToken(refreshToken);
  if (left < rateLimitRemainingThreshold && moment().before(resetTime)) {
    throw "Rate limited";
  }
  var headers = {
    Authorization: "bearer " + token, "User-Agent": userAgent
  };
  var options = {
    url: url,
    headers: headers,
    resolveWithFullResponse: true,
    method: requestType,
    formData: data
  };
  let response = await request(options);
  updateRateLimits(response);
  var bodyJson;
  try {
    bodyJson = JSON.parse(response.body);
  } catch (error) {
    console.log("Error with parsing: " + response.body);
    throw "Error with parsing: " + response.body;
  }

  if (response.statusCode !== 200) {
    console.log('Reddit error: ' + requestType + ' request sent to ' + url + ' returned ' + response.statusCode +
      ' - ' + response.statusMessage + '\nForm data sent: ' + JSON.stringify(data));
    throw response.statusMessage;
  }
  return bodyJson;
};

exports.getFlair = async function (refreshToken, user, subreddit) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/api/flairselector';
  var data = {name: user};
  //Return a Promise containing `response.current` (the flair itself) instead of `response` (the object which contains the flair).
  let res = await makeRequest(refreshToken, 'POST', url, data, 20);
  return res.current;
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

exports.getWikiPage = async function (refreshToken, subreddit, page) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/wiki/' + page + '?raw_json=1';
  //Return a Promise for content of the page instead of all the other data
  let res = await makeRequest(refreshToken, 'GET', url, undefined, 5);
  return res.data.content_md;
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

exports.checkModeratorStatus = async function (refreshToken, username, subreddit) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/about/moderators?user=' + username;
  let res = await makeRequest(refreshToken, 'GET', url, undefined, 5);
  return res.data.children.length !== 0;
};

exports.getModmail = async function (refreshToken, subreddit, after, before, limit) {
  //after/before (mutually exclusive): Fullname of a modmail -- will start retrieving modmail from after/before this point
  //limit: The limit on the number of modmails to display, max 100
  limit = limit || 100;
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/about/message/inbox?show=all&count=102&limit=' + limit;
  url += after ? '&after=' + after : before ? '&before=' + before : '';
  return makeRequest(refreshToken, 'GET', url, undefined, 20);
};

var updateRateLimits = function (res) {
  if (res && res.headers && res.headers['x-ratelimit-remaining'] && res.headers['x-ratelimit-reset']) {
    left = res.headers['x-ratelimit-remaining'];
    resetTime = moment().add(res.headers['x-ratelimit-reset'], "seconds");
  }
};
