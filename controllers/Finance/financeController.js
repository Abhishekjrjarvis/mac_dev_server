const InstituteAdmin = require("../../models/InstituteAdmin");
const Finance = require("../../models/Finance");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const Notification = require("../../models/notification");
const Admin = require("../../models/superAdmin");
const Income = require("../../models/Income");
const Expense = require("../../models/Expense");
const Class = require("../../models/Class");
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
const Payroll = require("../../models/Finance/Payroll");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const BusinessTC = require("../../models/Finance/BToC");
const FeeCategory = require("../../models/Finance/FeesCategory");
const FeeStructure = require("../../models/Finance/FeesStructure");
const FeeMaster = require("../../models/Finance/FeeMaster");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const Transport = require("../../models/Transport/transport");
const Store = require("../../models/Finance/Inventory");
const { nested_document_limit } = require("../../helper/databaseFunction");
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const moment = require("moment");
const Admission = require("../../models/Admission/Admission");
const Library = require("../../models/Library/Library");
const { handle_undefined } = require("../../Handler/customError");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const RemainingList = require("../../models/Admission/RemainingList");
const { generate_hash_pass } = require("../../helper/functions");
const { render_finance_current_role } = require("../Moderator/roleController");

exports.getFinanceDepart = async (req, res) => {
  try {
    const { id, sid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff.user}` });
    const finance = new Finance({});
    const notify = new Notification({});
    staff.financeDepartment.push(finance._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Finance Manager";
    staff.designation_array.push({
      role: "Finance Manager",
      role_id: finance?._id,
    });
    finance.financeHead = staff._id;
    finance.designation_password = await generate_hash_pass();
    institute.financeDepart.push(finance._id);
    institute.financeStatus = "Enable";
    finance.institute = institute._id;
    notify.notifyContent = `you got the designation of as Finance Manager A/c Access Pin - ${finance?.designation_password}`;
    notify.notify_hi_content = `आपको वित्त व्यवस्थापक के रूप में पदनाम मिला है |`;
    notify.notify_mr_content = `तुम्हाला वित्त व्यवस्थापक म्हणून पद मिळाले आहे`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Finance Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      institute.save(),
      staff.save(),
      finance.save(),
      user.save(),
      notify.save(),
    ]);
    // const fEncrypt = await encryptionPayload(finance._id);
    res.status(200).send({
      message: "Successfully Assigned Staff",
      finance: finance._id,
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "FINANCE",
      institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {}
};

exports.uploadBankDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bankAccountHolderName,
      bankAccountNumber,
      bankIfscCode,
      bankAccountPhoneNumber,
      bankAccountType,
      GSTInfo,
      businessName,
      businessAddress,
      gstSlab,
      razor_account,
      razor_key,
      razor_id,
    } = req.body;
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var institute = await InstituteAdmin.findById({ _id: id });
    if (razor_account) {
      institute.razor_key = razor_key;
      institute.razor_id = razor_id;
      institute.razor_account = razor_account;
      institute.bankAccountPhoneNumber = bankAccountPhoneNumber;
      await institute.save();
      res.status(200).send({
        message: "Merchant Details updated 😀🎉",
        status: true,
      });
    } else {
      const notify = new Notification({});
      institute.bankAccountHolderName = bankAccountHolderName;
      institute.bankAccountNumber = bankAccountNumber;
      institute.bankIfscCode = bankIfscCode;
      institute.bankAccountPhoneNumber = bankAccountPhoneNumber;
      institute.paymentBankStatus = "verification in progress";
      institute.GSTInfo = GSTInfo;
      institute.businessName = businessName;
      institute.businessAddress = businessAddress;
      institute.gstSlab = gstSlab;
      institute.financeDetailStatus = "Added";
      institute.bankAccountType = bankAccountType;
      notify.notifyContent = ` ${institute.insName} Institute payment Details updated Check and Verify `;
      notify.notifySender = institute._id;
      notify.notifyReceiever = admin._id;
      notify.notifyCategory = "Bank Detail";
      admin.aNotify.push(notify._id);
      notify.notifyByInsPhoto = institute._id;
      await Promise.all([institute.save(), admin.save(), notify.save()]);
      res.status(200).send({
        message: "bank detail updated wait for verification",
        status: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.removeBankDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    if (institute.razor_account) {
      institute.razor_key = "";
      institute.razor_id = "";
      institute.razor_account = false;
    } else {
      institute.bankAccountHolderName = "";
      institute.bankAccountNumber = "";
      institute.bankAccountType = "";
      institute.bankIfscCode = "";
      institute.bankAccountPhoneNumber = "";
      institute.GSTInfo = "";
      institute.businessName = "";
      institute.businessAddress = "";
      institute.gstSlab = "";
      institute.financeDetailStatus = "Not Added";
      institute.paymentBankStatus = "";
    }
    await Promise.all([institute.save()]);
    res.status(200).send({ message: "Bank Details Removed" });
  } catch (e) {}
};

exports.updateBankDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
    const notify = new Notification({});
    institute.paymentBankStatus = "verification in progress";
    notify.notifyContent = ` ${institute.insName} Institute payment Details updated Check and Verify `;
    notify.notifySender = institute._id;
    notify.notifyReceiever = admin._id;
    notify.notifyCategory = "Bank Detail";
    admin.aNotify.push(notify._id);
    notify.notifyByInsPhoto = institute._id;
    await Promise.all([institute.save(), admin.save(), notify.save()]);
    res
      .status(200)
      .send({ message: "bank detail updated wait for verification" });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveFinanceQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { mod_id } = req.query;
    // const is_cache = await connect_redis_hit(`Finance-Detail-${fid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Detail Finance Manager from Cache 🙌",
    //     finance: is_cache.finance,
    //   });
    const finance = await Finance.findById({ _id: fid })
      .select(
        "financeName financeEmail financePhoneNumber enable_protection moderator_role moderator_role_count financeAbout photoId photo cover coverId financeCollectedBankBalance financeTotalBalance financeRaisedBalance financeExemptBalance financeCollectedSBalance financeBankBalance financeCashBalance financeSubmitBalance financeTotalBalance financeEContentBalance financeApplicationBalance financeAdmissionBalance financeIncomeCashBalance financeIncomeBankBalance financeExpenseCashBalance financeExpenseBankBalance payment_modes_type finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode fees_category_count exempt_receipt_count government_receipt_count fee_master_array_count designation_status"
      )
      .populate({
        path: "institute",
        select: "id adminRepayAmount insBankBalance admissionDepart",
      })
      .populate({
        path: "financeHead",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });
    // const financeEncrypt = await encryptionPayload(finance);
    // const cached = await connect_redis_miss(
    //   `Finance-Detail-${fid}`,
    //   finance
    // );
    if (req?.query?.mod_id) {
      var value = await render_finance_current_role(
        finance?.moderator_role,
        mod_id
      );
    }
    res.status(200).send({
      message: "Finance",
      finance: finance,
      roles: req?.query?.mod_id ? value : "",
      // finance: cached.finance
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getIncome = async (req, res) => {
  try {
    const { fid } = req.params;
    const { user_query } = req.query;
    const finance = await Finance.findById({ _id: fid });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var f_user = await InstituteAdmin.findById({ _id: `${finance.institute}` });
    if (user_query) {
      var user = await User.findOne({
        _id: `${user_query}`,
      }).select("_id payment_history");
    }
    var incomes = new Income({ ...req.body });
    if (req.file) {
      const file = req.file;
      const results = await uploadDocFile(file);
      incomes.incomeAck = results.key;
    }
    var order = new OrderPayment({});
    finance.incomeDepartment.push(incomes._id);
    incomes.finances = finance._id;
    incomes.invoice_number = finance.incomeDepartment?.length;
    order.payment_module_type = "Income";
    order.payment_to_end_user_id = f_user._id;
    order.payment_module_id = incomes._id;
    order.payment_amount = incomes.incomeAmount;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_mode = incomes.incomeAccount;
    order.payment_income = incomes._id;
    f_user.payment_history.push(order._id);
    s_admin.invoice_count += 1;
    order.payment_invoice_number = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${s_admin.invoice_count}`;
    if (user) {
      order.payment_by_end_user_id = user._id;
      order.payment_flag_by = "Debit";
      user.payment_history.push(order._id);
      incomes.incomeFromUser = user._id;
      await user.save();
    } else {
      incomes.incomeFromUser = null;
    }
    if (req.body?.incomeFrom) {
      incomes.incomeFrom = req.body?.incomeFrom;
      order.payment_by_end_user_id_name = req.body?.incomeFrom;
    }
    if (req.body.incomeAccount === "By Cash") {
      finance.financeIncomeCashBalance =
        finance.financeIncomeCashBalance + incomes.incomeAmount;
      finance.financeTotalBalance += incomes.incomeAmount;
    } else if (req.body.incomeAccount === "By Bank") {
      finance.financeIncomeBankBalance =
        finance.financeIncomeBankBalance + incomes.incomeAmount;
      finance.financeTotalBalance += incomes.incomeAmount;
    }
    if (incomes?.gstSlab > 0) {
      finance.gst_format.liability.push(incomes._id);
    }
    await Promise.all([
      finance.save(),
      incomes.save(),
      order.save(),
      f_user.save(),
      s_admin.save(),
    ]);
    if (req.file) {
      await unlinkFile(req.file.path);
    }
    // Add Another Encryption
    res.status(200).send({
      message: "Add New Income",
      finance: finance._id,
      incomes: incomes._id,
      status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllIncomes = async (req, res) => {
  try {
    const { queryStatus } = req.body;
    if (queryStatus === "By Cash") {
      const income = await Income.find({ incomeAccount: queryStatus });
      // const iEncrypt = await encryptionPayload(income);
      res.status(200).send({ message: "cash data", cashIncome: income });
    } else if (queryStatus === "By Bank") {
      const income = await Income.find({ incomeAccount: queryStatus });
      // const iEncrypt = await encryptionPayload(income);
      res.status(200).send({ message: "bank data", bankIncome: income });
    } else {
    }
  } catch (e) {}
};

exports.getExpense = async (req, res) => {
  try {
    const { fid } = req.params;
    const { is_inventory, user_query } = req.query;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const finance = await Finance.findById({ _id: fid });
    var f_user = await InstituteAdmin.findById({ _id: `${finance.institute}` });
    if (user_query) {
      var user = await User.findOne({
        _id: `${user_query}`,
      }).select("_id payment_history");
    }
    if (
      finance.financeTotalBalance > 0 &&
      req.body.expenseAmount <= finance.financeTotalBalance
    ) {
      const expenses = new Expense({ ...req.body });
      if (req.file) {
        const file = req.file;
        const results = await uploadDocFile(file);
        expenses.expenseAck = results.key;
      }
      var order = new OrderPayment({});
      finance.expenseDepartment.push(expenses._id);
      expenses.finances = finance._id;
      expenses.invoice_number = finance.expenseDepartment?.length;
      order.payment_module_type = "Expense";
      order.payment_to_end_user_id = f_user._id;
      order.payment_module_id = expenses._id;
      order.payment_amount = expenses.expenseAmount;
      order.payment_status = "Captured";
      order.payment_flag_by = "Debit";
      order.payment_mode = expenses.expenseAccount;
      s_admin.invoice_count += 1;
      order.payment_invoice_number = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${s_admin.invoice_count}`;
      order.payment_expense = expenses._id;
      f_user.payment_history.push(order._id);
      if (user) {
        order.payment_by_end_user_id = user._id;
        order.payment_flag_to = "Credit";
        user.payment_history.push(order._id);
        expenses.expensePaidUser = user._id;
        await user.save();
      } else {
        expenses.expensePaidUser = null;
      }
      if (req.body?.expensePaid) {
        expenses.expensePaid = req.body?.expensePaid;
        order.payment_by_end_user_id_name = req.body?.expensePaid;
      }
      if (req.body.expenseAccount === "By Cash") {
        finance.financeExpenseCashBalance =
          finance.financeExpenseCashBalance + expenses.expenseAmount;
        if (finance.financeTotalBalance >= expenses.expenseAmount) {
          finance.financeTotalBalance -= expenses.expenseAmount;
        }
      } else if (req.body.expenseAccount === "By Bank") {
        finance.financeExpenseBankBalance =
          finance.financeExpenseBankBalance + expenses.expenseAmount;
        if (finance.financeTotalBalance >= expenses.expenseAmount) {
          finance.financeTotalBalance -= expenses.expenseAmount;
        }
      }
      if (expenses?.gstSlab > 0) {
        finance.gst_format.input_tax_credit.push(expenses._id);
      }
      await Promise.all([
        finance.save(),
        expenses.save(),
        order.save(),
        f_user.save(),
        s_admin.save(),
      ]);
      if (req.file) {
        await unlinkFile(req.file.path);
      }
      // Add Another Encryption
      res.status(200).send({
        message: "Add New Expense",
        finance: finance._id,
        expenses: expenses._id,
        status: true,
      });
      if (is_inventory) {
        const exist_store = await Store.findOne({
          goods_name: req.body.expense_good_name,
        });
        if (exist_store) {
          exist_store.expense_array.push(expenses?._id);
          exist_store.total_expenses += parseInt(req.body.expenseAmount);
          exist_store.goods_quantity += parseInt(req.body.expense_quantity);
          await exist_store.save();
        } else {
          const store = new Store({ ...req.body });
          store.goods_name = req.body.expense_good_name;
          store.goods_quantity = parseInt(req.body.expense_quantity);
          store.hsn_code = req.body.expense_hsn_code;
          store.goods_amount = parseInt(req.body.expenseAmount);
          store.total_expenses = parseInt(req.body.expenseAmount);
          store.expense_array.push(expenses?._id);
          finance.finance_inventory.push(store?._id);
          finance.finance_inventory_count += 1;
          await Promise.all([finance.save(), store.save()]);
        }
      }
    } else {
      res.status(200).send({ message: "Expense Not Permitted" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAllExpense = async (req, res) => {
  try {
    const { queryStatus } = req.body;
    if (queryStatus === "By Cash") {
      const expense = await Expense.find({ expenseAccount: queryStatus });
      // const eEncrypt = await encryptionPayload(expense);
      res.status(200).send({ message: "cash data", cashExpense: expense });
    } else if (queryStatus === "By Bank") {
      const expense = await Expense.find({ expenseAccount: queryStatus });
      // const eEncrypt = await encryptionPayload(expense);
      res.status(200).send({ message: "bank data", bankExpense: expense });
    } else {
    }
  } catch (e) {}
};

exports.requestClassOfflineFee = async (req, res) => {
  try {
    const { fid, cid, id } = req.params;
    const { amount } = req.body;
    const finance = await Finance.findById({ _id: fid });
    //
    const financeStaff = await Staff.findById({
      _id: `${finance.financeHead}`,
    });
    const user = await User.findById({ _id: `${financeStaff.user}` });
    //
    const classes = await Class.findById({ _id: cid }).populate({
      path: "classTeacher",
      select: "staffFirstName staffMiddleName staffLastName",
    });
    const fee = await Fees.findById({ _id: id });
    if (
      finance.requestArray.length >= 1 &&
      finance.requestArray.includes(String(classes._id))
    ) {
      res
        .status(200)
        .send({ message: "Already Requested wait for further process" });
    } else {
      finance.classRoom.push({
        classId: classes._id,
        className: classes.className,
        photoId: classes.photoId,
        photo: classes.photo,
        staff: `${classes.classTeacher.staffFirstName} ${
          classes.classTeacher.staffMiddleName
            ? classes.classTeacher.staffMiddleName
            : ""
        } ${classes.classTeacher.staffLastName}`,
        feeId: fee._id,
        feeName: fee.feeName,
        feeAmount: amount,
        status: "Pending",
      });
      // finance.financeCollectedSBalance += amount;
      finance.requestArray.push(classes._id);
      classes.receieveFee.push(fee._id);
      classes.requestFeeStatus.feeId = fee._id;
      classes.requestFeeStatus.status = "Requested";
      //
      const notify = new StudentNotification({});
      notify.notifyContent = `Rs.${amount} Offline Payment Request for submission`;
      notify.notify_hi_content = `Rs.${amount} ऑफ़लाइन पेमेंट जमा करने के लिए अनुरोध |`;
      notify.notify_mr_content = `ऑफलाइन पेमेंट सबमिशनसाठी रु.${amount} ची विनंती आली आहे.`;
      notify.notifySender = classes._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Staff";
      notify.notifyPublisher = financeStaff._id;
      notify.financeId = finance._id;
      user.activity_tab.push(notify._id);
      notify.notifyByClassPhoto = classes._id;
      notify.notifyCategory = "Class Fee Request";
      notify.redirectIndex = 8;
      //
      invokeMemberTabNotification(
        "Staff Activity",
        notify,
        "Offline Payment Request",
        user._id,
        user.deviceToken,
        "Staff",
        notify
      );
      //
      await Promise.all([
        finance.save(),
        classes.save(),
        user.save(),
        notify.save(),
      ]);
      res
        .status(200)
        .send({ message: "class Request At Finance ", request: true });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.submitClassOfflineFee = async (req, res) => {
  try {
    const { fid, cid, id } = req.params;
    const { amount } = req.body;
    var finance = await Finance.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid }).populate({
      path: "classTeacher",
      select: "staffFirstName staffMiddleName staffLastName",
    });
    const classStaff = await Staff.findById({
      _id: `${classes?.classTeacher?._id}`,
    }).select("id user");
    const user = await User.findById({ _id: `${classStaff?.user}` });
    const fees = await Fees.findById({ _id: id });
    finance.classRoom.splice(
      {
        classId: classes._id,
        className: classes.className,
        photoId: classes.photoId,
        photo: classes.photo,
        staff: `${classes.classTeacher.staffFirstName} ${
          classes.classTeacher.staffMiddleName
            ? classes.classTeacher.staffMiddleName
            : ""
        } ${classes.classTeacher.staffLastName}`,
        feeId: fees._id,
        feeName: fees.feeName,
        feeAmount: amount,
        status: "Pending",
      },
      1
    );
    finance.submitClassRoom.push({
      classId: classes._id,
      className: classes.className,
      photoId: classes.photoId,
      photo: classes.photo,
      staff: `${classes.classTeacher.staffFirstName} ${
        classes.classTeacher.staffMiddleName
          ? classes.classTeacher.staffMiddleName
          : ""
      } ${classes.classTeacher.staffLastName}`,
      feeId: fees._id,
      feeName: fees.feeName,
      feeAmount: amount,
      status: "Accepted",
    });
    classes.receieveFee.pull(fees._id);
    classes.submitFee.push(fees._id);
    finance.requestArray.pull(classes._id);
    finance.financeSubmitBalance += amount;
    finance.financeTotalBalance += amount;
    if (finance.financeCollectedSBalance > 0) {
      finance.financeCollectedSBalance -= amount;
    }
    // finance.financeSubmitBalance += fees.offlineFee;
    fees.offlineFee = 0;
    classes.requestFeeStatus.feeId = fees._id;
    classes.requestFeeStatus.status = "Accepted";
    for (let i = 0; i < classes.offlineFeeCollection.length; i++) {
      if (classes.offlineFeeCollection[i].feeId === `${fees._id}`) {
        classes.offlineFeeCollection[i].fee = 0;
      } else {
      }
    }
    //
    const notify = new StudentNotification({});
    notify.notifyContent = `Your Rs.${amount} Offline Payment Request has been processed and approved`;
    notify.notify_hi_content = `आपका रु.${amount} ऑफ़लाइन पेमेंट अनुरोध संसाधित और स्वीकृत हो गया है |`;
    notify.notify_mr_content = `तुमची रु.${amount} ऑफलाइन पेमेंट विनंती मंजूर झाली`;
    notify.notifySender = finance?._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Staff";
    notify.notifyPublisher = classStaff?._id;
    user.activity_tab.push(notify._id);
    notify.notifyByFinancePhoto = finance?._id;
    notify.notifyCategory = "Class Fee Approved";
    notify.redirectIndex = 8;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Payment Approval",
      user._id,
      user.deviceToken,
      "Staff",
      notify
    );
    //
    await Promise.all([
      classes.save(),
      finance.save(),
      fees.save(),
      user.save(),
      notify.save(),
    ]);
    // const classEncrypt = await encryptionPayload(finance.classRoom.length);
    res.status(200).send({
      message: "Reuqest Accepted",
      accept: true,
      classLength: finance.classRoom.length,
    });
  } catch (e) {}
};

exports.classOfflineFeeIncorrect = async (req, res) => {
  try {
    const { fid, cid, id } = req.params;
    const { amount } = req.body;
    const finance = await Finance.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid }).populate({
      path: "classTeacher",
      select: "staffFirstName staffMiddleName staffLastName",
    });
    const classStaff = await Staff.findById({
      _id: `${classes?.classTeacher?._id}`,
    }).select("id user");
    const user = await User.findById({ _id: `${classStaff?.user}` });
    const fees = await Fees.findById({ _id: id });
    finance.classRoom.splice(
      {
        classId: classes._id,
        className: classes.className,
        photoId: classes.photoId,
        photo: classes.photo,
        staff: `${classes.classTeacher.staffFirstName} ${
          classes.classTeacher.staffMiddleName
            ? classes.classTeacher.staffMiddleName
            : ""
        } ${classes.classTeacher.staffLastName}`,
        feeId: fees._id,
        feeName: fees.feeName,
        feeAmount: amount,
        status: "Pending",
      },
      1
    );
    finance.pendingClassroom.push({
      classId: classes._id,
      className: classes.className,
      photoId: classes.photoId,
      photo: classes.photo,
      staff: `${classes.classTeacher.staffFirstName} ${
        classes.classTeacher.staffMiddleName
          ? classes.classTeacher.staffMiddleName
          : ""
      } ${classes.classTeacher.staffLastName}`,
      feeId: fees._id,
      feeName: fees.feeName,
      feeAmount: amount,
      status: "Rejected",
    });
    finance.requestArray.pull(classes._id);
    classes.requestFeeStatus.feeId = fees._id;
    classes.requestFeeStatus.status = "Rejected";
    //
    const notify = new StudentNotification({});
    notify.notifyContent = `Your Rs.${amount} Offline Payment Request has been rejected`;
    notify.notify_hi_content = `आपका रु.${amount} ऑफ़लाइन भुगतान अनुरोध अस्वीकार कर दिया गया है |`;
    notify.notify_mr_content = `तुमची रु.${amount} ऑफलाइन पेमेंट विनंती नाकारण्यात आली आहे`;
    notify.notifySender = finance?._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Staff";
    notify.notifyPublisher = classStaff?._id;
    user.activity_tab.push(notify._id);
    notify.notifyByFinancePhoto = finance?._id;
    notify.notifyCategory = "Class Fee Rejected";
    notify.redirectIndex = 8;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Payment Rejection",
      user._id,
      user.deviceToken,
      "Staff",
      notify
    );
    //
    await Promise.all([
      finance.save(),
      classes.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({ message: "Request Reject", reject: true });
  } catch {}
};

exports.retrievePaymentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    // const is_cache = await connect_redis_hit(`Finance-Ins-Bank-Detail-${id}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Detail Finance Institute Bank Detail from Cache 🙌",
    //     bank: is_cache.bank,
    //   });
    const bank = await InstituteAdmin.findById({ _id: id }).select(
      "bankAccountHolderName paymentBankStatus bankAccountNumber bankAccountType bankAccountPhoneNumber bankIfscCode razor_key razor_id razor_account"
    );
    // const bankEncrypt = await encryptionPayload(bank);
    // const cached = await connect_redis_miss(
    //   `Finance-Ins-Bank-Detail-${id}`,
    //   bank
    // );
    res.status(200).send({
      message: "Payment Detail",
      bank: bank,
      // bank: cached.bank
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveIncomeQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    // const is_cache = await connect_redis_hit(`Finance-All-Incomes-${fid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Incomes of Finance from Cache 🙌",
    //     allIncome: is_cache.incomes,
    //   });
    const finance = await Finance.findById({ _id: fid }).select(
      "financeName incomeDepartment"
    );
    const incomes = await Income.find({
      _id: { $in: finance.incomeDepartment },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "incomeFromUser",
        select: "username userLegalName photoId profilePhoto",
      });
    // const iEncrypt = await encryptionPayload(incomes);
    // const cached = await connect_redis_miss(
    //   `Finance-All-Incomes-${fid}`,
    //   incomes
    // );
    if (incomes?.length > 0) {
      res.status(200).send({
        message: "All Incomes",
        allIncome: incomes,
        // allIncome: cached.incomes,
      });
    } else {
      res.status(200).send({
        message: "No Incomes",
        allIncome: [],
        // allIncome: cached.incomes,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveExpenseQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    // const is_cache = await connect_redis_hit(`Finance-All-Expenses-${fid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Expenses of Finance from Cache 🙌",
    //     allIncome: is_cache.expenses,
    //   });
    const finance = await Finance.findById({ _id: fid }).select(
      "financeName expenseDepartment"
    );
    const expenses = await Expense.find({
      _id: { $in: finance.expenseDepartment },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "expensePaidUser",
        select: "username userLegalName photoId profilePhoto",
      });
    // const eEncrypt = await encryptionPayload(expenses);
    // const cached = await connect_redis_miss(
    //   `Finance-All-Expenses-${fid}`,
    //   expenses
    // );
    if (expenses?.length > 0) {
      res.status(200).send({
        message: "All Expenses",
        allIncome: expenses,
        // allIncome: cached.expenses,
      });
    } else {
      res.status(200).send({
        message: "No Expenses",
        allIncome: [],
        // allIncome: cached.expenses,
      });
    }
  } catch {}
};

exports.retrieveRequestAtFinance = async (req, res) => {
  try {
    const { fid } = req.params;
    // const is_cache = await connect_redis_hit(`Finance-All-Class-Request-${fid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Class Requests at Finance from Cache 🙌",
    //     request: is_cache.finance.classRoom,
    //     requestCount: is_cache.finance.classRoom.length,
    //   });
    const finance = await Finance.findById({ _id: fid })
      .select("financeName")
      .populate({
        path: "classRoom",
      });
    // Add Another Encryption
    // const bind_request = {
    //   request: finance.classRoom,
    //   requestCount: finance.classRoom.length,
    // }
    // const cached = await connect_redis_miss(
    //   `Finance-All-Class-Request-${fid}`,
    //   bind_request
    // );
    res.status(200).send({
      message: "Get All Request from DB 🙌",
      request: finance.classRoom,
      requestCount: finance.classRoom.length,
      // request: cached.finance.classRoom,
      // requestCount: cached.finance.classRoom.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveSubmitAtFinance = async (req, res) => {
  try {
    const { fid } = req.params;
    // const is_cache = await connect_redis_hit(`Finance-All-Class-Submit-${fid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Class Submit Requests at Finance from Cache 🙌",
    //     submit: is_cache.finance.submitClassRoom,
    //     submitCount: is_cache.finance.submitClassRoom.length,
    //   });
    const finance = await Finance.findById({ _id: fid })
      .select("financeName")
      .populate({
        path: "submitClassRoom",
      });
    // Add Another Encryption
    // const bind_submit = {
    // submit: finance.submitClassRoom,
    // submitCount: finance.submitClassRoom.length,
    // }
    // const cached = await connect_redis_miss(
    //   `Finance-All-Class-Submit-${fid}`,
    //   bind_submit
    // );
    res.status(200).send({
      message: "Get All Submit from DB 🙌",
      submit: finance.submitClassRoom,
      submitCount: finance.submitClassRoom.length,
      // submit: cached.finance.submitClassRoom,
      // submitCount: cached.finance.submitClassRoom.length,
    });
  } catch {}
};

exports.retrieveRejectAtFinance = async (req, res) => {
  try {
    const { fid } = req.params;
    // const is_cache = await connect_redis_hit(`Finance-All-Class-Reject-${fid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Class Reject Requests at Finance from Cache 🙌",
    //     submit: is_cache.finance.submitClassRoom,
    //     submitCount: is_cache.finance.submitClassRoom.length,
    //   });
    const finance = await Finance.findById({ _id: fid })
      .select("financeName")
      .populate({
        path: "pendingClassroom",
      });
    // Add Another Encryption
    // const bind_reject = {
    // reject: finance.pendingClassroom,
    // rejectCount: finance.pendingClassroom.length,
    // }
    // const cached = await connect_redis_miss(
    //   `Finance-All-Class-Reject-${fid}`,
    //   bind_reject
    // );
    res.status(200).send({
      message: "Get Reject",
      reject: finance.pendingClassroom,
      rejectCount: finance.pendingClassroom.length,
      // reject: cached.finance.pendingClassroom,
      // rejectCount: cached.finance.pendingClassroom.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveIncomeBalance = async (req, res) => {
  try {
    const { fid } = req.params;
    // const is_cache = await connect_redis_hit(`Finance-Income-Balance-${fid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Income Balance at Finance from Cache 🙌",
    //     incomeBalance: is_cache.finance
    //   });
    const finance = await Finance.findById({ _id: fid }).select(
      "financeIncomeCashBalance financeIncomeBankBalance"
    );
    // const incomeEncrypt = await encryptionPayload(finance);
    // const cached = await connect_redis_miss(
    //   `Finance-All-Class-Reject-${fid}`,
    //   bind_reject
    // );
    res.status(200).send({ message: "Income Balance", incomeBalance: finance });
  } catch (e) {
    // console.log(e)
  }
};

exports.retrieveExpenseBalance = async (req, res) => {
  try {
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid }).select(
      "financeExpenseCashBalance financeExpenseBankBalance"
    );
    // const expenseEncrypt = await encryptionPayload(finance);
    res
      .status(200)
      .send({ message: "Expense Balance", expenseBalance: finance });
  } catch (e) {
    // console.log(e)
  }
};

exports.retrieveRemainFeeBalance = async (req, res) => {
  try {
    const { fid } = req.params;
    var remain = 0;
    const finance = await Finance.findById({ _id: fid }).select("id institute");
    const student = await Student.find({
      $and: [
        { institute: `${finance.institute}` },
        { studentStatus: "Approved" },
      ],
    }).select("id studentRemainingFeeCount ");
    student.forEach((stu) => {
      remain += stu.studentRemainingFeeCount;
    });
    // const remainEncrypt = await encryptionPayload(remain);
    res.status(200).send({ message: "Remaining Balance", remain: remain });
  } catch (e) {
    // console.log(e)
  }
};

exports.addEmpToFinance = async (req, res) => {
  try {
    const { fid, sid } = req.params;
    const finance = await Finance.findById({ _id: fid });
    const staff = await Staff.findById({ _id: sid }).select("id");
    const pay_scale = new Payroll({ ...req.body });
    pay_scale.staff = staff._id;
    finance.staff_pay_list.push(pay_scale._id);
    await Promise.all([pay_scale.save(), finance.save()]);
    res
      .status(200)
      .send({ message: "Employee Added for Payroll", status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.allEmpToFinance = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const finance = await Finance.findById({ _id: fid }).select(
      "_id staff_pay_list"
    );

    const allEmp = await Payroll.find({ _id: { $in: finance.staff_pay_list } })
      .limit(limit)
      .skip(skip)
      .select("id")
      .populate({
        path: "staff",
        select:
          "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto photoId",
      });
    // const empEncrypt = await encryptionPayload(allEmp);
    res.status(200).send({ message: "All Employee List", allEmp: allEmp });
  } catch (e) {
    console.log(e);
  }
};

exports.addFieldToPayroll = async (req, res) => {
  try {
    const { fid, eid } = req.params;
    const {
      month,
      attendence,
      paid_leaves,
      payment_mode,
      amount,
      paid_to,
      message,
      gross_salary,
      net_total,
      hra,
      tds,
      epf,
      da,
      ma,
      ta,
      epc,
      pqs,
    } = req.body;
    const finance = await Finance.findById({ _id: fid });
    var emp = await Payroll.findById({ _id: eid });
    var staff = await Staff.findById({ _id: `${emp.staff}` });
    var user = await User.findById({ _id: `${staff?.user}` });
    if (net_total < finance.financeTotalBalance) {
      emp.pay_slip.push({
        month: month,
        attendence: attendence,
        total_leaves: emp.staff_total_paid_leaves,
        paid_leaves: paid_leaves,
        payment_mode: payment_mode,
        purpose: "Monthly Salary",
        amount: amount,
        paid_to: paid_to,
        message: message,
        is_paid: "Paid",
        gross_salary: gross_salary,
        net_total: net_total,
        hra: hra,
        tds: tds,
        epf: epf,
        da: da,
        medical_allowance: ma,
        travel_allowance: ta,
        perquisites: pqs,
        employer_contribution: epc,
      });
      emp.h_r_a = hra;
      emp.t_d_s = tds;
      emp.e_p_f = epf;
      emp.d_a = da;
      emp.medical_allowance = ma;
      emp.travel_allowance = ta;
      emp.perquisites = pqs;
      emp.employer_contribution = epc;
      finance.salary_history.push({
        salary: net_total,
        month: month,
        pay_mode: payment_mode,
        emp_pay: emp._id,
      });
      staff.salary_history.push({
        salary: net_total,
        month: month,
        pay_mode: payment_mode,
        emp_pay: emp._id,
      });
      const notify = new StudentNotification({});
      notify.notifyContent = `${staff?.staffFirstName} ${
        staff?.staffMiddleName ? staff?.staffMiddleName : ""
      } ${staff?.staffLastName} your payroll for ${moment(
        new Date(month)
      ).format("MMMM")} month is ready check That.`;
      notify.notifySender = finance._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Staff";
      notify.notifyPublisher = staff._id;
      notify.financeId = finance._id;
      user.activity_tab.push(notify._id);
      notify.notifyByFinancePhoto = finance._id;
      notify.notifyCategory = "Payroll";
      notify.redirectIndex = 17;
      //
      invokeMemberTabNotification(
        "Staff Activity",
        notify,
        "Monthly Payroll",
        user._id,
        user.deviceToken,
        "Staff",
        notify
      );
      if (payment_mode === "By Cash") {
        finance.financeTotalBalance -= net_total;
        if (
          net_total < finance.financeSubmitBalance &&
          net_total < finance.financeIncomeCashBalance
        ) {
          finance.financeIncomeCashBalance -= net_total;
        } else if (
          net_total < finance.financeSubmitBalance &&
          net_total > finance.financeIncomeCashBalance
        ) {
          finance.financeSubmitBalance -= net_total;
        } else if (
          net_total > finance.financeSubmitBalance &&
          net_total < finance.financeIncomeCashBalance
        ) {
          finance.financeIncomeCashBalance -= net_total;
        } else {
        }
        // finance.financeSubmitBalance -= net_total
        await Promise.all([emp.save(), finance.save(), staff.save()]);
        res
          .status(200)
          .send({ message: "pay & generate payroll", payroll: emp });
      } else if (
        net_total < finance.financeBankBalance &&
        payment_mode === "By Bank"
      ) {
        finance.financeTotalBalance -= net_total;
        finance.financeBankBalance -= net_total;
        await Promise.all([emp.save(), finance.save(), staff.save()]);
        // const payEncrypt = await encryptionPayload(emp);
        res
          .status(200)
          .send({ message: "pay & generate payroll", payroll: emp });
      } else {
        res.status(200).send({ message: `${payment_mode} out of volume` });
      }
      await Promise.all([user.save(), notify.save()]);
    } else {
      res.status(200).send({ message: "No payment volume at finance" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllSalaryHistory = async (req, res) => {
  try {
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid })
      .select("_id institute financeHead")
      .populate({
        path: "salary_history",
        populate: {
          path: "emp_pay",
          select: "salary pay_mode month",
          populate: {
            path: "staff",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        },
      });

    const financeStaff = await Staff.findById({
      _id: `${finance?.financeHead}`,
    }).select("staffFirstName staffMiddleName staffLastName");
    const institute = await InstituteAdmin.findById({
      _id: `${finance.institute}`,
    }).select(
      "insName insAddress insPhoneNumber insEmail insDistrict insState insProfilePhoto photoId"
    );
    // Add Another Encryption
    res.status(200).send({
      message: "All Employee ",
      salary: finance.salary_history,
      institute: institute,
      financeStaff: financeStaff,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveOneEmpQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const { type, month } = req.query;
    if (type === "Detail") {
      const emp = await Payroll.findById({ _id: eid }).populate({
        path: "staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO institute",
      });
      // const dEncrypt = await encryptionPayload(emp);
      res.status(200).send({ message: "One Employee Detail ", detail: emp });
    } else if (type === "History") {
      const emp = await Payroll.findById({ _id: eid }).populate({
        path: "staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO institute",
      });
      var filtered = emp?.pay_slip?.filter((ele) => {
        if (`${ele.month}` === `${month}`) return ele;
      });
      var detail = {
        staff_salary_month: emp.staff_salary_month,
        staff_total_paid_leaves: emp.staff_total_paid_leaves,
        // d_a: emp.d_a,
        // h_r_a: emp.h_r_a,
        // t_d_s: emp.t_d_s,
        // e_p_f: emp.e_p_f,
        // medical_allowance: emp.ma,
        // travel_allowance: emp.ta,
        // perquisites: emp.pqs,
        // employer_contribution: emp.epc,
        staff: emp.staff,
      };
      const institute = await InstituteAdmin.findById({
        _id: `${emp?.staff?.institute}`,
      })
        .select(
          "insName insEmail insAddress insPhoneNumber insAddress insDistrict insState insProfilePhoto"
        )
        .populate({
          path: "financeDepart",
          select: "financeHead",
          populate: {
            path: "financeHead",
            select: "staffFirstName staffMiddleName staffLastName",
          },
        });
      // Add Another Encryption
      res.status(200).send({
        message: "One Employee Salary History ",
        detail: detail,
        filter: filtered,
        institute: institute,
      });
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveRemainFeeList = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    var sorted_zero = [];
    const finance = await Finance.findById({ _id: fid });
    const studentList = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select("_id ApproveStudent");

    if (search) {
      var student = await Student.find({
        $and: [{ _id: { $in: studentList?.ApproveStudent } }],
        $or: [
          { studentFirstName: { $regex: search, $options: "i" } },
          {
            studentMiddleName: { $regex: search, $options: "i" },
          },
          { studentLastName: { $regex: search, $options: "i" } },
        ],
      })
        .sort({ studentRemainingFeeCount: -1 })
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentRemainingFeeCount studentPaidFeeCount studentGRNO"
        )
        .populate({
          path: "department",
          select: "dName",
        })
        .populate({
          path: "studentClass",
          select: "className classTitle",
        })
        .populate({
          path: "user",
          select: "username userLegalName",
        });
    } else {
      var student = await Student.find({
        _id: { $in: studentList?.ApproveStudent },
      })
        .sort({ studentRemainingFeeCount: -1 })
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentRemainingFeeCount studentPaidFeeCount studentGRNO"
        )
        .populate({
          path: "department",
          select: "dName",
        })
        .populate({
          path: "studentClass",
          select: "className classTitle",
        })
        .populate({
          path: "user",
          select: "username userLegalName",
        });
    }
    for (var match of student) {
      if (match?.studentRemainingFeeCount > 0) {
        sorted_zero.push(match);
      }
    }
    // const sEncrypt = await encryptionPayload(student);
    if (sorted_zero?.length > 0) {
      res
        .status(200)
        .send({ message: "Remaining Fee List", list: sorted_zero });
    } else {
      res.status(200).send({ message: "No Remaining Fee List", list: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveOneIncomeQuery = async (req, res) => {
  try {
    const { iid } = req.params;
    const i_detail = await Income.findById({ _id: iid }).populate({
      path: "incomeFromUser",
      select: "username userLegalName photoId profilePhoto",
    });
    // const iOneEncrypt = await encryptionPayload(i_detail);
    res.status(200).send({ message: "One Income Detail", oneIncome: i_detail });
  } catch {}
};

exports.retrieveOneExpenseQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const e_detail = await Expense.findById({ _id: eid }).populate({
      path: "expensePaidUser",
      select: "username userLegalName photoId profilePhoto",
    });
    // const eOneEncrypt = await encryptionPayload(e_detail);
    res
      .status(200)
      .send({ message: "One Expense Detail", oneExpense: e_detail });
  } catch {}
};

exports.retrieveAllStaffArray = async (req, res) => {
  try {
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid }).select("institute");

    const ins = await InstituteAdmin.findById({ _id: `${finance.institute}` })
      .select("id")
      .populate({
        path: "ApproveStaff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      })
      .lean()
      .exec();
    // const staffEncrypt = await encryptionPayload(ins?.ApproveStaff);
    res
      .status(200)
      .send({ message: "All Staff List", staff_array: ins?.ApproveStaff });
  } catch {}
};

exports.retrieveAllGSTIncome = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid }).select("gst_format");

    const l_income = await Income.find({
      _id: { $in: finance?.gst_format?.liability },
    })
      .sort("invoice_number")
      .limit(limit)
      .skip(skip)
      .select(
        "incomeAmount gst_number gstSlab createdAt invoice_number incomeAccount incomeFrom"
      )
      .populate({
        path: "incomeFromUser",
        select: "userLegalName",
      });

    if (l_income?.length > 0) {
      // const lEncrypt = await encryptionPayload(l_income);
      res.status(200).send({
        message: "All GST liability 😀",
        liability: l_income,
        status: true,
      });
    } else {
      res
        .status(200)
        .send({ message: "No GST liability 🙄", liability: [], status: false });
    }
  } catch {}
};

exports.retrieveAllGSTInputTax = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid }).select("gst_format");

    const l_expense = await Expense.find({
      _id: { $in: finance?.gst_format?.input_tax_credit },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "expenseAmount gst_number gstSlab createdAt expenseAccount expensePaid"
      )
      .populate({
        path: "expensePaidUser",
        select: "userLegalName",
      });

    if (l_expense?.length > 0) {
      // const taxEncrypt = await encryptionPayload(l_expense);
      res.status(200).send({
        message: "All GST Input Tax Credit 😀",
        tax_credit: l_expense,
        status: true,
      });
    } else {
      res.status(200).send({
        message: "No GST Input Tax Credit 🙄",
        tax_credit: [],
        status: false,
      });
    }
  } catch {}
};

exports.retrieveAllBToCQuery = async (req, res) => {
  try {
    var business = [];
    await BusinessTC.aggregate(
      [
        { $match: { finance: req.params.fid, b_to_c_name: "Internal Fees" } },
        {
          $project: {
            _id: 1,
            year: { $year: "$b_to_c_month" },
            monthly: { $month: "$b_to_c_month" },
            b_to_c_total_amount: 1,
            name: { $toLower: "$b_to_c_name" },
            igst: { $floor: "$b_to_c_i_slab" },
            sgst: { $floor: "$b_to_c_s_slab" },
          },
        },
        {
          $group: {
            _id: {
              monthly: "$monthly",
              year: "$year",
              name: "$name",
              igst: "$igst",
              sgst: "$sgst",
            },
            sum: { $sum: "$b_to_c_total_amount" },
          },
        },
      ],
      function (err, result) {
        business.push(...result);
      }
    );
    await BusinessTC.aggregate(
      [
        { $match: { finance: req.params.fid, b_to_c_name: "Admission Fees" } },
        {
          $project: {
            _id: 1,
            year: { $year: "$b_to_c_month" },
            monthly: { $month: "$b_to_c_month" },
            b_to_c_total_amount: 1,
            name: { $toLower: "$b_to_c_name" },
            igst: { $floor: "$b_to_c_i_slab" },
            sgst: { $floor: "$b_to_c_s_slab" },
          },
        },
        {
          $group: {
            _id: {
              monthly: "$monthly",
              year: "$year",
              name: "$name",
              igst: "$igst",
              sgst: "$sgst",
            },
            sum: { $sum: "$b_to_c_total_amount" },
          },
        },
      ],
      function (err, result) {
        business.push(...result);
      }
    );
    if (business?.length <= 0) {
      res.status(200).send({
        message: "No Business to customer 😡",
        bToC: [],
        status: true,
      });
    } else {
      // const businessEncrypt = await encryptionPayload(business);
      res.status(200).send({
        message: "All Business to customer 😀",
        bToC: business,
        status: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllBToCQueryArray = async (req, res) => {
  try {
    const { month, year } = req.query;
    var l_month = 0;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { fid } = req.params;
    var finance = await Finance.findById({ _id: fid }).select("gst_format");
    if (month && year) {
      if (parseInt(month) < 12) {
        l_month = parseInt(month) + 1;
      } else {
        l_month = 01;
      }
      const allBusiness = await BusinessTC.find({
        $and: [
          { _id: { $in: finance?.gst_format?.b_to_c } },
          {
            createdAt: {
              $gte: new Date(`${year}-${month}-01`),
              $lt: new Date(`${year}-${l_month}-01`),
            },
          },
        ],
      })
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "b_to_c_total_amount b_to_c_month b_to_c_i_slab b_to_c_s_slab b_to_c_name createdAt"
        );

      if (allBusiness?.length > 0) {
        // const allBusinessEncrypt = await encryptionPayload(allBusiness);
        res.status(200).send({
          message: "All Monthly Business to Customer 😀",
          all: allBusiness,
          status: true,
        });
      } else {
        res.status(200).send({
          message: "No Monthly Business to Customer 🔍",
          all: [],
          status: false,
        });
      }
    } else {
      res.status(200).send({
        message: "No Month, Year Query Data available 😡",
        status: false,
      });
    }
  } catch (e) {
    // console.log(e);
  }
};

exports.retrieveRequestTransAtFinance = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { filter_by } = req.query;
    if (filter_by === "ALL_REQUEST") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "transport_request",
          populate: {
            path: "transport_module",
            select: "transport_manager",
            populate: {
              path: "transport_manager",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      var all_query = nested_document_limit(
        page,
        limit,
        finance?.transport_request
      );
    } else if (filter_by === "ALL_SUBMIT") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "transport_submit",
          populate: {
            path: "transport_module",
            select: "transport_manager",
            populate: {
              path: "transport_manager",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      var all_query = nested_document_limit(
        page,
        limit,
        finance?.transport_submit
      );
    } else if (filter_by === "ALL_CANCEL") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "transport_cancelled",
          populate: {
            path: "transport_module",
            select: "transport_manager",
            populate: {
              path: "transport_manager",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      var all_query = nested_document_limit(
        page,
        limit,
        finance?.transport_cancelled
      );
    } else {
      var all_query = [];
    }
    if (all_query?.length > 0) {
      res.status(200).send({
        message: "Get All Request from DB 🙌",
        query: all_query,
        queryCount: all_query.length,
      });
    } else {
      res.status(200).send({
        message: "No Request from DB 🙌",
        query: [],
        queryCount: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.submitTransportFeeQuery = async (req, res) => {
  try {
    const { fid, tid, rid } = req.params;
    const { amount, status } = req.body;
    if (!fid && !tid && !rid && !amount && !status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    if (status === "Accepted") {
      const price = parseInt(amount);
      var finance = await Finance.findById({ _id: fid });
      var trans = await Transport.findById({ _id: tid });
      for (var docs of finance.transport_request) {
        if (`${docs?._id}` === `${rid}`) {
          finance.transport_request.pull(docs?._id);
        }
      }
      finance.transport_submit.push({
        transport_module: trans?._id,
        amount: price,
        status: "Accepeted",
      });
      finance.requestArray.pull(trans._id);
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
      trans.requested_status = "Pending";
      if (trans?.collected_fee >= price) {
        trans.collected_fee -= price;
      }
      await Promise.all([trans.save(), finance.save()]);
      res.status(200).send({
        message: "Request Accepted",
        access: true,
        transLength: finance.transport_request.length,
      });
    } else if (status === "Rejected") {
      const price = parseInt(amount);
      var finance = await Finance.findById({ _id: fid });
      var trans = await Transport.findById({ _id: tid });
      for (var docs of finance.transport_request) {
        if (`${docs?._id}` === `${rid}`) {
          finance.transport_request.pull(docs?._id);
        }
      }
      finance.transport_cancelled.push({
        transport_module: trans?._id,
        amount: price,
        status: "Rejected",
      });
      finance.requestArray.pull(trans._id);
      trans.requested_status = "Pending";
      await Promise.all([trans.save(), finance.save()]);
      res.status(200).send({
        message: "Request Rejected",
        access: true,
        transLength: finance.transport_request.length,
      });
    } else {
      res.status(200).send({
        message: "Request Rejected",
        access: false,
        transLength: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceInventoryQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const finance = await Finance.findById({ _id: fid }).select(
      "finance_inventory"
    );

    const all_goods = await Store.find({
      _id: { $in: finance?.finance_inventory },
    })
      .sort("createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "goods_name goods_quantity total_expenses hsn_code goods_amount createdAt"
      );

    if (all_goods?.length > 0) {
      res.status(200).send({
        message: "Stores have less capacity 😀",
        access: true,
        all_goods: all_goods,
      });
    } else {
      res.status(200).send({
        message: "Stores have less capacity 😀",
        access: true,
        all_goods: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceOneInventoryQuery = async (req, res) => {
  try {
    const { inid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!inid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const store = await Store.findById({ _id: inid }).select("expense_array");

    const all_expenses = await Expense.find({
      _id: { $in: store?.expense_array },
    })
      .sort("createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "expenseAccount expenseAmount invoice_number expensePaid expense_quantity expenseDesc expenseAck expense_good_name expense_hsn_code createdAt"
      )
      .populate({
        path: "expensePaidUser",
        select: "username userLegalName photoId profilePhoto",
      });

    if (all_expenses?.length > 0) {
      res.status(200).send({
        message: "Stores have less capacity 😀",
        access: true,
        all_expenses: all_expenses,
      });
    } else {
      res.status(200).send({
        message: "Stores have less capacity 😀",
        access: true,
        all_expenses: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveRequestAdmissionAtFinance = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😡",
        access: false,
      });
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { filter_by } = req.query;
    if (filter_by === "ALL_REQUEST") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "admission_request",
          populate: {
            path: "admission",
            select: "admissionAdminHead",
            populate: {
              path: "admissionAdminHead",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });

      var all_array = nested_document_limit(
        page,
        limit,
        finance?.admission_request
      );
    } else if (filter_by === "ALL_SUBMIT") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "admission_submit",
          populate: {
            path: "admission",
            select: "admissionAdminHead",
            populate: {
              path: "admissionAdminHead",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      var all_array = nested_document_limit(
        page,
        limit,
        finance?.admission_submit
      );
    } else if (filter_by === "ALL_CANCEL") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "admission_cancelled",
          populate: {
            path: "admission",
            select: "admissionAdminHead",
            populate: {
              path: "admissionAdminHead",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      const all_array = nested_document_limit(
        page,
        limit,
        finance?.admission_cancelled
      );
    } else {
      var all_array = [];
    }
    if (all_array?.length > 0) {
      res.status(200).send({
        message: "Get All Admission Cash Flow from DB 🙌",
        arr: all_array,
        arrCount: all_array.length,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Admission Cash Flow from DB 🙌",
        arr: [],
        arrCount: 0,
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdmissionRequestFundsQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { amount } = req.body;
    if (!aid && !amount)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const price = parseInt(amount);
    const ads = await Admission.findById({ _id: aid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${ads?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${one_ins?.financeDepart[0]}`,
    });
    if (
      finance?.requestArray?.length > 0 &&
      finance?.requestArray?.includes(`${ads?._id}`)
    ) {
      res.status(200).send({
        message: "Already requested for processing 🔍",
        access: false,
      });
    } else {
      finance.requestArray.push(ads?._id);
      finance.admission_request.push({
        admission: ads?._id,
        amount: price,
        status: "Requested",
      });
      ads.requested_status = "Requested";
      await Promise.all([finance.save(), ads.save()]);
      res.status(200).send({
        message: "Installment Operation Completed 😀",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.submitAdmissionFeeQuery = async (req, res) => {
  try {
    const { fid, aid, rid } = req.params;
    const { amount, status } = req.body;
    if (!fid && !aid && !rid && !amount && !status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    if (status === "Accepted") {
      const price = parseInt(amount);
      var finance = await Finance.findById({ _id: fid });
      var ads = await Admission.findById({ _id: aid });
      for (var docs of finance.admission_request) {
        if (`${docs?._id}` === `${rid}`) {
          finance.admission_request.pull(docs?._id);
        }
      }
      finance.admission_submit.push({
        admission: ads?._id,
        amount: price,
        status: "Accepeted",
      });
      finance.requestArray.pull(ads._id);
      // finance.financeTotalBalance += price;
      // finance.financeSubmitBalance += price;
      ads.requested_status = "Pending";
      if (ads?.collected_fee >= price) {
        ads.collected_fee -= price;
      }
      await Promise.all([ads.save(), finance.save()]);
      res.status(200).send({
        message: "Request Accepted",
        access: true,
        adsCount: finance.admission_request.length,
      });
    } else if (status === "Rejected") {
      const price = parseInt(amount);
      var finance = await Finance.findById({ _id: fid });
      var ads = await Admission.findById({ _id: aid });
      for (var docs of finance.admission_request) {
        if (`${docs?._id}` === `${rid}`) {
          finance.admission_request.pull(docs?._id);
        }
      }
      finance.admission_cancelled.push({
        admission: ads?._id,
        amount: price,
        status: "Rejected",
      });
      finance.requestArray.pull(ads._id);
      ads.requested_status = "Pending";
      await Promise.all([ads.save(), finance.save()]);
      res.status(200).send({
        message: "Request Rejected",
        access: true,
        adsCount: finance.admission_request.length,
      });
    } else {
      res.status(200).send({
        message: "I Think you lost in the space 😁",
        access: false,
        adsCount: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveRequestLibraryAtFinance = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😡",
        access: false,
      });
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { filter_by } = req.query;
    if (filter_by === "ALL_REQUEST") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "library_request",
          populate: {
            path: "library",
            select: "libraryHead",
            populate: {
              path: "libraryHead",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });

      var all_array = nested_document_limit(
        page,
        limit,
        finance?.library_request
      );
    } else if (filter_by === "ALL_SUBMIT") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "library_submit",
          populate: {
            path: "library",
            select: "libraryHead",
            populate: {
              path: "libraryHead",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      var all_array = nested_document_limit(
        page,
        limit,
        finance?.library_submit
      );
    } else if (filter_by === "ALL_CANCEL") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "library_cancelled",
          populate: {
            path: "library",
            select: "libraryHead",
            populate: {
              path: "libraryHead",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      var all_array = nested_document_limit(
        page,
        limit,
        finance?.library_cancelled
      );
    } else {
      var all_array = [];
    }
    if (all_array?.length > 0) {
      res.status(200).send({
        message: "Get All Library Cash Flow from DB 🙌",
        arr: all_array,
        arrCount: all_array.length,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Library Cash Flow from DB 🙌",
        arr: [],
        arrCount: 0,
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderLibraryRequestFundsQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    const { amount } = req.body;
    if (!lid && !amount)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const price = parseInt(amount);
    const libs = await Library.findById({ _id: lid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${libs?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${one_ins?.financeDepart[0]}`,
    });
    if (
      finance?.requestArray?.length > 0 &&
      finance?.requestArray?.includes(`${libs?._id}`)
    ) {
      res.status(200).send({
        message: "Already requested for processing 🔍",
        access: false,
      });
    } else {
      finance.requestArray.push(libs?._id);
      finance.library_request.push({
        library: libs?._id,
        amount: price,
        status: "Requested",
      });
      libs.requestStatus = "Requested";
      await Promise.all([finance.save(), libs.save()]);
      res.status(200).send({
        message: "Installment Operation Completed 😀",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.submitLibraryFeeQuery = async (req, res) => {
  try {
    const { fid, lid, rid } = req.params;
    const { amount, status } = req.body;
    if (!fid && !lid && !rid && !amount && !status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    if (status === "Accepted") {
      const price = parseInt(amount);
      var finance = await Finance.findById({ _id: fid });
      var libs = await Library.findById({ _id: lid });
      for (var docs of finance.library_request) {
        if (`${docs?._id}` === `${rid}`) {
          finance.library_request.pull(docs?._id);
        }
      }
      finance.library_submit.push({
        library: libs?._id,
        amount: price,
        status: "Accepeted",
      });
      finance.requestArray.pull(libs._id);
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
      libs.requestStatus = "Pending";
      if (libs?.collectedFine >= price) {
        libs.collectedFine -= price;
      }
      await Promise.all([libs.save(), finance.save()]);
      res.status(200).send({
        message: "Request Accepted",
        access: true,
        libsCount: finance.library_request.length,
      });
    } else if (status === "Rejected") {
      const price = parseInt(amount);
      var finance = await Finance.findById({ _id: fid });
      var libs = await Library.findById({ _id: lid });
      for (var docs of finance.library_request) {
        if (`${docs?._id}` === `${rid}`) {
          finance.library_request.pull(docs?._id);
        }
      }
      finance.library_cancelled.push({
        library: libs?._id,
        amount: price,
        status: "Rejected",
      });
      finance.requestArray.pull(libs._id);
      libs.requestStatus = "Pending";
      await Promise.all([libs.save(), finance.save()]);
      res.status(200).send({
        message: "Request Rejected",
        access: true,
        libsCount: finance.library_request.length,
      });
    } else {
      res.status(200).send({
        message: "I Think you lost in the space 😁",
        access: false,
        adsCount: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceBankUpdateQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { delete_pic } = req.query;
    const image = handle_undefined(delete_pic);
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    await Finance.findByIdAndUpdate(fid, req.body);
    if (image) {
      await deleteFile(image);
    }
    res
      .status(200)
      .send({ message: "Finance / Bank Query Resolved 😁", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAllFeeCategoryQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    // const page = req.query.page ? parseInt(req.query.page) : 1;
    // const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // const skip = (page - 1) * limit;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid }).select(
      "fees_category"
    );

    const all_fees_format = await FeeCategory.find({
      $and: [
        { _id: { $in: finance?.fees_category } },
        { document_update: false },
      ],
    })
      // .limit(limit)
      // .skip(skip)
      .select("category_name created_at");

    if (all_fees_format?.length > 0) {
      res.status(200).send({
        message: "Lot's of Fees Category Available 👍",
        access: true,
        all_fees_format: all_fees_format,
      });
    } else {
      res.status(200).send({
        message: "No Fees Category Available 👍",
        access: true,
        all_fees_format: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAddFeeCategory = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const feeQuery = new FeeCategory({ ...req.body });
    finance.fees_category.push(feeQuery?._id);
    finance.fees_category_count += 1;
    feeQuery.finance = finance?._id;
    await Promise.all([finance.save(), feeQuery.save()]);
    res.status(200).send({
      message: "Add new Category to bucket",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAddFeeCategoryAutoQuery = async (fid, arr) => {
  try {
    for (var ref of arr) {
      const finance = await Finance.findById({ _id: fid });
      const feeQuery = new FeeCategory({
        category_name: ref?.categoryName,
      });
      finance.fees_category.push(feeQuery?._id);
      finance.fees_category_count += 1;
      feeQuery.finance = finance?._id;
      await Promise.all([finance.save(), feeQuery.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceFeeCategoryDeleteQuery = async (req, res) => {
  try {
    const { fcid } = req.params;
    if (!fcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const feeQuery = await FeeCategory.findById({ _id: fcid });
    const finance = await Finance.findById({ _id: `${feeQuery?.finance}` });
    if (finance.fees_category_count > 0) {
      finance.fees_category_count -= 1;
    }
    feeQuery.document_update = true;
    finance.modify_fees_category_count += 1;
    await Promise.all([finance.save(), feeQuery.save()]);
    res.status(200).send({
      message: "Deletion Operation Fees Category to bucket",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAddFeeStructure = async (req, res) => {
  try {
    const { fid, did } = req.params;
    const { heads } = req.body;
    if (!fid && !did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const depart = await Department.findById({ _id: did });
    const struct_query = new FeeStructure({ ...req.body });
    struct_query.finance = finance?._id;
    struct_query.department = depart?._id;
    depart.fees_structures.push(struct_query?._id);
    depart.fees_structures_count += 1;
    if (heads?.length > 0) {
      for (var ref of heads) {
        struct_query.fees_heads.push({
          head_name: ref?.head_name,
          head_amount: ref?.head_amount,
        });
        struct_query.fees_heads_count += 1;
      }
    }
    await Promise.all([depart.save(), struct_query.save()]);
    res.status(200).send({
      message: "Add new Structure to bucket",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAddFeeStructureAutoQuery = async (
  fid,
  did,
  structure_array
) => {
  try {
    var finance = await Finance.findById({ _id: fid });
    var depart = await Department.findById({ _id: did });
    for (var ref of structure_array) {
      const struct_query = new FeeStructure({
        category_master: ref?.CategoryId,
        class_master: ref?.StandardId,
        structure_name: ref?.StructureName,
        total_admission_fees: ref?.TotalFees,
        total_installments: ref?.InstallCount,
        applicable_fees: ref?.ApplicableFees,
        one_installments: ref?.one_installments,
        two_installments: ref?.two_installments,
        three_installments: ref?.three_installments,
        four_installments: ref?.four_installments,
        five_installments: ref?.five_installments,
        six_installments: ref?.six_installments,
        seven_installments: ref?.seven_installments,
        eight_installments: ref?.eight_installments,
        nine_installments: ref?.nine_installments,
        ten_installments: ref?.ten_installments,
        eleven_installments: ref?.eleven_installments,
        tweleve_installments: ref?.tweleve_installments,
      });
      struct_query.finance = finance?._id;
      struct_query.department = depart?._id;
      depart.fees_structures.push(struct_query?._id);
      depart.fees_structures_count += 1;
      if (ref?.heads?.length > 0) {
        for (var val of ref?.heads) {
          var valid_name = handle_undefined(val?.head_name);
          var valid_amount = handle_undefined(val?.head_amount);
          if (valid_name && valid_amount) {
            struct_query.fees_heads.push({
              head_name: valid_name,
              head_amount: valid_amount,
            });
            struct_query.fees_heads_count += 1;
          } else {
          }
        }
      }
      await struct_query.save();
    }
    await depart.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeStructureRetroQuery = async (req, res) => {
  try {
    const { fsid } = req.params;
    const { heads } = req.body;
    if (!fsid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const previous_struct = await FeeStructure.findById({ _id: fsid });
    const finance = await Finance.findById({
      _id: `${previous_struct?.finance}`,
    });
    const depart = await Department.findById({
      _id: `${previous_struct?.department}`,
    });
    const struct_query = new FeeStructure({ ...req.body });
    struct_query.finance = finance?._id;
    struct_query.department = depart?._id;
    depart.fees_structures.push(struct_query?._id);
    depart.modify_fees_structures_count += 1;
    previous_struct.document_update = true;
    previous_struct.migrate_to.push(struct_query?._id);
    if (heads?.length > 0) {
      for (var ref of heads) {
        struct_query.fees_heads.push({
          head_name: ref?.head_name,
          head_amount: ref?.head_amount,
        });
        struct_query.fees_heads_count += 1;
      }
    }
    await Promise.all([
      depart.save(),
      struct_query.save(),
      previous_struct.save(),
    ]);
    res.status(200).send({
      message: "Update Fees Structure to retro bucket",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeStructureDeleteRetroQuery = async (req, res) => {
  try {
    const { fsid } = req.params;
    if (!fsid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const previous_struct = await FeeStructure.findById({ _id: fsid });
    const depart = await Department.findById({
      _id: `${previous_struct?.department}`,
    });
    depart.modify_fees_structures_count += 1;
    previous_struct.document_update = true;
    if (depart.fees_structures_count > 0) {
      depart.fees_structures_count -= 1;
    }
    await Promise.all([depart.save(), previous_struct.save()]);
    res.status(200).send({
      message: "Fees Structure retro bucket Deletion",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDepartmentAllFeeStructure = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { filter_by } = req.query;
    const master_query = handle_undefined(filter_by); // master Id
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const depart = await Department.findById({ _id: did }).select(
      "fees_structures"
    );
    if (master_query) {
      var all_structures = await FeeStructure.find({
        $and: [
          { _id: { $in: depart?.fees_structures } },
          { class_master: master_query },
          { document_update: false },
        ],
      })
        .limit(limit)
        .skip(skip)
        .select("total_admission_fees structure_name applicable_fees")
        .populate({
          path: "category_master",
          select: "category_name",
        })
        .populate({
          path: "class_master",
          select: "className",
        });
    } else {
      var all_structures = await FeeStructure.find({
        $and: [
          { _id: { $in: depart?.fees_structures } },
          { document_update: false },
        ],
      })
        .limit(limit)
        .skip(skip)
        .select("total_admission_fees structure_name applicable_fees")
        .populate({
          path: "category_master",
          select: "category_name",
        })
        .populate({
          path: "class_master",
          select: "className",
        });
    }
    if (all_structures?.length > 0) {
      res.status(200).send({
        message: "Lot's of Fees Structures Available 👍",
        access: true,
        all_structures: all_structures,
      });
    } else {
      res.status(200).send({
        message: "No Fees Structures Available 👍",
        access: true,
        all_structures: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFinanceExempt = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid }).select(
      "exempt_receipt financeExemptBalance"
    );
    if (search) {
      var all_exempt = await FeeReceipt.find({
        _id: { $in: finance?.exempt_receipt },
      })
        .populate({
          path: "student",
          match: {
            studentFirstName: { $regex: search, $options: "i" },
          },
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "fee_structure",
            select: "category_master structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationName",
        });
    } else {
      var all_exempt = await FeeReceipt.find({
        _id: { $in: finance?.exempt_receipt },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "fee_structure",
            select: "category_master structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationName",
        });
    }
    if (all_exempt?.length > 0) {
      res.status(200).send({
        message: "Lot's of Exempted Volume Receipts",
        access: true,
        all_exempt: all_exempt,
        all_exempt_count: finance?.financeExemptBalance,
      });
    } else {
      res.status(200).send({
        message: "No Exempted Volume Receipts",
        access: false,
        all_exempt: [],
        all_exempt_count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFinanceGovernment = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid }).select(
      "government_receipt financeGovernmentScholarBalance"
    );
    if (search) {
      var all_exempt = await FeeReceipt.find({
        _id: { $in: finance?.government_receipt },
      })
        .populate({
          path: "student",
          match: {
            studentFirstName: { $regex: search, $options: "i" },
          },
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "fee_structure",
            select: "category_master structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationName",
        });
    } else {
      var all_exempt = await FeeReceipt.find({
        _id: { $in: finance?.government_receipt },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "fee_structure",
            select: "category_master structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationName",
        });
    }
    if (all_exempt?.length > 0) {
      res.status(200).send({
        message: "Lot's of Government / Scholarships Volume Receipts",
        access: true,
        all_exempt: all_exempt,
        all_exempt_count: finance?.financeGovernmentScholarBalance,
      });
    } else {
      res.status(200).send({
        message: "No Government / Scholarships Volume Receipts",
        access: false,
        all_exempt: [],
        all_exempt_count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneFeeReceipt = async (req, res) => {
  try {
    const { frid } = req.params;
    if (!frid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const receipt = await FeeReceipt.findById({ _id: frid })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName active_fee_heads",
        populate: {
          path: "remainingFeeList",
          select: "appId",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName active_fee_heads",
        populate: {
          path: "fee_structure",
          select: "category_master structure_name applicable_fees",
          populate: {
            path: "category_master",
            select: "category_name",
          },
        },
      })
      .populate({
        path: "finance",
        select:
          "finance_bank_account_number finance_bank_name finance_bank_ifsc_code finance_bank_account_name finance_bank_branch_address finance_bank_upi_id",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "application",
        select: "applicationName",
        populate: {
          path: "admissionAdmin",
          select: "_id",
          populate: {
            path: "institute",
            select:
              "insName name insAddress insPhoneNumber insEmail insState insDistrict insProfilePhoto photoId",
            populate: {
              path: "displayPersonList",
              select: "displayTitle",
              populate: {
                path: "displayUser",
                select: "userLegalName",
              },
            },
          },
        },
      });

    var ref = receipt?.student?.remainingFeeList?.filter((ele) => {
      if (`${ele?.appId}` === `${receipt?.application?._id}`) return ele;
    });

    if (ref?.length > 0) {
      var all_remain = await RemainingList.findById({ _id: ref[0]?._id })
        .select("applicable_fee paid_fee remaining_fee refund_fee")
        .populate({
          path: "batchId",
          select: "batchName",
        });
    }

    var new_format = receipt?.student?.active_fee_heads?.filter((ref) => {
      if (`${ref?.appId}` === `${receipt?.application?._id}`) return ref;
    });

    receipt.student.active_fee_heads = [...new_format];

    res.status(200).send({
      message: "Come up with Tea and Snacks",
      access: true,
      receipt,
      all_remain: all_remain,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneFeeStructure = async (req, res) => {
  try {
    const { fsid } = req.params;
    if (!fsid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const structure = await FeeStructure.findById({ _id: fsid })
      .select(
        "one_installments two_installments structure_name applicable_fees three_installments four_installments five_installments six_installments seven_installments eight_installments nine_installments ten_installments eleven_installments tweleve_installments total_installments total_admission_fees due_date fees_heads"
      )
      .populate({
        path: "category_master",
        select: "category_name",
      })
      .populate({
        path: "class_master",
        select: "className",
      });
    res
      .status(200)
      .send({ message: "Explore One Fees Structure", access: true, structure });
  } catch (e) {
    console.log(e);
  }
};

exports.renderUpdatePaymentModeQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await Finance.findByIdAndUpdate(fid, req.body);
    res
      .status(200)
      .send({ message: "Successfully Update Modes", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAllBankDetails = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const bank_query = await Finance.findById({ _id: fid }).select(
      "payment_modes_type finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode "
    );

    res.status(200).send({
      message: "Explore Transaction Query",
      access: true,
      bank_query: bank_query,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.addBody = async (req, res) => {
  try {
    if (req.body) {
      res.status(200).send({
        message: "Your Body is",
        body: req.body,
        content: req.get("Content-Type"),
      });
    } else {
      res.status(200).send({ message: "Your Body is Empty", body: {} });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAddFeeMaster = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const master = new FeeMaster({ ...req.body });
    master.finance = finance?._id;
    finance.fee_master_array.push(master?._id);
    finance.fee_master_array_count += 1;
    await Promise.all([master.save(), finance.save()]);
    res
      .status(200)
      .send({ message: "I Think Fees Master Problem Solved", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAddFeeMasterAutoQuery = async (fid, arr) => {
  try {
    for (var ref of arr) {
      const finance = await Finance.findById({ _id: fid });
      const master = new FeeMaster({
        master_name: ref?.masterName,
        master_amount: parseInt(ref?.masterAmount),
      });
      master.finance = finance?._id;
      finance.fee_master_array.push(master?._id);
      finance.fee_master_array_count += 1;
      await Promise.all([master.save(), finance.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAllMasterHeadQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const finance = await Finance.findById({ _id: fid }).select(
      "fee_master_array"
    );

    if (search) {
      var all_master = await FeeMaster.find({
        $and: [{ _id: { $in: finance?.fee_master_array } }],
        $or: [{ master_name: { $regex: search, $options: "i" } }],
      }).select("master_name master_amount created_at");
    } else {
      var all_master = await FeeMaster.find({
        _id: { $in: finance?.fee_master_array },
      })
        // .sort("-1")
        .limit(limit)
        .skip(skip)
        .select("master_name master_amount created_at");
    }

    if (all_master?.length > 0) {
      res.status(200).send({
        message: "Explore All Master Heads",
        access: true,
        all_master: all_master,
      });
    } else {
      res.status(200).send({
        message: "No Master Heads",
        access: true,
        all_master: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceEditFeeMasterQuery = async (req, res) => {
  try {
    const { fmid } = req.params;
    if (!fmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await FeeMaster.findByIdAndUpdate(fmid, req.body);
    res
      .status(200)
      .send({ message: "New Existing Master Head ", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceDeleteFeeMasterQuery = async (req, res) => {
  try {
    const { fid, fmid } = req.params;
    if (!fid && !fmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const master = await FeeMaster.findById({ _id: fmid });

    finance.fee_master_array.pull(master?._id);
    if (finance.fee_master_array_count > 0) {
      finance.fee_master_array_count -= 1;
    }

    await finance.save();
    await FeeMaster.findByIdAndDelete(fmid);
    res.status(200).send({
      message: "Deletion Operation of Existing Master Head ",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};
