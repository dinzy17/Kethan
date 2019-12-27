var express = require('express')
var router = express.Router()
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const Support = require('./../models/Support')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const auth = require('./../helpers/authMiddleware');
const { isEmpty } = require('lodash')
const User = require('./../models/User')



//function to create or register new user
async function create(req, res) { 
    var support = new Support();
    if (req.body.query == undefined) {
        res.send(resFormat.rError("All field required"));
    } else {
        let user = await User.findOne({"_id": req.body.userId});
        let email = req.body.email
        support.query = req.body.query,
        support.senderEmail = user.email,
        support.name = user.fullName,
        support.createdOn = new Date();
        support.modifiedOn = new Date();
        support.save(async function(err, newSupport) {
            if (err) {
                res.send(resFormat.rError(err))
            } else { 
                //sendClientEmail();
                let template = await emailTemplatesRoute.getEmailTemplateByCode("supportAdmin")
                if (template) {
                    template = JSON.parse(JSON.stringify(template));
                    let body = template.mailBody.replace("{quarry}", req.body.query);
                    const mailOptions = {
                    subject: template.mailSubject,
                    html: body
                    }
                    sendEmail.sendEmailAdmin(mailOptions)
                   // sendClientEmail(email);
                   res.send(resFormat.rSuccess({message:"Supports added successfully."}))
                } 
                /*
                async function sendClientEmail(email){
                    let templateAdmin = await emailTemplatesRoute.getEmailTemplateByCode("supportClient")
                    if (templateAdmin) {
                        templateAdmin = JSON.parse(JSON.stringify(templateAdmin));
                        let body = templateAdmin.mailBody;
                        const mailOptionsAdmin = {
                        to: "gaurav@arkenea.com", //req.body.email,
                        subject: templateAdmin.mailSubject,
                        html: body
                        }
                        sendEmail.sendEmail(mailOptionsAdmin)
                    }
                } */
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

  //function to create or register new user
  async function sendReplay(req, res) {
    if ((req.body.replay &&  req.body.replay == "") || (req.body.id &&  req.body.id == "")) {
        res.send(resFormat.rError("All field required"));
    } else {
        req.body.replay = req.body.replay.replace(/\n/g,"<br>")
        let params = {
            replay: req.body.replay,
            sendReplay: true,
            modifiedOn: new Date()
        }

        Support.update({ _id: req.body.id },{ $set: params} , function(err, updatedSupport) {
            if (err) {
                res.send(resFormat.rError(err))
            } else {
                let body = req.body.replay;
                const mailOptionsAdmin = {
                to: req.body.email,
                subject: "Support Replay",
                html: body
                }
                sendEmail.sendEmail(mailOptionsAdmin)
                res.send(resFormat.rSuccess({message: 'Replay send successfully.', data:updatedSupport}))
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
          if(key !== "status" && key !== "SearchQuery") {
            query[key] = new RegExp(query[key], 'i')
          } else if (key === "SearchQuery") {
            query['$or'] = [{'query': new RegExp(query[key], 'i')},{'senderEmail': new RegExp(query[key], 'i')}, {'replay': new RegExp(query[key], 'i')}]
            delete query.SearchQuery;
          }
        })
      }
  
    let supportList = await Support.find(query, fields, { sort: order });
    if(supportList){
      totalSupport = supportList.length
      res.send(resFormat.rSuccess({ supportList, totalSupport}))
    } else {
        res.status(401).send(resFormat.rError(err))
    }
}


async function totalUnresolved (req, res) {
    let supportList = await Support.find({ "sendReplay": { "$ne": true } });
    if(supportList){
      totalSupport = supportList.length
      res.send(resFormat.rSuccess({ totalSupport }))
    } else {
        res.send(resFormat.rError(err))
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

router.post("/create", auth, create) //, auth
router.post("/addAns", auth, addAns)
router.post("/list", list) //auth,
router.post("/delete", auth, deleteSupport)
router.post("/sendReplay", sendReplay)
router.post("/totalUnresolved", totalUnresolved)

module.exports = router
