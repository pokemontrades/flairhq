var types = [
  {
    short: "ref",
    name: "References",
    controller: require("../../api/controllers/search/ref/controller.js"),
    modOnly: false
  },
  {
    short: "user",
    name: "Users",
    controller: require("../../api/controllers/search/user/controller.js"),
    modOnly: false
  },
  {
    short: "log",
    name: "Logs",
    controller: require("../../api/controllers/search/log/controller.js"),
    modOnly: true
  },
  {
    short: "modmail",
    name: "Modmails",
    controller: require("../../api/controllers/search/modmail/controller.js"),
    modOnly: true
  }
];

module.exports = types;
