var crypto = require('crypto'),
    User = require('../models/user.js'),
    Article = require('../models/article.js');

/* GET home page. */
module.exports = function(app) {
  app.get('/', function(req, res) {
    Article.get(null, function(err, articles) {
      if(err) {
        articles = [];
      }
      res.render('index', {
        title: '主页',
        user: req.session.user,
        articles: articles,
        success: req.flash('success').toString(),
        err: req.flash('err').toString()
      });
    });
  });

  app.get('/register', checkNotLogin);
  app.get('/register', function(req, res) {
    res.render('auth/register', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      err: req.flash('err').toString()
    });
  });

  app.post('/register', checkNotLogin);
  app.post('/register', function(req, res) {
    var username = req.body.username,
        password = req.body.password,
        password_re = req.body.password_re,
        email = req.body.email;
    if(password_re != password) {
      req.flash('err', 'Two time is not same');
      return res.redirect('/register');
    }
    //md5
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      username: username,
      password: password,
      email: email
    });
    //confirm whether this user is existed
    User.get(newUser.username, function(err, user) {
      if(err) {
        req.flash('err', err);
        return res.redirect('/');
      }
      if(user) {
        req.flash('err', 'user is existed');
        console.log('existed');
        return res.redirect('/register');
      }
      newUser.save(function(err, user) {
        if(err) {
          req.flash('err', err);
          return res.redirect('/register');
        }
        req.session.user = newUser;
        req.flash('success', 'register successfully');
        res.redirect('/');
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res) {
    res.render('auth/login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      err: req.flash('err').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.username, function (err, user) {
      if (!user) {
        req.flash('err', '用户不存在!');
        return res.redirect('/login');//用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('err', '密码错误!');
        return res.redirect('/login');//密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/');//登陆成功后跳转到主页
    });
  });

  app.get('/post', checkLogin);
  app.get('/post', function(req, res) {
    res.render('article/post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      err: req.flash('err').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', function(req, res) {
    var currentUser = req.session.user,
        article = new Article(
          currentUser.username,
          req.body.title,
          req.body.content
        );
    article.save(function(err) {
      if(err) {
        req.flash('err', err);
        return res.redirect('/');
      }
      req.flash('success', 'post successfully');
      res.redirect('/');
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', 'Logout successfully');
    res.redirect('/');
  });

  function checkLogin(req, res, next) {
    if(!req.session.user) {
      req.flash('err', 'please login');
      res.redirect('/login');
    }
    console.log('logout-error');
    next();
  }

  function checkNotLogin(req, res, next) {
    if(req.session.user) {
      req.flash('err', 'logined');
      res.redirect('back');
    }
    next();
  }
};