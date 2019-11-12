// var admin = require("firebase-admin")
// let notificationConfig = require('./../config/notificationConfig.json')
// var registrationToken = notificationConfig.registrationToken
//
// admin.initializeApp({
//   credential: admin.credential.cert(notificationConfig)
// });
//
// /*const payload = {
//     notification: {
//       title: "<project_name> notification",
//       body: "<image_url>"
//     }
// };*/
//
// const options = {
//   priority: "high",
//   timeToLive: 60 * 60 * 24
// };
//
// const send = function (notification, data, tokens, category, badge) {
//
//     const payload = {
//       notification: notification
//     }
//
//     const apn = {
//       "apns": {
//         "headers": {
//           "apns-priority": "1",
//         },
//         "payload": {
//           "aps": {
//             "category": "TEST_CATEGORY"
//           }
//         }
//       },
//     }
//
//     let message = {
//       tokens: tokens,
//       notification: notification,
//       data: data,
//       apns: {
//         payload: {
//           aps: {
//             mutableContent: true,
//             category: category ? "TEST_CATEGORY" : '',
//             badge: badge
//             //"channel": "test-channel",
//           }
//         },
//       }
//     }
//     console.log(message)
//
//     admin.messaging().sendMulticast(message)
//     .then(function (response) {
//       console.log("Successfully sent message:", response);
//       console.log(response.responses[0].error)
//     })
//     .catch(function (error) {
//       console.log("Error sending message:", error);
//     });
// }
//
// module.exports = { send }
