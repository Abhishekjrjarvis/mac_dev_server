var firebase = require("firebase-admin");

var serviceAccount = require("./qviple-user-firebase-adminsdk-4qvna-aca6cd00fb.json");

const firebaseToken = 'dw1cCrq5Q0SCd7PKpEpq36:APA91bFaJQmGZnBIhJADz0bevYG4Tm8OXVuGSLoGUXB4Z73c9cpd3d2ciPUkIO7NDSDlTQl7GgJPLIl9yqVnDlWVZu85cAN1mKj6IvEKFlwOiMbieMRbwDvtZS1i5JjCxYJ8PadAyZRB'

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});


const payload = {
  notification: {
    title: "Test Notification Qviple Platform",
    body: "Awesome SAAS Tech Idea",
    click_action: "FLUTTER_NOTIFICATION_CLICK"
  },
  data: {
    data1: 'data value 1',
    data2: 'data value 2',
  }
}

var options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
}; 

firebase.messaging().sendToDevice(firebaseToken, payload, options).then((res) => {
  console.log(res)
})

