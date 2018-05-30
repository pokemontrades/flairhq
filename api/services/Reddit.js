var request = require("request-promise"),
  moment = require('moment'),
  NodeCache = require('node-cache'),
  _ = require('lodash'),
  left = 600,
  resetTime = moment().add(600, "seconds");
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
      "User-Agent": sails.config.reddit.userAgent,
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": data.length
    }
  }).catch(function (error) {
    throw {statusCode: 502, error: 'Error retrieving token; Reddit responded with status code ' + error.statusCode};
  });
  if (body && body.access_token) {
    cache.set(refreshToken, body.access_token);
    return body.access_token;
  } else {
    throw "Error retrieving token";
  }
};

var makeRequest = async function (refreshToken, requestType, url, data, rateLimitRemainingThreshold, silenceErrors) {
  if (left < rateLimitRemainingThreshold && moment().isBefore(resetTime)) {
    throw {statusCode: 504, error: "Rate limited"};
  }
  // Prevent Reddit from sanitizing '> < &' to '&gt; &lt; &amp;' in the response
  url += (url.indexOf('?') === -1 ? '?' : '&') + 'raw_json=1';
  var headers = {"User-Agent": sails.config.reddit.userAgent};
  if (url.indexOf("oauth.reddit.com") !== -1) {
    headers.Authorization = "bearer " + await exports.refreshToken(refreshToken);
  }
  var options = {
    url: url,
    headers: headers,
    resolveWithFullResponse: true,
    method: requestType,
    formData: data
  };
  let response = await request(options).catch(function (error) {
    if (!silenceErrors) {
      sails.log.error('Reddit error: ' + requestType + ' request sent to ' + url + ' returned ' + error.statusCode);
      sails.log.error('Form data sent: ' + JSON.stringify(data));
    }
    throw {statusCode: error.statusCode, error: '(Reddit response)'};
  });
  updateRateLimits(response);
  var bodyJson;
  try {
    bodyJson = JSON.parse(response.body);
  } catch (error) {
    sails.log.error("Error with parsing: " + response.body);
    throw {error: "Error with parsing: " + response.body};
  }
  return bodyJson;
};

var getEntireListing = async function (refreshToken, endpoint, query, rateThreshold, after, before) {
  var url = endpoint + query + (query ? '&' : '?') + 'count=102&limit=100' + (after ? '&after=' + after : '') + (before ? '&before=' + before : '');
  var batch = await makeRequest(refreshToken, 'GET', url, undefined, rateThreshold, after, before);
  var results = batch.data.children;
  after = before ? undefined : batch.data.after;
  before = before ? batch.data.before : undefined;
  if (!after && !before) {
    return results;
  }
  return _.union(results, await getEntireListing(refreshToken, endpoint, query, rateThreshold, after, before));
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

exports.setUserFlair = function (refreshToken, name, cssClass, text, subreddit) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : subreddit;
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/api/flair';
  var data = {api_type: 'json', css_class: cssClass, name: name, text: text};
  return makeRequest(refreshToken, 'POST', url, data, 5);
};

exports.setLinkFlair = function (refreshToken, subreddit, link_id, cssClass, text) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/api/flair';
  var data = {api_type: 'json', css_class: cssClass, link: 't3_' + link_id, text: text};
  return makeRequest(refreshToken, 'POST', url, data, 5);
};

exports.checkUsernameAvailable = async function (name) {
  return makeRequest(undefined, 'GET', 'https://www.reddit.com/api/username_available.json?user=' + name, undefined, 10);
};

exports.banUser = function (refreshToken, username, ban_message, note, subreddit, duration) {
  var actual_sub = sails.config.debug.reddit ? sails.config.debug.subreddit : subreddit;
  var url = 'https://oauth.reddit.com/r/' + actual_sub + '/api/friend';
  var data = {api_type: 'json', ban_message: ban_message, duration: (duration ? duration : ''), name: username, note: note, type: 'banned'};
  return makeRequest(refreshToken, 'POST', url, data, 5);
};

exports.getWikiPage = async function (refreshToken, subreddit, page) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/wiki/' + page;
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
  var query = "flair:tsv AND author:" + username;
  return exports.search(refreshToken, actual_sub, query, true, 'new', 'all', 'lucene');
};

exports.search = function (refreshToken, subreddit, query, restrict_sr, sort, time, syntax) {
  var querystring = '?q=' + encodeURIComponent(query) + (restrict_sr  ? '&restrict_sr=on' : '') +
    (sort ? '&sort=' + sort : '') + (time ? '&t=' + time : '') + '&syntax=' + (syntax ? syntax : 'lucene');
  var endpoint = 'https://oauth.reddit.com/r/' + subreddit + '/search';
  return getEntireListing(refreshToken, endpoint, querystring, 10);
};

exports.removePost = function (refreshToken, id, isSpam) {
  var url = 'https://oauth.reddit.com/api/remove';
  var data = {id: 't3_' + id, spam: isSpam};
  return makeRequest(refreshToken, 'POST', url, data, 5);
};

exports.lockPost = function (refreshToken, post_id) {
  var url = 'https://oauth.reddit.com/api/lock';
  var data = {id: 't3_' + post_id};
  /* Attempting to lock an archived post results in a 400 response. The request is still considered successful if this happens, so the error is
   * returned instead of being thrown. */
  return makeRequest(refreshToken, 'POST', url, data, 5, true).catch(function (error) {
    if (error.statusCode === 400) {
      return error;
    }
    throw error;
  });
};

exports.markNsfw = function (refreshToken, post_id) {
  var url = 'https://oauth.reddit.com/api/marknsfw';
  var data = {id: 't3_' + post_id};
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

exports.getModeratorPermissions = async function (refreshToken, username, subreddit) {
  var url = 'https://oauth.reddit.com/r/' + subreddit + '/about/moderators?user=' + username;
  let res = await makeRequest(refreshToken, 'GET', url, undefined, 5);
  return res.data.children.length ? res.data.children.find(child => child.name === username).mod_permissions : null;
};

exports.getModmail = async function (refreshToken, subreddit, after, before) {
  var endpoint = 'https://oauth.reddit.com/r/' + subreddit + '/message/moderator';
  return getEntireListing(refreshToken, endpoint, '', 20, after, before);
};

var updateRateLimits = function (res) {
  if (res && res.headers && res.headers['x-ratelimit-remaining'] && res.headers['x-ratelimit-reset']) {
    left = res.headers['x-ratelimit-remaining'];
    resetTime = moment().add(res.headers['x-ratelimit-reset'], "seconds");
  }
};
