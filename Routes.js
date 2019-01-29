var passport =require('passport');
const bcrypt = require('bcrypt-nodejs');
const GitHubStrategy = require('passport-github').Strategy;

module.exports = function (app, db) {
	app.get('/auth/github',
  		passport.authenticate('github'));

	app.get('/auth/github/callback', 
  		passport.authenticate('github', { failureRedirect: '/' }),
  		function(req, res) {
    		// Successful authentication, redirect home.
    		res.redirect('/profile');
  	});
	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) {
	      return next();
	  }
	  res.redirect('/');
	};

	app.route('/login')
          .post(passport.authenticate('local', { failureRedirect: '/' }),(req,res) => {
               res.redirect('/profile');
          });

	app.route('/profile')
  		.get(ensureAuthenticated, (req,res) => {
       res.render(process.cwd() + '/views/pug/profile',{user: req.user});
  	});
  	app.route('/logout')
	  .get((req, res) => {
	      req.logout();
	      res.redirect('/');
	});
	app.route('/register')
	  .post((req, res, next) => {
	      db.collection('users').findOne({ username: req.body.username }, function (err, user) {
	          if(err) {
	              next(err);
	          } else if (user) {
	              res.redirect('/');
	          } else {
	          	console.log("here",req.body.password);
	          	var salt = bcrypt.genSaltSync(10);
	          	//console.log(type(salt));
	          	var hash = bcrypt.hashSync(req.body.password, salt);
	          	console.log("h", hash);
	              db.collection('users').insertOne(
	                {username: req.body.username,
	                 password: hash},
	                (err, doc) => {
	                    if(err) {
	                        res.redirect('/');
	                    } else {
	                        next(null, user);
	                    }
	                }
	              )
	          }
	      })},
	    passport.authenticate('local', { failureRedirect: '/' }),
	    (req, res, next) => {
	        res.redirect('/profile');
	    }
	);
	app.route('/')
	  .get((req, res) => {
	    res.render(process.cwd() + '/views/pug/index.pug', {title: 'Hello', message: 'Please login', 
	    														showRegistration: true,showLogin: true});
	});

	app.use((req, res, next) => {
	  res.status(404)
	    .type('text')
	    .send('Not Found');
	});

}