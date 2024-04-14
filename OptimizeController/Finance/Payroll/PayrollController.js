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
    if (list?.includes(`${new_heads?.heads_parent}`)) {
      payroll.salary_custom_heads.push(new_heads?._id)
    }
    else {
      payroll.salary_heads.push(new_heads?._id)
    }
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
        heads_type: "EMPLOYAR_DEDUCTION",
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
    res.status(200).send({ message: `Explore One Salary Heads Query`, access: true, head})
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
    await Promise.all([payroll.save(), new_structure.save()])
    res.status(200).send({ message: "Explore New Salary Structure Query", access: true })
    var all_staff = await Staff.find({ $and: [{ institute: payroll?.institute}, { staff_grant_status: { $regex: `${status}`, $options: "i"}}]})
    for (var val of all_staff) {
      const exist = new SalaryStructure({})
      exist.payroll = payroll?._id
      exist.staff = val?._id
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
      val.salary_structure = exist?._id
      await Promise.all([ val.save(), exist.save() ])
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_salary_structure_query = async (req, res) => {
  try {
    const { pid } = req.params;
    const { type } = req?.body
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
        if(`${val?.month}` === `/${month}/${year}`) return val?.days 
      // }
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
        unpaid_leaves: (salary_days?.total_working_days) - (salary_days?.paid_leaves + salary_days?.holiday) ?? 0,
        absent: salary_days?.absent ?? 0,
        holiday: salary_days?.holiday ?? 0,
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
    };
    const staff = await Staff.findById(sid);
    const structure = await SalaryStructure.findById({ _id: `${staff?.salary_structure}`})
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
        custom_obj.one_day_sal = (val?.head_amount / salary_days?.sal_day)?.toFixed(2)
        custom_obj.basic_pay = salary_days?.sal_day * custom_obj.one_day_sal
      }
      if (val?.master?.heads_key === "DA") {
        if (val?.master?.heads_toggle) {
          custom_obj.da += ((custom_obj.basic_pay * val?.master?.heads_percentage) / 100)?.toFixed(2)
        }
        else {
          custom_obj.da += val?.head_amount
        }
      }
      if (val?.master?.heads_key === "HRA") {
        custom_obj.hra += val?.head_amount
      }
      if (val?.master?.heads_key === "ALLOWANCES") {
        if (val?.master?.heads_toggle) {
          custom_obj.allowance += ((custom_obj.basic_pay * val?.master?.heads_percentage) / 100)?.toFixed(2)
        }
        else {
          custom_obj.allowance += val?.head_amount
        }
      }
      if (val?.master?.heads_key === "BONUS") {
        custom_obj.bonus += val?.head_amount
      }
      if (val?.master?.heads_key === "PERQUISITES") {
        custom_obj.perks += val?.head_amount
      }
      if (val?.master?.heads_key === "ADVANCE_SALARY") {
        custom_obj.ads += val?.head_amount
      }
      if (val?.master?.heads_key === "ARREARS") {
        custom_obj.arr += val?.head_amount
      }
    }
    for (var val of structure?.employee_deduction) {
      if (val?.master?.heads_key === "PT") {
        custom_obj.pt = (custom_obj?.basic_pay > 7000 ?  200 : staff?.staffGender?.toLowerCase() === "male" ? 175 : 0)
      }
      if (val?.master?.heads_key === "ESI") {
          custom_obj.employee_si += (custom_obj.basic_pay > 21000 ? (custom_obj.basic_pay * 0.75) /100 : 0 )?.toFixed(2)
      }
      if (val?.master?.heads_key === "ADVANCE_SALARY_DEDUCTION") {
        custom_obj.ads_deduct += val?.head_amount
      }
      if (val?.master?.heads_key === "EPF") {
        custom_obj.employee_pf += (((custom_obj?.basic_pay + custom_obj?.da) * 12.1) /100)?.toFixed(2)
      }
    }
    for (var val of structure?.compliances) {
      if (val?.master?.heads_key === "TDS") {
          custom_obj.tds += val?.head_amount
      }
    }
    for (var val of structure?.employar_deduction) {
      if (val?.master?.heads_key === "ESI") {
          custom_obj.employar_si += (custom_obj.basic_pay > 21000 ? (custom_obj.basic_pay * 3.25) /100 : 0 )?.toFixed(2)
      }
      if (val?.master?.heads_key === "GRAUITY") {
        if (val?.master?.heads_enable === "YES") {
          let date1 = new Date(`${staff?.staffJoinDate}`)?.getFullYear()
          let date2 = new Date()?.getFullYear()
          custom_obj.gratuity += (custom_obj.basic_pay * date2 - date1  * 15) / 30
        }
        else {
          custom_obj.gratuity += (custom_obj.basic_pay * date2 - date1) / 26
        }
        
      }
      if (val?.master?.heads_key === "EPF") {
        custom_obj.employar_pf += (((custom_obj?.basic_pay + custom_obj?.da) * 3.67) / 100)?.toFixed(2)
        custom_obj.employar_ps += (((custom_obj?.basic_pay + custom_obj?.da) * 8.33) / 100)?.toFixed(2)
        custom_obj.employar_charges += (((custom_obj?.basic_pay + custom_obj?.da) * 0.5) /100)?.toFixed(2) 
      }
    }
    custom_obj.total_earnings += custom_obj?.basic_pay + custom_obj?.da + custom_obj?.hra + custom_obj?.allowance + custom_obj?.bonus + custom_obj?.perks + custom_obj?.arr + custom_obj?.ads
    custom_obj.total_pay += (custom_obj?.total_earnings  - (custom_obj?.employee_pf + custom_obj?.employee_si + custom_obj?.pt + custom_obj?.ads_deduct))
    custom_obj.net_pay += custom_obj.total_pay - custom_obj.tds
    custom_obj.ctc += custom_obj.total_pay + custom_obj.employar_si + custom_obj.gratuity + custom_obj.employar_pf + custom_obj.employar_ps + custom_obj.employar_charges
    res.status(200).send({
      message: "One staff salary computation data.",
      access: true,
      custom_obj
    });
    
  } catch (e) {
    console.log(e);
  }
};

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
