var firebase = require("firebase-admin");
var serviceAccount = require("../Secret/qviple-user-firebase-adminsdk-4qvna-8582f91ae3.json");

const invokeFirebaseNotification = async (
  type,
  info,
  title,
  id,
  token,
  pid,
  aid
) => {
  if (!firebase.apps.length) {
    var fb = firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: "dB_URL"
      }, "qviple-user");
  }
  if (type === "Followers") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
        console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Circle") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Staff Approval") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Student Approval") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Designation Allocation") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Announcement") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Student Member Activity") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Staff Member Activity") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Comment") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "Answer") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else if (type === "New To Post Feed") {
    const firebaseToken = `${token && token}`;
    const ds = {
        notification: {
          title: `${title}`,
          body: `${info.notifyContent}`,
        },
        data: {
          type: `${type}`,
          userId: `${id}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          sound: "default",
        },
        token: firebaseToken
  };

    fb.messaging().send(ds)
    .then(() => {
      console.log("Notification sent successfully:")
    }).catch((e) => {
        console.error("Error sending notification:", e);
    })
  } else {
  }
};

module.exports = invokeFirebaseNotification;
