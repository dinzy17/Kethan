const constants = require('./../config/constants')
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: constants.mail.mail_id,
        pass: constants.mail.mail_password
    }
});

const sendEmail = function (mailOptions) {
    mailOptions.from = constants.mail.mail_id,
    mailOptions.to = mailOptions.to,
    mailOptions.html = mailOptions.html;
    //mailOptions.replyTo = `request-${mailOptions.investigation_id}@dev.copious.care`;
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = { sendEmail };

/*const ses = require('node-ses'),
  client = ses.createClient({ key: constants.ses.key, secret: constants.ses.secret })

module.exports = (mailOptions) => {
  console.log(mailOptions)
  client.sendEmail({
    to: mailOptions.to,
    from: constants.ses.fromEmail,
    subject: mailOptions.subject,
    message: mailOptions.html,
  }, function(err, data, res){
      console.log(constants.ses)
      console.log("Email Status:");
      if(err) {
        console.log("err --->")
        console.log(err);
      } else {
        console.log("Email Sent!")
      }
  })
}*/
