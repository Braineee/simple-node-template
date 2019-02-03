var models = require('../models');
var AWS = require('../general/aws');
var moment = require('moment');
var crypto = require('crypto');
var rp = require('request-promise');
var btoa = require('btoa');
var Base64 = require('js-base64').Base64;

var encryptionHelper = require('../general/simpleEncryption');
var encAlgorithm = encryptionHelper.CIPHERS.AES_256;
var encPassword = "123lmnoPq490abcdefg5678hiJkrstuv";
var encNonce = crypto.randomBytes(16);


var General = {};

//AWS signed url
General.GetSignedURL = async function(req, res){
    var fileName = req.query.file_name;
    var fileType = req.query.file_type;
    await AWS.GetSignedURL(fileName, fileType).then(function(response){
        res.send(response);
    }).catch(function(err){
        res.send(err);
    });
}

//get status by alias
General.GetStatusByAlias = function(alias = null, theModel){
    var status = theModel.Status.findOne({where: {alias: alias}}).then(function(status){
        return status;
    }).catch(function(err){
        return false;
    });

    return status;
}

General.RandomAlphaNumeric = function(){
    return Math.random().toString(36).substr(6);
}

//generate tracking no
General.GenerateTrackingNo = function(){
    var date = moment();
    var trackingNo = `${date.format('ddd').toUpperCase()}${date.format('gg')}${this.RandomAlphaNumeric().toUpperCase()}${date.format('A').toUpperCase()}${date.format('SSS')}`;
    return trackingNo;
}

General.hexToBase64 = function(str) {
    return btoa(String.fromCharCode.apply(null,
    str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}



//encrypt balance
General.EncryptBalance = function(balance){
    /*var cipher = crypto.createCipheriv(encAlgorithm, encPassword, encNonce);
    var crypted = cipher.update(balance,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;*/

    /*encryptionHelper.getKeyAndIV(encPassword, function(data){
        var encText = encryptionHelper.encryptText(encAlgorithm, data.key, data.iv, balance, "base64");
        return encText;
    });*/

    var ciphertext = Base64.encode(balance);
    return ciphertext;
}

//decrypt balance
General.DecryptBalance = function(ciphertext){
    
    /*var decipher = crypto.createDecipheriv(encAlgorithm, encPassword, encNonce);
    decipher.setAutoPadding(false);
    var dec = decipher.update(ciphertext,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;*/

    
    var plaintext = Base64.decode(ciphertext).toString();
    return plaintext;
}

//fund a user's easytruck wallet
/*General.FundUserAccount = function(theModel, userId = null, amount = null){
    if(!userId || !amount) return {success: false, message: 'Please provide required fields'};

    amount = parseFloat(amount);
    if(!amount || amount < 1) return {success: false, message: 'Amount cannot be empty'};

    //find user
    theModel.User.findByPk(userId)
    .then(function(user){
        if(!user) return {success: false, message: 'Found no user with this ID'};

        var currentBalance = user.balance;
        console.log("CURRENT BALANCE", currentBalance)
        var newBalance = parseFloat(parseFloat(currentBalance) + parseFloat(amount));
        console.log("NEW BALANCE", newBalance)
        user.update({balance: newBalance});
        return {success: true, message: 'Balance update successful'};
    }).catch(function(err){
        return {success: false, message: 'Error occurred while looking for user'};
    })
}

//deduct a user's easytruck wallet
General.DeductUserAccount = function(theModel, userId = null, amount = null){
    if(!userId || !amount) return {success: false, message: 'Please provide required fields'};

    amount = parseFloat(amount);
    if(!amount || amount < 1) return {success: false, message: 'Amount cannot be empty'};

    //find user
    theModel.User.findByPk(userId)
    .then(function(user){
        if(!user) return {success: false, message: 'Found no user with this ID'};

        var currentBalance = user.balance;
        var newBalance = parseFloat(parseFloat(currentBalance) - parseFloat(amount));
        user.update({balance: newBalance});
        return {success: true, message: 'Balance update successful'};
    }).catch(function(err){
        console.log(err)
        return {success: false, message: 'Error occurred while looking for user'};
    })
}*/

module.exports = General;