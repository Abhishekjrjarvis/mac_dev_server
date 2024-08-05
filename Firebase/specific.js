var firebase = require("firebase-admin");
var serviceAccount = require("./qviple-user-firebase-adminsdk-4qvna-8582f91ae3.json");

const invokeSpecificRegister = (type, info, title, id, token) => {
  // if (!firebase.apps.length) {
  //   firebase.initializeApp({
  //     credential: firebase.credential.cert(serviceAccount),
  //   });
  // }
  // if (type === "Specific Notification") {
  //   const firebaseToken = `${token && token}`;

  //   const payload = {
  //     notification: {
  //       title: `${title}`,
  //       body: `${info}`,
  //     },
  //     data: {
  //       type: `${type}`,
  //       userId: `${id}`,
  //       click_action: "FLUTTER_NOTIFICATION_CLICK",
  //       sound: "default",
  //     },
  //   };
  //   const options = {
  //     priority: "high",
  //     timeToLive: 60 * 60 * 24,
  //   };

  //   firebase.messaging().sendToDevice(firebaseToken, payload, options);
  // } 
  // else {
  // }
};

module.exports = invokeSpecificRegister;
