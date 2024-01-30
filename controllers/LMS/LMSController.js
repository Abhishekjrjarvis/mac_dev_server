const invokeFirebaseNotification = require("../../Firebase/firebase");
const { designation_alarm, email_sms_designation_alarm } = require("../../WhatsAppSMS/payload");
const InstituteAdmin = require("../../models/InstituteAdmin");
const LMS = require("../../models/Leave/LMS");
const LeaveConfig = require("../../models/Leave/LeaveConfig");
const FinanceModerator = require("../../models/Moderator/FinanceModerator");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const Notification = require("../../models/notification");

exports.render_lms_module_query = async (req, res) => {
    try {
        const { id, sid } = req.body;
        if(!id && !sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    var institute = await InstituteAdmin.findById({ _id: id });
        var lms = new LMS({});
        var new_leave_config = new LeaveConfig({})
    if (sid) {
      var staff = await Staff.findById({ _id: sid });
      var user = await User.findById({ _id: `${staff?.user}` });
      var notify = new Notification({});
      staff.lms_department.push(lms._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = "LMS Administrator";
      staff.designation_array.push({
        role: "LMS Administrator",
        role_id: lms?._id,
      });
        new_leave_config.institute = institute?._id
        new_leave_config.lms = lms?._id
      lms.leave_config = new_leave_config?._id
      lms.active_staff = staff._id;
      notify.notifyContent = `you got the designation of as LMS Administrator`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "LMS Designation";
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
          lms.save(),
          new_leave_config.save()
      ]);
      designation_alarm(
        user?.userPhoneNumber,
        "LMS",
        institute?.sms_lang,
        "",
        "",
        ""
      );
      if (user?.userEmail) {
        email_sms_designation_alarm(
          user?.userEmail,
          "LMS",
          institute?.sms_lang,
          "",
          "",
          ""
        );
      }
    } else {
      lms.active_staff = null;
    }
    institute.lms_depart.push(lms._id);
    institute.lms_status = "Enable";
    lms.institute = institute._id;
    await Promise.all([institute.save(), lms.save()]);
    res.status(200).send({
      message: "Successfully Assigned LMS Staff",
      lms: lms._id,
      access: true,
    });
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_lms_dashboard_master = async (req, res) => {
    try {
        const { lmid } = req.params;
        if(!lmid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
      const lms = await LMS.findById({ _id: lmid })
        .select(
          "all_staff_count leave_moderator_role_count tab_manage leave_manage"
        )
        .populate({
          path: "institute",
          select:
            "id adminRepayAmount insBankBalance admissionDepart admissionStatus transportStatus hostelDepart libraryActivate transportDepart library alias_pronounciation",
        })
        .populate({
          path: "active_staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        });
      res.status(200).send({
        message: "Explore LMS Dashboard master query",
        lms: lms,
        access: true
      });
    } catch (e) {
      console.log(e);
    }
  };
  

exports.render_tab_manage = async(req, res) => {
    try{
      const { lmid } = req.params
      if(!lmid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
  
      await LMS.findByIdAndUpdate(lmid, req?.body)
      res.status(200).send({ message: "Explore Available Tabs Queyr", access: true})
    }
    catch(e){
      console.log(e)
    }
}

exports.render_lms_all_mods = async (req, res) => {
    try {
      const { lmid } = req.params;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const { search } = req.query;
      if (!lmid)
        return res.status(200).send({
          message: "Their is a bug need to fixed immediatley",
          access: false,
        });
  
      const lms = await LMS.findById({ _id: lmid }).select(
        "leave_moderator_role"
      );

        if (search) {
          var all_mods = await FinanceModerator.find({
            $and: [{ _id: { $in: lms?.leave_moderator_role } }],
            $or: [{ access_role: { $regex: search, $options: "i" } }],
          })
            .populate({
              path: "access_staff",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
            })
        } else {
          var all_mods = await FinanceModerator.find({
            $and: [{_id: { $in: lms?.leave_moderator_role }} ]
          })
            .sort("-1")
            .limit(limit)
            .skip(skip)
            .populate({
              path: "access_staff",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
            })
        }
        if (all_mods?.length > 0) {
          res.status(200).send({
            message: "All Leave & Transfer Admin / Moderator List 😀",
            all_mods,
            access: true,
          });
        } else {
          res.status(200).send({
            message: "No Leave & Transfer Admin / Moderator List 😀",
            all_mods: [],
            access: false,
          });
        }
    } catch (e) {
      console.log(e);
    }
};
  
exports.render_leave_manage = async(req, res) => {
    try{
      const { lmid } = req.params
      if(!lmid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
  
      await LMS.findByIdAndUpdate(lmid, req?.body)
      res.status(200).send({ message: "Explore Available Tabs Queyr", access: true})
    }
    catch(e){
      console.log(e)
    }
}