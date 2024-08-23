var admin = require("firebase-admin");
// var serviceAccount = require("../Secret/qviple-user-firebase-adminsdk-4qvna-8582f91ae3.json");
// if (!admin.apps.length) {
let fb = admin.initializeApp(
  {
    // credential: admin.credential.cert(serviceAccount),
    databaseURL: "dB_URL",
  },
  "qviple-user"
);
// }
const invokeSpecificRegister = async (type, info, title, id, token) => {
  // const yourFirebaseAdminConfig= {};

  //   if (admin.apps.length === 0) {
  //     admin.initializeApp({ yourFirebaseAdminConfig });
  //   }

  if (type === "Specific Notification") {
    const firebaseToken = token;

    // const messaging = admin.messaging();

    const ds = {
      // message: {
      notification: {
        title: `${title}`,
        body: `${info}`,
      },
      data: {
        type: `${type}`,
        userId: `${id}`,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
      },
      token: firebaseToken, // Replace with the device token you want to send to
      // },
      // token: firebaseToken // Replace with the device token you want to send to
    };

    // const options = {
    //   priority: "high",
    //   timeToLive: 60 * 60 * 24,
    // };

    // try {
    fb.messaging()
      .send(ds)
      .then(() => {
        console.log("Notification sent successfully:");
      })
      .catch((e) => {
        // catch (error) {
        console.error("Error sending notification:", e);
      });
  } else {
  }
};

module.exports = invokeSpecificRegister;

// invokeSpecificRegister(
//   "Specific Notification",
//   "TESTING NODTICIATION TRIGGERED BY DD ABHISHEK SINGH",
//   "New Institute Welcome",
//   "630f6d19a8d864c2234fe4cc",
//   // user.deviceToken
// )
