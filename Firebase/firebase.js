var firebase = require("firebase-admin");
var serviceAccount = require("./qviple-user-firebase-adminsdk-4qvna-aca6cd00fb.json");

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
    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
    });
  }
  if (type === "Followers") {
    const firebaseToken = `${token && token}`;

    const payload = {
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
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Circle") {
    const firebaseToken = `${token && token}`;

    const payload = {
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
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Staff Approval") {
    const firebaseToken = `${token && token}`;

    const payload = {
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
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Student Approval") {
    const firebaseToken = `${token && token}`;

    const payload = {
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
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Designation Allocation") {
    const firebaseToken = `${token && token}`;

    const payload = {
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
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Announcement") {
    const firebaseToken = `${token && token}`;

    const payload = {
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
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Student Member Activity") {
    const firebaseToken = `${token && token}`;

    const payload = {
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
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Staff Member Activity") {
    const firebaseToken = `${token && token}`;

    const payload = {
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
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Comment") {
    const firebaseToken = `${token && token}`;

    const payload = {
      notification: {
        title: `${title}`,
        body: `${info.notifyContent}`,
      },
      data: {
        type: `${type}`,
        userId: `${id}`,
        postId: `${pid}`,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
      },
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "Answer") {
    const firebaseToken = `${token && token}`;

    const payload = {
      notification: {
        title: `${title}`,
        body: `${info.notifyContent}`,
      },
      data: {
        type: `${type}`,
        userId: `${id}`,
        postId: `${pid}`,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
      },
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else if (type === "New To Post Feed") {
    const firebaseToken = `${token && token}`;

    const payload = {
      notification: {
        title: `${title}`,
        body: `${info.notifyContent}`,
      },
      data: {
        type: `${type}`,
        userId: `${id}`,
        postId: `${pid}`,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
      },
    };
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    firebase.messaging().sendToDevice(firebaseToken, payload, options);
  } else {
  }
};

module.exports = invokeFirebaseNotification;
