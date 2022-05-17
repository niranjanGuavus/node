var express = require('express');
var session = require('express-session');
var app = express();

const keycloakConfig = require('./config/keycloak-config.js');
const keycloak = keycloakConfig.initKeycloak();
const memoryStore = keycloakConfig.getMemoryStore();

//session
app.use(session({
   secret:'thisShouldBeLongAndSecret',
   resave: false,
   saveUninitialized: true,
   store: memoryStore
 }));

app.use(keycloak.middleware());

const testController = require('./controller/test-controller.js');
app.use('/test', testController);

app.get('/', function(req, res){
   res.send("Nodejs with Express Server is up and running!");
});


app.use( keycloak.middleware( { logout: '/'} ));


//app.listen(3000);