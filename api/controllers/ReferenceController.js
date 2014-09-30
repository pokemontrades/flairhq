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
    user = User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        res.json({error: "Can't find user"}, 404);
      } else {
        Reference.find({user: user.id}, function (err, refs) {
          if(err) {
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
    user = User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        res.json({error: "Can't find user"}, 404);
      } else {
        if (req.params.type === "egg"){
  	  Egg.findOne({url: req.params.url, user: user.id}, function (err, ref) {
            if(err || ref) {
              res.json(400);
            } else {
              Egg.create(
                {
                 url: req.params.url, 
                 user: user.id, 
                 user2: req.params.user2,
                 descrip: req.params.descrip,
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
        } else if (req.params.type === "giveaway") {
  	  Giveaway.findOne({url: req.params.url, user: user.id}, function (err, ref) {
            if(err || ref) {
              res.json(400);
            } else {
              Giveaway.create(
                {
                 url: req.params.url, 
                 user: user.id, 
                 user2: req.params.user2,
                 descrip: req.params.descrip,
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

        }  else {
  	  Reference.findOne({url: req.params.url, user: user.id}, function (err, ref) {
            if(err || ref) {
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
      Giveaway.destroy({id: id, user: req.user.id})
       .exec(function (err, refs) {
         if (err) {
           res.json(err, 400);
         } else {
           res.json(200);
         }
      });
    } else if (type === "eggs") {
      Egg.destroy({id: id, user: req.user.id})
       .exec(function (err, refs) {
         if (err) {
           res.json(err, 400);
         } else {
           res.json(200);
         }
      });
    } else {
      Reference.destroy({id: id, user: req.user.id})
       .exec(function (err, refs) {
         if (err) {
           res.json(err, 400);
         } else {
           res.json(200);
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
        if ((user.name === comment.name) || user.isMod) {
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
      res.json("Not a mod", 403);
      return;
    }

    var refUserId = req.allParams().userId,
        id = req.allParams().id,
        approve = req.allParams().approve;

    User.findOne(refUserId, function (err, refUser) {
      if (!user) {
        res.json("User not found", 404);
        return;
      }
      Reference.findOne(id, function (err, ref) {
        if (!ref) {
          Egg.findOne(id, function (err, ref) {
            if (!ref) {
              Giveaway.findOne(id, function (err, ref) {
                if (!ref) {
                  res.json("Reference not found", 404);
                  return;
                }
                ref.approved = approve;
                ref.save(function(err) {
                  if (!err) {
                    res.json(ref, 200);
                    return;
                  }
                });
              });
            }
            ref.approved = approve;
            ref.save(function(err) {
              if (!err) {
                res.json(ref, 200);
                return;
              }
            });
          });
        }
        ref.approved = approve;
        ref.save(function(err) {
          if (!err) {
            res.json(ref, 200);
            return;
          }
        });
      })
    });
  },

  saveFlairs: function (req, res) {
    var flairs = req.allParams().flairs;
    if(!req.user.isMod) {
      res.json(403);
      return;
    }

    Flair.destroy({}, function (err, removed) {
      var promises = [],
          added = [];
      flairs.forEach(function (flair) {
        if (flair.name) {
          promises.push(
            Flair.create(flair, function (err, newFlair) {
              added.push(newFlair);
            })
          );
        }
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

