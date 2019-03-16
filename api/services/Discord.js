var request = require("request-promise"),
  _ = require('lodash');

let globallyRateLimited = false;
let rateLimitedRoutes = {};

const makeRequest = async function (requestType, url, body, headers, route) {
  removeNonRateLimited();
  if (globallyRateLimited || isRateLimited(route)) {
    throw {statusCode: 429, 
      error: 'Request not sent due to rate limit: time remaining = ' 
      + (globallyRateLimited ? 
      timeRemaining(rateLimitedRoutes['global']) : 
      timeRemaining(rateLimitedRoutes[route]))
      + ' seconds'
    };
  }
  const options = {
    method: requestType,
    url: url,
    body: body,
    json: true, 
    headers: headers,
    resolveWithFullResponse: true
  };
  try {
    const response = await request(options);
    updateRateLimits(response.headers, route);
    return response.body;
  } catch (err) {
    if (err.statusCode === 429) {
      if (err.error['global'] === true) {
        rateLimitedRoutes['global'] = (Number(Date.now()) + 
          Number(err.error['retry_after'])) / 1000 + 1;
        globallyRateLimited = true;
      }
      throw {statusCode: err.statusCode, error: 'Rate Limited'};
    }
    sails.log.error(
      'Discord error: ' + requestType + 
      ' request sent to ' + url + 
      ' returned ' + err.statusCode);
    sails.log.error('Form data sent: ' + JSON.stringify(body));
    throw {statusCode: err.statusCode, error: '(Discord response)'};
  }
};

const updateRateLimits = function (resHeaders, route) {
  if (resHeaders['x-ratelimit-remaining'] === '0') {
    rateLimitedRoutes[route] = Number(resHeaders['x-ratelimit-reset']) + 1;  
  }
};

const isRateLimited = function (route) {
  return _.isNumber(rateLimitedRoutes[route]);
};

const removeNonRateLimited = function () {
  for (let route in rateLimitedRoutes) {
    if (isResetTimePassed(rateLimitedRoutes[route])) {
      delete rateLimitedRoutes[route];
      if(route === 'global') {
        globallyRateLimited = false;
      }
    }
  }
};

const isResetTimePassed = function (time) {
  const timeDifference = time - (Number(Date.now()) / 1000);
  return timeDifference < 0;
};
    
const timeRemaining = function (time) {
  return time - (Number(Date.now() / 1000));
};

exports.getAccessToken = async function (code) {
  const redirect_uri = encodeURIComponent(sails.config.discord.redirect_host + '/discord/callback');
  const url = 'https://discordapp.com/api/oauth2/token';
  const body =
    'client_id=' + sails.config.discord.client_id + 
    '&client_secret=' + sails.config.discord.client_secret + '&grant_type=authorization_code&code=' + code + 
    '&redirect_uri=' + redirect_uri +
    '&scope=identify%20guilds.join';
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  try {
    const token = makeRequest('POST', url, body, headers, url);
    return token;
  } catch (err) {
    throw {error: 'Error retrieving token from Discord; Discord responded with status code ' + err.statusCode};
  }
};

exports.getCurrentUser = async function (token) {
  const url = 'https://discordapp.com/api/users/@me';
  const auth = 'Bearer ' + token;
  const headers = {
    "Authorization": auth,
    "Content-Type": "application/x-www-form-urlencoded" 
  };
  try {
    const currentUser = await makeRequest('GET', url, undefined, headers, url);
    return currentUser;
  } catch (err) {
    throw {error: 'Error retrieving current user from Discord; Discord responded with status code ' + err.statusCode};
  }
};

exports.addUserToGuild = async function (token, user, nick) {
  const route = 'https://discordapp.com/api/guilds/' + sails.config.discord.server_id + '/members';
  const url =  route + '/' + user;
  const auth = 'Bot ' + sails.config.discord.bot_token;
  const body = { 
    'access_token': token,
    'nick': nick,
    'roles' : sails.config.discord.authenticatedRole_id
  };
  const headers = {
    "Authorization": auth,
    "Content-Type": "application/json"
  };
  try {
    const response = await makeRequest('PUT', url, body, headers, route); 
    return response;
  } catch (err) {
    sails.log(err);
    throw {error: 'Error adding user to guild; Discord responded with status code ' + err.statusCode};
  }
};