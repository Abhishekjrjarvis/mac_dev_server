var firebase = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
var serviceAccount = require("../Firebase/qviple-user-firebase-adminsdk-4qvna-aca6cd00fb.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

exports.dailyChatFirebaseQuery = async (des, docId, type, sender, text) => {
    const db = getFirestore();
    const snapshot = await db.collection('groups').get();
    snapshot.forEach(async (doc) => {
    if(doc?.data()?.subjectId === `${des}`){
        const shot = await db.collection(`groups/${doc?.id}/chats`).add({
        "text": `${docId}`,
        "message": `${text ? text : 'Text'}`,
        "repliedMessage": '',
        "repliedTo": '',
        "messageId": '',
        "timeSent": new Date().toISOString(),
        "recieverid": `${doc?.id}`,
        "isSeen": false,
        "type": `${type}`,
        "repliedMessageType": 'text',
        "senderId": `${sender}`
        })

        await db.collection(`groups/${doc?.id}/chats`).doc(shot?.id).update({
            messageId: `${shot?.id}`
        })
    }
    });
}
