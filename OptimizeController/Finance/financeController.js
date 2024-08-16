const InstituteAdmin = require("../../models/InstituteAdmin");
const Finance = require("../../models/Finance");
const Student = require("../../models/Student");
const Hostel = require("../../models/Hostel/hostel");
const HostelUnit = require("../../models/Hostel/hostelUnit");
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
  uploadExcelFile,
  uploadReceiptFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Payroll = require("../../models/Finance/Payroll");
const PayrollMaster = require("../../models/Finance/PayrollMaster");
const PayMaster = require("../../models/Finance/PayMaster");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const BusinessTC = require("../../models/Finance/BToC");
const FeeCategory = require("../../models/Finance/FeesCategory");
const FeeStructure = require("../../models/Finance/FeesStructure");
const FeeMaster = require("../../models/Finance/FeeMaster");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const Store = require("../../models/Finance/Inventory");
const BankAccount = require("../../models/Finance/BankAccount");
const { nested_document_limit } = require("../../helper/databaseFunction");
const {
  designation_alarm,
  email_sms_designation_alarm,
  email_sms_designation_other_fees_apply,
} = require("../../WhatsAppSMS/payload");
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
const {
  generate_hash_pass,
  installment_checker_query,
  generate_random_code_structure,
} = require("../../helper/functions");
const { render_finance_current_role } = require("../Moderator/roleController");
const {
  retro_student_heads_sequencing_query,
  retro_receipt_heads_sequencing_query,
} = require("../../helper/Installment");
const NewApplication = require("../../models/Admission/NewApplication");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");
const InternalFees = require("../../models/RazorPay/internalFees");
const { universal_random_password } = require("../../Custom/universalId");
const generateFeeReceipt = require("../../scripts/feeReceipt");
const societyAdmissionFeeReceipt = require("../../scripts/societyAdmissionFeeReceipt");
const { admissionFeeReceipt } = require("../../scripts/admissionFeeReceipt");
const OtherFees = require("../../models/Finance/Other/OtherFees");
const QvipleId = require("../../models/Universal/QvipleId");
const feeReceipt = require("../../models/RazorPay/feeReceipt");
const {
  fee_receipt_count_query,
} = require("../../Functions/AdmissionCustomFunctions.js/Reusable");
const normalAdmissionFeeReceipt = require("../../scripts/normalAdmissionFeeReceipt");
const studentOtherFeeReceipt = require("../../scripts/studentOtherFeeReceipt");

exports.getFinanceDepart = async (req, res) => {
  try {
    const { id } = req.params;
    const { sid } = req.body;
    var institute = await InstituteAdmin.findById({ _id: id });
    var finance = new Finance({});
    const codess = universal_random_password();
    finance.member_module_unique = `${codess}`;
    if (sid) {
      var staff = await Staff.findById({ _id: sid });
      var user = await User.findById({ _id: `${staff.user}` });
      var notify = new Notification({});
      staff.financeDepartment.push(finance._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = "Finance Manager";
      staff.designation_array.push({
        role: "Finance Manager",
        role_id: finance?._id,
      });
      finance.financeHead = staff._id;
      let password = await generate_hash_pass();
      finance.designation_password = password?.pass;
      notify.notifyContent = `you got the designation of as Finance Manager A/c Access Pin - ${password?.pin}`;
      notify.notify_hi_content = `आपको वित्त व्यवस्थापक के रूप में पदनाम मिला है |`;
      notify.notify_mr_content = `तुम्हाला वित्त व्यवस्थापक म्हणून पद मिळाले आहे`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Finance Designation";
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
        finance.save(),
      ]);
      designation_alarm(
        user?.userPhoneNumber,
        "FINANCE",
        institute?.sms_lang,
        "",
        "",
        ""
      );
      if (user?.userEmail) {
        email_sms_designation_alarm(
          user?.userEmail,
          "FINANCE",
          institute?.sms_lang,
          "",
          "",
          ""
        );
      }
    } else {
      finance.financeHead = null;
    }
    institute.financeDepart.push(finance._id);
    institute.financeStatus = "Enable";
    finance.institute = institute._id;
    await Promise.all([institute.save(), finance.save()]);
    // const fEncrypt = await encryptionPayload(finance._id);
    res.status(200).send({
      message: "Successfully Assigned Staff",
      finance: finance._id,
      status: true,
    });
  } catch (e) {
    console.log(e);
  }
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
        "financeName financeEmail financePhoneNumber enable_protection moderator_role moderator_role_count tab_manage financeAbout photoId photo cover coverId financeCollectedBankBalance financeTotalBalance financeRaisedBalance financeExemptBalance financeCollectedSBalance financeBankBalance financeCashBalance financeSubmitBalance financeTotalBalance financeEContentBalance financeApplicationBalance financeAdmissionBalance financeIncomeCashBalance financeIncomeBankBalance financeExpenseCashBalance financeExpenseBankBalance payment_modes_type bank_account_count fees_category_count exempt_receipt_count government_receipt_count fee_master_array_count designation_status show_receipt"
      )
      .populate({
        path: "institute",
        select:
          "id adminRepayAmount insBankBalance admissionDepart admissionStatus transportStatus hostelDepart libraryActivate transportDepart library alias_pronounciation",
      })
      .populate({
        path: "financeHead",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });
    // const cached = await connect_redis_miss(
    //   `Finance-Detail-${fid}`,
    //   finance
    // );
    if (req?.query?.mod_id) {
      var value = await render_finance_current_role(
        finance?.moderator_role,
        mod_id
      );
      if (value?.valid_role) {
      } else {
        finance.enable_protection = false;
      }
    }
    const finance_bind = {
      message: "Finance Master Query",
      finance: finance,
      roles: req?.query?.mod_id ? value?.permission : null,
    };
    const financeEncrypt = await encryptionPayload(finance_bind);
    res.status(200).send({ encrypt: financeEncrypt });
  } catch (e) {
    console.log(e);
  }
};

