/* global module, User, Reference, Flair */
/**
 * ReferenceController
 *
 * @description :: Server-side logic for managing References
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  add: async function (req, res) {
    try {
      var submittedRef = References.validateRef(req.allParams());
      submittedRef.user = req.user.name;
      submittedRef.edited = false;
      var endOfUrl = submittedRef.url.replace(/^(https?):\/\/([a-z0-9]*\.)?reddit\.com/, '');
      if (submittedRef.user2 === req.user.name) {
        return res.status(400).json({err: "Don't put your own username there"});
      }
      if (await Reference.findOne({url: {endsWith: endOfUrl}, type: {not: 'egg'}, user: req.user.name})) {
        return res.status(400).json({err: 'Already added that URL.'});
      }
      var complement = await References.getComplement(submittedRef);
      var createdRef = await Reference.create(submittedRef);
      if (complement && complement.approved) {
        await References.approve(createdRef, true);
      }
      return res.ok(submittedRef);
    } catch (err) {
      if (typeof err === 'string') {
        return res.status(400).json({err: err});
      }
      return res.serverError(err);
    }
  },

  edit: async function (req, res) {
    try {
      var submittedRef = References.validateRef(req.allParams());
      if (submittedRef.user2 === req.user.name) {
        return res.status(400).json({err: "Don't put your own username there"});
      }
      submittedRef.user = req.user.name;
      submittedRef.edited = true;
      submittedRef.approved = false;
      var updatedRef = await Reference.update(req.allParams().id, submittedRef);
      if (!updatedRef) {
        return res.notFound(submittedRef);
      }
      return res.ok(submittedRef);
    } catch (err) {
      if (typeof err === 'string') {
        return res.status(400).json({err: err});
      }
      return res.serverError(err);
    }
  },

  deleteRef: async function (req, res) {
    var ref = await Reference.findOne(req.allParams().id);
    if (!ref) {
      return res.notFound();
    }
    if (ref.user !== req.user.name && !req.user.isMod) {
      return res.forbidden();
    }
    if (ref.verified) {
      var complement = await References.getComplement(ref);
      if (complement) {
        await Reference.update(complement.id, {verified: false});
      }
    }
    return res.ok(await Reference.destroy(ref.id));
  },

  comment: function (req, res) {
    Comment.create({
      user: req.allParams().refUsername,
      user2: req.user.name,
      message: req.allParams().comment
    }, function (err, com) {
      if (err) {
        return res.serverError(err);
      }
      return res.ok(com);
    });
  },

  delComment: function (req, res) {
    var id = req.allParams().id;
    Comment.findOne(id, function (err, comment) {
      if (!comment || err) {
        return res.notFound(err);
      }
      if (req.user.name === comment.user2 || req.user.isMod) {
        Comment.destroy(id, function (err, result) {
          return res.ok(result);
        });
      } else {
        return res.forbidden();
      }
    });
  },

  approve: async function (req, res) {
    try {
      var ref = await Reference.findOne(req.allParams().id);
      if (!References.isApprovable(ref)) {
        return res.badRequest();
      }
      return res.ok(await References.approve(ref, req.allParams().approve));
    } catch (err) {
      return res.serverError(err);
    }
  },

  approveAll: async function (req, res) {
    try {
      var refs = await Reference.find({user: req.allParams().username, type: req.allParams().type});
      return res.ok(await* refs.map(function (ref) {
        return References.approve(ref, true);
      }));
    } catch (err) {
      return res.serverError(err);
    }
  },

  saveFlairs: function (req, res) {
    var flairs = req.allParams().flairs;
    Flair.destroy({}, function (err) {
      if (err) {
        return res.serverError(err);
      }
      var promises = [],
        added = [];
      flairs.forEach(function (flair) {
        promises.push(
          Flair.create(flair)
            .exec(function (err, newFlair) {
              added.push(newFlair);
            })
        );
      });
      Promise.all(promises).then(function () {
        res.ok(added);
      });
    });
  },

  getFlairs: async function (req, res) {
    try {
      return res.ok(await Flairs.getFlairs());
    } catch (err) {
      return res.serverError(err);
    }
  }
};

