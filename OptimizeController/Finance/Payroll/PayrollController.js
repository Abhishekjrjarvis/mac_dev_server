const invokeFirebaseNotification = require("../../../Firebase/firebase");
const encryptionPayload = require("../../../Utilities/Encrypt/payload");
const { designation_alarm, email_sms_designation_alarm } = require("../../../WhatsAppSMS/payload");
const PayrollModule = require("../../../models/Finance/Payroll/PayrollModule");
const SalaryHeads = require("../../../models/Finance/Payroll/SalaryHeads");
const SalaryStructure = require("../../../models/Finance/Payroll/SalaryStructure");
const InstituteAdmin = require("../../../models/InstituteAdmin");
const Staff = require("../../../models/Staff");
const User = require("../../../models/User");
const Notification = require("../../../models/notification");
const StaffAttendenceDate = require("../../../models/StaffAttendenceDate");
const { s_c, employee, employar, compliance } = require("../../../Constant/heads");
const PaySlip = require("../../../models/Finance/Payroll/PaySlip");
const TDSFinance = require("../../../models/Finance/Payroll/TDSFinance");
const { nested_document_limit } = require("../../../helper/databaseFunction");

exports.render_new_payroll_query = async (req, res) => {
    try {
      const { id } = req.params;
      const { sid } = req.body;
      var institute = await InstituteAdmin.findById({ _id: id });
      var payroll = new PayrollModule({});
      if (sid) {
        var staff = await Staff.findById({ _id: sid });
        var user = await User.findById({ _id: `${staff.user}` });
        var notify = new Notification({});
        staff.payrollDepartment.push(payroll._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = "Payroll Administrator";
        staff.designation_array.push({
          role: "Payroll Administrator",
          role_id: payroll?._id,
        });
        payroll.payroll_manager = staff._id;
        notify.notifyContent = `you got the designation of as Payroll Administrator`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Payroll Designation";
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
          payroll.save(),
        ]);
        designation_alarm(
          user?.userPhoneNumber,
          "PAYROLL",
          institute?.sms_lang,
          "",
          "",
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "PAYROLL",
            institute?.sms_lang,
            "",
            "",
            ""
          );
        }
      } else {
        payroll.payroll_manager = null;
      }
      institute.payroll_module.push(payroll._id);
      institute.payroll_module_status = "Enable";
      payroll.institute = institute._id;
      await Promise.all([institute.save(), payroll.save()]);
      res.status(200).send({
        message: "Successfully Assigned Payroll Staff",
        payroll: payroll._id,
        status: true,
      });
    } catch (e) {
      console.log(e);
    }
};
  
