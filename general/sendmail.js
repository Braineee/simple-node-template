var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');
var generalFunctions = require('./funcs');
var DEFAULT_EMAIL_SENDER = process.env.DEFAULT_EMAIL_SENDER;
var SMTP_USERNAME = process.env.SMTP_USERNAME;
var SMTP_PASSWORD = process.env.SMTP_PASSWORD;
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

var MailController = {};

var env = process.env.NODE_ENV || "development";

var smtpConfig = {
    host: 'email-smtp.eu-west-1.amazonaws.com',
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD
    }
};

var transporter = nodemailer.createTransport(smtpConfig);


var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};


MailController.sendTemplatedMail = async function(templateName = null, data = {}, recipient = null,subject = null){
    
    readHTMLFile('public/emailtemplates/header.html', function(err, headerHtml){
        var header = headerHtml;

        readHTMLFile('public/emailtemplates/footer.html', function(err, footerHtml){
            var footer = footerHtml;

            readHTMLFile(`public/emailtemplates/${templateName}`, function(err, html) {
                var template = handlebars.compile(header + html + footer);
                var replacements = data;
                var htmlToSend = template(replacements);

                var mailOptions = {
                    from: `EasyTruck247 <${DEFAULT_EMAIL_SENDER}>`,
                    to : recipient,
                    subject : subject,
                    html : htmlToSend
                };

                //NEW WAY VIA SENDGRID
                sgMail.send(mailOptions).then(function(d){
                    console.log("MAIL SENDING SUCCESSFUL", d);
                    return true;
                }).catch(function(err){
                    console.log("MAIL SENDING FAILED", err);
                    return false;
                });


                //OLD WAY OF SENDING VIA AWS SES
                /*
                 transporter.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log("Error occurred:", error);
                        return error;
                    } else {
                        console.log("Response received: ", response);
                        return response;
                    }
                });*/


            });
        });
    });
}

