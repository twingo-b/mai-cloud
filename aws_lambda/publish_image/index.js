'use strict';
console.log('Loading function');

let aws = require('aws-sdk');
let request = require('request-promise');
let jwt = require('jsonwebtoken');
let moment = require('moment-timezone');

let s3 = new aws.S3({ apiVersion: '2006-03-01' });

// SORACOM Endose Keystore
const sora_keystore = 'https://s3-ap-northeast-1.amazonaws.com/soracom-public-keys/';

exports.handler = (event, context, callback) => {
    // console.log('Received event:', JSON.stringify(event, null, 2));
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const head_params = {
        Bucket: bucket,
        Key: key
    };

    let last_modified_date_jst;
    let last_modified_datetime_jst;
    let java_web_token;
    let imsi;
    s3.headObject(head_params).promise().then(function(data) {
        const last_modified = new Date(data.LastModified)
        last_modified_date_jst = moment(last_modified).tz("Asia/Tokyo").format('YYYY-MM-DD');
        last_modified_datetime_jst = moment(last_modified).tz("Asia/Tokyo").format('YYYY-MM-DD-HH-mm-ss');
        console.log('last_modified_datetime_jst: ' + last_modified_datetime_jst);

        const token = data.Metadata['jwt'];
        console.log('token: ' + token);
        java_web_token = token;

        const decoded = jwt.decode(token, {complete: true});
        console.log('jwt: ' + JSON.stringify(decoded, null, 2));

        imsi = decoded.payload['soracom-endorse-claim'].imsi;
        console.log('imsi: ' + imsi);

        const pubkey_url = sora_keystore + decoded.header.kid;
        return request(pubkey_url);
    }).then(function (body) {
        try {
            console.log('jwt verify');
            jwt.verify(java_web_token, body);

            const copy_params = {
                Bucket: bucket,
                Key: 'camera/' + imsi + '/' + last_modified_date_jst + '/' + last_modified_datetime_jst + '.jpg',
                CopySource: bucket + '/' + key,
                ACL: 'public-read',
            };
            console.log('copy_params: ' + JSON.stringify(copy_params, null, 2));
            return s3.copyObject(copy_params).promise();
        } catch(err) {
            console.log(err, err.stack);
            callback('ERROR : Failed to verify web token.');
        }
    }).then(function () {
        const delete_param = {
            Bucket: bucket,
            Key: key
        }
        return s3.deleteObject(delete_param).promise();
    }).catch(function (err) {
        console.log(err);
        const message = 'publish failed: ' + JSON.stringify(head_params);
        console.log(message);
        callback(message);
    });
};

