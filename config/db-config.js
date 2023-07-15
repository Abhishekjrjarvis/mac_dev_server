const mongoose = require("mongoose");
// const dburl = `${process.env.TESTING_DATABASE_URL}`; // Testing
// const dburl = `${process.env.DB_URL2}`; // Development
const dburl = `${process.env.DB_URL}`; // Production

mongoose
  .connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    console.log("Database Successfully Connected...");
  })
  .catch((e) => {
    console.log("Something Went Wrong...", e.message);
  });

module.exports = dburl;
