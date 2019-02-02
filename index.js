require("dotenv").load();

var express = require('express');
    port = process.env.PORT || 3000;// check if the port is working or not
    bodyParser = require('body-parser');
    morgan = require('morgan');//for displaying errors
    
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(morgan('dev'));//call morgan for development purposes only

//CORS
// Add headers
app.use(function (req, res, next){

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request method you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET , POST, OPTIONS, PUT, PATCH, DELETE' );

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    // Set to true if you need the website to include cookies in the request sent to -
    // the API (e.g. in case tou use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    //Pass to next layer of middelware
    next();
});

// server static files
app.use(express.static('public'));

// Bundle the API routes.
var router = express.Router();

app.use('/api', require('./routes'));

// start the server
app.listen(port, function(){
    console.log(`The API has started on http://127.0.0.1:${port}/!`);
});

module.exports = router;




