require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const Admin = require("./models/superAdmin");

//======================== All Routes ========================

const uploadRoute = require("./routes/UploadContent/index");
const elearningRoute = require("./routes/Elearning/index");
const libraryRoute = require("./routes/Library/index");
const searchRoute = require("./routes/Search/index");
const paymentNew = require("./routes/Payment/paymentRoute");
const adminNew = require("./routes/SuperAdmin/adminRoute");
const instituteNew = require("./routes/InstituteAdmin/instituteRoute");
const authNew = require("./routes/Authentication/authRoute");
const financeNew = require("./routes/Finance/financeRoute");
const sportNew = require("./routes/Sport/sportRoute");
const miscellaneousNew = require("./routes/Miscellaneous/miscellaneousRoute");
const userNew = require("./routes/User/userRoute");
const availNew = require("./routes/Attendence/indexRoute");
const landingNew = require("./routes/LandingRoute/indexRoute");
const chatNew = require("./routes/Chat/chatRoute");
const messageNew = require("./routes/Chat/messageRoute");
const feesNew = require("./routes/Fees/feesRoute");
const extraNew = require('./routes/Extra/extraRoute')
const institutePostRoute = require("./routes/InstituteAdmin/Post/PostRoute");
const userPostRoute = require("./routes/User/Post/PostRoute");
const superAdminPostRoute = require("./routes/SuperAdmin/Post/PostRoute");
const classRoute = require("./routes/Class/classRoute");
const checklistRoute = require("./routes/Checklist/checklistRoute");
const examRoute = require("./routes/Exam/examRoute");
const complaintLeaveRoute = require("./routes/ComplaintLeave/complaintLeaveRoute");

// ============================= DB Configuration ==============================

const dburl = `${process.env.DB_URL2}`;
// const dburl = `${process.env.DB_URL}`;
// const dburl = `mongodb://127.0.0.1:27017/Erp_app`;

// 62e155ce168e4858c7ca8c00 - Development
// 62e157224cc3f4c4d1b859b5 - Production

mongoose
  .connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    console.log("Database Successfully Connected...");
  })
  .catch((e) => {
    console.log("Something Went Wrong...", e);
  });

const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJSDocs = YAML.load("./api.yaml");

app.set("view engine", "ejs");
app.set("/views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ["http://18.205.27.165", "http://localhost:3000", "https://qviple.com"],
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
  console.log("some", e);
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

app.use((req, res, next) => {
  logger.error(req.body);
  let oldSend = res.send;
  res.send = function (data) {
    logger.error(JSON.parse(data));
    oldSend.apply(res, arguments);
  }
  next();
})

// ================================ API Endpoints =============================

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));
app.use("/api/v1/search", searchRoute);
app.use("/api/v1/all-images", uploadRoute);
app.use("/api/v1/elearning", elearningRoute);
app.use("/api/v1/library", libraryRoute);
app.use("/api/v1/class", classRoute);
app.use("/api/v1/checklist", checklistRoute);
app.use("/api/v1/exam", examRoute);
app.use("/api/v1/compleave", complaintLeaveRoute);
app.use("/api/v1", paymentNew);
app.use("/api/v1/admin", adminNew);
app.use("/api/v1/ins", instituteNew);
app.use("/api/v1/ins/post", institutePostRoute);
app.use("/api/v1/admin/post", superAdminPostRoute);
app.use("/api/v1/auth", authNew);
app.use("/api/v1/finance", financeNew);
app.use("/api/v1/sport", sportNew);
app.use("/api/v1/all", miscellaneousNew);
app.use("/api/v1/user", userNew);
app.use("/api/v1/user/post", userPostRoute);
app.use("/api/v1/attendance", availNew);
app.use("/api/v1/landing", landingNew);
app.use("/api/v1/chat", chatNew);
app.use("/api/v1/message", messageNew);
app.use("/api/v1/fees", feesNew);
app.use('/api/v1/extra', extraNew)

// ============================================================================

app.get("/super-admin", (req, res) => {
  res.render("SuperAdmin");
});

app.post("/super-admin", async (req, res) => {
  try{
    const { adminPassword } = req.body;
    const genPassword = bcrypt.genSaltSync(12);
    const hashPassword = bcrypt.hashSync(adminPassword, genPassword);
    const admin = new Admin({...req.body});
    admin.adminPassword = hashPassword,
    await admin.save();
    res.redirect("/");
  }
  catch{}
});


app.get("*", (req, res) => {
  res.status(404).send("Page Not Found...");
});

const port = process.env.PORT || 8080;

const server = app.listen(port, function () {
  console.log("Server listening on port " + port);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("new support", (newMessageRecieved) => {
    var chats = newMessageRecieved.chat;
    if (!chats.users) return console.log("chat.users not defined");

    chats.users.forEach((user) => {
      if (user == newMessageRecieved.sender) return;
      socket.in(user).emit("message support", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData);
  });
});

