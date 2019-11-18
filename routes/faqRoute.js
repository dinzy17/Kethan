var express = require('express')
var router = express.Router()
var async = require('async')
const { isEmpty } = require('lodash')
const Faq = require('./../models/Faq')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')

//function to create or register new user
async function create(req, res) { 
    var faq = new Faq();
    if(req.body.question == undefined || req.body.answer == undefined){
        res.send(resFormat.rError("All field required"));
    }else if(req.body.question == "" ||  req.body.answer == ""){
        res.send(resFormat.rError("All field required"));
    } else{
        faq.question = req.body.question
        faq.answer = req.body.answer
        faq.createdOn = new Date();
        faq.modifiedOn = new Date();
        faq.save(async function(err, newFaq) {
        if (err) {
            res.send(resFormat.rError(err))
        } else {
            res.send(resFormat.rSuccess(newFaq))
        }
        })
    } 
  }

  //function to create or register new user
async function update(req, res) { 
    var faq = new Faq();
    if((req.body.question &&  req.body.question == "") || (req.body.answer &&  req.body.answer == "")){
        res.send(resFormat.rError("All field required"));
    } else{
        let params = {
            question: req.body.question,
            answer: req.body.answer,
            modifiedOn: new Date()
            }
                Faq.update({ _id: req.body._id },{ $set: params} , function(err, updatedFaq) {
                    if (err) {
                        res.send(resFormat.rError(err))
                    } else {
                        res.send(resFormat.rSuccess({message: 'Faq have been updated', data:updatedFaq}))
                    }
                })
    } 
}

//function to get list of user as per given criteria
async function list (req, res) {
    let { fields, offset, query, order, limit, search } = req.body
    let totalUsers = 0
    if (search && !isEmpty(query)) {
      Object.keys(query).map(function(key, index) {
        if(key !== "status") {
          query[key] = new RegExp(query[key], 'i')
        }
      })
    }
  
    let faqList = await Faq.find(query, fields);
    if(faqList){
      totalFaq = faqList.length
      res.send(resFormat.rSuccess({ faqList, totalFaq}))
    } else {
        res.status(401).send(resFormat.rError(err))
    }
      
}

//function to delete 
async function deleteFqa (req, res) {
    if((req.body.faqId &&  req.body.faqId == "")){
        res.send(resFormat.rError("All field required"));
    } else{
        Faq.findByIdAndRemove(req.body.faqId, function (err,offer){
            if(err){
                res.send(resFormat.rError(err));
            }else{
                res.send(resFormat.rSuccess({ message:"Successfully deleted FAQ"}))
            }
        })
    }
    
}

router.post("/create", create)
router.post("/update", update)
router.post("/list", list)
router.post("/delete", deleteFqa)


module.exports = router
