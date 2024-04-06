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
const StoreLogs = require("../../models/Stores/StoreLogs");
const IssueGoods = require("../../models/Stores/IssueGoods");
const Library = require("../../models/Library/Library");
const Hostel = require("../../models/Hostel/hostel");
const RequestGoods = require("../../models/Stores/RequestGoods");
const ReturnGoods = require("../../models/Stores/ReturnGoods");
const { generate_qr } = require("../../Utilities/qrGeneration/qr_generation");

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
          "id adminRepayAmount insBankBalance admissionDepart admissionStatus transportStatus hostelDepart libraryActivate transportDepart library alias_pronounciation financeDepart",
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
            .select("goods_name goods_quantity goods_price goods_volume goods_icon goods_qr_code")
        }
        else {
            var all_goods = await Goods.find({ _id: { $in: good_cat?.goods_arr } })
            .sort({ created_at: -1 })
            .select("goods_name goods_quantity goods_price goods_volume goods_icon goods_qr_code")
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

exports.render_add_stock_query = async (req, res) => {
    try {
        const { gcid } = req?.params
        const { sid } = req?.body
        if (!gcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const stores = await InventoryStore.findById({ _id: sid })
        
        const exist_goods = await Goods.findByIdAndUpdate(gcid, req?.body)
        res.status(200).send({ message: "Explore New Goods with Updated Quantity + Volume Query", access: true })
        const logs = new StoreLogs({})
        logs.logs_title = `New ${exist_goods?.goods_name} Updated with volume ${exist_goods?.goods_volume} at ${exist_goods?.goods_price} per ${exist_goods?.goods_quantity}`
        logs.store = stores?._id
        logs.generate_by = `STORE_MANAGER`
        stores.dayBook.push(logs?._id)
        exist_goods.register.push(logs)
        await Promise.all([ logs.save(), stores.save(), exist_goods.save()])
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_issue_stock_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const { arr, assignee, flow } = req?.body
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const stores = await InventoryStore.findById({ _id: sid })
        const issue = new IssueGoods({})
        const logs = new StoreLogs({})
        if (flow === "Department") {
            var module = await Department.findById({ _id: assignee })
            issue.issue_to_department = module?._id
            logs.issue_to_department = module?._id
            module.issue.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Class") {
            var module = await Class.findById({ _id: assignee })
            issue.issue_to_class = module?._id
            logs.issue_to_class = module?._id
            module.issue.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Library") {
            var module = await Library.findById({ _id: assignee })
            issue.issue_to_library = module?._id
            logs.issue_to_library = module?._id
            module.issue.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Hostel") {
            var module = await Hostel.findById({ _id: assignee })
            issue.issue_to_hostel = module?._id
            logs.issue_to_hostel = module?._id
            module.issue.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Individual") {
            var module = await Staff.findById({ _id: assignee })
            issue.issue_to_individual = module?._id
            logs.issue_to_individual = module?._id
            module.issue.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Custom") {
            var module = await GoodManager.findById({ _id: assignee })
            issue.issue_to_custom = module?._id
            logs.issue_to_custom = module?._id
            module.issue.push(issue?._id)
            module.register.push(logs?._id)
        }
        logs.logs_title = `${arr?.length} goods issue to ${flow} Unit.`
        issue.issue_flow = flow
        logs.issue_flow = flow
        for (var val of arr) {
            var goods = await Goods.findById({ _id: `${val?.goodId}` })
            issue.goods.push({
                good: goods?._id,
                quantity: val?.volume
            })
            logs.goods.push({
                good: goods?._id,
                quantity: val?.volume
            })
            goods.goods_volume -= val?.volume
            goods.issue.push(issue?._id)
            goods.register.push(logs?._id)
            await goods.save()
        }
        stores.issue_records.push(issue?._id)
        stores.dayBook.push(logs?._id)
        await Promise.all([stores.save(), issue.save(), logs.save(), module.save()])
        res.status(200).send({ message: "New Goods Issued", access: true})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_issue_stock_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        var stores = await InventoryStore.findById({ _id: sid })
            .select("issue_records")
            
        var all_issue_goods = await IssueGoods.find({ _id: { $in: stores?.issue_records } })
            .select("issue_flow created_at")
            .populate({
                path: "issue_to_department",
                select: "dName"
            })
            .populate({
                path: "issue_to_class",
                select: "className classTitle"
            })
            .populate({
                path: "issue_to_hostel",
                select: "_id"
            })
            .populate({
                path: "issue_to_library",
                select: "_id"
            })
            .populate({
                path: "issue_to_custom",
                select: "good_head_name good_head_name good_head_person created_at",
                populate: {
                    path: "good_head_person",
                    select: "staffFirstName staffMiddleName staffLastName"
                }
            })
            .populate({
                path: "issue_to_individual",
                select: "staffFirstName staffMiddleName staffLastName"
            })
            .populate({
                path: "goods",
                populate: {
                    path: "good",
                }
            })
            .limit(limit)
        .skip(skip)
        
        if (all_issue_goods?.length > 0) {
                res.status(200).send({ message: "Explore Issue Records History Query", access: true, all_issue_goods: all_issue_goods})
        }
        else {
            res.status(200).send({ message: "No Issue Records History Query", access: true, all_issue_goods: []})
            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_one_issue_stock_query = async (req, res) => {
    try {
        const { icid } = req?.params
        if (!icid) return res.status(200).send({ message: "Their is a bug need to fixed immediately" })
        const one_stock = await IssueGoods.findById({ _id: icid })
            .select("goods created_at")
        res.status(200).send({ message: "Explore One Issue Stock Query", access: true, one_stock: one_stock})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_daybook_stock_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        var stores = await InventoryStore.findById({ _id: sid })
            .select("daybook")
            
        var all_daybook = await StoreLogs.find({ $and: [{ _id: { $in: stores?.dayBook}}]})
            .populate({
                path: "issue_to_department",
                select: "dName"
            })
            .populate({
                path: "issue_to_hostel",
                select: "_id"
            })
            .populate({
                path: "issue_to_class",
                select: "className classTitle"
            })
            .populate({
                path: "issue_to_library",
                select: "_id"
            })
            .populate({
                path: "issue_to_individual",
                select: "staffFirstName staffMiddleName staffLastName"
            })
            .populate({
                path: "issue_to_custom",
            })
            .populate({
                path: "goods",
                select: "goods_volume goods_price goods_name goods_quantity goods_icon goods_qr_code"
            })
            .limit(limit)
        .skip(skip)
        
        if (all_daybook?.length > 0) {
                res.status(200).send({ message: "Explore Day Book Query", access: true, all_daybook: all_daybook})
        }
        else {
            res.status(200).send({ message: "No Day Book Query", access: true, all_daybook: []})
            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_category_all_goods_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const { search } = req?.query
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        var stores = await InventoryStore.findById({ _id: sid })
        if (search) {
            var all_goods = await Goods.find({
                $and: [{
                    good_category: { $in: stores?.good_category}
                }], $or: [
                    {
                    goods_name: { $regex: `${search}`, $options: "i"}
                }
                ]
            })
            .select("goods_name goods_quantity goods_price goods_volume goods_icon goods_qr_code")
        }
        else {
            var all_goods = await Goods.find({ good_category: { $in: stores?.good_category} })
                .select("goods_name goods_quantity goods_price goods_volume goods_icon goods_qr_code")
                .limit(limit)
                .skip(skip)
            
        }
        if (all_goods?.length > 0) {
            res.status(200).send({ message: "Explore All Goods At One Place Query", access: true, all_goods: all_goods})
        }
        else {
            res.status(200).send({ message: "No Goods At One Place Query", access: false, all_goods: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_classes_query = async (req, res) => {
    try {
        const { did } = req?.params
        const { search } = req?.query
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

        var depart = await Department.findById({ _id: did })

        if (search) {
            var all_classes = await Class.find({
                $and: [{ batch: depart?.departmentSelectBatch }]
                , $or: [
                    {
                        className: { $regex: `${search}`, $options: "i"}
                    },
                    {
                        classTitle: { $regex: `${search}`, $options: "i"}
                    }
                ]
            }) 
                .select("className classTitle")
                .populate({
                    path: "classTeacher",
                    select: "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto"
            })
        }
        else {
            var all_classes = await Class.find({ $and: [{ batch: depart?.departmentSelectBatch }] })
                .select("className classTitle")
                .populate({
                    path: "classTeacher",
                    select: "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto"
            })
                .limit(limit)
            .skip(skip)
        }

        if (all_classes?.length > 0) {
            res.status(200).send({ message: "Explore All Classes of One Department Query", access: true, all_classes: all_classes})
        }
        else {
            res.status(200).send({ message: "No Classes of One Department Query", access: false, all_classes: []})
        }
        
        
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_merge_custom_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const { search } = req?.query
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        var merge = []
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        var stores = await InventoryStore.findById({ _id: sid })
        if (search) {
            var all_manager = await GoodManager.find({
                $and: [
                    { store: sid }
                ],
                $or: [
                    {
                        good_head_name: { $regex: `${search}`, $options: "i"}
                    },
                    {
                        good_title_person: { $regex: `${search}`, $options: "i"}
                    }
                ]
            })
            .select("good_head_name good_title_person")
            .populate({
                path: "good_head_person",
                select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto staffROLLNO"
            })
            var all_depart = await Department.find({
                $nad: [{ institute: stores?.institute }],
                $or: [
                    {
                        dName: { $regex: `${search}`, $options: "i"}
                    }
                ]}) 
                .select("dName") 
                .populate({
                    path: "dHead",
                    select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto staffROLLNO"
                })
                var all = [...all_depart, ...all_manager]
        }
        else {
            var all_manager = await GoodManager.find({ store: sid })
            .select("good_head_name good_title_person")
            .populate({
                path: "good_head_person",
                select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto staffROLLNO"
            })
            var all_depart = await Department.find({ institute: stores?.institute })
                .select("dName")
                .populate({
                    path: "dHead",
                    select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto staffROLLNO"
                })
            merge = [...all_depart, ...all_manager]
            var all = await nested_document_limit(page, limit, merge)
        }
        if (all?.length > 0) {
            res.status(200).send({ message: "Explore All Combined Department + Custom Query", access: true, all: all})
        }
        else {
            res.status(200).send({ message: "No Combined Department + Custom Query", access: false, all: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_module_all_register_query = async (req, res) => {
    try {
        const { mid } = req?.params
        const { flow } = req?.query
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!mid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        if (flow === "Department") {
            var module = await Department.findById({ _id: mid })
            var all_register = await StoreLogs.find({ _id: { $in: module?.register } })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_department",
                    select: "dName"
                })
        }
        else if (flow === "Class") {
            var module = await Class.findById({ _id: mid })
            var all_register = await StoreLogs.find({ _id: { $in: module?.register } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_class",
                    select: "className classTitle"
                })
        }
        else if (flow === "Library") {
            var module = await Library.findById({ _id: mid })
            var all_register = await StoreLogs.find({ _id: { $in: module?.register } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_library",
                    select: "_id"
                })
        }
        else if (flow === "Hostel") {
            var module = await Hostel.findById({ _id: mid })
            var all_register = await StoreLogs.find({ _id: { $in: module?.register } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_hostel",
                    select: "_id"
                })
        }
        else if (flow === "Individual") {
            var module = await Staff.findById({ _id: mid })
            var all_register = await StoreLogs.find({ _id: { $in: module?.register } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_individual",
                    select: "staffFirstName staffMiddleName staffLastName"
                })
        }
        else if (flow === "Custom") {
            var module = await GoodManager.findById({ _id: mid })
            var all_register = await StoreLogs.find({ _id: { $in: module?.register } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_custom",
                })
        }

        if (all_register?.length > 0) {
            res.status(200).send({ message: "Explore All Module Register Query", access: true, all_register: all_register})
        }
        else {
            res.status(200).send({ message: "No Module Register Query", access: false, all_register: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_module_all_issue_query = async (req, res) => {
    try {
        const { mid } = req?.params
        const { flow } = req?.query
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!mid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        if (flow === "Department") {
            var module = await Department.findById({ _id: mid })
            var all_issue = await IssueGoods.find({ _id: { $in: module?.issue } })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_department",
                    select: "dName"
                })
        }
        else if (flow === "Class") {
            var module = await Class.findById({ _id: mid })
            var all_issue = await IssueGoods.find({ _id: { $in: module?.issue } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_class",
                    select: "className classTitle"
                })
        }
        else if (flow === "Library") {
            var module = await Library.findById({ _id: mid })
            var all_issue = await IssueGoods.find({ _id: { $in: module?.issue } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_library",
                    select: "_id"
                })
        }
        else if (flow === "Hostel") {
            var module = await Hostel.findById({ _id: mid })
            var all_issue = await IssueGoods.find({ _id: { $in: module?.issue } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_hostel",
                    select: "_id"
                })
        }
        else if (flow === "Individual") {
            var module = await Staff.findById({ _id: mid })
            var all_issue = await IssueGoods.find({ _id: { $in: module?.issue } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_individual",
                    select: "staffFirstName staffMiddleName staffLastName"
                })
        }
        else if (flow === "Custom") {
            var module = await GoodManager.findById({ _id: mid })
            var all_issue = await IssueGoods.find({ _id: { $in: module?.issue } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_custom",
                })
        }

        if (all_issue?.length > 0) {
            res.status(200).send({ message: "Explore All Module Issue Query", access: true, all_issue: all_issue})
        }
        else {
            res.status(200).send({ message: "No Module Issue Query", access: false, all_issue: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_module_all_return_query = async (req, res) => {
    try {
        const { mid } = req?.params
        const { flow } = req?.query
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!mid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        if (flow === "Department") {
            var module = await Department.findById({ _id: mid })
            var all_return = await ReturnGoods.find({ _id: { $in: module?.return } })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_department",
                    select: "dName"
                })
        }
        else if (flow === "Class") {
            var module = await Class.findById({ _id: mid })
            var all_return = await ReturnGoods.find({ _id: { $in: module?.return } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_class",
                    select: "className classTitle"
                })
        }
        else if (flow === "Library") {
            var module = await Library.findById({ _id: mid })
            var all_return = await ReturnGoods.find({ _id: { $in: module?.return } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_library",
                    select: "_id"
                })
        }
        else if (flow === "Hostel") {
            var module = await Hostel.findById({ _id: mid })
            var all_return = await ReturnGoods.find({ _id: { $in: module?.return } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_hostel",
                    select: "_id"
                })
        }
        else if (flow === "Individual") {
            var module = await Staff.findById({ _id: mid })
            var all_return = await ReturnGoods.find({ _id: { $in: module?.return } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_individual",
                    select: "staffFirstName staffMiddleName staffLastName"
                })
        }
        else if (flow === "Custom") {
            var module = await GoodManager.findById({ _id: mid })
            var all_return = await ReturnGoods.find({ _id: { $in: module?.return } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_custom",
                })
        }

        if (all_return?.length > 0) {
            res.status(200).send({ message: "Explore All Module Return Query", access: true, all_return: all_return})
        }
        else {
            res.status(200).send({ message: "No Module Return Query", access: false, all_return: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_module_all_consume_query = async (req, res) => {
    try {
        
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_module_all_stocktake_query = async (req, res) => {
    try {
        
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_module_all_maintainence_query = async (req, res) => {
    try {
        
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_module_all_request_query = async (req, res) => {
    try {
        const { mid } = req?.params
        const { flow } = req?.query
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!mid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        if (flow === "Department") {
            var module = await Department.findById({ _id: mid })
            var all_request = await RequestGoods.find({ _id: { $in: module?.request } })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: "request_by_department",
                    select: "dName"
                })
        }
        else if (flow === "Class") {
            var module = await Class.findById({ _id: mid })
            var all_request = await RequestGoods.find({ _id: { $in: module?.request } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "request_by_class",
                    select: "className classTitle"
                })
        }
        else if (flow === "Library") {
            var module = await Library.findById({ _id: mid })
            var all_request = await RequestGoods.find({ _id: { $in: module?.request } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "request_by_library",
                    select: "_id"
                })
        }
        else if (flow === "Hostel") {
            var module = await Hostel.findById({ _id: mid })
            var all_request = await RequestGoods.find({ _id: { $in: module?.request } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "request_by_hostel",
                    select: "_id"
                })
        }
        else if (flow === "Individual") {
            var module = await Staff.findById({ _id: mid })
            var all_request = await RequestGoods.find({ _id: { $in: module?.request } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "request_by_individual",
                    select: "staffFirstName staffMiddleName staffLastName"
                })
        }
        else if (flow === "Custom") {
            var module = await GoodManager.findById({ _id: mid })
            var all_request = await RequestGoods.find({ _id: { $in: module?.request } })
            .limit(limit)
                .skip(skip)
                .populate({
                    path: "request_by_custom",
                })
        }

        if (all_request?.length > 0) {
            res.status(200).send({ message: "Explore All Module Request Query", access: true, all_request: all_request})
        }
        else {
            res.status(200).send({ message: "No Module Request Query", access: false, all_request: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_goods_all_register_query = async (req, res) => {
    try {
        const { gid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!gid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
            var gds = await Goods.findById({ _id: gid })
            var all_register = await StoreLogs.find({ _id: { $in: gds?.register } })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_department",
                    select: "dName"
                })
                .populate({
                    path: "issue_to_hostel",
                    select: "_id"
                })
                .populate({
                    path: "issue_to_class",
                    select: "className classTitle"
                })
                .populate({
                    path: "issue_to_library",
                    select: "_id"
                })
                .populate({
                    path: "issue_to_individual",
                    select: "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto"
                })
                .populate({
                    path: "issue_to_custom",
                })
        if (all_register?.length > 0) {
            res.status(200).send({ message: "Explore All Goods Register Query", access: true, all_register: all_register})
        }
        else {
            res.status(200).send({ message: "No Goods Register Query", access: false, all_register: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_goods_all_issue_query = async (req, res) => {
    try {
        const { gid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!gid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
            var gds = await Goods.findById({ _id: gid })
            var all_issue = await IssueGoods.find({ _id: { $in: gds?.issue } })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_department",
                    select: "dName"
                })
                .populate({
                    path: "issue_to_hostel",
                    select: "_id"
                })
                .populate({
                    path: "issue_to_class",
                    select: "className classTitle"
                })
                .populate({
                    path: "issue_to_library",
                    select: "_id"
                })
                .populate({
                    path: "issue_to_individual",
                    select: "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto"
                })
                .populate({
                    path: "issue_to_custom",
                })

        if (all_issue?.length > 0) {
            res.status(200).send({ message: "Explore All Goods Issue Query", access: true, all_issue: all_issue})
        }
        else {
            res.status(200).send({ message: "No Goods Issue Query", access: false, all_issue: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_goods_all_return_query = async (req, res) => {
    try {
        const { gid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!gid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
            var gds = await Goods.findById({ _id: gid })
            var all_return = await ReturnGoods.find({ _id: { $in: gds?.return } })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: "issue_to_department",
                    select: "dName"
                })
                .populate({
                    path: "issue_to_hostel",
                    select: "_id"
                })
                .populate({
                    path: "issue_to_class",
                    select: "className classTitle"
                })
                .populate({
                    path: "issue_to_library",
                    select: "_id"
                })
                .populate({
                    path: "issue_to_individual",
                    select: "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto"
                })
                .populate({
                    path: "issue_to_custom",
                })

        if (all_return?.length > 0) {
            res.status(200).send({ message: "Explore All Goods Return Query", access: true, all_return: all_return})
        }
        else {
            res.status(200).send({ message: "No Goods Return Query", access: false, all_return: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_goods_all_consume_query = async (req, res) => {
    try {
        
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_goods_all_stocktake_query = async (req, res) => {
    try {
        
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_goods_all_maintainence_query = async (req, res) => {
    try {
        
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_goods_all_request_query = async (req, res) => {
    try {
        const { gid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!gid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
            var gds = await Goods.findById({ _id: gid })
            var all_request = await RequestGoods.find({ _id: { $in: gds?.request } })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: "request_by_department",
                    select: "dName"
                })
                .populate({
                    path: "request_by_hostel",
                    select: "_id"
                })
                .populate({
                    path: "request_by_class",
                    select: "className classTitle"
                })
                .populate({
                    path: "request_by_library",
                    select: "_id"
                })
                .populate({
                    path: "request_by_individual",
                    select: "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto"
                })
                .populate({
                    path: "request_by_custom",
                })

        if (all_request?.length > 0) {
            res.status(200).send({ message: "Explore All Goods Request Query", access: true, all_request: all_request})
        }
        else {
            res.status(200).send({ message: "No Goods Request Query", access: false, all_request: []})
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_return_stock_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const { arr, return_by, flow } = req?.body
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const stores = await InventoryStore.findById({ _id: sid })
        const returns = new ReturnGoods({})
        const logs = new StoreLogs({})
        if (flow === "Department") {
            var module = await Department.findById({ _id: return_by })
            returns.return_to_department = module?._id
            logs.issue_to_department = module?._id
            module.return.push(returns?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Class") {
            var module = await Class.findById({ _id: return_by })
            returns.return_to_class = module?._id
            logs.issue_to_class = module?._id
            module.return.push(returns?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Library") {
            var module = await Library.findById({ _id: return_by })
            returns.return_to_library = module?._id
            logs.issue_to_library = module?._id
            module.return.push(returns?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Hostel") {
            var module = await Hostel.findById({ _id: return_by })
            returns.return_to_hostel = module?._id
            logs.issue_to_hostel = module?._id
            module.return.push(returns?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Individual") {
            var module = await Staff.findById({ _id: return_by })
            returns.return_to_individual = module?._id
            logs.issue_to_individual = module?._id
            module.return.push(returns?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Custom") {
            var module = await GoodManager.findById({ _id: return_by })
            returns.return_to_custom = module?._id
            logs.issue_to_custom = module?._id
            module.return.push(returns?._id)
            module.register.push(logs?._id)
        }
        logs.logs_title = `${arr?.length} goods return by ${flow} Unit To Store Manager`
        returns.return_flow = flow
        logs.return_flow = flow
        for (var val of arr) {
            var goods = await Goods.findById({ _id: `${val?.goodId}` })
            returns.goods.push({
                good: goods?._id,
                quantity: val?.volume
            })
            logs.goods.push({
                good: goods?._id,
                quantity: val?.volume
            })
            goods.goods_volume -= val?.volume
            goods.return.push(returns?._id)
            goods.register.push(logs?._id)
            await goods.save()
        }
        stores.return.push(returns?._id)
        stores.dayBook.push(logs?._id)
        await Promise.all([stores.save(), returns.save(), logs.save(), module.save()])
        res.status(200).send({ message: "New Goods Returned", access: true})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_return_stock_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        var stores = await InventoryStore.findById({ _id: sid })
            .select("return")
            
        var all_return_goods = await ReturnGoods.find({ _id: { $in: stores?.return } })
            .select("return_flow created_at")
            .populate({
                path: "return_to_department",
                select: "dName"
            })
            .populate({
                path: "return_to_class",
                select: "className classTitle"
            })
            .populate({
                path: "return_to_hostel",
                select: "_id"
            })
            .populate({
                path: "return_to_library",
                select: "_id"
            })
            .populate({
                path: "return_to_custom",
                select: "good_head_name good_head_name good_head_person created_at",
                populate: {
                    path: "good_head_person",
                    select: "staffFirstName staffMiddleName staffLastName"
                }
            })
            .populate({
                path: "return_to_individual",
                select: "staffFirstName staffMiddleName staffLastName"
            })
            .populate({
                path: "goods",
                populate: {
                    path: "good",
                }
            })
            .limit(limit)
        .skip(skip)
        
        if (all_return_goods?.length > 0) {
                res.status(200).send({ message: "Explore Return Records History Query", access: true, all_return_goods: all_return_goods})
        }
        else {
            res.status(200).send({ message: "No Return Records History Query", access: true, all_return_goods: []})
            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_one_return_stock_query = async (req, res) => {
    try {
        const { icid } = req?.params
        if (!icid) return res.status(200).send({ message: "Their is a bug need to fixed immediately" })
        const one_stock = await ReturnGoods.findById({ _id: icid })
            .select("goods created_at")
        res.status(200).send({ message: "Explore One Return Stock Query", access: true, one_stock: one_stock})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_request_stock_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const { arr, request_by, flow } = req?.body
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const stores = await InventoryStore.findById({ _id: sid })
        const issue = new RequestGoods({})
        const logs = new StoreLogs({})
        if (flow === "Department") {
            var module = await Department.findById({ _id: request_by })
            issue.request_by_department = module?._id
            logs.issue_to_department = module?._id
            module.request.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Class") {
            var module = await Class.findById({ _id: request_by })
            issue.request_by_class = module?._id
            logs.issue_to_class = module?._id
            module.request.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Library") {
            var module = await Library.findById({ _id: request_by })
            issue.request_by_library = module?._id
            logs.issue_to_library = module?._id
            module.request.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Hostel") {
            var module = await Hostel.findById({ _id: request_by })
            issue.request_by_hostel = module?._id
            logs.issue_to_hostel = module?._id
            module.request.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Individual") {
            var module = await Staff.findById({ _id: request_by })
            issue.request_by_individual = module?._id
            logs.issue_to_individual = module?._id
            module.request.push(issue?._id)
            module.register.push(logs?._id)
        }
        else if (flow === "Custom") {
            var module = await GoodManager.findById({ _id: request_by })
            issue.request_by_custom = module?._id
            logs.issue_to_custom = module?._id
            module.request.push(issue?._id)
            module.register.push(logs?._id)
        }
        logs.logs_title = `${arr?.length} goods request by ${flow} Unit to store manager`
        issue.request_flow = flow
        logs.request_flow = flow
        for (var val of arr) {
            var goods = await Goods.findById({ _id: `${val?.goodId}` })
            issue.goods.push({
                good: goods?._id,
                quantity: val?.volume
            })
            logs.goods.push({
                good: goods?._id,
                quantity: val?.volume
            })
            // goods.goods_volume -= val?.volume
            goods.request.push(issue?._id)
            goods.register.push(logs?._id)
            await goods.save()
        }
        stores.issue_request.push(issue?._id)
        stores.dayBook.push(logs?._id)
        await Promise.all([stores.save(), issue.save(), logs.save(), module.save()])
        res.status(200).send({ message: "New Goods Requested To Store Manager", access: true})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_mark_status_stock_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const { status, rid } = req?.body
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const stores = await InventoryStore.findById({ _id: sid })
        const one_request = await RequestGoods.findById({ _id: rid })
        
        if (status === "Approve") {
            const issue = new IssueGoods({})
            const logs = new StoreLogs({})
            logs.logs_title = `${one_request?.goods?.length} goods ${status} for ${one_request?.request_flow} Unit by store manager`
            issue.issue_flow = one_request?.request_flow
            logs.issue_flow = one_request?.request_flow
            one_request.status = `${status}` 
            for (var val of one_request?.goods) {
                var goods = await Goods.findById({ _id: `${val?.good}` })
                issue.goods.push({
                    good: goods?._id,
                    quantity: val?.volume
                })
                logs.goods.push({
                    good: goods?._id,
                    quantity: val?.volume
                })
                goods.goods_volume -= val?.volume
                goods.issue.push(issue?._id)
                goods.register.push(logs?._id)
                await goods.save()
            }
            if (one_request?.request_flow === "Department") {
                var module = await Department.findById({ _id: one_request?.request_by_department })
                issue.issue_to_department = module?._id
                logs.issue_to_department = module?._id
                module.issue.push(issue?._id)
                module.register.push(logs?._id)
            }
            else if (one_request?.request_flow === "Class") {
                var module = await Class.findById({ _id: one_request?.request_by_department })
                issue.issue_to_department = module?._id
                logs.issue_to_department = module?._id
                module.issue.push(issue?._id)
                module.register.push(logs?._id)
            }
            else if (one_request?.request_flow === "Hostel") {
                var module = await Hostel.findById({ _id: one_request?.request_by_department })
                issue.issue_to_department = module?._id
                logs.issue_to_department = module?._id
                module.issue.push(issue?._id)
                module.register.push(logs?._id)
            }
            else if (one_request?.request_flow === "Library") {
                var module = await Library.findById({ _id: one_request?.request_by_department })
                issue.issue_to_department = module?._id
                logs.issue_to_department = module?._id
                module.issue.push(issue?._id)
                module.register.push(logs?._id)
            }
            else if (one_request?.request_flow === "Individual") {
                var module = await Staff.findById({ _id: one_request?.request_by_department })
                issue.issue_to_department = module?._id
                logs.issue_to_department = module?._id
                module.issue.push(issue?._id)
                module.register.push(logs?._id)
            }
            else if (one_request?.request_flow === "Custom") {
                var module = await GoodManager.findById({ _id: one_request?.request_by_department })
                issue.issue_to_department = module?._id
                logs.issue_to_department = module?._id
                module.issue.push(issue?._id)
                module.register.push(logs?._id)
            }
            stores.issue_records.push(issue?._id)
            stores.dayBook.push(logs?._id)
        }
        else {
            one_request.status = `${status}`
        }
        await Promise.all([stores.save(), issue.save(), logs.save(), module.save(), one_request.save()])
        res.status(200).send({ message: `New Goods ${status} By Store Manager`, access: true})
    }
    catch (e) {
        console.log(e)
    }
}

exports.goods_qr_generation = async (req, res) => {
    try {
        const { sid } = req?.params
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
        
        var stores = await InventoryStore.findById({ _id: sid })
        var all_goods = await Goods.find({ good_category: { $in: stores?.good_heads }})
        for (var good of all_goods) {
            if (good?.goods_qr_code) {
            } else {
              if (good) {
                let good_qr = {
                  store: stores?._id,
                  instituteId: stores?.institute,
                    goodId: good?._id,
                  good_category: good?.good_category
                };
                let imageKey = await generate_qr({
                  fileName: "initial-good-qr",
                  object_contain: good_qr,
                });
                good.goods_qr_code = imageKey;
                await good.save();
                stores.goods_qr?.push(good?._id);
              }
            }
        }
        res.status(200).send({ message: "Explore All Goods QR", access: true})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_request_stock_query = async (req, res) => {
    try {
        const { sid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        var stores = await InventoryStore.findById({ _id: sid })
            .select("issue_request")
            
        var all_request_goods = await RequestGoods.find({ _id: { $in: stores?.issue_request } })
            .select("request_flow created_at")
            .populate({
                path: "request_by_department",
                select: "dName"
            })
            .populate({
                path: "request_by_class",
                select: "className classTitle"
            })
            .populate({
                path: "request_by_hostel",
                select: "_id"
            })
            .populate({
                path: "request_by_library",
                select: "_id"
            })
            .populate({
                path: "request_by_custom",
                select: "good_head_name good_head_name good_head_person created_at",
                populate: {
                    path: "good_head_person",
                    select: "staffFirstName staffMiddleName staffLastName"
                }
            })
            .populate({
                path: "request_by_individual",
                select: "staffFirstName staffMiddleName staffLastName"
            })
            .limit(limit)
        .skip(skip)
        
        if (all_request_goods?.length > 0) {
                res.status(200).send({ message: "Explore Issue Request History Query", access: true, all_request_goods: all_request_goods})
        }
        else {
            res.status(200).send({ message: "No Issue Request History Query", access: true, all_request_goods: []})
            
        }
    }
    catch (e) {
        console.log(e)
    }
}
