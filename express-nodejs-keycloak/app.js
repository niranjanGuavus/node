var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

 var session = require('express-session');
 var Keycloak = require('keycloak-connect');


var app = express();

 var memoryStore = new session.MemoryStore();
 var keycloak = new Keycloak({ store: memoryStore });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(session({
  secret:'thisShouldBeLongAndSecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

app.use(keycloak.middleware());


app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/admin', keycloak.protect('admin'), function (req, res) {
  res.send('Welcome Admin to Express js!');
});

app.get('/user',  keycloak.protect('user'), function (req, res) {
  res.send('Welcome User to Express js!');
});

app.get('/guest', keycloak.protect('guest'),function (req, res) {
  res.send('Welcome Guest to Express js!');
});


 app.use( keycloak.middleware( { logout: '/'} ));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
