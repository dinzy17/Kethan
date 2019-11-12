var admin = require("firebase-admin")
let serviceAccount = require('./../config/csa-dev.json')
var registrationToken = 'dQ5gRTa30zM:APA91bElbtRKqY7k0R3LtxmgG3sct42w8oBTF1L9Cdub9FUFyI4ba2f6qjxdzSnTGr7xhGClpg-a645MGl9d5xB2LtP1-OkYEjHhZybvn5xScID9FAJ7XnW6crz7mxJQQNIwlTnyBA5g';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/*var payload = {
    notification: {
      title: "CSA notification",
      body: "https://csa-bucket-dev.s3.us-east-2.amazonaws.com/guest_id/1566890961954.jpeg"
    }
};*/

var options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
};

const send = function (notification, data, tokens, category, badge) {
   
    var payload = {
      notification: notification
    }
   
    var apn = {
      "apns": {
        "headers": {
          "apns-priority": "1",
        },
        "payload": {
          "aps": {
            "category": "TEST_CATEGORY"
          }
        }
      },
    }

    message = {
      tokens: tokens,
      notification: notification,
      data: data,
      apns: {
        payload: {
          aps: {
            mutableContent: true,
            category: category ? "TEST_CATEGORY" : '',
            badge: badge
            //"channel": "test-channel",
          }
        },
      }
    }

    console.log(message)

      admin.messaging().sendMulticast(message)
      .then(function (response) {
        console.log("Successfully sent message:", response);
        console.log(response.responses[0].error)
      })
      .catch(function (error) {
        console.log("Error sending message:", error);
      });
    }

    module.exports = {
      send
    };