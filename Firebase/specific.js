var admin = require("firebase-admin");
var serviceAccount = require("./qviple-user-firebase-adminsdk-4qvna-8582f91ae3.json");

const invokeSpecificRegister = (type, info, title, id, token) => {
  // if (!admin.apps.length) {
  //   admin.initializeApp({
  //     credential: admin.credential.cert(serviceAccount),
  //   });
  // }
  // if (type === "Specific Notification") {
  //   const firebaseToken = `dX6h49Q6S2-KGAxwKaIjX3:APA91bF9NE-Tz4BHvdcr93ymXmcXhoyk-YIpzrGEyFZHXcPtOVbGqj3u-IfdL9uJeYHXIwcSPPhjS9Vo4xtuhYcO_moxPcLcKerZiCW5cPgrIVPCGiDVSeUw6QmYDWIxeuQ4-VAlcfRb`;

  //   // const messaging = admin.messaging();
  
  //   const ds = {
  //     message: {
  //       notification: {
  //         title: `${title}`,
  //         body: `${info}`,
  //       },
  //       data: {
  //         type: `${type}`,
  //         userId: `${id}`,
  //         click_action: "FLUTTER_NOTIFICATION_CLICK",
  //         sound: "default",
  //       },
  //       token: firebaseToken // Replace with the device token you want to send to
  //     },
  //     token: firebaseToken // Replace with the device token you want to send to
  // };
  
  //   // const options = {
  //   //   priority: "high",
  //   //   timeToLive: 60 * 60 * 24,
  //   // };

  //   // try {
  //   admin.messaging().send(ds)
  //     .then(() => {
  //       console.log("Notification sent successfully:")
  //     }).catch((e) => {
  //   // catch (error) {
  //     console.error("Error sending notification:", e);
  //     })
  // } 
  // else {
  // }
};

module.exports = invokeSpecificRegister;

// invokeSpecificRegister(
//   "Specific Notification",
//   "TESTING NODTICIATION TRIGGERED BY ABHISHEK SINGH",
//   "New Institute Welcome",
//   "630f6d19a8d864c2234fe4cc",
//   // user.deviceToken
// )
