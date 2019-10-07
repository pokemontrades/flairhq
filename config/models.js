/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#/documentation/concepts/ORM
 */


module.exports.models = {

  // These settings make the .update(), .create() and .createEach()
  // work like they did in 0.12, by returning records in the callback.
  // This is pretty ineffecient, so if you don't _always_ need this feature, you
  // should turn these off and instead chain `.meta({fetch: true})` onto the
  // individual calls where you _do_ need records returned.
  fetchRecordsOnUpdate: true,
  fetchRecordsOnCreate: true,
  fetchRecordsOnCreateEach: true,

  datastore: 'default',
  adapter: 'mongo',

  attributes: {
    createdAt: { type: 'string', autoCreatedAt: true, },
    updatedAt: { type: 'string', autoUpdatedAt: true, },
    id: { type: 'string', }
  },

  /******************************************************************************
  *                                                                             *
  * The set of DEKs (data encryption keys) for at-rest encryption.              *
  * i.e. when encrypting/decrypting data for attributes with `encrypt: true`.   *
  *                                                                             *
  * > The `default` DEK is used for all new encryptions, but multiple DEKs      *
  * > can be configured to allow for key rotation.  In production, be sure to   *
  * > manage these keys like you would any other sensitive credential.          *
  *                                                                             *
  * > For more info, see:                                                       *
  * > https://sailsjs.com/docs/concepts/orm/model-settings#?dataEncryptionKeys  *
  *                                                                             *
  ******************************************************************************/
  dataEncryptionKeys: {
    default: 'b8bN6FzibIy9xO+7rWC9xdmb6IOrU9LdC7EpuJXAvGE='
  },

  migrate: 'safe',
};
