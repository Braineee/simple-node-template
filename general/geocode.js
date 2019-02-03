var NodeGeocoder = require('node-geocoder');
var distance = require('google-distance');
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var GOOGLEMAPKEY = process.env.GOOGLEMAPKEY;

var GeoFuncs = {};

GeoFuncs.ReverseName = function(lat, long, callback){
    var options = {
        /*provider: 'openstreetmap',
        formatter: 'json',
        email: 'tolu@tradersofafrica.com'*/

        provider: 'google',
        apiKey: GOOGLEMAPKEY,
        formatter: 'json',
        email: 'tolu@tradersofafrica.com'
    };

    var geocoder = NodeGeocoder(options);

    geocoder.reverse({'lat':lat, 'lon':long})
    .then(function(result) {
        var address = result[0]['formattedAddress'] ? result[0]['formattedAddress'] : 'Not available';
        callback(address);
    })
    .catch(function(err) {
        callback('');
    });
}

GeoFuncs.GetNearbyTrucks = function(lat, long, callback){
    
    sequelize.query(
        "SELECT id, businessId, isOnTrip, isOnline, isApproved, isActive, currentLatitude, currentLongitude, 111.045 * DEGREES(ACOS(COS(RADIANS(:lat)) * COS(RADIANS(currentLatitude)) * COS(RADIANS(currentLongitude) - RADIANS(:lng)) + SIN(RADIANS(:lat)) * SIN(RADIANS(currentLatitude)))) AS distance_in_km FROM Trucks HAVING distance_in_km <= 150 AND isOnTrip = false AND isOnline = true AND isApproved = true AND isActive = true ORDER BY distance_in_km DESC", 
        { replacements: { lat: lat, lng: long }, type: Sequelize.QueryTypes.SELECT }
    ).then(function(trucks){

        callback(trucks);

    }).catch(function(err){

        callback([]); 

    });
}

GeoFuncs.GetDistanceBetweenTwoLocations = function(originAddress, destAddress){
    distance.get(
        {
            origin: originAddress,
            destination: destAddress
        },
        function(err, data) {
            if (err) return console.log(err);
            console.log(data);
            return data;
    });
}

module.exports = GeoFuncs;