const InstituteAdmin = require('../../models/InstituteAdmin')
const Finance = require('../../models/Finance')
const Staff = require('../../models/Staff')
const User = require('../../models/User')
const Notification = require('../../models/notification')
const Income = require('../../models/Income')
const Expense = require('../../models/Expense')
const Class = require('../../models/Class')
const Fees = require('../../models/Fees')
const { uploadDocFile, getFileStream } = require('../../S3Configuration')
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

exports.getFinanceDepart = async(req, res) =>{
    try {
        const { id, sid } = req.params;
        const institute = await InstituteAdmin.findById({ _id: id });
        const staff = await Staff.findById({ _id: sid }).populate({
          path: "user",
        });
        const user = await User.findById({ _id: `${staff.user._id}` });
        const finance = await new Finance({});
        const notify = await new Notification({})
        staff.financeDepartment.push(finance);
        finance.financeHead = staff;
        institute.financeDepart.push(finance);
        finance.institute = institute;
        notify.notifyContent = `you got the designation of ${finance.financeName} as Finance Manager`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        user.uNotify.push(notify);
        notify.user = user;
        notify.notifyPid = "1";
        notify.notifyPhoto = institute.insProfilePhoto;
        await institute.save();
        await staff.save();
        await finance.save();
        await user.save();
        await notify.save();
        res.status(200).send({
          message: "Successfully Assigned Staff",
          finance,
          staff,
          institute,
        });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.uploadBankDetail = async(req, res) =>{
    try {
        const { fid, id } = req.params;
        const { bankAccountHolderName, bankAccountNumber, bankIfscCode, bankAccountPhoneNumber } = req.body;
        const finance = await Finance.findById({ _id: fid });
        const institute = await InstituteAdmin.findById({ _id: id });
        institute.bankAccountHolderName = bankAccountHolderName;
        institute.bankAccountNumber = bankAccountNumber;
        institute.bankIfscCode = bankIfscCode;
        institute.bankAccountPhoneNumber = bankAccountPhoneNumber;
        await institute.save();
        res.status(200).send({ message: "bank detail updated" });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.removeBankDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const institute = await InstituteAdmin.findById({ _id: id });
        institute.bankAccountHolderName = "";
        institute.bankAccountNumber = "";
        institute.bankIfscCode = "";
        institute.bankAccountPhoneNumber = "";
        await institute.save();
        res.status(200).send({ message: "Bank Details Removed" });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.updateBankDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
        await institute.save();
        res.status(200).send({ message: "bank detail updated" });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getFinanceDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const finance = await Finance.findById({ _id: id })
          .populate({
            path: "financeHead",
            select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
          })
          .populate({
            path: "institute",
          })
          .populate("expenseDepartment")
          .populate({
            path: "classRoom",
            populate: {
              path: "classTeacher",
              select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
            },
          })
          .populate({
            path: "classRoom",
            populate: {
              path: "receieveFee",
            },
          })
          .populate("incomeDepartment")
          .populate("submitClassRoom");
        res.status(200).send({ message: "finance data", finance });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getFinanceInfo = async(req, res) =>{
    try {
        const { fid } = req.params;
        const { financeAbout, financeEmail, financePhoneNumber } = req.body;
        const financeInfo = await Finance.findById({ _id: fid });
        financeInfo.financeAbout = financeAbout;
        financeInfo.financeEmail = financeEmail;
        financeInfo.financePhoneNumber = financePhoneNumber;
        await financeInfo.save();
        res.status(200).send({ message: "Finance Info Updates", financeInfo });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getIncome = async(req, res) =>{
    try {
        const { sid, fid } = req.params;
        const staff = await Staff.findById({ _id: sid });
        const finance = await Finance.findById({ _id: fid });
        const incomes = await new Income({ ...req.body });
        finance.incomeDepartment.push(incomes);
        incomes.finances = finance;
        if (req.body.incomeAccount === "By Cash") {
          finance.financeIncomeCashBalance =
            finance.financeIncomeCashBalance + incomes.incomeAmount;
        } else if (req.body.incomeAccount === "By Bank") {
          finance.financeIncomeBankBalance =
            finance.financeIncomeBankBalance + incomes.incomeAmount;
        }
        await finance.save();
        await incomes.save();
        res.status(200).send({ message: "Add New Income", finance, incomes });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllCashIncomes = async(req, res) =>{
    try {
        const { queryStatus } = req.body;
        const income = await Income.find({ incomeAccount: queryStatus });
        res.status(200).send({ message: "cash data", income });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllBankIncomes = async(req, res) =>{
    try {
        const { queryStatus } = req.body;
        const income = await Income.find({ incomeAccount: queryStatus });
        res.status(200).send({ message: "bank data", income });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getExpense = async(req, res) =>{
    try {
        const { sid, fid } = req.params;
        const staff = await Staff.findById({ _id: sid });
        const finance = await Finance.findById({ _id: fid });
        const expenses = await new Expense({ ...req.body });
        finance.expenseDepartment.push(expenses);
        expenses.finances = finance;
        if (req.body.expenseAccount === "By Cash") {
          finance.financeExpenseCashBalance =
            finance.financeExpenseCashBalance - expenses.expenseAmount;
        } else if (req.body.expenseAccount === "By Bank") {
          finance.financeExpenseBankBalance =
            finance.financeExpenseBankBalance - expenses.expenseAmount;
        }
        await finance.save();
        await expenses.save();
        res.status(200).send({ message: "Add New Expense", finance, expenses });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllCashExpense = async(req, res) =>{
    try {
        const { queryStatus } = req.body;
        const expense = await Expense.find({ expenseAccount: queryStatus });
        res.status(200).send({ message: "cash data", expense });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllBankExpense = async(req, res) =>{
    try {
        const { queryStatus } = req.body;
        const expense = await Expense.find({ expenseAccount: queryStatus });
        res.status(200).send({ message: "bank data", expense });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getFinanceOnlineFee = async(req, res) =>{
    try {
        const { id } = req.params;
        const finance = await Finance.findById({ _id: id }).populate({
          path: "institute",
          populate: {
            path: "ApproveStudent",
          },
        });
        res.status(200).send({ message: "all class data at finance manager", finance });
      } catch {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getClassOnlineFee = async(req, res) =>{
    try {
        const { cid } = req.params;
        const { fee } = req.body;
        const classes = await Class.findById({ _id: cid });
        classes.onlineTotalFee = fee;
        await classes.save();
        res.status(200).send({ message: "class online total", classes });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getClassOfflineFee = async(req, res) =>{
    try {
        const { cid } = req.params;
        const { fee } = req.body;
        const classes = await Class.findById({ _id: cid });
        classes.offlineTotalFee = fee;
        await classes.save();
        res.status(200).send({ message: "class offline total", classes });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getClassCollectedFee = async(req, res) =>{
    try {
        const { cid } = req.params;
        const { fee } = req.body;
        const classes = await Class.findById({ _id: cid });
        classes.classTotalCollected = fee;
        await classes.save();
        res.status(200).send({ message: "class offline total", classes });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.collectClassFee = async(req, res) =>{
    try {
        const { fid } = req.params;
        const finance = await Finance.findById({ _id: fid })
          .populate({
            path: "institute",
            populate: {
              path: "ApproveStudent",
              populate: {
                path: "onlineCheckList",
              },
            },
          })
          .populate({
            path: "institute",
            populate: {
              path: "classRooms",
            },
          })
          .populate({
            path: "institute",
            populate: {
              path: "ApproveStudent",
              populate: {
                path: "onlineFeeList",
              },
            },
          });
        res.status(200).send({ message: "Class Data", finance });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.requestClassOfflineFee = async(req, res) =>{
    try {
        const { fid, cid, id } = req.params;
        const { amount } = req.body;
        const finance = await Finance.findById({ _id: fid });
        const classes = await Class.findById({ _id: cid });
        const fee = await Fees.findById({ _id: id });
        finance.classRoom.push(classes);
        classes.receieveFee.push(fee);
        await finance.save();
        await classes.save();
        res.status(200).send({ message: "class submitted Data", finance });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.submitClassOfflineFee = async(req, res) =>{
    try {
        const { fid, cid, id } = req.params;
        const { fee } = req.body;
        const finance = await Finance.findById({ _id: fid });
        const classes = await Class.findById({ _id: cid }).populate(
          "ApproveStudent"
        );
        const fees = await Fees.findById({ _id: id });
        finance.classRoom.pull(classes);
        finance.submitClassRoom.push(classes);
        classes.receieveFee.pull(fees);
        classes.submitFee.push(fees);
        finance.financeSubmitBalance += fees.offlineFee;
        fees.offlineFee = 0;
        await classes.save();
        await finance.save();
        await fees.save();
        res.status(200).send({ message: "finance class submitted Data", finance });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.classOfflineFeeIncorrect = async(req, res) =>{
    try {
        const { fid, cid } = req.params;
        const finance = await Finance.findById({ _id: fid });
        const classes = await Class.findById({ _id: cid });
        finance.classRoom.pull(classes);
        finance.pendingClassRoom.push(classes);
        await finance.save();
        res.status(200).send({ message: "class submitted Data", finance });
      } catch {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updatePaymenFinance = async(req, res) =>{
    try {
        const { fid } = req.params;
        const { balance } = req.body;
        const finance = await Finance.findById({ _id: fid });
        finance.financeBankBalance = balance;
        await finance.save();
        res.status(200).send({ message: "balance", finance });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.uploadIncomeACK = async(req, res) =>{
  try {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const incomes = await Income.findById({ _id: sid });
    incomes.incomeAck = results.key;
    await incomes.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  } catch(e) {
    console.log(`Error`, e.message);
  }
}

exports.RetrieveIncomeACK = async(req, res) =>{
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch(e) {
    console.log(
      `Error`, e.message
    );
  }
}

exports.uploadExpenseACK = async(req, res) =>{
  try {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const expenses = await Expense.findById({ _id: sid });
    expenses.expenseAck = results.key;
    await expenses.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  } catch(e) {
    console.log(
      `Error`, e.message
    );
  }
}

exports.RetrieveExpenseACK = async(req, res) =>{
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch(e) {
    console.log(
      `Error`, e.message
    );
  }
}