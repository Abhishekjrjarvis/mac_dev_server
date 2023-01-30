require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const MongoStore = require("connect-mongo");
const loggers = require("./Utilities/Logs/resLogs");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;

const apiFunc = require("./config/api-config");
const { timerFunction } = require("./config/timer-config");
const dburl = require("./config/db-config");

app.use(compression());

app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));
// app.use(
  // helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false })
// );

const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJSDocs = YAML.load("./api.yaml");
app.set("view engine", "ejs");
app.set("/views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://18.205.27.165",
      "http://localhost:3000",
      "https://qviple.com",
      "https://admin.qviple.com",
      "https://developer.qviple.com",
      "https://support.qviple.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

const secret = "Thisismysecret";

const store = new MongoStore({
  mongoUrl: dburl,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("Store Connection Disabled", e);
});

app.use(cookieParser());
app.use(
  session({
    name: "SessionID",
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: Date.now() + 30 * 86400 * 1000,
    },
  })
);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));

app.use((req, res, next) => {
  loggers.info(req.body);
  let oldSend = res.send;
  res.send = function (data) {
    loggers.info(data);
    oldSend.apply(res, arguments);
  };
  next();
});

app.use(apiFunc);

timerFunction();

app.get("*", (req, res) => {
  res.status(404).send("Page Not Found...");
});

// const port = process.env.PORT || 8080;

// app.listen(port, function () {
//   console.log(`Server listening on port ${port}`);
// });

if (cluster.isMaster) {
  console.log(`Master Process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const port = process.env.PORT || 8080;

  app.listen(port, function () {
    console.log(
      `Worker ${process.pid} started Server listening on port ${port}`
    );
  });
}

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  server.close(() => {
    console.log("Http server closed.");
    mongoose.connection.close(false, () => {
      console.log("MongoDb connection closed.");
      process.exit(0);
    });
  });
});
