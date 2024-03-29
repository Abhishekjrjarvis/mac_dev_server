const InstituteAdmin = require("../../models/InstituteAdmin");
const Finance = require("../../models/Finance");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const Notification = require("../../models/notification");
const Admin = require("../../models/superAdmin");
const Income = require("../../models/Income");
const Batch = require("../../models/Batch");
const Expense = require("../../models/Expense");
const Class = require("../../models/Class");
const ClassMaster = require("../../models/ClassMaster");
const Fees = require("../../models/Fees");
const Department = require("../../models/Department");
const {
  uploadDocFile,
  getFileStream,
  deleteFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const { nested_document_limit } = require("../../helper/databaseFunction");
const {
  designation_alarm,
  email_sms_designation_alarm,
} = require("../../WhatsAppSMS/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const moment = require("moment");
const { handle_undefined } = require("../../Handler/customError");
const {
  generate_hash_pass,
  installment_checker_query,
  generate_random_code_structure,
} = require("../../helper/functions");
const { render_finance_current_role } = require("../Moderator/roleController");
const { universal_random_password } = require("../../Custom/universalId");
const InventoryStore = require("../../models/Stores/store");
const GoodCategory = require("../../models/Stores/GoodCategory");
const Goods = require("../../models/Stores/Goods");
const GoodManager = require("../../models/Stores/GoodManager");

exports.render_new_store_query = async (req, res) => {
  try {
    const { id } = req.params;
    const { sid } = req.body;
    var institute = await InstituteAdmin.findById({ _id: id });
    var stores = new InventoryStore({});
    if (sid) {
      var staff = await Staff.findById({ _id: sid });
      var user = await User.findById({ _id: `${staff.user}` });
      var notify = new Notification({});
      staff.stores_department.push(stores?._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = "Store Manager";
      staff.designation_array.push({
        role: "Store Manager",
        role_id: stores?._id,
      });
      stores.store_head = staff._id;
      notify.notifyContent = `you got the designation of as Store Manager`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Store Designation";
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = institute._id;
      await invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        institute.insName,
        user._id,
        user.deviceToken
      );
      await Promise.all([
        staff.save(),
        user.save(),
        notify.save(),
        stores.save(),
      ]);
      designation_alarm(
        user?.userPhoneNumber,
        "STORE",
        institute?.sms_lang,
        "",
        "",
        ""
      );
      if (user?.userEmail) {
        email_sms_designation_alarm(
          user?.userEmail,
          "STORE",
          institute?.sms_lang,
          "",
          "",
          ""
        );
      }
    } else {
      stores.store_head = null;
    }
    institute.storeDepart.push(stores?._id);
    institute.storeStatus = "Enable";
    stores.institute = institute._id;
    await Promise.all([institute.save(), stores.save()]);
    // const fEncrypt = await encryptionPayload(finance._id);
    res.status(200).send({
      message: "Successfully Assigned Store Manager Staff",
      store: stores._id,
      status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_store_master_query = async (req, res) => {
  try {
    const { sid } = req.params;
    const { mod_id } = req.query;
      const stores = await InventoryStore.findById({ _id: sid })
          .select("tab_manage good_category_count created_at")
      .populate({
        path: "institute",
        select:
          "id adminRepayAmount insBankBalance admissionDepart admissionStatus transportStatus hostelDepart libraryActivate transportDepart library alias_pronounciation",
      })
      .populate({
        path: "store_head",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });
    if (req?.query?.mod_id) {
      var value = await render_finance_current_role(
        stores?.moderator_role,
        mod_id
      );
      if (value?.valid_role) {
      } else {
        stores.enable_protection = false;
      }
    }
    const finance_bind = {
      message: "Store Master Query",
      store: stores,
      roles: req?.query?.mod_id ? value?.permission : null,
    }
    const financeEncrypt = await encryptionPayload(finance_bind);
    res.status(200).send({ encrypt: financeEncrypt });
  } catch (e) {
    console.log(e);
  }
};

exports.render_new_good_category_query = async (req, res) => {
    try {
        const { sid } = req?.params
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const stores = await InventoryStore.findById({ _id: sid })
        const new_good = new GoodCategory({ ...req?.body })
        stores.good_category.push(new_good?._id)
        stores.good_category_count += 1
        new_good.store = stores?._id
        await Promise.all([stores.save(), new_good.save()])
        res.status(200).send({ message: "Explore New Goods Category Query", access: true })
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_good_category_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const { search } = req?.query
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        var stores = await InventoryStore.findById({ _id: sid })
        if (search) {
            var all_good = await GoodCategory.find({
                $and: [{ _id: { $in: stores?.good_category } }],
                $or: [
                    {
                        category_name: { $regex: `${search}`, $options: "i" }
                    },
                    {
                        category_type: { $regex: `${search}`, $options: "i" }
                    }
                ]
            })
            .sort({ created_at: -1 })
            .select("category_name category_type")
        }
        else {
            var all_good = await GoodCategory.find({ _id: { $in: stores?.good_category } })
            .sort({ created_at: -1 })
            .select("category_name category_type")
            .limit(limit)
            .skip(skip)
        }
        
        if (all_good?.length > 0) {
            res.status(200).send({ message: "Explore All Goods Category Query", access: true, all_good: all_good, count: all_good?.length})
        }
        else {
            res.status(200).send({ message: "No Goods Category Query", access: true, all_good: [], count: 0})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_one_good_category_query = async (req, res) => {
    try {
        const { gcid } = req?.params
        if (!gcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        var one_good = await GoodCategory.findById({ _id: gcid })
            .select("category_name category_type")
        
            res.status(200).send({ message: "One Good Category Query", access: true, one_good: one_good})
        
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_new_goods_query = async (req, res) => {
    try {
        const { gcid } = req?.params
        if (!gcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const good_cat = await GoodCategory.findById({ _id: gcid })
        const goods = new Goods({ ...req?.body })
        good_cat.goods_arr.push(goods?._id)
        good_cat.goods_arr_count += 1
        goods.good_category = good_cat?._id
        await Promise.all([good_cat.save(), goods.save()])
        res.status(200).send({ message: "Explore New Goods Query", access: true })
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_goods_query = async (req, res) => {
    try {
        const { gcid } = req?.params
        const { search } = req?.query
        if (!gcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        var good_cat = await GoodCategory.findById({ _id: gcid })
        if (search) {
            var all_goods = await Goods.find({
                $and: [
                    {
                        _id: { $in: good_cat?.goods_arr }
                    }
                ], $or: [
                    {
                        goods_name: { $regex: `${search}`, $options: "i"}
                    }
                ]
            })
            .sort({ created_at: -1 })
            .select("goods_name goods_quantity")
        }
        else {
            var all_goods = await Goods.find({ _id: { $in: good_cat?.goods_arr } })
            .sort({ created_at: -1 })
            .select("goods_name goods_quantity")
            .limit(limit)
            .skip(skip)   
        }
        
        if (all_goods?.length > 0) {
            res.status(200).send({ message: "Explore All Goods Category Query", access: true, all_goods: all_goods, count: all_goods?.length})
        }
        else {
            res.status(200).send({ message: "No Goods Category Query", access: true, all_goods: [], count: 0})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_new_good_head_person_query = async (req, res) => {
    try {
        const { sid } = req?.params
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const stores = await InventoryStore.findById({ _id: sid })
        const staff = await Staff.findById({ _id: `${req?.body?.good_head_person}`})
        const new_manager = new GoodManager({ ...req?.body })
        stores.good_heads.push(new_manager?._id)
        stores.good_heads_count += 1
        new_manager.store = stores?._id
        staff.goods_register.push(new_manager?._id)
        await Promise.all([stores.save(), staff.save(), new_manager.save()])
        res.status(200).send({ message: "Explore New Good head Person Query", access: true})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_good_head_person_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const { search } = req?.query
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        var stores = await InventoryStore.findById({ _id: sid })
        if (search) {
            var all_manager = await GoodManager.find({
                $and: [{ _id: { $in: stores?.good_heads } }],
                $or: [
                    {
                        good_head_name: { $regex: `${search}`, $options: "i" }
                    },
                    {
                        good_title_person: { $regex: `${search}`, $options: "i" }
                    }
                ]
            })
            .sort({ created_at: -1 })
            .select("good_head_name good_title_person")
            .populate({
                path: "good_head_person",
                select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
            })
            .populate({
                path: "store",
                select: "_id"
            })
        }
        else {
            var all_manager = await GoodManager.find({ _id: { $in: stores?.good_heads } })
            .sort({ created_at: -1 })
            .select("good_head_name good_title_person")
            .populate({
                path: "good_head_person",
                select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
            })
            .populate({
                path: "store",
                select: "_id"
            })
            .limit(limit)
            .skip(skip)   
        }
        
        if (all_manager?.length > 0) {
            res.status(200).send({ message: "Explore All Goods Manager Query", access: true, all_manager: all_manager, count: all_manager?.length})
        }
        else {
            res.status(200).send({ message: "No Goods Manager Query", access: true, all_manager: [], count: 0})
        }
    }
    catch (e) {
        console.log(e)
    }
}