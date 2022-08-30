const InstituteAdmin = require('../../models/InstituteAdmin')
const Finance = require('../../models/Finance')
const Student = require('../../models/Student')
const Staff = require('../../models/Staff')
const User = require('../../models/User')
const Notification = require('../../models/notification')
const Admin = require('../../models/superAdmin')
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
        staff.financeDepartment.push(finance._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = 'Finance Manager';
        finance.financeHead = staff._id;
        institute.financeDepart.push(finance._id);
        institute.financeStatus = 'Enable'
        finance.institute = institute._id;
        notify.notifyContent = `you got the designation of ${finance.financeName} as Finance Manager`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyPid = "1";
        notify.notifyByInsPhoto = institute._id;
        await Promise.all([
        institute.save(),
        staff.save(),
        finance.save(),
        user.save(),
        notify.save()
        ])
        res.status(200).send({
          message: "Successfully Assigned Staff",
          finance: finance._id,
          status: true
        });
      } catch(e) {
      }
}

exports.uploadBankDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const { bankAccountHolderName, bankAccountNumber, bankIfscCode, bankAccountPhoneNumber, bankAccountType, GSTInfo, businessName, businessAddress } = req.body;
        const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
        const institute = await InstituteAdmin.findById({ _id: id });
        const notify = new Notification({})
        institute.bankAccountHolderName = bankAccountHolderName;
        institute.bankAccountNumber = bankAccountNumber;
        institute.bankIfscCode = bankIfscCode;
        institute.bankAccountPhoneNumber = bankAccountPhoneNumber;
        institute.paymentBankStatus = 'verification in progress'
        institute.GSTInfo = GSTInfo
        institute.businessName = businessName
        institute.businessAddress = businessAddress
        institute.financeDetailStatus = 'Added'
        institute.bankAccountType = bankAccountType
        notify.notifyContent = ` ${institute.insName} Institute payment Details updated Check and Verify `
        notify.notifySender = institute._id;
        notify.notifyReceiever = admin._id;
        admin.aNotify.push(notify._id);
        notify.notifyPid = "1";
        notify.notifyByInsPhoto = institute._id;
        await Promise.all([institute.save(), admin.save(), notify.save()]);
        res.status(200).send({ message: "bank detail updated wait for verification", status: true });
      } catch(e) {
        console.log(e)
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
        institute.GSTInfo = ""
        institute.businessName = ""
        institute.businessAddress = ""
        institute.financeDetailStatus = 'Not Added'
        institute.paymentBankStatus = 'payment Details are mandatory for Finance Department'
        await Promise.all([ institute.save() ]);
        res.status(200).send({ message: "Bank Details Removed" });
      } catch(e) {
      }
}

exports.updateBankDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
        const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
        const notify = new Notification({})
        institute.paymentBankStatus = 'verification in progress'
        notify.notifyContent = ` ${institute.insName} Institute payment Details updated Check and Verify `
        notify.notifySender = institute._id;
        notify.notifyReceiever = admin._id;
        admin.aNotify.push(notify._id);
        notify.notifyPid = "1";
        notify.notifyByInsPhoto = institute._id;
        await Promise.all([institute.save(), admin.save(), notify.save()]);
        res.status(200).send({ message: "bank detail updated wait for verification" });
      } catch(e) {
      }
}



exports.retrieveFinanceQuery = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({ _id: fid })
    .select('financeName financeEmail financePhoneNumber financeAbout photoId photo cover coverId financeExemptBalance financeCollectedSBalance financeBankBalance financeCashBalance financeSubmitBalance financeTotalBalance financeEContentBalance financeApplicationBalance financeAdmissionBalance financeIncomeCashBalance financeIncomeBankBalance financeExpenseCashBalance financeExpenseBankBalance')
    .populate({
      path: 'institute',
      select: 'id adminRepayAmount'
    })
    .populate({
      path: 'financeHead',
      select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
    })
    res.status(200).send({ message: 'Finance', finance})
  }
  catch(e){
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
            select: 'id insName'
          })
          .populate({
            path: "expenseDepartment",
            select: 'id'
          })
          .populate({
            path: "classRoom",
            populate: {
              path: "classTeacher",
              select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
            },
            select: 'id'
          })
          .populate({
            path: "classRoom",
            populate: {
              path: "receieveFee",
              select: 'feeName feeAmount'
            },
            select: 'id'
          })
          .populate({
            path: "incomeDepartment",
            select: 'id'
          })
          .populate({
            path: "submitClassRoom",
            select: 'id'
          })
          .lean()
          .exec()
        res.status(200).send({ message: "finance data", finance });
      } catch(e) {
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
        await Promise.all([financeInfo.save()]);
        res.status(200).send({ message: "Finance Info Updates" });
      } catch(e) {
      }
}

