const Hostel = require("../../models/Hostel/hostel");
const HostelUnit = require("../../models/Hostel/hostelUnit");
const HostelRoom = require("../../models/Hostel/hostelRoom");
const HostelBed = require("../../models/Hostel/hostelBed");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");
const Admission = require("../../models/Admission/Admission");
const ClassMaster = require("../../models/ClassMaster");
const ScholarShip = require("../../models/Admission/Scholarship");
const FundCorpus = require("../../models/Admission/FundCorpus");
const Inquiry = require("../../models/Admission/Inquiry");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const NewApplication = require("../../models/Admission/NewApplication");
const Student = require("../../models/Student");
const Status = require("../../models/Admission/status");
const Income = require("../../models/Income");
const Finance = require("../../models/Finance");
const Batch = require("../../models/Batch");
const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Admin = require("../../models/superAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const BankAccount = require("../../models/Finance/BankAccount");
const {
  designation_alarm,
  email_sms_payload_query,
  email_sms_designation_alarm,
} = require("../../WhatsAppSMS/payload");
const {
  uploadDocFile,
  uploadFile,
  uploadPostImageFile,
  deleteFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../Firebase/firebase");
const Post = require("../../models/Post");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const bcrypt = require("bcryptjs");
const {
  new_admission_recommend_post,
} = require("../../Service/AutoRefreshBackend");
const BusinessTC = require("../../models/Finance/BToC");
const StudentNotification = require("../../models/Marks/StudentNotification");
const { file_to_aws } = require("../../Utilities/uploadFileAws");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const {
  filter_unique_username,
  generateAccessToken,
  generate_hash_pass,
} = require("../../helper/functions");
const {
  custom_date_time,
  user_date_of_birth,
  age_calc,
} = require("../../helper/dayTimer");
const {
  add_all_installment,
  render_installment,
  add_total_installment,
  exempt_installment,
  set_fee_head_query,
  remain_one_time_query,
  remain_one_time_query_government,
  remain_government_installment,
  update_fee_head_query,
  hostel_lookup_applicable_grant,
} = require("../../Functions/hostelInstallment");
const { whats_app_sms_payload } = require("../../WhatsAppSMS/payload");
const {
  render_admission_current_role,
} = require("../Moderator/roleController");
const FeeStructure = require("../../models/Finance/FeesStructure");
const { nested_document_limit } = require("../../helper/databaseFunction");
const RemainingList = require("../../models/Admission/RemainingList");
const { dueDateAlarm } = require("../../Service/alarm");
const { handle_undefined } = require("../../Handler/customError");
const { custom_month_query } = require("../../helper/dayTimer");
const { structure_pricing_query } = require("../../Functions/structurePricing");
const Renewal = require("../../models/Hostel/renewal");
const InsDocument = require("../../models/Document/InsDocument");
const InsAnnouncement = require("../../models/InsAnnouncement");
const { announcement_feed_query } = require("../../Post/announceFeed");
const { universal_account_creation_feed } = require("../../Post/globalFeed");
const {
  fee_reordering_hostel,
  ignite_multiple_alarm,
  insert_multiple_hostel_status,
} = require("../../helper/hostelMultipleStatus");
const FeeMaster = require("../../models/Finance/FeeMaster");

exports.renderActivateHostelQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { sid } = req.body;
    var institute = await InstituteAdmin.findById({ _id: id });
    var hostel = new Hostel({});
    if (sid) {
      var staff = await Staff.findById({ _id: sid });
      var user = await User.findById({ _id: `${staff.user}` });
      var notify = new Notification({});
      staff.hostelDepartment.push(hostel?._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = "Hostel Manager";
      staff.designation_array.push({
        role: "Hostel Manager",
        role_id: hostel?._id,
      });
      hostel.hostel_manager = staff._id;
      notify.notifyContent = `you got the designation of as Hostel Manager`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Hostel Designation";
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
        hostel.save(),
      ]);
      designation_alarm(
        user?.userPhoneNumber,
        "HOSTEL",
        institute?.sms_lang,
        "",
        "",
        ""
      );
      if (user?.userEmail) {
        email_sms_designation_alarm(
          user?.userEmail,
          "HOSTEL",
          institute?.sms_lang,
          "",
          "",
          ""
        );
      }
    } else {
      hostel.hostel_manager = null;
    }
    institute.hostelDepart.push(hostel?._id);
    institute.hostelStatus = "Enable";
    hostel.institute = institute._id;
    await Promise.all([institute.save(), hostel.save()]);
    // const fEncrypt = await encryptionPayload(hostel._id);
    res.status(200).send({
      message: "Successfully Assigned Hostel Manager",
      hostel: hostel._id,
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "HOSTEL",
      institute?.sms_lang,
      "",
      "",
      ""
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "HOSTEL",
        institute?.sms_lang,
        "",
        "",
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelDashQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { mod_id } = req.query;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_hostel = await Hostel.findById({ _id: hid })
      .select(
        "created_at moderator_role moderator_role_count fees_structures_count batchCount departmentSelectBatch ug_undertakings_hostel_admission pg_undertakings_hostel_admission onlineFee offlineFee exemptAmount requested_status remainingFeeCount collected_fee hostel_unit_count hostel_photo hostel_wardens_count boy_count girl_count other_count bed_count room_count"
      )
      .populate({
        path: "hostel_manager",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      })
      .populate({
        path: "institute",
        select:
          "insName name photoId insProfilePhoto financeDepart admissionDepart",
        populate: {
          path: "financeDepart",
          select: "fee_master_array_count fees_category_count",
        },
      });
    if (req?.query?.mod_id) {
      var value = await render_admission_current_role(
        one_hostel?.moderator_role,
        mod_id
      );
    }
    res.status(200).send({
      message: "Explore One Hostel Master Query",
      access: true,
      one_hostel: one_hostel,
      roles: req?.query?.mod_id ? value?.permission : null,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelFormQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_hostel = await Hostel.findById({ _id: hid }).select(
      "student_form_query ug_undertakings_hostel_admission pg_undertakings_hostel_admission"
    );
    res.status(200).send({
      message: "Explore One Hostel Form Query",
      access: true,
      one_hostel: one_hostel,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelRulesQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_hostel = await Hostel.findById({ _id: hid }).select("rules");
    res.status(200).send({
      message: "Explore One Hostel Rules Query",
      access: true,
      one_hostel: one_hostel,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelNewUnitQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { sid } = req.body;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const hostel = await Hostel.findById({ _id: hid });
    const new_unit = new HostelUnit({ ...req.body });
    const staff = await Staff.findById({ _id: sid });
    new_unit.hostel_unit_head = staff?._id;
    new_unit.hostel = hostel?._id;
    staff.hostelUnitDepartment.push(new_unit?._id);
    hostel.units.push(new_unit?._id);
    hostel.hostel_unit_count += 1;
    hostel.hostel_wardens.push(staff?._id);
    hostel.hostel_wardens_count += 1;

    await Promise.all([new_unit.save(), hostel.save(), staff.save()]);
    res.status(200).send({ message: "Explore New Hostel Unit", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllHostelUnitQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const hostel = await Hostel.findById({ _id: hid }).select("units");

    if (search) {
      var all_units = await HostelUnit.find({
        $and: [{ _id: { $in: hostel?.units } }],
        $or: [{ hostel_unit_name: { $regex: search, $options: "i" } }],
      })
        .select("created_at hostel_unit_name hostel_unit_photo")
        .populate({
          path: "hostel_unit_head",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        });
    } else {
      var all_units = await HostelUnit.find({ _id: { $in: hostel?.units } })
        .limit(limit)
        .skip(skip)
        .select("created_at hostel_unit_name hostel_unit_photo")
        .populate({
          path: "hostel_unit_head",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        });
    }
    if (all_units?.length > 0) {
      res.status(200).send({
        message: "Explore All Hostel Unit",
        access: true,
        all_units: all_units,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Hostel Unit", access: true, all_units: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneHostelUnitQuery = async (req, res) => {
  try {
    const { huid } = req.params;
    if (!huid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_unit = await HostelUnit.findById({ _id: huid })
      .select(
        "room_count hostel_unit_name created_at hostel_unit_photo bed_count hostelities_count renewal_receieved_application_count renewal_selected_application_count renewal_confirmed_application_count renewal_allotted_application_count renewal_cancel_application_count"
      )
      .populate({
        path: "hostel",
        select: "_id",
      })
      .populate({
        path: "hostel_unit_head",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });

    res.status(200).send({
      message: "Explore One Hostel Unit As Designation / Profile Query",
      access: true,
      one_unit: one_unit,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneHostelUnitNewRoomQuery = async (req, res) => {
  try {
    const { huid } = req.params;
    if (!huid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_unit = await HostelUnit.findById({ _id: huid });
    const one_hostel = await Hostel.findById({ _id: `${one_unit?.hostel}` });
    const new_room = new HostelRoom({ ...req.body });
    new_room.room_strength = parseInt(req.body?.room_strength);
    new_room.hostelUnit = one_unit?._id;
    one_unit.room_count += 1;
    one_unit.rooms.push(new_room?._id);
    new_room.vacant_count = new_room.room_strength;
    new_room.bed_count = new_room.room_strength;
    one_unit.bed_count += new_room.room_strength;
    one_hostel.bed_count += new_room.room_strength;
    one_hostel.room_count += 1;
    await Promise.all([new_room.save(), one_unit.save(), one_hostel.save()]);
    res.status(200).send({ message: "Explore New Room", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneHostelUnitAllRoomQuery = async (req, res) => {
  try {
    const { huid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!huid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_unit = await HostelUnit.findById({ _id: huid }).select("rooms");

    if (search) {
      var all_rooms = await HostelRoom.find({
        $and: [{ _id: { $in: one_unit?.rooms } }],
        $or: [{ room_name: { $regex: search, $options: "i" } }],
      }).select("created_at room_name room_strength vacant_count");
    } else {
      var all_rooms = await HostelRoom.find({ _id: { $in: one_unit?.rooms } })
        .limit(limit)
        .skip(skip)
        .select("created_at room_name room_strength vacant_count");
    }
    if (all_rooms?.length > 0) {
      res.status(200).send({
        message: "Explore All Hostel Room",
        access: true,
        all_rooms: all_rooms,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Hostel Room", access: true, all_rooms: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneHostelRoomQuery = async (req, res) => {
  try {
    const { hrid } = req.params;
    if (!hrid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_room = await HostelRoom.findById({ _id: hrid })
      .select(
        "room_name room_strength created_at bed_count vacant_count room_photo"
      )
      .populate({
        path: "beds",
        select: "bed_allotted_candidate bed_status",
        populate: {
          path: "bed_allotted_candidate",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto student_bed_number user",
          populate: {
            path: "user",
            select: "username userLegalName photoId profilePhoto",
          },
        },
      });

    res.status(200).send({
      message: "Explore One Hostel Room + Allotted Candidate Query",
      access: true,
      one_room: one_room,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneHostelRoomAllBedQuery = async (req, res) => {
  try {
    const { hrid } = req.params;
    // const page = req.query.page ? parseInt(req.query.page) : 1;
    // const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // const skip = (page - 1) * limit;
    if (!hrid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_room = await HostelRoom.findById({ _id: hrid }).select(
      "beds bed_count"
    );

    var all_beds = await HostelBed.find({
      _id: { $in: one_room?.beds },
    }).populate({
      path: "bed_allotted_candidate",
      select:
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
    });
    all_beds = all_beds?.filter((val) => {
      if (!`${val?.bed_allotted_candidate}`) return val;
    });
    if (all_beds?.length > 0) {
      res.status(200).send({
        message: "Explore All Hostel Beds",
        access: true,
        all_beds: all_beds,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Hostel Beds", access: true, all_beds: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelAllFeeStructure = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { filter_by, master_by } = req.query;
    const master_query = await handle_undefined(filter_by);
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid }).select(
      "fees_structures"
    );
    if (master_query) {
      var all_structures = await FeeStructure.find({
        $and: [
          { _id: { $in: one_hostel?.fees_structures } },
          { batch_master: master_query },
          { document_update: false },
        ],
        $or: [
          {
            class_master: `${master_by}`,
          },
        ],
      })
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
          { _id: { $in: one_hostel?.fees_structures } },
          { document_update: false },
        ],
      })
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

exports.renderHostelAllWardenQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid }).select(
      "hostel_wardens"
    );
    if (search) {
      var all_wardens = await Staff.find({
        $and: [{ _id: { $in: one_hostel?.hostel_wardens } }],
        $or: [
          { staffFirstName: { $regex: search, $options: "i" } },
          { staffMiddleName: { $regex: search, $options: "i" } },
          { staffLastName: { $regex: search, $options: "i" } },
        ],
      })
        .select(
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO hostelUnitDepartment"
        )
        .populate({
          path: "hostelUnitDepartment",
          select: "hostel_unit_name",
        });
    } else {
      var all_wardens = await Staff.find({
        _id: { $in: one_hostel?.hostel_wardens },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO hostelUnitDepartment"
        )
        .populate({
          path: "hostelUnitDepartment",
          select: "hostel_unit_name",
        });
    }

    if (all_wardens?.length > 0) {
      res.status(200).send({
        message: "Explore All Wardens Query",
        access: true,
        all_wardens: all_wardens,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Wardens Query", access: true, all_wardens: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelAllHostalitiesQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search, filter_by, id } = req.query;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid }).select("units");
    if (id) {
      if (search) {
        if (filter_by) {
          var all_hostalities = await Student.find({
            $and: [{ student_unit: `${filter_by}` }, { institute: id }],
            $or: [
              { studentFirstName: { $regex: search, $options: "i" } },
              { studentMiddleName: { $regex: search, $options: "i" } },
              { studentLastName: { $regex: search, $options: "i" } },
            ],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO hostelRemainFeeCount"
            )
            .populate({
              path: "student_bed_number",
              select: "bed_number bed_status hostelRoom",
              populate: {
                path: "hostelRoom",
                select: "room_name",
              },
            })
            .populate({
              path: "student_unit",
              select: "hostel_unit_name",
            });
        } else {
          var all_hostalities = await Student.find({
            $and: [
              { student_unit: { $in: one_hostel?.units } },
              { institute: id },
            ],
            $or: [
              { studentFirstName: { $regex: search, $options: "i" } },
              { studentMiddleName: { $regex: search, $options: "i" } },
              { studentLastName: { $regex: search, $options: "i" } },
            ],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO hostelRemainFeeCount"
            )
            .populate({
              path: "student_bed_number",
              select: "bed_number bed_status hostelRoom",
              populate: {
                path: "hostelRoom",
                select: "room_name",
              },
            })
            .populate({
              path: "student_unit",
              select: "hostel_unit_name",
            });
        }
      } else {
        if (filter_by) {
          var all_hostalities = await Student.find({
            $and: [{ student_unit: `${filter_by}` }, { institute: id }],
          })
            .limit(limit)
            .skip(skip)
            .select(
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO hostelRemainFeeCount"
            )
            .populate({
              path: "student_bed_number",
              select: "bed_number bed_status hostelRoom",
              populate: {
                path: "hostelRoom",
                select: "room_name",
              },
            })
            .populate({
              path: "student_unit",
              select: "hostel_unit_name",
            });
        } else {
          var all_hostalities = await Student.find({
            $and: [
              { student_unit: { $in: one_hostel?.units } },
              { institute: id },
            ],
          })
            .limit(limit)
            .skip(skip)
            .select(
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO hostelRemainFeeCount"
            )
            .populate({
              path: "student_bed_number",
              select: "bed_number bed_status hostelRoom",
              populate: {
                path: "hostelRoom",
                select: "room_name",
              },
            })
            .populate({
              path: "student_unit",
              select: "hostel_unit_name",
            });
        }
      }
    } else {
      var all_hostalities = [];
    }

    if (all_hostalities?.length > 0) {
      res.status(200).send({
        message: "Explore All Hostalities Query",
        access: true,
        all_hostalities: all_hostalities,
      });
    } else {
      res.status(200).send({
        message: "No Hostalities Query",
        access: true,
        all_hostalities: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelNewExistingRulesQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { rules } = req.body;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const hostel = await Hostel.findById({ _id: hid });
    for (var ref of rules) {
      hostel.rules.push({
        regulation_headline: ref?.headLine,
        regulation_description: ref?.description,
        regulation_attachment: ref?.attach,
      });
      hostel.rules_count += 1;
    }
    await hostel.save();
    res.status(200).send({
      message: "Add Existing Rules & Regulation Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelExistingRulesQuery = async (req, res) => {
  try {
    const { hid, rid } = req.params;
    const { existing_rules } = req.body;
    if (!rid && !hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const hostel = await Hostel.findById({ _id: hid });
    for (var ref of hostel?.rules) {
      if (`${ref?._id}` === `${rid}`) {
        ref.regulation_headline = existing_rules?.headLine;
        ref.regulation_description = existing_rules?.description;
        ref.regulation_attachment = existing_rules?.attach;
      }
    }
    await hostel.save();
    res.status(200).send({
      message: "Update Existing Rules & Regulation Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelNewExistingFormQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    await Hostel.findByIdAndUpdate(hid, req.body);
    res.status(200).send({
      message: "Update Existing Student Form Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewHostelApplicationQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const { expand } = req.query;
    req.body.applicationSeats = req.body?.applicationSeats
      ? parseInt(req.body?.applicationSeats)
      : 0;
    var one_hostel = await Hostel.findById({ _id: hid });
    var institute = await InstituteAdmin.findById({
      _id: `${one_hostel.institute}`,
    });
    const newApply = new NewApplication({ ...req.body });
    one_hostel.newApplication.push(newApply._id);
    one_hostel.newAppCount += 1;
    newApply.hostelAdmin = one_hostel?._id;
    newApply.applicationHostel = hid;
    newApply.application_flow = "Hostel Application";
    newApply.applicationTypeStatus = "Normal Application";
    institute.hostelCount += 1;
    await Promise.all([one_hostel.save(), newApply.save(), institute.save()]);
    res
      .status(200)
      .send({ message: "New Hostel Application is ongoing 👍", status: true });
    // const post = new Post({});
    // post.imageId = "1";
    // institute.posts.push(post._id);
    // institute.postCount += 1;
    // post.author = institute._id;
    // post.authorName = institute.insName;
    // post.authorUserName = institute.name;
    // post.authorPhotoId = institute.photoId;
    // post.authorProfilePhoto = institute.insProfilePhoto;
    // post.authorOneLine = institute.one_line_about;
    // post.authorFollowersCount = institute.followersCount;
    // post.isInstitute = "institute";
    // post.postType = "Application";
    // post.new_application = newApply._id;
    // post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    // await Promise.all([post.save(), institute.save()]);
    // await new_admission_recommend_post(institute?._id, post?._id, expand);
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelReceievedApplication = async (req, res) => {
  try {
    const { uid, aid } = req.params;
    if (!uid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const user = await User.findById({ _id: uid });
    const student = new Student({ ...req.body });
    student.valid_full_name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    student.student_join_mode = "HOSTEL_PROCESS";
    const apply = await NewApplication.findById({ _id: aid });
    const valid_unit = await HostelUnit.findById({
      _id: `${apply?.applicationUnit}`,
    });
    var filtered_account = await BankAccount.findOne({
      hostel: apply?.applicationHostel,
    });
    const one_hostel = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute}`,
    });
    const status = new Status({});
    var notify = new StudentNotification({});
    const studentOptionalSubject = req.body?.optionalSubject
      ? req.body?.optionalSubject
      : [];
    for (var file of req.body?.fileArray) {
      if (file.name === "file") {
        student.photoId = "0";
        student.studentProfilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        student.studentAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        student.studentAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        student.studentBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        student.studentCasteCertificatePhoto = file.key;
      else {
        student.studentDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    if (studentOptionalSubject?.length > 0) {
      student.studentOptionalSubject?.push(...studentOptionalSubject);
    }
    status.content = `Your application for ${valid_unit?.hostel_unit_name} have been filled successfully.

Below is the Hostel Admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the hostel department)

2.After selection, confirm from your side and start the hostel admission process.

3.After confirmation from your side, visit the institute with the applicable fees. (You will get application fees information on your selection from the institute side. (Till then check our fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application hostel admission fees.

6. Pay application admission fees and your hostel admission will be confirmed and complete.

7. For cancellation and refund, contact the hostel department.

Note: Stay tuned for further updates.`;
    status.applicationId = apply._id;
    status.document_visible = true;
    status.instituteId = institute._id;
    status.finance = institute?.financeDepart?.[0];
    status.student = student?._id;
    user.student.push(student._id);
    user.applyApplication.push(apply._id);
    status.bank_account = filtered_account?._id;
    status.flow_status = "Hostel Application";
    student.user = user._id;
    user.applicationStatus.push(status._id);
    apply.receievedApplication.push({
      student: student._id,
      fee_remain: 0,
    });
    apply.receievedCount += 1;
    if (institute.userFollowersList.includes(uid)) {
    } else {
      user.userInstituteFollowing.push(institute._id);
      user.followingUICount += 1;
      institute.userFollowersList.push(uid);
      institute.followersCount += 1;
    }
    notify.notifyContent = `Your application for ${valid_unit?.hostel_unit_name} have been filled successfully.

Below is the Hostel Admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the hostel department)

2.After selection, confirm from your side and start the hostel admission process.

3.After confirmation from your side, visit the institute with the applicable fees. (You will get application fees information on your selection from the institute side. (Till then check our fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application hostel admission fees.

6. Pay application admission fees and your hostel admission will be confirmed and complete.

7. For cancellation and refund, contact the hostel department.

Note: Stay tuned for further updates.`;
    notify.notifySender = one_hostel?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByHostelPhoto = one_hostel?._id;
    notify.notifyCategory = "Hostel Status Alert";
    notify.redirectIndex = 59;
    notify.notifyCategory = "Application Requested";
    await Promise.all([
      student.save(),
      user.save(),
      status.save(),
      apply.save(),
      institute.save(),
      notify.save(),
    ]);
    res.status(201).send({
      message: "Taste a bite of sweets till your application is selected",
      student: student._id,
      status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelAllApplication = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const one_hostel = await Hostel.findById({ _id: hid }).select(
      "newApplication"
    );
    const ongoing = await NewApplication.find({
      $and: [
        { _id: { $in: one_hostel?.newApplication } },
        { applicationStatus: "Ongoing" },
        { application_flow: "Hostel Application" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationEndDate applicationStatus applicationSeats applicationAbout admissionProcess application_type selectCount confirmCount receievedCount selectedApplication confirmedApplication receievedApplication gr_initials"
      )
      .populate({
        path: "applicationHostel",
        select: "photoId hostel_photo",
      })
      .populate({
        path: "applicationUnit",
        select: "hostel_unit_name",
      })
      .populate({
        path: "direct_linked_structure",
      });

    if (ongoing?.length > 0) {
      for (var ref of ongoing) {
        ref.selectCount = ref?.selectedApplication?.length;
        ref.confirmCount = ref?.confirmedApplication?.length;
        ref.receievedCount = ref?.receievedApplication?.length;
      }
      res.status(200).send({
        message: "All Ongoing Hostel Application from DB 🙌",
        ongoing: ongoing,
        ongoingCount: ongoing?.length,
      });
    } else {
      res
        .status(200)
        .send({ message: "Dark side in depth nothing to find", ongoing: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelAllCompletedApplication = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const one_hostel = await Hostel.findById({ _id: hid }).select(
      "newApplication"
    );
    const completed = await NewApplication.find({
      $and: [
        { _id: { $in: one_hostel?.newApplication } },
        { applicationStatus: "Completed" },
        { application_flow: "Hostel Application" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationEndDate applicationStatus applicationSeats allotCount"
      )
      .populate({
        path: "applicationHostel",
        select: "photoId hostel_photo",
      })
      .populate({
        path: "applicationUnit",
        select: "hostel_unit_name",
      });

    if (completed?.length > 0) {
      res.status(200).send({
        message: "All Completed Hostel Applicationd from DB 🙌",
        completed: completed,
        completedCount: completed?.length,
      });
    } else {
      res
        .status(200)
        .send({ message: "Dark side in depth nothing to find", completed: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderSearchHostelApplicationQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const ins_apply = await InstituteAdmin.findById({ _id: id }).select(
      "hostelDepart"
    );
    if (ins_apply?.hostelDepart?.length > 0) {
      if (search) {
        const one_hostel = await Hostel.findById({
          _id: `${ins_apply?.hostelDepart[0]}`,
        });
        var newApp = await NewApplication.find({
          $and: [
            { _id: { $in: one_hostel?.newApplication } },
            { applicationStatus: "Ongoing" },
            { application_flow: "Hostel Application" },
          ],
          $or: [
            { applicationParentType: { $regex: search, $options: "i" } },
            {
              applicationChildType: { $in: search },
            },
          ],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select("applicationName applicationEndDate application_type")
          .populate({
            path: "applicationHostel",
            select: "_id",
          })
          .populate({
            path: "applicationBatch",
            select: "batchName",
          })
          .populate({
            path: "applicationUnit",
            select: "hostel_unit_name",
          });
      } else {
        const one_hostel = await Hostel.findById({
          _id: `${ins_apply?.hostelDepart[0]}`,
        });
        var newApp = await NewApplication.find({
          $and: [
            { _id: { $in: one_hostel?.newApplication } },
            { applicationStatus: "Ongoing" },
            { application_flow: "Hostel Application" },
          ],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select("applicationName applicationEndDate application_type")
          .populate({
            path: "applicationHostel",
            select: "_id",
          })
          .populate({
            path: "applicationBatch",
            select: "batchName",
          })
          .populate({
            path: "applicationUnit",
            select: "hostel_unit_name",
          });
      }
      res.status(200).send({
        message: "Lets begin new year journey from Hostel DB 🙌",
        allApp: newApp,
        allAppCount: newApp?.length,
      });
    } else {
      res.status(200).send({
        message: "get a better lens to find what you need 🔍",
        allApp: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneHostelApplicationQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const oneApply = await NewApplication.findById({ _id: aid })
      .select(
        "applicationName applicationType applicationAbout applicationMaster admissionProcess applicationEndDate applicationStartDate admissionFee applicationPhoto photoId applicationSeats receievedCount selectCount confirmCount applicationStatus cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount"
      )
      .populate({
        path: "applicationHostel",
        select: "photoId hostel_photo",
      })
      .populate({
        path: "applicationUnit",
        select: "hostel_unit_name",
      })
      .populate({
        path: "applicationBatch",
        select: "batchName",
      })
      .populate({
        path: "hostelAdmin",
        select: "_id",
        populate: {
          path: "institute",
          select: "id insProfilePhoto name insName",
        },
      })
      .lean()
      .exec();
    res.status(200).send({
      message:
        "Sit with a paper and pen to note down all details carefully from Hostel DB 🙌",
      oneApply: oneApply,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelSelectedQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { fee_struct, month, renew } = req.body;
    if (!sid && !aid && !fee_struct)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    var valid_month = month ? parseInt(month) : 0;
    const apply = await NewApplication.findById({ _id: aid });
    const one_hostel = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    var structure = await FeeStructure.findById({ _id: fee_struct });
    const finance = await Finance.findOne({
      institute: one_hostel?.institute,
    });
    const status = new Status({});
    var notify = new StudentNotification({});
    if (valid_month > 0 && valid_month <= 60 && valid_month !== 12) {
      var new_structure = new FeeStructure({
        category_master: structure?.category_master,
        class_master: structure?.class_master,
        structure_name: structure?.structure_name,
        unique_structure_name: structure?.unique_structure_name,
        total_admission_fees: structure?.total_admission_fees,
        total_installments: structure?.total_installments,
        applicable_fees: structure?.applicable_fees,
        one_installments: structure?.one_installments,
        two_installments: structure?.two_installments,
        three_installments: structure?.three_installments,
        four_installments: structure?.four_installments,
        five_installments: structure?.five_installments,
        six_installments: structure?.six_installments,
        seven_installments: structure?.seven_installments,
        eight_installments: structure?.eight_installments,
        nine_installments: structure?.nine_installments,
        ten_installments: structure?.ten_installments,
        eleven_installments: structure?.eleven_installments,
        tweleve_installments: structure?.tweleve_installments,
        fees_heads: [...structure?.fees_heads],
        fees_heads_count: structure?.fees_heads_count,
      });
      new_structure.structure_month = valid_month;
      await structure_pricing_query(new_structure, valid_month);
      status.hostel_fee_structure = new_structure?._id;
      student.hostel_fee_structure = new_structure?._id;
    } else {
      status.hostel_fee_structure = structure?._id;
      student.hostel_fee_structure = structure?._id;
    }
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
      } else {
      }
    }
    apply.selectedApplication.push({
      student: student._id,
      fee_remain: structure.total_admission_fees,
      status_id: status?._id,
    });
    apply.selectCount += 1;

    status.applicationId = apply._id;
    status.for_docs = "Yes";
    status.studentId = student._id;
    status.student = student?._id;
    if (valid_month > 0 && valid_month <= 60 && valid_month !== 12) {
      status.content = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${new_structure?.structure_name}. And required documents are 'click here for details'.   
Start your admission process by confirming below.`;
      status.admissionFee = new_structure.total_admission_fees;
      notify.notifyContent = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${new_structure?.structure_name}. And required documents are 'click here for details'.   
Start your admission process by confirming below.`;
    } else {
      status.content = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${structure?.structure_name}. And required documents are 'click here for details'.   
Start your admission process by confirming below.`;
      status.admissionFee = structure.total_admission_fees;
      notify.notifyContent = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${structure?.structure_name}. And required documents are 'click here for details'.   
Start your admission process by confirming below.`;
    }
    notify.notifySender = one_hostel?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByHostelPhoto = one_hostel?._id;
    notify.notifyCategory = "Hostel Status Alert";
    notify.redirectIndex = 58;
    notify.notifyCategory = "Application Selection";
    status.instituteId = one_hostel?.institute;
    status.finance = finance?._id;
    status.document_visible = true;
    status.structure_edited = "Edited";
    status.flow_status = "Hostel Application";
    user.applicationStatus.push(status._id);
    student.active_status.push(status?._id);
    student.hostel_fee_structure_month = valid_month;
    if (renew) {
      student.hostel_renewal = new Date(`${renew}`);
    } else {
      var month_query = custom_month_query(valid_month);
      student.hostel_renewal = new Date(`${month_query}`);
    }
    await Promise.all([
      apply.save(),
      student.save(),
      user.save(),
      status.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: `congrats ${student.studentFirstName} `,
      select_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderPayOfflineHostelFee = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, mode } = req.body;
    const { receipt_status } = req.query;
    if (!sid && !aid && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const apply = await NewApplication.findById({ _id: aid });
    const one_hostel = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute}`,
    });
    var renew = new Renewal({});
    var finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const student = await Student.findById({ _id: sid }).populate({
      path: "hostel_fee_structure",
    });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    const notify = new StudentNotification({});
    const order = new OrderPayment({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.receipt_status = receipt_status
      ? receipt_status
      : "Already Generated";
    order.payment_module_type = "Hostel Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    institute.payment_history.push(order._id);
    renew.renewal_student = student?._id;
    renew.renewal_application = apply?._id;
    var total_amount = add_total_installment(student);
    var is_install;
    if (
      price <= student?.hostel_fee_structure?.total_admission_fees &&
      price > student?.hostel_fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    if (price > 0 && is_install) {
      one_hostel.remainingFee.push(student._id);
      student.hostelRemainFeeCount += total_amount - price;
      apply.remainingFee += total_amount - price;
      one_hostel.remainingFeeCount += total_amount - price;
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: total_amount,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "Installment_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "First Installment";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      await add_all_installment(
        apply,
        institute._id,
        new_remainFee,
        price,
        student
      );
    } else if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: student?.hostel_fee_structure?.total_admission_fees,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "One_Time_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "One Time Fees";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      one_hostel.remainingFee.push(student._id);
      student.hostelRemainFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      apply.remainingFee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      one_hostel.remainingFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.hostel_fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        one_hostel.remainingFee.pull(student._id);
      } else {
        new_remainFee.remaining_array.push({
          remainAmount:
            student?.hostel_fee_structure?.total_admission_fees - price,
          appId: apply._id,
          status: "Not Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
      }
    }
    if (mode === "Offline") {
      one_hostel.offlineFee += price;
      apply.collectedFeeCount += price;
      apply.offlineFee += price;
      one_hostel.collected_fee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
    } else if (mode === "Online") {
      one_hostel.onlineFee += price;
      apply.collectedFeeCount += price;
      apply.onlineFee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    } else {
    }
    await set_fee_head_query(student, price, apply, new_receipt);
    for (let app of apply?.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        if (app?.status_id) {
          const valid_status = await Status.findById({
            _id: `${app?.status_id}`,
          });
          valid_status.isPaid = "Paid";
          await valid_status.save();
        }
        apply.selectedApplication.pull(app._id);
      } else {
      }
    }
    apply.confirmedApplication.push({
      student: student._id,
      payment_status: mode,
      install_type: is_install
        ? "First Installment Paid"
        : "One Time Fees Paid",
      fee_remain: is_install
        ? total_amount - price
        : student?.hostel_fee_structure?.total_admission_fees - price,
    });
    apply.confirmCount += 1;
    student.hostelPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: apply._id,
    });
    status.content = `Your hostel has been confirmed, You will be alloted to your room / bed shortly, Stay Update!. Please visit hostel once to check sourroundings.`;
    status.applicationId = apply._id;
    user.applicationStatus.push(status._id);
    status.instituteId = institute._id;
    status.fee_receipt = new_receipt?._id;
    new_remainFee.renewal_start = new Date();
    new_remainFee.renewal_end = student?.hostel_renewal;
    renew.renewal_start = new Date();
    renew.renewal_end = student?.hostel_renewal;
    renew.renewal_status = "Current Stay";
    renew.renewal_hostel = one_hostel?._id;
    student.student_renewal.push(renew?._id);
    notify.notifyContent = `Your hostel has been confirmed, You will be alloted to your room / bed shortly, Stay Update!. Please visit hostel once to check sourroundings.`;
    notify.notifySender = one_hostel?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByHostelPhoto = one_hostel?._id;
    notify.notifyCategory = "Hostel Status Alert";
    notify.redirectIndex = 57;
    notify.notifyCategory = "Seat Confirmation";
    if (
      `${new_receipt?.fee_payment_mode}` === "Demand Draft" ||
      `${new_receipt?.fee_payment_mode}` === "Cheque"
    ) {
      status.receipt_status = "Requested";
      status.receipt = new_receipt?._id;
      if (one_hostel?.request_array?.includes(`${new_receipt?._id}`)) {
      } else {
        one_hostel.request_array.push(new_receipt?._id);
        one_hostel.fee_receipt_request.push({
          receipt: new_receipt?._id,
          demand_cheque_status: "Requested",
        });
      }
    }
    await Promise.all([
      one_hostel.save(),
      apply.save(),
      student.save(),
      finance.save(),
      user.save(),
      order.save(),
      institute.save(),
      s_admin.save(),
      new_remainFee.save(),
      new_receipt.save(),
      status.save(),
      renew.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: "Look like a party mood",
      confirm_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Hostel Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderCancelHostelRefundApplicationQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, mode, remainAmount } = req.body;
    if (!sid && !aid && !amount && !remainAmount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        refund_status: false,
      });
    var price = parseInt(amount);
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const apply = await NewApplication.findById({ _id: aid });
    const one_hostel = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    const aStatus = new Status({});
    const notify = new StudentNotification({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.refund_status = "Refunded";
    new_receipt.student = student?._id;
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    if (
      price &&
      price > finance.financeTotalBalance &&
      price > one_hostel.offlineFee &&
      price > finance.financeSubmitBalance
    ) {
      res.status(200).send({
        message: "insufficient Balance in Finance Department to make refund",
      });
    } else {
      const order = new OrderPayment({});
      apply.cancelCount += 1;
      if (apply.remainingFee >= parseInt(remainAmount)) {
        apply.remainingFee -= parseInt(remainAmount);
      }
      if (mode === "Offline") {
        if (finance.financeHostelBalance >= price) {
          finance.financeHostelBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeSubmitBalance >= price) {
          finance.financeSubmitBalance -= price;
        }
        if (one_hostel.offlineFee >= price) {
          one_hostel.offlineFee -= price;
        }
        if (one_hostel.collected_fee >= price) {
          one_hostel.collected_fee -= price;
        }
        if (apply.offlineFee >= price) {
          apply.offlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
      } else if (mode === "Online") {
        if (one_hostel.onlineFee >= price) {
          one_hostel.onlineFee -= price;
        }
        if (apply.onlineFee >= price) {
          apply.onlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
        if (finance.financeHostelBalance >= price) {
          finance.financeHostelBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeBankBalance >= price) {
          finance.financeBankBalance -= price;
        }
      }
      if (one_hostel.remainingFeeCount >= parseInt(remainAmount)) {
        one_hostel.remainingFeeCount -= parseInt(remainAmount);
      }
      aStatus.content = `your hostel admission has been cancelled successfully with refund of Rs. ${price}`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      notify.notifyContent = `your hostel admission has been cancelled successfully with refund of Rs. ${price}`;
      notify.notifySender = one_hostel?.hostel_manager?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByHostelPhoto = one_hostel?._id;
      notify.notifyCategory = "Hostel Status Alert";
      notify.redirectIndex = 56;
      notify.notifyCategory = "Cancellation & Refund";
      student.hostelRemainFeeCount = 0;
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Hostel Admission",
        refund_amount: price,
        refund_from: apply?._id,
      });

      const all_remain_fee_list = await RemainingList.findOne({
        $and: [
          { student: student?._id },
          { appId: apply?._id },
          { remaining_flow: "Hostel Application" },
        ],
      });
      const filter_student_install =
        all_remain_fee_list?.remaining_array?.filter((stu) => {
          if (`${stu.appId}` === `${apply._id}` && stu.status === "Not Paid")
            return stu;
        });
      for (var can = 0; can < filter_student_install?.length; can++) {
        all_remain_fee_list?.remaining_array.pull(filter_student_install[can]);
      }
      all_remain_fee_list.fee_receipts.push(new_receipt?._id);
      all_remain_fee_list.refund_fee += price;
      if (all_remain_fee_list.paid_fee >= price) {
        all_remain_fee_list.paid_fee -= price;
      }
      all_remain_fee_list.remaining_fee = 0;
      for (var ele of student?.active_fee_heads) {
        if (`${ele?.appId}` === `${apply?._id}`) {
          ele.paid_fee = 0;
          ele.remain_fee = 0;
        }
      }
      all_remain_fee_list.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "Cancellation & Refunded",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
        refund_status: "Refunded",
      });
      order.payment_module_type = "Expense";
      order.payment_to_end_user_id = institute._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = apply._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Debit";
      order.payment_flag_by = "Credit";
      order.payment_mode = mode;
      order.payment_admission = apply._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      institute.invoice_count += 1;
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute?.invoice_count}`;
      order.payment_invoice_number = new_receipt?.invoice_count;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      order.fee_receipt = new_receipt?._id;
      await Promise.all([
        apply.save(),
        student.save(),
        finance.save(),
        one_hostel.save(),
        aStatus.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
        all_remain_fee_list.save(),
        new_receipt.save(),
        notify.save(),
      ]);
      res.status(200).send({
        message: "Refund & Cancellation of Hostel Admission",
        refund_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Hostel Status",
        user._id,
        user.deviceToken
      );
      if (apply.confirmedApplication?.length > 0) {
        for (let app of apply.confirmedApplication) {
          if (`${app.student}` === `${student._id}`) {
            apply.confirmedApplication.pull(app._id);
          } else {
          }
        }
        apply.cancelApplication.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
        });
        await apply.save();
      }
      if (one_hostel?.remainingFee?.length > 0) {
        if (one_hostel.remainingFee?.includes(`${student._id}`)) {
          one_hostel.remainingFee.pull(student._id);
        }
        await one_hostel.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderCompleteHostelApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        complete_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    if (
      apply?.selectedApplication?.length > 0 ||
      apply?.confirmedApplication?.length > 0
    ) {
      res.status(200).send({
        message:
          "Application not to be completed student is in Select  || Confirm ",
        complete_status: false,
      });
    } else {
      const one_hostel = await Hostel.findById({
        _id: `${apply?.hostelAdmin}`,
      });
      const hostel_ins = await InstituteAdmin.findById({
        _id: `${one_hostel?.institute}`,
      });
      apply.applicationStatus = "Completed";
      if (hostel_ins?.hostelCount > 0) {
        hostel_ins.hostelCount -= 1;
      }
      if (one_hostel?.newAppCount > 0) {
        one_hostel.newAppCount -= 1;
      }
      one_hostel.completedCount += 1;
      await Promise.all([apply.save(), one_hostel.save(), hostel_ins.save()]);
      res.status(200).send({
        message: "Enjoy your work load is empty go for party",
        complete_status: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelRemainingArray = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search, id } = req.query;
    const hostel_ins = await Hostel.findById({ _id: hid }).select(
      "remainingFee"
    );
    if (id) {
      if (search) {
        var student = await Student.find({
          $and: [{ _id: { $in: hostel_ins?.remainingFee } }, { institute: id }],
          $or: [
            { studentFirstName: { $regex: search, $options: "i" } },
            { studentMiddleName: { $regex: search, $options: "i" } },
            { studentLastName: { $regex: search, $options: "i" } },
          ],
        })
          .sort("-hostelRemainFeeCount")
          .select(
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto hostelRemainFeeCount student_unit"
          )
          .populate({
            path: "department",
            select: "dName",
          })
          .populate({
            path: "student_unit",
            select: "hostel_unit_name",
          });
      } else {
        var student = await Student.find({
          $and: [{ _id: { $in: hostel_ins?.remainingFee } }, { institute: id }],
        })
          .sort("-hostelRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto hostelRemainFeeCount student_unit"
          )
          .populate({
            path: "department",
            select: "dName",
          })
          .populate({
            path: "student_unit",
            select: "hostel_unit_name",
          });
      }
    } else {
      var student = [];
    }
    if (student?.length > 0) {
      res.status(200).send({
        message: "Its a party time from Hostel DB 🙌",
        remain: student,
        remainCount: student?.length,
      });
    } else {
      res
        .status(200)
        .send({ message: "Account Running out of balance", remain: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllotHostedBedQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { huid, hrid, id } = req.query;
    if (!aid && !req.body.dataList && !hrid && !huid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        allot_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var one_hostel = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var institute = await InstituteAdmin.findById({
      _id: id,
    });
    // var batch = await Batch.findById({ _id: `${apply.applicationBatch}` });
    var one_unit = await HostelUnit.findById({ _id: huid });
    var room = await HostelRoom.findById({ _id: hrid });
    var array = req.body.dataList;
    if (array?.length > 0) {
      for (var sid of array) {
        const student = await Student.findById({ _id: sid });
        const bed = new HostelBed({});
        // const remain_list = await RemainingList.findOne({
        //   $and: [
        //     { _id: { $in: student?.remainingFeeList } },
        //     { appId: apply?._id },
        //     {
        //       remaining_flow: "Hostel Application",
        //     },
        //   ],
        // });
        const user = await User.findById({ _id: `${student.user}` });
        var exist_stu = await Student.find({
          $and: [{ institute: institute?._id }, { user: user?._id }],
        });
        if (exist_stu?.length > 0) {
          exist_stu[0].exist_linked_hostel.status = "Linked";
          exist_stu[0].exist_linked_hostel.exist_student = student?._id;
          await exist_stu[0].save();
        }
        const notify = new StudentNotification({});
        const aStatus = new Status({});
        for (let app of apply.confirmedApplication) {
          if (`${app.student}` === `${student._id}`) {
            apply.confirmedApplication.pull(app._id);
          } else {
          }
        }
        bed.bed_allotted_candidate = student?._id;
        bed.hostelRoom = room?._id;
        bed.bed_number = room.bed_count + 1 - room.vacant_count;
        if (room?.vacant_count > 0) {
          room.vacant_count -= 1;
        }
        room.beds.push(bed?._id);
        one_unit.hostelities_count += 1;
        one_unit.hostelities.push(student?._id);
        one_hostel.hostelities_count += 1;
        student.student_bed_number = bed?._id;
        student.student_unit = one_unit?._id;
        student.institute = institute?.id
        apply.allottedApplication.push({
          student: student._id,
          payment_status: "offline",
          alloted_room: room?.room_name,
          alloted_status: "Alloted",
          fee_remain: student.hostelRemainFeeCount,
          paid_status: student.hostelRemainFeeCount == 0 ? "Paid" : "Not Paid",
        });
        // remain_list.batchId = batch?._id;
        apply.allotCount += 1;
        notify.notifyContent = `Welcome to ${room?.room_name} Enjoy your Hostel Life.`;
        notify.notifySender = one_hostel?.hostel_manager?.user;
        notify.notifyReceiever = user?._id;
        notify.notifyType = "Student";
        notify.notifyPublisher = student?._id;
        user.activity_tab.push(notify?._id);
        notify.notifyByHostelPhoto = one_hostel?._id;
        notify.notifyCategory = "Hostel Status Alert";
        notify.redirectIndex = 55;
        notify.notifyCategory = "Bed Allottment";
        aStatus.content = `Welcome to ${room?.room_name} Enjoy your Hostel Life.`;
        aStatus.applicationId = apply._id;
        user.applicationStatus.push(aStatus._id);
        aStatus.instituteId = institute._id;
        if (student?.studentGender === "Male") {
          one_hostel.boy_count += 1;
        } else if (student?.studentGender === "Female") {
          one_hostel.girl_count += 1;
        } else if (student?.studentGender === "Other") {
          one_hostel.other_count += 1;
        } else {
        }
        await Promise.all([
          student.save(),
          apply.save(),
          user.save(),
          aStatus.save(),
          institute.save(),
          notify.save(),
          // remain_list.save(),
          room.save(),
          bed.save(),
          one_hostel.save(),
          one_unit.save(),
        ]);
        invokeMemberTabNotification(
          "Admission Status",
          aStatus.content,
          "Hostel Status",
          user._id,
          user.deviceToken
        );
      }
      res.status(200).send({
        message: `Distribute sweets to all family members`,
        allot_status: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderPaidRemainingFeeStudentQuery = async (req, res) => {
  try {
    const { hid, sid, appId } = req.params;
    const { amount, mode, type } = req.body;
    const { receipt_status } = req.query;
    if (!sid && !hid && !appId && !amount && !mode && !type)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var hostel_ins = await Hostel.findById({ _id: hid }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var student = await Student.findById({ _id: sid }).populate({
      path: "hostel_fee_structure",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${hostel_ins?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.receipt_status = receipt_status
      ? receipt_status
      : "Already Generated";
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findOne({
      $and: [
        { student: student?._id },
        { appId: apply?._id },
        { remaining_flow: "Hostel Application" },
      ],
    });
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    if (req?.body?.fee_payment_mode === "Government/Scholarship") {
      finance.government_receipt.push(new_receipt?._id);
      finance.financeGovernmentScholarBalance += price;
      finance.government_receipt_count += 1;
      if (price >= remaining_fee_lists?.remaining_fee) {
        extra_price += price - remaining_fee_lists?.remaining_fee;
        price = remaining_fee_lists?.remaining_fee;
        remaining_fee_lists.paid_fee += extra_price;
        student.hostelPaidFeeCount += extra_price;
        for (var stu of student.paidFeeList) {
          if (`${stu.appId}` === `${apply._id}`) {
            stu.paidAmount += extra_price;
          }
        }
        await remain_one_time_query_government(
          hostel_ins,
          remaining_fee_lists,
          apply,
          institute,
          student,
          price + extra_price,
          new_receipt
        );
      } else {
        if (type === "One Time Fees Remain") {
        } else {
          await remain_government_installment(
            hostel_ins,
            remaining_fee_lists,
            apply,
            institute,
            student,
            price,
            new_receipt,
            type
          );
        }
      }
    }
    var order = new OrderPayment({});
    order.payment_module_type = "Hostel Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = extra_price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute?.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    institute.payment_history.push(order._id);
    if (req?.body?.fee_payment_mode === "Exempted/Unrecovered") {
      await exempt_installment(
        req?.body?.fee_payment_mode,
        remaining_fee_lists,
        student,
        hostel_ins,
        apply,
        finance,
        price,
        new_receipt
      );
    } else {
      if (req?.body?.fee_payment_mode === "Government/Scholarship") {
        remaining_fee_lists.paid_fee += price;
        if (remaining_fee_lists.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
      } else {
        await render_installment(
          type,
          student,
          mode,
          price,
          hostel_ins,
          student?.hostel_fee_structure,
          remaining_fee_lists,
          new_receipt,
          apply,
          institute
        );
        remaining_fee_lists.paid_fee += price;
        if (remaining_fee_lists.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
      }
    }
    if (hostel_ins?.remainingFeeCount >= price) {
      hostel_ins.remainingFeeCount -= price;
    }
    if (apply?.remainingFee >= price) {
      apply.remainingFee -= price;
    }
    if (student?.hostelRemainFeeCount >= price) {
      student.hostelRemainFeeCount -= price;
    }
    student.hostelPaidFeeCount += price;
    if (mode === "Online") {
      hostel_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeHostelBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
    } else if (mode === "Offline") {
      hostel_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      hostel_ins.collected_fee += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeHostelBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
    } else {
    }
    // await set_fee_head_query(student, price, apply);
    await update_fee_head_query(student, price, apply, new_receipt);
    await hostel_lookup_applicable_grant(
      new_receipt?.fee_payment_mode,
      price,
      remaining_fee_lists,
      new_receipt
    );
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    if (type === "One Time Fees Remain") {
      await remain_one_time_query(
        hostel_ins,
        remaining_fee_lists,
        apply,
        institute,
        student,
        price,
        new_receipt
      );
    }
    await Promise.all([
      hostel_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
    });
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = hostel_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          hostel_ins.refundCount += is_refund;
        }
      } else {
        hostel_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        hostel_ins.refundCount += is_refund;
      }
    }
    await hostel_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = hostel_ins?.hostel_manager?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByHostelPhoto = hostel_ins?._id;
    notify.notifyCategory = "Hostel Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
    if (apply?.allottedApplication?.length > 0) {
      apply?.allottedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          // ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.confirmedApplication?.length > 0) {
      apply?.confirmedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain =
            req?.body?.fee_payment_mode === "Exempted/Unrecovered"
              ? 0
              : ele.fee_remain >= price
              ? ele.fee_remain - price
              : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Hostel Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price + extra_price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderPaidRemainingFeeStudentRefundBy = async (req, res) => {
  try {
    const { hid, sid, appId } = req.params;
    const { amount, mode } = req.body;
    if (!sid && !hid && !appId && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var hostel_ins = await Hostel.findById({ _id: hid }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var student = await Student.findById({ _id: sid });
    var institute = await InstituteAdmin.findById({
      _id: `${hostel_ins?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.refund_status = "Refunded";
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findOne({
      $and: [
        { student: student?._id },
        { appId: apply?._id },
        { remaining_flow: "Hostel Application" },
      ],
    });
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    var order = new OrderPayment({});
    order.payment_module_type = "Expense";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    student.refundAdmission.push({
      refund_status: "Refund",
      refund_reason: "Extra Amount Paid Or Grant Some Scholarships",
      refund_amount: price,
      refund_from: apply?._id,
    });
    if (remaining_fee_lists?.paid_fee >= price) {
      remaining_fee_lists.paid_fee -= price;
    }
    remaining_fee_lists.refund_fee += price;
    if (student?.hostelPaidFeeCount >= price) {
      student.hostelPaidFeeCount -= price;
    }
    if (mode === "Online") {
      if (hostel_ins.onlineFee >= price) {
        hostel_ins.onlineFee -= price;
      }
      if (apply.onlineFee >= price) {
        apply.onlineFee -= price;
      }
      if (apply.collectedFeeCount >= price) {
        apply.collectedFeeCount -= price;
      }
      if (finance.financeTotalBalance >= price) {
        finance.financeTotalBalance -= price;
      }
      if (finance.financeHostelBalance >= price) {
        finance.financeHostelBalance -= price;
      }
      if (finance.financeBankBalance >= price) {
        finance.financeBankBalance -= price;
      }
    } else if (mode === "Offline") {
      if (hostel_ins.offlineFee >= price) {
        hostel_ins.offlineFee -= price;
      }
      if (apply.offlineFee >= price) {
        apply.offlineFee -= price;
      }
      if (apply.collectedFeeCount >= price) {
        apply.collectedFeeCount -= price;
      }
      if (hostel_ins.collected_fee >= price) {
        hostel_ins.collected_fee -= price;
      }
      if (finance.financeTotalBalance >= price) {
        finance.financeTotalBalance -= price;
      }
      if (finance.financeHostelBalance >= price) {
        finance.financeHostelBalance -= price;
      }
      if (finance.financeSubmitBalance >= price) {
        finance.financeSubmitBalance -= price;
      }
    } else {
    }
    remaining_fee_lists.remaining_array.push({
      appId: apply?._id,
      remainAmount: price,
      status: "Paid",
      instituteId: institute?._id,
      installmentValue: "Refund From Hostel Manager",
      isEnable: true,
      refund_status: "Refunded",
      fee_receipt: new_receipt?._id,
    });
    const filter_student_refund = hostel_ins?.refundFeeList?.filter((stu) => {
      if (`${stu.student}` === `${student?._id}`) return stu;
    });
    if (filter_student_refund?.length > 0) {
      for (var data of filter_student_refund) {
        if (data.refund >= price) {
          data.refund -= price;
        }
        if (hostel_ins.refundCount >= price) {
          hostel_ins.refundCount -= price;
        }
      }
      for (var ref of hostel_ins.refundFeeList) {
        if (`${ref?.student}` === `${student?._id}`) {
          hostel_ins.refundFeeList.pull(ref?._id);
        }
      }
    }
    await Promise.all([
      hostel_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
    });
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = hostel_ins?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByHostelPhoto = hostel_ins?._id;
    notify.notifyCategory = "Refund By Hostel Manager";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Refund`,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Hostel Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentCancelHostelAdmissionMode = async (req, res) => {
  try {
    const { statusId, aid, sid } = req.params;
    if (!sid && !aid && !statusId)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const status = await Status.findById({ _id: statusId });
    const apply = await NewApplication.findById({ _id: aid });
    const student = await Student.findById({ _id: sid });
    if (apply?.selectedApplication?.length > 0) {
      apply?.selectedApplication?.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.payment_status = "Cancelled";
        }
      });
      await apply.save();
    }
    status.for_selection = "No";
    if (
      student.hostelRemainFeeCount >=
      student?.hostel_fee_structure?.total_admission_fees
    ) {
      student.hostelRemainFeeCount -=
        student?.hostel_fee_structure?.total_admission_fees;
    }
    await Promise.all([status.save(), student.save()]);
    res.status(200).send({
      message: "Cancel Hostel Admission Selection",
      cancel_status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

const hostel_receipt_approve_query = async (
  ads_admin,
  student,
  one_receipt,
  one_app,
  institute,
  finance,
  s_admin,
  user
) => {
  try {
    var is_install;
    var price = one_receipt?.fee_payment_amount;
    var mode =
      one_receipt?.fee_payment_mode === "By Cash" ? "Offline" : "Online";
    var total_amount = add_total_installment(student);
    var renew = new Renewal({});
    if (
      price <= student?.hostel_fee_structure?.total_admission_fees &&
      price > student?.hostel_fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    if (price > 0 && is_install) {
      ads_admin.remainingFee.push(student._id);
      student.hostelRemainFeeCount += total_amount - price;
      one_app.remainingFee += total_amount - price;
      ads_admin.remainingFeeCount += total_amount - price;
      var new_remainFee = new RemainingList({
        appId: one_app._id,
        applicable_fee: total_amount,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "Installment_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: one_app._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: mode,
        isEnable: true,
        fee_receipt: one_receipt?._id,
      });
      new_remainFee.active_payment_type = "First Installment";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(one_receipt?._id);
      await add_all_installment(
        one_app,
        institute._id,
        new_remainFee,
        price,
        student
      );
    } else if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: one_app._id,
        applicable_fee: student?.hostel_fee_structure?.total_admission_fees,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "One_Time_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: one_app._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees",
        mode: mode,
        isEnable: true,
        fee_receipt: one_receipt?._id,
      });
      new_remainFee.active_payment_type = "One Time Fees";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(one_receipt?._id);
      ads_admin.remainingFee.push(student._id);
      student.hostelRemainFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      one_app.remainingFee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      ads_admin.remainingFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        ads_admin.remainingFee.pull(student._id);
      } else {
        new_remainFee.remaining_array.push({
          remainAmount:
            student?.hostel_fee_structure?.total_admission_fees - price,
          appId: one_app._id,
          status: "Not Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
      }
    }
    if (mode === "Offline") {
      ads_admin.offlineFee += price;
      one_app.collectedFeeCount += price;
      one_app.offlineFee += price;
      ads_admin.collected_fee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
    } else if (mode === "Online") {
      ads_admin.onlineFee += price;
      one_app.collectedFeeCount += price;
      one_app.onlineFee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    } else {
    }
    await set_fee_head_query(student, price, one_app, one_receipt);
    for (let app of one_app?.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        one_app.selectedApplication.pull(app._id);
      } else {
      }
    }
    one_app.confirmedApplication.push({
      student: student._id,
      payment_status: mode,
      install_type: is_install
        ? "First Installment Paid"
        : "One Time Fees Paid",
      fee_remain: is_install
        ? total_amount - price
        : student?.hostel_fee_structure?.total_admission_fees - price,
    });
    one_app.confirmCount += 1;
    student.hostelPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: one_app._id,
    });
    const status = new Status({});
    const notify = new StudentNotification({});
    const order = new OrderPayment({});
    order.payment_module_type = "Hostel Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = one_app._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = one_app._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    order.payment_invoice_number = one_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    status.content = `Your hostel has been confirmed, You will be alloted to your room / bed shortly, Stay Update!. Please visit hostel once to check sourroundings.`;
    status.applicationId = one_app._id;
    status.fee_receipt = one_receipt?._id;
    user.applicationStatus.push(status._id);
    status.instituteId = institute._id;
    status.document_visible = true;
    new_remainFee.renewal_start = new Date();
    new_remainFee.renewal_end = student?.hostel_renewal;
    renew.renewal_status = "Current Stay";
    renew.renewal_student = student?._id;
    renew.renewal_application = one_app?._id;
    renew.renewal_start = new Date();
    renew.renewal_end = student?.hostel_renewal;
    renew.renewal_hostel = ads_admin?._id;
    student.student_renewal.push(renew?._id);
    order.fee_receipt = one_receipt?._id;
    notify.notifyContent = `Your hostel has been confirmed, You will be alloted to your room / bed shortly, Stay Update!. Please visit hostel once to check sourroundings.`;
    notify.notifySender = ads_admin?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByHostelPhoto = ads_admin?._id;
    notify.notifyCategory = "Seat Confirmation";
    notify.redirectIndex = 54;
    await Promise.all([
      ads_admin.save(),
      renew.save(),
      one_app.save(),
      student.save(),
      finance.save(),
      user.save(),
      order.save(),
      institute.save(),
      s_admin.save(),
      new_remainFee.save(),
      one_receipt.save(),
      status.save(),
      notify.save(),
    ]);
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

const request_hostel_mode_query_by_student = async (
  aid,
  sid,
  appId,
  amount,
  mode,
  type,
  receipt
) => {
  try {
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var hostel_ins = await Hostel.findById({ _id: aid }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var student = await Student.findById({ _id: sid }).populate({
      path: "hostel_fee_structure",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${hostel_ins.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var is_install;
    if (
      price <= student?.hostel_fee_structure?.total_admission_fees &&
      price > student?.hostel_fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    var apply = await NewApplication.findById({ _id: appId });
    var new_receipt = await FeeReceipt.findById({ _id: receipt });
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findOne({
      $and: [
        { student: student?._id },
        { appId: apply?._id },
        { remaining_flow: "Hostel Application" },
      ],
    });
    if (remaining_fee_lists) {
      remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    }
    if (new_receipt?.fee_payment_mode === "Government/Scholarship") {
      finance.government_receipt.push(new_receipt?._id);
      finance.financeGovernmentScholarBalance += price;
      finance.government_receipt_count += 1;
      if (price >= remaining_fee_lists?.remaining_fee) {
        extra_price += price - remaining_fee_lists?.remaining_fee;
        price = remaining_fee_lists?.remaining_fee;
        if (remaining_fee_lists) {
          remaining_fee_lists.paid_fee += extra_price;
        }
        student.hostelPaidFeeCount += extra_price;
        for (var stu of student.paidFeeList) {
          if (`${stu.appId}` === `${apply._id}`) {
            stu.paidAmount += extra_price;
          }
        }
        await remain_one_time_query_government(
          hostel_ins,
          remaining_fee_lists,
          apply,
          institute,
          student,
          price + extra_price,
          new_receipt
        );
      } else {
        if (type === "One Time Fees Remain") {
        } else {
          await remain_government_installment(
            hostel_ins,
            remaining_fee_lists,
            apply,
            institute,
            student,
            price,
            new_receipt,
            type
          );
        }
      }
    }
    var order = new OrderPayment({});
    order.payment_module_type = "Hostel Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = extra_price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    if (new_receipt?.fee_payment_mode === "Exempted/Unrecovered") {
      await exempt_installment(
        new_receipt?.fee_payment_mode,
        remaining_fee_lists,
        student,
        hostel_ins,
        apply,
        finance,
        price,
        new_receipt
      );
    } else {
      if (new_receipt?.fee_payment_mode === "Government/Scholarship") {
        if (remaining_fee_lists) {
          remaining_fee_lists.paid_fee += price;
        }
        if (remaining_fee_lists.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
      } else {
        await render_installment(
          type,
          student,
          mode,
          price,
          hostel_ins,
          student?.hostel_fee_structure,
          remaining_fee_lists,
          new_receipt,
          apply,
          institute
        );
        if (remaining_fee_lists) {
          remaining_fee_lists.paid_fee += price;
        }
        if (remaining_fee_lists.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
      }
    }
    if (hostel_ins?.remainingFeeCount >= price) {
      hostel_ins.remainingFeeCount -= price;
    }
    if (apply?.remainingFee >= price) {
      apply.remainingFee -= price;
    }
    if (student?.hostelRemainFeeCount >= price) {
      student.hostelRemainFeeCount -= price;
    }
    student.hostelPaidFeeCount += price;
    if (mode === "Online") {
      hostel_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeHostelBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
    } else if (mode === "Offline") {
      hostel_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      hostel_ins.collected_fee += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeHostelBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
    } else {
    }
    // await set_fee_head_query(student, price, apply);
    await update_fee_head_query(student, price, apply, new_receipt);
    await hostel_lookup_applicable_grant(
      new_receipt?.fee_payment_mode,
      price,
      remaining_fee_lists,
      new_receipt
    );
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    if (type === "One Time Fees Remain") {
      await remain_one_time_query(
        hostel_ins,
        remaining_fee_lists,
        apply,
        institute,
        student,
        price,
        new_receipt
      );
    }
    if (remaining_fee_lists) {
      await remaining_fee_lists.save();
    }
    await Promise.all([
      hostel_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      new_receipt.save(),
    ]);
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = hostel_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          hostel_ins.refundCount += is_refund;
        }
      } else {
        hostel_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        hostel_ins.refundCount += is_refund;
      }
    }
    await hostel_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = hostel_ins?.hostel_manager?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = hostel_ins._id;
    notify.notifyCategory = "Hostel Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
    apply.confirmedApplication.push({
      student: student._id,
      payment_status: mode,
      install_type: is_install
        ? "First Installment Paid"
        : "One Time Fees Paid",
      fee_remain: is_install
        ? total_amount - price
        : student?.hostel_fee_structure?.total_admission_fees - price,
    });
    apply.confirmCount += 1;
    for (var ref of apply?.selectedApplication) {
      if (`${ref?.student}` === `${student?._id}`) {
        apply.selectedApplication.pull(ref?._id);
      } else {
      }
    }
    await apply.save();
    if (apply?.allottedApplication?.length > 0) {
      apply?.allottedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          // ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.confirmedApplication?.length > 0) {
      apply?.confirmedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain =
            new_receipt?.fee_payment_mode === "Exempted/Unrecovered"
              ? 0
              : ele.fee_remain >= price
              ? ele.fee_remain - price
              : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Hostel Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price + extra_price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

const hostel_receipt_approve_query_renewal = async (
  ads_admin,
  student,
  one_receipt,
  one_app,
  institute,
  finance,
  s_admin,
  user,
  renew
) => {
  try {
    var is_install;
    var price = one_receipt?.fee_payment_amount;
    var mode =
      one_receipt?.fee_payment_mode === "By Cash" ? "Offline" : "Online";
    var total_amount = add_total_installment(student);
    var renew = new Renewal({});
    const one_renew = await Renewal.findById({ _id: renew });
    const one_unit = await HostelUnit.findById({
      _id: `${one_renew?.renewal_unit}`,
    });
    if (
      price <= student?.hostel_fee_structure?.total_admission_fees &&
      price > student?.hostel_fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    if (price > 0 && is_install) {
      ads_admin.remainingFee.push(student._id);
      student.hostelRemainFeeCount += total_amount - price;
      one_app.remainingFee += total_amount - price;
      ads_admin.remainingFeeCount += total_amount - price;
      var new_remainFee = new RemainingList({
        appId: one_app._id,
        applicable_fee: total_amount,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "Installment_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: one_app._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: mode,
        isEnable: true,
        fee_receipt: one_receipt?._id,
      });
      new_remainFee.active_payment_type = "First Installment";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(one_receipt?._id);
      await add_all_installment(
        one_app,
        institute._id,
        new_remainFee,
        price,
        student
      );
    } else if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: one_app._id,
        applicable_fee: student?.hostel_fee_structure?.total_admission_fees,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "One_Time_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: one_app._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees",
        mode: mode,
        isEnable: true,
        fee_receipt: one_receipt?._id,
      });
      new_remainFee.active_payment_type = "One Time Fees";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(one_receipt?._id);
      ads_admin.remainingFee.push(student._id);
      student.hostelRemainFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      one_app.remainingFee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      ads_admin.remainingFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        ads_admin.remainingFee.pull(student._id);
      } else {
        new_remainFee.remaining_array.push({
          remainAmount:
            student?.hostel_fee_structure?.total_admission_fees - price,
          appId: one_app._id,
          status: "Not Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
      }
    }
    if (mode === "Offline") {
      ads_admin.offlineFee += price;
      one_app.collectedFeeCount += price;
      one_app.offlineFee += price;
      ads_admin.collected_fee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
    } else if (mode === "Online") {
      ads_admin.onlineFee += price;
      one_app.collectedFeeCount += price;
      one_app.onlineFee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    } else {
    }
    await set_fee_head_query(
      student,
      price,
      one_app,
      one_receipt,
      "",
      "Renewal"
    );
    for (let app of one_unit?.renewal_selected_application) {
      if (`${app.student}` === `${student._id}`) {
        one_unit.renewal_selected_application.pull(app._id);
      } else {
      }
    }
    one_unit.renewal_confirmed_application.push({
      student: student._id,
      payment_status: mode,
      install_type: is_install
        ? "First Installment Paid"
        : "One Time Fees Paid",
      fee_remain: is_install
        ? total_amount - price
        : student?.hostel_fee_structure?.total_admission_fees - price,
    });
    one_unit.renewal_confirmed_application_count += 1;
    student.hostelPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: one_app._id,
    });
    const status = new Status({});
    const order = new OrderPayment({});
    order.payment_module_type = "Hostel Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = one_app._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = one_app._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    order.payment_invoice_number = one_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    status.content = `Your hostel has been confirmed, You will be alloted to your room / bed shortly, Stay Update!. Please visit hostel once to check sourroundings.`;
    status.applicationId = one_app._id;
    status.hostelUnit = one_unit?._id;
    status.fee_receipt = one_receipt?._id;
    status.flow_status = "Hostel Application";
    user.applicationStatus.push(status._id);
    status.instituteId = institute._id;
    status.document_visible = true;
    new_remainFee.renewal_start = new Date();
    new_remainFee.renewal_end = student?.hostel_renewal;
    renew.renewal_status = "Current Stay";
    renew.renewal_student = student?._id;
    renew.renewal_application = one_app?._id;
    renew.renewal_start = new Date();
    renew.renewal_end = student?.hostel_renewal;
    renew.renewal_hostel = ads_admin?._id;
    student.student_renewal.push(renew?._id);
    order.fee_receipt = one_receipt?._id;
    await Promise.all([
      ads_admin.save(),
      renew.save(),
      one_app.save(),
      student.save(),
      finance.save(),
      user.save(),
      order.save(),
      institute.save(),
      s_admin.save(),
      new_remainFee.save(),
      one_receipt.save(),
      status.save(),
      one_unit.save(),
    ]);
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

const request_hostel_mode_query_by_student_renewal = async (
  aid,
  sid,
  appId,
  amount,
  mode,
  type,
  receipt,
  renew
) => {
  try {
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var hostel_ins = await Hostel.findById({ _id: aid }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var student = await Student.findById({ _id: sid }).populate({
      path: "hostel_fee_structure",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${hostel_ins.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    var new_receipt = await FeeReceipt.findById({ _id: receipt });
    const notify = new StudentNotification({});
    const one_renew = await Renewal.findById({ _id: renew });
    const one_unit = await HostelUnit.findById({
      _id: `${one_renew?.renewal_unit}`,
    });
    const remaining_fee_lists = await RemainingList.findOne({
      $and: [
        { student: student?._id },
        { appId: apply?._id },
        { fee_structure: student?.hostel_fee_structure },
        { remaining_flow: "Hostel Application" },
      ],
    });
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    if (new_receipt?.fee_payment_mode === "Government/Scholarship") {
      finance.government_receipt.push(new_receipt?._id);
      finance.financeGovernmentScholarBalance += price;
      finance.government_receipt_count += 1;
      if (price >= remaining_fee_lists?.remaining_fee) {
        extra_price += price - remaining_fee_lists?.remaining_fee;
        price = remaining_fee_lists?.remaining_fee;
        remaining_fee_lists.paid_fee += extra_price;
        student.hostelPaidFeeCount += extra_price;
        for (var stu of student.paidFeeList) {
          if (`${stu.appId}` === `${apply._id}`) {
            stu.paidAmount += extra_price;
          }
        }
        await remain_one_time_query_government(
          hostel_ins,
          remaining_fee_lists,
          apply,
          institute,
          student,
          price + extra_price,
          new_receipt
        );
      } else {
        if (type === "One Time Fees Remain") {
        } else {
          await remain_government_installment(
            hostel_ins,
            remaining_fee_lists,
            apply,
            institute,
            student,
            price,
            new_receipt,
            type
          );
        }
      }
    }
    var order = new OrderPayment({});
    order.payment_module_type = "Hostel Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = extra_price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    if (new_receipt?.fee_payment_mode === "Exempted/Unrecovered") {
      await exempt_installment(
        new_receipt?.fee_payment_mode,
        remaining_fee_lists,
        student,
        hostel_ins,
        apply,
        finance,
        price,
        new_receipt
      );
    } else {
      if (new_receipt?.fee_payment_mode === "Government/Scholarship") {
        remaining_fee_lists.paid_fee += price;
        if (remaining_fee_lists.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
      } else {
        await render_installment(
          type,
          student,
          mode,
          price,
          hostel_ins,
          student?.hostel_fee_structure,
          remaining_fee_lists,
          new_receipt,
          apply,
          institute
        );
        remaining_fee_lists.paid_fee += price;
        if (remaining_fee_lists.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
      }
    }
    if (hostel_ins?.remainingFeeCount >= price) {
      hostel_ins.remainingFeeCount -= price;
    }
    if (apply?.remainingFee >= price) {
      apply.remainingFee -= price;
    }
    if (student?.hostelRemainFeeCount >= price) {
      student.hostelRemainFeeCount -= price;
    }
    student.hostelPaidFeeCount += price;
    if (mode === "Online") {
      hostel_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeHostelBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
    } else if (mode === "Offline") {
      hostel_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      hostel_ins.collected_fee += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeHostelBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
    } else {
    }
    // await set_fee_head_query(student, price, apply);
    await update_fee_head_query(student, price, apply, new_receipt, "Renewal");
    await hostel_lookup_applicable_grant(
      new_receipt?.fee_payment_mode,
      price,
      remaining_fee_lists,
      new_receipt
    );
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    if (type === "One Time Fees Remain") {
      await remain_one_time_query(
        hostel_ins,
        remaining_fee_lists,
        apply,
        institute,
        student,
        price,
        new_receipt
      );
    }
    await Promise.all([
      hostel_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = hostel_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          hostel_ins.refundCount += is_refund;
        }
      } else {
        hostel_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        hostel_ins.refundCount += is_refund;
      }
    }
    await hostel_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = hostel_ins?.hostel_manager?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = hostel_ins._id;
    notify.notifyCategory = "Hostel Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
    if (one_unit?.renewal_allotted_application?.length > 0) {
      one_unit?.renewal_allotted_application.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          // ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await one_unit.save();
    }
    if (one_unit?.renewal_confirmed_application?.length > 0) {
      one_unit?.renewal_confirmed_application.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain =
            new_receipt?.fee_payment_mode === "Exempted/Unrecovered"
              ? 0
              : ele.fee_remain >= price
              ? ele.fee_remain - price
              : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await one_unit.save();
    }
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Hostel Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price + extra_price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneHostelReceiptReApply = async (req, res) => {
  try {
    const { sid, rid } = req.params;
    const { delete_pic } = req.query;
    const { transaction_date } = req.body;
    const image = await handle_undefined(delete_pic);
    if (!sid && !rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_receipt = await FeeReceipt.findByIdAndUpdate(rid, req.body);
    one_receipt.fee_transaction_date = new Date(`${transaction_date}`);
    if (image) {
      await deleteFile(image);
    }
    const one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    const ads_admin = await Hostel.findById({
      _id: `${`${one_app?.hostelAdmin}`}`,
    }).populate({
      path: "institute",
      select: "admissionDepart",
    });
    var status = await Status.findOne({ receipt: one_receipt?._id });
    var renew = await Renewal.findOne({ receipt: one_receipt?._id });
    if (status) {
      status.receipt_status = "Requested";
    } else if (renew) {
      renew.receipt_status = "Requested";
    } else {
      var student = await Student.findById({ _id: sid });
      if (student) {
        var remaining_lists = await RemainingList.findOne({
          $and: [
            { student: student?._id },
            { appId: one_app?._id },
            { fee_structure: student?.hostel_fee_structure },
            { remaining_flow: "Hostel Application" },
          ],
        });
      }
    }
    one_receipt.re_apply = true;
    if (remaining_lists) {
      for (var ref of remaining_lists?.remaining_array) {
        if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
          ref.status = "Receipt Requested";
        }
      }
    }
    if (status) {
      await Promise.all([status.save(), one_receipt.save()]);
    } else if (renew) {
      await Promise.all([renew.save(), one_receipt.save()]);
    } else if (remaining_lists) {
      await Promise.all([remaining_lists.save(), one_receipt.save()]);
    } else {
    }
    res
      .status(200)
      .send({ message: "Your Receipts Under Processing", access: true });
    if (status) {
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Requested";
        }
      }
      await one_app.save();
    }
    for (var all of ads_admin?.fee_receipt_reject) {
      if (`${all?.receipt}` === `${one_receipt?._id}`) {
        ads_admin.fee_receipt_reject.pull(all?._id);
        ads_admin.fee_receipt_reject.unshift({
          receipt: one_receipt?._id,
          status: "Rejected",
        });
      }
    }
    await ads_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentGoOfflineHostelReceiptQuery = async (req, res) => {
  try {
    const { sid, appId } = req.params;
    const { fee_payment_mode, rid, raid } = req.body;
    if (!sid && !appId && !fee_payment_mode && !rid && !raid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");

    const apply = await NewApplication.findById({ _id: appId });

    const one_hostel = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    }).populate({
      path: "institute",
      select: "admissionDepart",
    });

    const ads_admin = await Admission.findById({
      _id: `${one_hostel?.institute?.admissionDepart[0]}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute?._id}`,
    });

    const student = await Student.findById({ _id: sid });

    const remain_list = await RemainingList.findById({ _id: rid });

    if (fee_payment_mode === "By Cash") {
    } else {
      var receipt = new FeeReceipt({ ...req.body });
      receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
      receipt.student = student?._id;
      receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
      receipt.application = apply?._id;
      receipt.finance = institute?.financeDepart[0];
      if (ads_admin?.request_array?.includes(`${receipt?._id}`)) {
      } else {
        ads_admin.request_array.push(receipt?._id);
        ads_admin.fee_receipt_request.push({
          receipt: receipt?._id,
          status: "Requested",
        });
        for (var ref of remain_list?.remaining_array) {
          if (`${ref?._id}` === `${raid}`) {
            ref.status = "Receipt Requested";
            ref.fee_receipt = receipt?._id;
          }
        }
      }
      receipt.fee_request_remain_card = raid;
      remain_list.fee_receipts.push(receipt?._id);
      institute.invoice_count += 1;
      receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute.invoice_count}`;
      await Promise.all([receipt.save(), institute.save()]);
    }
    await Promise.all([ads_admin.save(), remain_list.save()]);
    res.status(200).send({ message: "Wait For Approval", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelUnitAllReceievedApplication = async (req, res) => {
  try {
    const { huid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_request = [];
      var one_unit = await HostelUnit.findById({ _id: huid })
        .select(
          "renewal_receieved_application renewal_receieved_application_count"
        )
        .populate({
          path: "renewal_receieved_application",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      for (let data of one_unit?.renewal_receieved_application) {
        if (data.student !== null) {
          filter_request.push(data);
        }
      }
      if (filter_request?.length > 0) {
        // const requestEncrypt = await encryptionPayload(one_unit);
        res.status(200).send({
          message: "find difficulties with easy search ",
          request: filter_request,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          request: [],
        });
      }
    } else {
      var one_unit = await HostelUnit.findById({ _id: huid })
        .select(
          "renewal_receieved_application renewal_receieved_application_count"
        )
        .populate({
          path: "renewal_receieved_application",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      var all_request_query = nested_document_limit(
        page,
        limit,
        one_unit?.renewal_receieved_application
      );
      if (all_request_query?.length > 0) {
        // const requestEncrypt = await encryptionPayload(one_unit);
        res.status(200).send({
          message:
            "Lots of Request arrived make sure you come up with Tea and Snack from DB 🙌",
          request: all_request_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          request: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelUnitAllSelectedApplication = async (req, res) => {
  try {
    const { huid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const one_unit = await HostelUnit.findById({ _id: huid })
        .select("renewal_selected_application_count")
        .populate({
          path: "renewal_selected_application",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      for (let data of one_unit?.renewal_selected_application) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(one_unit);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: filter_select,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    } else {
      var one_unit = await HostelUnit.findById({ _id: huid })
        .select("renewal_selected_application_count")
        .populate({
          path: "renewal_selected_application",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      var all_select_query = nested_document_limit(
        page,
        limit,
        one_unit?.renewal_selected_application
      );
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(one_unit);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: all_select_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelUnitAllConfirmedApplication = async (req, res) => {
  try {
    const { huid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_confirm = [];
      const one_unit = await HostelUnit.findById({ _id: huid })
        .select("renewal_confirmed_application_count")
        .populate({
          path: "renewal_confirmed_application",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber student_unit",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      for (let data of one_unit?.renewal_confirmed_application) {
        if (data.student !== null) {
          filter_confirm.push(data);
        }
      }
      if (filter_confirm?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(one_unit);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: filter_confirm,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    } else {
      const one_unit = await HostelUnit.findById({ _id: huid })
        .select("renewal_confirmed_application_count")
        .populate({
          path: "renewal_confirmed_application",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber student_unit student_bed_number",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      var all_confirm_query = nested_document_limit(
        page,
        limit,
        one_unit?.renewal_confirmed_application
      );
      if (all_confirm_query?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(one_unit);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: all_confirm_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelUnitAllAllottedApplication = async (req, res) => {
  try {
    const { huid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var filter_allot = [];
      var one_unit = await HostelUnit.findById({ _id: huid })
        .select("renewal_allotted_application_count")
        .populate({
          path: "renewal_allotted_application",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber student_bed_number",
            populate: {
              path: "student_bed_number",
              select: "bed_number hostelRoom",
              populate: {
                path: "hostelRoom",
                select: "room_name",
              },
            },
          },
        });
      for (let data of one_unit?.renewal_allotted_application) {
        if (data.student !== null) {
          filter_allot.push(data);
        }
      }
      if (filter_allot?.length > 0) {
        res.status(200).send({
          message: "Lots of Allotted Application from DB 😥",
          allot: filter_allot,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          allot: [],
        });
      }
    } else {
      var one_unit = await HostelUnit.findById({ _id: huid })
        .select("renewal_allotted_application_count")
        .populate({
          path: "renewal_allotted_application",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber student_bed_number",
            populate: {
              path: "student_bed_number",
              select: "bed_number hostelRoom",
              populate: {
                path: "hostelRoom",
                select: "room_name",
              },
            },
          },
        });
      var all_allot_query = nested_document_limit(
        page,
        limit,
        one_unit?.renewal_allotted_application
      );
      if (all_allot_query?.length > 0) {
        res.status(200).send({
          message: "Lots of Allotted Application from DB 😥",
          allot: all_allot_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          allot: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelUnitAllCancelledApplication = async (req, res) => {
  try {
    const { huid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var filter_cancel = [];
      var one_unit = await HostelUnit.findById({ _id: huid })
        .select("renewal_cancel_application_count")
        .populate({
          path: "renewal_cancel_application",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      for (let data of one_unit?.renewal_cancel_application) {
        if (data.student !== null) {
          filter_cancel.push(data);
        }
      }
      if (filter_cancel?.length > 0) {
        res.status(200).send({
          message: "Lots of Cancel Application from DB 😂😂",
          cancel: filter_cancel,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          cancel: [],
        });
      }
    } else {
      var one_unit = await HostelUnit.findById({ _id: huid })
        .select("renewal_cancel_application_count")
        .populate({
          path: "renewal_cancel_application",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      var all_cancel_query = nested_document_limit(
        page,
        limit,
        one_unit?.renewal_cancel_application
      );
      if (all_cancel_query?.length > 0) {
        res.status(200).send({
          message: "Lots of Cancel Application from DB 😂😂",
          cancel: all_cancel_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          cancel: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelCancelApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const hostel_admin = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    const notify = new StudentNotification({});
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
      } else {
      }
    }
    if (apply.receievedCount > 0) {
      apply.receievedCount -= 1;
    }
    status.content = `You have been rejected for ${apply.applicationName}. Best of luck for next time `;
    status.applicationId = apply._id;
    status.studentId = student._id;
    status.student = student?._id;
    user.applicationStatus.push(status._id);
    status.instituteId = hostel_admin?.institute;
    notify.notifyContent = `You have been rejected for ${apply.applicationName}. Best of luck for next time `;
    notify.notifySender = hostel_admin?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByHostelPhoto = hostel_admin?._id;
    notify.notifyCategory = "Application Rejected";
    notify.redirectIndex = 53;
    await Promise.all([
      apply.save(),
      student.save(),
      user.save(),
      status.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelCancelApplicationRenewal = async (req, res) => {
  try {
    const { sid, huid } = req.params;
    if (!sid && !huid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const one_unit = await HostelUnit.findById({ _id: huid });
    const hostel_admin = await Hostel.findById({
      _id: `${one_unit?.hostel}`,
    }).select("institute");
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    for (let app of one_unit?.renewal_receieved_application) {
      if (`${app.student}` === `${student._id}`) {
        status.applicationId = app?.appId;
        one_unit.renewal_receieved_application.pull(app._id);
      } else {
      }
    }
    if (one_unit.renewal_receieved_application_count > 0) {
      one_unit.renewal_receieved_application_count -= 1;
    }
    status.content = `You have been rejected for ${one_unit.hostel_unit_name}. Best of luck for next time `;
    status.hostelUnit = one_unit?._id;
    status.studentId = student._id;
    status.student = student?._id;
    user.applicationStatus.push(status._id);
    status.flow_status = "Hostel Application";
    status.instituteId = hostel_admin?.institute;
    await Promise.all([
      one_unit.save(),
      student.save(),
      user.save(),
      status.save(),
    ]);
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelSelectedRenewalQuery = async (req, res) => {
  try {
    const { sid, huid } = req.params;
    const { fee_struct, month, renew } = req.body;
    if (!sid && !huid && !fee_struct)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    var valid_month = month ? parseInt(month) : 0;
    const one_unit = await HostelUnit.findById({ _id: huid });
    const one_hostel = await Hostel.findById({
      _id: `${one_unit?.hostel}`,
    });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    var structure = await FeeStructure.findById({ _id: fee_struct });
    if (valid_month > 0 && valid_month <= 60 && valid_month !== 12) {
      var new_structure = new FeeStructure({
        category_master: structure?.category_master,
        class_master: structure?.class_master,
        structure_name: structure?.structure_name,
        unique_structure_name: structure?.unique_structure_name,
        total_admission_fees: structure?.total_admission_fees,
        total_installments: structure?.total_installments,
        applicable_fees: structure?.applicable_fees,
        one_installments: structure?.one_installments,
        two_installments: structure?.two_installments,
        three_installments: structure?.three_installments,
        four_installments: structure?.four_installments,
        five_installments: structure?.five_installments,
        six_installments: structure?.six_installments,
        seven_installments: structure?.seven_installments,
        eight_installments: structure?.eight_installments,
        nine_installments: structure?.nine_installments,
        ten_installments: structure?.ten_installments,
        eleven_installments: structure?.eleven_installments,
        tweleve_installments: structure?.tweleve_installments,
        fees_heads: [...structure?.fees_heads],
        fees_heads_count: structure?.fees_heads_count,
      });
      new_structure.structure_month = valid_month;
      await structure_pricing_query(new_structure, valid_month);
      status.hostel_fee_structure = new_structure?._id;
      student.hostel_fee_structure = new_structure?._id;
    } else {
      status.hostel_fee_structure = structure?._id;
      student.hostel_fee_structure = structure?._id;
    }
    const finance = await Finance.findOne({
      institute: one_hostel?.institute,
    });
    for (let app of one_unit?.renewal_receieved_application) {
      if (`${app.student}` === `${student._id}`) {
        status.applicationId = app?.appId;
        one_unit.renewal_receieved_application.pull(app._id);
      } else {
      }
    }
    one_unit.renewal_selected_application.push({
      student: student._id,
      fee_remain: structure.total_admission_fees,
      appId: status?.applicationId,
    });
    one_unit.renewal_selected_application_count += 1;
    status.content = `You have been selected for ${one_unit?.hostel_unit_name}. Confirm your admission`;
    status.for_selection = "No";
    status.studentId = student._id;
    status.student = student?._id;
    status.hostelUnit = one_unit?._id;
    status.flow_status = "Hostel Application";
    status.admissionFee = structure.total_admission_fees;
    status.instituteId = one_hostel?.institute;
    status.finance = finance?._id;
    student.hostel_fee_structure_month = valid_month;
    user.applicationStatus.push(status._id);
    student.active_status.push(status?._id);
    if (renew) {
      student.hostel_renewal = new Date(`${renew}`);
    } else {
      var month_query = custom_month_query(valid_month);
      student.hostel_renewal = new Date(`${month_query}`);
    }
    await Promise.all([
      one_unit.save(),
      student.save(),
      user.save(),
      status.save(),
    ]);
    res.status(200).send({
      message: `congrats ${student.studentFirstName} `,
      select_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderPayOfflineHostelFeeRenewal = async (req, res) => {
  try {
    const { sid, huid, aid } = req.params;
    const { amount, mode } = req.body;
    if (!sid && !huid && !amount && !mode && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const one_unit = await HostelUnit.findById({ _id: huid });
    const one_hostel = await Hostel.findById({
      _id: `${one_unit.hostel}`,
    });
    const apply = await NewApplication.findById({ _id: aid });
    var institute = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute}`,
    });
    var renew = new Renewal({});
    var finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const student = await Student.findById({ _id: sid }).populate({
      path: "hostel_fee_structure",
    });
    const old_renew = await Renewal.findOne({
      $and: [
        { renewal_student: student?._id },
        { renewal_application: apply?._id },
        { renewal_status: "Current Stay Request" },
      ],
    });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    const order = new OrderPayment({});
    old_renew.renewal_status = "Current Stay";
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.application = apply?._id;
    new_receipt.unit = one_unit?._id;
    new_receipt.finance = finance?._id;
    order.payment_module_type = "Hostel Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    institute.payment_history.push(order._id);
    renew.renewal_student = student?._id;
    renew.renewal_application = apply?._id;
    var total_amount = add_total_installment(student);
    var is_install;
    if (
      price <= student?.hostel_fee_structure?.total_admission_fees &&
      price > student?.hostel_fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    if (price > 0 && is_install) {
      one_hostel.remainingFee.push(student._id);
      student.hostelRemainFeeCount += total_amount - price;
      apply.remainingFee += total_amount - price;
      one_hostel.remainingFeeCount += total_amount - price;
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: total_amount,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "Installment_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "First Installment";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      await add_all_installment(
        apply,
        institute._id,
        new_remainFee,
        price,
        student
      );
    } else if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: student?.hostel_fee_structure?.total_admission_fees,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "One_Time_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "One Time Fees";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      one_hostel.remainingFee.push(student._id);
      student.hostelRemainFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      apply.remainingFee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      one_hostel.remainingFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.hostel_fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        one_hostel.remainingFee.pull(student._id);
      } else {
        new_remainFee.remaining_array.push({
          remainAmount:
            student?.hostel_fee_structure?.total_admission_fees - price,
          appId: apply._id,
          status: "Not Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
      }
    }
    if (mode === "Offline") {
      one_hostel.offlineFee += price;
      apply.collectedFeeCount += price;
      apply.offlineFee += price;
      one_hostel.collected_fee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
    } else if (mode === "Online") {
      one_hostel.onlineFee += price;
      apply.collectedFeeCount += price;
      apply.onlineFee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    } else {
    }
    await set_fee_head_query(student, price, apply, new_receipt, "", "Renewal");
    for (let app of one_unit?.renewal_selected_application) {
      if (`${app.student}` === `${student._id}`) {
        one_unit.renewal_selected_application.pull(app._id);
      } else {
      }
    }
    one_unit.renewal_confirmed_application.push({
      student: student._id,
      payment_status: mode,
      install_type: is_install
        ? "First Installment Paid"
        : "One Time Fees Paid",
      fee_remain: is_install
        ? total_amount - price
        : student?.hostel_fee_structure?.total_admission_fees - price,
      appId: apply?._id,
    });
    one_unit.renewal_confirmed_application_count += 1;
    student.hostelPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: apply._id,
    });
    status.content = `Your hostel Renewal has been confirmed, You will be alloted to your room / bed shortly, Stay Update!.`;
    status.applicationId = apply._id;
    status.hostelUnit = one_unit?._id;
    user.applicationStatus.push(status._id);
    status.instituteId = institute._id;
    status.flow_status = "Hostel Application";
    status.document_visible = true;
    new_remainFee.renewal_start = new Date();
    new_remainFee.renewal_end = student?.hostel_renewal;
    renew.renewal_start = new Date();
    renew.renewal_end = student?.hostel_renewal;
    renew.renewal_status = "Current Stay";
    renew.renewal_hostel = one_hostel?._id;
    student.student_renewal.push(renew?._id);
    await Promise.all([
      one_hostel.save(),
      apply.save(),
      student.save(),
      finance.save(),
      user.save(),
      order.save(),
      institute.save(),
      s_admin.save(),
      new_remainFee.save(),
      new_receipt.save(),
      status.save(),
      renew.save(),
      one_unit.save(),
      old_renew.save(),
    ]);
    res.status(200).send({
      message: "Look like a party mood",
      confirm_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Hostel Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllotHostedBedRenewalQuery = async (req, res) => {
  try {
    const { aid, huid } = req.params;
    const { hrid, bed_mode } = req.body;
    if (!aid && !req.body.dataList && !hrid && !huid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        allot_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var one_unit = await HostelUnit.findById({ _id: huid });
    var one_hostel = await Hostel.findById({
      _id: `${one_unit?.hostel}`,
    });
    var institute = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute}`,
    });
    // var batch = await Batch.findById({ _id: `${apply?.applicationBatch}` });
    var array = req.body.dataList;
    if (array?.length > 0) {
      for (var sid of array) {
        const student = await Student.findById({ _id: sid }).populate({
          path: "student_bed_number",
        });
        var valid_room = hrid ? hrid : student?.student_bed_number?.hostelRoom;
        var room = await HostelRoom.findById({ _id: valid_room });
        const remain_list = await RemainingList.findOne({
          $and: [
            { _id: { $in: student?.remainingFeeList } },
            { appId: apply?._id },
            { fee_structure: student?.hostel_fee_structure },
            {
              remaining_flow: "Hostel Application",
            },
          ],
        });
        const user = await User.findById({ _id: `${student.user}` });
        const notify = new Notification({});
        const aStatus = new Status({});
        for (let app of one_unit?.renewal_confirmed_application) {
          if (`${app.student}` === `${student._id}`) {
            one_unit.renewal_confirmed_application.pull(app._id);
          } else {
          }
        }
        // if (bed_mode === "Different") {
        //   var bed = new HostelBed({});
        //   bed.bed_allotted_candidate = student?._id;
        //   bed.hostelRoom = room?._id;
        //   bed.bed_number = room.bed_count + 1 - room.vacant_count;
        //   if (room?.vacant_count > 0) {
        //     room.vacant_count -= 1;
        //   }
        //   room.beds.push(bed?._id);
        //   one_unit.hostelities_count += 1;
        //   one_unit.hostelities.push(student?._id);
        //   one_hostel.hostelities_count += 1;
        //   student.student_bed_number = bed?._id;
        //   student.student_unit = one_unit?._id;
        //   if (student?.studentGender === "Male") {
        //     one_hostel.boy_count += 1;
        //   } else if (student?.studentGender === "Female") {
        //     one_hostel.girl_count += 1;
        //   } else if (student?.studentGender === "Other") {
        //     one_hostel.other_count += 1;
        //   } else {
        //   }
        //   await bed.save();
        // }
        one_unit.renewal_allotted_application.push({
          student: student._id,
          payment_status: "offline",
          alloted_room: room?.room_name,
          alloted_status: "Alloted",
          fee_remain: student.hostelRemainFeeCount,
          paid_status: student.hostelRemainFeeCount == 0 ? "Paid" : "Not Paid",
          appId: apply?._id,
        });
        // remain_list.batchId = batch?._id;
        one_unit.renewal_allotted_application_count += 1;
        notify.notifyContent = `Allotted Bed`;
        notify.notifySender = one_hostel?._id;
        notify.notifyReceiever = user._id;
        institute.iNotify.push(notify._id);
        notify.institute = institute._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByStudentPhoto = student._id;
        notify.notifyCategory = "Bed Allottment";
        aStatus.content = `Welcome to ${room?.room_name} Enjoy your Hostel Life.`;
        aStatus.applicationId = apply._id;
        aStatus.hostelUnit = one_unit?._id;
        aStatus.flow_status = "Hostel Application";
        user.applicationStatus.push(aStatus._id);
        aStatus.instituteId = institute._id;
        await Promise.all([
          student.save(),
          // apply.save(),
          user.save(),
          aStatus.save(),
          institute.save(),
          notify.save(),
          remain_list.save(),
          room.save(),
          one_hostel.save(),
          one_unit.save(),
        ]);
        invokeMemberTabNotification(
          "Admission Status",
          aStatus.content,
          "Hostel Status",
          user._id,
          user.deviceToken
        );
      }
      res.status(200).send({
        message: `Distribute sweets to all family members`,
        allot_status: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderCancelHostelRefundRenewalApplicationQuery = async (req, res) => {
  try {
    const { sid, aid, huid } = req.params;
    const { amount, mode, remainAmount } = req.body;
    if (!sid && !aid && !amount && !remainAmount && !mode && !huid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        refund_status: false,
      });
    var price = parseInt(amount);
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const one_unit = await HostelUnit.findById({ _id: huid });
    const apply = await NewApplication.findById({ _id: aid });
    const one_hostel = await Hostel.findById({
      _id: `${one_unit?.hostel}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${one_hostel.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const aStatus = new Status({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.refund_status = "Refunded";
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.unit = one_unit?._id;
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    if (
      price &&
      price > finance.financeTotalBalance &&
      price > one_hostel.offlineFee &&
      price > finance.financeSubmitBalance
    ) {
      res.status(200).send({
        message: "insufficient Balance in Finance Department to make refund",
      });
    } else {
      const order = new OrderPayment({});
      one_unit.renewal_cancel_application_count += 1;
      if (apply.remainingFee >= parseInt(remainAmount)) {
        apply.remainingFee -= parseInt(remainAmount);
      }
      if (mode === "Offline") {
        if (finance.financeHostelBalance >= price) {
          finance.financeHostelBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeSubmitBalance >= price) {
          finance.financeSubmitBalance -= price;
        }
        if (one_hostel.offlineFee >= price) {
          one_hostel.offlineFee -= price;
        }
        if (one_hostel.collected_fee >= price) {
          one_hostel.collected_fee -= price;
        }
        if (apply.offlineFee >= price) {
          apply.offlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
      } else if (mode === "Online") {
        if (one_hostel.onlineFee >= price) {
          one_hostel.onlineFee -= price;
        }
        if (apply.onlineFee >= price) {
          apply.onlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
        if (finance.financeHostelBalance >= price) {
          finance.financeHostelBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeBankBalance >= price) {
          finance.financeBankBalance -= price;
        }
      }
      if (one_hostel.remainingFeeCount >= parseInt(remainAmount)) {
        one_hostel.remainingFeeCount -= parseInt(remainAmount);
      }
      aStatus.content = `your hostel admission has been cancelled successfully with refund of Rs. ${price}`;
      aStatus.applicationId = apply._id;
      aStatus.hostelUnit = one_unit?._id;
      aStatus.flow_status = "Hostel Application";
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      student.hostelRemainFeeCount = 0;
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Hostel Admission",
        refund_amount: price,
        refund_from: apply?._id,
      });
      const all_remain_fee_list = await RemainingList.findOne({
        $and: [
          { student: student?._id },
          { appId: apply?._id },
          { fee_structure: student?.hostel_fee_structure },
          { remaining_flow: "Hostel Application" },
        ],
      });
      const filter_student_install =
        all_remain_fee_list?.remaining_array?.filter((stu) => {
          if (`${stu.appId}` === `${apply._id}` && stu.status === "Not Paid")
            return stu;
        });
      for (var can = 0; can < filter_student_install?.length; can++) {
        all_remain_fee_list?.remaining_array.pull(filter_student_install[can]);
      }
      all_remain_fee_list.fee_receipts.push(new_receipt?._id);
      all_remain_fee_list.refund_fee += price;
      if (all_remain_fee_list.paid_fee >= price) {
        all_remain_fee_list.paid_fee -= price;
      }
      all_remain_fee_list.remaining_fee = 0;
      for (var ele of student?.active_fee_heads) {
        if (`${ele?.appId}` === `${apply?._id}`) {
          ele.paid_fee = 0;
          ele.remain_fee = 0;
        }
      }
      all_remain_fee_list.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "Cancellation & Refunded",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
        refund_status: "Refunded",
      });
      order.payment_module_type = "Expense";
      order.payment_to_end_user_id = institute._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = apply._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Debit";
      order.payment_flag_by = "Credit";
      order.payment_mode = mode;
      order.payment_admission = apply._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      institute.invoice_count += 1;
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute.invoice_count}`;
      order.payment_invoice_number = new_receipt?.invoice_count;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      order.fee_receipt = new_receipt?._id;
      await Promise.all([
        apply.save(),
        student.save(),
        finance.save(),
        one_hostel.save(),
        aStatus.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
        all_remain_fee_list.save(),
        new_receipt.save(),
        one_unit.save(),
      ]);
      res.status(200).send({
        message: "Refund & Cancellation of Hostel Admission",
        refund_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Hostel Status",
        user._id,
        user.deviceToken
      );
      if (one_unit.renewal_confirmed_application?.length > 0) {
        for (let app of one_unit.renewal_confirmed_application) {
          if (`${app.student}` === `${student._id}`) {
            one_unit.renewal_confirmed_application.pull(app._id);
          } else {
          }
        }
        one_unit.renewal_cancel_application.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          appId: apply?._id,
        });
        await one_unit.save();
      }
      if (one_hostel?.remainingFee?.length > 0) {
        if (one_hostel.remainingFee?.includes(`${student._id}`)) {
          one_hostel.remainingFee.pull(student._id);
        }
        await one_hostel.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelAllStudentRenewalQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_student = await Student.findById({ _id: sid }).select(
      "student_renewal"
    );
    var all_renewals = await Renewal.find({
      _id: { $in: one_student?.student_renewal },
    })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "renewal_application",
        select: "applicationName",
      })
      .populate({
        path: "renewal_hostel",
        select: "_id institute bank_account",
        populate: {
          path: "institute",
          select: "financeDepart admissionDepart",
        },
      })
      .populate({
        path: "receipt",
        select: "reason",
      })
      .populate({
        path: "renewal_hostel",
        select: "_id institute bank_account",
        populate: {
          path: "bank_account",
        },
      })
      .populate({
        path: "renewal_student",
        select: "hostel_fee_structure",
        populate: {
          path: "hostel_fee_structure",
          select:
            "structure_month one_installments category_master class_master structure_name total_admission_fees total_installments applicable_fees",
          populate: {
            path: "category_master",
            select: "category_name",
          },
        },
      });
    if (all_renewals?.length > 0) {
      res.status(200).send({
        message: "Explore All Renewals Query",
        access: true,
        all_renewals: all_renewals,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Renewals Query", access: true, all_renewals: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelAllStudentRoommatesQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_student = await Student.findById({ _id: sid })
      .select("student_bed_number")
      .populate({
        path: "student_bed_number",
        select: "hostelRoom",
      });

    const one_room = await HostelRoom.findById({
      _id: `${one_student?.student_bed_number?.hostelRoom}`,
    }).select("beds");
    var all_roommates = await HostelBed.find({
      _id: { $in: one_room?.beds },
    })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "bed_allotted_candidate",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto user",
        populate: {
          path: "user",
          select: "username userLegalName photoId profilePhoto",
        },
      });

    all_roommates = all_roommates?.filter((ref) => {
      if (`${ref?.bed_allotted_candidate}` !== `${one_student?._id}`)
        return ref;
    });
    if (all_roommates?.length > 0) {
      res.status(200).send({
        message: "Explore All Roommates Query",
        access: true,
        all_roommates: all_roommates,
      });
    } else {
      res.status(200).send({
        message: "No Roommates Query",
        access: true,
        all_roommates: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelPayModeRenewal = async (req, res) => {
  try {
    const { sid, rid } = req.params;
    const { fee_payment_mode, month } = req.body;
    if (!sid && !rid && !fee_payment_mode)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley 😒",
        access: false,
      });
    var valid_month = month ? parseInt(month) : 0;
    const student = await Student.findById({ _id: sid });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const user = await User.findById({ _id: `${student.user}` });
    const aStatus = new Status({});
    const renew = await Renewal.findById({ _id: rid });
    const one_unit = await HostelUnit.findById({
      _id: `${renew?.renewal_unit}`,
    });
    var structure = await FeeStructure.findById({
      _id: `${student?.hostel_fee_structure}`,
    });
    const apply = await NewApplication.findById({
      _id: `${renew?.renewal_application}`,
    }).select("selectedApplication hostelAdmin");
    var admin_ins = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    }).populate({
      path: "institute",
      select: "admissionDepart",
    });
    renew.renewal_status = "Current Stay";
    const institute = await InstituteAdmin.findById({
      _id: `${admin_ins?.institute?._id}`,
    });
    if (valid_month > 0 && valid_month <= 60 && valid_month !== 12) {
      var new_structure = new FeeStructure({
        category_master: structure?.category_master,
        class_master: structure?.class_master,
        structure_name: structure?.structure_name,
        unique_structure_name: structure?.unique_structure_name,
        total_admission_fees: structure?.total_admission_fees,
        total_installments: structure?.total_installments,
        applicable_fees: structure?.applicable_fees,
        one_installments: structure?.one_installments,
        two_installments: structure?.two_installments,
        three_installments: structure?.three_installments,
        four_installments: structure?.four_installments,
        five_installments: structure?.five_installments,
        six_installments: structure?.six_installments,
        seven_installments: structure?.seven_installments,
        eight_installments: structure?.eight_installments,
        nine_installments: structure?.nine_installments,
        ten_installments: structure?.ten_installments,
        eleven_installments: structure?.eleven_installments,
        tweleve_installments: structure?.tweleve_installments,
        fees_heads: [...structure?.fees_heads],
        fees_heads_count: structure?.fees_heads_count,
      });
      new_structure.structure_month = valid_month;
      await structure_pricing_query(new_structure, valid_month);
      student.hostel_fee_structure = new_structure?._id;
    } else {
      student.hostel_fee_structure = structure?._id;
    }
    if (one_unit?.renewal_selected_application?.length > 0) {
      one_unit?.renewal_selected_application?.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.payment_status =
            fee_payment_mode === "By Cash" ? "offline" : "Receipt Requested";
        }
      });
      await one_unit.save();
    }
    if (fee_payment_mode === "By Cash") {
      renew.payMode = "offline";
      renew.sub_payment_mode = "By Cash";
    } else {
      renew.sub_payment_mode = fee_payment_mode;
      renew.payMode = "online";
      var receipt = new FeeReceipt({ ...req.body });
      receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
      receipt.student = student?._id;
      receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
      receipt.application = apply?._id;
      // receipt.app_status = status?._id;
      renew.receipt = receipt?._id;
      receipt.finance = institute?.financeDepart[0];
      if (admin_ins?.request_array?.includes(`${receipt?._id}`)) {
      } else {
        admin_ins.request_array.push(receipt?._id);
        admin_ins.fee_receipt_request.push({
          receipt: receipt?._id,
          status: "Requested",
        });
        renew.receipt_status = "Requested";
      }
      institute.invoice_count += 1;
      receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute.invoice_count}`;
      await Promise.all([receipt.save(), institute.save()]);
    }
    aStatus.content = `Your renewal is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees or contact institute if neccessory`;
    aStatus.applicationId = apply._id;
    aStatus.hostelUnit = one_unit?._id;
    aStatus.flow_status = "Hostel Application";
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    student.hostel_fee_structure_month = valid_month;
    var month_query = custom_month_query(valid_month);
    student.hostel_renewal = new Date(`${month_query}`);
    await Promise.all([
      aStatus.save(),
      user.save(),
      admin_ins.save(),
      renew.save(),
      student.save(),
    ]);
    res.status(200).send({
      message: "Lets do some excercise visit institute",
      status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      aStatus.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelCancelPayModeRenewal = async (req, res) => {
  try {
    const { sid, rid } = req.params;
    if (!sid && !rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley 😒",
        access: false,
      });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const aStatus = new Status({});
    const renew = await Renewal.findById({ _id: rid });
    const one_unit = await HostelUnit.findById({
      _id: `${renew?.renewal_unit}`,
    });
    const apply = await NewApplication.findById({
      _id: `${renew?.renewal_application}`,
    }).select("hostelAdmin");
    var admin_ins = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    });
    renew.renewal_status = "Cancel Current Stay";
    const institute = await InstituteAdmin.findById({
      _id: `${admin_ins?.institute}`,
    });
    for (var ref of one_unit?.renewal_selected_application) {
      if (`${ele.student}` === `${student._id}`) {
        one_unit?.renewal_selected_application.pull(ref?._id);
      }
    }

    for (var ref of one_unit?.renewal_receieved_application) {
      if (`${ele.student}` === `${student._id}`) {
        one_unit?.renewal_receieved_application.pull(ref?._id);
      }
    }

    one_unit.renewal_cancel_application.push({
      student: student?._id,
      payment_status: "Cancelled Renewal",
      refund_amount: 0,
      appId: apply?._id,
    });
    one_unit.renewal_cancel_application_count += 1;
    aStatus.content = `Your renewal is rejected | cancelled.`;
    aStatus.applicationId = apply._id;
    aStatus.hostelUnit = one_unit?._id;
    aStatus.flow_status = "Hostel Application";
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    await Promise.all([
      aStatus.save(),
      user.save(),
      renew.save(),
      one_unit.save(),
    ]);
    res.status(200).send({
      message: "Lets do some excercise visit institute",
      status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      aStatus.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelPayMode = async (req, res) => {
  try {
    const { sid, aid, statusId } = req.params;
    const { fee_payment_mode } = req.body;
    if (!sid && !aid && !statusId && !fee_payment_mode)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley 😒",
        access: false,
      });
    const student = await Student.findById({ _id: sid });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const user = await User.findById({ _id: `${student.user}` });
    const status = await Status.findById({ _id: statusId });
    const aStatus = new Status({});
    const notify = new StudentNotification({});
    const apply = await NewApplication.findById({ _id: aid }).select(
      "selectedApplication hostelAdmin"
    );
    var admin_ins = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    })
      .populate({
        path: "institute",
        select: "admissionDepart",
      })
      .populate({
        path: "hostel_manager",
        select: "user",
      });
    const institute = await InstituteAdmin.findById({
      _id: `${admin_ins?.institute?._id}`,
    });
    if (apply?.selectedApplication?.length > 0) {
      apply?.selectedApplication?.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.payment_status =
            fee_payment_mode === "By Cash" ? "offline" : "Receipt Requested";
        }
      });
      await apply.save();
    }
    if (fee_payment_mode === "By Cash") {
      status.payMode = "offline";
      status.sub_payment_mode = "By Cash";
    } else {
      status.sub_payment_mode = fee_payment_mode;
      status.payMode = "online";
      var receipt = new FeeReceipt({ ...req.body });
      receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
      receipt.student = student?._id;
      receipt.application = apply?._id;
      receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
      receipt.app_status = status?._id;
      status.receipt = receipt?._id;
      receipt.finance = institute?.financeDepart[0];
      if (admin_ins?.request_array?.includes(`${receipt?._id}`)) {
      } else {
        admin_ins.request_array.push(receipt?._id);
        admin_ins.fee_receipt_request.push({
          receipt: receipt?._id,
          status: "Requested",
        });
        status.receipt_status = "Requested";
      }
      institute.invoice_count += 1;
      receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute.invoice_count}`;
      await Promise.all([receipt.save(), institute.save()]);
    }
    status.isPaid = "Not Paid";
    status.for_selection = "No";
    aStatus.content = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees or contact institute if neccessory`;
    aStatus.applicationId = apply._id;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    notify.notifyContent = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees or contact institute if neccessory`;
    notify.notifySender = admin_ins?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByHostelPhoto = admin_ins?._id;
    notify.notifyCategory = "Admission Hold";
    notify.redirectIndex = 52;
    await Promise.all([
      status.save(),
      aStatus.save(),
      user.save(),
      admin_ins.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: "Lets do some excercise visit institute",
      status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      aStatus.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllReceiptsQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { filter_by, over_filter, search } = req.query;
    if (!hid && !filter_by)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    // if (over_filter) {
    //   var filter_hostel = await Hostel.findOne({
    //     _id: over_filter,
    //   })
    //     .select("_id bank_account")
    //     .populate({
    //       path: "bank_account",
    //       select: "finance_bank_name",
    //     });
    //   if (filter_by === "ALL_REQUEST") {
    //     if (search) {
    //       var ads_admin = await Hostel.findById({ _id: hid })
    //         .select("fee_receipt_request")
    //         .populate({
    //           path: "fee_receipt_request",
    //           populate: {
    //             path: "receipt",
    //             match: {
    //               fee_utr_reference: { $regex: search, $options: "i" },
    //             },
    //             populate: {
    //               path: "student application",
    //               select:
    //                 "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationHostel",
    //             },
    //           },
    //         });
    //     } else {
    //       var ads_admin = await Hostel.findById({ _id: hid })
    //         .select("fee_receipt_request")
    //         .populate({
    //           path: "fee_receipt_request",
    //           populate: {
    //             path: "receipt",
    //             populate: {
    //               path: "student application",
    //               select:
    //                 "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationHostel",
    //             },
    //           },
    //         });
    //     }
    //       var receipt_request = ads_admin?.fee_receipt_request?.filter(
    //         (ref) => {
    //           if (
    //             `${ref?.receipt?.application?.applicationHostel}` ===
    //             `${filter_hostel?._id}`
    //           )
    //             return ref;
    //         }
    //       );
    //     var all_requests = await nested_document_limit(
    //       page,
    //       limit,
    //       receipt_request
    //     );
    //   } else if (filter_by === "ALL_APPROVE") {
    //     if (search) {
    //       var ads_admin = await Hostel.findById({ _id: hid })
    //         .select("fee_receipt_approve")
    //         .populate({
    //           path: "fee_receipt_approve",
    //           populate: {
    //             path: "receipt",
    //             match: {
    //               fee_utr_reference: { $regex: search, $options: "i" },
    //             },
    //             populate: {
    //               path: "student application",
    //               select:
    //                 "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationHostel",
    //             },
    //           },
    //         });
    //     } else {
    //       var ads_admin = await Hostel.findById({ _id: hid })
    //         .select("fee_receipt_approve")
    //         .populate({
    //           path: "fee_receipt_approve",
    //           populate: {
    //             path: "receipt",
    //             populate: {
    //               path: "student application",
    //               select:
    //                 "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationHostel",
    //             },
    //           },
    //         });
    //     }
    //       var receipt_request = ads_admin?.fee_receipt_approve?.filter(
    //         (ref) => {
    //           if (
    //             `${ref?.receipt?.application?.applicationHostel}` ===
    //             `${filter_hostel?._id}`
    //           )
    //             return ref;
    //         }
    //       );

    //     var all_requests = await nested_document_limit(
    //       page,
    //       limit,
    //       receipt_approve
    //     );
    //   } else if (filter_by === "ALL_REJECT") {
    //     if (search) {
    //       var ads_admin = await Hostel.findById({ _id: hid })
    //         .select("fee_receipt_reject")
    //         .populate({
    //           path: "fee_receipt_reject",
    //           populate: {
    //             path: "receipt",
    //             match: {
    //               fee_utr_reference: { $regex: search, $options: "i" },
    //             },
    //             populate: {
    //               path: "student application",
    //               select:
    //                 "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationHostel",
    //             },
    //           },
    //         });
    //     } else {
    //       var ads_admin = await Hostel.findById({ _id: hid })
    //         .select("fee_receipt_reject")
    //         .populate({
    //           path: "fee_receipt_reject",
    //           populate: {
    //             path: "receipt",
    //             populate: {
    //               path: "student application",
    //               select:
    //                 "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationHostel",
    //             },
    //           },
    //         });
    //     }
    //       var receipt_reject = ads_admin?.fee_receipt_reject?.filter((ref) => {
    //         if (
    //           `${ref?.receipt?.application?.applicationHostel}` ===
    //           `${filter_hostel?._id}`
    //         )
    //           return ref;
    //       });
    //     var all_requests = await nested_document_limit(
    //       page,
    //       limit,
    //       receipt_reject
    //     );
    //   } else {
    //     var all_requests = [];
    //   }
    // } else {
    if (filter_by === "ALL_REQUEST") {
      if (search) {
        var ads_admin = await Hostel.findById({ _id: hid })
          .select("fee_receipt_request")
          .populate({
            path: "fee_receipt_request",
            populate: {
              path: "receipt",
              match: {
                fee_utr_reference: { $regex: search, $options: "i" },
              },
              populate: {
                path: "student",
                select:
                  "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
              },
            },
          });
      } else {
        var ads_admin = await Hostel.findById({ _id: hid })
          .select("fee_receipt_request")
          .populate({
            path: "fee_receipt_request",
            populate: {
              path: "receipt",
              populate: {
                path: "student",
                select:
                  "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
              },
            },
          });
      }
      var receipt_request = ads_admin?.fee_receipt_request?.filter((ref) => {
        if (ref?.receipt !== null) return ref;
      });
      var all_requests = await nested_document_limit(
        page,
        limit,
        receipt_request
      );
    } else if (filter_by === "ALL_APPROVE") {
      if (search) {
        var ads_admin = await Hostel.findById({ _id: hid })
          .select("fee_receipt_approve")
          .populate({
            path: "fee_receipt_approve",
            populate: {
              path: "receipt",
              match: {
                fee_utr_reference: { $regex: search, $options: "i" },
              },
              populate: {
                path: "student",
                select:
                  "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
              },
            },
          });
      } else {
        var ads_admin = await Hostel.findById({ _id: hid })
          .select("fee_receipt_approve")
          .populate({
            path: "fee_receipt_approve",
            populate: {
              path: "receipt",
              populate: {
                path: "student",
                select:
                  "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
              },
            },
          });
      }
      var receipt_approve = ads_admin?.fee_receipt_approve?.filter((ref) => {
        if (ref?.receipt !== null) return ref;
      });
      var all_requests = await nested_document_limit(
        page,
        limit,
        receipt_approve
      );
    } else if (filter_by === "ALL_REJECT") {
      if (search) {
        var ads_admin = await Hostel.findById({ _id: hid })
          .select("fee_receipt_reject")
          .populate({
            path: "fee_receipt_reject",
            populate: {
              path: "receipt",
              match: {
                fee_utr_reference: { $regex: search, $options: "i" },
              },
              populate: {
                path: "student",
                select:
                  "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
              },
            },
          });
      } else {
        var ads_admin = await Hostel.findById({ _id: hid })
          .select("fee_receipt_reject")
          .populate({
            path: "fee_receipt_reject",
            populate: {
              path: "receipt",
              populate: {
                path: "student",
                select:
                  "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
              },
            },
          });
      }
      var receipt_reject = ads_admin?.fee_receipt_reject?.filter((ref) => {
        if (ref?.receipt !== null) return ref;
      });
      var all_requests = await nested_document_limit(
        page,
        limit,
        receipt_reject
      );
    } else {
      var all_requests = [];
    }
    // }
    if (all_requests?.length > 0) {
      res.status(200).send({
        message: "Lot's of Receipts Available",
        access: true,
        all_requests: all_requests,
        count: all_requests?.length,
        // department_account: filter_depart ? filter_depart : null,
      });
    } else {
      res.status(200).send({
        message: "No Receipts Available",
        access: false,
        all_requests: [],
        count: 0,
        // department_account: null,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneReceiptStatus = async (req, res) => {
  try {
    const { hid, rid } = req.params;
    const { status, reqId } = req.query;
    const { reason } = req.body;
    if (!hid && !rid && !reqId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var ads_admin = await Hostel.findById({ _id: hid }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var one_receipt = await FeeReceipt.findById({ _id: rid }).populate({
      path: "student",
      select: "user",
    });
    var student = await Student.findById({
      _id: `${one_receipt?.student?._id}`,
    }).populate({
      path: "hostel_fee_structure",
    });
    var user = await User.findById({ _id: `${student?.user}` });
    var one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    var one_status = await Status.findOne({
      receipt: one_receipt?._id,
    });
    var one_renew = await Renewal.findOne({
      receipt: one_receipt?._id,
    });
    var remaining_lists = await RemainingList.findOne({
      $and: [{ student: student?._id }, { appId: one_app?._id }],
    });
    if (status === "Approved") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_request.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        status: "Approved",
      });
      if (one_status) {
        one_status.receipt_status = "Approved";
      }
      if (one_renew) {
        one_renew.receipt_status = "Approved";
      }
      if (remaining_lists) {
        for (var ref of remaining_lists?.remaining_array) {
          if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
            ref.status = "Not Paid";
            ref.reject_reason = null;
          }
        }
        await remaining_lists.save();
      }
      one_receipt.fee_request_remain_card = "";
      await one_receipt.save();
    } else if (status === "Rejected") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_request.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_reject.push({
        receipt: one_receipt?._id,
        status: "Rejected",
        reason: reason,
      });
      if (remaining_lists) {
        for (var ref of remaining_lists?.remaining_array) {
          if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
            ref.status = "Receipt Rejected";
            ref.reject_reason = reason;
          }
        }
        await remaining_lists.save();
      }
      one_receipt.reason = reason;
      if (one_status) {
        one_status.receipt_status = "Rejected";
      }
      if (one_renew) {
        one_renew.receipt_status = "Rejected";
      }
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Rejected";
        }
      }
      await one_receipt.save();
    } else if (status === "Over_Rejection") {
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_reject.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        status: "Approved",
        over_status: "After Rejection Approved By Admission Admin",
      });
      if (one_status) {
        one_status.receipt_status = "Approved";
      }
      if (one_renew) {
        one_renew.receipt_status = "Approved";
      }
      one_receipt.re_apply = false;
      if (remaining_lists) {
        for (var ref of remaining_lists?.remaining_array) {
          if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
            ref.status = "Not Paid";
            ref.reject_reason = null;
          }
        }
        await remaining_lists.save();
      }
      one_receipt.fee_request_remain_card = "";
      // for (var ref of one_app?.selectedApplication) {
      //   if (`${ref.student}` === `${one_receipt?.student}`) {
      //     ref.payment_status = "Receipt Approved";
      //   }
      // }
      await one_receipt.save();
    } else if (status === "Rejection_Notify") {
      if (one_status) {
        one_status.receipt_status = "Rejected";
      }
      if (one_renew) {
        one_renew.receipt_status = "Rejected";
      }
      one_receipt.re_apply = false;
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Rejected";
        }
      }
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          ele.reason = reason;
        }
      }
      if (remaining_lists) {
        for (var ref of remaining_lists?.remaining_array) {
          if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
            ref.status = "Receipt Rejected";
            ref.reject_reason = reason;
          }
        }
        await remaining_lists.save();
      }
      one_receipt.reason = reason;
      await one_receipt.save();
      const notify = new StudentNotification({});
      notify.notifyContent = `Your Receipt was cancelled By Hostel Manager`;
      notify.notifySender = ads_admin?.hostel_manager?.user;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = one_receipt?.student?._id;
      user.activity_tab.push(notify._id);
      notify.notifyByHostelPhoto = ads_admin._id;
      notify.notifyCategory = "Receipt Reject";
      notify.redirectIndex = 28;
      invokeMemberTabNotification(
        "Admission Status",
        `Payment Receipt Reject`,
        "Hostel Status",
        user._id,
        user.deviceToken
      );
      await Promise.all([user.save(), notify.save()]);
    } else {
    }
    if (one_status) {
      await Promise.all([ads_admin.save(), one_status.save(), one_app.save()]);
    } else if (one_renew) {
      await Promise.all([ads_admin.save(), one_renew.save(), one_app.save()]);
    } else {
      await Promise.all([ads_admin.save(), one_app.save()]);
    }
    res
      .status(200)
      .send({ message: `Receipts ${status} by Hostel Manager`, access: true });

    if (one_app?.hostelAdmin && one_status) {
      const ads_admin = await Hostel.findById({
        _id: `${one_app?.hostelAdmin}`,
      });
      if (
        status === "Approved" ||
        (status === "Over_Rejection" && one_receipt?.fee_payment_type)
      ) {
        const pay_mode =
          one_receipt?.fee_payment_mode === "By Cash" ? "Offline" : "Online";
        await request_hostel_mode_query_by_student(
          ads_admin?._id,
          student?._id,
          one_app?._id,
          one_receipt?.fee_payment_amount,
          pay_mode,
          one_receipt?.fee_payment_type,
          one_receipt?._id
        );
      } else if (status === "Approved" || status === "Over_Rejection") {
        const ads_admin = await Hostel.findById({
          _id: `${one_app?.hostelAdmin}`,
        }).populate({
          path: "hostel_manager",
          select: "user",
        });
        await hostel_receipt_approve_query(
          ads_admin,
          student,
          one_receipt,
          one_app,
          institute,
          finance,
          s_admin,
          user
        );
      } else {
      }
    } else if (one_app?.hostelAdmin && one_renew) {
      const ads_admin = await Hostel.findById({
        _id: `${one_app?.hostelAdmin}`,
      });
      if (
        status === "Approved" ||
        (status === "Over_Rejection" && one_receipt?.fee_payment_type)
      ) {
        const pay_mode =
          one_receipt?.fee_payment_mode === "By Cash" ? "Offline" : "Online";
        await request_hostel_mode_query_by_student_renewal(
          ads_admin?._id,
          student?._id,
          one_app?._id,
          one_receipt?.fee_payment_amount,
          pay_mode,
          one_receipt?.fee_payment_type,
          one_receipt?._id,
          one_renew
        );
      } else if (status === "Approved" || status === "Over_Rejection") {
        const ads_admin = await Hostel.findById({
          _id: `${one_app?.hostelAdmin}`,
        });
        await hostel_receipt_approve_query_renewal(
          ads_admin,
          student,
          one_receipt,
          one_app,
          institute,
          finance,
          s_admin,
          user,
          one_renew
        );
      } else {
      }
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdminSelectMode = async (req, res) => {
  try {
    const { aid, sid } = req.params;
    if (!aid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const apply = await NewApplication.findById({ _id: aid }).select(
      "selectedApplication  hostelAdmin"
    );
    const student = await Student.findById({ _id: sid });
    const aStatus = new Status({});
    const notify = new StudentNotification({});
    const status = await Status.findOne({
      $and: [{ _id: student?.active_status }, { applicationId: apply?._id }],
    });
    const user = await User.findById({ _id: `${student.user}` });
    var admin_ins = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admin_ins?.institute}`,
    });
    if (status) {
      if (apply?.selectedApplication?.length > 0) {
        apply?.selectedApplication?.forEach((ele) => {
          if (`${ele.student}` === `${student._id}`) {
            ele.payment_status = "offline";
          }
        });
        await apply.save();
      }
      status.payMode = "offline";
      status.sub_payment_mode = "By Cash";
      status.isPaid = "Not Paid";
      status.for_selection = "No";
      aStatus.content = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees or contact institute if neccessory`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      // student.active_status.pull(status?._id);
      notify.notifyContent = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees or contact institute if neccessory`;
      notify.notifySender = admin_ins?.hostel_manager?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByHostelPhoto = admin_ins?._id;
      notify.notifyCategory = "Admission Hold";
      notify.redirectIndex = 52;
      await Promise.all([
        status.save(),
        aStatus.save(),
        user.save(),
        notify.save(),
        // student.save(),
      ]);
      res.status(200).send({
        message: "Lets do some excercise visit institute",
        access: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Hostel Status",
        user._id,
        user.deviceToken
      );
    } else {
      res.status(200).send({
        message: "You lost in space",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdminStudentCancelSelectQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    var admission_admin = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    const notify = new StudentNotification({});
    const aStatus = await Status.findOne({
      $and: [{ _id: student?.active_status }, { applicationId: apply?._id }],
    });
    for (let app of apply.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.selectedApplication.pull(app._id);
      } else {
      }
    }
    if (apply.selectCount > 0) {
      apply.selectCount -= 1;
    }
    aStatus.isPaid = "Not Paid";
    aStatus.for_selection = "No";
    status.content = `Your hostel admission is cancelled for ${apply.applicationName}. Due to no further activity `;
    status.applicationId = apply._id;
    status.studentId = student._id;
    status.student = student?._id;
    user.applicationStatus.push(status._id);
    status.instituteId = admission_admin?.institute;
    // student.active_status.pull(aStatus?._id);
    notify.notifyContent = `Your hostel admission is cancelled for ${apply.applicationName}. Due to no further activity`;
    notify.notifySender = admission_admin?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByHostelPhoto = admission_admin?._id;
    notify.notifyCategory = "Admission Cancellation";
    notify.redirectIndex = 51;
    await Promise.all([
      apply.save(),
      // student.save(),
      user.save(),
      status.save(),
      aStatus.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelAllClassMasterQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (search) {
      var all_masters = await ClassMaster.find({
        $and: [{ institute: id }],
        $or: [{ className: { $regex: search, $options: "i" } }],
      })
        .select("className classCount")
        .populate({
          path: "department",
          select: "dName",
        });
    } else {
      var all_masters = await ClassMaster.find({
        institute: id,
      })
        .limit(limit)
        .skip(skip)
        .select("className classCount")
        .populate({
          path: "department",
          select: "dName",
        });
    }
    if (all_masters?.length > 0) {
      res.status(200).send({
        message: "Explore All Class Masters Query",
        access: true,
        all_masters: all_masters,
      });
    } else {
      res.status(200).send({
        message: "No Class Masters Query",
        access: true,
        all_masters: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewHostelAnnouncementQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { announceCount } = req.body;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid });
    const announcements = new InsAnnouncement({ ...req.body });
    one_hostel.announcement.unshift(announcements._id);
    one_hostel.announcementCount += 1;
    announcements.one_hostel = one_hostel?._id;
    var valid_count = announceCount ? parseInt(announceCount) : 0;
    if (valid_count > 0) {
      for (var i = 1; i <= valid_count; i++) {
        var fileValue = req?.files[`file${i}`];
        for (let file of fileValue) {
          const results = await uploadDocFile(file);
          announcements.announcementHostelDocument.push(results.Key);
          await unlinkFile(file.path);
        }
      }
    }
    await Promise.all([one_hostel.save(), announcements.save()]);
    res.status(200).send({
      message: "Successfully Created Hostel Announcements",
      announcements,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllHostelAnnouncementQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const one_hostel = await Hostel.findById({ _id: hid });
    const announcement = await InsAnnouncement.find({
      _id: { $in: one_hostel?.announcement },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "insAnnPhoto photoId insAnnTitle insAnnVisibilty insAnnDescription createdAt announcementHostelDocument"
      )
      .populate({
        path: "reply",
        select: "replyText createdAt replyAuthorAsUser replyAuthorAsIns",
      })
      .populate({
        path: "hostel",
        select: "photoId hostel_photo",
      });
    if (announcement?.length > 0) {
      res.status(200).send({
        message: "Explore All Hostel Announcement List",
        announcement: announcement,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Hostel Announcement List",
        announcement: [],
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDirectHostelJoinConfirmQuery = async (req, res) => {
  try {
    const { id, aid } = req.params;
    const { existingUser } = req.query;
    var existing = await handle_undefined(existingUser);
    const {
      sample_pic,
      fileArray,
      type,
      mode,
      amount,
      fee_struct,
      month,
      room,
      bed,
    } = req.body;
    if (
      !id &&
      !aid &&
      !req.body.studentFirstName &&
      !req.body.studentLastName &&
      !req.body.studentGender &&
      !req.body.studentDOB &&
      !type &&
      !mode &&
      !amount
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var valid_month = month ? parseInt(month) : 0;
    var structure = await FeeStructure.findById({ _id: `${fee_struct}` });
    const apply = await NewApplication.findById({ _id: aid });
    const one_unit = await HostelUnit.findById({
      _id: `${apply?.applicationUnit}`,
    });
    var new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.fee_transaction_date = new Date(
      `${req.body?.transaction_date}`
    );
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    const ons_hostel = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${ons_hostel?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    if (!existing) {
      var valid = await filter_unique_username(
        req.body.studentFirstName,
        req.body.studentDOB
      );
    }
    if (!existing) {
      if (!valid?.exist) {
        const genUserPass = bcrypt.genSaltSync(12);
        const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
        var user = new User({
          userLegalName: `${req.body.studentFirstName} ${
            req.body.studentMiddleName ? req.body.studentMiddleName : ""
          } ${req.body.studentLastName ? req.body.studentLastName : ""}`,
          userGender: req.body.studentGender,
          userDateOfBirth: req.body.studentDOB,
          username: valid?.username,
          userStatus: "Approved",
          userPhoneNumber: id,
          userPassword: hashUserPass,
          photoId: "0",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        await universal_account_creation_feed(user);
        await user_date_of_birth(user);
      } else {
      }
    } else {
      var user = await User.findById({ _id: `${existing}` });
    }
    const student = new Student({ ...req.body });
    student.valid_full_name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    student.student_join_mode = "HOSTEL_PROCESS";
    const studentOptionalSubject = req.body?.optionalSubject
      ? req.body?.optionalSubject
      : [];
    for (var file of fileArray) {
      if (file.name === "file") {
        student.photoId = "0";
        student.studentProfilePhoto = file.key;
        user.profilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        student.studentAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        student.studentAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        student.studentBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        student.studentCasteCertificatePhoto = file.key;
      else {
        student.studentDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    if (studentOptionalSubject?.length > 0) {
      student.studentOptionalSubject.push(...studentOptionalSubject);
    }
    if (sample_pic) {
      user.profilePhoto = sample_pic;
      student.photoId = "0";
      student.studentProfilePhoto = sample_pic;
    }
    user.student.push(student._id);
    user.applyApplication.push(apply._id);
    student.user = user._id;
    if (valid_month > 0 && valid_month <= 60 && valid_month !== 12) {
      var new_structure = new FeeStructure({
        category_master: structure?.category_master,
        class_master: structure?.class_master,
        structure_name: structure?.structure_name,
        unique_structure_name: structure?.unique_structure_name,
        total_admission_fees: structure?.total_admission_fees,
        total_installments: structure?.total_installments,
        applicable_fees: structure?.applicable_fees,
        one_installments: structure?.one_installments,
        two_installments: structure?.two_installments,
        three_installments: structure?.three_installments,
        four_installments: structure?.four_installments,
        five_installments: structure?.five_installments,
        six_installments: structure?.six_installments,
        seven_installments: structure?.seven_installments,
        eight_installments: structure?.eight_installments,
        nine_installments: structure?.nine_installments,
        ten_installments: structure?.ten_installments,
        eleven_installments: structure?.eleven_installments,
        tweleve_installments: structure?.tweleve_installments,
        fees_heads: [...structure?.fees_heads],
        fees_heads_count: structure?.fees_heads_count,
      });
      new_structure.structure_month = valid_month;
      await structure_pricing_query(new_structure, valid_month);
      student.hostel_fee_structure = new_structure?._id;
    } else {
      student.hostel_fee_structure = structure?._id;
    }
    await student.save();
    await insert_multiple_hostel_status(
      apply,
      user,
      institute,
      student?._id,
      one_unit,
      finance,
      new_receipt
    );
    apply.receievedCount += 1;
    apply.selectCount += 1;
    apply.confirmCount += 1;
    await fee_reordering_hostel(
      type,
      mode,
      parseInt(amount),
      student,
      apply,
      institute,
      finance,
      ons_hostel,
      admins,
      new_receipt,
      user,
      one_unit,
      room,
      bed
    );
    if (institute.userFollowersList.includes(user?._id)) {
    } else {
      user.userInstituteFollowing.push(institute._id);
      user.followingUICount += 1;
      institute.userFollowersList.push(user?._id);
      institute.followersCount += 1;
    }
    var exist_stu = await Student.find({
      $and: [{ institute: institute?._id }, { user: user?._id }],
    });
    if (exist_stu?.length > 0) {
      exist_stu[0].exist_linked_hostel.status = "Linked";
      exist_stu[0].exist_linked_hostel.exist_student = student?._id;
      await exist_stu[0].save();
    }
    // await insert_multiple_status(apply, user, institute, student?._id);
    await Promise.all([
      student.save(),
      user.save(),
      apply.save(),
      institute.save(),
      ons_hostel.save(),
      finance.save(),
      one_unit.save(),
    ]);
    res.status(200).send({
      message:
        "Account Creation Process Completed & message: Taste a bite of sweets till your application is selected, 😀✨",
      access: true,
    });
    await ignite_multiple_alarm(user);
    const studentName = `${student?.studentFirstName} ${
      student?.studentMiddleName ? student?.studentMiddleName : ""
    } ${student?.studentLastName}`;
    whats_app_sms_payload(
      user?.userPhoneNumber,
      studentName,
      institute?.insName,
      null,
      "ASCAS",
      institute?.insType,
      student.hostelPaidFeeCount,
      student.hostelRemainFeeCount,
      institute?.sms_lang
    );
    if (user?.userEmail) {
      await email_sms_payload_query(
        user?.userEmail,
        studentName,
        institute,
        "ASCAS",
        institute?.insType,
        student.hostelPaidFeeCount,
        student.hostelRemainFeeCount,
        institute?.sms_lang
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDirectHostelJoinExcelQuery = async (hid, student_array) => {
  try {
    for (var ref of student_array) {
      var maleAvatar = [
        "3D2.jpg",
        "3D4.jpg",
        "3D6.jpg",
        "3D19.jpg",
        "3D20.jpg",
        "3D26.jpg",
        "3D21.jpg",
        "3D12.jpg",
      ];
      var femaleAvatar = [
        "3D1.jpg",
        "3D3.jpg",
        "3D10.jpg",
        "3D11.jpg",
        "3D14.jpg",
        "3D15.jpg",
        "3D22.jpg",
        "3D31.jpg",
      ];
      var valid_month = ref?.month ? parseInt(ref?.month) : 0;
      var structure = await FeeStructure.findById({
        _id: `${ref?.fee_struct}`,
      });
      const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
      const exist_user = await User.findOne({
        userPhoneNumber: ref?.userPhoneNumber,
      });
      const exist_email = await User.findOne({ userEmail: ref?.userEmail });
      if (exist_user || exist_email) {
        var user = exist_user ? exist_user : exist_email;
      } else {
        var valid = await filter_unique_username(
          ref?.studentFirstName,
          ref?.studentDOB
        );
        const genUserPass = bcrypt.genSaltSync(12);
        const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
        var user = new User({
          userLegalName: `${ref?.studentFirstName} ${
            ref?.studentMiddleName ? ref?.studentMiddleName : ""
          } ${ref?.studentLastName ? ref?.studentLastName : ""}`,
          userGender: ref?.studentGender,
          userDateOfBirth: ref?.studentDOB,
          username: valid?.username,
          userStatus: "Approved",
          userPhoneNumber: ref?.userPhoneNumber ? ref?.userPhoneNumber : 0,
          userEmail: ref?.userEmail,
          userPassword: hashUserPass,
          photoId: "0",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        await universal_account_creation_feed(user);
        await user_date_of_birth(user);
      }
      const apply = await NewApplication.findById({ _id: ref?.aid });
      const one_unit = await HostelUnit.findById({
        _id: `${apply?.applicationUnit}`,
      });
      var new_receipt = new FeeReceipt({
        fee_payment_amount: ref?.fee_payment_amount,
        fee_payment_mode: ref?.fee_payment_mode,
        fee_transaction_date: ref?.fee_transaction_date,
      });
      new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
      const ons_hostel = await Hostel.findById({
        _id: hid,
      });
      const institute = await InstituteAdmin.findById({
        _id: `${ons_hostel?.institute}`,
      });
      const finance = await Finance.findById({
        _id: `${institute?.financeDepart[0]}`,
      });
      const student = new Student({
        studentFirstName: ref?.studentFirstName,
        studentMiddleName: ref?.studentMiddleName,
        studentLastName: ref?.studentLastName,
        studentGender: ref?.studentGender,
        studentDOB: ref?.studentDOB,
        studentPhoneNumber: ref?.studentPhoneNumber,
        student_join_mode: "HOSTEL_PROCESS",
      });
      student.valid_full_name = `${student?.studentFirstName} ${
        student?.studentMiddleName ?? ""
      } ${student?.studentLastName}`;
      const studentOptionalSubject = ref?.optionalSubject
        ? ref?.optionalSubject
        : [];
      for (var file of ref?.fileArray) {
        if (file.name === "file") {
          student.photoId = "0";
          student.studentProfilePhoto = file.key;
          user.profilePhoto = file.key;
        } else if (file.name === "addharFrontCard")
          student.studentAadharFrontCard = file.key;
        else if (file.name === "addharBackCard")
          student.studentAadharBackCard = file.key;
        else if (file.name === "bankPassbook")
          student.studentBankPassbook = file.key;
        else if (file.name === "casteCertificate")
          student.studentCasteCertificatePhoto = file.key;
        else {
          student.studentDocuments.push({
            documentName: file.name,
            documentKey: file.key,
            documentType: file.type,
          });
        }
      }
      if (studentOptionalSubject?.length > 0) {
        student.studentOptionalSubject.push(...studentOptionalSubject);
      }
      if (student?.studentGender?.toLowerCase() === "male") {
        user.profilePhoto = maleAvatar[Math.floor(Math.random() * 8)];
        student.studentProfilePhoto = maleAvatar[Math.floor(Math.random() * 8)];
      } else if (student?.studentGender?.toLowerCase() === "female") {
        user.profilePhoto = femaleAvatar[Math.floor(Math.random() * 8)];
        student.studentProfilePhoto =
          femaleAvatar[Math.floor(Math.random() * 8)];
      } else {
      }
      student.photoId = "0";
      user.student.push(student._id);
      user.applyApplication.push(apply._id);
      student.user = user._id;
      if (valid_month > 0 && valid_month <= 60 && valid_month !== 12) {
        var new_structure = new FeeStructure({
          category_master: structure?.category_master,
          class_master: structure?.class_master,
          structure_name: structure?.structure_name,
          unique_structure_name: structure?.unique_structure_name,
          total_admission_fees: structure?.total_admission_fees,
          total_installments: structure?.total_installments,
          applicable_fees: structure?.applicable_fees,
          one_installments: structure?.one_installments,
          two_installments: structure?.two_installments,
          three_installments: structure?.three_installments,
          four_installments: structure?.four_installments,
          five_installments: structure?.five_installments,
          six_installments: structure?.six_installments,
          seven_installments: structure?.seven_installments,
          eight_installments: structure?.eight_installments,
          nine_installments: structure?.nine_installments,
          ten_installments: structure?.ten_installments,
          eleven_installments: structure?.eleven_installments,
          tweleve_installments: structure?.tweleve_installments,
          fees_heads: [...structure?.fees_heads],
          fees_heads_count: structure?.fees_heads_count,
        });
        new_structure.structure_month = valid_month;
        await structure_pricing_query(new_structure, valid_month);
        student.hostel_fee_structure = new_structure?._id;
      } else {
        student.hostel_fee_structure = structure?._id;
      }
      await student.save();
      await insert_multiple_hostel_status(
        apply,
        user,
        institute,
        student?._id,
        one_unit,
        finance,
        new_receipt
      );
      apply.receievedCount += 1;
      apply.selectCount += 1;
      apply.confirmCount += 1;
      await fee_reordering_hostel(
        ref?.type,
        ref?.mode,
        parseInt(ref?.amount),
        student,
        apply,
        institute,
        finance,
        ons_hostel,
        admins,
        new_receipt,
        user,
        one_unit,
        ref?.room,
        ref?.bed,
        ref?.startDate
      );
      if (institute.userFollowersList.includes(user?._id)) {
      } else {
        user.userInstituteFollowing.push(institute._id);
        user.followingUICount += 1;
        institute.userFollowersList.push(user?._id);
        institute.followersCount += 1;
      }
      var exist_stu = await Student.find({
        $and: [{ institute: institute?._id }, { user: user?._id }],
      });
      if (exist_stu?.length > 0) {
        exist_stu[0].exist_linked_hostel.status = "Linked";
        exist_stu[0].exist_linked_hostel.exist_student = student?._id;
        await exist_stu[0].save();
      }
      // await insert_multiple_status(apply, user, institute, student?._id);
      await Promise.all([
        student.save(),
        user.save(),
        apply.save(),
        institute.save(),
        ons_hostel.save(),
        finance.save(),
        one_unit.save(),
      ]);
      await ignite_multiple_alarm(user);
      const studentName = `${student?.studentFirstName} ${
        student?.studentMiddleName ? student?.studentMiddleName : ""
      } ${student?.studentLastName}`;
      whats_app_sms_payload(
        user?.userPhoneNumber,
        studentName,
        institute?.insName,
        null,
        "ASCAS",
        institute?.insType,
        student.hostelPaidFeeCount,
        student.hostelRemainFeeCount,
        institute?.sms_lang
      );
      if (user?.userEmail) {
        await email_sms_payload_query(
          user?.userEmail,
          studentName,
          institute,
          "ASCAS",
          institute?.insType,
          student.hostelPaidFeeCount,
          student.hostelRemainFeeCount,
          institute?.sms_lang
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelMasterDepositQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid }).populate({
      path: "institute",
      select: "financeDepart",
    });
    const master = await FeeMaster.findOne({
      $and: [
        { master_status: "Hostel Linked" },
        { finance: one_hostel?.institute?.financeDepart?.[0] },
      ],
    }).select(
      "paid_student_count deposit_amount master_name refund_student_count refund_amount"
    );

    res.status(200).send({
      message: "Explore Linked Fee Masters",
      access: true,
      master: master,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelMasterAllDepositHistory = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const hostel = await Hostel.findById({ _id: hid }).select("refund_deposit");

    if (search) {
      var all_receipts = await FeeReceipt.find({
        _id: { $in: hostel?.refund_deposit },
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
        _id: { $in: hostel?.refund_deposit },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        });
    }
    if (all_receipts?.length > 0) {
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

exports.renderApplicationAutoQRCodeQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { qr_code } = req.query;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    var new_app = await NewApplication.findById({ _id: hid });
    new_app.app_qr_code = qr_code;
    await new_app.save();
    res
      .status(200)
      .send({ message: "Explore New Application QR Code Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllExportExcelArrayQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Hostel.findById({ _id: hid }).select(
      "export_collection"
    );

    var all_excel = await nested_document_limit(
      page,
      limit,
      ads_admin?.export_collection.reverse()
    );
    if (all_excel?.length > 0) {
      res.status(200).send({
        message: "Explore All Exported Excel",
        access: true,
        all_excel: all_excel,
        count: ads_admin?.export_collection?.length,
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
    const { hid, exid } = req.params;
    const { excel_file_name } = req.body;
    if (!hid && !exid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Hostel.findById({ _id: hid }).select(
      "export_collection"
    );
    for (var exe of ads_admin?.export_collection) {
      if (`${exe?._id}` === `${exid}`) {
        exe.excel_file_name = excel_file_name;
      }
    }
    await ads_admin.save();
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
    const { hid, exid } = req.params;
    if (!hid && !exid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Hostel.findById({ _id: hid }).select(
      "export_collection export_collection_count"
    );
    for (var exe of ads_admin?.export_collection) {
      if (`${exe?._id}` === `${exid}`) {
        ads_admin?.export_collection.pull(exid);
        if (ads_admin?.export_collection_count > 0) {
          ads_admin.export_collection_count -= 1;
        }
      }
    }
    await ads_admin.save();
    res.status(200).send({
      message: "Exported Excel Deletion Operation Completed",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewBatchQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { id } = req.query;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid });
    const institute = await InstituteAdmin.findById({
      _id: id,
    });
    const batch = new Batch({ ...req.body });
    one_hostel.batches.push(batch);
    one_hostel.batchCount += 1;
    batch.hostel = one_hostel?._id;
    institute.batches.push(batch._id);
    batch.institute = institute?._id;
    await Promise.all([one_hostel.save(), batch.save(), institute.save()]);
    res.status(200).send({
      message: "Explore New Batch Query",
      batch: batch._id,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllBatchQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid }).select(
      "departmentSelectBatch batches"
    );

    var all_batches = await Batch.find({ _id: { $in: one_hostel?.batches } })
      .limit(limit)
      .skip(skip)
      .select("batchName batchStatus createdAt");

    if (all_batches?.length > 0) {
      res.status(200).send({
        message: "Explore All Batches Query",
        access: true,
        all_batches: all_batches,
        select_batch: one_hostel?.departmentSelectBatch,
      });
    } else {
      res.status(200).send({
        message: "No All Batches Query",
        all_batches: [],
        access: false,
        select_batch: null || "",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderCurrentSelectBatchQuery = async (req, res) => {
  try {
    const { hid, bid } = req.params;
    if (!hid && !bid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const valid_hostel = await Hostel.findById({ _id: hid });
    var valid_active_batch = await handle_undefined(
      valid_hostel?.departmentSelectBatch
    );
    if (valid_active_batch) {
      var prev_batches = await Batch.findById({
        _id: valid_hostel.departmentSelectBatch,
      });
      prev_batches.activeBatch = "Not Active";
      await prev_batches.save();
    }
    const batches = await Batch.findById({ _id: bid });
    valid_hostel.departmentSelectBatch = batches._id;
    valid_hostel.userBatch = batches._id;
    batches.activeBatch = "Active";
    await Promise.all([valid_hostel.save(), batches.save()]);
    res.status(200).send({
      message: "Explore Selected Batch Detail Query",
      batches: batches._id,
      valid_hostel: valid_hostel?.departmentSelectBatch,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewMasterQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid });
    const master = new ClassMaster({ ...req.body });
    one_hostel.masters.push(master?._id);
    one_hostel.masterCount += 1;
    master.hostel = one_hostel?._id;
    await Promise.all([one_hostel.save(), master.save()]);
    res.status(200).send({
      message: "Explore New Master Query",
      master: master._id,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllMasterQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid }).select("masters");

    var all_masters = await ClassMaster.find({
      _id: { $in: one_hostel?.masters },
    }).select("className");

    if (all_masters?.length > 0) {
      res.status(200).send({
        message: "Explore All Masters Query",
        access: true,
        all_masters: all_masters,
      });
    } else {
      res.status(200).send({
        message: "No All Masters Query",
        all_masters: [],
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDemandChequeApprovalQuery = async (req, res) => {
  try {
    const { hid, rid } = req.params;
    const { status, reqId } = req.query;
    const { reason } = req.body;
    if (!hid && !rid && !reqId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var ads_admin = await Hostel.findById({ _id: hid }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var one_receipt = await FeeReceipt.findById({ _id: rid }).populate({
      path: "student",
      select: "user",
    });
    var student = await Student.findById({
      _id: `${one_receipt?.student?._id}`,
    }).populate({
      path: "fee_structure",
    });
    var user = await User.findById({ _id: `${student?.user}` });
    var one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    var one_status = await Status.findOne({
      receipt: one_receipt?._id,
    });
    if (status === "Approved") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_request.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        demand_cheque_status: "Approved",
      });
      if (one_status) {
        one_status.receipt_status = "Approved";
      }
      one_receipt.fee_transaction_date = new Date();
      await one_receipt.save();
    } else if (status === "Rejected") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_request.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_reject.push({
        receipt: one_receipt?._id,
        demand_cheque_status: "Rejected",
        reason: reason,
      });
      one_receipt.reason = reason;
      if (one_status) {
        one_status.receipt_status = "Rejected";
      }
      await one_receipt.save();
    } else if (status === "Over_Rejection") {
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_reject.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        demand_cheque_status: "Approved",
        over_status: "After Rejection Approved By Hostel Manager",
      });
      one_receipt.fee_transaction_date = new Date();
      if (one_status) {
        one_status.receipt_status = "Approved";
      }
      one_receipt.re_apply = false;
      await one_receipt.save();
    } else if (status === "Rejection_Notify") {
      if (one_status) {
        one_status.receipt_status = "Rejected";
      }
      one_receipt.re_apply = false;
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          ele.reason = reason;
        }
      }
      one_receipt.reason = reason;
      await Promise.all([one_receipt.save(), one_app.save()]);
      const notify = new StudentNotification({});
      notify.notifyContent = `Your Fees Receipt was cancelled By Hostel Manager`;
      notify.notifySender = ads_admin?.hostel_manager?.user;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = one_receipt?.student?._id;
      user.activity_tab.push(notify._id);
      notify.notifyByHostelPhoto = ads_admin._id;
      notify.notifyCategory = "Receipt Reject";
      notify.redirectIndex = 28;
      invokeMemberTabNotification(
        "Hostel Status",
        `Payment Receipt Reject`,
        "Application Status",
        user._id,
        user.deviceToken
      );
      await Promise.all([user.save(), notify.save()]);
    } else {
    }
    if (one_status) {
      await Promise.all([ads_admin.save(), one_status.save(), one_app.save()]);
    } else {
      await Promise.all([ads_admin.save(), one_app.save()]);
    }
    res
      .status(200)
      .send({ message: `Receipts ${status} by Admission Admin`, access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneReceiptReApplyDeChequeQuery = async (req, res) => {
  try {
    const { sid, rid } = req.params;
    const { delete_pic } = req.query;
    const image = await handle_undefined(delete_pic);
    if (!sid && !rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_receipt = await FeeReceipt.findByIdAndUpdate(rid, req.body);
    if (image) {
      await deleteFile(image);
    }
    const one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    const ads_admin = await Hostel.findById({
      _id: `${`${one_app?.hostelAdmin}`}`,
    }).populate({
      path: "institute",
      select: "admissionDepart",
    });
    var status = await Status.findOne({ receipt: one_receipt?._id });
    if (status) {
      status.receipt_status = "Requested";
    }
    one_receipt.re_apply = true;
    await Promise.all([status.save(), one_receipt.save()]);
    res
      .status(200)
      .send({ message: "Your Receipts Under Processing", access: true });
    for (var all of ads_admin?.fee_receipt_reject) {
      if (`${all?.receipt}` === `${one_receipt?._id}`) {
        ads_admin.fee_receipt_reject.pull(all?._id);
        ads_admin.fee_receipt_reject.unshift({
          receipt: one_receipt?._id,
          demand_cheque_status: "Rejected",
        });
      }
    }
    await ads_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllAppsQuery = async (req, res) => {
  try {
    var { hid } = req.params;
    var ads = await Hostel.findById({ _id: hid });
    var all = await NewApplication.find({
      _id: { $in: ads?.newApplication },
    }).select("applicationName");

    res.status(200).send({ message: "Explore All Apps", all: all });
  } catch (e) {
    console.log(e);
  }
};

const nested_function_app = async (arg) => {
  var flag = false;
  if (arg?.receievedApplication?.length > 0) {
    flag = true;
  } else if (arg?.selectedApplication?.length > 0) {
    flag = true;
  } else if (arg?.confirmedApplication?.length > 0) {
    flag = true;
  } else if (arg?.allottedApplication?.length > 0) {
    flag = true;
  } else if (arg?.cancelApplication?.length > 0) {
    flag = true;
  } else {
    flag = false;
  }
  return flag;
};

exports.renderAppDeleteQuery = async (req, res) => {
  try {
    const { hid, appId } = req.params;
    if (!appId && !hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately 😡",
        access: false,
      });
    const ads_admin = await Hostel.findById({ _id: hid });
    const ads_app = await NewApplication.findById({ _id: appId });
    const institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    const flag_status = await nested_function_app(ads_app);
    if (flag_status) {
      res.status(200).send({
        message:
          "Deletion Operation Denied Some Student Already Applied for this Application 😥",
        access: false,
      });
    } else {
      ads_admin.newApplication.pull(ads_app?._id);
      if (ads_admin?.newAppCount > 0) {
        ads_admin.newAppCount -= 1;
      }
      if (institute.hostelCount > 0) {
        institute.hostelCount -= 1;
      }
      await Promise.all([institute.save(), ads_admin.save()]);
      if (ads_app?.applicationPhoto) {
        await deleteFile(ads_app?.applicationPhoto);
      }
      await NewApplication.findByIdAndDelete(ads_app?._id);
      res
        .status(200)
        .send({ message: "Deletion Operation Completed 😁", access: true });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllNotLinkedQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    if (search) {
      var all_ins = await InstituteAdmin.find({
        $and: [
          {
            status: "Approved",
          },
        ],
        $or: [
          {
            insName: { $regex: `${search}`, $options: "i" },
          },
          {
            name: { $regex: `${search}`, $options: "i" },
          },
        ],
      }).select(
        "insName name photoId insProfilePhoto status hostel_linked_status hostelDepart"
      );
    } else {
      var all_ins = await InstituteAdmin.find({
        status: "Approved",
      })
        .sort({ createdAt: "-1" })
        .limit(limit)
        .skip(skip)
        .select(
          "insName name photoId insProfilePhoto status hostel_linked_status hostelDepart"
        );
    }

    if (all_ins?.length > 0) {
      for (var ref of all_ins) {
        if (`${ref?.hostelDepart?.includes(`${hid}`)}`) {
          hostel_linked_status = "Linked";
        } else {
          hostel_linked_status = "Not Linked";
        }
      }
      res.status(200).send({
        message: "Explore Not Linked Query",
        access: true,
        all_ins: all_ins,
      });
    } else {
      res
        .status(200)
        .send({ message: "You're lost in space", access: false, all_ins: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneLinkedQuery = async (req, res) => {
  try {
    const { hid, id } = req.params;
    if (!hid && !id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var hostel = await Hostel.findById({ _id: hid });
    var one_ins = await InstituteAdmin.findById({ _id: id });

    if (one_ins?.hostelDepart?.includes(`${hostel?._id}`)) {
      res.status(200).send({ message: "Already Linked", access: true });
    } else {
      one_ins.hostelDepart.push(hostel?._id);
      one_ins.hostelStatus = "Enable";
      hostel.linked_institute.push(one_ins?._id);
      hostel.linked_institute_count += 1;
      await Promise.all([one_ins.save(), hostel.save()]);
      res
        .status(200)
        .send({ message: "Linking Operation Completed", access: true });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderPass = async(req, res) => {
  try{
    var all_student = await Student.find({})
    .populate({
      path: "hostel_fee_structure",
      populate: {
        path: "finance",
        select: "institute"
      }
    })
    for(var ref of all_student){
      if(ref?.hostel_fee_structure?._id){
        ref.institute = ref?.hostel_fee_structure?.finance?.institute
        await ref.save()
      }
    }
    res.status(200).send({ message: "Pass"})
  }
  catch(e){
    console.log(e)
  }
}

// exports.renderHostelAllAppsQuery = async (req, res) => {
//   try {
//     const { hid } = req.params;
//     const { bid } = req.query;
//     var one_hostel = await Hostel.findById({ _id: hid }).select(
//       "newApplication"
//     );

//     var one_batch = await Batch.findById({ _id: bid });
//     var all_apps = await NewApplication.find({
//       _id: { $in: one_hostel?.newApplication },
//     });

//     for (var ref of all_apps) {
//       ref.applicationBatch = one_batch?._id;
//       await ref.save();
//     }
//     res.status(200).send({ message: "Attach Batch with Hostel", access: true });
//   } catch (e) {
//     console.log(e);
//   }
// };
