var express = require('express')
var router = express.Router()
var async = require('async')
const User = require('./../models/User')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const auth = require('./../helpers/authMiddleware');
var multer  = require('multer')
var multipartUpload = multer({storage: multer.diskStorage({
    destination: function (req, file, callback) { callback(null, './tmp');},
    filename: function (req, file, callback) { callback(null, file.fieldname + '-' + Date.now() + '.png')}})
}).single('implantPicture')

//function to test
router.post("/test", multipartUpload, function (req, res, next) {
  // req.body contains the text fields
  res.send(resFormat.rSuccess(req.body))
})



module.exports = router
