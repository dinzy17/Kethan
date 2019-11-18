var express = require('express')
var router = express.Router()
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const Support = require('./../models/Support')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const auth = require('./../helpers/authMiddleware');



//function to create or register new user
async function create(req, res) { 
    var support = new Support();
    if (req.body.query == undefined || req.body.email == undefined) {
        res.status(400).send(resFormat.rError("All field required"));
    }else if (req.body.query == "" ||  req.body.email == "") {
        res.status(400).send(resFormat.rError("All field required"));
    } else {
        support.query = req.body.query
        support.senderEmail = req.body.email
        support.createdOn = new Date();
        support.modifiedOn = new Date();
        support.save(async function(err, newSupport) {
            if (err) {
                res.status(403).send(resFormat.rError(err))
            } else {
                let template = await emailTemplatesRoute.getEmailTemplateByCode("supportAdmin")
                if (template) {
                    template = JSON.parse(JSON.stringify(template));
                    let body = template.mailBody.replace("{quarry}", req.body.query);
                    const mailOptions = {
                    to: "gaurav@arkenea.com",
                    subject: template.mailSubject,
                    html: body
                    }
                    sendEmail.sendEmail(mailOptions)
                    sendClientEmail();
                }
                async function sendClientEmail(){
                    let templateAdmin = await emailTemplatesRoute.getEmailTemplateByCode("supportClient")
                    if (templateAdmin) {
                        templateAdmin = JSON.parse(JSON.stringify(templateAdmin));
                        let body = templateAdmin.mailBody;
                        const mailOptionsAdmin = {
                        to: req.body.email,
                        subject: templateAdmin.mailSubject,
                        html: body
                        }
                        sendEmail.sendEmail(mailOptionsAdmin)
                    }
                }
                res.send(resFormat.rSuccess({message:"Supports added successfully."}))
            }
        })
    } 
}

  //function to create or register new user
async function addAns(req, res) {
    if ((req.body.answer &&  req.body.answer == "") || (req.body.supportId &&  req.body.supportId == "")) {
        res.send(resFormat.rError("All field required"));
    } else {
        let params = {
            answer: req.body.answer,
            modifiedOn: new Date()
        }

        Support.update({ _id: req.body.supportId },{ $set: params} , function(err, updatedSupport) {
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
  
    let supportList = await Support.find(query, fields);
    if(supportList){
      totalSupport = supportList.length
      res.send(resFormat.rSuccess({ supportList, totalSupport}))
    } else {
        res.status(401).send(resFormat.rError(err))
    }
}

//function to delete 
async function deleteSupport (req, res) {
    if ((req.body.supportId &&  req.body.supportId == "")) {
        res.send(resFormat.rError("All field required"));
    } else {
        Support.findByIdAndRemove(req.body.supportId, function (err,offer){
            if (err) {
                res.send(resFormat.rError(err));
            } else {
                res.send(resFormat.rSuccess({ message:"Successfully deleted Supports"}))
            }
        })
    }
}

router.post("/create", auth, create)
router.post("/addAns", auth, addAns)
router.post("/list", auth, list)
router.post("/delete", auth, deleteSupport)


module.exports = router