exports.getIncome = async (req, res) => {
  try {
    const { fid } = req.params;
    const { user_query } = req.query;
    const finance = await Finance.findById({ _id: fid });
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
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
    institute.invoice_count += 1;
    order.payment_invoice_number = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute?.invoice_count}`;
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
    if (req.body.incomeAccount === "Cash") {
      finance.financeIncomeCashBalance =
        finance.financeIncomeCashBalance + incomes.incomeAmount;
      finance.financeTotalBalance += incomes.incomeAmount;
    } else {
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
      institute.save(),
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
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    var f_user = await InstituteAdmin.findById({ _id: `${finance.institute}` });
    if (user_query) {
      var user = await User.findOne({
        _id: `${user_query}`,
      }).select("_id payment_history");
    }
    if (
      finance.financeTotalBalance > 0 &&
      req.body.expenseAmount <= finance.financeTotalBalance
      // &&
      // req.body.expenseAmount <= finance.financeBankBalance
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
      institute.invoice_count += 1;
      order.payment_invoice_number = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute?.invoice_count}`;
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
      if (req.body.expenseAccount === "Cash") {
        finance.financeExpenseCashBalance =
          finance.financeExpenseCashBalance + expenses.expenseAmount;
        if (finance.financeTotalBalance >= expenses.expenseAmount) {
          finance.financeTotalBalance -= expenses.expenseAmount;
        }
      } else {
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
        institute.save(),
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
    const bank_bind = {
      message: "One Institute Payment Detail",
      bank: bank,
    };
    const bankEncrypt = await encryptionPayload(bank_bind);
    // const cached = await connect_redis_miss(
    //   `Finance-Ins-Bank-Detail-${id}`,
    //   bank
    // );
    res.status(200).send({ encrypt: bankEncrypt });
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
    // const cached = await connect_redis_miss(
    //   `Finance-All-Incomes-${fid}`,
    //   incomes
    // );
    if (incomes?.length > 0) {
      const income_bind = {
        message: "All Incomes",
        allIncome: incomes,
      };
      const iEncrypt = await encryptionPayload(income_bind);
      res.status(200).send({ encrypt: iEncrypt });
    } else {
      const income_bind = {
        message: "No Incomes",
        allIncome: [],
      };
      const iEncrypt = await encryptionPayload(income_bind);
      res.status(200).send({ encrypt: iEncrypt });
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
    // const cached = await connect_redis_miss(
    //   `Finance-All-Expenses-${fid}`,
    //   expenses
    // );
    if (expenses?.length > 0) {
      const expense_bind = {
        message: "All Expenses",
        allIncome: expenses,
      };
      const eEncrypt = await encryptionPayload(expense_bind);

      res.status(200).send({ encrypt: eEncrypt });
    } else {
      const expense_bind = {
        message: "No Expenses",
        allIncome: [],
      };
      const eEncrypt = await encryptionPayload(expense_bind);
      res.status(200).send({ encrypt: eEncrypt });
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
    const income_bind = {
      message: "Income Balance",
      incomeBalance: finance,
    };
    const incomeEncrypt = await encryptionPayload(income_bind);
    // const cached = await connect_redis_miss(
    //   `Finance-All-Class-Reject-${fid}`,
    //   bind_reject
    // );
    res.status(200).send({ encrypt: incomeEncrypt });
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
    const expense_bind = {
      message: "Expense Balance",
      expenseBalance: finance,
    };
    const expenseEncrypt = await encryptionPayload(expense_bind);
    res.status(200).send({ encrypt: expenseEncrypt });
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
    const remain_bind = {
      message: "Remaining Balance",
      remain: remain,
    };
    const remainEncrypt = await encryptionPayload(remain);
    res.status(200).send({ encrypt: remainEncrypt });
  } catch (e) {
    // console.log(e)
  }
};

exports.addEmpToFinance = async (req, res) => {
  try {
    const { fid, sid } = req.params;
    const { heads } = req.body;
    if (!fid && !sid && !heads)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const finance = await Finance.findById({ _id: fid });
    const staff = await Staff.findById({ _id: sid }).select("id");
    const pay_scale = new Payroll({ ...req.body });
    for (var ref of heads) {
      if (ref?.master_status === "Particular") {
        pay_scale.pay_master_heads_particular.push({
          master_name: ref?.master_name,
          master_amount: ref?.master_amount,
          master_status: ref?.master_status,
          master_id: ref?.master_id,
        });
        pay_scale.pay_master_heads_particular_count += 1;
      } else if (ref?.master_status === "Deduction") {
        pay_scale.pay_master_heads_deduction.push({
          master_name: ref?.master_name,
          master_amount: ref?.master_amount,
          master_status: ref?.master_status,
          master_id: ref?.master_id,
        });
        pay_scale.pay_master_heads_deduction_count += 1;
      } else {
      }
    }
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
    const staff_bind = {
      message: "All Employee List",
      allEmp: allEmp,
    };
    const empEncrypt = await encryptionPayload(staff_bind);
    res.status(200).send({ encrypt: empEncrypt });
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
      master,
      basic_pay,
    } = req.body;
    const finance = await Finance.findById({ _id: fid });
    var emp = await Payroll.findById({ _id: eid });
    var staff = await Staff.findById({ _id: `${emp.staff}` });
    var user = await User.findById({ _id: `${staff?.user}` });
    var g_year = new Date().getFullYear();
    var g_month = new Date().getMonth() + 1;
    if (g_month < 10) {
      g_month = `0${g_month}`;
    }
    if (net_total < finance.financeTotalBalance) {
      var sorted = [];
      for (var ref of master) {
        if (ref?.month_master_id) {
          const new_master = await PayrollMaster.findById({
            _id: `${ref?.month_master_id}`,
          });
          sorted.push({
            month_master_name: ref?.month_master_name,
            month_master_amount: ref?.month_master_amount,
            month_master_status: ref?.month_master_status,
            month_master_id: ref?.month_master_id,
          });
          var g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
          var exist_master = await PayMaster.findOne({
            $and: [
              { finance: finance?._id },
              { payroll_master: new_master?._id },
              {
                created_at: {
                  $gte: g_date,
                },
              },
            ],
          });
          if (exist_master) {
            // console.log("exist", exist_master);
            exist_master.pay_amount += ref?.month_master_amount;
            exist_master.pay_staff_collection.push({
              amount: ref?.month_master_amount,
              emp: emp?._id,
            });
            exist_master.pay_staff_collection_count += 1;
            await exist_master.save();
          } else {
            const new_pay_master = new PayMaster({});
            new_pay_master.pay_month = new Date(`${month}`);
            new_pay_master.pay_amount = ref?.month_master_amount;
            new_pay_master.pay_staff_collection.push({
              amount: ref?.month_master_amount,
              emp: emp?._id,
            });
            new_pay_master.pay_staff_collection_count += 1;
            new_pay_master.payroll_master = new_master?._id;
            new_pay_master.finance = finance?._id;
            new_master.payroll_month_collection.push(new_pay_master?._id);
            await Promise.all([new_pay_master.save(), new_master.save()]);
            // console.log("New Master", new_pay_master);
          }
        }
      }
      emp.basic_pay = basic_pay;
      emp.pay_slip.push({
        month: new Date(`${month}`),
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
        month_master: sorted,
      });
      finance.salary_history.push({
        salary: net_total,
        month: new Date(`${month}`),
        pay_mode: payment_mode,
        emp_pay: emp._id,
      });
      staff.salary_history.push({
        salary: net_total,
        month: new Date(`${month}`),
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
      res
        .status(200)
        .send({ message: "One Employee Detail ", detail: dEncrypt });
    } else if (type === "History") {
      const emp = await Payroll.findById({ _id: eid }).populate({
        path: "staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO institute",
      });
      var filtered = emp?.pay_slip?.filter((ele) => {
        var new_month = moment(ele?.month).format("YYYY-MM-DD");
        new_month = new_month?.slice(0, 7);
        if (`${new_month}` === `${month}`) return ele;
      });
      var detail = {
        staff_salary_month: emp?.staff_salary_month,
        staff_total_paid_leaves: emp?.staff_total_paid_leaves,
        basic_pay: emp?.basic_pay,
        staff: emp?.staff,
        pay_slip: emp?.pay_slip,
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
    var valid_search = false;
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
      valid_search = true;
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
      const fee_bind = {
        message: "Remaining Fee List",
        list: sorted_zero,
        search: search ? true : false,
      };
      const sEncrypt = await encryptionPayload(fee_bind);
      res.status(200).send({ encrypt: sEncrypt });
    } else {
      const fee_bind = {
        message: "No Remaining Fee List",
        list: [],
        search: search ? true : false,
      };
      const sEncrypt = await encryptionPayload(fee_bind);
      res.status(200).send({ encrypt: sEncrypt });
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
    const income_bind = {
      message: "One Income Detail",
      oneIncome: i_detail,
    };
    const iOneEncrypt = await encryptionPayload(income_bind);
    res.status(200).send({ encrypt: iOneEncrypt });
  } catch {}
};

exports.retrieveOneExpenseQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const e_detail = await Expense.findById({ _id: eid }).populate({
      path: "expensePaidUser",
      select: "username userLegalName photoId profilePhoto",
    });
    const expense_bind = {
      message: "One Expense Detail",
      oneExpense: e_detail,
    };
    const eOneEncrypt = await encryptionPayload(expense_bind);
    res.status(200).send({ encrypt: eOneEncrypt });
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
    const all_bind = {
      message: "All Staff List",
      staff_array: ins?.ApproveStaff,
    };
    const staffEncrypt = await encryptionPayload(all_bind);
    res.status(200).send({ encrypt: staffEncrypt });
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
      const lEncrypt = await encryptionPayload(l_income);
      res.status(200).send({
        message: "All GST liability 😀",
        liability: lEncrypt,
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
      const taxEncrypt = await encryptionPayload(l_expense);
      res.status(200).send({
        message: "All GST Input Tax Credit 😀",
        tax_credit: taxEncrypt,
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
      const businessEncrypt = await encryptionPayload(business);
      res.status(200).send({
        message: "All Business to customer 😀",
        bToC: businessEncrypt,
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
        l_month = 1;
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
        const allBusinessEncrypt = await encryptionPayload(allBusiness);
        res.status(200).send({
          message: "All Monthly Business to Customer 😀",
          all: allBusinessEncrypt,
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

exports.renderFinanceBankAddQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { flow, flow_id } = req.query;
    const { depart_arr } = req.body;
    if (!fid && !flow && !flow_id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const new_account = new BankAccount({ ...req.body });
    if (flow === "Department" && depart_arr?.length > 0) {
      for (var ref of depart_arr) {
        const department = await Department.findById({ _id: `${ref}` });
        // new_account.department = flow_id;
        new_account.departments.push(department?._id);
        department.bank_account = new_account?._id;
        await department.save();
      }
    } else if (flow === "Transport") {
      const trans = await Transport.findById({ _id: flow_id });
      new_account.transport = flow_id;
      trans.bank_account = new_account?._id;
      await trans.save();
    } else if (flow === "Library") {
      const libs = await Library.findById({ _id: flow_id });
      new_account.library = flow_id;
      libs.bank_account = new_account?._id;
      await libs.save();
    } else if (flow === "Hostel") {
      const libs = await Hostel.findById({ _id: flow_id });
      new_account.hostel = flow_id;
      libs.bank_account = new_account?._id;
      await libs.save();
    } else if (flow === "Society") {
      new_account.bank_account_type = "Society";
    }
    new_account.finance = finance?._id;
    finance.bank_account.push(new_account?._id);
    finance.bank_account_count += 1;
    await Promise.all([finance.save(), new_account.save()]);
    res
      .status(200)
      .send({ message: "Explore New Bank Accounts", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAllBankAccountQuery = async (req, res) => {
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

    const finance = await Finance.findById({ _id: fid }).select("bank_account");

    if (search) {
      var all_accounts = await BankAccount.find({
        $and: [{ _id: { $in: finance?.bank_account } }],
        $or: [{ finance_bank_name: { $regex: search, $options: "i" } }],
      })
        .populate({
          path: "department",
          select: "dName dTitle",
        })
        .populate({
          path: "departments",
          select: "dName dTitle",
        })
        .populate({
          path: "transport",
          select: "_id",
        })
        .populate({
          path: "library",
          select: "_id",
        })
        .populate({
          path: "hostel",
          select: "_id",
        });
    } else {
      var all_accounts = await BankAccount.find({
        $and: [{ _id: { $in: finance?.bank_account } }],
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "department",
          select: "dName dTitle",
        })
        .populate({
          path: "departments",
          select: "dName dTitle",
        })
        .populate({
          path: "transport",
          select: "_id",
        })
        .populate({
          path: "library",
          select: "_id",
        })
        .populate({
          path: "hostel",
          select: "_id",
        });
    }

    if (all_accounts?.length > 0) {
      const account_bind = {
        message: "Lot's of Bank Account's Available 👍",
        access: true,
        all_accounts: all_accounts,
      };
      const all_bank_encrypt = await encryptionPayload(account_bind);
      res.status(200).send({ encrypt: all_bank_encrypt });
    } else {
      const account_bind = {
        message: "No Bank Account's Available 👍",
        access: true,
        all_accounts: [],
      };
      const all_bank_encrypt = await encryptionPayload(account_bind);
      res.status(200).send({ encrypt: all_bank_encrypt });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceOneBankQuery = async (req, res) => {
  try {
    const { acid } = req.params;
    if (!acid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const one_bank = await BankAccount.findById({ _id: acid })
      .populate({
        path: "department",
        select: "dName dTitle",
      })
      .populate({
        path: "departments",
        select: "dName dTitle",
      })
      .populate({
        path: "transport",
        select: "_id",
      })
      .populate({
        path: "library",
        select: "_id",
      })
      .populate({
        path: "hostel",
        select: "_id",
      });

    const account_bind = {
      message: "Explore One Bank Account Query",
      access: true,
      one_bank: one_bank,
    };
    const one_bank_encrypt = await encryptionPayload(account_bind);
    res.status(200).send({ encrypt: one_bank_encrypt });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceOneBankAccountQuery = async (req, res) => {
  try {
    const { acid } = req.params;
    const { delete_pic } = req.query;
    const image = await handle_undefined(delete_pic);
    if (!acid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    await BankAccount.findByIdAndUpdate(acid, req.body);
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

exports.renderFinanceOneBankAccountDestroyQuery = async (req, res) => {
  try {
    const { acid } = req.params;
    if (!acid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const account = await BankAccount.findById({ _id: acid });
    const finance = await Finance.findById({ _id: `${account?.finance}` });
    finance.bank_account.pull(account?._id);
    if (finance?.bank_account_count > 0) {
      finance.bank_account_count -= 1;
    }
    if (account?.finance_bank_upi_qrcode) {
      await deleteFile(account?.finance_bank_upi_qrcode);
    }
    await finance.save();
    await BankAccount.findByIdAndDelete(acid);
    res.status(200).send({
      message: "Finance / Bank Query Deletion Operation Completed 😁",
      access: true,
    });
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
      .select("category_name created_at scholarship_applicable")
      .populate({
        path: "secondary_category",
      });

    if (all_fees_format?.length > 0) {
      // const all_fees_format_encrypt = await encryptionPayload(all_fees_format)
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

exports.renderFinanceMarkScholarApplicableQuery = async (req, res) => {
  try {
    const { fcid } = req?.params;
    if (!fcid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    await FeeCategory.findByIdAndUpdate(fcid, req?.body);

    res
      .status(200)
      .send({ message: "Explore All Finance Category Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAddFeeStructure = async (req, res) => {
  try {
    const { fid } = req.params;
    const { heads, did, hid, tid } = req.body;
    const { flow } = req.query;
    if (!fid && !flow)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var finance = await Finance.findById({ _id: fid });
    if (flow === "Finance_Manager") {
      const new_code = generate_random_code_structure();
      const depart = await Department.findById({ _id: did });
      const struct_query = new FeeStructure({ ...req.body });
      const category = await FeeCategory.findById({
        _id: `${req.body?.category_master}`,
      });
      const class_master = await ClassMaster.findById({
        _id: `${req.body?.class_master}`,
      });
      const batch_master = await Batch.findById({
        _id: `${req.body?.batch_master}`,
      });
      struct_query.fee_structure_code = `${new_code}`;
      struct_query.finance = finance?._id;
      struct_query.department = depart?._id;
      struct_query.unique_structure_name = `${category?.category_name} - ${depart?.dName} - ${batch_master?.batchName} - ${class_master?.className} / ${req.body?.structure_name}`;
      depart.fees_structures.push(struct_query?._id);
      depart.fees_structures_count += 1;
      if (heads?.length > 0) {
        for (var ref of heads) {
          if (`${ref?.head_type}` === "BY_APPLICABLE") {
            struct_query.applicable_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
            });
            struct_query.applicable_fees_heads_count += 1;
          } else if (`${ref?.head_type}` === "BY_GOVERNMENT") {
            struct_query.government_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
            });
            struct_query.government_fees_heads_count += 1;
          } else {
          }
        }
      }
      await Promise.all([depart.save(), struct_query.save()]);
      res.status(200).send({
        message: "Add new Structure to bucket",
        access: true,
      });
    } else if (flow === "Hostel_Manager") {
      const new_code = generate_random_code_structure();
      const hostel = await Hostel.findById({ _id: hid });
      const struct_query = new FeeStructure({ ...req.body });
      const category = await FeeCategory.findById({
        _id: `${req.body?.category_master}`,
      });
      if (req?.body?.class_master) {
        var class_master = await ClassMaster.findById({
          _id: `${req.body?.class_master}`,
        });
      }
      if (req?.body?.unit_master) {
        var unit_master = await HostelUnit.findById({
          _id: `${req?.body?.unit_master}`,
        });
      }
      const batch_master = await Batch.findById({
        _id: `${req.body?.batch_master}`,
      });
      struct_query.fee_structure_code = `${new_code}`;
      struct_query.batch_master = batch_master?._id;
      struct_query.class_master = class_master ? class_master?._id : null;
      struct_query.unit_master = unit_master ? unit_master?._id : null;
      struct_query.finance = finance?._id;
      struct_query.hostel = hostel?._id;
      struct_query.unique_structure_name = `${category?.category_name} - ${
        batch_master?.batchName
      }${class_master ? ` - ${class_master?.className}` : ""}${
        unit_master ? ` - ${unit_master?.hostel_unit_name}` : ""
      } / ${req.body?.structure_name}`;
      hostel.fees_structures.push(struct_query?._id);
      hostel.fees_structures_count += 1;
      if (heads?.length > 0) {
        for (var ref of heads) {
          if (`${ref?.head_type}` === "BY_APPLICABLE") {
            struct_query.applicable_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
            });
            struct_query.applicable_fees_heads_count += 1;
          } else if (`${ref?.head_type}` === "BY_GOVERNMENT") {
            struct_query.government_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
            });
            struct_query.government_fees_heads_count += 1;
          } else {
          }
        }
      }
      await Promise.all([hostel.save(), struct_query.save()]);
      res.status(200).send({
        message: "Add new Structure to Hostel bucket",
        access: true,
      });
    } else if (flow === "Transport_Manager") {
      const new_code = generate_random_code_structure();
      const trans = await Transport.findById({ _id: tid });
      const struct_query = new FeeStructure({ ...req.body });
      const category = await FeeCategory.findById({
        _id: `${req.body?.category_master}`,
      });
      if (req?.body?.class_master) {
        var class_master = await ClassMaster.findById({
          _id: `${req.body?.class_master}`,
        });
      }
      if (req?.body?.vehicle_master) {
        var vehicle_master = await Vehicle.findById({
          _id: `${req?.body?.vehicle_master}`,
        });
      }
      const batch_master = await Batch.findById({
        _id: `${req.body?.batch_master}`,
      });
      struct_query.fee_structure_code = `${new_code}`;
      struct_query.batch_master = batch_master?._id;
      struct_query.class_master = class_master ? class_master?._id : null;
      struct_query.vehicle_master = vehicle_master ? vehicle_master?._id : null;
      struct_query.finance = finance?._id;
      struct_query.transport = trans?._id;
      struct_query.unique_structure_name = `${category?.category_name} - ${
        batch_master?.batchName
      }${class_master ? ` - ${class_master?.className}` : ""}${
        vehicle_master ? ` - ${vehicle_master?.vehicle_number}` : ""
      } / ${req.body?.structure_name}`;
      trans.fees_structures.push(struct_query?._id);
      trans.fees_structures_count += 1;
      if (heads?.length > 0) {
        for (var ref of heads) {
          if (`${ref?.head_type}` === "BY_APPLICABLE") {
            struct_query.applicable_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
            });
            struct_query.applicable_fees_heads_count += 1;
          } else if (`${ref?.head_type}` === "BY_GOVERNMENT") {
            struct_query.government_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
            });
            struct_query.government_fees_heads_count += 1;
          } else {
          }
        }
      }
      await Promise.all([trans.save(), struct_query.save()]);
      res.status(200).send({
        message: "Add new Structure to Transport bucket",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Invalid Structure Flow",
        access: true,
      });
    }
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
      var category = await FeeCategory.findById({ _id: `${ref?.CategoryId}` });
      var class_master = await ClassMaster.findById({
        _id: `${ref?.StandardId}`,
      });
      var batch_master = await Batch.findById({ _id: `${ref?.batchId}` });
      const new_code = generate_random_code_structure();
      const struct_query = new FeeStructure({
        category_master: ref?.CategoryId,
        class_master: ref?.StandardId,
        structure_name: ref?.StructureName,
        unique_structure_name: `${category?.category_name} - ${depart?.dName} - ${batch_master?.batchName} - ${class_master?.className} / ${ref?.StructureName}`,
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
        batch_master: batch_master?._id,
        fee_structure_code: `${new_code}`,
      });
      struct_query.finance = finance?._id;
      struct_query.department = depart?._id;
      depart.fees_structures.push(struct_query?._id);
      depart.fees_structures_count += 1;
      if (ref?.heads?.length > 0) {
        for (var val of ref?.heads) {
          var valid_name = await handle_undefined(val?.head_name);
          var valid_amount = await handle_undefined(val?.head_amount);
          var valid_master = await handle_undefined(val?.master);
          var valid_type = await handle_undefined(val?.head_type);
          if (valid_name && valid_amount && valid_master && valid_type) {
            if (`${valid_type}` === "APPLICABLE") {
              struct_query.applicable_fees_heads.push({
                head_name: val?.head_name,
                head_amount: val?.head_amount,
                master: val?.master,
              });
              struct_query.applicable_fees_heads_count += 1;
            } else if (`${valid_type}` === "GOVERNMENT") {
              struct_query.government_fees_heads.push({
                head_name: val?.head_name,
                head_amount: val?.head_amount,
                master: val?.master,
              });
              struct_query.government_fees_heads_count += 1;
            } else {
            }
          } else {
          }
          // console.log(struct_query?.applicable_fees_heads)
          // console.log(struct_query?.government_fees_heads)
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
    const { flow } = req.query;
    if (!fsid && !flow)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    if (flow === "Finance_Manager") {
      const new_code = generate_random_code_structure();
      const previous_struct = await FeeStructure.findById({ _id: fsid });
      const finance = await Finance.findById({
        _id: `${previous_struct?.finance}`,
      });
      const depart = await Department.findById({
        _id: `${previous_struct?.department}`,
      });
      const struct_query = new FeeStructure({ ...req.body });
      const category = await FeeCategory.findById({
        _id: `${req.body?.category_master}`,
      });
      const class_master = await ClassMaster.findById({
        _id: `${req.body?.class_master}`,
      });
      const batch_master = await Batch.findById({
        _id: `${req.body?.batch_master}`,
      });
      struct_query.fee_structure_code = `${new_code}`;
      struct_query.finance = finance?._id;
      struct_query.department = depart?._id;
      struct_query.unique_structure_name = `${category?.category_name} - ${depart?.dName} - ${batch_master?.batchName} - ${class_master?.className} / ${req.body?.structure_name}`;
      depart.fees_structures.push(struct_query?._id);
      depart.modify_fees_structures_count += 1;
      previous_struct.document_update = true;
      previous_struct.migrate_to.push(struct_query?._id);
      if (heads?.length > 0) {
        for (var ref of heads) {
          if (`${ref?.head_type}` === "BY_APPLICABLE") {
            struct_query.applicable_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
              is_society: ref?.is_society
            });
            struct_query.applicable_fees_heads_count += 1;
          } else if (`${ref?.head_type}` === "BY_GOVERNMENT") {
            struct_query.government_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
              is_society: ref?.is_society
            });
            struct_query.government_fees_heads_count += 1;
          } else {
          }
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
    } else if (flow === "Hostel_Manager") {
      const new_code = generate_random_code_structure();
      const previous_struct = await FeeStructure.findById({ _id: fsid });
      const finance = await Finance.findById({
        _id: `${previous_struct?.finance}`,
      });
      const hostel = await Hostel.findById({
        _id: `${previous_struct?.hostel}`,
      });
      const struct_query = new FeeStructure({ ...req.body });
      const category = await FeeCategory.findById({
        _id: `${req.body?.category_master}`,
      });
      if (req.body?.class_master) {
        var class_master = await ClassMaster.findById({
          _id: `${req.body?.class_master}`,
        });
      }
      if (req?.body?.unit_master) {
        var unit_master = await HostelUnit.findById({
          _id: `${req?.body?.unit_master}`,
        });
      }
      const batch_master = await Batch.findById({
        _id: `${req.body?.batch_master}`,
      });
      struct_query.fee_structure_code = `${new_code}`;
      struct_query.batch_master = batch_master?._id;
      struct_query.class_master = class_master ? class_master?._id : null;
      struct_query.unit_master = unit_master ? unit_master : null;
      struct_query.finance = finance?._id;
      struct_query.hostel = hostel?._id;
      struct_query.unique_structure_name = `${category?.category_name} - ${
        batch_master?.batchName
      }${class_master ? ` - ${class_master?.className}` : ""}${
        unit_master ? ` - ${unit_master?.hostel_unit_name}` : ""
      } / ${req.body?.structure_name}`;
      hostel.fees_structures.push(struct_query?._id);
      hostel.modify_fees_structures_count += 1;
      previous_struct.document_update = true;
      previous_struct.migrate_to.push(struct_query?._id);
      if (heads?.length > 0) {
        for (var ref of heads) {
          if (`${ref?.head_type}` === "BY_APPLICABLE") {
            struct_query.applicable_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
              is_society: ref?.is_society
            });
            struct_query.applicable_fees_heads_count += 1;
          } else if (`${ref?.head_type}` === "BY_GOVERNMENT") {
            struct_query.government_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
              is_society: ref?.is_society
            });
            struct_query.government_fees_heads_count += 1;
          } else {
          }
        }
      }
      await Promise.all([
        hostel.save(),
        struct_query.save(),
        previous_struct.save(),
      ]);
      res.status(200).send({
        message: "Update Fees Structure to retro Hostel bucket",
        access: true,
      });
    } else if (flow === "Transport_Manager") {
      const new_code = generate_random_code_structure();
      const previous_struct = await FeeStructure.findById({ _id: fsid });
      const finance = await Finance.findById({
        _id: `${previous_struct?.finance}`,
      });
      const trans = await Transport.findById({
        _id: `${previous_struct?.transport}`,
      });
      const struct_query = new FeeStructure({ ...req.body });
      const category = await FeeCategory.findById({
        _id: `${req.body?.category_master}`,
      });
      if (req.body?.class_master) {
        var class_master = await ClassMaster.findById({
          _id: `${req.body?.class_master}`,
        });
      }
      if (req?.body?.vehicle_master) {
        var vehicle_master = await Vehicle.findById({
          _id: `${req?.body?.vehicle_master}`,
        });
      }
      const batch_master = await Batch.findById({
        _id: `${req.body?.batch_master}`,
      });
      struct_query.fee_structure_code = `${new_code}`;
      struct_query.batch_master = batch_master?._id;
      struct_query.class_master = class_master ? class_master?._id : null;
      struct_query.vehicle_master = vehicle_master ? vehicle_master : null;
      struct_query.finance = finance?._id;
      struct_query.transport = trans?._id;
      struct_query.unique_structure_name = `${category?.category_name} - ${
        batch_master?.batchName
      }${class_master ? ` - ${class_master?.className}` : ""}${
        vehicle_master ? ` - ${vehicle_master?.vehicle_number}` : ""
      } / ${req.body?.structure_name}`;
      trans.fees_structures.push(struct_query?._id);
      trans.modify_fees_structures_count += 1;
      previous_struct.document_update = true;
      previous_struct.migrate_to.push(struct_query?._id);
      if (heads?.length > 0) {
        for (var ref of heads) {
          if (`${ref?.head_type}` === "BY_APPLICABLE") {
            struct_query.applicable_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
              is_society: ref?.is_society
            });
            struct_query.applicable_fees_heads_count += 1;
          } else if (`${ref?.head_type}` === "BY_GOVERNMENT") {
            struct_query.government_fees_heads.push({
              head_name: ref?.head_name,
              head_amount: ref?.head_amount,
              master: ref?.master,
              is_society: ref?.is_society
            });
            struct_query.government_fees_heads_count += 1;
          } else {
          }
        }
      }
      await Promise.all([
        trans.save(),
        struct_query.save(),
        previous_struct.save(),
      ]);
      res.status(200).send({
        message: "Update Fees Structure to retro Transport bucket",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Invalid Retro Event Structure Flow",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeStructureDeleteRetroQuery = async (req, res) => {
  try {
    const { fsid } = req.params;
    const { flow } = req.query;
    if (!fsid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    if (flow === "Finance_Manager") {
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
    } else if (flow === "Hostel_Manager") {
      const previous_struct = await FeeStructure.findById({ _id: fsid });
      const hostel = await Hostel.findById({
        _id: `${previous_struct?.hostel}`,
      });
      hostel.modify_fees_structures_count += 1;
      previous_struct.document_update = true;
      if (hostel.fees_structures_count > 0) {
        hostel.fees_structures_count -= 1;
      }
      await Promise.all([hostel.save(), previous_struct.save()]);
      res.status(200).send({
        message: "Fees Structure retro hostel bucket Deletion",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Invalid flow for retro bucket Deletion",
        access: true,
      });
    }
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
    const { filter_by, batch_by } = req.query;
    const master_query = await handle_undefined(filter_by); // master Id
    const batch_query = await handle_undefined(batch_by); // batch Id
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const depart = await Department.findById({ _id: did }).select(
      "fees_structures"
    );
    if (master_query && batch_query) {
      var all_structures = await FeeStructure.find({
        $and: [
          { _id: { $in: depart?.fees_structures } },
          { class_master: master_query },
          { batch_master: batch_query },
          { document_update: false },
        ],
      })
        .sort({ created_at: "-1" })
        .limit(limit)
        .skip(skip)
        .select(
          "total_admission_fees structure_name unique_structure_name applicable_fees"
        )
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
        .sort({ created_at: "-1" })
        .limit(limit)
        .skip(skip)
        .select(
          "total_admission_fees structure_name unique_structure_name applicable_fees"
        )
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
      // const all_structures_encrypt = await encryptionPayload(all_structures)
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
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
          populate: {
            path: "fee_structure",
            select:
              "category_master structure_name unique_structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
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
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
          populate: {
            path: "fee_structure",
            select:
              "category_master structure_name unique_structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
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
      // const all_exempt_encrypt = await encryptionPayload(all_exempt)
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
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
          populate: {
            path: "fee_structure",
            select:
              "category_master structure_name unique_structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
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
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
          populate: {
            path: "fee_structure",
            select:
              "category_master structure_name unique_structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
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
      // const all_exempt_encrypt = await encryptionPayload(all_exempt)
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
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentClass studentROLLNO qviple_student_pay_id user apps_fees_obj",
        populate: {
          path: "remainingFeeList",
          select: "appId",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentClass studentROLLNO qviple_student_pay_id user apps_fees_obj",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads hostel_fee_structure active_society_fee_heads studentROLLNO qviple_student_pay_id user apps_fees_obj",
        populate: {
          path: "fee_structure hostel_fee_structure",
          select:
            "category_master structure_name unique_structure_name department batch_master applicable_fees class_master structure_month",
          populate: {
            path: "category_master class_master batch_master department",
            select: "category_name className batchName dName",
          },
        },
      })
      .populate({
        path: "finance",
        select: "financeHead show_receipt institute",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "application",
        select: "applicationName applicationDepartment applicationHostel",
        populate: {
          path: "admissionAdmin",
          select: "_id site_info",
          populate: {
            path: "institute",
            select:
              "insName name insAddress insPhoneNumber insEmail insState insDistrict insProfilePhoto photoId affliatedLogo insAffiliated insEditableText_one insEditableText_two",
            populate: {
              path: "displayPersonList",
              select: "displayTitle",
              populate: {
                path: "displayUser displayStaff",
                select:
                  "userLegalName staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
              },
            },
          },
        },
      })
      .populate({
        path: "application",
        select: "applicationName applicationDepartment applicationHostel",
        populate: {
          path: "admissionAdmin",
          select: "_id site_info",
          populate: {
            path: "site_info",
          },
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationUnit",
        populate: {
          path: "applicationUnit",
          select: "hostel_unit_name",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads student_bed_number active_society_fee_heads studentROLLNO qviple_student_pay_id user apps_fees_obj",
        populate: {
          path: "student_bed_number",
          select: "bed_number hostelRoom",
          populate: {
            path: "hostelRoom",
            select: "room_name hostelUnit",
            populate: {
              path: "hostelUnit",
              select: "hostel_unit_name",
            },
          },
        },
      })
      .populate({
        path: "application",
        select: "applicationName applicationDepartment applicationHostel",
        populate: {
          path: "hostelAdmin",
          select: "_id institute",
          populate: {
            path: "institute",
            select:
              "insName name insAddress insPhoneNumber insEmail insState insDistrict insProfilePhoto photoId affliatedLogo insAffiliated insEditableText_one insEditableText_two",
            populate: {
              path: "displayPersonList",
              select: "displayTitle",
              populate: {
                path: "displayUser displayStaff",
                select:
                  "userLegalName staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
              },
            },
          },
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationUnit",
        populate: {
          path: "applicationHostel",
          select: "site_info",
          populate: {
            path: "site_info",
          },
        },
      })
      .populate({
        path: "order_history",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentROLLNO qviple_student_pay_id user apps_fees_obj",
        populate: {
          path: "remainingFeeList",
          populate: {
            path: "fee_structure",
            select: "batch_master class_master",
            populate: {
              path: "batch_master class_master",
              select: "batchName className",
            },
          },
        },
      });

    if (receipt?.application?.applicationDepartment) {
      var one_account = await BankAccount.findOne({
        departments: { $in: receipt?.application?.applicationDepartment },
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    } else {
      var one_account = await BankAccount.findOne({
        hostel: receipt?.application?.applicationHostel,
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    }

    var ref = receipt?.student?.remainingFeeList?.filter((ele) => {
      if (`${ele?.appId}` === `${receipt?.application?._id}`) return ele;
    });

    if (ref?.length > 0) {
      var all_remain = await RemainingList.findById({ _id: ref[0]?._id })
        .select(
          "applicable_fee paid_fee remaining_fee refund_fee remaining_flow appId"
        )
        .populate({
          path: "batchId",
          select: "batchName",
        })
        .populate({
          path: "fee_structure",
          select: "total_admission_fees",
        })
        .populate({
          path: "applicable_card",
        });
    }

    // var new_format = receipt?.fee_heads?.filter((ref) => {
    //   if (ref?.original_paid > 0) return ref;
    // });

    // receipt.student.active_fee_heads = [...new_format];
    var excess_obj = {
      head_name: "Excess Fees",
      paid_fee:
        all_remain?.applicable_card?.paid_fee -
          all_remain?.applicable_card?.applicable_fee >
        0
          ? all_remain?.applicable_card?.paid_fee -
            all_remain?.applicable_card?.applicable_fee
          : 0,
      remain_fee: 0,
      applicable_fee: 0,
      fee_structure: all_remain?.fee_structure?._id,
      original_paid: 0,
      appId: all_remain?.appId,
    };
    if (
      receipt?.student?.apps_fees_obj?.gta > 0 &&
      receipt?.student?.apps_fees_obj?.appId == receipt?.application?._id &&
      receipt?.student?.apps_fees_obj?.struct == receipt?.fee_structure
    ) {
      var gta_obj = {
        head_name: "Government To Applicable",
        paid_fee: receipt?.student?.apps_fees_obj?.gta ?? 0,
        remain_fee: 0,
        applicable_fee: receipt?.student?.apps_fees_obj?.gta ?? 0,
        fee_structure: all_remain?.fee_structure?._id,
        original_paid: 0,
        appId: all_remain?.appId,
      };
    }
    if (excess_obj?.paid_fee > 0) {
      receipt.fee_heads.push(excess_obj);
    }
    if (gta_obj?.paid_fee > 0) {
      receipt.fee_heads.push(gta_obj);
    }
    if (receipt?.finance?.show_receipt === "Normal") {
      receipt.student.active_fee_heads = [...receipt?.fee_heads];
    } else if (receipt?.finance?.show_receipt === "Society") {
      receipt.fee_heads = receipt?.fee_heads?.filter((qwe) => {
        if (!qwe?.is_society) {
          return qwe;
        } else {
          receipt.student.active_society_fee_heads.push(qwe);
          return null;
        }
      });
      receipt.student.active_fee_heads = [...receipt?.fee_heads];
    }
    const qviple_id = await QvipleId.findOne({ user: receipt?.student?.user });

    const obj = {
      message: "Come up with Tea and Snacks",
      access: true,
      receipt: receipt,
      one_account: one_account,
      all_remain: all_remain,
      qviple_id: qviple_id,
    };
    if (all_remain?.remaining_flow === "Hostel Application") {
    }
    else {

      if (receipt?.finance?.show_receipt === "Normal") {
        // const obj_nums = await generateFeeReceipt(receipt?._id);
        await normalAdmissionFeeReceipt(
          receipt?._id,
          receipt?.application?._id
        );
      } else if (receipt?.finance?.show_receipt === "Society") {
        await societyAdmissionFeeReceipt(
          receipt?._id,
          receipt?.finance?.institute
        );
      }
    }
    const all_encrypt = await encryptionPayload(obj);
    res.status(200).send({ encrypt: all_encrypt });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneFeeReceiptUploadQuery = async (frid) => {
  try {
    const receipt = await FeeReceipt.findById({ _id: frid })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentROLLNO qviple_student_pay_id",
        populate: {
          path: "remainingFeeList",
          select: "appId",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentClass studentROLLNO qviple_student_pay_id",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads hostel_fee_structure active_society_fee_heads studentROLLNO qviple_student_pay_id",
        populate: {
          path: "fee_structure hostel_fee_structure",
          select:
            "category_master structure_name unique_structure_name department batch_master applicable_fees class_master structure_month",
          populate: {
            path: "category_master class_master batch_master department",
            select: "category_name className batchName dName",
          },
        },
      })
      .populate({
        path: "finance",
        select: "financeHead show_receipt",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "application",
        select: "applicationName applicationDepartment applicationHostel",
        populate: {
          path: "admissionAdmin",
          select: "_id site_info",
          populate: {
            path: "institute",
            select:
              "insName name insAddress insPhoneNumber insEmail insState insDistrict insProfilePhoto photoId affliatedLogo insAffiliated insEditableText_one insEditableText_two",
            populate: {
              path: "displayPersonList",
              select: "displayTitle",
              populate: {
                path: "displayUser displayStaff",
                select:
                  "userLegalName staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
              },
            },
          },
        },
      })
      .populate({
        path: "application",
        select: "applicationName applicationDepartment applicationHostel",
        populate: {
          path: "admissionAdmin",
          select: "_id site_info",
          populate: {
            path: "site_info",
          },
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationUnit",
        populate: {
          path: "applicationUnit",
          select: "hostel_unit_name",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads student_bed_number active_society_fee_heads studentROLLNO qviple_student_pay_id",
        populate: {
          path: "student_bed_number",
          select: "bed_number hostelRoom",
          populate: {
            path: "hostelRoom",
            select: "room_name hostelUnit",
            populate: {
              path: "hostelUnit",
              select: "hostel_unit_name",
            },
          },
        },
      })
      .populate({
        path: "application",
        select: "applicationName applicationDepartment applicationHostel",
        populate: {
          path: "hostelAdmin",
          select: "_id institute",
          populate: {
            path: "institute",
            select:
              "insName name insAddress insPhoneNumber insEmail insState insDistrict insProfilePhoto photoId affliatedLogo insAffiliated insEditableText_one insEditableText_two",
            populate: {
              path: "displayPersonList",
              select: "displayTitle",
              populate: {
                path: "displayUser displayStaff",
                select:
                  "userLegalName staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
              },
            },
          },
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationUnit",
        populate: {
          path: "applicationHostel",
          select: "site_info",
          populate: {
            path: "site_info",
          },
        },
      })
      .populate({
        path: "order_history",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentROLLNO qviple_student_pay_id",
        populate: {
          path: "remainingFeeList",
          populate: {
            path: "fee_structure",
            select: "batch_master class_master",
            populate: {
              path: "batch_master class_master",
              select: "batchName className",
            },
          },
        },
      });

    if (receipt?.application?.applicationDepartment) {
      var one_account = await BankAccount.findOne({
        departments: { $in: receipt?.application?.applicationDepartment },
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    } else {
      var one_account = await BankAccount.findOne({
        hostel: receipt?.application?.applicationHostel,
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    }

    var ref = receipt?.student?.remainingFeeList?.filter((ele) => {
      if (`${ele?.appId}` === `${receipt?.application?._id}`) return ele;
    });

    if (ref?.length > 0) {
      var all_remain = await RemainingList.findById({ _id: ref[0]?._id })
        .select(
          "applicable_fee paid_fee remaining_fee refund_fee remaining_flow appId"
        )
        .populate({
          path: "batchId",
          select: "batchName",
        })
        .populate({
          path: "fee_structure",
          select: "total_admission_fees",
        })
        .populate({
          path: "applicable_card",
        });
    }

    // var new_format = receipt?.fee_heads?.filter((ref) => {
    //   if (ref?.original_paid > 0) return ref;
    // });

    // receipt.student.active_fee_heads = [...new_format];
    var excess_obj = {
      head_name: "Excess Fees",
      paid_fee:
        all_remain?.applicable_card?.paid_fee -
          all_remain?.applicable_card?.applicable_fee >
        0
          ? all_remain?.applicable_card?.paid_fee -
            all_remain?.applicable_card?.applicable_fee
          : 0,
      remain_fee: 0,
      applicable_fee: 0,
      fee_structure: all_remain?.fee_structure?._id,
      original_paid: 0,
      appId: all_remain?.appId,
    };
    var gta_obj = {
      head_name: "Government To Applicable",
      paid_fee:
        all_remain?.applicable_card?.paid_fee -
          all_remain?.applicable_card?.applicable_fee >
        0
          ? all_remain?.applicable_card?.paid_fee -
            all_remain?.applicable_card?.applicable_fee
          : 0,
      remain_fee: 0,
      applicable_fee: 0,
      fee_structure: all_remain?.fee_structure?._id,
      original_paid: 0,
      appId: all_remain?.appId,
    };
    if (excess_obj?.paid_fee > 0) {
      receipt.fee_heads.push(excess_obj);
    }
    receipt.fee_heads.push(gta_obj);
    if (receipt?.finance?.show_receipt === "Normal") {
      receipt.student.active_fee_heads = [...receipt?.fee_heads];
    } else if (receipt?.finance?.show_receipt === "Society") {
      receipt.fee_heads = receipt?.fee_heads?.filter((qwe) => {
        if (!qwe?.is_society) {
          return qwe;
        } else {
          receipt.student.active_society_fee_heads.push(qwe);
          return null;
        }
      });
      receipt.student.active_fee_heads = [...receipt?.fee_heads];
    }

    const obj = {
      message: "Come up with Tea and Snacks",
      access: true,
      receipt: receipt,
      one_account: one_account,
      all_remain: all_remain,
    };
    return obj;
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTransportFeeReceipt = async (req, res) => {
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
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads",
        populate: {
          path: "remainingFeeList",
          select: "vehicleId",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads hostel_fee_structure",
        populate: {
          path: "fee_structure hostel_fee_structure transport_fee_structure",
          select:
            "category_master structure_name unique_structure_name department batch_master applicable_fees class_master structure_month",
          populate: {
            path: "category_master class_master batch_master department",
            select: "category_name className batchName dName",
          },
        },
      })
      .populate({
        path: "finance",
        select: "financeHead",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "vehicle",
        select: "vehicle_type vehicle_number vehicle_name transport",
        populate: {
          path: "transport",
          select: "_id site_info",
          populate: {
            path: "institute",
            select:
              "insName name insAddress insPhoneNumber insEmail insState insDistrict insProfilePhoto photoId affliatedLogo insAffiliated insEditableText_one insEditableText_two",
            populate: {
              path: "displayPersonList",
              select: "displayTitle",
              populate: {
                path: "displayUser displayStaff",
                select:
                  "userLegalName staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
              },
            },
          },
        },
      })
      .populate({
        path: "vehicle",
        populate: {
          path: "transport",
          select: "_id site_info",
          populate: {
            path: "site_info",
          },
        },
      })
      .populate({
        path: "order_history",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads",
        populate: {
          path: "remainingFeeList",
          populate: {
            path: "fee_structure",
            select: "batch_master class_master",
            populate: {
              path: "batch_master class_master",
              select: "batchName className",
            },
          },
        },
      });

    var one_account = await BankAccount.findOne({
      transport: receipt?.vehicle?.transport?._id,
    }).select(
      "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
    );

    var ref = receipt?.student?.remainingFeeList?.filter((ele) => {
      if (`${ele?.vehicleId}` === `${receipt?.vehicle?._id}`) return ele;
    });

    if (ref?.length > 0) {
      var all_remain = await RemainingList.findById({ _id: ref[0]?._id })
        .select(
          "applicable_fee paid_fee remaining_fee refund_fee remaining_flow"
        )
        .populate({
          path: "batchId",
          select: "batchName",
        })
        .populate({
          path: "fee_structure",
          select: "total_admission_fees",
        });
    }

    var new_format = receipt?.student?.active_fee_heads?.filter((ref) => {
      if (`${ref?.vehicleId}` === `${receipt?.vehicle?._id}`) return ref;
    });

    receipt.student.active_fee_heads = [...new_format];

    const obj = {
      message: "Come up with Tea and Snacks",
      access: true,
      receipt: receipt,
      one_account: one_account,
      all_remain: all_remain,
    };
    const all_encrypt = await encryptionPayload(obj);
    res.status(200).send({ encrypt: all_encrypt });
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
        "one_installments two_installments structure_name unique_structure_name applicable_fees three_installments four_installments five_installments six_installments seven_installments eight_installments nine_installments ten_installments eleven_installments tweleve_installments total_installments total_admission_fees due_date fees_heads applicable_fees_heads government_fees_heads structure_month"
      )
      .populate({
        path: "category_master",
        select: "category_name",
      })
      .populate({
        path: "class_master",
        select: "className",
      })
      .populate({
        path: "batch_master",
        select: "batchName batchStatus createdAt",
      })
      .populate({
        path: "unit_master",
        select: "hostel_unit_name",
      });

    // const structure_encrypt = await encryptionPayload(structure)

    res
      .status(200)
      .send({
        message: "Explore One Fees Structure",
        access: true,
        structure: structure,
      });
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
    const { filter_by, flow } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const bank_query = await Finance.findById({ _id: fid }).select(
      "payment_modes_type bank_account"
    );

    if (flow === "Department") {
      var all_account = await BankAccount.findOne({
        $and: [{ departments: { $in: filter_by } }],
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    } else if (flow === "Transport") {
      var all_account = await BankAccount.findOne({
        $and: [{ transport: filter_by }],
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    } else if (flow === "Library") {
      var all_account = await BankAccount.findOne({
        $and: [{ library: filter_by }],
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    } else if (flow === "Hostel") {
      var all_account = await BankAccount.findOne({
        $and: [{ hostel: filter_by }],
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    } else {
      var all_account = null;
    }
    const obj = {
      message: "Explore Transaction Query",
      access: true,
      bank_query: bank_query?.payment_modes_type,
      all_account: all_account,
    };
    const query_encrypt = await encryptionPayload(obj);
    res.status(200).send({ encrypt: query_encrypt });
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
    const { flow } = req?.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const master = new FeeMaster({ ...req.body });
    master.finance = finance?._id;
    if (flow === "OTHER") {
      finance.other_fee_master_array.push(master?._id);
      finance.other_fee_master_array_count += 1;
    } else {
      finance.fee_master_array.push(master?._id);
      finance.fee_master_array_count += 1;
    }
    await Promise.all([master.save(), finance.save()]);
    res
      .status(200)
      .send({ message: "I Think Fees Master Problem Solved", access: true });
    if (finance?.deposit_linked_head?.status === "Not Linked") {
      const new_master = new FeeMaster({
        master_name: "Deposit Fees",
        master_amount: 10,
        master_status: "Linked",
      });
      new_master.finance = finance?._id;
      finance.fee_master_array.push(new_master?._id);
      finance.fee_master_array_count += 1;
      finance.deposit_linked_head.master = new_master?._id;
      finance.deposit_linked_head.status = "Linked";
      await Promise.all([new_master.save(), finance.save()]);
    }
    if (finance?.deposit_hostel_linked_head?.status === "Not Linked") {
      const new_master = new FeeMaster({
        master_name: "Hostel Deposit Fees",
        master_amount: 10,
        master_status: "Hostel Linked",
      });
      new_master.finance = finance?._id;
      finance.fee_master_array.push(new_master?._id);
      finance.fee_master_array_count += 1;
      finance.deposit_hostel_linked_head.master = new_master?._id;
      finance.deposit_hostel_linked_head.status = "Linked";
      await Promise.all([new_master.save(), finance.save()]);
    }
    if (finance?.deposit_transport_linked_head?.status === "Not Linked") {
      const new_master = new FeeMaster({
        master_name: "Transport Deposit Fees",
        master_amount: 10,
        master_status: "Transport Linked",
      });
      new_master.finance = finance?._id;
      finance.fee_master_array.push(new_master?._id);
      finance.fee_master_array_count += 1;
      finance.deposit_transport_linked_head.master = new_master?._id;
      finance.deposit_transport_linked_head.status = "Linked";
      await Promise.all([new_master.save(), finance.save()]);
    }
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
      if (finance?.deposit_linked_head?.status === "Not Linked") {
        const new_master = new FeeMaster({
          master_name: "Deposit Fees",
          master_amount: 10,
          master_status: "Linked",
        });
        new_master.finance = finance?._id;
        finance.fee_master_array.push(new_master?._id);
        finance.fee_master_array_count += 1;
        finance.deposit_linked_head.master = new_master?._id;
        finance.deposit_linked_head.status = "Linked";
        await Promise.all([new_master.save(), finance.save()]);
      }
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
      }).select("master_name master_amount master_status created_at");
    } else {
      var all_master = await FeeMaster.find({
        _id: { $in: finance?.fee_master_array },
      })
        // .sort("-1")
        .limit(limit)
        .skip(skip)
        .select("master_name master_amount master_status created_at");
    }

    if (all_master?.length > 0) {
      // const all_master_encrypt = await encryptionPayload(all_master)
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
    const { flow } = req?.body;
    if (!fid && !fmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const master = await FeeMaster.findById({ _id: fmid });

    if (flow === "OTHER") {
      finance.other_fee_master_array.pull(master?._id);
      if (finance.other_fee_master_array_count > 0) {
        finance.other_fee_master_array_count -= 1;
      }
    } else {
      finance.fee_master_array.pull(master?._id);
      if (finance.fee_master_array_count > 0) {
        finance.fee_master_array_count -= 1;
      }
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

exports.renderFinanceAllMasterHeadOtherQuery = async (req, res) => {
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
      "other_fee_master_array"
    );

    if (search) {
      var all_master = await FeeMaster.find({
        $and: [{ _id: { $in: finance?.other_fee_master_array } }],
        $or: [{ master_name: { $regex: search, $options: "i" } }],
      }).select("master_name master_amount master_status created_at");
    } else {
      var all_master = await FeeMaster.find({
        _id: { $in: finance?.other_fee_master_array },
      })
        // .sort("-1")
        .limit(limit)
        .skip(skip)
        .select("master_name master_amount master_status created_at");
    }

    if (all_master?.length > 0) {
      // const all_master_encrypt = await encryptionPayload(all_master)
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

exports.renderAllExportExcelArrayQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { filter } = req?.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ins_admin = await InstituteAdmin.findById({ _id: id }).select(
      "export_collection"
    );

    if (filter === "Scholarship") {
      var arr = ins_admin?.export_collection?.filter((val) => {
        if (val?.excel_val === "Scholarship") return val;
      });
      var all_excel = await nested_document_limit(page, limit, arr?.reverse());
    } else if (filter === "Certificate") {
      var arr = ins_admin?.export_collection?.filter((val) => {
        if (val?.excel_val === "Certificate") return val;
      });
      var all_excel = await nested_document_limit(page, limit, arr?.reverse());
    } else {
      var all_excel = await nested_document_limit(
        page,
        limit,
        ins_admin?.export_collection.reverse()
      );
    }
    if (all_excel?.length > 0) {
      res.status(200).send({
        message: "Explore All Exported Excel",
        access: true,
        all_excel: all_excel,
        count: all_excel?.length,
      });
    } else {
      res.status(200).send({
        message: "No Exported Excel Available",
        access: false,
        all_excel: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditOneExcel = async (req, res) => {
  try {
    const { id, exid } = req.params;
    const { excel_file_name } = req.body;
    if (!id && !exid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ins_admin = await InstituteAdmin.findById({ _id: id }).select(
      "export_collection"
    );
    for (var exe of ins_admin?.export_collection) {
      if (`${exe?._id}` === `${exid}`) {
        exe.excel_file_name = excel_file_name;
      }
    }
    await ins_admin.save();
    res.status(200).send({
      message: "Exported Excel Updated",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDeleteOneExcel = async (req, res) => {
  try {
    const { id, exid } = req.params;
    if (!id && !exid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ins_admin = await InstituteAdmin.findById({ _id: id }).select(
      "export_collection export_collection_count"
    );
    for (var exe of ins_admin?.export_collection) {
      if (`${exe?._id}` === `${exid}`) {
        ins_admin?.export_collection.pull(exid);
        if (ins_admin?.export_collection_count > 0) {
          ins_admin.export_collection_count -= 1;
        }
      }
    }
    await ins_admin.save();
    res.status(200).send({
      message: "Exported Excel Deletion Operation Completed",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceMasterDepositQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var master = await FeeMaster.findOne({
      $and: [{ master_status: "Linked" }, { finance: fid }],
    }).select(
      "paid_student_count deposit_amount master_name refund_student_count refund_amount"
    );

    // const master_encrypt = await encryptionPayload(master)
    res.status(200).send({
      message: "Explore Linked Fee Masters",
      access: true,
      master: master,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceMasterAllDepositArray = async (req, res) => {
  try {
    const { fmid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!fmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const master = await FeeMaster.findById({
      _id: fmid,
    }).select("paid_student");

    if (search) {
      var all_students = await Student.find({
        $and: [{ _id: { $in: master?.paid_student } }],
        $or: [
          { studentFirstName: { $regex: search, $options: "i" } },
          { studentMiddleName: { $regex: search, $options: "i" } },
          { studentLastName: { $regex: search, $options: "i" } },
          { studentGRNO: { $regex: search, $options: "i" } },
        ],
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto deposit_pending_amount"
        )
        .populate({
          path: "department",
          select: "dName dTitle",
        });
    } else {
      var all_students = await Student.find({
        _id: { $in: master?.paid_student },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto deposit_pending_amount"
        )
        .populate({
          path: "department",
          select: "dName dTitle",
        });
    }

    all_students = all_students?.filter((ref) => {
      if (ref?.deposit_pending_amount > 0) return ref;
    });

    if (all_students?.length > 0) {
      // const students_encrypt = await encryptionPayload(all_students)
      res.status(200).send({
        message: "Explore Student Deposits Available",
        access: true,
        all_students: all_students,
      });
    } else {
      res.status(200).send({
        message: "No Student Deposits Available",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceMasterDepositRefundQuery = async (req, res) => {
  try {
    const { fmid, sid } = req.params;
    const { amount, mode } = req.body;
    var price = parseInt(amount);
    if (!fmid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const master = await FeeMaster.findById({
      _id: fmid,
    });
    const finance = await Finance.findById({ _id: `${master?.finance}` });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student?.user}` });
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    const hostel = await Hostel.findById({ _id: institute?.hostelDepart?.[0] });
    const trans = await Transport.findOne({
      _id: institute?.transportDepart?.[0],
    });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
    const order = new OrderPayment({});
    order.payment_module_type = "Expense";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = finance?._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_finance = finance?._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    institute.invoice_count += 1;
    order.payment_invoice_number = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute?.invoice_count}`;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    if (master?.deposit_amount >= price) {
      master.deposit_amount -= price;
      master.refund_amount += price;
      if (master?.refund_student?.includes(student?._id)) {
      } else {
        master.refund_student.push(student?._id);
        master.refund_student_count += 1;
      }
    }
    if (student?.deposit_pending_amount >= price) {
      student.deposit_pending_amount -= price;
      student.deposit_refund_amount += price;
    }
    if (mode === "Offline") {
      if (finance?.financeSubmitBalance >= price) {
        finance.financeSubmitBalance -= price;
      }
      if (finance?.financeTotalBalance >= price) {
        finance.financeTotalBalance -= price;
      }
    }
    if (mode === "Online") {
      if (finance?.financeBankBalance >= price) {
        finance.financeBankBalance -= price;
      }
      if (finance?.financeTotalBalance >= price) {
        finance.financeTotalBalance -= price;
      }
    }
    new_receipt.student = student?._id;
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    if (master?.master_status === "Linked") {
      finance.refund_deposit.push(new_receipt?._id);
    } else if (master?.master_status === "Hostel Linked") {
      hostel.refund_deposit.push(new_receipt?._id);
    } else if (master?.master_status === "Transport Linked") {
      trans.refund_deposit.push(new_receipt?._id);
    }
    student.refund_deposit.push(new_receipt?._id);
    new_receipt.fee_master = master?._id;
    await Promise.all([
      student.save(),
      finance.save(),
      hostel.save(),
      master.save(),
      new_receipt.save(),
      s_admin.save(),
      user.save(),
      institute.save(),
      order.save(),
    ]);
    if (trans) {
      await trans.save();
    }
    res
      .status(200)
      .send({ message: "Explore New Refund Deposit", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceMasterAllDepositHistory = async (req, res) => {
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
      "refund_deposit"
    );

    if (search) {
      var all_receipts = await FeeReceipt.find({
        _id: { $in: finance?.refund_deposit },
      }).populate({
        path: "student",
        match: {
          studentFirstName: { $regex: search, $options: "i" },
        },
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
      });

      all_receipts = all_receipts?.filter((ref) => {
        if (ref?.student !== null) return ref;
      });
    } else {
      var all_receipts = await FeeReceipt.find({
        _id: { $in: finance?.refund_deposit },
      })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        });
    }
    if (all_receipts?.length > 0) {
      // const receipt_encrypt = await encryptionPayload(all_receipts)
      res.status(200).send({
        message: "Explore All Refund History",
        access: true,
        all_receipts: all_receipts,
      });
    } else {
      res.status(200).send({
        message: "No Refund History",
        access: false,
        all_receipts: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceNewPayrollMasterQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_finance = await Finance.findById({ _id: fid });
    const new_master = new PayrollMaster({ ...req.body });
    one_finance.payroll_master.push(new_master?._id);
    one_finance.payroll_master_count += 1;
    new_master.finance = one_finance?._id;
    await Promise.all([one_finance.save(), new_master.save()]);
    res
      .status(200)
      .send({ message: "Explore New Payroll Master Query ", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAllPayrollMasterQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search, filter } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_finance = await Finance.findById({ _id: fid }).select(
      "payroll_master"
    );
    if (search) {
      if (filter) {
        var all_masters = await PayrollMaster.find({
          $and: [
            { _id: { $in: one_finance?.payroll_master } },
            { payroll_head_type: filter },
          ],
          $or: [{ payroll_head_name: { $regex: search, $options: "i" } }],
        }).select("payroll_head_name payroll_head_type");
      } else {
        var all_masters = await PayrollMaster.find({
          $and: [{ _id: { $in: one_finance?.payroll_master } }],
          $or: [{ payroll_head_name: { $regex: search, $options: "i" } }],
        }).select("payroll_head_name payroll_head_type");
      }
    } else {
      if (filter) {
        var all_masters = await PayrollMaster.find({
          $and: [
            { _id: { $in: one_finance?.payroll_master } },
            { payroll_head_type: filter },
          ],
        })
          .limit(limit)
          .skip(skip)
          .select("payroll_head_name payroll_head_type");
      } else {
        var all_masters = await PayrollMaster.find({
          _id: { $in: one_finance?.payroll_master },
        })
          .limit(limit)
          .skip(skip)
          .select("payroll_head_name payroll_head_type");
      }
    }

    if (all_masters?.length > 0) {
      // const master_encrypt = await encryptionPayload(all_masters)
      res.status(200).send({
        message: "Explore All Payroll Master Query ",
        access: true,
        all_masters: all_masters,
      });
    } else {
      res.status(200).send({
        message: "No Payroll Master Query ",
        access: true,
        all_masters: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceOnePayrollMasterAllMonthQuery = async (req, res) => {
  try {
    const { pmid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!pmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_master = await PayrollMaster.findById({ _id: pmid }).select(
      "payroll_month_collection"
    );

    var all_month_wise = await PayMaster.find({
      _id: { $in: one_master?.payroll_month_collection },
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .select(
        "pay_month pay_status pay_amount pay_fee_receipt pay_staff_collection_count"
      )
      .populate({
        path: "payroll_master",
        select: "_id",
      });

    if (all_month_wise?.length > 0) {
      // const month_encrypt = await encryptionPayload(all_month_wise)
      res.status(200).send({
        message: "Explore All Months Payroll Master",
        access: true,
        all_month_wise: all_month_wise,
      });
    } else {
      res.status(200).send({
        message: "No All Months Payroll Master",
        access: true,
        all_month_wise: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceOnePayrollMasterOneMonthAllEmpQuery = async (req, res) => {
  try {
    const { mwid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!mwid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const month_wise = await PayMaster.findById({ _id: mwid })
      .select("pay_staff_collection")
      .populate({
        path: "pay_staff_collection",
        populate: {
          path: "emp",
          select: "staff",
          populate: {
            path: "staff",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        },
      });
    var all_emp = await nested_document_limit(
      page,
      limit,
      month_wise?.pay_staff_collection
    );

    if (all_emp?.length > 0) {
      // const emp_encrypt = await encryptionPayload(all_emp)
      res.status(200).send({
        message: "Explore One Month All Emp",
        access: true,
        all_emp: all_emp,
      });
    } else {
      res.status(200).send({
        message: "No Months Emp",
        access: true,
        all_emp: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceOnePayrollMasterMarkPayExpenseQuery = async (req, res) => {
  try {
    const { mwid, fid } = req.params;
    const { amount, mode } = req.body;
    if (!mwid && !fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var price = parseInt(amount);
    const s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const one_master = await PayMaster.findById({ _id: mwid });
    const one_payroll_master = await PayrollMaster.findById({
      _id: `${one_master?.payroll_master}`,
    });
    const finance = await Finance.findById({ _id: fid });
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
    const expense = new Expense({});
    new_receipt.pay_master = one_master?._id;
    new_receipt.finance = finance?._id;
    one_master.pay_fee_receipt = new_receipt?._id;
    one_master.pay_status = "Paid";
    new_receipt.fee_transaction_date = new Date(
      `${req?.body?.transaction_date}`
    );
    expense.expenseAccount = mode === "By Cash" ? "By Cash" : "By Bank";
    expense.expenseAmount = price;
    expense.expensePaid = `Account ${one_payroll_master?.payroll_head_name} Payment`;
    expense.finances = finance?._id;
    institute.invoice_count += 1;
    expense.invoice_number = institute?.invoice_count;
    finance.expenseDepartment.push(expense?._id);
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute?.invoice_count}`;
    await Promise.all([
      expense.save(),
      s_admin.save(),
      new_receipt.save(),
      one_master.save(),
      finance.save(),
      institute.save(),
    ]);
    res
      .status(200)
      .send({ message: "Explore New Expense Payment", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveRequestHostelAtFinance = async (req, res) => {
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
          path: "hostel_request",
          populate: {
            path: "hostel",
            select: "hostel_manager",
            populate: {
              path: "hostel_manager",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });

      var all_array = nested_document_limit(
        page,
        limit,
        finance?.hostel_request
      );
    } else if (filter_by === "ALL_SUBMIT") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "hostel_submit",
          populate: {
            path: "hostel",
            select: "hostel_manager",
            populate: {
              path: "hostel_manager",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      var all_array = nested_document_limit(
        page,
        limit,
        finance?.hostel_submit
      );
    } else if (filter_by === "ALL_CANCEL") {
      const finance = await Finance.findById({ _id: fid })
        .select("financeName")
        .populate({
          path: "hostel_cancelled",
          populate: {
            path: "hostel",
            select: "hostel_manager",
            populate: {
              path: "hostel_manager",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        });
      var all_array = nested_document_limit(
        page,
        limit,
        finance?.hostel_cancelled
      );
    } else {
      var all_array = [];
    }
    if (all_array?.length > 0) {
      res.status(200).send({
        message: "Get All Hostel Cash Flow from DB 🙌",
        arr: all_array,
        arrCount: all_array.length,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Hostel Cash Flow from DB 🙌",
        arr: [],
        arrCount: 0,
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelRequestFundsQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { amount } = req.body;
    if (!hid && !amount)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const price = parseInt(amount);
    const one_hostel = await Hostel.findById({ _id: hid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${one_ins?.financeDepart[0]}`,
    });
    if (
      finance?.requestArray?.length > 0 &&
      finance?.requestArray?.includes(`${one_hostel?._id}`)
    ) {
      res.status(200).send({
        message: "Already requested for processing 🔍",
        access: false,
      });
    } else {
      finance.requestArray.push(one_hostel?._id);
      finance.hostel_request.push({
        hostel: one_hostel?._id,
        amount: price,
        status: "Requested",
      });
      one_hostel.requested_status = "Requested";
      await Promise.all([finance.save(), one_hostel.save()]);
      res.status(200).send({
        message: "Installment Operation Completed 😀",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.submitHostelFeeQuery = async (req, res) => {
  try {
    const { fid, hid, rid } = req.params;
    const { amount, status } = req.body;
    if (!fid && !hid && !rid && !amount && !status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    if (status === "Accepted") {
      const price = parseInt(amount);
      var finance = await Finance.findById({ _id: fid });
      var one_hostel = await Hostel.findById({ _id: hid });
      for (var docs of finance.hostel_request) {
        if (`${docs?._id}` === `${rid}`) {
          finance.hostel_request.pull(docs?._id);
        }
      }
      finance.hostel_submit.push({
        hostel: one_hostel?._id,
        amount: price,
        status: "Accepeted",
      });
      finance.requestArray.pull(one_hostel._id);
      // finance.financeTotalBalance += price;
      // finance.financeSubmitBalance += price;
      one_hostel.requested_status = "Pending";
      if (one_hostel?.collected_fee >= price) {
        one_hostel.collected_fee -= price;
      }
      await Promise.all([one_hostel.save(), finance.save()]);
      res.status(200).send({
        message: "Request Accepted",
        access: true,
        adsCount: finance.hostel_request.length,
      });
    } else if (status === "Rejected") {
      const price = parseInt(amount);
      var finance = await Finance.findById({ _id: fid });
      var one_hostel = await Hostel.findById({ _id: hid });
      for (var docs of finance.hostel_request) {
        if (`${docs?._id}` === `${rid}`) {
          finance.hostel_request.pull(docs?._id);
        }
      }
      finance.hostel_cancelled.push({
        hostel: one_hostel?._id,
        amount: price,
        status: "Rejected",
      });
      finance.requestArray.pull(one_hostel._id);
      one_hostel.requested_status = "Pending";
      await Promise.all([one_hostel.save(), finance.save()]);
      res.status(200).send({
        message: "Request Rejected",
        access: true,
        adsCount: finance.hostel_request.length,
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

exports.renderExistRetroStructureQuery = async (req, res) => {
  try {
    const { fsid } = req.params;
    const { heads } = req.body;
    if (!fsid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    await FeeStructure.findByIdAndUpdate(fsid, req.body);
    res.status(200).send({
      message: "Explore Retro Events Based Editable Structure Query",
      access: true,
    });
    var exist_struct = await FeeStructure.findById({ _id: fsid });
    await installment_checker_query(
      exist_struct?.total_installments,
      exist_struct
    );
    const depart = await Department.findById({
      _id: `${req.body?.department}`,
    });
    const category = await FeeCategory.findById({
      _id: `${req.body?.category_master}`,
    });
    const class_master = await ClassMaster.findById({
      _id: `${req.body?.class_master}`,
    });
    const batch_master = await Batch.findById({
      _id: `${req.body?.batch_master}`,
    });
    exist_struct.unique_structure_name = `${category?.category_name} - ${depart?.dName} - ${batch_master?.batchName} - ${class_master?.className} / ${req.body?.structure_name}`;
    exist_struct.fees_heads = [];
    exist_struct.fees_heads_count = 0;
    if (heads?.length > 0) {
      for (var ref of heads) {
        exist_struct.fees_heads.push({
          head_name: ref?.head_name,
          head_amount: ref?.head_amount,
          master: ref?.master,
        });
        exist_struct.fees_heads_count += 1;
      }
    }
    await exist_struct.save();
    var all_remain_query = await RemainingList.find({
      $and: [{ fee_structure: `${exist_struct?._id}` }],
    }).populate({
      path: "fee_structure",
      populate: {
        path: "finance",
        select: "institute",
      },
    });
    for (var ref of all_remain_query) {
      var valid_ref = { paid_fee: ref?.paid_fee, appId: ref?.appId };
      if (ref?.status === "Paid") {
        ref.applicable_fee = exist_struct?.total_admission_fees;
        await ref.save();
        var one_student = await Student.findById({ _id: `${ref?.student}` });
        var filtered_head = one_student?.active_fee_heads?.filter((val) => {
          if (`${val?.fee_structure}` === `${exist_struct?._id}`) return val;
        });
        for (var val of filtered_head) {
          one_student.active_fee_heads.pull(val?._id);
        }
        await one_student.save();
        var valid_refund =
          ref?.paid_fee >= ref?.applicable_fee
            ? ref?.paid_fee - ref?.applicable_fee
            : 0;
        console.log("Valid ", valid_refund);
        if (ref?.applicable_fee >= exist_struct?.total_admission_fees) {
          if (valid_refund > 0) {
            if (
              valid_refund >=
              ref?.applicable_fee - exist_struct?.total_admission_fees
            ) {
              console.log("Valid Refund Subtract");
              ref.refund_fee += valid_refund;
              ref.status = "Paid";
              await ref.save();
            } else {
              console.log("In Valid Refund Entering in Else Part");
              if (ref?.access_mode_card === "Installment_Wise") {
                ref.remaining_array.push({
                  remainAmount:
                    ref?.applicable_fee -
                    exist_struct?.total_admission_fees -
                    valid_refund,
                  appId: ref?.appId,
                  status: "Not Paid",
                  instituteId: ref?.fee_structure?.finance?.institute,
                  installmentValue: "Installment Remain",
                  isEnable: true,
                });
              } else if (ref?.access_mode_card === "One_Time_Wise") {
                ref.remaining_array.push({
                  remainAmount:
                    ref?.applicable_fee -
                    exist_struct?.total_admission_fees -
                    valid_refund,
                  appId: ref?.appId,
                  status: "Not Paid",
                  instituteId: ref?.fee_structure?.finance?.institute,
                  installmentValue: "One Time Fees Remain",
                  isEnable: true,
                });
              }
              ref.status = "Not Paid";
            }
          }
        } else if (ref?.applicable_fee < exist_struct?.total_admission_fees) {
          console.log("In Else Part Lest Than Total Admission Fees");
          console.log("Valid Refund", valid_refund);
          if (valid_refund > 0) {
            if (
              valid_refund >=
              ref?.applicable_fee - exist_struct?.total_admission_fees
            ) {
            } else {
              if (ref?.access_mode_card === "Installment_Wise") {
                ref.remaining_array.push({
                  remainAmount:
                    exist_struct?.total_admission_fees -
                    ref?.applicable_fee +
                    valid_refund,
                  appId: ref?.appId,
                  status: "Not Paid",
                  instituteId: ref?.fee_structure?.finance?.institute,
                  installmentValue: "Installment Remain",
                  isEnable: true,
                });
              } else if (ref?.access_mode_card === "One_Time_Wise") {
                ref.remaining_array.push({
                  remainAmount:
                    exist_struct?.total_admission_fees -
                    ref?.applicable_fee +
                    valid_refund,
                  appId: ref?.appId,
                  status: "Not Paid",
                  instituteId: ref?.fee_structure?.finance?.institute,
                  installmentValue: "One Time Fees Remain",
                  isEnable: true,
                });
              }
            }
          } else {
            if (ref?.access_mode_card === "Installment_Wise") {
              ref.remaining_array.push({
                remainAmount:
                  exist_struct?.total_admission_fees - ref?.applicable_fee,
                appId: ref?.appId,
                status: "Not Paid",
                instituteId: ref?.fee_structure?.finance?.institute,
                installmentValue: "Installment Remain",
                isEnable: true,
              });
            } else if (ref?.access_mode_card === "One_Time_Wise") {
              ref.remaining_array.push({
                remainAmount:
                  exist_struct?.total_admission_fees - ref?.applicable_fee,
                appId: ref?.appId,
                status: "Not Paid",
                instituteId: ref?.fee_structure?.finance?.institute,
                installmentValue: "One Time Fees Remain",
                isEnable: true,
              });
            }
          }
          ref.applicable_fee = exist_struct?.total_admission_fees;
          ref.remaining_fee +=
            exist_struct?.total_admission_fees - ref?.applicable_fee;
          ref.status = "Not Paid";
          await ref.save();
        }
        // console.log(ref);
        await retro_student_heads_sequencing_query(
          one_student,
          valid_ref,
          exist_struct
        );
        var all_receipt = await FeeReceipt.find({
          _id: { $in: one_student?.fee_receipt },
        });
        for (var rec of all_receipt) {
          for (var ele of rec?.fee_heads) {
            if (`${ele?.fee_structure}` === `${exist_struct?._id}`) {
              rec.fee_heads.pull(ele?._id);
            }
          }
          await rec.save();
          await retro_receipt_heads_sequencing_query(one_student, rec);
        }
      } else if (ref?.status === "Not Paid") {
        ref.applicable_fee = exist_struct?.total_admission_fees;
        await ref.save();
        var one_student = await Student.findById({ _id: `${ref?.student}` });
        var filtered_head = one_student?.active_fee_heads?.filter((val) => {
          if (`${val?.fee_structure}` === `${exist_struct?._id}`) return val;
        });
        for (var ref of filtered_head) {
          one_student.active_fee_heads.pull(ref?._id);
        }
        await one_student.save();
        var filter_remain = await ref?.remaining_array?.filter((val) => {
          if (`${val?.status}` === "Not Paid") return val;
        });
        if (ref?.applicable_fee >= exist_struct?.total_admission_fees) {
          var app_diff =
            ref?.applicable_fee - exist_struct?.total_admission_fees;
          filter_remain = filter_remain.reverse();
          for (var ele of filter_remain) {
            var valid_remain_diff =
              ele?.remainAmount <= app_diff ? true : false;
            if (valid_remain_diff) {
              ele.remainAmount -= valid_remain_diff;
            }
            app_diff -= ele.remainAmount;
          }
          for (var ele of ref?.remaining_array) {
            if (ele?.remainAmount > 0) {
            } else {
              ref.remaining_array.pull(ele?._id);
            }
          }
          if (ref?.remaining_fee > 0) {
          } else {
            ref.status = "Paid";
          }
          await ref.save();
        } else if (ref?.applicable_fee < exist_struct?.total_admission_fees) {
          if (filter_remain?.length > 0) {
            filter_remain[filter_remain?.length - 1].remainAmount +=
              exist_struct?.total_admission_fees - ref?.applicable_fee;
          }
          ref.remaining_fee +=
            exist_struct?.total_admission_fees - ref?.applicable_fee;
          ref.status = "Not Paid";
          await ref.save();
        }
        // console.log(ref);
        await retro_student_heads_sequencing_query(
          one_student,
          valid_ref,
          exist_struct
        );
        var all_receipt = await FeeReceipt.find({
          _id: { $in: `${one_student?.fee_receipt}` },
        });
        for (var rec of all_receipt) {
          for (var ele of rec?.fee_heads) {
            if (`${ele?.fee_structure}` === `${exist_struct?._id}`) {
              rec.fee_heads.pull(ele?._id);
            }
          }
          await rec.save();
          await retro_receipt_heads_sequencing_query(one_student, rec);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderSecondaryStructureQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { fee_category, old_category } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const valid_category = await FeeCategory.findById({
      _id: `${fee_category}`,
    });
    var old_cat = await FeeCategory.findById({ _id: `${old_category}` });
    if (valid_category) {
      finance.secondary_category.category = valid_category?._id;
      valid_category.current_status = "Secondary Category";
      old_cat.secondary_category = valid_category?._id;
      finance.secondary_category.status = "Assigned";
      await Promise.all([
        finance.save(),
        valid_category.save(),
        old_cat.save(),
      ]);
      res.status(200).send({
        message: "Explore New Secondary Fee Structure Query",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No New Secondary Fee Structure Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderValidBankQuery = async (req, res) => {
  try {
    const { fid, aid } = req.params;
    const { flow } = req.query;
    if (!fid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var finance = await Finance.findById({ _id: fid });
    if (flow === "BY_DEPARTMENT") {
      var apply = await NewApplication.findById({ _id: aid });
      var valid_bank_depart = await BankAccount.find({
        $and: [
          { finance: finance?._id },
          { departments: { $in: apply?.applicationDepartment } },
        ],
      });
      res.status(200).send({
        message: "Explore Valid New Department Bank Account",
        access: true,
        denied: valid_bank_depart?.length ? false : true,
      });
    } else if (flow === "BY_HOSTEL") {
      var apply = await NewApplication.findById({ _id: aid });
      var valid_bank_hostel = await BankAccount.find({
        $and: [{ finance: finance?._id }, { hostel: apply?.applicationHostel }],
      });
      res.status(200).send({
        message: "Explore Valid New Hostel Bank Account",
        access: true,
        denied: valid_bank_hostel?.length ? false : true,
      });
    } else if (flow === "BY_LIBRARY") {
      var apply = await Library.findById({ _id: aid });
      var valid_bank_library = await BankAccount.find({
        $and: [{ finance: finance?._id }, { library: apply?._id }],
      });
      res.status(200).send({
        message: "Explore Valid New Library Bank Account",
        access: true,
        denied: valid_bank_library?.length ? false : true,
      });
    } else if (flow === "BY_TRANSPORT") {
      var apply = await Transport.findById({ _id: aid });
      var valid_bank_trans = await BankAccount.find({
        $and: [{ finance: finance?._id }, { transport: apply?._id }],
      });
      res.status(200).send({
        message: "Explore Valid New Transport Bank Account",
        access: true,
        denied: valid_bank_trans?.length ? false : true,
      });
    } else {
      res
        .status(200)
        .send({ message: "Invalid Flow", access: false, denied: true });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewInternalFeesQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    const { ClassId, did } = req.body;
    const finance = await Finance.findById({ _id: fid });
    const department = await Department.findById({ _id: did });
    var feeData = new Fees({ ...req.body });
    department.fees.push(feeData._id);
    finance.fees.push(feeData._id);
    finance.fees_count += 1;
    feeData.finance = finance?._id;
    feeData.feeDepartment = department._id;
    for (let i = 0; i < ClassId?.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      classes.fee.push(feeData._id);
      feeData.classes.push(classes?._id);
      feeData.classes_count += 1;
      await classes.save();
    }

    await Promise.all([feeData.save(), department.save(), finance.save()]);
    res.status(201).send({ message: `${feeData.feeName} Fees Raised` });
    for (let i = 0; i < department.ApproveStudent.length; i++) {
      const student = await Student.findById({
        _id: department.ApproveStudent[i],
      });
      const notify = new StudentNotification({});
      const user = await User.findById({ _id: `${student.user}` });
      notify.notifyContent = `New ${feeData.feeName} (fee) has been created. check your member's Tab`;
      notify.notify_hi_content = `नवीन ${feeData.feeName} (fee) बनाई गई है। अपना सदस्य टैब देखे |`;
      notify.notify_mr_content = `नवीन ${feeData.feeName} (fee) तयार केली आहे. तुमच्या सदस्याचा टॅब तपासा.`;
      notify.notifySender = department._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      notify.feesId = feeData._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = department._id;
      notify.notifyCategory = "Fee";
      notify.redirectIndex = 5;
      //
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "New Fees",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      //
      await Promise.all([user.save(), notify.save()]);
    }
    //
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      const student = await Student.find({ studentClass: `${classes._id}` });
      for (var ref of student) {
        const new_internal = new InternalFees({});
        new_internal.internal_fee_type = "Fees";
        new_internal.internal_fee_amount = feeData?.feeAmount;
        new_internal.fees = feeData?._id;
        new_internal.internal_fee_reason = feeData?.feeName;
        new_internal.student = ref?._id;
        new_internal.department = department?._id;
        ref.studentRemainingFeeCount += feeData.feeAmount;
        ref.internal_fees_query.push(new_internal?._id);
        await Promise.all([ref.save(), new_internal.save()]);
      }
    }
    // const finance = await Finance.findById({
    //   _id: `${institute.financeDepart[0]}`,
    // });
    //
    var strength = 0;
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] }).select(
        "ApproveStudent"
      );
      strength += classes.ApproveStudent?.length;
    }
    if (strength > 0) {
      finance.financeRaisedBalance += feeData.feeAmount * strength;
      await finance.save();
    } else {
      finance.financeRaisedBalance += feeData.feeAmount * strength;
      await finance.save();
    }
    //
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllInternalFeesQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var finance = await Finance.findById({ _id: fid });
    var all_fees = await Fees.find({ _id: { $in: finance?.fees } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    if (all_fees?.length > 0) {
      res
        .status(200)
        .send({
          message: "Explore All Internal Fees Query ",
          access: true,
          all_fees: all_fees,
        });
    } else {
      res
        .status(200)
        .send({
          message: "No Internal Fees Query",
          access: false,
          all_fees: [],
        });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderManageTabQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    await Finance.findByIdAndUpdate(fid, req?.body);
    res
      .status(200)
      .send({ message: "Explore Available Tabs Queyr", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderValidateStructureQuery = async (req, res) => {
  try {
    const exist_structure = await FeeStructure.find({
      $and: [
        { category_master: `${req.body?.category_master}` },
        { class_master: `${req.body?.class_master}` },
        { batch_master: `${req.body?.batch_master}` },
        { document_update: false}
      ],
    });
    if (exist_structure?.length > 0) {
      res.status(200).send({
        message: "Fee Structure Already Exists",
        access: false,
        avail_struct: exist_structure?.length,
        exist_structure: exist_structure,
      });
    } else {
      res.status(200).send({
        message: "Proceed with new structure",
        access: true,
        avail_struct: 0,
        exist_structure: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceDepartmentQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    const finance = await Finance.findById({ _id: fid });

    var all_department = await Department.find({
      $and: [
        { institute: `${finance?.institute}` },
        { department_status: "Normal" },
      ],
    });

    if (all_department?.length > 0) {
      res
        .status(200)
        .send({
          message: "Explore All Department Query",
          access: true,
          all_department: all_department,
        });
    } else {
      res
        .status(200)
        .send({
          message: "No Department Query",
          access: false,
          all_department: [],
        });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceUploadAllExcelQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Thier is a bug need to fixed immediately",
          access: false,
        });

    const one_finance = await Finance.findById({ _id: fid }).select(
      "mismatch_excel mismatch_excel_count"
    );

    var all_nested_excel = await nested_document_limit(
      one_finance?.mismatch_excel,
      page,
      limit
    );

    if (all_nested_excel?.length > 0) {
      res
        .status(200)
        .send({
          message: "Explore All Mismatch Excel Entries Query",
          access: true,
          all_nested_excel: all_nested_excel,
        });
    } else {
      res
        .status(200)
        .send({
          message: "No Mismatch Excel Entries Found Query",
          access: false,
          all_nested_excel: [],
        });
    }

    res
      .status(200)
      .send({ message: "Explore All Upload Excel Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderValidScholarQuery = async (req, res) => {
  try {
    const { num } = req?.query;
    if (!num)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediatley",
          access: false,
        });

    var valid = await RemainingList.find({
      scholar_ship_number: `${num}`,
    }).select("scholar_ship_number");

    if (valid?.length > 0) {
      res
        .status(200)
        .send({
          message: "Scholarship Number Already Exists",
          access: true,
          count: valid?.length,
          exists: valid,
        });
    } else {
      res
        .status(200)
        .send({
          message: "Add New Scholar Number",
          access: false,
          count: 0,
          exists: [],
        });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneInternalFeesQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var sorted_arr = [];
    const one_fees = await Fees.findById({ _id: fid });

    const all_classes = await Class.find({ _id: { $in: one_fees?.classes } });
    for (var val of all_classes) {
      for (var ele of val?.ApproveStudent) {
        sorted_arr.push(ele);
      }
    }
    var all_students = await Student.find({ _id: { $in: sorted_arr } }).select(
      "studentFirstName studentMiddleName studentLastName photoId valid_full_name studentProfilePhoto studentGRNO studentROLLNO"
    );

    if (all_students?.length > 0) {
      res
        .status(200)
        .send({
          message: "Explore All Students Query",
          access: true,
          all_students: all_students,
          one_fees: one_fees,
        });
    } else {
      res
        .status(200)
        .send({
          message: "No All Students Query",
          access: true,
          all_students: all_students,
        });
    }
  } catch (e) {
    console.log();
  }
};

exports.renderAllMismatchQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const finance = await Finance.findById({ _id: fid });
    const ins_admin = await InstituteAdmin.findById({
      _id: finance?.institute,
    }).select("export_collection");

    var arr = ins_admin?.export_collection?.filter((val) => {
      if (val?.excel_val === "Mismatch_Scholarship") return val;
    });
    var all_excel = await nested_document_limit(page, limit, arr?.reverse());
    if (all_excel?.length > 0) {
      res.status(200).send({
        message: "Explore All Exported Excel",
        access: true,
        all_excel: all_excel,
        count: all_excel?.length,
      });
    } else {
      res.status(200).send({
        message: "No Exported Excel Available",
        access: false,
        all_excel: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const remove_duplicated = (arr) => {
  jsonObject = arr.map(JSON.stringify);
  uniqueSet = new Set(jsonObject);
  uniqueArray = Array.from(uniqueSet).map(JSON.parse);
  return uniqueArray;
};

exports.renderRefreshScholarshipFundsQuery = async (req, res) => {
  try {
    const { did } = req?.body;
    if (!did)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    const depart = await Department.findById({ _id: did });
    var custom_classes = [];
    res
      .status(200)
      .send({ message: "Explore All Scholarship Funds Query", access: true });
    for (var val of depart?.batches) {
      var collect_by_government = 0;
      var pending_from_government = 0;
      var collect_by_government_arr = [];
      var pending_from_government_arr = [];
      var one_batch = await Batch.findById({ _id: `${val}` });
      var classes = await Class.find({ batch: one_batch?._id }).select(
        "className classTitle masterClassName ApproveStudent"
      );
      for (var cls of classes) {
        var all_student = await Student.find({
          $and: [{ _id: { $in: cls?.ApproveStudent } }],
        });
        var structure = await FeeStructure.find({
          $and: [{ department: depart?._id }, { batch_master: one_batch?._id }],
        });
        for (var ref of all_student) {
          var all_remain = await RemainingList.find({
            $and: [
              { student: ref?._id },
              { fee_structure: { $in: structure } },
            ],
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "student",
              select:
                "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO total_paid_fees total_os_fees applicable_os_fees government_os_fees",
            });
          for (var ele of all_remain) {
            collect_by_government += ele?.paid_by_government;
            pending_from_government +=
              ele?.fee_structure?.total_admission_fees -
              ele?.fee_structure?.applicable_fees;

            // if(ele?.paid_by_government > 0){
            //   collect_by_government_arr.push(ele?.student)
            // }
            // if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
            //   pending_from_government_arr.push(ele?.student)
            // }
          }
          // collect_by_government_arr = remove_duplicated(collect_by_government_arr)
          // pending_from_government_arr = remove_duplicated(pending_from_government_arr)
        }
        // }
      }
      custom_classes.push({
        collect_by_government: collect_by_government,
        pending_from_government: pending_from_government,
        // collect_by_government_arr: collect_by_government_arr,
        // pending_from_government_arr: pending_from_government_arr,
        batch: one_batch?.batchName,
        department: depart?.dName,
      });
      one_batch.collect_by_government = collect_by_government;
      one_batch.pending_from_government = pending_from_government;
      await one_batch.save();
      collect_by_government = 0;
      pending_from_government = 0;
      // collect_by_government_arr = []
      // pending_from_government_arr = []
    }
    depart.last_update = new Date();
    await depart.save();
    // if(custom_classes?.length > 0){
    //   res.status(200).send({ message: "Explore All Scholarship Funds Query", access: true, custom_classes: custom_classes})
    // }
    // else{
    //   res.status(200).send({ message: "No Scholarship Funds Query", access: false, custom_classes: []})
    // }
  } catch (e) {
    console.log(e);
  }
};

exports.renderScholarshipFundsQuery = async (req, res) => {
  try {
    const { did } = req?.query;
    if (!did)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    const depart = await Department.findById({ _id: did });
    var custom_classes = [];
    for (var val of depart?.batches) {
      var one_batch = await Batch.findById({ _id: `${val}` });
      custom_classes.push({
        collect_by_government: one_batch?.collect_by_government,
        pending_from_government: one_batch?.pending_from_government,
        batch: one_batch?.batchName,
        department: depart?.dName,
      });
    }
    if (custom_classes?.length > 0) {
      res
        .status(200)
        .send({
          message: "Explore All Scholarship Funds Query",
          access: true,
          custom_classes: custom_classes,
          last_update: depart?.last_update,
        });
    } else {
      res
        .status(200)
        .send({
          message: "No Scholarship Funds Query",
          access: false,
          custom_classes: [],
        });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeStructureCodeQuery = async (req, res) => {
  try {
    // const { fid } = req?.params
    // if (!fid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

    var struct = await FeeStructure.find({});
    var i = 0;
    for (var v of struct) {
      const new_code = generate_random_code_structure();
      v.fee_structure_code = `${new_code}`;
      await v.save();
      console.log(i);
      i += 1;
    }
    res
      .status(200)
      .send({ message: "Explore New Fee Structure Code", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFundsTabSegregationQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    const all_receipt = await FeeReceipt.find({ finance: fid }).select(
      "fee_payment_mode fee_payment_amount"
    );
    var neft = 0;
    var dd = 0;
    var cheque = 0;
    var neb = 0;
    var upi = 0;
    var pg = 0;
    var gs = 0;

    var neft_arr = [];
    var dd_arr = [];
    var cheque_arr = [];
    var neb_arr = [];
    var upi_arr = [];
    var pg_arr = [];
    var gs_arr = [];
    for (var val of all_receipt) {
      if (`${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS") {
        neft += val?.fee_payment_amount;
        // neft_arr.push(val)
      }
      if (`${val?.fee_payment_mode}` === "Demand Draft") {
        dd += val?.fee_payment_amount;
        // dd_arr.push(val)
      }
      if (`${val?.fee_payment_mode}` === "UPI Transfer") {
        upi += val?.fee_payment_amount;
        // upi_arr.push(val)
      }
      if (`${val?.fee_payment_mode}` === "Payment Gateway / Online") {
        pg += val?.fee_payment_amount;
        // pg_arr.push(val)
      }
      if (`${val?.fee_payment_mode}` === "Net Banking") {
        neb += val?.fee_payment_amount;
        // neb_arr.push(val)
      }
      if (`${val?.fee_payment_mode}` === "Cheque") {
        cheque += val?.fee_payment_amount;
        // cheque_arr.push(val)
      }
      if (`${val?.fee_payment_mode}` === "Government/Scholarship") {
        gs += val?.fee_payment_amount;
        // gs_arr.push(val)
      }
    }
    res.status(200).send({
      message: "Explore Funds Tab Segregation Query",
      access: true,
      neft,
      dd,
      cheque,
      neb,
      upi,
      pg,
      gs,
      neft_arr,
      dd_arr,
      cheque_arr,
      neb_arr,
      upi_arr,
      pg_arr,
      gs_arr,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_mark_society_head_query = async (req, res) => {
  try {
    const { fsid } = req?.params;
    const { flow, fhid, status } = req?.body;
    if (!fsid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var struct = await FeeStructure.findById({ _id: fsid });
    if (flow === "APPLICABLE") {
      var apps = [];
      for (let ele of struct?.applicable_fees_heads) {
        if (`${ele?._id}` === `${fhid}`) {
          ele.is_society = status;
          apps.push(ele);
          struct?.applicable_fees_heads?.pull(ele?._id);
        }
      }
      for (let val of apps) {
        struct.applicable_fees_heads.unshift({
          head_name: val?.head_name,
          head_amount: val?.head_amount,
          master: val?.master,
          created_at: val?.created_at,
          is_society: val?.is_society,
          _id: val?._id,
        });
      }
    } else if (flow === "GOVERNMENT") {
      var govs = [];
      for (let ele of struct?.government_fees_heads) {
        if (`${ele?._id}` === `${fhid}`) {
          ele.is_society = status;
          govs.push(ele);
          struct?.government_fees_heads?.pull(ele?._id);
        }
      }
      for (let val of govs) {
        struct.government_fees_heads.unshift({
          head_name: val?.head_name,
          head_amount: val?.head_amount,
          master: val?.master,
          created_at: val?.created_at,
          is_society: val?.is_society,
          _id: val?._id,
        });
      }
    }
    await struct.save();
    res
      .status(200)
      .send({ message: `${flow} wise society heads updated`, access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_control_receipt_query = async (req, res) => {
  try {
    const { fid } = req?.params;
    const { show_receipt } = req?.body;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    const finance = await Finance.findById({ _id: fid }).select("show_receipt");

    finance.show_receipt = show_receipt ? show_receipt : finance.show_receipt;
    await finance.save();
    res
      .status(200)
      .send({ message: "Explore Fees Receipt type Wise", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewOtherFeesQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    const { heads, students, struct, is_collect, mode, other_fees_name } =
      req?.body;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var finance = await Finance.findById({ _id: fid });
    var institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    var o_f = new OtherFees({ ...req?.body });
    if (req?.body?.other_fees_type === "Normal") {
      o_f.other_fees_disable = "Disable";
    }
    if (heads?.length > 0) {
      for (let ele of heads) {
        o_f.fees_heads.push({
          head_name: ele?.head_name,
          head_amount: ele?.head_amount,
          master: ele?.master,
          is_society: false,
        });
        o_f.other_fees_name = other_fees_name;
      }
    } else if (struct) {
      const structure = await FeeStructure.findById({ _id: struct });
      o_f.fee_structure = structure?._id;
      for (let ele of structure?.applicable_fees_heads) {
        o_f.fees_heads.push({
          head_name: ele?.head_name,
          head_amount: ele?.head_amount,
          master: ele?.master,
          is_society: ele?.is_society,
        });
        o_f.other_fees_name = other_fees_name;
      }
    }
    if (is_collect === "Yes") {
      if (students?.length <= 1) {
        for (let ele of students) {
          const stu = await Student.findById({ _id: `${ele}` });
          const user = await User.findById({ _id: `${stu?.user}` });
          stu.other_fees_paid_price += o_f?.payable_amount;
          o_f.students.push(stu?._id);
          o_f.paid_students.push(stu?._id);
          o_f.status = "Paid";
          o_f.student_count += 1;
          // o_f.remaining_students.push(stu?._id)
          for (let val of o_f?.fees_heads) {
            const nums = await FeeMaster.findById({ _id: `${val?.master}` });
            nums.paid_student.push(stu?._id);
            nums.paid_student_count += 1;
            val.paid_amount += o_f?.payable_amount;
            await nums.save();
          }
          const new_receipt = new FeeReceipt({ ...req.body });
          const order = new OrderPayment({ ...req?.body });
          new_receipt.student = stu?._id;
          new_receipt.fee_structure = struct;
          new_receipt.fee_transaction_date = new Date(
            `${req.body.transaction_date}`
          );
          new_receipt.other_fees = o_f?._id;
          new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
          new_receipt.finance = finance?._id;
          new_receipt.receipt_status = "Already Generated";
          order.payment_module_type = "Other Fees";
          order.payment_to_end_user_id = institute?._id;
          order.payment_by_end_user_id = user._id;
          order.payment_module_id = o_f._id;
          order.payment_amount = o_f?.payable_amount;
          order.payment_status = "Captured";
          order.payment_flag_to = "Credit";
          order.payment_flag_by = "Debit";
          order.payment_mode = mode;
          order.payment_other_fees = o_f._id;
          order.payment_from = stu._id;
          order.payment_student = stu?._id;
          order.payment_student_name = stu?.valid_full_name;
          order.payment_student_gr = stu?.studentGRNO;
          order.fee_receipt = new_receipt?._id;
          fee_receipt_count_query(institute, new_receipt, order);
          stu.other_fees.push({
            fees: o_f?._id,
            fee_receipt: new_receipt?._id,
            status: "Paid",
          });
          for (let ele of o_f?.fees_heads) {
            new_receipt.fee_heads.push({
              head_id: ele?._id,
              head_name: ele?.head_name,
              paid_fee: ele?.head_amount,
              applicable_fee: ele?.head_amount,
              remain_fee: new_receipt?.fee_payment_amount - ele?.head_amount,
              fee_structure: o_f?.fee_structure ?? null,
              master: ele?.master,
              original_paid: new_receipt?.fee_payment_amount,
              is_society: ele?.is_society,
            });
          }
          user.payment_history.push(order._id);
          institute.payment_history.push(order._id);
          await Promise.all([
            stu.save(),
            user.save(),
            institute.save(),
            new_receipt.save(),
            order.save(),
          ]);
          await studentOtherFeeReceipt(new_receipt?._id, institute?._id);
        }
      } else {
        if (students?.length > 1) {
          for (let ele of students) {
            const stu = await Student.findById({ _id: `${ele}` });
            const user = await User.findById({ _id: `${stu?.user}` });
            stu.other_fees.push({
              fees: o_f?._id,
            });
            stu.other_fees_remain_price += o_f?.payable_amount;
            o_f.students.push(stu?._id);
            o_f.student_count += 1;
            o_f.remaining_students.push(stu?._id);
            const notify = new StudentNotification({});
            notify.notifyContent = `Hi ${stu?.studentFirstName} ${
              stu?.studentMiddleName ?? stu?.studentFatherName
            } ${stu?.studentLastName},

Your chosen subject ${
              o_f?.other_fees_name
            } is now available for you to confirm.. Please pay the required fees through the Qviple app within the next two days. If the payment is not made within this period, your seat will be offered to other students.

To pay your fees, please follow these steps:
1. Update the Qviple App to the latest version.
2. On the home page, you will find the "Your Fees" tab below your name.
3. Open the "Your Fees" tab.
4. You will see three menus: Admission Fees, Department Fees, and Other Fees.
5. Navigate to "Other Fees."
6. From the "Other Fees" section, you can pay the fees for your additional subject of choice.

Note: Do not close the app from the background during payment. If you accidentally close the app, your fee receipt will not be generated. Please send a screenshot of your fee payment transaction to Qviple Helpdesk for support.

Thank you.


Do Not Click on the link below (clicking it may prevent further emails from being delivered to you).`;
            notify.notifySender = finance?.financeHead;
            notify.notifyReceiever = user?._id;
            notify.notifyType = "Student";
            notify.notifyPublisher = stu?._id;
            user.activity_tab.push(notify?._id);
            notify.notifyByFinancePhoto = finance?._id;
            notify.notifyCategory = "Online Other Fee";
            notify.redirectIndex = 49;
            await Promise.all([stu.save(), user.save(), notify.save()]);
            if (stu?.studentEmail) {
              let name = `${stu?.studentFirstName} ${
                stu?.studentMiddleName ?? stu?.studentFatherName
              } ${stu?.studentLastName}`;
              email_sms_designation_other_fees_apply(
                stu?.studentEmail,
                name,
                o_f?.other_fees_name
              );
            }
          }
        }
      }
    } else {
      if (students?.length > 1) {
        for (let ele of students) {
          const stu = await Student.findById({ _id: `${ele}` });
          const user = await User.findById({ _id: `${stu?.user}` });
          stu.other_fees.push({
            fees: o_f?._id,
          });
          stu.other_fees_remain_price += o_f?.payable_amount;
          o_f.students.push(stu?._id);
          o_f.student_count += 1;
          o_f.remaining_students.push(stu?._id);
          const notify = new StudentNotification({});
          notify.notifyContent = `Hi ${stu?.studentFirstName} ${
            stu?.studentMiddleName ?? stu?.studentFatherName
          } ${stu?.studentLastName},

Your chosen subject ${
            o_f?.other_fees_name
          } is now available for you to confirm.. Please pay the required fees through the Qviple app within the next two days. If the payment is not made within this period, your seat will be offered to other students.

To pay your fees, please follow these steps:
1. Update the Qviple App to the latest version.
2. On the home page, you will find the "Your Fees" tab below your name.
3. Open the "Your Fees" tab.
4. You will see three menus: Admission Fees, Department Fees, and Other Fees.
5. Navigate to "Other Fees."
6. From the "Other Fees" section, you can pay the fees for your additional subject of choice.

Note: Do not close the app from the background during payment. If you accidentally close the app, your fee receipt will not be generated. Please send a screenshot of your fee payment transaction to Qviple Helpdesk for support.

Thank you.


Do Not Click on the link below (clicking it may prevent further emails from being delivered to you).`;
          notify.notifySender = finance?.financeHead;
          notify.notifyReceiever = user?._id;
          notify.notifyType = "Student";
          notify.notifyPublisher = stu?._id;
          user.activity_tab.push(notify?._id);
          notify.notifyByFinancePhoto = finance?._id;
          notify.notifyCategory = "Online Other Fee";
          notify.redirectIndex = 49;
          await Promise.all([stu.save(), user.save(), notify.save()]);
          if (stu?.studentEmail) {
            let name = `${stu?.studentFirstName} ${
              stu?.studentMiddleName ?? stu?.studentFatherName
            } ${stu?.studentLastName}`;
            email_sms_designation_other_fees_apply(
              stu?.studentEmail,
              name,
              o_f?.other_fees_name
            );
          }
        }
      } else {
        if (students?.length <= 1) {
          for (let ele of students) {
            const stu = await Student.findById({ _id: `${ele}` });
            const user = await User.findById({ _id: `${stu?.user}` });
            stu.other_fees.push({
              fees: o_f?._id,
            });
            stu.other_fees_remain_price += o_f?.payable_amount;
            o_f.students.push(stu?._id);
            o_f.student_count += 1;
            o_f.remaining_students.push(stu?._id);
            const notify = new StudentNotification({});
            notify.notifyContent = `Hi ${stu?.studentFirstName} ${
              stu?.studentMiddleName ?? stu?.studentFatherName
            } ${stu?.studentLastName},

Your chosen subject ${
              o_f?.other_fees_name
            } is now available for you to confirm.. Please pay the required fees through the Qviple app within the next two days. If the payment is not made within this period, your seat will be offered to other students.

To pay your fees, please follow these steps:
1. Update the Qviple App to the latest version.
2. On the home page, you will find the "Your Fees" tab below your name.
3. Open the "Your Fees" tab.
4. You will see three menus: Admission Fees, Department Fees, and Other Fees.
5. Navigate to "Other Fees."
6. From the "Other Fees" section, you can pay the fees for your additional subject of choice.

Note: Do not close the app from the background during payment. If you accidentally close the app, your fee receipt will not be generated. Please send a screenshot of your fee payment transaction to Qviple Helpdesk for support.

Thank you.


Do Not Click on the link below (clicking it may prevent further emails from being delivered to you).`;
            notify.notifySender = finance?.financeHead;
            notify.notifyReceiever = user?._id;
            notify.notifyType = "Student";
            notify.notifyPublisher = stu?._id;
            user.activity_tab.push(notify?._id);
            notify.notifyByFinancePhoto = finance?._id;
            notify.notifyCategory = "Online Other Fee";
            notify.redirectIndex = 49;
            await Promise.all([stu.save(), user.save(), notify.save()]);
            if (stu?.studentEmail) {
              let name = `${stu?.studentFirstName} ${
                stu?.studentMiddleName ?? stu?.studentFatherName
              } ${stu?.studentLastName}`;
              email_sms_designation_other_fees_apply(
                stu?.studentEmail,
                name,
                o_f?.other_fees_name
              );
            }
          }
        }
      }
    }
    finance.other_fees.push(o_f?._id);
    o_f.finance = finance?._id;
    await Promise.all([finance.save(), o_f.save()]);
    res
      .status(200)
      .send({ message: "Explore New Other Fees Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewOtherFeesNonExistingQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    const {
      heads,
      students,
      struct,
      is_collect,
      mode,
      student_name,
      other_fees_name,
    } = req?.body;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var finance = await Finance.findById({ _id: fid });
    var institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    var o_f = new OtherFees({ ...req?.body });
    if (req?.body?.other_fees_type === "Normal") {
      o_f.other_fees_disable = "Disable";
    }
    if (heads?.length > 0) {
      for (let ele of heads) {
        o_f.fees_heads.push({
          head_name: ele?.head_name,
          head_amount: ele?.head_amount,
          master: ele?.master,
          is_society: false,
        });
        o_f.other_fees_name = other_fees_name;
      }
    } else if (struct) {
      const structure = await FeeStructure.findById({ _id: struct });
      o_f.fee_structure = structure?._id;
      for (let ele of structure?.applicable_fees_heads) {
        o_f.fees_heads.push({
          head_name: ele?.head_name,
          head_amount: ele?.head_amount,
          master: ele?.master,
          is_society: ele?.is_society,
        });
        o_f.other_fees_name = other_fees_name;
      }
    }
    if (is_collect === "Yes") {
      // for (let ele of students) {
      // const stu = await Student.findById({ _id: `${ele}` })
      // const user = await User.findById({ _id: `${stu?.user}` })
      // stu.other_fees_paid_price += o_f?.payable_amount
      o_f.students_list.push(student_name);
      // o_f.paid_students.push(stu?._id)
      o_f.status = "Paid";
      o_f.student_count += 1;
      for (let val of o_f?.fees_heads) {
        val.paid_amount += o_f?.payable_amount;
      }
      const new_receipt = new FeeReceipt({ ...req.body });
      const order = new OrderPayment({ ...req?.body });
      new_receipt.student_name = student_name;
      new_receipt.fee_structure = struct;
      new_receipt.fee_transaction_date = new Date(
        `${req.body.transaction_date}`
      );
      new_receipt.other_fees = o_f?._id;
      new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
      new_receipt.finance = finance?._id;
      new_receipt.receipt_status = "Already Generated";
      order.payment_module_type = "Other Fees";
      order.payment_to_end_user_id = institute?._id;
      // order.payment_by_end_user_id = user._id;
      order.payment_module_id = o_f._id;
      order.payment_amount = o_f?.payable_amount;
      order.payment_status = "Captured";
      order.payment_flag_to = "Credit";
      order.payment_flag_by = "Debit";
      order.payment_mode = mode;
      order.payment_other_fees = o_f._id;
      // order.payment_from = stu._id;
      // order.payment_student = stu?._id;
      order.payment_student_name = student_name;
      order.payment_student_gr = "";
      order.fee_receipt = new_receipt?._id;
      fee_receipt_count_query(institute, new_receipt, order);
      // stu.other_fees.push({
      //   fees: o_f?._id,
      //   fee_receipt: new_receipt?._id,
      //   status: "Paid"
      // })
      for (let ele of o_f?.fees_heads) {
        new_receipt.fee_heads.push({
          head_id: ele?._id,
          head_name: ele?.head_name,
          paid_fee: ele?.head_amount,
          applicable_fee: ele?.head_amount,
          remain_fee: new_receipt?.fee_payment_amount - ele?.head_amount,
          fee_structure: o_f?.fee_structure ?? null,
          master: ele?.master,
          original_paid: new_receipt?.fee_payment_amount,
          is_society: ele?.is_society,
        });
      }
      o_f.fee_receipt = new_receipt?._id;
      // user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      await Promise.all([institute.save(), new_receipt.save(), order.save()]);
      await studentOtherFeeReceipt(new_receipt?._id, institute?._id);

      // }
    }
    finance.other_fees.push(o_f?._id);
    o_f.finance = finance?._id;
    await Promise.all([finance.save(), o_f.save()]);
    res
      .status(200)
      .send({ message: "Explore New Other Fees Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllOtherFeesQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { type } = req?.query;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var finance = await Finance.findById({ _id: fid });
    var all_of = await OtherFees.find({
      $and: [{ _id: { $in: finance?.other_fees } }, { other_fees_type: type }],
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .select(
        "other_fees_name other_fees_type payable_amount student_count student_name students_list paid_students_count remaining_students_count paid_students"
      )
      .populate({
        path: "bank_account",
        select:
          "finance_bank_account_number finance_bank_name finance_bank_account_name",
      })
      .populate({
        path: "fee_receipt",
        select: "receipt_file",
      })
      .populate({
        path: "fee_structure",
      });

    for (let ele of all_of) {
      ele.paid_students_count = ele?.paid_students?.length;
      ele.remaining_students_count = ele?.student_count;
    }
    res
      .status(200)
      .send({
        message: "Explore All Other Fees Query",
        access: true,
        all_of: all_of,
      });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneOtherFeesStudentListQuery = async (req, res) => {
  try {
    const { ofid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { type } = req?.query;
    if (!ofid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var one_of = await OtherFees.findById({ _id: ofid });
    var all_student = await Student.find({ _id: { $in: one_of?.students } })
      .limit(limit)
      .skip(skip)
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO studentROLLNO qviple_student_pay_id other_fees_remain_price other_fees_obj other_fees_paid_price"
      )
      .populate({
        path: "other_fees",
        populate: {
          path: "fee_receipt fees",
          select: "receipt_file fee_payment_amount payable_amount",
        },
      });
    for (let ele of all_student) {
      for (let val of ele?.other_fees) {
        if (`${val?.fees?._id}` === `${one_of?._id}` && val?.fee_receipt) {
          ele.other_fees_obj.status = "Paid";
          ele.other_fees_obj.receipt_file = val?.fee_receipt?.receipt_file;
          ele.other_fees_obj.price = val?.fee_receipt?.fee_payment_amount;
        } else if (`${val?.fees?._id}` === `${one_of?._id}`) {
          ele.other_fees_obj.status = val?.status;
          ele.other_fees_obj.price = val?.fees?.payable_amount;
        }
      }
    }
    res
      .status(200)
      .send({
        message: "Explore One Other Fees Remaining Student List Query",
        access: true,
        all_student: all_student,
      });
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_other_fees_edit_query = async (req, res) => {
  try {
    const { ofid } = req?.params;
    if (!ofid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    await OtherFees.findByIdAndUpdate(ofid, req?.body);
    res
      .status(200)
      .send({ message: "Explore One Other Fees Update Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_student_all_fees = async (req, res) => {
  try {
    const { sid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    const student = await Student.findById({ _id: sid }).populate({
      path: "other_fees",
      populate: {
        path: "fees fee_receipt",
        populate: {
          path: "finance",
          select: "institute",
        },
      },
    });
    const all_fees = await nested_document_limit(
      page,
      limit,
      student?.other_fees
    );
    res
      .status(200)
      .send({
        message: "Explore One Student All Fees Query",
        access: true,
        all_fees: all_fees,
      });
  } catch (e) {
    console.log(e);
  }
};

exports.render_mark_society_head_existed = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var all_struct = await FeeStructure.find({ $and: [{ finance: fid }] });
    for (let stu of all_struct) {
      var apps = [];
      for (let ele of stu?.applicable_fees_heads) {
        if (ele?.is_society) {
          apps.push(ele);
          stu?.applicable_fees_heads?.pull(ele?._id);
        }
      }
      for (let val of apps) {
        stu.applicable_fees_heads.unshift({
          head_name: val?.head_name,
          head_amount: val?.head_amount,
          master: val?.master,
          created_at: val?.created_at,
          is_society: val?.is_society,
          _id: val?._id,
        });
      }
      // console.log(apps?.length)
      // apps = []
      await stu.save();
    }
    res
      .status(200)
      .send({
        message: `wise society heads updated`,
        access: true,
        all_struct: all_struct,
        count: all_struct?.length,
      });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAllFeeStructure = async (req, res) => {
  try {
    const { fid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    const finance = await Finance.findById({ _id: fid });
    if (search) {
      const all_struct = await FeeStructure.find({
        $and: [{ finance: finance?._id }],
        $or: [{ structure_name: { $regex: `${search}`, $options: "i" } }],
      }).select(
        "structure_name unique_structure_name applicable_fees total_installments total_admission_fees fee_structure_code"
      );
      res
        .status(200)
        .send({
          message: "Explore All Fee Structure",
          access: true,
          all_struct: all_struct,
        });
    } else {
      const all_struct = await FeeStructure.find({
        $and: [{ finance: finance?._id }],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "structure_name unique_structure_name applicable_fees total_installments total_admission_fees fee_structure_code"
        );
      res
        .status(200)
        .send({
          message: "Explore All Fee Structure",
          access: true,
          all_struct: all_struct,
        });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneOtherFeeReceipt = async (req, res) => {
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
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price studentCastCategory active_society_fee_heads studentClass studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price studentCastCategory active_society_fee_heads studentClass studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price  studentCastCategory active_society_fee_heads studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "finance",
        select: "financeHead show_receipt institute",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price studentCastCategory student_bed_number active_society_fee_heads studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "other_fees",
        populate: {
          path: "fee_structure",
          select:
            "category_master structure_name unique_structure_name department batch_master applicable_fees class_master structure_month",
          populate: {
            path: "category_master class_master batch_master department",
            select: "category_name className batchName dName",
          },
        },
      })
      .populate({
        path: "order_history",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price studentCastCategory active_society_fee_heads studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      });

    if (receipt?.other_fees?.fee_structure?._id) {
      var one_account = await BankAccount.findOne({
        departments: { $in: receipt?.other_fees?.fee_structure?.department },
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    }
    if (receipt?.finance?.show_receipt === "Normal") {
      receipt.fee_heads = [...receipt?.fee_heads];
    } else if (receipt?.finance?.show_receipt === "Society") {
      receipt.fee_heads = receipt?.fee_heads?.filter((qwe) => {
        if (!qwe?.is_society) {
          return qwe;
        } else {
          receipt.student.active_society_fee_heads.push(qwe);
          return null;
        }
      });
      receipt.fee_heads = [...receipt?.fee_heads];
    }
    const qviple_id = await QvipleId.findOne({ user: receipt?.student?.user });

    const obj = {
      message: "Come up with Tea and Snacks",
      access: true,
      receipt: receipt,
      one_account: one_account,
      qviple_id: qviple_id,
    };
    if (receipt?.finance?.show_receipt === "Normal") {
      // const obj_nums = await generateFeeReceipt(receipt?._id)
      // await admissionFeeReceipt(receipt?._id, receipt?.application?._id)
    } else if (receipt?.finance?.show_receipt === "Society") {
      // await societyAdmissionFeeReceipt(receipt?._id,receipt?.finance?.institute)
    }
    const all_encrypt = await encryptionPayload(obj);
    res.status(200).send({ encrypt: obj });
  } catch (e) {
    console.log(e);
  }
};

exports.all_email_student_query = async (req, res) => {
  try {
    const finance = await Finance.findById({ _id: "66694a14ca43f4f89fb5f464" });
    const all_of = await OtherFees.find({ finance: finance?._id });
    var i = 0;
    for (let o_f of all_of) {
      for (let val of o_f?.students) {
        const stu = await Student.findById({ _id: `${val}` });
        const user = await User.findById({ _id: `${stu?.user}` });
        const notify = new StudentNotification({});
        notify.notifyContent = `Hi ${stu?.studentFirstName} ${
          stu?.studentMiddleName ?? stu?.studentFatherName
        } ${stu?.studentLastName},

Your chosen subject ${
          o_f?.other_fees_name
        } is now available for you to confirm.. Please pay the required fees through the Qviple app within the next two days. If the payment is not made within this period, your seat will be offered to other students.

To pay your fees, please follow these steps:
1. Update the Qviple App to the latest version.
2. On the home page, you will find the "Your Fees" tab below your name.
3. Open the "Your Fees" tab.
4. You will see three menus: Admission Fees, Department Fees, and Other Fees.
5. Navigate to "Other Fees."
6. From the "Other Fees" section, you can pay the fees for your additional subject of choice.

Note: Do not close the app from the background during payment. If you accidentally close the app, your fee receipt will not be generated. Please send a screenshot of your fee payment transaction to Qviple Helpdesk for support.

Thank you.


Do Not Click on the link below (clicking it may prevent further emails from being delivered to you).`;
        notify.notifySender = finance?.financeHead;
        notify.notifyReceiever = user?._id;
        notify.notifyType = "Student";
        notify.notifyPublisher = stu?._id;
        user.activity_tab.push(notify?._id);
        notify.notifyByFinancePhoto = finance?._id;
        notify.notifyCategory = "Online Other Fee";
        notify.redirectIndex = 49;
        await Promise.all([stu.save(), user.save(), notify.save()]);
        if (stu?.studentEmail) {
          let name = `${stu?.studentFirstName} ${
            stu?.studentMiddleName ?? stu?.studentFatherName
          } ${stu?.studentLastName}`;
          email_sms_designation_other_fees_apply(
            stu?.studentEmail,
            name,
            o_f?.other_fees_name
          );
        }
        console.log(i);
        i += 1;
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOtherFeesCollectQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    const { sid, mode, ofid } = req?.body;
    if (!fid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var finance = await Finance.findById({ _id: fid });
    var institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    var o_f = await OtherFees.findById({ _id: ofid });
    const stu = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${stu?.user}` });
    stu.other_fees_paid_price += o_f?.payable_amount;
    o_f.paid_students.push(stu?._id);
    o_f.status = "Paid";
    if (stu.other_fees_remain_price >= o_f?.payable_amount) {
      stu.other_fees_remain_price -= o_f?.payable_amount;
    }
    for (var ref of o_f?.remaining_students) {
      if (`${ref}` === `${stu?._id}`) {
        o_f?.remaining_students?.pull(stu?._id);
      }
    }
    // o_f.remaining_students.push(stu?._id)
    for (let val of o_f?.fees_heads) {
      const nums = await FeeMaster.findById({ _id: `${val?.master}` });
      nums.paid_student.push(stu?._id);
      nums.paid_student_count += 1;
      val.paid_amount += o_f?.payable_amount;
      await nums.save();
    }
    const new_receipt = new FeeReceipt({ ...req.body });
    const order = new OrderPayment({ ...req?.body });
    new_receipt.student = stu?._id;
    new_receipt.fee_structure = o_f?.fee_structure;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.other_fees = o_f?._id;
    new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
    new_receipt.finance = finance?._id;
    new_receipt.receipt_status = "Already Generated";
    order.payment_module_type = "Other Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = o_f._id;
    order.payment_amount = o_f?.payable_amount;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_other_fees = o_f._id;
    order.payment_from = stu._id;
    order.payment_student = stu?._id;
    order.payment_student_name = stu?.valid_full_name;
    order.payment_student_gr = stu?.studentGRNO;
    order.fee_receipt = new_receipt?._id;
    fee_receipt_count_query(institute, new_receipt, order);
    for (let ele of stu?.other_fees) {
      if (`${ele?.fees}` === `${o_f?._id}`) {
        ele.fee_receipt = new_receipt?._id;
        ele.status = "Paid";
      }
    }
    for (let ele of o_f?.fees_heads) {
      new_receipt.fee_heads.push({
        head_id: ele?._id,
        head_name: ele?.head_name,
        paid_fee: ele?.head_amount,
        applicable_fee: ele?.head_amount,
        remain_fee: new_receipt?.fee_payment_amount - ele?.head_amount,
        fee_structure: o_f?.fee_structure ?? null,
        master: ele?.master,
        original_paid: new_receipt?.fee_payment_amount,
        is_society: ele?.is_society,
      });
    }
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    await Promise.all([
      stu.save(),
      user.save(),
      institute.save(),
      new_receipt.save(),
      order.save(),
    ]);
    await studentOtherFeeReceipt(new_receipt?._id, institute?._id);
    await Promise.all([finance.save(), o_f.save()]);
    res
      .status(200)
      .send({ message: "Explore New Other Fees Collect Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.deleteFeesQuery = async (req, res) => {
  try {
    const all_student = await Student.find({
      $and: [
        { institute: "6669446aca43f4f89fb5d6b7" },
        { other_fees_remain_price: { $gt: 0 } },
      ],
    })
      .select(
        "studentFirstName studentFatherName studentLastName other_fees other_fees_paid_price other_fees_remain_price"
      )
      .populate({
        path: "other_fees.fees",
        select: "other_fees_name student_count",
      });
    var i = 0;
    var nums = [];
    for (let val of all_student) {
      for (let ele of val?.other_fees) {
        if (ele?.fees) {
        } else {
          val.other_fees.pull(ele?._id);
          nums.push({
            cd: val,
            _id: ele,
          });
        }
      }
      await val.save();
      console.log(i);
      i += 1;
    }
    res.status(200).send({ message: "Delete Fees Query", access: true, nums });
  } catch (e) {
    console.log(e);
  }
}

exports.renderNewOtherFeesAddStudentQuery = async (req, res) => {
  try {
    const { fid } = req?.params
    const { students, ofid } = req?.body
    if (!fid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var finance = await Finance.findById({ _id: fid })
    var o_f = await OtherFees.findById({ _id: ofid })
      if (students?.length > 0) {
        for (let ele of students) {
          const stu = await Student.findById({ _id: `${ele}` })
          const user = await User.findById({ _id: `${stu?.user}`})
          stu.other_fees.push({
            fees: o_f?._id,
          })
          stu.other_fees_remain_price += o_f?.payable_amount
          o_f.students.push(stu?._id)
          o_f.student_count += 1
          o_f.remaining_students.push(stu?._id)
          const notify = new StudentNotification({});
          notify.notifyContent = `Hi ${stu?.studentFirstName} ${stu?.studentMiddleName ?? stu?.studentFatherName} ${stu?.studentLastName},

Your chosen subject ${o_f?.other_fees_name} is now available for you to confirm.. Please pay the required fees through the Qviple app within the next two days. If the payment is not made within this period, your seat will be offered to other students.

To pay your fees, please follow these steps:
1. Update the Qviple App to the latest version.
2. On the home page, you will find the "Your Fees" tab below your name.
3. Open the "Your Fees" tab.
4. You will see three menus: Admission Fees, Department Fees, and Other Fees.
5. Navigate to "Other Fees."
6. From the "Other Fees" section, you can pay the fees for your additional subject of choice.

Note: Do not close the app from the background during payment. If you accidentally close the app, your fee receipt will not be generated. Please send a screenshot of your fee payment transaction to Qviple Helpdesk for support.

Thank you.


Do Not Click on the link below (clicking it may prevent further emails from being delivered to you).`;
      notify.notifySender = finance?.financeHead;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = stu?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByFinancePhoto = finance?._id;
      notify.notifyCategory = "Online Other Fee";
      notify.redirectIndex = 49;
            await Promise.all([stu.save(), user.save(), notify.save()])
            if (stu?.studentEmail) {
              let name = `${stu?.studentFirstName} ${stu?.studentMiddleName ?? stu?.studentFatherName} ${stu?.studentLastName}`
              email_sms_designation_other_fees_apply(stu?.studentEmail, name, o_f?.other_fees_name)
            }
        }
      }
    await o_f.save()
    res.status(200).send({ message: "Explore New Student In Other Fees Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.renderExistNonOtherFeesAddStudentQuery = async (req, res) => {
  try {
    const { fid } = req?.params
    const { student_name, ofid, classes, batch, roll_no, mode } = req?.body
    if (!fid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var finance = await Finance.findById({ _id: fid })
    const institute = await InstituteAdmin.findById({ _id: finance?.institute})
    var o_f = await OtherFees.findById({ _id: ofid })
      o_f.students_list.push(student_name);
      o_f.status = "Paid";
      o_f.student_count += 1;
      for (let val of o_f?.fees_heads) {
        val.paid_amount += o_f?.payable_amount;
      }
      const new_receipt = new FeeReceipt({ ...req.body });
      const order = new OrderPayment({ ...req?.body });
      new_receipt.student_name = student_name;
      new_receipt.fee_structure = o_f?.fee_structure;
      new_receipt.fee_transaction_date = new Date(
        `${req.body.transaction_date}`
      );
      new_receipt.other_fees = o_f?._id;
      new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
      new_receipt.finance = finance?._id;
      new_receipt.receipt_status = "Already Generated";
      order.payment_module_type = "Other Fees";
      order.payment_to_end_user_id = institute?._id;
      order.payment_module_id = o_f._id;
      order.payment_amount = o_f?.payable_amount;
      order.payment_status = "Captured";
      order.payment_flag_to = "Credit";
      order.payment_flag_by = "Debit";
      order.payment_mode = mode;
      order.payment_other_fees = o_f._id;
      order.payment_student_name = student_name;
      order.payment_student_detail.classes = classes ?? ""
      order.payment_student_detail.batch = batch ?? ""
      order.payment_student_detail.roll_no = roll_no ?? ""
      order.payment_student_gr = "";
      order.fee_receipt = new_receipt?._id;
      fee_receipt_count_query(institute, new_receipt, order);
      for (let ele of o_f?.fees_heads) {
        new_receipt.fee_heads.push({
          head_id: ele?._id,
          head_name: ele?.head_name,
          paid_fee: ele?.head_amount,
          applicable_fee: ele?.head_amount,
          remain_fee: new_receipt?.fee_payment_amount - ele?.head_amount,
          fee_structure: o_f?.fee_structure ?? null,
          master: ele?.master,
          original_paid: new_receipt?.fee_payment_amount,
          is_society: ele?.is_society,
        });
      }
      o_f.fee_receipt = new_receipt?._id;
      institute.payment_history.push(order._id);
      o_f.fee_receipt_student.push({
        student: student_name,
        classes: classes,
        batch: batch,
        roll_no: roll_no,
        fee_receipt: new_receipt?._id
      })
      await Promise.all([institute.save(), new_receipt.save(), order.save()]);
      await studentOtherFeeReceipt(new_receipt?._id, institute?._id);
    await o_f.save()
    res.status(200).send({ message: "Explore New Student In Other Non-Existing Fees Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.renderNewOtherFeesRemoveStudentQuery = async (req, res) => {
  try {
    const { ofid } = req?.params
    const { students } = req?.body
    if (!ofid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var message;
    var o_f = await OtherFees.findById({ _id: ofid })
      if (students?.length > 0) {
        for (let ele of students) {
          const stu = await Student.findById({ _id: `${ele}` })
          for (let val of stu?.other_fees) {
            if (val?.fee_receipt) {
              message = "Removal of Student Denied. Due To Valid Fee Receipt Exist"
            }
            else {
              if (`${val?.fees}` === `${o_f?._id}`) {
                stu.other_fees.pull(val?._id)
                if (stu.other_fees_remain_price >= o_f?.payable_amount) {
                  stu.other_fees_remain_price -= o_f?.payable_amount
                }
                message = "Removal of Student Successfully."
              }
            }
          }
          o_f.students.pull(stu?._id)
          if (o_f.student_count > 0) {
            o_f.student_count -= 1
          }
          o_f.remaining_students.pull(stu?._id)
          await stu.save()
        }
      }
    await o_f.save()
    res.status(200).send({ message: message, access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.renderNewOneOtherFeesAddStudentQuery = async (req, res) => {
  try {
    const { fid } = req?.params
    const { students, ofid, mode } = req?.body
    if (!fid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var finance = await Finance.findById({ _id: fid })
    const institute = await InstituteAdmin.findById({ _id: finance?.institute})
    var o_f = await OtherFees.findById({ _id: ofid })
      if (students?.length <= 1) {
        for (let ele of students) {
          const stu = await Student.findById({ _id: `${ele}` });
          const user = await User.findById({ _id: `${stu?.user}` });
          stu.other_fees_paid_price += o_f?.payable_amount;
          o_f.students.push(stu?._id);
          o_f.paid_students.push(stu?._id);
          o_f.status = "Paid";
          o_f.student_count += 1;
          // o_f.remaining_students.push(stu?._id)
          for (let val of o_f?.fees_heads) {
            const nums = await FeeMaster.findById({ _id: `${val?.master}` });
            nums.paid_student.push(stu?._id);
            nums.paid_student_count += 1;
            val.paid_amount += o_f?.payable_amount;
            await nums.save();
          }
          const new_receipt = new FeeReceipt({ ...req.body });
          const order = new OrderPayment({ ...req?.body });
          new_receipt.student = stu?._id;
          new_receipt.fee_structure = o_f?.fee_structure;
          new_receipt.fee_transaction_date = new Date(
            `${req.body.transaction_date}`
          );
          new_receipt.other_fees = o_f?._id;
          new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
          new_receipt.finance = finance?._id;
          new_receipt.receipt_status = "Already Generated";
          order.payment_module_type = "Other Fees";
          order.payment_to_end_user_id = institute?._id;
          order.payment_by_end_user_id = user._id;
          order.payment_module_id = o_f._id;
          order.payment_amount = o_f?.payable_amount;
          order.payment_status = "Captured";
          order.payment_flag_to = "Credit";
          order.payment_flag_by = "Debit";
          order.payment_mode = mode;
          order.payment_other_fees = o_f._id;
          order.payment_from = stu._id;
          order.payment_student = stu?._id;
          order.payment_student_name = stu?.valid_full_name;
          order.payment_student_gr = stu?.studentGRNO;
          order.fee_receipt = new_receipt?._id;
          fee_receipt_count_query(institute, new_receipt, order);
          stu.other_fees.push({
            fees: o_f?._id,
            fee_receipt: new_receipt?._id,
            status: "Paid",
          });
          for (let ele of o_f?.fees_heads) {
            new_receipt.fee_heads.push({
              head_id: ele?._id,
              head_name: ele?.head_name,
              paid_fee: ele?.head_amount,
              applicable_fee: ele?.head_amount,
              remain_fee: new_receipt?.fee_payment_amount - ele?.head_amount,
              fee_structure: o_f?.fee_structure ?? null,
              master: ele?.master,
              original_paid: new_receipt?.fee_payment_amount,
              is_society: ele?.is_society,
            });
          }
          user.payment_history.push(order._id);
          institute.payment_history.push(order._id);
          await Promise.all([
            stu.save(),
            user.save(),
            institute.save(),
            new_receipt.save(),
            order.save(),
          ]);
          await studentOtherFeeReceipt(new_receipt?._id, institute?._id);
        }
      }
    await o_f.save()
    res.status(200).send({ message: "Explore New One Student In Other Fees Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.renderOneNonExistingOtherFeesStudentListQuery = async (req, res) => {
  try {
    const { ofid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!ofid)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });

    var one_of = await OtherFees.findById({ _id: ofid })
    .populate({
      path: "fee_receipt_student",
      populate: {
        path: "fee_receipt",
        select: "receipt_file fee_payment_amount payable_amount",
      },
    })
    var all_student = await nested_document_limit(page, limit, one_of?.fee_receipt_student)
    res
      .status(200)
      .send({
        message: "Explore One Non Existing Other Fees Remaining Student List Query",
        access: true,
        all_student: all_student,
      });
  } catch (e) {
    console.log(e);
  }
};


// exports.renderExistingOtherFeesNonExistingQuery = async (req, res) => {
//   try {
//     const { fid } = req?.params
//     const { struct, is_collect, mode, student_name, other_fees_name, ofid } = req?.body
//     if (!fid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
//     var finance = await Finance.findById({ _id: fid })
//     var institute = await InstituteAdmin.findById({ _id: `${finance?.institute}` })
//     var o_f = await OtherFees.findById({ _id: ofid })
//     if (is_collect === "Yes") {
//         // for (let ele of students) {
//           // const stu = await Student.findById({ _id: `${ele}` })
//           // const user = await User.findById({ _id: `${stu?.user}` })
//           // stu.other_fees_paid_price += o_f?.payable_amount
//           o_f.students_list.push(student_name)
//           // o_f.paid_students.push(stu?._id)
//           o_f.status = "Paid"
//           o_f.student_count += 1
//           for (let val of o_f?.fees_heads) {
//             val.paid_amount += o_f?.payable_amount
//           }
//           const new_receipt = new FeeReceipt({ ...req.body });
//           const order = new OrderPayment({...req?.body})
//           new_receipt.student_name = student_name
//           new_receipt.fee_structure = o_f?.fee_structure
//           new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
//           new_receipt.other_fees = o_f?._id;
//           new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
//           new_receipt.finance = finance?._id;
//           new_receipt.receipt_status = "Already Generated";
//           order.payment_module_type = "Other Fees";
//           order.payment_to_end_user_id = institute?._id;
//           // order.payment_by_end_user_id = user._id;
//           order.payment_module_id = o_f._id;
//           order.payment_amount = o_f?.payable_amount;
//           order.payment_status = "Captured";
//           order.payment_flag_to = "Credit";
//           order.payment_flag_by = "Debit";
//           order.payment_mode = mode;
//           order.payment_other_fees = o_f._id;
//           // order.payment_from = stu._id;
//           // order.payment_student = stu?._id;
//           order.payment_student_name = student_name;
//           order.payment_student_gr = "";
//           order.fee_receipt = new_receipt?._id;
//           fee_receipt_count_query(institute, new_receipt, order)
//           // stu.other_fees.push({
//           //   fees: o_f?._id,
//           //   fee_receipt: new_receipt?._id,
//           //   status: "Paid"
//           // })
//           for (let ele of o_f?.fees_heads) {
//             new_receipt.fee_heads.push({
//               head_id: ele?._id,
//               head_name: ele?.head_name,
//               paid_fee: ele?.head_amount,
//               applicable_fee: ele?.head_amount,
//               remain_fee: new_receipt?.fee_payment_amount - ele?.head_amount,
//               fee_structure: o_f?.fee_structure ?? null,
//               master: ele?.master,
//               original_paid: new_receipt?.fee_payment_amount,
//               is_society: ele?.is_society,
//             })
//           }
//       o_f.fee_receipt = new_receipt?._id
//           // user.payment_history.push(order._id);
//           institute.payment_history.push(order._id);
//       await Promise.all([institute.save(), new_receipt.save(), order.save()])
//       await studentOtherFeeReceipt(new_receipt?._id, institute?._id);
      
//         // }
//     }
//     finance.other_fees.push(o_f?._id)
//     o_f.finance = finance?._id
//     await Promise.all([finance.save(), o_f.save()])
//     res.status(200).send({ message: "Explore New Other Fees Query", access: true})
//   }
//   catch (e) {
//     console.log(e)
//   }
// }

// exports.updateAlias = async(req, res) => {
//   try{

//   }
// }

// exports.delete_structure = async (req, res) => {
//   try {
//     const { did } = req.params;
//     var depart = await Department.findById({ _id: did });
//     var all_structures = await FeeStructure.find({
//       _id: { $in: depart?.fees_structures },
//     });
//     for (var ref of all_structures) {
//       depart.fees_structures.pull(ref?._id);
//       if (depart.fees_structures_count > 0) {
//         depart.fees_structures_count -= 1;
//       }
//       await FeeStructure.findByIdAndDelete(ref?._id);
//     }
//     await depart.save();
//     res.status(200).send({ message: "Deletion Operation Completed" });
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.all_student = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id)
//       return res
//         .status(200)
//         .send({ message: "Something went wrong ", access: false });

//     const one_ins = await InstituteAdmin.findById({ _id: id }).select(
//       "ApproveStudent"
//     );

//     // var all_student = await Student.find({ _id: { $in: one_ins?.ApproveStudent}})
//     // .select("admissionPaidFeeCount admissionPaidFeeCount remainingFeeList")

//     var all_remain = await RemainingList.find({
//       $and: [{ student: { $in: one_ins?.ApproveStudent } }],
//     })
//       .select("applicable_fee remaining_fee paid_fee status")
//       .populate({
//         path: "student",
//         select:
//           "studentFirstName studentMiddleName studentLastName admissionPaidFeeCount admissionRemainFeeCount",
//       });
//     var sorted = [];
//     for (var ref of all_remain) {
//       ref.exactmatch = ref?.applicable_fee - ref?.remaining_fee;
//       ref.match =
//         ref?.paid_fee + ref?.remaining_fee == ref?.applicable_fee
//           ? "Yes Match Found"
//           : "No Match Found";
//       if (ref?.match === "Yes Match Found") {
//         // sorted.push(ref);
//       } else {
//         sorted.push(ref,{ match: ref?.match, exact: ref?.exactmatch});
//       }
//     }

//     if (sorted?.length > 0) {
//       res.status(200).send({
//         message: "Explore All Student with Remaining Fees Card",
//         access: true,
//         sorted: sorted,
//       });
//     } else {
//       res.status(200).send({
//         message: "No Student with Remaining Fees Card",
//         access: true,
//         sorted: [],
//       });
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.edit_structure = async(req, res) => {
//   try{
//     const { did } = req.params
//     const depart = await Department.findById({ _id: did })
//     const all_structure = await FeeStructure.find({ _id: { $in: depart?.fees_structures_count }})
//     for(var ref of all_structure){

//     }
//   }
//   catch(e){
//     console.log(e)
//   }
// }

// exports.renderUpdateStructureQuery = async (req, res) => {
//   try {
//     const { fid } = req.params;
//     if (!fid) return res.status(200).send({ message: "Explore ID" });

//     var structure = await FeeStructure.find({ finance: fid });

//     for (var ref of structure) {
//       if (ref?.category_master) {
//         var cate = await FeeCategory.findById({
//           _id: `${ref?.category_master}`,
//         });
//       }
//       if (ref?.class_master) {
//         var classes = await ClassMaster.findById({
//           _id: `${ref?.class_master}`,
//         });
//       }
//       if (cate && classes) {
//         ref.unique_structure_name = `${cate?.category_name} - ${classes?.className} / ${ref?.structure_name}`;
//         await ref.save();
//       } else {
//       }
//     }
//     res.status(200).send({ message: "Updated", access: true });
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.RemainingFeesQuery = async (req, res) => {
//   try {
//     var all_remain_list = await RemainingList.find({
//     }).populate({
//       path: "fee_structure",
//     });
//     var ads = await Admission.findById({ _id: "644a09e3d1679fcd6e76e606"})
//     for(var ref of all_remain_list){
//       if(ref?.remaining_fee == 0){
//         ref.status = "Paid"
//       }
//       await ref.save()
//     }
//     var all_stu = await Student.find({ _id: { $in: ads?.remainingFee } })
//     for(var ele of all_stu){
//       if(ele?.admissionRemainFeeCount == 0){
//         ads.remainingFee.pull(ele?._id)
//       }
//     }
//     ads.structure_mismatch_amount = 34161
//     await ads.save()
//     res.status(200).send({
//       message: "Explore All Remaining Card",
//       access: true,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.RemainingFeesQuery = async (req, res) => {
//   try {
//     // const one_depart = await Department.findById({ _id: ""})
//     var one_batch = await Batch.findById({ _id: "6457919c3d0d78fad8289b22" });
//     var all_struct = await FeeStructure.find({
//       $and: [
//         { finance: "644a09d6d1679fcd6e76e5ef" },
//         { batch_master: one_batch?._id },
//         { total_admission_fees: 84221 },
//       ],
//     });
//     var all_list = [];
//     var all_remain_list = await RemainingList.find({
//       $and: [{
//       fee_structure: { $in: all_struct },
//       }, { status: "Not Paid"}, { applicable_fee: 84221 }]
//     }).populate({
//       path: "fee_structure",
//     });

//     for(var ref of all_remain_list){
//       ref.applicable_fee = 84028
//       if(ref?.remaining_fee > 0){
//         ref.remaining_fee -= 193
//       }
//       for(var ele of ref?.remaining_array){
//         if(ele?.status === "Not Paid" && ele?.remainAmount == 193){
//           ref.remaining_array.pull(ele?._id)
//         }
//         if(ele?.status === "Not Paid" && ele?.remainAmount > 193){
//           ele.remainAmount -= 193
//         }
//       }
//       var student = await Student.findById({ _id: `${ref?.student}`})
//       if(student?.admissionRemainFeeCount > 0){
//         student.admissionRemainFeeCount -= 193
//       }
//       await Promise.all([ ref.save(), student.save() ])
//     }
//     res.status(200).send({
//       message: "Explore All Remaining Card",
//       access: true,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.addOrder = async(req, res) => {
//   try{
//     var all_list = []
//     var s_admin = await Admin.findById({ _id: ""})
//     var all_stu = await Student.find({ and: [{ institute: ""}, { studentStatus: "Approved"}]})
//     var all_remain = await RemainingList.find({ student: { $in: all_stu }})
//     .populate({
//       path: "student",
//       populate: {
//         path: "user"
//       }
//     })
//     .populate({
//       path: "student",
//       populate: {
//         path: "institute"
//       }
//     })
//     for(var ref of all_remain){
//       for(var ele of ref?.remaining_array){
//         if(ele?.status === "Paid"){
//           const order = new OrderPayment({});
//           order.payment_module_type = "Admission Fees";
//           order.payment_to_end_user_id = ref?.student?.institute?._id;
//           order.payment_by_end_user_id = ref?.student?.user._id;
//           order.payment_module_id = ele?.appId;
//           order.payment_amount = ele?.remainAmount;
//           order.payment_status = "Captured";
//           order.payment_flag_to = "Credit";
//           order.payment_flag_by = "Debit";
//           order.payment_mode = ele?.mode === "";
//           order.payment_admission = ele?.appId;
//           order.payment_from = ref?.student._id;
//           s_admin.invoice_count += 1;
//           order.payment_invoice_number = s_admin.invoice_count;
//           ref?.student?.user.payment_history.push(order._id);
//           ref?.student?.institute.payment_history.push(order._id);
//           order.invoice_count = `${
//             new Date().getMonth() + 1
//           }${new Date().getFullYear()}${s_admin.invoice_count}`;
//           await Promise.all([ s_admin.save(), ref.student.user.save(), ref.student.institute.save(), ])
//         }
//       }
//     }
//   }
//   catch(e){
//     console.log(e)
//   }
// }

// exports.remainAdd = async (req, res) => {
//   try {
//     var all_card = await RemainingList.find({}).populate({
//       path: "appId",
//       select: "applicationName",
//     });
//     for (var rem of all_card) {
//       if (rem?.appId?.applicationName === "Promote Student") {
//         rem.card_type = "Promote";
//       } else {
//         rem.card_type = "Normal";
//       }
//       await rem.save();
//     }
//     res.status(200).send({ message: "Explore All Promote || Normal Card" });
//   } catch (e) {
//     console.log(e);
//   }
// };
