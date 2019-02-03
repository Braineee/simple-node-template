var rp = require('request-promise');

var PushNotification = {};

PushNotification.Send = function(data = {}){
    var options = {
        url: `https://fcm.googleapis.com/fcm/send`,
        method: 'POST',
        json: true,
        body: { 
            "notification": {
                "title": data.title,
                "text": data.message,
                "sound": "default",
                "click_action": (data.clickAction) ? data.clickAction : null
            },
            "data": {},
            "to" : data.deviceId
        },
        headers: {
            Authorization: `key=`
        }
    };

    rp(options).then(function(result){
        console.log("Push Notification Sent", result);
        return result;
    }).caught(function(err){
        console.log("Push Notification Failed", err);
        return false;
    });
}

module.exports = PushNotification;