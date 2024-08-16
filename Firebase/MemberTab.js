var firebase = require("firebase-admin");
var serviceAccount = require("../Secret/qviple-user-firebase-adminsdk-4qvna-8582f91ae3.json");

const invokeMemberTabNotification = (
  type,
  info,
  title,
  id,
  token,
  publisher,
  notifyData
) => {
  //   if (!firebase.apps.length) {
  //       var fb = firebase.initializeApp({
  //           credential: firebase.credential.cert(serviceAccount),
  //           databaseURL: "dB_URL"
  //         }, "qviple-user");
  //     }
  //   if (type === "Student Activity") {
      
  //       const firebaseToken = `${token && token}`;
  //       const ds = {
  //           notification: {
  //             title: `${title}`,
  //             body: `${info.notifyContent}`,
  //           },
  //           data: {
  //             type: `${type}`,
  //               userId: `${id}`,
  //               publisher: `${publisher}`,
  //               openData: `${notifyData}`,
  //             click_action: "FLUTTER_NOTIFICATION_CLICK",
  //             sound: "default",
  //           },
  //           token: firebaseToken
  //     };
    
  //       fb.messaging().send(ds)
  //       .then(() => {
  //         console.log("Notification sent successfully:")
  //       }).catch((e) => {
  //           console.error("Error sending notification:", e);
  //       })
  // } else if (type === "Staff Activity") {
  //   const firebaseToken = `${token && token}`;
  //       const ds = {
  //           notification: {
  //             title: `${title}`,
  //             body: `${info.notifyContent}`,
  //           },
  //           data: {
  //             type: `${type}`,
  //               userId: `${id}`,
  //               publisher: `${publisher}`,
  //               openData: `${notifyData}`,
  //             click_action: "FLUTTER_NOTIFICATION_CLICK",
  //             sound: "default",
  //           },
  //           token: firebaseToken
  //     };
    
  //       fb.messaging().send(ds)
  //       .then(() => {
  //         console.log("Notification sent successfully:")
  //       }).catch((e) => {
  //           console.error("Error sending notification:", e);
  //       })
  // } else if (type === "Institute Activity") {
  //   const firebaseToken = `${token && token}`;
  //       const ds = {
  //           notification: {
  //             title: `${title}`,
  //             body: `${info.notifyContent}`,
  //           },
  //           data: {
  //             type: `${type}`,
  //               userId: `${id}`,
  //               publisher: `${publisher}`,
  //               openData: `${notifyData}`,
  //             click_action: "FLUTTER_NOTIFICATION_CLICK",
  //             sound: "default",
  //           },
  //           token: firebaseToken
  //     };
    
  //       fb.messaging().send(ds)
  //       .then(() => {
  //         console.log("Notification sent successfully:")
  //       }).catch((e) => {
  //           console.error("Error sending notification:", e);
  //       })
  // } else if (type === "Admission Status") {
  //   const firebaseToken = `${token && token}`;
  //       const ds = {
  //           notification: {
  //             title: `${title}`,
  //             body: `${info.notifyContent}`,
  //           },
  //           data: {
  //             type: `${type}`,
  //               userId: `${id}`,
  //               publisher: `${publisher}`,
  //               openData: `${notifyData}`,
  //             click_action: "FLUTTER_NOTIFICATION_CLICK",
  //               sound: "default",
  //           },
  //           token: firebaseToken
  //     };
    
  //       fb.messaging().send(ds)
  //       .then(() => {
  //         console.log("Notification sent successfully:")
  //       }).catch((e) => {
  //           console.error("Error sending notification:", e);
  //       })
  // } else if (type === "Meeting Alert") {
  //   const firebaseToken = `${token && token}`;
  //       const ds = {
  //           notification: {
  //             title: `${title}`,
  //             body: `${info.notifyContent}`,
  //           },
  //           data: {
  //             type: `${type}`,
  //               userId: `${id}`,
  //               publisher: `${publisher}`,
  //               openData: `${notifyData}`,
  //             click_action: "FLUTTER_NOTIFICATION_CLICK",
  //             sound: "default",
  //           },
  //           token: firebaseToken
  //     };
    
  //       fb.messaging().send(ds)
  //       .then(() => {
  //         console.log("Notification sent successfully:")
  //       }).catch((e) => {
  //           console.error("Error sending notification:", e);
  //       })
  // } else {
  // }
};

module.exports = invokeMemberTabNotification;
