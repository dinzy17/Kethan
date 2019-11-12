const fs = require('fs')
const AWS = require('aws-sdk')
const constants =  require('./constants')

const s3 = new AWS.S3({
    accessKeyId: constants.aws.accessKey,
    secretAccessKey: constants.aws.secretAccessKey
});

const uploadFile = (filename, path) => {
  console.log(filename)
  return new Promise(function(resolve, reject) {
    console.log(__dirname + '/images/'+filename)
    if (fs.existsSync(__dirname + '/images/'+filename)) {
      console.log("File exists")
     fs.readFile(__dirname + '/images/' + filename, (err, data) => {
       if (err){
         console.log(err)
         reject(err)
       }
       const params = {
          Bucket: constants.aws.bucket,
          Key: path + filename,
          Body: data
       }
       console.log("Reading file")
       s3.upload(params, function(s3Err, data) {
         if (s3Err) {
           console.log(s3Err)
           return s3Err
         } else {
           console.log(`File uploaded successfully at ${data.Location}`)
           fs.unlink(__dirname + '/images/' + filename, (err) => {
             if (err){
               reject(err)
             }
             else {
               console.log("File removed from local")
             }
             resolve(data);
           })
         }
       })
     })
    } else {
      reject("Some error occured.")
    }
  })
}
module.exports = { uploadFile }
