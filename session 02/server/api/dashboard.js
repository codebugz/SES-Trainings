var express = require('express');
var app = express();
var jwt = require('express-jwt');
var bodyParser = require('body-parser'); //bodyparser + json + urlencoder
var morgan  = require('morgan'); // logger
var tokenManager = require('./config/token_manager');
var secret = require('./config/secret');

app.listen(3001);
app.use(bodyParser());
app.use(morgan());

//Routes
var routes = {};
routes.users = require('./route/users.js');


app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost:5000');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});


app.get('/user/all', jwt({secret: secret.secretToken}),tokenManager.verifyToken, routes.users.listAll); 

app.post('/user/register', jwt({secret: secret.secretToken}),tokenManager.verifyToken, routes.users.register); 


app.post('/user/signin', routes.users.signin); 

app.delete('/user/:id', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.users.delete);

app.get('/user/logout', jwt({secret: secret.secretToken}),tokenManager.verifyToken, routes.users.logout); 

console.log('Dashboard API is starting on port 3001');