exports.render_payroll_master_query = async (req, res) => {
  try {
    const { pid } = req.params;
    if(!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const payroll = await PayrollModule.findById({ _id: pid })
      .select(
        "employer_details created_at"
      )
      .populate({
        path: "institute",
        select:
          "id adminRepayAmount insBankBalance admissionDepart admissionStatus transportStatus hostelDepart libraryActivate transportDepart library alias_pronounciation financeDepart",
      })
      .populate({
        path: "payroll_manager",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });
    const payroll_bind = {
      message: "Payroll Master Query",
      payroll: payroll,
      roles: null,
    }
    const payrollEncrypt = await encryptionPayload(payroll_bind);
    res.status(200).send({ encrypt: payrollEncrypt });
  } catch (e) {
    console.log(e);
  }
};

exports.render_edit_payroll_employer_query = async (req, res) => {
  try {
    const { pid } = req.params;
    if(!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    await PayrollModule.findByIdAndUpdate(pid, req?.body)
    res.status(200).send({ message: "Explore Edit Payroll Employer Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_salary_heads_query = async (req, res) => {
  try {
    const { pid } = req.params;
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const list = ["ALLOWANCES", "PERQUISITES"]
    const payroll = await PayrollModule.findById({ _id: pid })
    const new_heads = new SalaryHeads({ 
      ...req?.body
    })
    new_heads.heads_key = new_heads?.heads_parent
    // if (list?.includes(`${new_heads?.heads_parent}`)) {
    //   payroll.salary_custom_heads.push(new_heads?._id)
    // }
    // else {
      payroll.salary_heads.push(new_heads?._id)
    // }
    new_heads.payroll = payroll?._id
    await Promise.all([payroll.save(), new_heads.save()])
    res.status(200).send({ message: "Explore New Salary Heads Query", access: true })
    if (payroll?.basic_pay_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Basic Pay",
        heads_toggle: false,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "BASIC_PAY",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.basic_pay_linked_head_status.master = new_heads?._id;
      payroll.basic_pay_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.da_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Dearness Allowances",
        heads_toggle: false,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "DA",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.da_linked_head_status.master = new_heads?._id;
      payroll.da_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.hra_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "House Rent Allowances",
        heads_toggle: false,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "HRA",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.hra_linked_head_status.master = new_heads?._id;
      payroll.hra_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.advance_salary_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Advance Salary",
        heads_toggle: false,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "ADVANCE_SALARY",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.advance_salary_linked_head_status.master = new_heads?._id;
      payroll.advance_salary_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.bonus_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Bonus",
        heads_toggle: false,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "BONUS",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.bonus_linked_head_status.master = new_heads?._id;
      payroll.bonus_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.arrears_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Arrears",
        heads_toggle: false,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "ARREARS",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.arrears_linked_head_status.master = new_heads?._id;
      payroll.arrears_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.employee_pf_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Employee Provident Fund",
        heads_toggle: false,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_key: "EPF",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.employee_pf_linked_head_status.master = new_heads?._id;
      payroll.employee_pf_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.advance_salary_deduction_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Advance Salary Deduction",
        heads_toggle: false,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_key: "ADVANCE_SALARY_DEDUCTION",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.advance_salary_deduction_linked_head_status.master = new_heads?._id;
      payroll.advance_salary_deduction_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.pt_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Professional Tax",
        heads_toggle: false,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_key: "PT",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.pt_linked_head_status.master = new_heads?._id;
      payroll.pt_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.emplyee_esi_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "ESI",
        heads_toggle: false,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_key: "ESI",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.emplyee_esi_linked_head_status.master = new_heads?._id;
      payroll.emplyee_esi_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.employar_pf_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Employar Provident Fund",
        heads_toggle: false,
        heads_type: "EMPLOYAR_DEDUCTION",
        heads_key: "EPF",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.employar_pf_linked_head_status.master = new_heads?._id;
      payroll.employar_pf_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.emplyar_esi_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "ESI",
        heads_toggle: false,
        heads_type: "EMPLOYAR_DEDUCTION",
        heads_key: "ESI",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.emplyar_esi_linked_head_status.master = new_heads?._id;
      payroll.emplyar_esi_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.gratuity_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "Grauity",
        heads_toggle: false,
        heads_type: "EMPLOYAR_DEDUCTION",
        heads_key: "GRAUITY",
        heads_enable: "NO"
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.gratuity_linked_head_status.master = new_heads?._id;
      payroll.gratuity_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    if (payroll?.tds_linked_head_status?.status === "Not Linked") {
      const new_heads = new SalaryHeads({ 
        heads_name: "TDS",
        heads_toggle: false,
        heads_type: "COMPLIANCES",
        heads_key: "TDS",
      })
      new_heads.payroll = payroll?._id
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      payroll.tds_linked_head_status.master = new_heads?._id;
      payroll.tds_linked_head_status.status = "Linked";
      await Promise.all([new_heads.save()]);
    }
    await payroll.save()
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_salary_heads_query = async (req, res) => {
  try {
    const { pid } = req.params;
    const { type } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if(!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    var payroll = await PayrollModule.findById({ _id: pid })
    var all_heads = await SalaryHeads.find({ $and: [{ _id: { $in: payroll?.salary_heads } }, { heads_type: { $regex: `${type}`, $options: "i"}}] })
      .limit(limit)
      .skip(skip)
    if (all_heads?.length > 0) {
      res.status(200).send({ message: `Explore All Salary Heads Query`, access: true, all_heads: all_heads})
    }
    else {
      res.status(200).send({ message: `No Salary Heads Query`, access: true, all_heads: []})
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_salary_heads_query = async (req, res) => {
  try {
    const { shid } = req.params;
    if(!shid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    var head = await SalaryHeads.findById({ _id: shid })
    var obj = {
      "01": 0,
      "02": 0,
      "03": 0,
      "04": 0,
      "05": 0,
      "06": 0,
      "07": 0,
      "08": 0,
      "09": 0,
      "10": 0,
      "11": 0,
      "12": 0
    }
      var price = head?.collect_staff_price?.filter((val) => {
        obj[`${val?.month}`] += val?.price
      })
    res.status(200).send({ message: `Explore One Salary Heads Query`, access: true, head, obj})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_salary_heads_nested_query = async (req, res) => {
  try {
    const { pid } = req.params;
    const { type } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if(!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    var payroll = await PayrollModule.findById({ _id: pid })
    var all_heads = await SalaryHeads.find({ $and: [{ _id: { $in: payroll?.salary_custom_heads } }, { heads_parent: { $regex: `${type}`, $options: "i"}}] })
      .limit(limit)
      .skip(skip)
    if (all_heads?.length > 0) {
      res.status(200).send({ message: `Explore All Salary Heads Query`, access: true, all_heads: all_heads})
    }
    else {
      res.status(200).send({ message: `No Salary Heads Query`, access: true, all_heads: []})
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_salary_structure_query = async (req, res) => {
  try {
    const { pid } = req.params;
    const { sal_com, employee_ded, employar_ded, com, status } = req?.body
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const payroll = await PayrollModule.findById({ _id: pid })
    const new_structure = new SalaryStructure({})
    new_structure.payroll = payroll?._id
    for (var val of sal_com) {
      new_structure.salary_components.push({
        head_amount: val?.head_amount,
        master: val?.master
      })
    }
    for (var val of employee_ded) {
      new_structure.employee_deduction.push({
        head_amount: val?.head_amount,
        master: val?.master
      })
    }
    for (var val of employar_ded) {
      new_structure.employar_deduction.push({
        head_amount: val?.head_amount,
        master: val?.master
      })
    }
    for (var val of com) {
      new_structure.compliances.push({
        head_amount: val?.head_amount,
        master: val?.master
      })
    }
    new_structure.structure_status = `${status}`
    payroll.salary_structure.push(new_structure?._id)
    await Promise.all([payroll.save(), new_structure.save()])
    res.status(200).send({ message: "Explore New Salary Structure Query", access: true })
    var all_staff = await Staff.find({ $and: [{ institute: payroll?.institute}, { staff_grant_status: `${status}`}]})
    for (var ele of all_staff) {
      const exist = new SalaryStructure({})
      exist.payroll = payroll?._id
      exist.staff = ele?._id
      for (var val of sal_com) {
        exist.salary_components.push({
          head_amount: val?.head_amount,
          master: val?.master
        })
      }
      for (var val of employee_ded) {
        exist.employee_deduction.push({
          head_amount: val?.head_amount,
          master: val?.master
        })
      }
      for (var val of employar_ded) {
        exist.employar_deduction.push({
          head_amount: val?.head_amount,
          master: val?.master
        })
      }
      for (var val of com) {
        exist.compliances.push({
          head_amount: val?.head_amount,
          master: val?.master
        })
      }
      ele.salary_structure = exist?._id
      await Promise.all([ ele.save(), exist.save() ])
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_salary_structure_query = async (req, res) => {
  try {
    const { pid } = req.params;
    const { type } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if(!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    var payroll = await PayrollModule.findById({ _id: pid })
    var all_structure = await SalaryStructure.find({ $and: [{ _id: { $in: payroll?.salary_structure } }, { structure_status: { $regex: `${type}`, $options: "i"}}] })
      .limit(limit)
      .skip(skip)
    if (all_structure?.length > 0) {
      res.status(200).send({ message: `Explore All Salary Structure Query`, access: true, all_structure: all_structure})
    }
    else {
      res.status(200).send({ message: `No Salary Structure Query`, access: true, all_structure: []})
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_salary_structure_query = async (req, res) => {
  try {
    const { srid } = req.params;
    if(!srid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    var struct = await SalaryStructure.findById({ _id: srid })
      .populate({
        path: "salary_components",
        populate: {
          path: "master"
        }
      })
      .populate({
        path: "employee_deduction",
        populate: {
          path: "master"
        }
    })
    .populate({
      path: "employar_deduction",
      populate: {
        path: "master"
      }
  })
  .populate({
    path: "compliances",
    populate: {
      path: "master"
    }
  })
    res.status(200).send({ message: `Explore One Salary Structure Query`, access: true, struct})
  }
  catch (e) {
    console.log(e)
  }
}

var data_set = [
  {
    month_year: `/01/${new Date().getFullYear()}`,
    days: "31"
  },
  {
    month_year: `/02/${new Date().getFullYear()}`,
    days: "28"
  },
  {
    month_year: `/03/${new Date().getFullYear()}`,
    days: "31"
  },
  {
    month_year: `/04/${new Date().getFullYear()}`,
    days: "30"
  },
  {
    month_year: `/05/${new Date().getFullYear()}`,
    days: "31"
  },
  {
    month_year: `/06/${new Date().getFullYear()}`,
    days: "30"
  },
  {
    month_year: `/07/${new Date().getFullYear()}`,
    days: "31"
  },
  {
    month_year: `/08/${new Date().getFullYear()}`,
    days: "31"
  },
  {
    month_year: `/09/${new Date().getFullYear()}`,
    days: "30"
  },
  {
    month_year: `/10/${new Date().getFullYear()}`,
    days: "31"
  },
  {
    month_year: `/11/${new Date().getFullYear()}`,
    days: "30"
  },
  {
    month_year: `/12/${new Date().getFullYear()}`,
    days: "31"
  },
]

exports.render_staff_salary_days = async (req, res) => {
  try {
    const { sid } = req.params;
    const { month, year } = req.query;
    // const { salary_day } = req?.body
    if (!sid || !year) {
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
      });
    }
    days = data_set?.filter((val) => {
      // if (`${val?.month}` === "02" && year / 4 == 0) {
      //   return 29
      // }
      // else {
        if(`${val?.month_year}` === `/${month}/${year}`) return val?.days 
      // }
    })
    let regularexp = "";
    if (month) regularexp = new RegExp(`\/${month}\/${year}$`);
    else regularexp = new RegExp(`\/${year}$`);
    let salary_days = {
      total_working_days: parseInt(days[0]?.days),
      present: 0,
      paid_leaves: 0,
      unpaid_leaves: 0,
      absent: 0,
      holiday: 0,
      sal_day: 0
    };
    const staff = await Staff.findById(sid);
    if (staff?.attendDates?.length > 0) {
      const attendance = await StaffAttendenceDate.find({
        _id: { $in: staff.attendDates },
        staffAttendDate: { $regex: regularexp },
      }).select("staffAttendDate absentStaff");
      for (let day of attendance) {
        let flag = true;
        for (let abs of day?.absentStaff) {
          if (`${abs.staff}` === `${sid}`) {
            flag = false;
            break;
          }
        }
        if (flag) {
          salary_days.present += 1;
        } else {
          salary_days.absent += 1;
        }
      }
      salary_days.paid_leaves = staff?.leave_taken ?? 0;
    }
    res.status(200).send({
      message: "One staff salary days related data.",
      salary_days: {
        total_working_days: salary_days?.total_working_days ?? 0,
        present: salary_days?.present ?? 0,
        paid_leaves: salary_days?.paid_leaves ?? 0,
        unpaid_leaves: (salary_days?.total_working_days) - (salary_days?.paid_leaves + salary_days?.holiday + salary_days?.present) ?? 0,
        absent: salary_days?.absent ?? 0,
        holiday: salary_days?.holiday ?? 0,
        sal_day: salary_days?.present + salary_days?.paid_leaves + salary_days?.holiday 
      },
      access: true
    });
    // if (salary_day) {
    //   if (staff?.salary_days?.length > 0) {
    //     for (var val of staff?.salary_days) {
    //       if (`/${val?.month}/${val?.year}` === `/${month}/${year}`) {
            
    //       }
    //       else {
    //         staff.salary_days.push({
    //           total_working_days: salary_day?.total_working_days,
    //           present: salary_day?.present,
    //           paid_leaves: salary_day?.paid_leaves,
    //           unpaid_leaves: salary_day?.unpaid_leaves,
    //           absent: salary_day?.absent,
    //           holiday: salary_day?.holiday,
    //           month: month,
    //           year: year
    //         })
    //       }
    //     }
    //   }
    //   else {
    //     staff.salary_days.push({
    //       total_working_days: salary_day?.total_working_days,
    //       present: salary_day?.present,
    //       paid_leaves: salary_day?.paid_leaves,
    //       unpaid_leaves: salary_day?.unpaid_leaves,
    //       absent: salary_day?.absent,
    //       holiday: salary_day?.holiday,
    //       month: month,
    //       year: year
    //     })
    //   }
    // }
    
  } catch (e) {
    console.log(e);
  }
};

exports.render_attendance_sheet_query = async (req, res) => {
  try {
    const { sid } = req.params;
    const { month, year } = req.query;
    if (!sid || !year) {
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
      });
    }
    days = data_set?.filter((val) => {
        if(`${val?.month}` === `/${month}/${year}`) return val?.days 
    })
    let regularexp = "";
    if (month) regularexp = new RegExp(`\/${month}\/${year}$`);
    else regularexp = new RegExp(`\/${year}$`);
    let salary_days = {
      total_working_days: days[0],
      present: 0,
      paid_leaves: 0,
      unpaid_leaves: 0,
      absent: 0,
      holiday: 0,
      dates: {}
    };
    const staff = await Staff.findById(sid);
    if (staff?.attendDates?.length > 0) {
      const attendance = await StaffAttendenceDate.find({
        _id: { $in: staff.attendDates },
        staffAttendDate: { $regex: regularexp },
      }).select("staffAttendDate absentStaff");
      for (let day of attendance) {
        let flag = true;
        for (let abs of day?.absentStaff) {
          if (`${abs.staff}` === `${sid}`) {
            flag = false;
            break;
          }
        }
        if (flag) {
          salary_days.present += 1;
        } else {
          salary_days.absent += 1;
        }
      }
      salary_days.paid_leaves = staff?.leave_taken ?? 0;
    }
    res.status(200).send({
      message: "One staff attendance sheet query",
      access: true
    });
    
  } catch (e) {
    console.log(e);
  }
};

exports.render_staff_salary_structure_edit_query = async (req, res) => {
  try {
    const { sid } = req?.params
    const { srid } = req?.body
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const staff = await Staff.findById({ _id: sid })
    const structure = await SalaryStructure.findByIdAndUpdate(srid, req?.body)
    res.status(200).send({ message: "Explore Staff Structure Price Edit Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_staff_salary_compute = async (req, res) => {
  try {
    const { sid } = req.params;
    const { month, year } = req.query;
    // const { salary_day } = req?.body
    if (!sid || !year) {
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
      });
    }
    days = data_set?.filter((val) => {
        if(`${val?.month_year}` === `/${month}/${year}`) return val?.days 
    })
    let regularexp = "";
    if (month) regularexp = new RegExp(`\/${month}\/${year}$`);
    else regularexp = new RegExp(`\/${year}$`);
    let salary_days = {
      total_working_days: parseInt(days[0]?.days),
      present: 0,
      paid_leaves: 0,
      unpaid_leaves: 0,
      absent: 0,
      holiday: 0,
    };
    const staff = await Staff.findById(sid);
    const structure = await SalaryStructure.findById({ _id: `${staff?.salary_structure}` })
    .populate({
      path: "salary_components",
      populate: {
        path: "master"
      }
    })
    .populate({
      path: "employee_deduction",
      populate: {
        path: "master"
      }
  })
  .populate({
    path: "employar_deduction",
    populate: {
      path: "master"
    }
})
.populate({
  path: "compliances",
  populate: {
    path: "master"
  }
})
    if (staff?.attendDates?.length > 0) {
      const attendance = await StaffAttendenceDate.find({
        _id: { $in: staff.attendDates },
        staffAttendDate: { $regex: regularexp },
      }).select("staffAttendDate absentStaff");
      for (let day of attendance) {
        let flag = true;
        for (let abs of day?.absentStaff) {
          if (`${abs.staff}` === `${sid}`) {
            flag = false;
            break;
          }
        }
        if (flag) {
          salary_days.present += 1;
        } else {
          salary_days.absent += 1;
        }
      }
      salary_days.paid_leaves = staff?.leave_taken ?? 0;
    }
     salary_days = {
        total_working_days: salary_days?.total_working_days ?? 0,
        present: salary_days?.present ?? 0,
        paid_leaves: salary_days?.paid_leaves ?? 0,
        unpaid_leaves: (salary_days?.total_working_days) - (salary_days?.paid_leaves + salary_days?.holiday) ?? 0,
        absent: salary_days?.absent ?? 0,
       holiday: salary_days?.holiday ?? 0,
        sal_day: salary_days?.present + salary_days?.paid_leaves + salary_days?.holiday 
     }
       var custom_obj = {
         one_day_sal: 0,
         basic_pay: 0,
         da: 0,
         hra: 0,
         allowance: 0,
         bonus: 0,
         perks: 0,
         ads: 0,
         arr: 0,
         total_earnings: 0,
         pt: 0,
         employee_si: 0,
         ads_deduct: 0,
         employee_pf: 0,
         total_pay: 0,
         employar_si: 0,
         employar_pf: 0,
         gratuity: 0,
         net_pay: 0,
         tds: 0,
         employar_ps: 0,
         employar_charges: 0,
         ctc: 0
       }
    for (var val of structure?.salary_components) {
      if (val?.master?.heads_key === "BASIC_PAY") {
        custom_obj.one_day_sal = (val?.head_amount / salary_days?.total_working_days)?.toFixed(2)
        custom_obj.basic_pay = salary_days?.sal_day * parseInt(custom_obj.one_day_sal)
        val.head_amount = parseInt(custom_obj.basic_pay)
      }
      if (val?.master?.heads_key === "DA") {
        if (val?.master?.heads_toggle) {
          custom_obj.da += ((custom_obj.basic_pay * val?.master?.heads_percentage) / 100)?.toFixed(2)
          val.head_amount = parseInt(custom_obj.da)
        }
        else {
          custom_obj.da += val?.head_amount
          val.head_amount = parseInt(custom_obj.da)
        }
      }
      if (val?.master?.heads_key === "HRA") {
        custom_obj.hra += val?.head_amount
        val.head_amount = parseInt(custom_obj.hra)
      }
      if (val?.master?.heads_key === "ALLOWANCES") {
        if (val?.master?.heads_toggle) {
          custom_obj.allowance += ((custom_obj.basic_pay * val?.master?.heads_percentage) / 100)?.toFixed(2)
          val.head_amount = parseInt(((custom_obj.basic_pay * val?.master?.heads_percentage) / 100)?.toFixed(2))
        }
        else {
          custom_obj.allowance += val?.head_amount
        }
      }
      if (val?.master?.heads_key === "BONUS") {
        custom_obj.bonus += val?.head_amount
        val.head_amount = parseInt(custom_obj.bonus)
      }
      if (val?.master?.heads_key === "PERQUISITES") {
        custom_obj.perks += val?.head_amount
      }
      if (val?.master?.heads_key === "ADVANCE_SALARY") {
        custom_obj.ads += val?.head_amount
        val.head_amount = parseInt(custom_obj.ads)
      }
      if (val?.master?.heads_key === "ARREARS") {
        custom_obj.arr += val?.head_amount
        val.head_amount = parseInt(custom_obj.arr)
      }
    }
    for (var val of structure?.employee_deduction) {
      if (val?.master?.heads_key === "PT") {
        custom_obj.pt = (custom_obj?.basic_pay > 7000 ? 200 : staff?.staffGender?.toLowerCase() === "male" ? 175 : 0)
        val.head_amount = parseInt(custom_obj.pt)
      }
      if (val?.master?.heads_key === "ESI") {
          custom_obj.employee_si += (custom_obj.basic_pay > 21000 ? (custom_obj.basic_pay * 0.75) /100 : 0 )?.toFixed(2)
          val.head_amount = parseInt(custom_obj.employee_si)
      }
      if (val?.master?.heads_key === "ADVANCE_SALARY_DEDUCTION") {
        custom_obj.ads_deduct += val?.head_amount
        val.head_amount = parseInt(custom_obj.ads_deduct)
      }
      if (val?.master?.heads_key === "EPF") {
        custom_obj.employee_pf += (((custom_obj?.basic_pay + custom_obj?.da) * 12.1) / 100)?.toFixed(2)
        val.head_amount = parseInt(custom_obj.employee_pf)
      }
    }
    for (var val of structure?.compliances) {
      if (val?.master?.heads_key === "TDS") {
        custom_obj.tds += val?.head_amount
        val.head_amount = parseInt(custom_obj.tds)
      }
    }
    for (var val of structure?.employar_deduction) {
      if (val?.master?.heads_key === "ESI") {
          custom_obj.employar_si += (custom_obj.basic_pay > 21000 ? (custom_obj.basic_pay * 3.25) /100 : 0 )?.toFixed(2)
          val.head_amount = parseInt(custom_obj.employar_si)
      }
      if (val?.master?.heads_key === "GRAUITY") {
        if (val?.master?.heads_enable === "YES") {
          let date1 = new Date(`${staff?.staffJoinDate}`)?.getFullYear()
          let date2 = new Date()?.getFullYear()
          let diff = date2 - date1
          custom_obj.gratuity += (custom_obj.basic_pay * diff * 15) / 30
          val.head_amount = parseInt(custom_obj.gratuity)
        }
        else {
          let date1 = new Date(`${staff?.staffJoinDate}`)?.getFullYear()
          let date2 = new Date()?.getFullYear()
          let diff = date2 - date1
          custom_obj.gratuity += (custom_obj.basic_pay * diff) / 26
          val.head_amount = parseInt(custom_obj.gratuity)
        }
        
      }
      if (val?.master?.heads_key === "EPF") {
        custom_obj.employar_pf += (((custom_obj?.basic_pay + custom_obj?.da) * 3.67) / 100)?.toFixed(2)
        custom_obj.employar_ps += (((custom_obj?.basic_pay + custom_obj?.da) * 8.33) / 100)?.toFixed(2)
        custom_obj.employar_charges += (((custom_obj?.basic_pay + custom_obj?.da) * 0.5) / 100)?.toFixed(2) 
        val.head_amount = parseInt(custom_obj.employar_pf + custom_obj.employar_ps + custom_obj.employar_charges)
      }
    }
    custom_obj.total_earnings += parseInt(custom_obj?.basic_pay) + parseInt(custom_obj?.da) + parseInt(custom_obj?.hra) + parseInt(custom_obj?.allowance) + parseInt(custom_obj?.bonus) + parseInt(custom_obj?.perks) + parseInt(custom_obj?.arr) + parseInt(custom_obj?.ads)
    custom_obj.total_pay += (custom_obj?.total_earnings  - (parseInt(custom_obj?.employee_pf) + parseInt(custom_obj?.employee_si) + parseInt(custom_obj?.pt) + parseInt(custom_obj?.ads_deduct)))
    custom_obj.net_pay += custom_obj.total_pay - parseInt(custom_obj.tds)
    custom_obj.ctc += custom_obj.total_pay + parseInt(custom_obj.employar_si) + parseInt(custom_obj.gratuity) + parseInt(custom_obj.employar_pf) + parseInt(custom_obj.employar_ps) + parseInt(custom_obj.employar_charges)

    structure.one_day_sal = parseInt(custom_obj?.one_day_sal),
    structure.da = parseInt(custom_obj?.da),
    structure.basic_pay = parseInt(custom_obj?.basic_pay),
    structure.hra = parseInt(custom_obj?.hra),
    structure.allowance = parseInt(custom_obj?.allowance),
    structure.bonus = parseInt(custom_obj?.bonus),
    structure.perks = parseInt(custom_obj?.perks),
    structure.ads = parseInt(custom_obj?.ads),
    structure.arr = parseInt(custom_obj?.arr),
    structure.total_earnings = parseInt(custom_obj?.total_earnings),
    structure.pt = parseInt(custom_obj?.pt),
    structure.employee_si = parseInt(custom_obj?.employee_si),
    structure.ads_deduct = parseInt(custom_obj?.ads_deduct),
    structure.employee_pf = parseInt(custom_obj?.employee_pf),
    structure.total_pay = parseInt(custom_obj?.total_pay),
    structure.employar_si = parseInt(custom_obj?.employar_si),
    structure.employar_pf = parseInt(custom_obj?.employar_pf),
    structure.gratuity = parseInt(custom_obj?.gratuity),
    structure.net_pay = parseInt(custom_obj?.net_pay),
    structure.tds = parseInt(custom_obj?.tds),
    structure.employar_ps = parseInt(custom_obj?.employar_ps),
    structure.employar_charges = parseInt(custom_obj?.employar_charges),
      structure.ctc = parseInt(custom_obj?.ctc)
    // await structure.save()
    res.status(200).send({
      message: "One staff salary computation data.",
      access: true,
      custom_obj,
      structure: structure
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_staff_salary_compute_finalize = async (req, res) => {
  try {
    const { sid } = req.params;
    const { month, year, pid, salary_struct, custom_obj } = req.body;
    if (!sid || !year) {
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
      });
    }
    var staff = await Staff.findById({ _id: sid })
    var payroll = await PayrollModule.findById({ _id: pid })
    days = data_set?.filter((val) => {
        if(`${val?.month_year}` === `/${month}/${year}`) return val?.days 
    })
    let regularexp = "";
    if (month) regularexp = new RegExp(`\/${month}\/${year}$`);
    else regularexp = new RegExp(`\/${year}$`);
    let salary_days = {
      total_working_days: parseInt(days[0]?.days),
      present: 0,
      paid_leaves: 0,
      unpaid_leaves: 0,
      absent: 0,
      holiday: 0,
    };
    if (staff?.attendDates?.length > 0) {
      const attendance = await StaffAttendenceDate.find({
        _id: { $in: staff.attendDates },
        staffAttendDate: { $regex: regularexp },
      }).select("staffAttendDate absentStaff");
      for (let day of attendance) {
        let flag = true;
        for (let abs of day?.absentStaff) {
          if (`${abs.staff}` === `${sid}`) {
            flag = false;
            break;
          }
        }
        if (flag) {
          salary_days.present += 1;
        } else {
          salary_days.absent += 1;
        }
      }
      salary_days.paid_leaves = staff?.leave_taken ?? 0;
    }
     salary_days = {
        total_working_days: salary_days?.total_working_days ?? 0,
        present: salary_days?.present ?? 0,
        paid_leaves: salary_days?.paid_leaves ?? 0,
        unpaid_leaves: (salary_days?.total_working_days) - (salary_days?.paid_leaves + salary_days?.holiday) ?? 0,
        absent: salary_days?.absent ?? 0,
       holiday: salary_days?.holiday ?? 0,
        sal_day: salary_days?.present + salary_days?.paid_leaves + salary_days?.holiday 
     }
    const slip = new PaySlip({})
    slip.staff = staff?._id
    slip.payroll = pid
    slip.month = month
    slip.year = year
    slip.net_payable += custom_obj?.net_pay
    slip.salary_structure.push(salary_struct)
    slip.attendance_stats.push(salary_days)
    staff.pay_slip.push(slip?._id)
    payroll.pay_slip.push(slip?._id)
    var nums = salary_struct
    await Promise.all([slip.save(), staff.save(), payroll.save()])
    res.status(200).send({ message: "Explore One Staff Payroll Finalize", access: true })
    if (nums?.basic_pay) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.basic_pay_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.basic_pay,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.basic_pay,
        month: month,
        year: year,
        heads_key: "BASIC_PAY",
        section: "SALARY_COMPONENTS"
      })
      await exist.save()
    }
    if (nums?.da) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.da_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.da,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.da,
        month: month,
        year: year,
        heads_key: "DA",
        section: "SALARY_COMPONENTS"
      })
      await exist.save()
    }
    if (nums?.hra) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.hra_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.hra,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.hra,
        month: month,
        year: year,
        heads_key: "HRA",
        section: "SALARY_COMPONENTS"
      })
      await exist.save()
    }
    if (nums?.bonus) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.bonus_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.bonus,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.bonus,
        month: month,
        year: year,
        heads_key: "BONUS",
        section: "SALARY_COMPONENTS"
      })
      await exist.save()
    }
    if (nums?.ads) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.advance_salary_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.ads,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.ads,
        month: month,
        year: year,
        heads_key: "ADVANCE_SALARY",
        section: "SALARY_COMPONENTS"
      })
      await exist.save()
    }
    if (nums?.arr) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.arrears_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.arr,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.arr,
        month: month,
        year: year,
        heads_key: "ARREARS",
        section: "SALARY_COMPONENTS"
      })
      await exist.save()
    }

    if (nums?.employee_pf) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.employee_pf_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.employee_pf,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.employee_pf,
        month: month,
        year: year,
        heads_key: "EPF",
        section: "EMPLOYEE_DEDUCTION"
      })
      await exist.save()
    }

    if (nums?.ads_deduct) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.advance_salary_deduction_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.ads_deduct,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.ads_deduct,
        month: month,
        year: year,
        heads_key: "ADVANCE_SALARY_DEDUCTION",
        section: "EMPLOYEE_DEDUCTION"
      })
      await exist.save()
    }

    if (nums?.pt) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.pt_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.pt,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.pt,
        month: month,
        year: year,
        heads_key: "PT",
        section: "EMPLOYEE_DEDUCTION"
      })
      await exist.save()
    }

    if (nums?.employee_si) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.emplyee_esi_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.employee_si,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.employee_si,
        month: month,
        year: year,
        heads_key: "ESI",
        section: "EMPLOYEE_DEDUCTION"
      })
      await exist.save()
    }

    if (nums?.employar_pf) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.employar_pf_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.employar_pf,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.employar_pf,
        month: month,
        year: year,
        heads_key: "EPF",
        section: "EMPLOYAR_DEDUCTION"
      })
      await exist.save()
    }

    if (nums?.employar_si) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.emplyar_esi_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.employar_si + nums?.employar_ps + nums?.employar_charges,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.employar_si + nums?.employar_ps + nums?.employar_charges,
        month: month,
        year: year,
        heads_key: "ESI",
        section: "EMPLOYAR_DEDUCTION"
      })
      await exist.save()
    }

    if (nums?.gratuity) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.gratuity_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.gratuity,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.gratuity,
        month: month,
        year: year,
        heads_key: "Grauity",
        section: "EMPLOYAR_DEDUCTION"
      })
      await exist.save()
    }

    if (nums?.tds) {
      const exist = await SalaryHeads.findById({ _id: `${payroll.tds_linked_head_status?.master}` })
      exist.collect_staff_price.push({
        price: nums?.tds,
        month: month,
        year: year
      })
      staff.monthly_heads_data.push({
        price: nums?.tds,
        month: month,
        year: year,
        heads_key: "TDS",
        section: "COMPLIANCES"
      })
      await exist.save()
    }

    if (payroll?.monthly_funds?.length > 0) {
      for (var val of payroll?.monthly_funds) {
        if (`${val?.month}/${val?.year}` === `${month}/${year}`) {
          val.net_allocate_pay += nums?.net_pay
        }
        else {
          payroll?.monthly_funds.push({
            month: month,
            year: year,
            net_allocate_pay: nums?.net_pay
          })
          staff.monthly_heads_data.push({
            price: nums?.net_pay,
            month: month,
            year: year,
            heads_key: "NET_PAY",
            section: "NET_PAY"
          })
        }
      }
    }
    else {
      payroll?.monthly_funds.push({
        month: month,
        year: year,
        net_allocate_pay: nums?.net_pay
      })
      staff.monthly_heads_data.push({
        price: nums?.net_pay,
        month: month,
        year: year,
        heads_key: "NET_PAY",
        section: "NET_PAY"
      })
    }
    await Promise.all([ staff.save(), payroll.save()])
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_monthly_funds_query = async (req, res) => {
  try {
    const { pid } = req?.params
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed imeediately", access: false })
    
    const payroll = await PayrollModule.findById({ _id: pid })
    let y = new Date()?.getFullYear()
    var obj = {
      "01": 0,
      "02": 0,
      "03": 0,
      "04": 0,
      "05": 0,
      "06": 0,
      "07": 0,
      "08": 0,
      "09": 0,
      "10": 0,
      "11": 0,
      "12": 0
    }
    payroll?.monthly_funds?.filter((val) => {
      obj[`${val?.month}`] = val?.net_allocate_pay
    })
      res.status(200).send({ message: "Explore Financial Year Query", access: true, monthly: obj})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_salary_slip_query = async (req, res) => {
  try {
    const { pid } = req?.params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed imeediately", access: false })
    
    const payroll = await PayrollModule.findById({ _id: pid })
    var all_slip = await PaySlip.find({ _id: { $in: payroll?.pay_slip } })
      .select("created_at year net_payable month")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "staff",
        select: "staffFirstName staffMiddleName staffLastName staff_grant_status staffROLLNO staffPanNumber"
      })
      .populate({
        path: "payroll",
        populate: {
          path: "institute"
        }
      })
    if (all_slip?.length > 0) {
      res.status(200).send({ message: "Explore All Salary Slip Query", access: true, all_slip: all_slip})
    }
    else {
      res.status(200).send({ message: "No Salary Slip Query", access: false, all_slip: []})
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_salary_slip_query = async (req, res) => {
  try {
    const { slid } = req?.params
    if (!slid) return res.status(200).send({ message: "Their is a bug need to fixed imeediately", access: false })
    
    const slip = await PaySlip.findById({ _id: slid })
      .populate({
        path: "staff",
        select: "staffFirstName staffMiddleName staffLastName staff_grant_status staffROLLNO staffPanNumber"
      })
      .populate({
        path: "payroll",
        populate: {
          path: "institute"
        }
      })
      res.status(200).send({ message: "Explore One Salary Slip Query", access: true, slip: slip})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_returns_tab_query = async (req, res) => {
  try {
    const { pid } = req?.params
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed imeediately", access: false })
    
    const payroll = await PayrollModule.findById({ _id: pid })
    .select("emplyar_esi_linked_head_status gratuity_linked_head_status emplyee_esi_linked_head_status pt_linked_head_status tds_linked_head_status employar_pf_linked_head_status employee_pf_linked_head_status")
    let tab = {
      epf: "EPF",
      esi: "ESI",
      pt: "PT",
      tds: "TDS",
      eps: "GRAUITY"
    }
    res.status(200).send({ message: "Explore Returns TAB Query", access: true, tab: tab})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_returns_tab_add_details_query = async (req, res) => {
  try {
    const { pid } = req?.params
    const { month, year, key, bsr_code, dod, challan_sn, return_attach, challan_attach, oltas_status, quarter, price, receipt_no, flow } = req?.body
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed imeediately", access: false })
    
    const payroll = await PayrollModule.findById({ _id: pid })
    if (flow === "MONTHLY") {
      if (key === "PT") {
        const exist = await SalaryHeads.findById({ _id: payroll?.pt_linked_head_status?.master }) 
        exist.returns_month.push({
          month: month,
          year: year,
          bsr_code: bsr_code,
          dod: dod,
          challan_sn: challan_sn,
          return_attach: return_attach,
          challan_attach: challan_attach,
          oltas_status: oltas_status
        })
        await exist.save()
      }
      else if (key === "GRAUITY") {
        const exist = await SalaryHeads.findById({ _id: payroll?.gratuity_linked_head_status?.master}) 
        exist.returns_month.push({
          month: month,
          year: year,
          bsr_code: bsr_code,
          dod: dod,
          challan_sn: challan_sn,
          return_attach: return_attach,
          challan_attach: challan_attach,
          oltas_status: oltas_status
        })
        await exist.save()
      }
      else if (key === "TDS") {
        const exist = await SalaryHeads.findById({ _id: payroll?.tds_linked_head_status?.master}) 
        exist.returns_month.push({
          month: month,
          year: year,
          bsr_code: bsr_code,
          dod: dod,
          challan_sn: challan_sn,
          return_attach: return_attach,
          challan_attach: challan_attach,
          oltas_status: oltas_status
        })
        await exist.save()
      }
      else if (key === "EPF") {
        const exist_employee = await SalaryHeads.findById({ _id: payroll?.employee_pf_linked_head_status?.master }) 
        const exist_employar = await SalaryHeads.findById({ _id: payroll?.employar_pf_linked_head_status?.master}) 
        exist_employee.returns_month.push({
          month: month,
          year: year,
          bsr_code: bsr_code,
          dod: dod,
          challan_sn: challan_sn,
          return_attach: return_attach,
          challan_attach: challan_attach,
          oltas_status: oltas_status
        })
        exist_employar.returns_month.push({
          month: month,
          year: year,
          bsr_code: bsr_code,
          dod: dod,
          challan_sn: challan_sn,
          return_attach: return_attach,
          challan_attach: challan_attach,
          oltas_status: oltas_status
        })
        await Promise.all([ exist_employee.save(), exist_employar.save() ])
      }
      else if (key === "ESI") {
        const exist_employee = await SalaryHeads.findById({ _id: payroll?.emplyee_esi_linked_head_status?.master}) 
        const exist_emplyar = await SalaryHeads.findById({ _id: payroll?.emplyar_esi_linked_head_status?.master}) 
        exist_employee.returns_month.push({
          month: month,
          year: year,
          bsr_code: bsr_code,
          dod: dod,
          challan_sn: challan_sn,
          return_attach: return_attach,
          challan_attach: challan_attach,
          oltas_status: oltas_status
        })
        exist_emplyar.returns_month.push({
          month: month,
          year: year,
          bsr_code: bsr_code,
          dod: dod,
          challan_sn: challan_sn,
          return_attach: return_attach,
          challan_attach: challan_attach,
          oltas_status: oltas_status
        })
        await Promise.all([exist_employee.save(), exist_emplyar.save()])
      }
    }
    else if (flow === "QUARTERLY") {
      if (key === "PT") {
        const exist = await SalaryHeads.findById({ _id: payroll?.pt_linked_head_status?.master }) 
        exist.returns_quarter.push({
          quarter: quarter,
          year: year,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await exist.save()
      }
      else if (key === "GRAUITY") {
        const exist = await SalaryHeads.findById({ _id: payroll?.gratuity_linked_head_status?.master}) 
        exist.returns_quarter.push({
          quarter: quarter,
          year: year,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await exist.save()
      }
      else if (key === "TDS") {
        const exist = await SalaryHeads.findById({ _id: payroll?.tds_linked_head_status?.master}) 
        exist.returns_quarter.push({
          quarter: quarter,
          year: year,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await exist.save()
      }
      else if (key === "EPF") {
        const exist_employee = await SalaryHeads.findById({ _id: payroll?.employee_pf_linked_head_status?.master}) 
        const exist_emplyar = await SalaryHeads.findById({ _id: payroll?.employar_pf_linked_head_status?.master}) 
        exist_employee.returns_quarter.push({
          quarter: quarter,
          year: year,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        exist_emplyar.returns_quarter.push({
          quarter: quarter,
          year: year,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await Promise.all([ exist_employee.save(), exist_emplyar.save() ])
      }
      else if (key === "ESI") {
        const exist_employee = await SalaryHeads.findById({ _id: payroll?.emplyee_esi_linked_head_status?.master}) 
        const exist_emplyar = await SalaryHeads.findById({ _id: payroll?.emplyar_esi_linked_head_status?.master}) 
        exist_employee.returns_quarter.push({
          quarter: quarter,
          year: year,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        exist_emplyar.returns_quarter.push({
          quarter: quarter,
          year: year,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await Promise.all([ exist_employee.save(), exist_emplyar.save() ])
      }
    }
    else if (flow === "ANNUALLY") {
      if (key === "PT") {
        const exist = await SalaryHeads.findById({ _id: payroll?.pt_linked_head_status?.master }) 
        exist.returns_annual.push({
          annual: annual,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await exist.save()
      }
      else if (key === "GRAUITY") {
        const exist = await SalaryHeads.findById({ _id: payroll?.gratuity_linked_head_status?.master}) 
        exist.returns_annual.push({
          annual: annual,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await exist.save()
      }
      else if (key === "TDS") {
        const exist = await SalaryHeads.findById({ _id: payroll?.tds_linked_head_status?.master}) 
        exist.returns_annual.push({
          annual: annual,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await exist.save()
      }
      else if (key === "EPF") {
        const exist_employee = await SalaryHeads.findById({ _id: payroll?.employee_pf_linked_head_status?.master}) 
        const exist_emplyar = await SalaryHeads.findById({ _id: payroll?.employar_pf_linked_head_status?.master}) 
        exist_employee.returns_annual.push({
          annual: annual,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        exist_emplyar.returns_annual.push({
          annual: annual,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await Promise.all([ exist_employee.save(), exist_emplyar.save() ])
      }
      else if (key === "ESI") {
        const exist_employee = await SalaryHeads.findById({ _id: payroll?.emplyee_esi_linked_head_status?.master}) 
        const exist_emplyar = await SalaryHeads.findById({ _id: payroll?.emplyar_esi_linked_head_status?.master}) 
        exist_employee.returns_annual.push({
          annual: annual,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        exist_emplyar.returns_annual.push({
          annual: annual,
          return_attach: return_attach,
          challan_attach: challan_attach,
          price: price,
          receipt_no: receipt_no
        })
        await Promise.all([ exist_employee.save(), exist_emplyar.save() ])
      }
    }
    res.status(200).send({ message: "Explore Update Returns Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_returns_tab_show_details_query = async (req, res) => {
  try {
    const { pid } = req?.params
    const { month, year, key, quarter, flow } = req?.query
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed imeediately", access: false })
    
    const payroll = await PayrollModule.findById({ _id: pid })
    var obj = {}
    if (flow === "MONTHLY") {
      if (key === "PT") {
        const exist = await SalaryHeads.findById({ _id: payroll?.pt_linked_head_status?.master }) 
        const data = collect_staff_price?.filter((val) => {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) return val?.price
        })
        for (var val of exist.returns_month) {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = data[0]
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "GRAUITY") {
        const exist = await SalaryHeads.findById({ _id: payroll?.gratuity_linked_head_status?.master}) 
        const data = collect_staff_price?.filter((val) => {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) return val?.price
        })
        for (var val of exist.returns_month) {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = data[0]
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "TDS") {
        const exist = await SalaryHeads.findById({ _id: payroll?.tds_linked_head_status?.master}) 
        const data = collect_staff_price?.filter((val) => {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) return val?.price
        })
        for (var val of exist.returns_month) {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = data[0]
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "EPF") {
        const exist = await SalaryHeads.findById({ _id: payroll?.employee_pf_linked_head_status?.master}) 
        const data = collect_staff_price?.filter((val) => {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) return val?.price
        })
        for (var val of exist.returns_month) {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = data[0]
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "ESI") {
        const exist = await SalaryHeads.findById({ _id: payroll?.emplyee_esi_linked_head_status?.master}) 
        const data = collect_staff_price?.filter((val) => {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) return val?.price
        })
        for (var val of exist.returns_month) {
          if (`${val?.month}/${val?.year}` === `${month}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = data[0]
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
    }
    else if (flow === "QUARTERLY") {
      if (key === "PT") {
        const exist = await SalaryHeads.findById({ _id: payroll?.pt_linked_head_status?.master }) 
        for (var val of exist.returns_quarter) {
          if (`${val?.quarter}/${val?.year}` === `${quarter}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "GRAUITY") {
        const exist = await SalaryHeads.findById({ _id: payroll?.gratuity_linked_head_status?.master}) 
        for (var val of exist.returns_quarter) {
          if (`${val?.quarter}/${val?.year}` === `${quarter}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "TDS") {
        const exist = await SalaryHeads.findById({ _id: payroll?.tds_linked_head_status?.master}) 
        for (var val of exist.returns_quarter) {
          if (`${val?.quarter}/${val?.year}` === `${quarter}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "EPF") {
        const exist = await SalaryHeads.findById({ _id: payroll?.employee_pf_linked_head_status?.master}) 
        for (var val of exist.returns_quarter) {
          if (`${val?.quarter}/${val?.year}` === `${quarter}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "ESI") {
        const exist = await SalaryHeads.findById({ _id: payroll?.emplyee_esi_linked_head_status?.master}) 
        for (var val of exist.returns_quarter) {
          if (`${val?.quarter}/${val?.year}` === `${quarter}/${year}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
    }
    else if (flow === "ANNUALLY") {
      if (key === "PT") {
        const exist = await SalaryHeads.findById({ _id: payroll?.pt_linked_head_status?.master }) 
        for (var val of exist.returns_annual) {
          if (`${val?.annual}` === `${annual}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "GRAUITY") {
        const exist = await SalaryHeads.findById({ _id: payroll?.gratuity_linked_head_status?.master}) 
        for (var val of exist.returns_annual) {
          if (`${val?.annual}` === `${annual}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "TDS") {
        const exist = await SalaryHeads.findById({ _id: payroll?.tds_linked_head_status?.master}) 
        for (var val of exist.returns_annual) {
          if (`${val?.annual}` === `${annual}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "EPF") {
        const exist = await SalaryHeads.findById({ _id: payroll?.employee_pf_linked_head_status?.master}) 
        for (var val of exist.returns_annual) {
          if (`${val?.annual}` === `${annual}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
      else if (key === "ESI") {
        const exist = await SalaryHeads.findById({ _id: payroll?.emplyee_esi_linked_head_status?.master}) 
        for (var val of exist.returns_annual) {
          if (`${val?.annual}` === `${annual}`) {
            obj["return"] = val
            obj["net_pay"] = val?.price
          }
        }
        res.status(200).send({ message: `Explore ${key} Returns Query`, access: true, nums: obj})
      }
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_staff_fund_heads_query = async (req, res) => {
  try {
    const { month, year, section, key, pid } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var payroll = await PayrollModule.findById({ _id: pid })
    var all_staff = await Staff.find({ $and: [{ institute: payroll?.institute }, { staffStatus: "Approved" }] })
      .limit(limit)
      .skip(skip)
    .select("staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId staffROLLNO monthly_heads_data")
    for (var val of all_staff) {
      const slip = await PaySlip.findOne({ $and: [{ staff: val?._id }, { month: `${month}`}, { year: `${year}`}]})
      let list = val?.monthly_heads_data?.filter((ele) => {
        console.log(ele)
        if (`${ele?.month}/${ele?.year}` === `${month}/${year}` && ele?.section === section && ele?.heads_key === key) {
          return ele
        }
      })
      console.log(list)
      val.staff_obj.key = `${key}`
      val.staff_obj.value = list?.[0]?.price ?? 0
      val.staff_obj.slip = slip?._id
      val.staff_obj.slip_key = "sign.jpeg"
      list = []
    }
    res.status(200).send({ message: "Explore All Staff Head Wise", access: true, all_staff: all_staff})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_staff_tds_form_query = async (req, res) => {
  try {
    const { sid } = req?.params
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    await Staff.findByIdAndUpdate(sid, req?.body)
    res.status(200).send({ message: "Explore Staff TDS Form update query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_staff_tds_calculate_compute = async (req, res) => {
  try {
    const { sid } = req?.params
    const { year } = req?.body
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const tds_final = new TDSFinance({})
    const staff = await Staff.findById({ _id: sid })
    const struct = await SalaryStructure.findById({ _id: `${staff?.salary_structure}` })
    .populate({
      path: "salary_components",
      populate: {
        path: "master"
      }
    })
    .populate({
      path: "employee_deduction",
      populate: {
        path: "master"
      }
  })
  .populate({
    path: "employar_deduction",
    populate: {
      path: "master"
    }
})
.populate({
  path: "compliances",
  populate: {
    path: "master"
  }
})
var payroll = await PayrollModule.findById({ _id: `${struct?.payroll}` })
    tds_final.staff = staff?._id
    tds_final.payroll = struct?.payroll
    tds_final.tds_data = staff?.tds_calculation
    tds_final.tax_regime = staff?.choose_tax_regime
    tds_final.salary_structure.push(struct)
    var tds_obj = {}
    if (staff?.choose_tax_regime === "OLD_REGIME") {
      
    }
    else if (staff?.choose_tax_regime === "NEW_REGIME") {
      
    }
    else {
      
    }
    let tds = {
      annual: 48000,
      month: 4000,
      rate: "1.25"
    }
    struct.tds = tds?.month
    for (let val of struct.compliances) {
      const exist = await SalaryHeads.findOne({ _id: `${payroll?.tds_linked_head_status?.master}`})
      val.head_amount = struct.tds
      exist.collect_staff_price.year = year 
      exist.collect_staff_price.price += struct.tds
      await exist.save()
    }
    staff.tds_calculation.tds_calculate.annual = tds?.annual
    staff.tds_calculation.tds_calculate.month = tds?.month
    staff.tds_calculation.tds_calculate.rate = tds?.rate
    await Promise.all([ staff.save(), struct.save()])
    res.status(200).send({ message: "Updated TDS Rate", access: true, tdsm: tds?.month, rate: tds?.rate, tdsa: tds?.annual})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_form_16_query = async (req, res) => {
  try {
    const { sid } = req?.params
    const { pid, key, annual } = req?.body
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const staff = await Staff.findById({ _id: sid })
    const payroll = await PayrollModule.findById({ _id: pid })
    payroll.form_16.push({
      annual: annual,
      staff: staff?._id,
      key_a: key
    })
    staff.form_16.annual = annual
    staff.form_16.key_a = key
    await Promise.all([payroll.save(), staff.save()])
    res.status(200).send({ message: "Form 16 Update", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_form_16_query = async (req, res) => {
  try {
    const { pid } = req?.params
    const { annual } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const payroll = await PayrollModule.findById({ _id: pid })
      .select("form_16")
      .populate({
        path: "form_16",
        populate: {
          path: "staff",
          select: "staffFirstName staffMiddleName staffLastName staffROLLNO staffPanNumber"
        }
      })
    let nums = payroll?.form_16?.filter((val) => {
      if(`${val?.annual}` === `${annual}`) return val
    })
    let all_nums = await nested_document_limit(page, limit, nums)
    res.status(200).send({ message: "All Form 16 Update", access: true, all_form: all_nums})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_mark_status_salary_structure_query = async (req, res) => {
  try {
    const { pid } = req.params;
    if (!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const list = ["ALLOWANCES", "PERQUISITES"]
    const payroll = await PayrollModule.findById({ _id: pid })
    for (let val of s_c) {
      const new_heads = new SalaryHeads({
        heads_name: val?.heads_name,
        heads_toggle: val?.heads_toggle,
        heads_type: val?.heads_type,
        heads_key: val?.heads_key,
        heads_parent: val?.heads_parent ?? ""
      })
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      new_heads.payroll = payroll?._id
      await new_heads.save()
    }

    for (let val of employee) {
      const new_heads = new SalaryHeads({
        heads_name: val?.heads_name,
        heads_toggle: val?.heads_toggle,
        heads_type: val?.heads_type,
        heads_key: val?.heads_key,
        heads_parent: val?.heads_parent ?? ""
      })
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      new_heads.payroll = payroll?._id
      await new_heads.save()
    }

    for (let val of employar) {
      const new_heads = new SalaryHeads({
        heads_name: val?.heads_name,
        heads_toggle: val?.heads_toggle,
        heads_type: val?.heads_type,
        heads_key: val?.heads_key,
        heads_parent: val?.heads_parent ?? ""
      })
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      new_heads.payroll = payroll?._id
      await new_heads.save()
    }

    for (let val of compliance) {
      const new_heads = new SalaryHeads({
        heads_name: val?.heads_name,
        heads_toggle: val?.heads_toggle,
        heads_type: val?.heads_type,
        heads_key: val?.heads_key,
        heads_parent: val?.heads_parent ?? ""
      })
      if (list?.includes(`${new_heads?.heads_parent}`)) {
        payroll.salary_custom_heads.push(new_heads?._id)
      }
      else {
        payroll.salary_heads.push(new_heads?._id)
      }
      new_heads.payroll = payroll?._id
      await new_heads.save()
    }
    
    await payroll.save()
    // if (flow === "FIXED") {
    //   const structure = await SalaryHeads.findById({ _id: sid })
    //   structure.structure_status = "Fixed"
    //   await structure.save()
    // }
    // else if (flow === "EMP_WISE") {
    //   const structure = await SalaryHeads.findById({ _id: sid })
    //     .populate({
    //       path: "payroll",
    //       select: "institute"
    //   })
    //   const all_staff = await Staff.find({ $and: [{ institute: structure?.payroll?.institute}, { staff_grant_status: { $regex: `${status}`, $options: "i"}}]})
    //   for (var val of all_staff) {
    //     val.salary_structure = structure?._id
    //     await val.save()
    //   }
    //   structure.structure_status = status
    //   await structure.save()
    // }
    res.status(200).send({ message: `Explore Salary Structure Query`, access: true, payroll})
  }
  catch (e) {
    console.log(e)
  }
}