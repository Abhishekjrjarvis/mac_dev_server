const { ONE_SIGNAL_CONFIG } = require('../../config/app.config')
const pushNotificationService = require('../../services/push-notification.service')

exports.SendNotification = (req, res, next) =>{
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: { en: "data"},
        included_segments: ["ALL"],
        content_available: true,
        small_icon: "http://qviple.com/static/media/Mithkal_icon.043e3412.png",
        data: {
            PushTitle: "CUSTOM NOTIFICATION" 
        }
    }

    pushNotificationService.SendNotification(message, (error, results) => {
        if(error){
            return next(error)
        }
        return res.status(200).send({
            message: 'Success',
            data: results
        })
    })
}


exports.SendNotificationToDevice = (req, res, next) =>{
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: { en: "data"},
        included_segments: ["*included_player_ids"],
        include_player_ids: req.body.devices,
        content_available: true,
        small_icon: "http://qviple.com/static/media/Mithkal_icon.043e3412.png",
        data: {
            PushTitle: "CUSTOM NOTIFICATION" 
        }
    }

    pushNotificationService.SendNotification(message, (error, results) => {
        if(error){
            return next(error)
        }
        return res.status(200).send({
            message: 'Success',
            data: results
        })
    })
}