exports.getIncome = async(req, res) =>{
    try {
        const { fid } = req.params;
        const finance = await Finance.findById({ _id: fid });
        const file = req.file;
        const results = await uploadDocFile(file);
        const incomes = await new Income({ ...req.body });
        finance.incomeDepartment.push(incomes._id);
        incomes.incomeAck = results.key;
        incomes.finances = finance._id;
        if (req.body.incomeAccount === "By Cash") {
          finance.financeIncomeCashBalance =
            finance.financeIncomeCashBalance + incomes.incomeAmount;
        } else if (req.body.incomeAccount === "By Bank") {
          finance.financeIncomeBankBalance =
            finance.financeIncomeBankBalance + incomes.incomeAmount;
        }
        await Promise.all([
         finance.save(),
         incomes.save()
        ])
        await unlinkFile(file.path);
        res.status(200).send({ message: "Add New Income", finance: finance._id, incomes: incomes._id });
      } catch(e) {
      }
}

exports.getAllIncomes = async(req, res) =>{
    try {
        const { queryStatus } = req.body;
        if(queryStatus === 'By Cash'){
          const income = await Income.find({ incomeAccount: queryStatus });
          res.status(200).send({ message: "cash data", cashIncome: income });
        }
        else if(queryStatus === 'By Bank'){
          const income = await Income.find({ incomeAccount: queryStatus });
          res.status(200).send({ message: "bank data", bankIncome: income });
        }
        else{

        }
      } catch(e) {
      }
}


exports.getExpense = async(req, res) =>{
    try {
        const { fid } = req.params;
        const finance = await Finance.findById({ _id: fid });
        const file = req.file;
        const results = await uploadDocFile(file);
        const expenses = await new Expense({ ...req.body });
        finance.expenseDepartment.push(expenses._id);
        expenses.expenseAck = results.key;
        expenses.finances = finance._id;
        if (req.body.expenseAccount === "By Cash") {
          finance.financeExpenseCashBalance =
            finance.financeExpenseCashBalance - expenses.expenseAmount;
        } else if (req.body.expenseAccount === "By Bank") {
          finance.financeExpenseBankBalance =
            finance.financeExpenseBankBalance - expenses.expenseAmount;
        }
        await Promise.all([
         finance.save(),
         expenses.save()
        ])
        await unlinkFile(file.path);
        res.status(200).send({ message: "Add New Expense", finance: finance._id, expenses: expenses._id });
      } catch(e) {
      }
}

exports.getAllExpense = async(req, res) =>{
    try {
        const { queryStatus } = req.body;
        if(queryStatus === 'By Cash'){
          const expense = await Expense.find({ expenseAccount: queryStatus });
          res.status(200).send({ message: "cash data", cashExpense: expense });
        }
        else if(queryStatus === 'By Bank'){
          const expense = await Expense.find({ expenseAccount: queryStatus });
          res.status(200).send({ message: "bank data", bankExpense: expense });
        }
        else{}
      } catch(e) {
      }
}

exports.getFinanceOnlineFee = async(req, res) =>{
    try {
        const { id } = req.params;
        const finance = await Finance.findById({ _id: id }).populate({
          path: "institute",
          select: 'id',
          populate: {
            path: "ApproveStudent",
            select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
          },
        });
        res.status(200).send({ message: "all class data at finance manager", finance });
      } catch {
      }
}

