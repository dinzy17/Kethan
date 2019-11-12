var express = require('express')
app = express()
var fs = require('fs')
var cons = require('consolidate')
var path = require('path')
var multer = require('multer');
var bodyParser = require('body-parser');
var s3 = require("./s3Upload")
var watson = require("./watsonLibrary")
const constants = require('./constants')

app.use(bodyParser.json())
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html')
app.use(express.static(__dirname + '/assets')); 

//multer options
var Storage = multer.diskStorage({ destination: function(req, file, callback) {
      callback(null, "./images")
  }, filename: function(req, file, callback) {
      callback(null, file.fieldname + "_" + file.originalname)
  }
})
var upload = multer({ storage: Storage }).single("image")

app.get('/', (req, res) => {
  res.render('index', { objects: JSON.stringify([{ object: "init"}]) })
})

app.post('/', async (req,res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.end("Something went wrong!");
      } else {
        const newFilename = req.file.fieldname + '_' + req.file.originalname
        const s3Response = await s3.uploadFile(newFilename, 'kethan-demo/')
        const collectionID = constants.watson.collectionID
        const collections = await watson.analyzeImage(collectionID, s3Response.Location)
        const response = collections.data
        let dimensions = { height: 0, width: 0 }
        let objects = []
        if(response.images && response.images.length > 0 && response.images[0].objects && 
           response.images[0].objects.collections && response.images[0].objects.collections.length > 0) {
          objects = response.images[0].objects.collections[0].objects
          dimensions = response.images[0].dimensions
        }
        return res.render('index', {objects: JSON.stringify(objects), imgUrl: s3Response.Location, dimensions: JSON.stringify(dimensions) })
      }
        
    })
    
  } catch (e) {
    console.log(e)
    res.send("Exception: ")
    
  }
  

})

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Server started listening at http://%s:%s", host, port)
})