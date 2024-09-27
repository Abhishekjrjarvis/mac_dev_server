const Razorpay = require("razorpay");
var crypto = require("crypto");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const axios = require("axios");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const {
  unlockInstituteFunction,
  feeInstituteFunction,
  admissionInstituteFunction,
  participateEventFunction,
  transportFunction,
  backlogFunction,
  applicationFunction,
  directAdmissionInstituteFunction,
  libraryInstituteFunction,
} = require("./paymentModule");
const { handle_undefined } = require("../../Handler/customError");
const {
  directHostelInstituteFunction,
  hostelInstituteFunction,
} = require("./hostelPaymentModule");
const { nested_document_limit } = require("../../helper/databaseFunction");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

var instance = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

var razor_author = false;

exports.institute_merchant_replace = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).select(
      "razor_key razor_id"
    );
    // instance = new Razorpay({
    //   key_id: institute?.razor_id
    //     ? institute?.razor_id
    //     : process.env.RAZOR_KEY_ID,
    //   key_secret: institute?.razor_key
    //     ? institute?.razor_key
    //     : process.env.RAZOR_KEY_SECRET,
    // });
    res.status(200).send({
      message: "Proceed with Account Instance 👍",
      status: true,
      key: institute?.razor_key,
      bool: institute?.razor_key ? true : false,
      author: institute?.razor_key ? true : false,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderKeys = async (req, res) => {
  try {
    res.status(200).send({
      message: "Key Id 😀",
      Key: process.env.RAZOR_KEY_ID,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.checkoutRazorPayment = async (req, res) => {
  try {
    // console.log(instance);
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    res
      .status(200)
      .send({ message: "Success order id 😀", success: true, order: order });
  } catch (e) {
    console.log(e);
  }
};

const oneRazorPayment = async (pid) => {
  try {
    const pay = await instance.payments.fetch(`${pid}`);
    return pay;
  } catch (e) {
    console.log(e);
  }
};

exports.verifyRazorPayment = async (req, res) => {
  try {
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      student_data,
    } = req.body;
    const {
      payment_module_type,
      payment_by_end_user_id,
      payment_to_end_user_id,
      payment_module_id,
      payment_amount_charges,
      payment_amount,
      payment_card_id,
      ad_status_id,
      isApk,
      payment_installment,
      payment_card_type,
      payment_remain_1,
      // payment_remain_2,
      // razor_key, // Razor KEY Secret
      // razor_author, // Boolean
      payment_book_id,
      ad_install,
    } = req.query;
    // const data_key = await handle_undefined(razor_key);
    var refactor_amount = parseFloat(payment_amount) / 100;
    var refactor_amount_nocharges = parseInt(payment_amount_charges) / 100;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    var expectedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    const is_authenticated = expectedSignature === razorpay_signature;
    if (is_authenticated) {
      var order_payment = new OrderPayment({ ...req.body });
      var institute = await InstituteAdmin.findById({
        _id: `${payment_to_end_user_id}`,
      });
      order_payment.payment_module_type = payment_module_type;
      // order_payment.payment_by_end_user_id = payment_by_end_user_id;
      order_payment.payment_to_end_user_id = payment_to_end_user_id;
      order_payment.payment_flag_by = "Debit";
      order_payment.payment_flag_to = "Credit";
      order_payment.payment_module_id = payment_module_id;
      order_payment.payment_mode = "Razorpay Payment Gateway - (PG)";
      order_payment.payment_amount = refactor_amount_nocharges;
      order_payment.payment_status = "Captured";
      institute.invoice_count += 1;
      order_payment.payment_invoice_number = `${
        institute?.random_institute_code
      }${new Date().getMonth() + 1}${new Date().getFullYear()}${
        institute.invoice_count
      }`;
      var valid_pay = await oneRazorPayment(`${razorpay_payment_id}`);
      order_payment.razor_query.push({
        ...valid_pay,
      });
      await Promise.all([order_payment.save(), institute.save()]);
      if (payment_module_type === "Unlock") {
        const unlock_status = await unlockInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount
        );
        if (isApk) {
          res
            .status(200)
            .send({ message: "Success with Razorpay unlock 😀", check: true });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${unlock_status}/feed`
        );
      } else if (payment_module_type === "Fees") {
        const fee_status = await feeInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          Boolean(razor_author)
        );
        if (isApk) {
          res
            .status(200)
            .send({ message: "Success with Razorpay Fees 😀", check: true });
        }
        res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${fee_status}/feed`);
      } else if (payment_module_type === "Admission") {
        const admission_status = await admissionInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          payment_to_end_user_id,
          payment_installment,
          Boolean(razor_author),
          payment_card_type ?? "",
          payment_remain_1 ?? "",
          payment_card_id ?? "",
          ad_status_id ?? "",
          // activity_id ?? "",
          Boolean(ad_install)
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Admission 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${admission_status}/feed`
        );
      } else if (payment_module_type === "Library Fees") {
        const lib_status = await libraryInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          Boolean(razor_author),
          payment_book_id ?? ""
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Library Fees 😀",
            check: true,
          });
        }
        res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${lib_status}/feed`);
      } else if (payment_module_type === "Hostel") {
        const hostel_status = await hostelInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          ad_status_id ?? "",
          payment_to_end_user_id ?? "",
          payment_installment ?? "",
          Boolean(razor_author),
          payment_remain_1 ?? "",
          Boolean(ad_install)
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Hostel 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${hostel_status}/feed`
        );
      } else if (payment_module_type === "Participate") {
        const participate_status = await participateEventFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          ad_status_id ?? "",
          Boolean(razor_author)
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Participate 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${participate_status}/feed`
        );
      } else if (payment_module_type === "Transport") {
        const trans_status = await transportFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          Boolean(razor_author)
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Participate 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${trans_status}/memberstab`
        );
      } else if (payment_module_type === "Application Fees") {
        const app_status = await applicationFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          Boolean(razor_author)
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Participate 😀",
            check: true,
          });
        }
        res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${app_status}/feed`);
      } else if (payment_module_type === "Backlog") {
        const back_status = await backlogFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          // ad_status_id,
          Boolean(razor_author)
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Participate 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${back_status}/memberstab`
        );
      } else if (payment_module_type === "Direct_Admission") {
        const direct_admission_status = await directAdmissionInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          Boolean(razor_author),
          student_data
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Direct Admission 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${direct_admission_status}/feed`
        );
      } else if (payment_module_type === "Direct_Hostel") {
        const direct_hostel_status = await directHostelInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount_nocharges,
          refactor_amount,
          payment_module_id,
          Boolean(razor_author),
          student_data
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Direct Hostel 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${direct_hostel_status}/feed`
        );
      } else {
      }
    } else {
      console.log(false);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchPaymentHistoryQueryBy = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.query;
    const skip = (page - 1) * limit;
    const { filter, search } = req.query;
    var filtered_array = [];
    if (filter) {
      if (search) {
        var order = await OrderPayment.find({
          $and: [
            { payment_by_end_user_id: uid },
            { payment_module_type: filter },
            { payment_amount: { $gt: 0 } },
          ],
          $or: [
            {
              razorpay_payment_id: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_invoice_number: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_name: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_gr: { $regex: `${search}`, $options: "i" },
            },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
          )
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          })
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          });
      } else {
        var order = await OrderPayment.find({
          $and: [
            { payment_by_end_user_id: uid },
            { payment_module_type: filter },
            { payment_amount: { $gt: 0 } },
          ],
        })
          .sort("-created_at")
          .limit(limit)
          .skip(skip)
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
          )
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          })
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          });
      }
      if (order?.length > 0) {
        // var new_order = order?.filter((ref) => {
        //   if (ref?.payment_amount > 0) return ref;
        // });
        // const oEncrypt = await encryptionPayload(order);
        res.status(200).send({ message: "User Pay History", history: order });
      } else {
        res.status(200).send({ message: "No User Pay History", history: [] });
      }
    } else {
      if (search) {
        var order = await OrderPayment.find({
          $and: [
            {
              payment_by_end_user_id: uid,
            },
            {
              payment_amount: { $gt: 0 },
            },
            { payment_module_type: { $ne: "Expense" } },
          ],
          $or: [
            {
              razorpay_payment_id: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_invoice_number: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_name: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_gr: { $regex: `${search}`, $options: "i" },
            },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
          )
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          })
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          });
      } else {
        var order = await OrderPayment.find({
          $and: [
            {
              payment_by_end_user_id: uid,
            },
            {
              payment_amount: { $gt: 0 },
            },
            { payment_module_type: { $ne: "Expense" } },
          ],
        })
          .sort("-created_at")
          .limit(limit)
          .skip(skip)
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
          )
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          })
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          });
      }
      // for (var filteredData of order) {
      //   if (
      //     `${filteredData?.payment_module_type}` != "Expense" &&
      //     filteredData?.payment_amount > 0
      //   ) {
      //     filtered_array.push(filteredData);
      //   }
      // }
      if (order?.length > 0) {
        // const oEncrypt = await encryptionPayload(order);
        res.status(200).send({ message: "User Pay History", history: order });
      } else {
        res.status(200).send({ message: "No User Pay History", history: [] });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchPaymentHistoryQueryTo = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.query;
    const skip = (page - 1) * limit;
    const { filter, search } = req.query;
    var filtered_array = [];
    if (filter) {
      if (search) {
        var order = await OrderPayment.find({
          $and: [
            { payment_to_end_user_id: uid },
            { payment_module_type: filter },
            { payment_amount: { $gte: 0 } },
            { payment_visible_status: "Not Hide" },
          ],
          $or: [
            {
              razorpay_payment_id: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_invoice_number: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_name: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_gr: { $regex: `${search}`, $options: "i" },
            },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
          )
          .populate({
            path: "payment_student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
              studentMiddleName: { $regex: `${search}`, $options: "i" },
              studentLastName: { $regex: `${search}`, $options: "i" },
              valid_full_name: { $regex: `${search}`, $options: "i" },
              studentGRNO: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          })
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          });
        for (var filteredData of order) {
          if (filteredData?.payment_amount <= 0) {
            filteredData.payment_amount =
              filteredData?.fee_receipt?.fee_payment_amount;
          }
        }
      } else {
        var order = await OrderPayment.find({
          $and: [
            { payment_to_end_user_id: uid },
            { payment_module_type: filter },
            { payment_amount: { $gte: 0 } },
            { payment_visible_status: "Not Hide" },
          ],
        })
          .sort("-created_at")
          .limit(limit)
          .skip(skip)
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
          )
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          })
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          });
        for (var filteredData of order) {
          if (filteredData?.payment_amount <= 0) {
            filteredData.payment_amount =
              filteredData?.fee_receipt?.fee_payment_amount;
          }
        }
      }
      // .populate({
      //   path: "payment_expense_by_end_user_id",
      //   select: "insName photoId insProfilePhoto",
      // })
      // .populate({
      //   path: "payment_expense_to_end_user_id",
      //   select: "userLegalName photoId profilePhoto",
      // });
      if (order?.length > 0) {
        // const oEncrypt = await encryptionPayload(order);
        // var new_order = order?.filter((ref) => {
        //   if (ref?.payment_amount > 0) return ref;
        // });
        res.status(200).send({ message: "User Pay History", history: order });
      } else {
        res.status(200).send({ message: "No User Pay History", history: [] });
      }
    } else {
      if (search) {
        var order = await OrderPayment.find({
          $and: [
            {
              payment_to_end_user_id: uid,
            },
            {
              payment_module_type: { $ne: "Expense" },
            },
            {
              payment_amount: { $gte: 0 },
            },
            { payment_visible_status: "Not Hide" },
          ],
          $or: [
            {
              razorpay_payment_id: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_invoice_number: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_name: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_gr: { $regex: `${search}`, $options: "i" },
            },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query payment_student_gr payment_student_name razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
          )
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          })
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          });
        for (var filteredData of order) {
          // console.log(filteredData?.payment_invoice_number);
          if (filteredData?.payment_amount <= 0) {
            filteredData.payment_amount =
              filteredData?.fee_receipt?.fee_payment_amount;
          }
        }
      } else {
        var order = await OrderPayment.find({
          $and: [
            {
              payment_to_end_user_id: uid,
            },
            {
              payment_module_type: { $ne: "Expense" },
            },
            {
              payment_amount: { $gte: 0 },
            },
            { payment_visible_status: "Not Hide" },
          ],
        })
          .sort("-created_at")
          .limit(limit)
          .skip(skip)
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
          )
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          })
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          });
      }
      // .populate({
      //   path: "payment_expense_by_end_user_id",
      //   select: "insName photoId insProfilePhoto",
      // })
      // .populate({
      //   path: "payment_expense_to_end_user_id",
      //   select: "userLegalName photoId profilePhoto",
      // });
      for (var filteredData of order) {
        // console.log(filteredData?.payment_invoice_number);
        if (filteredData?.payment_amount <= 0) {
          filteredData.payment_amount =
            filteredData?.fee_receipt?.fee_payment_amount;
        }
      }
      if (order?.length > 0) {
        // const oEncrypt = await encryptionPayload(order);
        res.status(200).send({ message: "User Pay History", history: order });
      } else {
        res.status(200).send({ message: "No User Pay History", history: [] });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchPaymentOneHistory = async (req, res) => {
  try {
    const { pid } = req.params;
    if (!pid)
      return res
        .status(200)
        .send({ message: "Their is a bug need to fix it 😀", deny: true });
    const one_pay = await OrderPayment.findById({ _id: pid })
      .populate({
        path: "payment_fee",
        select: "feeName",
      })
      .populate({
        path: "payment_admission",
        select: "applicationName",
      })
      .populate({
        path: "payment_checklist",
        select: "checklistName",
      })
      .populate({
        path: "payment_income",
        select: "incomeDesc",
      })
      .populate({
        path: "payment_expense",
        select: "expenseDesc",
      })
      .populate({
        path: "payment_by_end_user_id",
        select: "userLegalName photoId profilePhoto",
      })
      .populate({
        path: "payment_to_end_user_id",
        select: "insName photoId insProfilePhoto",
      })
      .populate({
        path: "fee_receipt",
      })
      .populate({
        path: "payment_student",
        select:
          "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
        populate: {
          path: "fee_structure hostel_fee_structure",
          select: "unique_structure_name",
        },
      });
    // const oEncrypt = await encryptionPayload(one_pay);
    res
      .status(200)
      .send({ message: "One Payment Detail", deny: false, one_pay });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchPaymentOtherHistoryQueryTo = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.query;
    const skip = (page - 1) * limit;
    const { filter, search } = req.query;
    var filtered_array = [];
    if (filter) {
      if (search) {
        var order = await OrderPayment.find({
          $and: [
            { payment_to_end_user_id: uid },
            { payment_module_type: filter },
            { payment_amount: { $gt: 0 } },
            { payment_visible_status: "Not Hide" },
          ],
          $or: [
            {
              razorpay_payment_id: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_invoice_number: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_name: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_gr: { $regex: `${search}`, $options: "i" },
            },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number payment_student_detail"
          )
          .populate({
            path: "payment_student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
              studentMiddleName: { $regex: `${search}`, $options: "i" },
              studentLastName: { $regex: `${search}`, $options: "i" },
              valid_full_name: { $regex: `${search}`, $options: "i" },
              studentGRNO: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          })
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          });
      } else {
        var order = await OrderPayment.find({
          $and: [
            { payment_to_end_user_id: uid },
            { payment_module_type: filter },
            { payment_amount: { $gt: 0 } },
            { payment_visible_status: "Not Hide" },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number payment_student_detail"
          )
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          })
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          });
      }
      // .populate({
      //   path: "payment_expense_by_end_user_id",
      //   select: "insName photoId insProfilePhoto",
      // })
      // .populate({
      //   path: "payment_expense_to_end_user_id",
      //   select: "userLegalName photoId profilePhoto",
      // });
      if (order?.length > 0) {
        // const oEncrypt = await encryptionPayload(order);
        var new_order = order?.filter((ref) => {
          if (ref?.fee_receipt?.other_fees) return ref;
        });
        let all = await nested_document_limit(page, limit, new_order);
        res.status(200).send({ message: "User Pay History", history: all });
      } else {
        res.status(200).send({ message: "No User Pay History", history: [] });
      }
    } else {
      if (search) {
        var order = await OrderPayment.find({
          $and: [
            {
              payment_to_end_user_id: uid,
            },
            {
              payment_module_type: { $ne: "Expense" },
            },
            {
              payment_amount: { $gt: 0 },
            },
            { payment_visible_status: "Not Hide" },
          ],
          $or: [
            {
              razorpay_payment_id: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_invoice_number: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_name: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_gr: { $regex: `${search}`, $options: "i" },
            },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number payment_student_detail"
          )
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          })
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          });
      } else {
        var order = await OrderPayment.find({
          $and: [
            {
              payment_to_end_user_id: uid,
            },
            {
              payment_module_type: { $ne: "Expense" },
            },
            {
              payment_amount: { $gt: 0 },
            },
            { payment_visible_status: "Not Hide" },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number payment_student_detail"
          )
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          })
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          });
      }
      // .populate({
      //   path: "payment_expense_by_end_user_id",
      //   select: "insName photoId insProfilePhoto",
      // })
      // .populate({
      //   path: "payment_expense_to_end_user_id",
      //   select: "userLegalName photoId profilePhoto",
      // });
      // for (var filteredData of order) {
      //   if (
      //     `${filteredData?.payment_module_type}` != "Expense" &&
      //     filteredData?.payment_amount > 0
      //   ) {
      //     filtered_array.push(filteredData);
      //   }
      // }
      if (order?.length > 0) {
        // const oEncrypt = await encryptionPayload(order);
        var new_order = order?.filter((ref) => {
          if (ref?.fee_receipt?.other_fees) return ref;
        });
        let all = await nested_document_limit(page, limit, new_order);
        res.status(200).send({ message: "User Pay History", history: all });
      } else {
        res.status(200).send({ message: "No User Pay History", history: [] });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchPaymentOneOtherHistoryQueryTo = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.query;
    const skip = (page - 1) * limit;
    const { filter, search, ofid } = req.query;
    var filtered_array = [];
    if (filter) {
      if (search) {
        var order = await OrderPayment.find({
          $and: [
            { payment_to_end_user_id: uid },
            { payment_module_type: filter },
            { payment_amount: { $gt: 0 } },
            { payment_visible_status: "Not Hide" },
          ],
          $or: [
            {
              razorpay_payment_id: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_invoice_number: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_name: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_gr: { $regex: `${search}`, $options: "i" },
            },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number payment_student_detail"
          )
          .populate({
            path: "payment_student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
              studentMiddleName: { $regex: `${search}`, $options: "i" },
              studentLastName: { $regex: `${search}`, $options: "i" },
              valid_full_name: { $regex: `${search}`, $options: "i" },
              studentGRNO: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          })
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          });
      } else {
        var order = await OrderPayment.find({
          $and: [
            { payment_to_end_user_id: uid },
            { payment_module_type: filter },
            { payment_amount: { $gt: 0 } },
            { payment_visible_status: "Not Hide" },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number payment_student_detail"
          )
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          })
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          });
      }
      // .populate({
      //   path: "payment_expense_by_end_user_id",
      //   select: "insName photoId insProfilePhoto",
      // })
      // .populate({
      //   path: "payment_expense_to_end_user_id",
      //   select: "userLegalName photoId profilePhoto",
      // });
      if (order?.length > 0) {
        // const oEncrypt = await encryptionPayload(order);
        var new_order = order?.filter((ref) => {
          if (
            ref?.fee_receipt?.other_fees &&
            `${ref?.fee_receipt?.other_fees}` === `${ofid}`
          )
            return ref;
        });
        let all = await nested_document_limit(page, limit, new_order);
        res.status(200).send({ message: "User Pay History", history: all });
      } else {
        res.status(200).send({ message: "No User Pay History", history: [] });
      }
    } else {
      if (search) {
        var order = await OrderPayment.find({
          $and: [
            {
              payment_to_end_user_id: uid,
            },
            {
              payment_module_type: { $ne: "Expense" },
            },
            {
              payment_amount: { $gt: 0 },
            },
            { payment_visible_status: "Not Hide" },
          ],
          $or: [
            {
              razorpay_payment_id: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_invoice_number: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_name: { $regex: `${search}`, $options: "i" },
            },
            {
              payment_student_gr: { $regex: `${search}`, $options: "i" },
            },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number payment_student_detail"
          )
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          })
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          });
      } else {
        var order = await OrderPayment.find({
          $and: [
            {
              payment_to_end_user_id: uid,
            },
            {
              payment_module_type: { $ne: "Expense" },
            },
            {
              payment_amount: { $gt: 0 },
            },
            { payment_visible_status: "Not Hide" },
          ],
        })
          .sort("-created_at")
          .select(
            "razorpay_order_id paytm_query razorpay_payment_id payment_module_type razor_query payment_module_id payment_by_end_user_id_name payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number payment_student_detail"
          )
          .populate({
            path: "payment_fee",
            select: "feeName",
          })
          .populate({
            path: "payment_admission",
            select: "applicationName",
          })
          .populate({
            path: "payment_checklist",
            select: "checklistName",
          })
          .populate({
            path: "payment_income",
            select: "incomeDesc",
          })
          .populate({
            path: "payment_expense",
            select: "expenseDesc",
          })
          .populate({
            path: "payment_by_end_user_id",
            select: "userLegalName photoId profilePhoto",
          })
          .populate({
            path: "payment_to_end_user_id",
            select: "insName photoId insProfilePhoto",
          })
          .populate({
            path: "fee_receipt",
          })
          .populate({
            path: "payment_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto fee_structure hostel_fee_structure studentGRNO",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select: "unique_structure_name",
            },
          });
      }
      // .populate({
      //   path: "payment_expense_by_end_user_id",
      //   select: "insName photoId insProfilePhoto",
      // })
      // .populate({
      //   path: "payment_expense_to_end_user_id",
      //   select: "userLegalName photoId profilePhoto",
      // });
      // for (var filteredData of order) {
      //   if (
      //     `${filteredData?.payment_module_type}` != "Expense" &&
      //     filteredData?.payment_amount > 0
      //   ) {
      //     filtered_array.push(filteredData);
      //   }
      // }
      if (order?.length > 0) {
        // const oEncrypt = await encryptionPayload(order);
        var new_order = order?.filter((ref) => {
          if (
            ref?.fee_receipt?.other_fees &&
            `${ref?.fee_receipt?.other_fees}` === `${ofid}`
          )
            return ref;
        });
        let all = await nested_document_limit(page, limit, new_order);
        res.status(200).send({ message: "User Pay History", history: all });
      } else {
        res.status(200).send({ message: "No User Pay History", history: [] });
      }
    }
  } catch (e) {
    console.log(e);
  }
};
