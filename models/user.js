var mongodb = require('./db');

function User(user) {
  this.username = user.username;
  this.password = user.password;
  this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback) {
  var user = {
    username: this.username,
    password: this.password,
    email: this.email
  };
  mongodb.open(function(err, db) {
    if(err) {
      return callback(err);
    }
    db.collection('users', function(err, collectioin) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collectioin.insert(user, {safe: true}, function(err, user) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null, user[0]);
      });
    });
  });
};

User.get = function(username, callback) {
  mongodb.open(function(err, db) {
    if(err) {
      return callback(err);
    }
    db.collection('users', function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({username: username}, function(err, user) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null, user);
      });
    });
  });
};