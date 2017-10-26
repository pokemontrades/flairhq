module.exports.schedule = {
  sailsInContext: true,
  tasks: {
    updateModmail: {
      cron : "0 8 * * *",
      task : function (context, sails) {
        sails.log.info('[Daily task]: Updating modmail archives...');
        Promise.all([Modmails.updateArchive(sails.config.reddit.tradeSub), Modmails.updateArchive(sails.config.reddit.eggSub)]).then(function (results) {
          sails.log.info('[Daily task]: Finished updating modmail archives.');
        }, function (error) {
          sails.log.error('There was an issue updating the modmail archives.');
          sails.log.error(error);
        });
      },
      context : {}
    }
  }
};
