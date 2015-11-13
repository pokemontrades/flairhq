module.exports.schedule = {
  sailsInContext: true,
  tasks: {
    updateModmail: {
      cron : "0 8 * * *",
      task : function (context, sails) {
        console.log('[Daily task]: Updating modmail archives...');
        Promise.all([Modmails.updateArchive('pokemontrades'), Modmails.updateArchive('SVExchange')]).then(function (results) {
          console.log('[Daily task]: Finished updating modmail archives.');
        }, function (error) {
          console.log('There was an issue updating the modmail archives.');
          console.log(error);

        });
      },
      context : {}
    }
  }
};
