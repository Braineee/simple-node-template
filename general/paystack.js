var env = process.env.NODE_ENV || "development";
var SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
var BASEURL = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co/";
var crypto = require('crypto');
var config = require('../config');
var rp = require('request-promise');

var Paystack = {};

Paystack.SendRequest = function(data = {}, callback){
    var options = {
        url: `${BASEURL}${data.endpoint}`,
        method: data.method,
        json: true,
        body: data.body,
        headers: {
            'Authorization' : `Bearer ${SECRET_KEY}`,
            'Content-Type' : 'application/json'
        }
    };

    rp(options).then(function(result){

        //console.log("Paystack success", result);
        callback({success: true, data: result});

    }).caught(function(err){

        //console.log("Paystack error", err);
        callback({success: false, data: err});

    });
}

Paystack.FormattedResponse = function(response){
    if(!response.success) return ({success: false, message: 'Failed to process Charge request', data: response.data});

    var paystackResponse = response.data;

    //if paystack did not return success
    var message = (paystackResponse.message) ? paystackResponse.message : 'Payment provider returned transaction as failed';
    if(!paystackResponse.status) return ({success: false, message: message, data: response.data});

    //send the paystack response
    var nextAction = (paystackResponse.data.status) ? paystackResponse.data.status : null;
    return ({
        success: true,
        action: nextAction,
        message: 'Processed',
        data: paystackResponse.data
    })
}

Paystack.ReturnResponse = function(data, callback){
    this.SendRequest(data, function(response){

        var formattedResponse = Paystack.FormattedResponse(response);
        callback(formattedResponse);

    });
}

//bulk charge
Paystack.BulkCharge = function(chargeData = [], callback){
    if(chargeData.length < 1) return callback({success: false, message: 'Please provide charge data'});

    var data = {
        endpoint: 'bulkcharge',
        method: 'POST',
        body: chargeData
    }

    this.ReturnResponse(data, function(result){
        return callback(result);
    });
}

//fetch bulk charge data
Paystack.FetchBulkCharge = function(batchCode, callback){
    if(!batchCode) return callback({success: false, message: 'Please provide batch code'});

    var data = {
        endpoint: `bulkcharge/${batchCode}/charges`,
        method: 'GET',
        body: {}
    }

    this.ReturnResponse(data, function(result){
        return callback(result);
    });
}

//charge a card
Paystack.ChargeWithCard = function(body = {}, callback){
    if(!body.amount && !body.email && !body.cardno && !body.cvv && !body.expiryMonth && !body.expiryYear && !body.pin) return callback({success: false, message: 'Please provide required details'});

    console.log("CARD DATA", body);

    var data = {
        endpoint: 'charge',
        method: 'POST',
        body: {
            email: body.email,
            amount: body.amount,
            card:{
              cvv: body.cvv,
              number: body.cardno,
              expiry_month: body.expiryMonth,
              expiry_year: body.expiryYear
            },
            pin: body.pin
        }
    }

    
    this.ReturnResponse(data, function(result){
        callback(result, data.body);
    });

}

//charge with Authorization token
Paystack.ChargeWithAuthToken = function(body = {}, callback){
    if(!body.amount || !body.authToken || !body.email) return callback({success: false, message: 'Please provide amount and authorization token'});

    var chargeData = {
        email: body.email,
        amount: body.amount,
        metadata:{
            custom_fields: (body.customFields) ? body.customFields : []
        },
        authorization_code: body.authToken,
    }

    if(body.pin){
        chargeData['pin'] = body.pin;
    }

    var data = {
        endpoint: 'charge',
        method: 'POST',
        body: chargeData
    }

    
    this.ReturnResponse(data, function(result){
        callback(result);
    });
}

//submit PIN
Paystack.SubmitPIN = function(reference = null, pin = null, callback){
    //check if required fields were provider
    if(!reference && !pin) return ({success: false, message: 'Please provide required details'});

    var data = {
        endpoint: 'charge/submit_pin',
        method: 'POST',
        body: {
            pin: pin,
            reference: reference
        }
    }

    this.ReturnResponse(data, function(result){
        callback(result);
    });
}

//submit OTP
Paystack.SubmitOTP = function(reference = null, otp = null, callback){
    //check if required fields were provider
    if(!reference && !otp) return ({success: false, message: 'Please provide required details'});

    var data = {
        endpoint: 'charge/submit_otp',
        method: 'POST',
        body: {
            otp: otp,
            reference: reference
        }
    }

    this.ReturnResponse(data, function(result){
        callback(result);
    });
}

//submit phone
Paystack.SubmitPhone = function(reference = null, phone = null, callback){
    //check if required fields were provider
    if(!reference && !phone) return ({success: false, message: 'Please provide required details'});

    var data = {
        endpoint: 'charge/submit_phone',
        method: 'POST',
        body: {
            phone: phone,
            reference: reference
        }
    }

    this.ReturnResponse(data, function(result){
        callback(result);
    });
}

//submit birthday
Paystack.SubmitBirthday = function(reference = null, birthday = null, callback){
    //check if required fields were provider
    if(!reference && !birthday) return ({success: false, message: 'Please provide required details'});

    var data = {
        endpoint: 'charge/submit_birthday',
        method: 'POST',
        body: {
            birthday: birthday,
            reference: reference
        }
    }

    this.ReturnResponse(data, function(result){
        callback(result);
    });
}

//check pending charge
Paystack.CheckPendingCharge = function(reference = null, callback){
    //check if required fields were provider
    if(!reference) return ({success: false, message: 'Please provide transaction reference id'});

    var data = {
        endpoint: `charge/${reference}`,
        method: 'GET',
        body: {}
    }

    this.ReturnResponse(data, function(result){
        callback(result);
    });
}

//list all banks
Paystack.ListAllBanks = function(callback){
    var data = {
        endpoint: 'bank'
    }
    this.ReturnResponse(data, function(result){
        callback(result);
    });
}

//resolve a bank account
Paystack.ResolveBankAccount = function(accountNo = null, bankCode = null, callback){
    var data = {
        endpoint: `bank/resolve?account_number=${accountNo}&bank_code=${bankCode}`
    }
    this.ReturnResponse(data, function(result){
        callback(result);
    });
}

//create transfer recipient for bank transfers or reconciliation purpose
Paystack.CreateTransferRecipient = function(postdata = {}, callback){
    var data = {
        endpoint: 'transferrecipient',
        method: 'POST',
        body: postdata
    }
    this.ReturnResponse(data, function(result){
        return callback(result);
    });
}

//transfer money to bank account
Paystack.Transfer = function(postdata = {}, callback){
    if(!postdata.recipient || !postdata.amount) return callback({success: false, message: 'Please provide recipient and amount'});

    var postAmount = parseFloat(postdata.amount);

    if(!postAmount || postAmount < 1) return callback({success: false, message: 'Amount cannot be empty'});

    var koboValue = parseFloat(postAmount * parseFloat(100));
    var data = {
        endpoint: 'transfer',
        method: 'POST',
        body: {
            source: 'balance',
            reason: (postdata.narration) ? postdata.narration : 'Trip payout',
            amount: koboValue,
            recipient: postdata.recipient
        }
    }
    this.ReturnResponse(data, function(result){
        return callback(result);
    });
}

module.exports = Paystack;