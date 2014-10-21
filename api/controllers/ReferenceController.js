/**
 * ReferenceController
 *
 * @description :: Server-side logic for managing References
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var reddit = require('redwrap'),
  Q = require('q');

module.exports = {

  get: function (req, res) {
    User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        res.json({error: "Can't find user"}, 404);
      } else {
        Reference.find({user: user.id}, function (err, refs) {
          if (err) {
            res.json(400);
          } else {
            res.json(refs, 200);
          }
        });
      }
    });
  },

  add: function (req, res) {
    req.params = req.allParams();
    User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        res.json({error: "Can't find user"}, 404);
      } else {
        if (req.params.type === "egg") {
          Egg.findOne({url: req.params.url, user: user.id}, function (err, ref) {
            Egg.create(
              {
                url: req.params.url,
                user: user.id,
                user2: req.params.user2,
                description: req.params.descrip,
                type: req.params.type
              },
              function (err, ref) {
                if (err) {
                  console.log(err);
                  res.json(400);
                } else {
                  res.json(ref, 200);
                }
              }
            );
          });
        } else if (req.params.type === "giveaway") {
          Giveaway.findOne({url: req.params.url, user: user.id}, function (err, ref) {
            if (err || ref) {
              res.json(400);
            } else {
              Giveaway.create(
                {
                  url: req.params.url,
                  user: user.id,
                  user2: req.params.user2,
                  description: req.params.descrip,
                  type: req.params.type
                },
                function (err, ref) {
                  if (err) {
                    console.log(err);
                    res.json(400);
                  } else {
                    res.json(ref, 200);
                  }
                }
              );
            }
          });

        } else {
          Reference.findOne({url: req.params.url, user: user.id}, function (err, ref) {
            if (err || ref) {
              res.json(400);
            } else {
              Reference.create(
                {
                  url: req.params.url,
                  user: user.id,
                  user2: req.params.user2,
                  gave: req.params.gave,
                  got: req.params.got,
                  type: req.params.type
                },
                function (err, ref) {
                  if (err) {
                    console.log(err);
                    res.json(400);
                  } else {
                    res.json(ref, 200);
                  }
                }
              );
            }
          });
        }
      }
    });
  },

  delete: function (req, res) {
    var id = req.allParams().refId,
      type = req.allParams().type;
    if (type === "giveaways") {
      Giveaway.findOne(id).exec(function (err, giveaway) {
        if (giveaway.user === req.user.id || req.user.isMod) {
          Giveaway.destroy({id: id})
            .exec(function (err, refs) {
              if (err) {
                res.json(err, 400);
              } else {
                res.json(200);
              }
            });
        } else {
          res.json("unauthorised", 403);
        }
      });
    } else if (type === "eggs") {
      Egg.findOne(id).exec(function (err, egg) {
        if (egg.user === req.user.id || req.user.isMod) {
          Egg.destroy({id: id})
            .exec(function (err, refs) {
              if (err) {
                res.json(err, 400);
              } else {
                res.json(200);
              }
            });
        } else {
          res.json("unauthorised", 403);
        }
      });
    } else {
      Reference.findOne(id).exec(function (err, ref) {
        if (ref.user === req.user.id || req.user.isMod) {
          Reference.destroy({id: id})
            .exec(function (err, refs) {
              if (err) {
                res.json(err, 400);
              } else {
                res.json(200);
              }
            });
        } else {
          res.json("unauthorised", 403);
        }
      });
    }
  },

  comment: function (req, res) {
    var user = req.user,
      refUser = req.allParams().refUser,
      comment = req.allParams().comment;

    User.findOne({id: refUser}, function (err, reference) {
      Comment.create({user: reference.id, user2: user.name, message: comment}, function (err, com) {
        res.json(com, 200);
      });
    });

  },

  delComment: function (req, res) {
    var user = req.user,
      refUser = req.allParams().refUser,
      id = req.allParams().id;

    User.findOne({id: refUser}, function () {
      Comment.findOne({id: id}, function (err, comment) {
        if ((user.name === comment.user2) || user.isMod) {
          Comment.destroy({id: id}, function (err, com) {
            res.json(com, 200);
            return;
          });
        } else {
          res.json(403);
          return;
        }
      });
    });

  },

  approve: function (req, res) {
    if (!req.user.isMod) {
      return res.json("Not a mod", 403);
    }

    var refUserId = req.allParams().userid,
      id = req.allParams().id,
      approve = req.allParams().approve;

    User.findOne({id: refUserId}, function (err, refUser) {
      if (!refUser) {
        return res.json("User not found", 404);
      }
      Reference.findOne(id, function (err, ref) {
        if (!ref) {
          Egg.findOne(id, function (err, egg) {
            if (!egg) {
              Giveaway.findOne(id, function (err, give) {
                if (!give) {
                  return res.json("Reference not found", 404);
                } else {
                  give.approved = approve;
                  give.save(function (err) {
                    if (err) {
                      return res.json(err, 500);
                    }
                    return res.json(give, 200);
                  });
                }
              });
            } else {
              egg.approved = approve;
              egg.save(function (err) {
                if (err) {
                  return res.json(err, 500);
                }
                return res.json(egg, 200);
              });
            }
          });
        } else {
          ref.approved = approve;
          ref.save(function (err) {
            if (err) {
              return res.json(err, 500);
            }
            return res.json(ref, 200);
          });
        }
      })
    });
  },

  approveAll: function (req, res) {
    if (!req.user.isMod) {
      return res.json("Not a mod", 403);
    }

    var refUserId = req.allParams().userid,
      type = req.allParams().type;

    User.findOne({id: refUserId}, function (err, refUser) {
      if (!refUser) {
        return res.json("User not found", 404);
      }
      if (type === "events"
        || type === "shinies"
        || type === "casuals") {
        type = type.slice(0, -1);
        if (type === "shinie") {
          type = "shiny";
        }
        if (type === "event") {
          Reference.update(
            {user: refUser.id, type: "event"}, {approved: true}
          ).exec(function (err, apps) {
              Reference.update(
                {user: refUser.id, type: "redemption"}, {approved: true}
              ).exec(function (err, apps2) {
                  if (!apps.length) {
                    return res.json({error: "No apps of that type found."}, 404);
                  }
                  if (err) {
                    return res.json({error: err}, 500);
                  }
                  return res.json(apps.concat(apps2), 200);
                });
            });
        } else {
          Reference.update(
            {user: refUser.id, type: type}, {approved: true}
          ).exec(function (err, apps) {
              if (!apps.length) {
                return res.json({error :"No apps of that type found."}, 404);
              }
              if (err) {
                return res.json({error: err}, 500);
              }
              return res.json(apps, 200);
            });
        }

      } else if (type === "eggs") {
        Egg.update({user: refUser.id}, {approved: true}).exec(function (err, apps) {
          if (!apps.length) {
            return res.json({error :"No apps of that type found."}, 404);
          }
          if (err) {
            return res.json({error: err}, 500);
          }
          return res.json(apps, 200);
        });
      } else if (type === "giveaways") {
        Giveaway.update({user: refUser.id}, {approved: true}).exec(function (err, apps) {
          if (!apps.length) {
            return res.json({error :"No apps of that type found."}, 404);
          }
          if (err) {
            return res.json({error: err}, 500);
          }
          return res.json(apps, 200);
        });
      }
    });

  },

  saveFlairs: function (req, res) {
    var flairs = req.allParams().flairs;
    if (!req.user.isMod) {
      res.json(403);
      return;
    }

    Flair.destroy({}, function (err, removed) {
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
        res.json(added, 200);
      });

    });


  },

  getFlairs: function (req, res) {
    Flair.find().exec(function (err, flairs) {
      res.json(flairs, 200);
    });
  }
};