//notify business of successful trip payment by customer
MailController.notifyBusinessOfCustomerTripPayment = function(trip){
    var url = generalFunctions.getURL();
    var tripDetailsURL = url + 'trips/view/' + trip.id;
    var MailTemplateName = 'notifyBusinessOfCustomerTripPayment.html';
    var MailData = {
        originName: trip.originName,
        destName: trip.destName,
        businessName: trip.Truck.business.businessName,
        tripDetailsURL: tripDetailsURL
    };
    var MailRecipient = trip.Truck.business.email;
    var MailSubject = `Payment Received in Escrow - Truck Request`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of truck approval
MailController.notifyBusinessOfTruckApproval = function(truck){
    var url = generalFunctions.getURL();
    var manageTrucksURL = url + 'my-trucks';
    var MailTemplateName = 'notifyBusinessOfTruckApproval.html';
    var MailData = {
        vehicleRegNo: truck.vehicleRegNo,
        businessName: truck.business.businessName,
        manageTrucksURL: manageTrucksURL
    };
    var MailRecipient = truck.business.email;
    var MailSubject = `Truck Approval - ${MailData.vehicleRegNo} approved`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of truck rejection
MailController.notifyBusinessOfTruckRejection = function(truck, comment){
    var url = generalFunctions.getURL();
    var manageTrucksURL = url + 'my-trucks';
    var MailTemplateName = 'notifyBusinessOfTruckRejection.html';
    var MailData = {
        vehicleRegNo: truck.vehicleRegNo,
        businessName: truck.business.businessName,
        manageTrucksURL: manageTrucksURL,
        comment: comment
    };
    var MailRecipient = truck.business.email;
    var MailSubject = `Truck Approval - ${MailData.vehicleRegNo} rejected`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of account activation
MailController.notifyBusinessOfAccountActivation = function(user){
    var url = generalFunctions.getURL();
    var editProfileURL = url + 'editprofile';
    var MailTemplateName = 'notifyBusinessOfAccountActivation.html';
    var MailData = {
        businessName: user.businessName,
        editProfileURL: editProfileURL
    };
    var MailRecipient = user.email;
    var MailSubject = `Welcome to EasyTruck247 - Account activated`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//customer welcome message
MailController.customerWelcomeMessage = function(user){
    var MailTemplateName = 'customerWelcomeMessage.html';
    var MailData = {
        firstName: user.firstName
    };
    var MailRecipient = user.email;
    var MailSubject = `Welcome to EasyTruck247`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of new trip
MailController.notifyBusinessOfNewTrip = function(bid, tripId){
    var url = generalFunctions.getURL();
    var tripDetailsURL = url + 'trips/view/' + tripId;
    var MailTemplateName = 'notifyBusinessOfNewTrip.html';
    var MailData = {
        originName: bid.Request.originName,
        destName: bid.Request.destName,
        businessName: bid.Truck.business.businessName,
        tripDetailsURL: tripDetailsURL
    };
    var MailRecipient = bid.Truck.business.email;
    var MailSubject = `Trip acceptance - ${MailData.originName} to ${MailData.destName}`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of declined bid
MailController.notifyBusinessOfDeclinedBid = function(bid){
    var MailTemplateName = 'notifyBusinessOfDeclinedBid.html';
    var MailData = {
        originName: bid.Request.originName,
        destName: bid.Request.destName,
        businessName: bid.Truck.business.businessName
    };
    var MailRecipient = bid.Truck.business.email;
    var MailSubject = `Trip offer declined - ${MailData.originName} to ${MailData.destName}`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of new dispute
MailController.notifyAllOfNewDispute = function(details){
    var url = generalFunctions.getURL();
    var disputeURL = url + 'disputes/view/' + details.disputeId;
    var MailTemplateName = 'notifyAllOfNewDispute.html';
    var MailData = {
        originName: details.originName,
        destName: details.destName,
        disputersName: details.disputersName,
        name: details.name,
        comment: details.comment,
        disputeURL: disputeURL
    };
    var MailRecipient = details.email;
    var MailSubject = `Trip Dispute Raised - ${MailData.originName} to ${MailData.destName}`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of new dispute message
MailController.notifyAllOfNewDisputeMessage = function(details){
    var url = generalFunctions.getURL();
    var disputeURL = url + 'disputes/view/' + details.disputeId;
    var MailTemplateName = 'notifyAllOfNewDisputeMessage.html';
    var MailData = {
        originName: details.originName,
        destName: details.destName,
        disputersName: details.disputersName,
        name: details.name,
        comment: details.comment,
        disputeURL: disputeURL
    };
    var MailRecipient = details.email;
    var MailSubject = `New Dispute Message - ${MailData.originName} to ${MailData.destName}`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of dispute resolved or cancelled
MailController.notifyAllOfDisputeStatusChanged = function(details){
    var MailTemplateName = 'notifyAllOfDisputeStatusChanged.html';
    var MailData = {
        originName: details.originName,
        destName: details.destName,
        name: details.name,
        status: details.status,
    };
    var MailRecipient = details.email;
    var MailSubject = `Dispute ${MailData.status} - ${MailData.originName} to ${MailData.destName}`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business that his/her EasyTruck247 wallet has been credited
MailController.notifyBusinessOfTripPayout = function(details){
    var MailTemplateName = 'notifyBusinessOfTripPayout.html';
    var MailData = details;
    var MailRecipient = details.email;
    var MailSubject = `Payout Received - ${details.originName} to ${details.destName}`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify customer that his/her trip is completed
MailController.notifyCustomerOfTripCompletion = function(details){
    var MailTemplateName = 'notifyCustomerOfTripCompletion.html';
    var MailData = details;
    var MailRecipient = details.email;
    var MailSubject = `Trip Completed - ${details.originName} to ${details.destName}`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of account approval
MailController.notifyBusinessOfAccountApproval = function(user){
    var url = generalFunctions.getURL();
    var dashboardURL = url + 'dashboard';
    var MailTemplateName = 'notifyBusinessOfAccountApproval.html';
    var MailData = {
        businessName: user.businessName,
        dashboardURL: dashboardURL
    };
    var MailRecipient = user.email;
    var MailSubject = `Congratulations! Account Approved`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

//notify business of account approval
MailController.notifyBusinessOfAccountUnapproval = function(user, comments){
    var MailTemplateName = 'notifyBusinessOfAccountUnapproval.html';
    var MailData = {
        businessName: user.businessName,
        comments: comments
    };
    var MailRecipient = user.email;
    var MailSubject = `Account Unapproved`;

    return this.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
}

module.exports = MailController;