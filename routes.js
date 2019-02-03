var express = require('express');
var config = require('./config');
var VerifyToken = require('./general/verifytoken');
var allowOnly = require('./general/routesHelper').allowOnly;

// Bundle the API routes.
var router = express.Router();

//controllers
var AuthController = require('./controllers/AuthController');

var APIRoutes = function() {
    // authentication route
    router.post('/auth/register', () => {return JSON({success: true, message: 'connected to auth register'})});
};

module.exports = APIRoutes;