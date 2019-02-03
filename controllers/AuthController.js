var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var moment = require('moment');
var config = require('../config');
var models = require('../models');
var generalFunctions = require('../general/funcs');
var Mailer = require('../general/sendmail');
var GeneralController = require('../controllers/GeneralController');

var AuthController = {};

AuthController.ReturnModel = function(){
    return models.Setting;
}

// create an account for new user
AuthController.Register = async function(req, res){
    if(!req.body.groupId) return res.json({success: false, message: 'Please provide group ID', responseType: 'invalid_group_id'});

    // collect the group ID
    var groupID = req.body.groupID;

    // check if the username and password is present
    if(!req.body.email || req.body.password){ 
        return res.json({success: false, message: 'Provide a valid email and password', responseType: 'invalid_credentials'});
    }else{
        // collect the email and the password
        let username = req.body.email;
        let password = req.body.password;

        // check if the group id is valid
        models.Group.findByPk(groupID).then(function(group){
            if(group == null){
                return res.json({success: false, message: 'Group ID cannot be empty', responseType: 'invalid_group_id'});
            }else{

                // check if the user exists before
                models.User.findOne({where: {username: username}})
                .then(async function(user){
                    if(user !== null){
                        return res.json({success: false, message: 'This account already exists', responseType: 'account_exists_already'});
                    }else{
                        // proccess the account 
                        let data = req.body;
                        let token = generalFunctions.createFourDigitsCode();
                        data['token'] = token;

                        // has password
                        let hashedPassword = bcrypt.hashSync(password, 8);
                        data['password'] = hashedPassword;

                        // save formatted username
                        data['username'] = username;

                        // run the sql create
                        models.User.create(data)
                        .then(async function(newUser){
                            return res.json({success: true, message: 'Your account has been created successfully.', responseType: 'true'});
                        }).catch(function(err){
                            console.log(err);
                            return res.json({success: false, message: 'Error exits', responseType: 'error_creating_account'});
                        });
                    }
                });
            }
        });

    }
}



module.exports = AuthController;
