var types = [
  {"short": "ref", "name": "References", controller: require("./ref/controller.js"), "modOnly": false},
  {"short": "user", "name": "Users", controller: require("./user/controller.js"), "modOnly": false},
  {"short": "log", "name": "Logs", controller: require("./log/controller.js"), "modOnly": true},
  {"short": "modmail", "name": "Modmails", controller: require("./modmail/controller.js"), "modOnly": true}
];

module.exports = types;