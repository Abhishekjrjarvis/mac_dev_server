const invokeFirebaseNotification = require("../../../Firebase/firebase");
const { designation_alarm, email_sms_designation_alarm } = require("../../../WhatsAppSMS/payload");
const PayrollModule = require("../../../models/Finance/Payroll/PayrollModule");
const SalaryHeads = require("../../../models/Finance/Payroll/SalaryHeads");
const InstituteAdmin = require("../../../models/InstituteAdmin");
const Staff = require("../../../models/Staff");
const User = require("../../../models/User");
const Notification = require("../../../models/notification");

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

exports.render_new_salary_structure_query = async (req, res) => {
  try {
    const { pid } = req.params;
    if(!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const payroll = await PayrollModule.findById({ _id: pid })
    const new_structure = new SalaryHeads({ ...req?.body })
    new_structure.payroll = payroll?._id
    payroll.salary_structure.push(new_structure?._id)
    await Promise.all([payroll.save(), new_structure.save()])
    res.status(200).send({ message: "Explore New Salary Structure Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_salary_structure_query = async (req, res) => {
  try {
    const { pid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if(!pid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    var payroll = await PayrollModule.findById({ _id: pid })
    var all_structure = await SalaryHeads.find({ _id: { $in: payroll?.salary_structure } })
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

exports.render_mark_status_salary_structure_query = async (req, res) => {
  try {
    const { sid } = req.params;
    const { flow, status } = req?.body
    if(!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    if (flow === "FIXED") {
      const structure = await SalaryHeads.findById({ _id: sid })
      structure.structure_status = "Fixed"
      await structure.save()
    }
    else if (flow === "EMP_WISE") {
      const structure = await SalaryHeads.findById({ _id: sid })
        .populate({
          path: "payroll",
          select: "institute"
      })
      const all_staff = await Staff.find({ $and: [{ institute: structure?.payroll?.institute}, { staff_grant_status: { $regex: `${status}`, $options: "i"}}]})
      for (var val of all_staff) {
        val.salary_structure = structure?._id
        await val.save()
      }
      structure.structure_status = status
      await structure.save()
    }
    res.status(200).send({ message: `Explore Salary Structure ${status} Query`, access: true})
  }
  catch (e) {
    console.log(e)
  }
}
