var request = require("request-promise");

exports.getAccessToken = async function (code) {
    let redirect_uri = encodeURIComponent(sails.config.discord.redirect_host + '/discord/callback');
    let url = 'https://discordapp.com/api/oauth2/token';
    let data = 'client_id=' + sails.config.discord.client_id + '&client_secret=' + sails.config.discord.client_secret + '&grant_type=authorization_code&code=' + code + '&redirect_uri=' + redirect_uri + '&scope=identify%20guilds.join';
    return await request.post({
      url: url,
      body: data,
      json: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    }).catch(function (error) {
      throw {statusCode: 502, error: 'Error retrieving token; Discord responded with status code ' + error.statusCode};
    });
};

exports.getCurrentUser = async function (token) {
  let url = 'https://discordapp.com/api/users/@me';
  let auth = 'Bearer ' + token;
  return await request.get({
      url: url,
      json: true,
      headers: {
        "Authorization": auth,
        "Content-Type": "application/x-www-form-urlencoded",
      }
    }).catch(function (error) {
      throw {statusCode: 502, error: 'Error obtaining user data; Discord responded with status code ' + error.statusCode};
    });  
};

exports.addUserToGuild = async function (token, user, nick) {
  let url = 'https://discordapp.com/api/guilds/' + sails.config.discord.server_id + '/members/' + user.id;
  let auth = 'Bot ' + sails.config.discord.bot_token;
  let body = { 
    'access_token': token,
    'roles' : sails.config.discord.authenticatedRole_id,
    'nick': nick
  };
  let response = await request.put({
      url: url,
      json: true,
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json",
      },
    body: body
    }).catch(function (error) {
      // Returns a 201 Created with the guild member as the body, or 204 No Content if the user is already a member of the guild.
      throw {statusCode: 502, error: 'Error adding user to a guild; Discord responded with status code ' + error.statusCode};
    });  
  return response;
};