var firebase = require("firebase-admin");
var serviceAccount = require("./qviple-user-firebase-adminsdk-4qvna-aca6cd00fb.json");

const invokeMemberTabNotification = (type, info, title, id, token, publisher, notifyData) => {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
    });
  }
  if (type === "Student Activity") {
    const firebaseToken = `${token && token}`;

    const payload = {
      notification: {
        title: `${title}`,
        body: `${info.notifyContent}`,
      },
      data: {
        type: `${type}`,
        userId: `${id}`,
        publisher: `${publisher}`,
        openData: `${notifyData}`,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
      },
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Staff Activity") {
    const firebaseToken = `${token && token}`;

    const payload = {
      notification: {
        title: `${title}`,
        body: `${info.notifyContent}`,
      },
      data: {
        type: `${type}`,
        userId: `${id}`,
        publisher: `${publisher}`,
        openData: `${notifyData}`,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
      },
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  }
  else if (type === "Institute Activity") {
    const firebaseToken = `${token && token}`;

    const payload = {
      notification: {
        title: `${title}`,
        body: `${info.notifyContent}`,
      },
      data: {
        type: `${type}`,
        userId: `${id}`,
        publisher: `${publisher}`,
        openData: `${notifyData}`,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
      },
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  }
  else {
  }
};

module.exports = invokeMemberTabNotification;
