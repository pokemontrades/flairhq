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
          User.findOne({id: ref.user}).exec(function (err, refUser) {
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

    User.findOne({id: req.params.userid}, function (err, refUser) {
      if (!refUser) {
        return res.notFound("Can't find user");
      } else {
        Reference.findOne({url: {endsWith: endOfUrl}, user: refUser.id}, function (err, ref) {
          if (err) {
            return res.serverError(err);
          }
          if (ref && (ref.type !== "egg" || req.params.type !== "egg")) {
            return res.badRequest();
          } else {
            Reference.create(
              {
                url: req.params.url,
                user: refUser.id,
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
          }
        });
      }
    });
  },

  edit: function (req, res) {
    req.params = req.allParams();

    User.findOne({id: req.user.id}, function (err, refUser) {
      if (!refUser) {
        return res.notFound("Can't find user");
      }
      Reference.findOne({id: req.params.id, user: refUser.id}).exec(function (err, ref) {
        if (err || !ref) {
          return res.notFound();
        }
        var approved = ref.approved;
        if (ref.url !== req.params.url || ref.type !== req.params.type || ref.number !== req.params.number) {
          approved = false;
        }
        Reference.update({id: req.params.id, user: refUser.id},
            {
              url: req.params.url,
              user: refUser.id,
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
    });
  },

  deleteRef: function (req, res) {
    var id = req.allParams().refId;

    Reference.findOne({id: id}).exec(function (err, ref) {
      if (!ref) {
        return res.notFound();
      }
      if (err) {
        return res.serverError(err);
      }
      if (ref.user === req.user.id || req.user.isMod) {
        Reference.destroy({id: id})
          .exec(function (err, refs) {
            if (err) {
              return res.serverError(err);
            } else {
              return res.ok(refs);
            }
          });
      } else {
        return res.forbidden("unauthorised");
      }
    });

  },

  comment: function (req, res) {
    var user = req.user,
      refUser = req.allParams().refUser,
      comment = req.allParams().comment;

    User.findOne({id: refUser}, function (err, reference) {
      Comment.create({user: reference.id, user2: user.name, message: comment}, function (err, com) {
        if (err) {
          return res.serverError(err);
        }
        return res.ok(com);
      });
    });

  },

  delComment: function (req, res) {
    var user = req.user,
      refUser = req.allParams().refUser,
      id = req.allParams().id;

    User.findOne({id: refUser}, function () {
      Comment.findOne({id: id}, function (err, comment) {
        if (!comment || err) {
          return res.notFound(err);
        }
        if ((user.name === comment.user2) || user.isMod) {
          Comment.destroy({id: id}, function (err, com) {
            return res.ok(com);
          });
        } else {
          return res.forbidden();
        }
      });
    });

  },

  approve: function (req, res) {
    var refUserId = req.allParams().userid,
      id = req.allParams().id,
      approve = req.allParams().approve;

    User.findOne({id: refUserId}, function (err, refUser) {
      if (!refUser) {
        return res.notFound("User not found");
      }
      Reference.findOne(id, function (err, ref) {
        if (!ref) {
          return res.notFound();
        } else {
          ref.approved = approve;
          ref.save(function (err) {
            if (err) {
              return res.serverError(err);
            }
            return res.ok(ref);
          });
        }
      });
    });
  },

  approveAll: function (req, res) {
    var refUserId = req.allParams().userid,
      type = req.allParams().type;

    User.findOne({id: refUserId}, function (err, refUser) {
      if (!refUser) {
        return res.notFound("User not found");
      }
      if (type === "event") {
        Reference.update(
          {user: refUser.id, type: "event"}, {approved: true}
        ).exec(function (err, apps) {
            Reference.update(
              {user: refUser.id, type: "redemption"}, {approved: true}
            ).exec(function (err, apps2) {
                if (!apps.length) {
                  return res.notFound({error: "No apps of that type found."});
                }
                if (err) {
                  return res.serverError(err);
                }
                return res.ok(apps.concat(apps2));
              });
          });
      } else {
        Reference.update(
          {user: refUser.id, type: type}, {approved: true}
        ).exec(function (err, apps) {
            if (!apps.length) {
              return res.notFound({error: "No apps of that type found."});
            }
            if (err) {
              return res.serverError(err);
            }
            return res.ok(apps);
          });
      }
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
      res.ok(flairs);
    });
  }
};

