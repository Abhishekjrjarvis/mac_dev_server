const express = require("express")
const router = express.Router()
const Notification = require("../../controllers/Notifications/push-notification.controller")

router.get("/", Notification.SendNotification)
router.post("/todevice", Notification.SendNotificationToDevice)

module.exports = router