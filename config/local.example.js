// This is an example file. Be sure to rename it to local.js and add valid credentials.
module.exports = {
  port: 1337,
  environment: "development",
  hookTimeout: 50000,
  reddit: {
    clientID: "CLIENT ID GOES HERE",
    clientIDSecret: "SECRET ID GOES HERE",
    redirectURL: "http://localhost:1337/api/auth/reddit/callback",
    adminRefreshToken: "ADMIN REFRESH TOKEN GOES HERE",
    userAgent: 'FlairHQ development version by /u/DEVELOPERS_USERNAME || hq.porygon.co/info || v' + require('../package.json').version
  },
  datastores: {
    default: {
      adapter: require('sails-mongo'),
      url: 'mongodb://user:password@localhost:27017/fapp',
    }
  },
  session: {
    default: {
      adapter: require('sails-mongo'),
      url: 'mongodb://user:password@localhost:27017/sessions',
    }
  },
  discord: {
    client_id: 'ID GOES HERE',
    client_secret: 'SECRET HERE',
    redirect_host: 'http://localhost:1337',
    server_id: '111111',
    authenticatedRole_id: ['2222222'],
    bot_token: 'aaaaaaaaaaa'
  }
};
