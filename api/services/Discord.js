var request = require("request-promise");

exports.getAccessToken = async function (code) {
  try {
    const redirect_uri = encodeURIComponent(sails.config.discord.redirect_host + '/discord/callback');
    const url = 'https://discordapp.com/api/oauth2/token';
    const body = 'client_id=' + sails.config.discord.client_id + '&client_secret=' + sails.config.discord.client_secret + '&grant_type=authorization_code&code=' + code + '&redirect_uri=' + redirect_uri + '&scope=identify%20guilds.join';
    const token = await request.post({
      url: url,
      body: body,
      json: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    });
    return token;
  } catch (err) {
    throw {error: 'Error retrieving token from Discord; Discord responded with status code ' + err.statusCode};
  }
};

exports.getCurrentUser = async function (token) {
  try {
    const url = 'https://discordapp.com/api/users/@me';
    const auth = 'Bearer ' + token;
    const currentUser = await request.get({
      url: url,
      json: true,
      headers: {
        "Authorization": auth,
        "Content-Type": "application/x-www-form-urlencoded",
      }
    });
    return currentUser;
  } catch (err) {
    throw {error: 'Error retrieving current user from Discord; Discord responded with status code ' + err.statusCode};
  }
};

exports.addUserToGuild = async function (token, user, nick) {
  try {
    const url = 'https://discordapp.com/api/guilds/' + sails.config.discord.server_id + '/members/' + user.id;
    const auth = 'Bot ' + sails.config.discord.client_token;
    const body = { 
      'access_token': token,
      'nick': nick,
      'roles' : sails.config.discord.authenticatedRole_id
    };
    const response = await request.put({
      url: url,
      json: true,
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      },
      body: body
    });
    return response;
  } catch (err) {
    throw {error: 'Error adding user to guild; Discord responded with status code ' + err.statusCode};
  }
};