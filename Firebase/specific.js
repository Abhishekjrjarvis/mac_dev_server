var admin = require("firebase-admin");
var serviceAccount = require("../Secret/qviple-user-firebase-adminsdk-4qvna-8582f91ae3.json");

const invokeSpecificRegister = async (type, info, title, id, token) => {
  if (type === "Specific Notification") {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    const firebaseToken = token;

    const ds = {
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
    };
    admin
      .messaging()
      .send(ds)
      .then(() => {
        console.log("Notification sent successfully:");
      })
      .catch((e) => {
        console.error("Error sending notification:");
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
//   "caSlrA6_T3ig4v92wnvIgK:APA91bGO_1kG6N4EDFKGQUkkike_0e0LoohNXMwL9bzaTwCwV9OSGmGtMQzgz2Z-2w2T8baEFGqEuvAVu5Z0UI8ewHjp3MSlyobA_pP1IDxAgN6JDWKOsO0y_lhBx8m9W_XiAN4WAdZW"
// );
