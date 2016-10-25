var mongodb = require('./db');

function Article(username, title, content) {
  this.username = username;
  this.title = title;
  this.content = content;
}

module.exports = Article;

Article.prototype.save = function(callback) {
  var date = new Date();
  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + '-' + (date.getMonth() + 1),
    day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
    minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
      date.getHours() + '-' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  };
  var article = {
    username: this.username,
    time: time,
    title: this.title,
    content: this.content
  };
  mongodb.open(function(err, db) {
    if(err) {
      return callback(err);
    }
    db.collection('articles', function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collection.insert(article, {safe: true}, function(err) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

Article.get = function(username, callback) {
  mongodb.open(function (err, db) {
    if(err) {
      callback(err);
    }
    db.collection('articles', function (err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if(username) {
        query.username = username;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};
