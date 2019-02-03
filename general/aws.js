var AWS = require('aws-sdk');
var bucketName = '';

const IAM_USER_KEY = '';
const IAM_USER_SECRET = '';

var EasytruckAWS = {};


EasytruckAWS.initializeS3 = (bucketName) => {
    let s3bucket = new AWS.S3({
        signatureVersion: 'v4',
        region: 'eu-central-1',
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: bucketName,
    });

    return s3bucket;
}


console.log("Trying to initialize S3");
let s3 = EasytruckAWS.initializeS3(bucketName);

EasytruckAWS.uploadToS3 = (file, bucketName) => {

    return new Promise(function(resolve, reject){

        var params = {
            ACL: 'public-read',
            Bucket: bucketName,
            Key: file.name,
            ContentType: file.mimetype,
            Body: file.data,
        };
        console.log(params);
        s3.upload(params, function (err, data) {
            if (err) {
                console.log('error in callback', err);
                reject(err);
            } else {
                console.log('successfully uploaded file to AWS', data);
                resolve(data);
            }
        });

    })
    
}


//Get Signed URL
EasytruckAWS.GetSignedURL = (fileName, fileType) => {

    return new Promise(function(resolve, reject){
        var options = {
            Bucket: bucketName,
            Key: fileName,
            Expires: 600,
            ContentType: fileType,
            ACL: 'public-read'
        }
    
        s3.getSignedUrl('putObject', options, function(err, data){
            if(err) return reject({success: false, message: 'Error with S3'});
      
            return resolve({success: true, signed_request: data, url: 'https://' + bucketName + '.s3.amazonaws.com/' + fileName});
        })
    })

}


EasytruckAWS.ListObjects = () => {
    s3.listBuckets({}, function (err, data) {
        if (err) {
            return { "error": err };
        }

        console.log(data);
        return data;
    });
}


module.exports = EasytruckAWS;