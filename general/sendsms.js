var rp = require('request-promise');
var moment = require('moment');
var env = process.env.NODE_ENV || 'development';
var africastalking = require(__dirname + '/../config/africastalking.json')[env];
var username = africastalking.username; 
var apiKey = africastalking.apiKey;
var SMS = {};

SMS.Send = function(recipient, message){
    var options = {
        url: `https://api.africastalking.com/restless/send?username=${username}&Apikey=${apiKey}&to=${recipient}&message=${message}`,
        method: 'GET',
        json: true,
        body: {}
    };

    rp(options).then(function(result){
        console.log("SMS Sent", result);
        return result;
    }).caught(function(err){
        console.log("SMS Failed", err);
        return false;
    });
}

//notify customer that is trip was confirmed
SMS.NotifyCustomerOfTripConfirmation = function(data = {}){
    var message = `Your truck request with ${data.businessName} has been initiated. We will attempt to debit your card. Please ensure you have sufficient balance for this transaction. Tracking No: ${data.trackingNo}`;

    return this.Send(data.recipient, message);
}

//notify driver of been assigned a trip
SMS.NotifyDriverOfTripAssignment = function(recipient = null){
    var message = `You have been assigned to take a trip on EasyTruck. Please login to your EasyTruck247 app to start trip.`;

    return this.Send(recipient, message);
}

//notify the customer of failed payment
SMS.NotifyCustomerOfFailedPayment = function(data = {}){
    var message = `Dear ${data.firstName}, We were unable to charge your card for your EasyTruck247 truck request at ${moment().toDate()}. Please make sure your card has enough balance for our next attempt.`;
    return this.Send(data.recipient, message);
}

SMS.NotifyCustomerOfFailedPaystackCharge = function(data = {}){
    var message = `Dear ${data.firstName}, your payment for truck request failed. Our payment provider returned: ${data.paystackMsg}. Please send a mail to info@easytruck247.com for further instructions`;
    return this.Send(data.recipient, message);
}

//notify the customer of successful payment
SMS.NotifyCustomerOfSuccessfulTripPayment = function(data = {}){
    var message = `Dear ${data.firstName}, We have successfully charged your card the amount of N${data.amount} for your truck request. Your payment status has been updated and truck partner has been notified to commence trip. Thank you for choosing EasyTruck247.`;
    return this.Send(data.recipient, message);
}

module.exports = SMS;