const { shuffleArray } = require("../../Utilities/Shuffle");
const Quotes = require("../../models/Community/quotes");
const User = require("../../models/User");
const axios = require("axios");

exports.renderNewQuoteDisplayQuery = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_user = await User.findById({ _id: uid });
    if (valid_user?.daily_quote_query?.status === "Not Display") {
      var get_array = await Quotes.find({});
      var all_quote = shuffleArray(get_array);
      var ran_1 = Math.floor(Math.random() * all_quote?.length);
      valid_user.daily_quote_query.quote = all_quote[ran_1]?._id;
      valid_user.daily_quote_query.status = "Displayed";
      await valid_user.save();
      res.status(200).send({
        message: "New Daily Quote Display on Dashbaord",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Daily Quote Already Display on Dashbaord",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewQuoteQuery = async (req, res) => {
  try {
    // const data = await axios.get("https://type.fit/api/quotes");
    // for (var ref of data) {
    //   const new_quote = new Quotes({
    //     quote_text: ref?.quote,
    //     quote_author: ref?.author,
    //     quote_tag: ref?.category,
    //     quote_length: ref?.text?.length,
    //   });
    //   await new_quote.save();
    // }
    res.status(200).send({
      message: "All Quotes Insertion Successfully",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};
