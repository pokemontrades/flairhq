var _ = require('lodash');
module.exports = {
  // Generate random references
  // Intended use is for unit testing, not flair grinding
  getRefs: function (numberOfRefs, params) {
    var refs = [];
    for (var i = 0; i < numberOfRefs; i++) {
      var subreddit, url, type, approved;
      if (params.url) {
        url = params.url;
        subreddit = params.url.indexOf('/r/pokemontrades') !== -1 ? 'pokemontrades' : 'SVExchange';
      } else {
        if (params.subreddit) {
          subreddit = params.subreddit;
        } else if (params.type === 'egg' || params.type === 'eggcheck') {
          subreddit = 'SVExchange';
        } else if (params.type && params.type !== 'giveaway') {
          subreddit = 'pokemontrades';
        } else {
          subreddit = _.sample(['pokemontrades', 'SVExchange']);
        }
        url = 'https://reddit.com/r/' + subreddit + '/comments/a/a/' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20);
      }
      if (params.type) {
        type = params.type;
      }
      else if (subreddit === 'pokemontrades') {
        type = _.sample(['event', 'shiny', 'casual', 'bank', 'involvement', 'giveaway']);
      } else {
        type = _.sample(['egg', 'eggcheck', 'giveaway']);
      }
      approved = _.sample([true, false]);
      refs.push({
        url: url,
        user: params.user || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
        user2: params.user2 || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
        description: params.description || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
        gave: params.gave || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
        got: params.got || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
        type: type,
        notes: params.notes || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
        privatenotes: params.privatenotes || Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
        edited: params.edited || _.sample([true, false]),
        number: _.random(0, Number.MAX_SAFE_INTEGER),
        createdAt: params.createdAt || new Date(_.random(0, 4294967295000)).toISOString(),
        updatedAt: params.updatedAt || new Date(_.random(0, 4294967295000)).toISOString(),
        approved: approved,
        verified: approved && _.sample([true, false])
      });
    }
    return refs;
  }
};