/* global module, User, Reference, Flair */
/**
 * ReferenceController
 *
 * @description :: Server-side logic for managing References
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Q = require('q'),
  async = require('async');

module.exports = {
  all: function (req, res) {
    var dateQuery, query;
    dateQuery = {};
    if (req.query.before !== undefined) {
      dateQuery["<"] = new Date(req.query.before);
    }
    if (req.query.after !== undefined) {
      dateQuery[">"] = new Date(req.query.after);
    }
    query = {
      type: ["event", "casual", "shiny", "redemption", "bank"]
    };
    if (Object.keys(dateQuery).length > 0) {
      query.createdAt = dateQuery;
    }

    Reference.find(query)
      .sort({createdAt: "asc"})
      .exec(function (err, refs) {
        if (err) {
          return res.serverError(err);
        }
        async.map(refs, function (ref, callback) {
          User.findOne({name: ref.user}).exec(function (err, refUser) {
            ref.user = refUser;
            callback(null, ref);
          });
        }, function (err, results) {
          if (err) {
            return res.serverError(err);
          }
          return res.ok(results);
        });
      });

  },

  add: function (req, res) {
    req.params = req.allParams();
    var protomatch = /^(https?):\/\/(www|[a-z0-9]*\.)?reddit\.com/;
    var endOfUrl = req.params.url.replace(protomatch, '');
    if (req.params.number && isNaN(req.params.number)) {
      return res.badRequest({err: "Number must be a number"});
    }

    Reference.findOne({url: {endsWith: endOfUrl}, user: req.user.name}, function(err, ref) {
      if (err) {
        return res.serverError(err);
      }
      if (ref && (ref.type !== "egg" || req.params.type !== "egg")) {
        return res.badRequest();
      }
      Reference.create(
        {
          url: req.params.url,
          user: req.user.name,
          user2: req.params.user2,
          description: req.params.descrip,
          type: req.params.type,
          gave: req.params.gave,
          got: req.params.got,
          notes: req.params.notes,
          privatenotes: req.params.privatenotes,
          edited: false,
          number: req.params.number || 0
        },
        function (err, ref) {
          if (err) {
            console.log(err);
            return res.serverError();
          } else {
            return res.ok(ref);
          }
        }
      );
    });
  },

  edit: function (req, res) {
    req.params = req.allParams();
    Reference.findOne({id: req.params.id, user: req.user.name}).exec(function (err, ref) {
      if (err || !ref) {
        return res.notFound();
      }
      if (req.user.name !== ref.user) {
        return res.forbidden();
      }
      var approved = ref.approved;
      if (ref.url !== req.params.url || ref.type !== req.params.type || ref.number !== req.params.number) {
        approved = false;
      }
      Reference.update(req.params.id,
          {
            url: req.params.url,
            user: req.user.name,
            user2: req.params.user2,
            description: req.params.description,
            type: req.params.type,
            gave: req.params.gave,
            got: req.params.got,
            notes: req.params.notes,
            privatenotes: req.params.privatenotes,
            approved: approved,
            edited: true,
            number: req.params.number
          })
          .exec(function (err, ref) {
            if (err) {
              return res.serverError(err);
            }
            if (!ref) {
              return res.notFound();
            }
            return res.ok(ref);
          });
    });
  },

  deleteRef: function (req, res) {
    var id = req.allParams().refId;
    Reference.findOne(id).exec(function (err, ref) {
      if (!ref) {
        return res.notFound();
      }
      if (err) {
        return res.serverError(err);
      }
      if (ref.user === req.user.name || req.user.isMod) {
        if (ref.verified) {
          var query = {
            user: ref.user2,
            url: new RegExp(ref.url.substring(ref.url.indexOf("/r/"))),
            user2: '/u/' + ref.user
          };
          //If a verified reference is deleted, its compelmentary reference is un-verified.
          Reference.update(query, {verified: false}, function (err, otherRef) {
            if (err) {
              console.log("Error while updating complementary trade.");
            }
          });
        }
        Reference.destroy(id).exec(function (err, refs) {
            if (err) {
              return res.serverError(err);
            }
            return res.ok(refs);
          });
      } else {
        return res.forbidden();
      }
    });
  },

  comment: function (req, res) {
    Comment.create({user: req.allParams().refUsername, user2: req.user.name, message: req.allParams().comment}, function (err, com) {
      if (err) {
        return res.serverError(err);
      }
      return res.ok(com);
    });
  },

  delComment: function (req, res) {
    Comment.findOne(req.allParams().id, function (err, comment) {
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

  approve: function (req, res) {
    Reference.findOne(req.allParams().id, function (err, ref) {
      if (!ref || err) {
        return res.notFound(err);
      }
      References.approve(ref, req.allParams().approve).then(function (result) {
        return res.ok(ref);
      }, function (error) {
        console.log(error);
        return res.status(error.statusCode).json(error);
      });
    });
  },

  approveAll: function (req, res) {
    var promises = [];
    Reference.find({user: req.allParams().username, type: req.allParams().type}, function (err, refs) {
      if (!refs.length || err) {
        return res.notFound(err);
      }
      for (var i = 0; i < refs.length; i++) {
        promises.push(References.approve(refs[i], true));
      }
      Promise.all(promises).then(function (err, results) {
        return res.status(200).json(results);
      }, function (error) {
        console.log(error);
        return res.status(error.statusCode).json(error);
      });
    });
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
      Q.all(promises).then(function () {
        res.ok(added);
      });
    });
  },

  getFlairs: function (req, res) {
    Flair.find().exec(function (err, flairs) {
      if (err) {
        return res.serverError(err);
      }
      return res.ok(flairs);
    });
  }
};

