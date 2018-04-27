var express = require('express'),
  app = express(),
  port = process.env.PORT || 8889;
  bodyParser = require('body-parser');
  //swagger docs
  swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger/swagger.json');

//use the body parser to get request parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//register the routes
var f = require('./scripts/functions.js') ;

var routes = function(app){
  app.route('/sendEmail').post(f.sendRequestEmail)
};

routes(app);

//use the swagger docs
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//start app
app.listen(port);
console.log('Email application started on: ' + port);
