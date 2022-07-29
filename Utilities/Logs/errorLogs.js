const {
    createLogger,
    transports,
    format
} = require('winston');
require('winston-mongodb');
const logger = createLogger({
    transports: [
        new transports.File({
            filename: 'error.log',
            level: 'error',
            format: format.combine(format.timestamp(), format.json())
        }),
        new transports.MongoDB({
            level: 'error',
            db: `${process.env.DB_URL2}`,
            options: {
                useUnifiedTopology: true
            },
            collection: 'Error',
            format: format.combine(format.timestamp(), format.json())
        })
    ]
})

module.exports = logger;