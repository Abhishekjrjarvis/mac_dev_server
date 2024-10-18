const { lms_json_to_excel } = require("../../Custom/JSONToExcel");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const {
  designation_alarm,
  email_sms_designation_alarm,
} = require("../../WhatsAppSMS/payload");
const { nested_document_limit } = require("../../helper/databaseFunction");
const Department = require("../../models/Department");
const InstituteAdmin = require("../../models/InstituteAdmin");
const LMS = require("../../models/Leave/LMS");
const LeaveConfig = require("../../models/Leave/LeaveConfig");
const FinanceModerator = require("../../models/Moderator/FinanceModerator");
const Staff = require("../../models/Staff");
const SubjectTimetable = require("../../models/Timetable/SubjectTimetable");
const User = require("../../models/User");
const Notification = require("../../models/notification");

exports.render_lms_module_query = async (req, res) => {
  try {
    const { id, sid } = req.body;
    if (!id && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var institute = await InstituteAdmin.findById({ _id: id });
    var lms = new LMS({});
    var new_leave_config = new LeaveConfig({});
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
      new_leave_config.institute = institute?._id;
      new_leave_config.lms = lms?._id;
      lms.leave_config = new_leave_config?._id;
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
        new_leave_config.save(),
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
  } catch (e) {
    console.log(e);
  }
};

exports.render_lms_dashboard_master = async (req, res) => {
  try {
    const { lmid } = req.params;
    if (!lmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
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
      })
      .populate({
        path: "leave_config",
        select: "_id",
      });
    res.status(200).send({
      message: "Explore LMS Dashboard master query",
      lms: lms,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_tab_manage = async (req, res) => {
  try {
    const { lmid } = req.params;
    if (!lmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await LMS.findByIdAndUpdate(lmid, req?.body);
    res
      .status(200)
      .send({ message: "Explore Available Tabs Queyr", access: true });
  } catch (e) {
    console.log(e);
  }
};

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
      }).populate({
        path: "access_staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });
    } else {
      var all_mods = await FinanceModerator.find({
        $and: [{ _id: { $in: lms?.leave_moderator_role } }],
      })
        .sort("-1")
        .limit(limit)
        .skip(skip)
        .populate({
          path: "access_staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        });
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

exports.render_leave_manage = async (req, res) => {
  try {
    const { lmid } = req.params;
    if (!lmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await LMS.findByIdAndUpdate(lmid, req?.body);
    res
      .status(200)
      .send({ message: "Explore Available Tabs Queyr", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_biometric_linking_query = async (req, res) => {
  try {
    const { sid, mcid } = req?.body;
    if (!sid && !mcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_staff = await Staff.findById({ _id: sid });
    const one_institute = await InstituteAdmin.findById({
      _id: `${one_staff?.institute}`,
    });
    const one_lms = await LMS.findById({
      _id: `${one_institute?.lms_depart?.[0]}`,
    });
    one_staff.staff_biometric_id = `${mcid}`;
    if (one_lms.biometric_staff?.includes(`${one_staff?._id}`)) {
    } else {
      one_lms.biometric_staff.push(one_staff?._id);
      await one_lms.save();
    }
    await one_staff.save();

    res.status(200).send({
      message: "Explore One Staff Biometric Linking Process Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchBiometricStaffQuery = async (lmid, staff_ref) => {
  try {
    if (staff_ref?.length > 0) {
      const one_lms = await LMS.findById({ _id: lmid });
      staff_ref?.forEach(async (ele) => {
        const staff = await Staff.findOne({
          staff_emp_code: `${ele?.EmployeeCode}`,
        });
        staff.staff_biometric_id = ele?.MachineCode;
        if (one_lms.biometric_staff?.includes(`${staff?._id}`)) {
        } else {
          one_lms.biometric_staff.push(staff?._id);
          await one_lms.save();
        }
        await staff.save();
      });
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_all_linked_staff_query = async (req, res) => {
  try {
    const { lmid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query;
    if (!lmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (search) {
      var lms = await LMS.findById({ _id: lmid });
      var all_staff = await Staff.find({
        $and: [
          {
            _id: { $in: lms?.biometric_staff },
          },
        ],
        $or: [
          {
            staffFirstName: { $regex: `${search}`, $options: "i" },
          },
          {
            staffMiddleName: { $regex: `${search}`, $options: "i" },
          },
          {
            staffLastName: { $regex: `${search}`, $options: "i" },
          },
          {
            staff_emp_code: { $regex: `${search}`, $options: "i" },
          },
        ],
      }).select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffGender staffROLLNO staff_biometric_id teaching_type current_designation staff_emp_code"
      );
    } else {
      const lms = await LMS.findById({ _id: lmid });
      var all_staff = await Staff.find({
        $and: [
          {
            _id: { $in: lms?.biometric_staff },
          },
        ],
      })
        .select(
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffGender staffROLLNO staff_biometric_id teaching_type current_designation staff_emp_code"
        )
        .limit(limit)
        .skip(skip);
    }
    if (all_staff?.length > 0) {
      res.status(200).send({
        message: "Explore All Linked Staff Query",
        access: true,
        all_staff: all_staff,
      });
    } else {
      res.status(200).send({
        message: "No Linked Staff Query",
        access: false,
        all_staff: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_leave_manage_query = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ins = await InstituteAdmin.findById({ _id: id });
    const lms = await LMS.findById({ _id: `${ins?.lms_depart?.[0]}` }).select(
      "leave_manage"
    );

    res.status(200).send({
      message: "Explore Leave Dynamic Toggle Query",
      access: true,
      lms,
    });
  } catch (e) {
    console.log(e);
  }
};

const modify_leave_key = {
  casual_leave: "Casual Leave",
  medical_leave: "Medical Leave",
  sick_leave: "Sick Leave",
  off_duty_leave: "On Duty Leave",
  lwp_leave: "Leave Without Pay",
  leave_taken: "Leave Taken",
  commuted_leave: "Commuted Leave",
  maternity_leave: "Maternity Leave",
  paternity_leave: "Paternity Leave",
  study_leave: "Study Leave",
  half_pay_leave: "Half Pay Leave",
  quarantine_leave: "Quarantine Leave",
  sabbatical_leave: "Sabbatical Leave",
  special_disability_leave: "Special Disability Leave",
  winter_vacation_leave: "Winter Vacation Leave",
  summer_vacation_leave: "Summer Vacation Leave",
  child_adoption_leave: "Child Adoption Leave",
  bereavement_leave: "Bereavement Leave",
  earned_leave: "Earned Leave",
  c_off_leave: "Compensation Off Leave",
  compensation_off_leave: "Compensation Off Leave",
};
exports.all_leave_export_with_staff_list_query = async (req, res) => {
  try {
    const { lmid } = req.params;
    if (!lmid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const lms = await LMS.findById(lmid);

    const institute = await InstituteAdmin.findById(lms?.institute);

    let staff_list = [];

    if (institute?.ApproveStaff?.length > 0) {
      let active_leaves = [];
      for (let ft in lms?.leave_manage) {
        let obj = lms?.leave_manage[ft];
        if (obj) {
          active_leaves.push(ft);
        }
      }
      active_leaves.push("earned_leave");
      for (let st of institute?.ApproveStaff) {
        const staff = await Staff.findById(st)
          .select(
            "staffFirstName staffMiddleName staffLastName staffROLLNO casual_leave medical_leave sick_leave off_duty_leave c_off_leave lwp_leave leave_taken commuted_leave maternity_leave paternity_leave study_leave half_pay_leave quarantine_leave sabbatical_leave special_disability_leave winter_vacation_leave summer_vacation_leave child_adoption_leave bereavement_leave earned_leave"
          )
          .lean()
          .exec();
        let bj = {
          "Employee Code": staff?.staffROLLNO ?? "#NA",
          Name: `${staff?.staffFirstName} ${
            staff?.staffMiddleName ? staff?.staffMiddleName : ""
          } ${staff?.staffLastName}`,
        };
        if (active_leaves?.length > 0) {
          for (let ty of active_leaves) {
            if (staff?._id) {
              if (staff[ty]) {
                bj[modify_leave_key[ty]] = staff[ty];
                bj[`Remaining ${modify_leave_key[ty]}`] =
                  staff[ty] ?? 0 - staff?.taken_leave[ty] ?? 0;
              }
            }
          }
        }
        staff_list.push(bj);
      }
    }

    let excel_key = "";
    if (staff_list?.length > 0) {
      excel_key = await lms_json_to_excel(
        lmid,
        staff_list,
        "Staff",
        "ALL_LEAVE",
        "all-leave"
      );
    }
    res.status(200).send({
      message: "One Lms staff excel export",
      staff_list,
      excel_key: excel_key,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.holiday_with_monthly_wise_query = async (req, res) => {
  try {
    const { lcid } = req.params;
    const { month, year } = req.query;
    if (!lcid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const leave_conf = await LeaveConfig.findById(lcid);

    let holiday = [];
    if (leave_conf?.custom_holiday?.length > 0) {
      for (let bt of leave_conf?.custom_holiday) {
        if (bt?.dates?.length > 0) {
          for (let ft of bt?.dates) {
            if (ft?.includes(`/${month}/${year}`)) {
              holiday.push({
                dates: ft,
                reason: bt?.reason,
              });
            }
          }
        }
      }
    }
    if (leave_conf?.holiday_config?.dDate?.length > 0) {
      for (let dt of leave_conf?.holiday_config?.dDate) {
        if (dt?.includes("/")) {
          if (dt?.includes(`/${month}/${year}`)) {
            holiday.push({
              dates: dt,
              reason: leave_conf.holiday_config.mark_sunday?.status
                ? leave_conf.holiday_config.mark_sunday?.status
                : leave_conf.holiday_config.mark_saturday?.status,
            });
          }

          // let args_split = dt?.split("/");
          // if (args_split?.[2] === year) {
          //   if (args_split?.[1] === month) {
          //     holiday.push({
          //       dates: `${args_split?.[2]}-${args_split?.[1]}-${args_split?.[0]}`,

          //       reason:
          //         leave_conf.holiday_config.mark_sunday?.status ??
          //         leave_conf.holiday_config.mark_saturday?.status,
          //     });
          //   }
          // }
        } else {
          // let args_split = dt?.split("-");
          // if (args_split?.[0] === year) {
          //   if (args_split?.[1] === month) {
          //     holiday.push({
          //       dates: `${args_split?.[0]}-${args_split?.[1]}-${args_split?.[2]}`,
          //       reason:
          //         leave_conf.holiday_config.mark_sunday?.status ??
          //         leave_conf.holiday_config.mark_saturday?.status,
          //     });
          //   }
          // }
        }
      }
    }
    res.status(200).send({
      message: "One month all holiday related data",
      holiday: holiday,
      // leave_conf,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.office_time_institute_query = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({
      message: "Institute related offcie hour and other things is change",
    });

    const dept = await Department.find({
      institute: { $eq: id },
    });

    if (dept?.length > 0) {
      for (let dt of dept) {
        // dt.office_start_hr = req.body?.office_start_hr;
        // dt.office_end_hr = req.body?.office_end_hr;
        dt.late_mark = req.body?.late_mark;
        await dt.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};
exports.office_time_department_query = async (req, res) => {
  try {
    const { did } = req.params;

    if (!did) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    await Department.findByIdAndUpdate(did, req.body);
    res.status(200).send({
      message: "Department related offcie hour and other things is change",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.replacement_staff_list_query = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, date } = req.query;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const staffs = await Staff.find({
      institute: { $eq: `${id}` },
    })
      .select(
        "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto staffSubject"
      )
      .lean()
      .exec();

    const st_list = [];

    if (staffs?.length > 0) {
      for (let st of staffs) {
        let dt = [];
        dt = await SubjectTimetable.find({
          $and: [
            {
              subject: {
                $in: st.staffSubject,
              },
            },
            {
              $or: [
                {
                  day: { $eq: day },
                },
                {
                  date: { $eq: date },
                },
              ],
            },
          ],
        });

        st_list.push({
          staffFirstName: st?.staffFirstName,
          staffMiddleName: st?.staffMiddleName,
          staffROLLNO: st?.staffROLLNO,
          staffProfilePhoto: st?.staffProfilePhoto,
          staffLastName: st?.staffLastName,
          _id: st?._id,
          subject_list: dt,
        });
      }
    }
    res.status(200).send({
      st_list: st_list,
      message: "Staff List with their timetable",
    });
  } catch (e) {
    console.log(e);
  }
};
exports.office_hour_institute_department_data_query = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFlow } = req.query;
    if (!id || !isFlow) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let office_hour = null;

    if (isFlow === "DEPARTMENT") {
      office_hour = await Department.findById(id).select(
        "late_mark office_end_hr office_start_hr"
      );
    } else {
      office_hour = await InstituteAdmin.findById(id).select(
        "late_mark office_end_hr office_start_hr"
      );
    }
    res.status(200).send({
      office_hour: office_hour,
      message: "Staff List with their timetable",
    });
  } catch (e) {
    console.log(e);
  }
};
