module.exports.debug = {
    reddit: false, // If true, redirects reddit-modifying actions to a debug subreddit
    subreddit: 'crownofnails' // The debug subreddit to redirect to
};

module.exports.version = require("../package.json").version;
