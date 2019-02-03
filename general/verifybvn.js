var models = require('../models');
var config = require('../config');

function verifyBvn(req, res, next) {
    var userid = req.userId;
    if (!userid){
        return res.status(403).json({ success: false, message: 'No user Id provided.' });
    }
    
    models.Users.findByPk(userid).then(function(user){
        if(!user) return res.json({success: false, message: 'The user group specified does not exist. Contact support team', responseType:'invalid_user'});

        //check if BVN is verified
        if(!user.isBvnVerified) return res.json({success: false, message: 'BVN not verified', responseType: 'bvn_unverified'});

            
        // if everything good, proceed
        next();

    });
}
module.exports = verifyBvn;