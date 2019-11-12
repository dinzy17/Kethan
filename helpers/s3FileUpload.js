const fs = require('fs')
const AWS = require('aws-sdk')
const constants =  require('./../config/constants')

const s3 = new AWS.S3({
    accessKeyId: constants.aws.key,
    secretAccessKey: constants.aws.secretAccessKey
});

const uploadFileBace64 = (fileData, fileName, public = false) => {
  const data = new Buffer(fileData.replace(/^data:image\/\w+;base64,/, ""),'base64')
  return new Promise(function(resolve, reject) {
      const params = {
          Bucket: constants.aws.bucket,
          Key: fileName,
          Body: data
       }
       if(public) {
        params.ACL = 'public-read'
       }
       s3.upload(params, function(s3Err, data) {
         if (s3Err) {
           return s3Err
         }
      })
  })
}

module.exports = { uploadFileBace64 }
