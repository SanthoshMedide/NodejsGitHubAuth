'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const routes = require('./Routes.js');
const auth = require('./Auth.js');

var passport =require('passport');
var session = require('express-session');

const app = express();
//mongo 
const mongo = require('mongodb').MongoClient;

fccTesting(app); //For FCC testing purposes

app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




mongo.connect(process.env.DATABASE||"mongodb://localhost/test11", {user: 'santhosh', pass: 'santhosh@12345'},(err, db) => {
    if(err) {
        console.log('Database error: ' + err);
    } else {
        console.log('Successful database connection');

        //serialization and app.listen
    auth(app,db);
  	routes(app, db);
	app.listen(3901, () => {
	  console.log("Listening on port ");
	});


}});



