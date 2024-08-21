const { nested_document_limit } = require("../../helper/databaseFunction");
const Finance = require("../../models/Finance");
const bankDaybook = require("../../scripts/bankDaybook");
const hostelBankDaybook = require("../../scripts/hostelBankDaybook");
const miscellaneousBankDaybook = require("../../scripts/miscellaneousBankDaybook");

exports.render_daybook_heads_wise = async (req, res) => {
    try {
      const { fid } = req.params;
      const { from, to, bank, payment_type, flow, hid } = req.query;
      var key;
        if (flow === "ADMISSION") {
          key = await bankDaybook(fid, from, to, bank, payment_type, flow);
        }
        else if (flow === "MISCELLENOUS") {
            key = await miscellaneousBankDaybook(fid, from, to, bank, payment_type, flow);
        }
        else if (flow === "HOSTEL") {
            key = await hostelBankDaybook(fid, hid, from, to, bank, payment_type, flow);
        }
        else {
            key = ""
        }
      res.status(200).send({
        message: `Explore ${flow} Day Book Heads Query`,
        access: true,
        flow: flow ?? "",
        key: key ?? ""
      });
    } catch (e) {
      console.log(e);
    }
};
  
exports.render_all_daybook_heads_wise = async (req, res) => {
    try {
      const { baid } = req?.params;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      if (!baid)
        return res.status(200).send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });
  
      const finance = await Finance.findById({ _id: baid })
      .select("day_book")
        var all_daybook = await nested_document_limit(
          page,
          limit,
          finance?.day_book?.reverse()
        );
  
      res.status(200).send({
        message: "Explore All Day Book Query",
        access: true,
        all_daybook: all_daybook,
      });
    } catch (e) {
      console.log(e);
    }
  };
  