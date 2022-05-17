var express = require('express');
var router = express.Router();
const keycloak = require('../config/keycloak-config.js').getKeycloak();


function protectBySection(token, request) {
    return token.hasRole('admin') || token.hasRole('user') || token.hasRole('guest');
  }


router.get('/admin', keycloak.protect('admin'), function (req, res) {
    res.send('Welcome Admin roles users to Express js!');
});

router.get('/user', keycloak.protect('user'), function (req, res) {
    res.send('Welcome User roles users to Express js!');
});

router.get('/guest', keycloak.protect('guest'), function (req, res) {
    res.send('Welcome Guest roles users to Express js!');
});

router.get('/all-user', keycloak.protect(protectBySection), function (req, res) {
    res.send('Welcome All Users of admin,user,guest roles in keycloak to Express js!');
});


router.get('/', keycloak.protect(), function (req, res) {
    res.send('Welcome to all keycloak users to Express js!');
});




module.exports = router;