exports.getClassOnlineFee = async(req, res) =>{
    try {
        const { cid } = req.params;
        const { fee } = req.body;
        const classes = await Class.findById({ _id: cid });
        classes.onlineTotalFee = fee;
        await classes.save();
        res.status(200).send({ message: "class online total", classes: classes.onlineTotalFee });
      } catch(e) {
      }
}

exports.getClassOfflineFee = async(req, res) =>{
    try {
        const { cid } = req.params;
        const { fee } = req.body;
        const classes = await Class.findById({ _id: cid });
        classes.offlineTotalFee = fee;
        await classes.save();
        res.status(200).send({ message: "class offline total", classes: classes.offlineTotalFee });
      } catch(e) {
      }
}

exports.getClassCollectedFee = async(req, res) =>{
    try {
        const { cid } = req.params;
        const { fee } = req.body;
        const classes = await Class.findById({ _id: cid });
        classes.classTotalCollected = fee;
        await classes.save();
        res.status(200).send({ message: "class offline total", classes: classes.classTotalCollected });
      } catch(e) {

      }
}

exports.collectClassFee = async(req, res) =>{
    try {
        const { fid } = req.params;
        const finance = await Finance.findById({ _id: fid })
          .populate({
            path: "institute",
            select: 'id',
            populate: {
              path: "ApproveStudent",
              select: 'id',
              populate: {
                path: "onlineCheckList",
                select: 'checklistName checklistAmount'
              },
            },
          })
          .populate({
            path: "institute",
            select: 'id',
            populate: {
              path: "classRooms",
              select: 'className classTitle classStatus'
            },
          })
          .populate({
            path: "institute",
            select: 'id',
            populate: {
              path: "ApproveStudent",
              select: 'id',
              populate: {
                path: "onlineFeeList",
                select: 'feeName feeAmount'
              },
            },
          });
        res.status(200).send({ message: "Class Data", finance });
      } catch(e) {
      }
}

exports.requestClassOfflineFee = async(req, res) =>{
    try {
        const { fid, cid, id } = req.params;
        const { amount } = req.body
        const finance = await Finance.findById({ _id: fid })
        const classes = await Class.findById({ _id: cid })
        .populate({ path: 'classTeacher', select: 'staffFirstName staffMiddleName staffLastName'})
        const fee = await Fees.findById({ _id: id });
        if(finance.requestArray.length >= 1 && finance.requestArray.includes(String(classes._id))){
          res.status(200).send({ message: 'Already Requested wait for further process'})
        }
        else{
            finance.classRoom.push({
              classId: classes._id,
              className: classes.className,
              photoId: classes.photoId,
              photo: classes.photo,
              staff: `${classes.classTeacher.staffFirstName} ${classes.classTeacher.staffMiddleName ? classes.classTeacher.staffMiddleName : ''} ${classes.classTeacher.staffLastName}`,
              feeId: fee._id,
              feeName: fee.feeName,
              feeAmount: amount,
              status: 'Pending',
              
            });
            finance.financeCollectedSBalance += amount
            finance.requestArray.push(classes._id)
            classes.receieveFee.push(fee._id);
            classes.requestFeeStatus.feeId = fee._id
            classes.requestFeeStatus.status = 'Requested'
            await Promise.all([
              finance.save(),
              classes.save()
            ])
            res.status(200).send({ message: "class Request At Finance ", request: true });
          }
      } catch(e) {
        console.log(e)
      }
}

