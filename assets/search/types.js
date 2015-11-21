var types = [
  {"short": "ref", "name": "References", controller: require("./ref/controller.js")},
  {"short": "user", "name": "Users", controller: require("./user/controller.js")},
  {"short": "log", "name": "Logs", controller: require("./log/controller.js"), "modOnly": true}
];

module.exports = types;