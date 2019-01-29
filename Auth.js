var passport =require('passport');
var session = require('express-session');

const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt-nodejs');
const GitHubStrategy = require('passport-github').Strategy;

module.exports = function (app, db) {
	
	app.use(session({
	  secret: process.env.SESSION_SECRET||"a secret",
	  resave: true,
	  saveUninitialized: true,
	}));

	//passport 
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser((user, done) => {
        console.log("1.here",user);
   		done(null, user._id);
 	});

	passport.deserializeUser((id, done) => {
		console.log("2.here");
	        db.collection('users').findOne(
	            {_id: new ObjectID(id)},
	            (err, doc) => {
	                done(null, doc);
	            }
	        );
	        //done(null,null);
	});
	
  	passport.use(new LocalStrategy(
 	 function(username, password, done) {
    	db.collection('users').findOne({ username: username }, function (err, user) {
	      console.log('User '+ username +' attempted to log in.');
	      if (err) { return done(err); }
	      if (!user) { return done(null, false); }
	      if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
	      return done(null, user);
    	});
  	}
	));
	passport.use(new GitHubStrategy({
	    clientID: process.env.GITHUB_CLIENT_ID||"3cd2effcde4403d478c0",
	    clientSecret: process.env.GITHUB_CLIENT_SECRET||"032677590f850c5acfbdcba66dc1dad05c4fad3c",
	    callbackURL: "/auth/github/callback"
		},
		function(accessToken, refreshToken, profile, cb) {
		      console.log(profile);
		      //Database logic here with callback containing our user object
		    db.collection('socialusers').findAndModify(
			    {id: profile.id},
			    {},
			    {$setOnInsert:{
			        id: profile.id,
			        name: profile.displayName || 'John Doe',
			        photo: profile.photos[0].value || '',
			        email: profile.email || 'No public email',
			        created_on: new Date(),
			        provider: profile.provider || ''
			    },$set:{
			        last_login: new Date()
			    },$inc:{
			        login_count: 1
			    }},
			    {upsert:true, new: true},
			    (err, doc) => {
			        return cb(null, doc.value);
			    }
			);
		}
	));

}