exports.submitClassOfflineFee = async(req, res) =>{
    try {
        const { fid, cid, id } = req.params;
        const { amount } = req.body
        const finance = await Finance.findById({ _id: fid });
        const classes = await Class.findById({ _id: cid })
        .populate({ path: 'classTeacher', select: 'staffFirstName staffMiddleName staffLastName'})
        const fees = await Fees.findById({ _id: id });
        finance.classRoom.splice({
          classId: classes._id,
          className: classes.className,
          photoId: classes.photoId,
          photo: classes.photo,
          staff: `${classes.classTeacher.staffFirstName} ${classes.classTeacher.staffMiddleName ? classes.classTeacher.staffMiddleName : ''} ${classes.classTeacher.staffLastName}`,
          feeId: fees._id,
          feeName: fees.feeName,
          feeAmount: amount,
          status: 'Pending',
          
        }, 1);
        finance.submitClassRoom.push({
          classId: classes._id,
          className: classes.className,
          photoId: classes.photoId,
          photo: classes.photo,
          staff: `${classes.classTeacher.staffFirstName} ${classes.classTeacher.staffMiddleName ? classes.classTeacher.staffMiddleName : ''} ${classes.classTeacher.staffLastName}`,
          feeId: fees._id,
          feeName: fees.feeName,
          feeAmount: amount,
          status: "Accepted",
          
        });
        classes.receieveFee.pull(fees._id);
        classes.submitFee.push(fees._id);
        finance.requestArray.pull(classes._id)
        finance.financeSubmitBalance += amount
        finance.financeCollectedSBalance -= amount
        // finance.financeSubmitBalance += fees.offlineFee;
        fees.offlineFee = 0;
        classes.requestFeeStatus.feeId = fees._id
        classes.requestFeeStatus.status = 'Accepted'
        for(let i=0; i< classes.offlineFeeCollection.length; i++){
          if(classes.offlineFeeCollection[i].feeId === `${fees._id}`){
              classes.offlineFeeCollection[i].fee = 0
          }
          else{}
        }
        await Promise.all([
          classes.save(),
          finance.save(),
          fees.save()
         ])
        res.status(200).send({ message: "Reuqest Accepted", accept: true, classLength: finance.classRoom.length });
      } catch(e) {
      }
}

exports.classOfflineFeeIncorrect = async(req, res) =>{
    try {
        const { fid, cid, id } = req.params;
        const { amount } = req.body
        const finance = await Finance.findById({ _id: fid });
        const classes = await Class.findById({ _id: cid })
        .populate({ path: 'classTeacher', select: 'staffFirstName staffMiddleName staffLastName'})
        const fees = await Fees.findById({ _id: id });
        finance.classRoom.splice({
          classId: classes._id,
          className: classes.className,
          photoId: classes.photoId,
          photo: classes.photo,
          staff: `${classes.classTeacher.staffFirstName} ${classes.classTeacher.staffMiddleName ? classes.classTeacher.staffMiddleName : ''} ${classes.classTeacher.staffLastName}`,
          feeId: fees._id,
          feeName: fees.feeName,
          feeAmount: amount,
          status: 'Pending',
          
        }, 1);
        finance.pendingClassroom.push({
          classId: classes._id,
          className: classes.className,
          photoId: classes.photoId,
          photo: classes.photo,
          staff: `${classes.classTeacher.staffFirstName} ${classes.classTeacher.staffMiddleName ? classes.classTeacher.staffMiddleName : ''} ${classes.classTeacher.staffLastName}`,
          feeId: fees._id,
          feeName: fees.feeName,
          feeAmount: amount,
          status: 'Rejected',
          
        });
        finance.requestArray.pull(classes._id)
        classes.requestFeeStatus.feeId = fees._id
        classes.requestFeeStatus.status = 'Rejected'
        await Promise.all([
          finance.save(),
          classes.save()
        ])
        res.status(200).send({ message: "Request Reject", reject: true });
      } catch {
      }
}

exports.updatePaymenFinance = async(req, res) =>{
    try {
        const { fid } = req.params;
        const { balance } = req.body;
        const finance = await Finance.findById({ _id: fid });
        finance.financeBankBalance = balance;
        await finance.save();
        res.status(200).send({ message: "balance", bankBalance: finance.financeBankBalance });
      } catch(e) {
      }
}


