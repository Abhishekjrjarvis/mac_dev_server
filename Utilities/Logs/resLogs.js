const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const loggers = createLogger({
  transports: [
    new transports.File({
      filename: "./Error/access.log",
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.MongoDB({
      level: "info",
      db: `${process.env.DB_URL2}`,
      // db: `${process.env.DB_URL}`,
      options: {
        useUnifiedTopology: true,
      },
      collection: "Logs",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = loggers;
