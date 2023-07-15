const mongoose = require("mongoose");

if (`${process.env.CONNECT_DB}` === "PROD") {
  var dburl = `${process.env.DB_URL}`; // Production
} else if (`${process.env.CONNECT_DB}` === "DEV") {
  var dburl = `${process.env.DB_URL2}`; // Development
} else {
  var dburl = `${process.env.TESTING_DATABASE_URL}`; // Testing
}

mongoose
  .connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    console.log(
      "Database Successfully Connected...",
      data?.connections[0]?.name
    );
  })
  .catch((e) => {
    console.log("Something Went Wrong...", e.message);
  });

module.exports = dburl;
