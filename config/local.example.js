// This is an example file. Be sure to rename it to local.js and add valid credentials.
module.exports = {
  port: 1337,
  environment: "development",
  hookTimeout: "50000",
  reddit: {
    clientID: "CLIENT ID GOES HERE",
    clientIDSecret: "SECRET ID GOES HERE",
    redirectURL: "http://localhost:1337/auth/reddit/callback",
    adminRefreshToken: "ADMIN REFRESH TOKEN GOES HERE",
    userAgent: 'FlairHQ development version by /u/DEVELOPERS_USERNAME || hq.porygon.co/info || v' + require('../package.json').version
  },
  connections: {
    "default": "mongo",
    mongo: {
      adapter: 'sails-mongo',
      host: 'localhost',
      port: 27017,
      user: '',
      password: '',
      database: 'fapp'
    }
  },
  session: {
    adapter: 'mongo',
    host: 'localhost',
    port: 27017,
    db: 'fapp',
    collection: 'sessions'
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
