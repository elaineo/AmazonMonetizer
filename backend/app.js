
/**
 * Module dependencies.
 */
require( './db' );

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var engine  = require( 'ejs-locals' );

// all environments
app.set('port', process.env.PORT || 3000);
app.engine( 'ejs', engine );
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/amzn', routes.index);
app.post('/create', routes.create);
app.post( '/destroy', routes.destroy );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Server listening on port ' + app.get('port'));
});
