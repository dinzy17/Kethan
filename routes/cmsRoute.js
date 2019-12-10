var express = require('express')
var router = express.Router()
var async = require('async')
const { isEmpty } = require('lodash')
const Cms = require('./../models/Cms')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')

//function to create or register new user
async function modify(req, res) {
        for (var i=0; i<req.body.length; i++) {
            let cmsPages = await Cms.findOne({
                "id": req.body[i].id
              })
              if (cmsPages) {
                var params = {
                    content: req.body[i].content,
                    modifiedOn: new Date()
                  }
                await Cms.updateOne({ id: req.body[i].id }, { $set: params })
            } else {
                saveData(i);    
            }
        }
        function saveData(i){
            var cms = new Cms();
            cms.id = req.body[i].id
            cms.pageName = req.body[i].pageName
            cms.content = req.body[i].content
            cms.createdOn = new Date()
            cms.modifiedOn = new Date()
            cms.save()  
        }
        res.send(resFormat.rSuccess())
  }

//function to get list of user as per given criteria
async function getPages (req, res) {
    let cmsList = await Cms.find();
    if(cmsList){
        res.send(resFormat.rSuccess({ cmsList}))
    } else {
        res.status(401).send(resFormat.rError(err))
    }
}


router.post("/modify", modify)
router.post("/getPages", getPages)


module.exports = router