exports.RepayBySuperAdmin = async(req, res) =>{
  try {
    const { aid, id } = req.params;
    const { amount } = req.body;
    const admin = await Admin.findById({ _id: aid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const notify = new Notification({});
    institute.insBankBalance = institute.insBankBalance - amount;
    institute.adminRepayAmount = institute.adminRepayAmount + amount;
    notify.notifyContent = `Super Admin re-pay Rs. ${amount} to you`;
    notify.notifySender = aid;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/images/newLogo.svg";
    await Promise.all([
     institute.save(),
     notify.save()
    ])
    res.status(200).send({ message: "Amount Transferred" });
  } catch {}
}


exports.retrievePaymentDetail = async(req, res) => {
  try{
    const { id } = req.params
    const bank = await InstituteAdmin.findById({_id: id})
    .select('bankAccountHolderName paymentBankStatus bankAccountNumber bankAccountType bankAccountPhoneNumber bankIfscCode')
    res.status(200).send({ message: 'Payment Detail', bank})
  }
  catch{

  }
}

exports.retrieveIncomeQuery = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({_id: fid})
    .select('financeName incomeDepartment')
    const incomes = await Income.find({ _id: { $in: finance.incomeDepartment}})
    .sort("-createdAt")
    res.status(200).send({ message: 'All Incomes', allIncome: incomes})
  }
  catch{

  }
}

exports.retrieveExpenseQuery = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({_id: fid})
    .select('financeName expenseDepartment')
    const expenses = await Expense.find({ _id: { $in: finance.expenseDepartment}})
    .sort("-createdAt")
    res.status(200).send({ message: 'All Expenses', allIncome: expenses})
  }
  catch{

  }
}

exports.retrieveRequestAtFinance = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({_id: fid})
    .select('financeName')
    .populate({
      path: 'classRoom'
    })
    res.status(200).send({ message: 'Get Request', request: finance.classRoom, requestCount: finance.classRoom.length})
  }
  catch{

  }
}

exports.retrieveSubmitAtFinance = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({_id: fid})
    .select('financeName')
    .populate({
      path: 'submitClassRoom'
    })
    res.status(200).send({ message: 'Get Submit', submit: finance.submitClassRoom, submitCount: finance.submitClassRoom.length})
  }
  catch{

  }
}

exports.retrieveRejectAtFinance = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({_id: fid})
    .select('financeName')
    .populate({
      path: 'pendingClassroom'
    })
    res.status(200).send({ message: 'Get Reject', reject: finance.pendingClassroom, rejectCount: finance.pendingClassroom.length})
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveRemainingAmount = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({_id: fid})
    const institute = await InstituteAdmin.findById({_id: `${finance.institute}`})
    .populate({
      path: 'ApproveStudent',
      select: 'studentGRNO studentFirstName studentMiddleName studentLastName',
      populate: {
        path: 'department',
        select: 'dName'
      }
    })
    .populate({
      path: 'ApproveStudent',
      select: 'studentGRNO studentFirstName studentMiddleName studentLastName onlineFeeList offlineFeeList onlineCheckList',
    })
    institute.ApproveStudent.forEach(async (ele) => {
      const fees = await Fees.find({_id: { $in: ele.onlineFeeList}})
    })
  }
  catch{

  }
}


exports.retrieveIncomeBalance = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({_id: fid})
    .select('financeIncomeCashBalance financeIncomeBankBalance')
    res.status(200).send({ message: 'Income Balance', incomeBalance: finance})
  }
  catch(e){
    // console.log(e)
  }
}

exports.retrieveExpenseBalance = async(req, res) =>{
  try{
    const { fid } = req.params
    const finance = await Finance.findById({_id: fid})
    .select('financeExpenseCashBalance financeExpenseBankBalance')
    res.status(200).send({ message: 'Expense Balance', expenseBalance: finance})
  }
  catch(e){
    // console.log(e)
  }
}


exports.retrieveRemainFeeBalance = async(req, res) =>{
  try{
    const { fid } = req.params
    var remain = 0
    const finance = await Finance.findById({_id: fid})
    .select('id institute')
    const student = await Student.find({ institute: `${finance.institute}`})
    .select('id studentRemainingFeeCount ')
    student.forEach((stu) => {
      remain += stu.studentRemainingFeeCount
    })
    res.status(200).send({ message: 'Remaining Balance', remain: remain})
  }
  catch(e){
    // console.log(e)
  }
}

