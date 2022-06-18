const { ONE_SIGNAL_CONFIG } = require('../config/app.config')

async function SendNotification(data, callback){
    var headers = {
        "content-type": "application/json; charset=utf-8",
        "Authorization": "Basic "+ ONE_SIGNAL_CONFIG.APP_KEY
    }

    var options = {
        host: "onesignal.com",
        port: "443",
        path: "/api/v1/notification",
        method: "POST",
        headers: headers
    }

    var https = require('https')
    var req = https.request(options, function(res){
        res.on("data", function(data){
            console.log(JSON.stringify(data))

            return callback(null, JSON.parse(data))
        })
    })

    req.on("error", function(e){
        return callback({
            message: e
        })
    })

    req.write(JSON.stringify(data))
    req.end();
}


module.exports = {
    SendNotification
}