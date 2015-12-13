module.exports = {

  types: {
    stringOrNull: function (val) {
      return typeof val === 'string' || val === null;
    }
  },

  autoPK: false,

  attributes: {
    name: { //The fullname ('t4_' + base36id) of the message
      columnName: 'id',
      type: 'string',
      unique: true,
      primaryKey: true
    },
    subject: 'string', //Subject of the message
    body: 'string', //Body of the message
    author: 'string', //Username of the message author
    subreddit: { //The subreddit that the modmail was sent to
      enum: ['pokemontrades', 'SVExchange']
    },
    first_message_name: { //The fullname of the first message in this chain, or null if this is the first message
      stringOrNull: true
    },
    created_utc: { //The UTC timestamp of when the message was created
      type: 'integer'
    },
    parent_id: { //The fullname of the parent message, or null if this is the first message
      stringOrNull: true
    },
    distinguished: { //This will be 'moderator' if the author was a mod, 'admin' if the author was a reddit admin, or null otherwise
      enum: ['moderator', 'admin', null]
    }
  }
};
