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
  email_sms_designation_application,
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
  new_chat_username_unique,
} = require("../../helper/functions");
const {
  custom_date_time,
  user_date_of_birth,
  age_calc,
} = require("../../helper/dayTimer");
const {
  add_all_installment,
  add_total_installment,
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
const { universal_random_password } = require("../../Custom/universalId");
const QvipleId = require("../../models/Universal/QvipleId");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const {
  form_no_query,
  fee_receipt_count_query,
} = require("../../Functions/AdmissionCustomFunctions.js/Reusable");
const generateStudentAdmissionForm = require("../../scripts/studentAdmissionForm");
const {
  universal_random_password_student_code,
} = require("../../Generator/RandomPass");
const {
  render_new_fees_card,
  render_new_hostel_fees_card,
} = require("../../Functions/FeesCard");
const NestedCard = require("../../models/Admission/NestedCard");
const {
  all_installment_paid,
  render_installment,
  set_fee_head_query_redesign_split,
  set_fee_head_query_redesign,
  lookup_applicable_grant,
  update_fee_head_query_redesign_split,
  update_fee_head_query_redesign,
  exempt_installment,
} = require("../../helper/Installment");
const {
  renderAllStudentToUnApprovedAutoCatalogQuery,
} = require("../Authentication/AuthController");

exports.renderActivateHostelQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { sid } = req.body;
    var institute = await InstituteAdmin.findById({ _id: id });
    var hostel = new Hostel({});
    const codess = universal_random_password();
    hostel.member_module_unique = `${codess}`;
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
        "created_at moderator_role moderator_role_count fees_structures_count batchCount departmentSelectBatch ug_undertakings_hostel_admission pg_undertakings_hostel_admission onlineFee offlineFee exemptAmount requested_status remainingFeeCount collected_fee hostel_unit_count hostel_photo hostel_wardens_count boy_count girl_count other_count bed_count room_count app_qr_code app_hindi_qr_code app_marathi_qr_code code_url"
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
        select: "_id institute",
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
    const { filter_by, master_by, unit_by } = req.query;
    const master_query = await handle_undefined(filter_by);
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid }).select(
      "fees_structures"
    );
    var all_structures = [];
    if (master_query) {
      if (master_by) {
        all_structures = await FeeStructure.find({
          $and: [
            { _id: { $in: one_hostel?.fees_structures } },
            { batch_master: master_query },
            {
              class_master: `${master_by}`,
            },
            {
              unit_master: unit_by,
            },
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
          })
          .populate({
            path: "unit_master",
            select: "hostel_unit_name",
          })
          .populate({
            path: "batch_master",
            select: "batchName",
          });
      } else {
        all_structures = await FeeStructure.find({
          $and: [
            { _id: { $in: one_hostel?.fees_structures } },
            { batch_master: master_query },
            { unit_master: unit_by },
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
          })
          .populate({
            path: "unit_master",
            select: "hostel_unit_name",
          })
          .populate({
            path: "batch_master",
            select: "batchName",
          });
      }
    } else {
      all_structures = await FeeStructure.find({
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
        })
        .populate({
          path: "unit_master",
          select: "hostel_unit_name",
        })
        .populate({
          path: "batch_master",
          select: "batchName",
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
    if (req.body?.studentFatherName) {
      student.studentMiddleName = req.body?.studentFatherName;
    }
    student.valid_full_name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    student.student_join_mode = "HOSTEL_PROCESS";
    const codess = universal_random_password();
    student.member_module_unique = `${codess}`;
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
    one_hostel.student.push(student?._id);
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
    student.student_form_flow.flow = "APPLICATION";
    student.student_form_flow.did = apply._id;
    form_no_query(institute, student, "HOSTEL");
    status.document_visible = true;
    status.instituteId = institute._id;
    status.finance = institute?.financeDepart?.[0];
    status.student = student?._id;
    user.student.push(student._id);
    user.applyApplication.push(apply._id);
    status.bank_account = filtered_account?._id;
    status.flow_status = "Hostel Application";
    status.group_by = "Admission_Application_Applied";
    student.user = user._id;
    user.applicationStatus.push(status._id);
    if (apply?.receieved_array?.includes(`${student?._id}`)) {
    } else {
      apply.receievedApplication.push({
        student: student._id,
        fee_remain: 0,
      });
      apply.receievedCount += 1;
      apply.receieved_array.push(student?._id);
    }
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
    let nums = universal_random_password_student_code();
    student.qviple_student_pay_id = nums;
    await Promise.all([
      student.save(),
      user.save(),
      status.save(),
      apply.save(),
      institute.save(),
      notify.save(),
      one_hostel.save(),
    ]);
    res.status(201).send({
      message: "Taste a bite of sweets till your application is selected",
      student: student._id,
      status: true,
    });
    let name = `${student?.studentFirstName} ${
      student?.studentMiddleName
        ? student?.studentMiddleName
        : student?.studentFatherName ?? ""
    } ${student?.studentLastName}`;
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Hostel Status",
      user._id,
      user.deviceToken
    );
    await generateStudentAdmissionForm(
      student?._id,
      institute?._id,
      `${student?.studentFirstName} ${
        student?.studentMiddleName
          ? student?.studentMiddleName
          : student?.studentFatherName
          ? student?.studentFatherName
          : ""
      } ${student?.studentLastName}`,
      `${apply?.applicationName}`
    );
  } catch (e) {
    console.log(e);
    res.status(201).send({
      message: "Test And Send Back To Server",
      student: null,
      status: true,
      error: e,
    });
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
        "applicationName applicationEndDate applicationTypeStatus receievedApplication selectedApplication confirmedApplication admissionAdmin selectCount confirmCount receievedCount allottedApplication allotCount applicationStatus applicationSeats applicationMaster applicationAbout admissionProcess application_flow applicationBatch gr_initials cancelApplication cancelCount reviewApplication review_count FeeCollectionApplication fee_collect_count student_form_setting pin"
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
        ref.allotCount = ref?.allottedApplication?.length;
        ref.cancelCount = ref?.cancelApplication?.length;
        ref.review_count = ref?.reviewApplication?.length;
        ref.fee_collect_count = ref?.FeeCollectionApplication?.length;
      }
      const ads_obj = {
        message: "All Hostel Ongoing Application from DB 🙌",
        // ongoing: cached.ongoing,
        // ongoingCount: cached.ongoingCount,
        ongoing: ongoing,
        ongoingCount: ongoing?.length,
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
        ads_obj,
      });
    } else {
      const ads_obj = {
        message: "Dark side in depth nothing to find",
        ongoing: [],
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({ encrypt: adsEncrypt });
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
        "applicationName applicationEndDate applicationStatus applicationSeats allotCount pin"
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
      const ads_obj = {
        message: "All Completed Applicationd from DB 🙌",
        // completed: cached.completed,
        // completedCount: cached.completedCount,
        completed: completed,
        completedCount: completed?.length,
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
      });
    } else {
      const ads_obj = {
        message: "Dark side in depth nothing to find",
        completed: [],
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({ encrypt: adsEncrypt });
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
        "applicationName applicationType applicationAbout applicationMaster admissionProcess applicationEndDate applicationStartDate admissionFee applicationPhoto photoId applicationSeats receievedCount selectCount confirmCount applicationStatus cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount app_qr_code student_form_setting app_hindi_qr_code app_marathi_qr_code pin code_url"
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
    const { fee_struct, month, renew, staffId } = req.body;
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
      revert_request_status: status?._id,
    });
    apply.selectCount += 1;

    status.applicationId = apply._id;
    status.for_docs = "Yes";
    status.studentId = student._id;
    status.student = student?._id;
    status.admissionFee = structure.total_admission_fees;
    status.group_by = "Admission_Document_Verification";
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
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "select_by",
    });
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
    const { receipt_status } = req.query;
    const { amount, mode, card_id, rid, type, pay_remain, nsid, staffId } =
      req.body;
    if (!sid && !aid && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    var apply = await NewApplication.findById({ _id: aid });
    var student = await Student.findById({ _id: sid }).populate({
      path: "hostel_fee_structure",
    });
    var admission = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    if (student?.fee_receipt?.length > 0) {
      for (let ele of apply?.FeeCollectionApplication) {
        if (`${ele?.student}` === `${student?._id}`) {
          apply?.FeeCollectionApplication.pull(ele?._id);
        }
      }
      for (let ele of admission?.FeeCollectionApplication) {
        if (`${ele?.student}` === `${student?._id}`) {
          admission?.FeeCollectionApplication.pull(ele?._id);
        }
      }
      let exist = apply?.confirmedApplication?.filter((val) => {
        if (`${val?.student}` === `${student?._id}`) return val;
      });
      if (exist?.length > 0) {
      } else {
        apply.confirmedApplication.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: 0,
        });
        admission.confirmedApplication_query.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: 0,
          application: apply?._id,
        });
      }
      // for (let ele of apply?.confirmedApplication) {
      //   if (`${ele?.student}` === `${student?._id}`) {

      //   }
      //   else {
      //     if (`${ele?.student}` === `${student?._id}`) {
      //       // apply.confirmedApplication.push({
      //       //   student: student._id,
      //       //   payment_status: mode,
      //       //   install_type: "First Installment Paid",
      //       //   fee_remain: 0,
      //       // });
      //     }
      //   }
      // }
      await Promise.all([apply.save(), admission.save()]);
      res.status(200).send({
        message: "Already Fee Collected ",
        confirm_status: false,
      });
    } else {
      var institute = await InstituteAdmin.findById({
        _id: `${admission.institute}`,
      });
      var finance = await Finance.findById({
        _id: `${institute.financeDepart[0]}`,
      });
      var all_status = await Status.find({
        $and: [
          { applicationId: apply?._id },
          { student: student?._id },
          { payment_status: "Not Paid" },
        ],
      });
      var new_remainFee = await RemainingList.findById({ _id: rid })
        .populate({
          path: "applicable_card",
        })
        .populate({
          path: "government_card",
        });
      const user = await User.findById({ _id: `${student.user}` });
      const status = new Status({});
      const order = new OrderPayment({});
      const notify = new StudentNotification({});
      const new_receipt = new FeeReceipt({ ...req.body });
      new_receipt.student = student?._id;
      new_receipt.fee_structure = new_remainFee?.fee_structure;
      new_receipt.fee_transaction_date = new Date(
        `${req.body.transaction_date}`
      );
      new_receipt.application = apply?._id;
      new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
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
      order.fee_receipt = new_receipt?._id;
      await fee_receipt_count_query(
        institute,
        new_receipt,
        order,
        finance?.show_invoice_pattern,
        apply?.applicationHostel
      );
      // institute.invoice_count += 1;
      // new_receipt.invoice_count = `${
      //   new Date().getMonth() + 1
      // }${new Date().getFullYear()}${institute.invoice_count}`;
      // order.payment_invoice_number = new_receipt?.invoice_count;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "fee_collect_by",
      });
      if (`${new_remainFee?.applicable_card?._id}` === `${card_id}`) {
        var nest_card = await NestedCard.findById({ _id: `${card_id}` });
        new_remainFee.active_payment_type = `${type}`;
        nest_card.active_payment_type = `${type}`;
        new_remainFee.paid_fee += price;
        nest_card.paid_fee += price;
        if (new_remainFee?.remaining_fee >= price) {
          new_remainFee.remaining_fee -= price;
        }
        if (nest_card?.remaining_fee >= price) {
          nest_card.remaining_fee -= price;
        } else {
          nest_card.remaining_fee = 0;
        }
        if (student.admissionRemainFeeCount >= price) {
          student.admissionRemainFeeCount -= price;
        }
        if (apply.remainingFee >= price) {
          apply.remainingFee -= price;
        }
        if (admission.remainingFeeCount >= price) {
          admission.remainingFeeCount -= price;
        }
        var valid_one_time_fees =
          student?.hostel_fee_structure?.applicable_fees - price == 0
            ? true
            : false;
        if (valid_one_time_fees) {
          admission.remainingFee.pull(student._id);
        } else {
        }
        if (pay_remain) {
          await all_installment_paid(
            new_remainFee,
            student?.hostel_fee_structure,
            mode,
            price,
            admission,
            student,
            new_receipt,
            apply,
            institute,
            nest_card,
            type
          );
        } else {
          await render_installment(
            type,
            student,
            mode,
            price,
            admission,
            student?.hostel_fee_structure,
            new_remainFee,
            new_receipt,
            apply,
            institute,
            nest_card
          );
        }
        await nest_card.save();
        if (req.body?.fee_payment_mode === "Government/Scholarship") {
          // New Logic
        } else {
          if (
            new_remainFee?.is_splited &&
            new_remainFee?.is_splited === "Yes"
          ) {
            console.log("Enter Split");
            await set_fee_head_query_redesign_split(
              student,
              new_receipt?.fee_payment_amount,
              apply?._id,
              new_receipt,
              nest_card,
              nsid
            );
            console.log("Exit Split");
          } else {
            console.log("Enter");
            await set_fee_head_query_redesign(
              student,
              new_receipt?.fee_payment_amount,
              apply?._id,
              new_receipt
            );
            // await set_fee_head_query(student, price, apply, new_receipt);
            console.log("Exit");
          }
        }
        apply.confirmedApplication.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: nest_card.remaining_fee ?? 0,
        });
        admission.confirmedApplication_query.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: nest_card.remaining_fee ?? 0,
          application: apply?._id,
        });
      }
      new_remainFee.fee_receipts.push(new_receipt?._id);
      if (mode === "Offline") {
        admission.offlineFee += price;
        apply.collectedFeeCount += price;
        apply.offlineFee += price;
        admission.collected_fee += price;
        finance.financeAdmissionBalance += price;
        finance.financeTotalBalance += price;
        finance.financeSubmitBalance += price;
      } else if (mode === "Online") {
        admission.onlineFee += price;
        apply.collectedFeeCount += price;
        apply.onlineFee += price;
        finance.financeAdmissionBalance += price;
        finance.financeTotalBalance += price;
        finance.financeBankBalance += price;
      } else {
      }
      if (new_remainFee?.remaining_fee > 0) {
      } else {
        new_remainFee.status = "Paid";
      }
      await lookup_applicable_grant(
        req.body?.fee_payment_mode,
        price,
        new_remainFee,
        new_receipt
      );
      apply.confirmCount += 1;
      for (let app of apply.FeeCollectionApplication) {
        if (`${app.student}` === `${student._id}`) {
          if (app?.status_id) {
            const valid_status = await Status.findById({
              _id: `${app?.status_id}`,
            });
            valid_status.isPaid = "Paid";
            await valid_status.save();
          }
          apply.FeeCollectionApplication.pull(app?._id);
        } else {
        }
      }
      for (let app of admission?.FeeCollectionApplication) {
        if (`${app.student}` === `${student._id}`) {
          if (app?.status_id) {
            const valid_status = await Status.findById({
              _id: `${app?.status_id}`,
            });
            valid_status.isPaid = "Paid";
            await valid_status.save();
          }
          admission.FeeCollectionApplication.pull(app?._id);
        } else {
        }
      }
      for (var val of all_status) {
        val.payment_status = "Paid";
        val.fee_receipt = new_receipt?._id;
        await val.save();
      }
      student.admissionPaidFeeCount += price;
      student.paidFeeList.push({
        paidAmount: price,
        appId: apply._id,
      });
      status.content = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
      status.group_by = "Admission_Confirmation";
      status.applicationId = apply._id;
      user.applicationStatus.push(status._id);
      status.instituteId = institute._id;
      status.fee_receipt = new_receipt?._id;
      notify.notifyContent = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
      notify.notifySender = admission?.hostel_manager?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      notify.fee_receipt = new_receipt?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      if (
        `${new_receipt?.fee_payment_mode}` === "Demand Draft" ||
        `${new_receipt?.fee_payment_mode}` === "Cheque"
      ) {
        status.receipt_status = "Requested";
        status.receipt = new_receipt?._id;
        if (admission?.request_array?.includes(`${new_receipt?._id}`)) {
        } else {
          admission.request_array.push(new_receipt?._id);
          admission.fee_receipt_request.push({
            receipt: new_receipt?._id,
            demand_cheque_status: "Requested",
          });
          admission.fee_receipt_request_count += 1;
        }
      }
      await Promise.all([
        admission.save(),
        apply.save(),
        student.save(),
        finance.save(),
        user.save(),
        order.save(),
        institute.save(),
        // s_admin.save(),
        new_remainFee.save(),
        new_receipt.save(),
        status.save(),
        notify.save(),
      ]);
      res.status(200).send({
        message: "Look like a party mood",
        confirm_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        status.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      for (let ele of nest_card?.remaining_array) {
        if (ele?.remainAmount <= 0) {
          nest_card?.remaining_array?.pull(ele?._id);
        }
      }
      await nest_card.save();
      // // console.log(test_data)
      // if (new_receipt?.receipt_file) {
      //   res.status(200).send({
      //     message: "Look like a party mood",
      //     confirm_status: true,
      //     reciept_file: new_receipt?.receipt_file
      //   });
      // }
      // else {
      //   res.status(200).send({
      //     message: "Look like a light mood",
      //     confirm_status: false,
      //     reciept_file: test_data ?? null
      //   });
      // }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderCancelHostelRefundApplicationQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, mode, remainAmount, struct, staffId } = req.body;
    if (!sid && !aid && !amount && !remainAmount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        refund_status: false,
      });
    var price = parseInt(amount);
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const apply = await NewApplication.findById({ _id: aid }).populate({
      path: "applicationDepartment",
      select: "dName",
    });
    const admission = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const aStatus = new Status({});
    const notify = new StudentNotification({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.refund_status = "Refunded";
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    if (
      price &&
      mode === "Offline" &&
      price > finance.financeTotalBalance &&
      price > admission.offlineFee &&
      price > finance.financeSubmitBalance
    ) {
      res.status(200).send({
        message:
          "insufficient Cash Balance in Finance Department to make refund",
      });
    } else if (
      price &&
      mode === "Online" &&
      price > finance.financeTotalBalance &&
      price > admission.onlineFee &&
      price > finance.financeBankBalance
    ) {
      res.status(200).send({
        message:
          "insufficient Bank Balance in Finance Department to make refund",
      });
    } else {
      const order = new OrderPayment({});
      apply.cancelCount += 1;
      if (apply.remainingFee >= parseInt(remainAmount)) {
        apply.remainingFee -= parseInt(remainAmount);
      }
      if (mode === "Offline") {
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeSubmitBalance >= price) {
          finance.financeSubmitBalance -= price;
        }
        if (admission.offlineFee >= price) {
          admission.offlineFee -= price;
        }
        if (admission.collected_fee >= price) {
          admission.collected_fee -= price;
        }
        if (apply.offlineFee >= price) {
          apply.offlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
      } else if (mode === "Online") {
        if (admission.onlineFee >= price) {
          admission.onlineFee -= price;
        }
        if (apply.onlineFee >= price) {
          apply.onlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeBankBalance >= price) {
          finance.financeBankBalance -= price;
        }
      }
      if (admission.remainingFeeCount >= parseInt(remainAmount)) {
        admission.remainingFeeCount -= parseInt(remainAmount);
      }
      aStatus.content = `your admission has been cancelled successfully with refund of Rs. ${price}`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      notify.notifyContent = `your admission has been cancelled successfully with refund of Rs. ${price}`;
      notify.notifySender = admission?.hostel_manager?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission?._id;
      notify.notifyCategory = "Hostel Status Alert";
      notify.redirectIndex = 29;
      student.admissionRemainFeeCount = 0;
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Admission",
        refund_amount: price,
        refund_from: apply?._id,
      });
      const all_remain_fee_list = await RemainingList.findOne({
        $and: [{ fee_structure: struct }, { student: student?._id }],
      });
      new_receipt.fee_structure = all_remain_fee_list?.fee_structure;
      const nest_app_card = await NestedCard.findById({
        _id: `${all_remain_fee_list?.applicable_card}`,
      });
      const filter_student_install = nest_app_card?.remaining_array?.filter(
        (stu) => {
          if (`${stu.appId}` === `${apply._id}` && stu.status === "Not Paid")
            return stu;
        }
      );
      for (var can = 0; can < filter_student_install?.length; can++) {
        nest_app_card?.remaining_array.pull(filter_student_install[can]);
      }
      all_remain_fee_list.fee_receipts.push(new_receipt?._id);
      all_remain_fee_list.refund_fee += price;
      if (all_remain_fee_list.paid_fee >= price) {
        all_remain_fee_list.paid_fee -= price;
      }
      if (nest_app_card.paid_fee >= price) {
        nest_app_card.paid_fee -= price;
      }
      all_remain_fee_list.remaining_fee = 0;
      nest_app_card.remaining_fee = 0;
      for (var ele of student?.active_fee_heads) {
        if (`${ele?.appId}` === `${apply?._id}`) {
          ele.paid_fee = 0;
          ele.remain_fee = 0;
        }
      }
      nest_app_card.remaining_array.push({
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
      all_remain_fee_list.status = "Cancel";
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
      await fee_receipt_count_query(
        institute,
        new_receipt,
        order,
        finance?.show_invoice_pattern,
        apply?.applicationHostel
      );
      order.fee_receipt = new_receipt?._id;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "cancel_by",
      });
      await Promise.all([
        apply.save(),
        student.save(),
        finance.save(),
        admission.save(),
        aStatus.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
        all_remain_fee_list.save(),
        new_receipt.save(),
        notify.save(),
        nest_app_card.save(),
      ]);
      res.status(200).send({
        message: "Refund & Cancellation of Admission",
        refund_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      if (apply.reviewApplication?.length > 0) {
        if (apply?.reviewApplication?.includes(`${student?._id}`)) {
          apply.reviewApplication?.pull(student?._id);
        }
        // for (var val of apply.reviewApplication) {
        //   if (`${val?.student}` === `${student?._id}`) {
        //     apply.reviewApplication.pull(val?._id);
        //   }
        // }
        apply.cancelApplication.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          from: "Cancel_Tab",
        });
        admission.cancel_admission.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          from: "Cancel_Tab",
        });
        admission.cancel_admission_count += price;
        await Promise.all([apply.save(), admission.save()]);
      }
      if (admission?.remainingFee?.length > 0) {
        if (admission.remainingFee?.includes(`${student._id}`)) {
          admission.remainingFee.pull(student._id);
        }
        await admission.save();
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
    const { huid, hrid, id } = req.body;
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
    var array = req?.body?.dataList;
    if (array?.length > 0) {
      for (var sid of array) {
        if (apply?.allot_array?.includes(`${sid}`)) {
        } else {
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
          for (let app of apply.reviewApplication) {
            if (`${app}` === `${student._id}`) {
              apply.reviewApplication.pull(app);
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
          student.institute = institute?.id;
          apply.allottedApplication.push({
            student: student._id,
            payment_status: "offline",
            alloted_room: room?.room_name,
            alloted_status: "Alloted",
            fee_remain: student.hostelRemainFeeCount,
            paid_status:
              student.hostelRemainFeeCount == 0 ? "Paid" : "Not Paid",
          });
          // remain_list.batchId = batch?._id;
          apply.allotCount += 1;
          apply.allot_array.push(student?._id);
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
    const { aid, sid, appId } = req.params;
    const {
      amount,
      mode,
      type,
      card_id,
      rid,
      raid,
      pay_remain,
      nsid,
      staffId,
    } = req.body;
    const { receipt_status } = req.query;
    if (!sid && !aid && !appId && !amount && !mode && !type)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var admin_ins = await Hostel.findById({ _id: aid }).populate({
      path: "hostel_manager",
      select: "user",
    });
    var student = await Student.findById({ _id: sid }).populate({
      path: "hostel_fee_structure",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
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
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.receipt_status = receipt_status
      ? receipt_status
      : "Already Generated";
    const notify = new StudentNotification({});
    var all_status = await Status.find({
      $and: [
        { applicationId: apply?._id },
        { student: student?._id },
        { payment_status: "Not Paid" },
      ],
    });
    var remaining_fee_lists = await RemainingList.findById({ _id: rid })
      .populate({
        path: "applicable_card",
      })
      .populate({
        path: "government_card",
      });
    new_receipt.fee_structure = remaining_fee_lists?.fee_structure;
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    var order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
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
    await fee_receipt_count_query(
      institute,
      new_receipt,
      order,
      finance?.show_invoice_pattern,
      apply?.applicationHostel
    );
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    if (`${remaining_fee_lists?.applicable_card?._id}` === `${card_id}`) {
      var nest_card = await NestedCard.findById({ _id: `${card_id}` });
      remaining_fee_lists.active_payment_type = `${type}`;
      nest_card.active_payment_type = `${type}`;
      remaining_fee_lists.paid_fee += price;
      nest_card.paid_fee += price;

      if (remaining_fee_lists?.remaining_fee >= price) {
        remaining_fee_lists.remaining_fee -= price;
      } else {
        remaining_fee_lists.remaining_fee = 0;
      }
      if (nest_card?.remaining_fee >= price) {
        nest_card.remaining_fee -= price;
      } else {
        nest_card.remaining_fee = 0;
      }
      if (student.admissionRemainFeeCount >= price) {
        student.admissionRemainFeeCount -= price;
      }
      if (apply.remainingFee >= price) {
        apply.remainingFee -= price;
      }
      if (admin_ins.remainingFeeCount >= price) {
        admin_ins.remainingFeeCount -= price;
      }
      var valid_one_time_fees =
        student?.hostel_fee_structure?.applicable_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        admin_ins.remainingFee.pull(student._id);
      } else {
        // nest_card.remaining_array.push({
        //   remainAmount: student?.fee_structure?.applicable_fees - price,
        //   appId: apply._id,
        //   status: "Not Paid",
        //   instituteId: institute._id,
        //   installmentValue: "One Time Fees Remain",
        //   isEnable: true,
        // });
      }
      var extra_price = 0;
      await nest_card.save();
      if (type === "First Installment") {
        if (
          remaining_fee_lists?.is_splited &&
          remaining_fee_lists?.is_splited === "Yes"
        ) {
          console.log("Enter Split");
          await set_fee_head_query_redesign_split(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt,
            nest_card,
            nsid
          );
          console.log("Exit Split");
        } else {
          await set_fee_head_query_redesign(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt
          );
        }
      } else {
        if (
          remaining_fee_lists?.is_splited &&
          remaining_fee_lists?.is_splited === "Yes"
        ) {
          console.log("Update Split");
          await update_fee_head_query_redesign_split(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt,
            nest_card,
            nsid
          );
          console.log("Update Split");
        } else {
          await update_fee_head_query_redesign(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt
          );
        }
        // await update_fee_head_query(student, price, apply, new_receipt);
      }
      if (req?.body?.fee_payment_mode === "Exempted/Unrecovered") {
        await exempt_installment(
          req?.body?.fee_payment_mode,
          remaining_fee_lists,
          student,
          admin_ins,
          apply,
          finance,
          price,
          new_receipt,
          nest_card
        );
      } else {
        console.log("Enter");
        if (pay_remain) {
          await all_installment_paid(
            remaining_fee_lists,
            student?.hostel_fee_structure,
            mode,
            price,
            admin_ins,
            student,
            new_receipt,
            apply,
            institute,
            nest_card,
            type
          );
        } else {
          await render_installment(
            type,
            student,
            mode,
            price,
            admin_ins,
            student?.hostel_fee_structure,
            remaining_fee_lists,
            new_receipt,
            apply,
            institute,
            nest_card
          );
        }
        console.log("Exit");
        if (
          `${new_receipt?.fee_payment_mode}` === "Demand Draft" ||
          `${new_receipt?.fee_payment_mode}` === "Cheque"
        ) {
          if (admin_ins?.request_array?.includes(`${new_receipt?._id}`)) {
          } else {
            admin_ins.request_array.push(new_receipt?._id);
            admin_ins.fee_receipt_request.push({
              receipt: new_receipt?._id,
              demand_cheque_status: "Requested",
              nested_card: nest_card?._id,
              nest_remain: raid,
            });
            admin_ins.fee_receipt_request_count += 1;
          }
        }
      }
      if (type === "First Installment") {
        console.log("Enter");
        for (var val of apply?.FeeCollectionApplication) {
          if (`${val?.student}` === `${student?._id}`) {
            apply.confirmedApplication.push({
              student: student._id,
              payment_status: mode,
              install_type: "First Installment Paid",
              fee_remain: nest_card.remaining_fee ?? 0,
            });
            apply.confirmCount += 1;
            apply.FeeCollectionApplication.pull(val?._id);
            if (apply?.fee_collect_count > 0) {
              apply.fee_collect_count -= 1;
            }
          }
        }
        for (var val of admin_ins?.FeeCollectionApplication) {
          if (`${val?.student}` === `${student?._id}`) {
            admin_ins.confirmedApplication_query.push({
              student: student._id,
              payment_status: mode,
              install_type: "First Installment Paid",
              fee_remain: nest_card.remaining_fee ?? 0,
              application: apply?._id,
            });
            admin_ins.FeeCollectionApplication.pull(val?._id);
          }
        }
      }
    }
    if (staffId) {
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "fee_collect_by",
      });
    }
    student.admissionPaidFeeCount += price;
    if (mode === "Online") {
      admin_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
    } else if (mode === "Offline") {
      admin_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      admin_ins.collected_fee += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
    } else {
    }
    // await set_fee_head_query(student, price, apply);
    await lookup_applicable_grant(
      req?.body?.fee_payment_mode,
      price,
      remaining_fee_lists,
      new_receipt
    );
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    for (var val of all_status) {
      val.payment_status = "Paid";
      val.fee_receipt = new_receipt?._id;
      await val.save();
    }
    await Promise.all([
      admin_ins.save(),
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
      const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          admin_ins.refundCount += is_refund;
        }
      } else {
        admin_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        admin_ins.refundCount += is_refund;
      }
    }
    await admin_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = admin_ins?.hostel_manager?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = admin_ins._id;
    notify.notifyCategory = "Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
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
    for (let ele of nest_card?.remaining_array) {
      if (ele?.remainAmount <= 0) {
        nest_card?.remaining_array?.pull(ele?._id);
      }
    }
    await nest_card.save();
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
    const { reason, staffId } = req?.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    })
      .populate({
        path: "hostel_manager",
        select: "user",
      })
      .populate({
        path: "institute",
        select: "insName",
      });
    const student = await Student.findById({ _id: sid });
    var user = await User.findById({ _id: `${student?.user}` });
    const status = new Status({});
    const notify = new StudentNotification({});
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
        user.applyApplication.pull(apply?._id);
        apply.receieved_array.pull(student._id);
      } else {
      }
    }
    if (apply.receievedCount > 0) {
      apply.receievedCount -= 1;
    }
    status.content = `You have been rejected for ${apply.applicationName}. Best of luck for next time `;
    status.applicationId = apply._id;
    status.studentId = student._id;
    status.student = student._id;
    user.applicationStatus.push(status._id);
    if (user?.applyApplication?.includes(`${apply?._id}`)) {
      user.applyApplication.pull(apply?._id);
    }
    status.instituteId = admission_admin?.institute;
    notify.notifyContent = `You have been rejected for ${apply.applicationName}. Best of luck for next time `;
    notify.notifySender = admission_admin?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission_admin?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "reject_by",
    });
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
      "Application Status",
      user._id,
      user.deviceToken
    );
    let name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    if (student?.studentEmail) {
      email_sms_designation_application(
        student?.studentEmail,
        name,
        apply?.applicationName,
        reason,
        admission_admin?.institute?.insName
      );
    }
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
        const uqid = universal_random_password();
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
        var qvipleId = new QvipleId({});
        qvipleId.user = user?._id;
        qvipleId.qviple_id = `${uqid}`;
        admins.users.push(user);
        admins.userCount += 1;
        user.username_chat = await new_chat_username_unique(
          user?.userLegalName
        );
        await Promise.all([admins.save(), user.save(), qvipleId.save()]);
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
    const codess = universal_random_password();
    student.member_module_unique = `${codess}`;
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
        const uqid = universal_random_password();
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
        var qvipleId = new QvipleId({});
        qvipleId.user = user?._id;
        qvipleId.qviple_id = `${uqid}`;
        admins.users.push(user);
        admins.userCount += 1;
        user.username_chat = await new_chat_username_unique(
          user?.userLegalName
        );
        await Promise.all([admins.save(), user.save(), qvipleId.save()]);
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
      const codess = universal_random_password();
      student.member_module_unique = `${codess}`;
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

exports.retrieveHostelCancelApplicationModify = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { reason, staffId } = req?.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    })
      .populate({
        path: "hostel_manager",
        select: "user",
      })
      .populate({
        path: "institute",
        select: "insName",
      });
    const student = await Student.findById({ _id: sid });
    var user = await User.findById({ _id: `${student?.user}` });
    const status = new Status({});
    const notify = new StudentNotification({});
    const all_status = await Status.find({
      $and: [
        { _id: { $in: user?.applicationStatus } },
        { applicationId: apply?._id },
        { group_by: "Admission_Application_Applied" },
      ],
    });
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        app.reject_status = reason;
        // apply.receievedApplication.pull(app._id);
        // user.applyApplication.pull(apply?._id);
      } else {
      }
    }
    if (apply.receievedCount > 0) {
      apply.receievedCount -= 1;
    }
    status.content = `You have been rejected for ${apply.applicationName}. ${reason}`;
    status.applicationId = apply._id;
    status.studentId = student._id;
    status.student = student._id;
    user.applicationStatus.push(status._id);
    // if (user?.applyApplication?.includes(`${apply?._id}`)) {
    //   user.applyApplication.pull(apply?._id);
    // }
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "reject_by",
    });
    status.instituteId = admission_admin?.institute;
    notify.notifyContent = `You have been rejected for ${apply.applicationName}. ${reason}`;
    notify.notifySender = admission_admin?.hostel_manager?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission_admin?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    for (let ele of all_status) {
      ele.rejection_modification = "Enable";
      ele.rejection_reason = reason;
      await ele.save();
    }
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
      "Application Status",
      user._id,
      user.deviceToken
    );
    let name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    if (student?.studentEmail) {
      email_sms_designation_application(
        student?.studentEmail,
        name,
        apply?.applicationName,
        reason,
        admission_admin?.institute?.insName
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditStudentFeeStructureQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { fee_struct, staffId } = req.body;
    if (!sid && !aid && !fee_struct)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const student = await Student.findById({ _id: sid });
    const remain_list = await RemainingList.findOne({
      $and: [
        { _id: { $in: student?.remainingFeeList } },
        { appId: apply?._id },
      ],
    });
    const structure = await FeeStructure.findById({ _id: fee_struct });
    const status = await Status.find({
      $and: [
        { applicationId: apply?._id },
        { structure_edited: "Edited" },
        { studentId: `${student?._id}` },
      ],
    });
    // console.log(status)
    var flag = false;
    if (remain_list) {
      for (var ref of remain_list?.remaining_array) {
        if (`${ref?.appId}` === `${apply?._id}` && ref.status === "Paid") {
          flag = true;
          break;
        } else {
          flag = false;
        }
      }
    }
    if (flag) {
      res.status(200).send({
        message: `Student Already Paid the Fees Sorry Structure Change is not possible`,
        access: true,
      });
    } else {
      for (let app of apply.selectedApplication) {
        if (`${app.student}` === `${student._id}`) {
          app.fee_remain = structure.total_admission_fees;
        }
      }
      for (var ref of status) {
        ref.admissionFee = structure.total_admission_fees;
        ref.feeStructure = structure?._id;
        await ref.save();
      }
      student.hostel_fee_structure = structure?._id;
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "assign_by",
      });
      await Promise.all([apply.save(), student.save()]);
      res.status(200).send({
        message: `congrats for new fee structure `,
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveHostelCollectDocs = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { mode, type, amount, nest, revert_status, staffId, collect_docs } =
      req.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        docs_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var admission = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    // console.log(admission?._id)
    // console.log(admission?.admissionAdminHead?.user)
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    var student = await Student.findById({ _id: sid });
    const structure = await FeeStructure.findById({
      _id: `${student?.hostel_fee_structure}`,
    });
    var user = await User.findById({ _id: `${student?.user}` });
    var status = new Status({});
    var notify = new StudentNotification({});
    let obj = {
      status_id: status?._id,
      revert_request_status: revert_status,
    };
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "docs_by",
    });
    var c_num = await render_new_hostel_fees_card(
      student?._id,
      apply?._id,
      structure?._id,
      "By_Hostel_Admin_After_Docs_Collect",
      "",
      "",
      obj
    );
    if (structure?.applicable_fees <= 0) {
      apply.confirmedApplication.push({
        student: student._id,
        payment_status: "Zero Applicable Fees",
        install_type: "No Installment Required For Payment",
        fee_remain: structure?.applicable_fees,
        status_id: status?._id,
        revert_request_status: revert_status,
      });
      apply.confirmCount += 1;
    } else {
      apply.FeeCollectionApplication.push({
        student: student?._id,
        fee_remain: structure?.applicable_fees,
        payment_flow: c_num?.card,
        app_card: c_num?.app_card,
        gov_card: c_num?.gov_card,
        status_id: status?._id,
        revert_request_status: revert_status,
        fee_struct: c_num?.fee_struct,
      });
      apply.fee_collect_count += 1;
    }
    apply.selectedApplication.pull(nest);
    if (apply?.selectCount >= 0) {
      apply.selectCount -= 1;
    }
    // for (let app of apply.selectedApplication) {
    //   if (`${app.student}` === `${student._id}`) {
    //     app.docs_collect = "Collected";
    //     app.status_id = status?._id;
    //     app.edited_struct = false;
    //   } else {
    //   }
    // }
    status.content = `Your documents are submitted and verified successfully.Complete your admission by paying application admission fees from below: Application Admission Fees: Rs.${structure?.applicable_fees}`;
    status.applicationId = apply._id;
    user.applicationStatus.push(status._id);
    status.group_by = "Admission_Fees_Payment";
    status.remaining_list = c_num?.card;
    status.payment_status = "Not Paid";
    status.finance = institute?.financeDepart?.[0];
    status.feeStructure = structure?._id;
    status.for_selection = "Yes";
    status.structure_edited = "Edited";
    status.studentId = student?._id;
    status.student = student?._id;
    status.is_hostel = true;
    status.instituteId = institute._id;
    notify.notifyContent = `Your documents are submitted and verified successfully.Complete your admission by paying application admission fees from below: Application Admission Fees: Rs.${structure?.applicable_fees}`;
    // console.log(
    //   admission?.admissionAdminHead?.user
    // );
    notify.notifySender = `${admission?.hostel_manager?.user}`;
    notify.notifyReceiever = `${user?._id}`;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    if (collect_docs?.length > 0) {
      for (let ele of collect_docs) {
        student.collect_docs.push({
          docs: ele?.docs,
          not_filled: ele?.not_filled,
        });
      }
    }
    await Promise.all([
      apply.save(),
      user.save(),
      status.save(),
      notify.save(),
      student.save(),
    ]);
    res.status(200).send({
      message: "Look like a party mood",
      docs_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
    const studentName = `${student?.studentFirstName} ${
      student?.studentMiddleName ? student?.studentMiddleName : ""
    } ${student?.studentLastName}`;
    await whats_app_sms_payload(
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

exports.retrieveHostelSelectedRevertedApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { statusId, staffId } = req.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const ads_admin = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    });
    const student = await Student.findById({ _id: sid });
    var user = await User.findById({ _id: `${student?.user}` });
    var status = await Status.findById({ _id: statusId });
    for (let app of apply?.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.selectedApplication.pull(app._id);
      } else {
      }
    }
    for (let app of ads_admin?.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        ads_admin.selectedApplication.pull(app._id);
      } else {
      }
    }
    apply.receievedApplication.push({
      student: student._id,
    });
    apply.receieved_array.push(student?._id);
    if (apply.selectCount > 0) {
      apply.selectCount -= 1;
    }
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "reverted_by",
    });
    user.applicationStatus.pull(status?._id);
    await Status.findByIdAndDelete(statusId);
    await Promise.all([
      apply.save(),
      user.save(),
      ads_admin.save(),
      student.save(),
    ]);
    res.status(200).send({
      message: `${student.studentFirstName} Revert Back To Receieved Application`,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveHostelCollectDocsRevertedQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { statusId, fcid, rid, revert_status, staffId } = req.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        docs_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var ads_admin = await Hostel.findById({
      _id: `${apply?.hostelAdmin}`,
    });
    var student = await Student.findById({ _id: sid });
    var user = await User.findById({ _id: `${student?.user}` });
    var status = await Status.findById({ _id: statusId });
    var remain_card = await RemainingList.findById({ _id: rid });
    if (remain_card?.paid_fee >= 0) {
      apply.FeeCollectionApplication.pull(fcid);
      for (let ele of ads_admin?.FeeCollectionApplication) {
        if (`${ele?.student}` === `${student?._id}`) {
          ads_admin?.FeeCollectionApplication?.pull(ele?._id);
        }
      }
      if (apply?.fee_collect_count > 0) {
        apply.fee_collect_count -= 1;
      }
      apply.selectedApplication.push({
        student: student?._id,
        fee_remain: remain_card?.applicable_fee,
        revert_request_status: revert_status,
      });
      ads_admin.selectedApplication.push({
        student: student?._id,
        fee_remain: remain_card?.applicable_fee,
        revert_request_status: revert_status,
        application: apply?._id,
      });
      apply.selectCount += 1;
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "reverted_by",
      });
      student.remainingFeeList.pull(remain_card?._id);
      if (student?.remainingFeeList_count > 0) {
        student.remainingFeeList_count -= 1;
      }
      user.applicationStatus.pull(status?._id);
      await Status.findByIdAndDelete(statusId);
      if (remain_card?.applicable_card) {
        await NestedCard.findByIdAndDelete(remain_card?.applicable_card);
      }
      if (remain_card?.government_card) {
        await NestedCard.findByIdAndDelete(remain_card?.government_card);
      }
      await RemainingList.findByIdAndDelete(remain_card?._id);
      await Promise.all([
        apply.save(),
        user.save(),
        ads_admin.save(),
        student.save(),
      ]);
      res.status(200).send({
        message: "Look like a party mood Reverted Query",
        access: true,
      });
    } else {
      res.status(200).send({
        message:
          "Fees Already Collected By Hostel Admin Revert Opts Not Working",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderReviewStudentQuery = async (req, res) => {
  try {
    const { aid } = req?.params;
    const { student_arr, staffId } = req?.body;
    if (!aid && !student_arr)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var app = await NewApplication.findById({ _id: aid });
    if (student_arr?.length > 0) {
      for (var val of student_arr) {
        const student = await Student.findById({ _id: val?.sid });
        if (app?.reviewApplication?.includes(`${val?.sid}`)) {
        } else {
          app.reviewApplication.push(val?.sid);
          app.review_count += 1;
          app.confirmedApplication.pull(val?.cid);
          if (app?.confirmCount >= 0) {
            app.confirmCount -= 1;
          }
        }
        student.student_application_obj.push({
          app: app?._id,
          staff: staffId,
          flow: "confirm_by",
        });
        await student.save();
      }
      await app.save();
    }
    res
      .status(200)
      .send({ message: "Explore Student Review Status Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.staff_name_only = async (req, res) => {
  try {
    const { sid } = req?.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const student = await Student.findById({ _id: sid })
      .select("student_application_obj student_form_flow")
      .populate({
        path: "student_application_obj.staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      })
      .lean()
      .exec();

    let list = [];
    // let nums = [
    //   { request_by: "Accepted By"},
    //   { select_by: "Selected By"},
    //   { confirm_by: "Confirmed By"},
    //   { fee_collect_by: "Fee Collected By"},
    //   { review_by: "Reviewed By"},
    //   { allot_by: "Allotted By"},
    //   { cancel_by: "Cancelled By"},
    //   { reverted_by: "Reverted By"},
    //   { docs_by: "Docs Verified By"},
    //   { reject_by: "Rejected By"},
    //   { assign_by: "Fee Structure Assign By"},
    // ]
    if (student?.student_application_obj?.length > 0) {
      for (let ele of student?.student_application_obj?.reverse()) {
        if (`${student?.student_form_flow?.did}` === `${ele?.app}`) {
          list.push({
            key:
              ele?.flow === "request_by"
                ? "Accepted By"
                : ele?.flow === "select_by"
                ? "Selected By"
                : ele?.flow === "confirm_by"
                ? "Confirmed By"
                : ele?.flow === "fee_collect_by"
                ? "Fee Collected By"
                : ele?.flow === "review_by"
                ? "Reviewed By"
                : ele?.flow === "allot_by"
                ? "Allotted By"
                : ele?.flow === "cancel_by"
                ? "Cancelled By"
                : ele?.flow === "reverted_by"
                ? "Reverted By"
                : ele?.flow === "docs_by"
                ? "Docs Verified By"
                : ele?.flow === "reject_by"
                ? "Rejected By"
                : ele?.flow === "assign_by"
                ? "Fee Structure Assign By"
                : "",
            value: `${ele?.staff?.staffFirstName} ${
              ele?.staff?.staffMiddleName ?? ""
            } ${ele?.staff?.staffLastName}`,
            latest: ele?.created_at,
          });
        }
      }
      res
        .status(200)
        .send({ message: "Explore Staff Name Only", access: true, only: list });
    } else {
      res
        .status(200)
        .send({ message: "No Staff Name Only", access: true, only: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retieveHostelAdminAllMergedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const apply = await Hostel.findById({ _id: aid }).select("newApplication");
    const ongoing = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Ongoing" },
        { applicationTypeStatus: "Normal Application" },
      ],
    })
      .sort("-createdAt")
      .select(
        "applicationName applicationEndDate applicationTypeStatus receievedApplication selectedApplication confirmedApplication admissionAdmin selectCount confirmCount receievedCount allottedApplication allotCount applicationStatus applicationSeats applicationMaster applicationAbout admissionProcess application_flow applicationBatch gr_initials cancelApplication cancelCount reviewApplication review_count FeeCollectionApplication fee_collect_count student_form_setting pin"
      );

    if (ongoing?.length > 0) {
      const custom_obj = {
        selectCount: 0,
        confirmCount: 0,
        receievedCount: 0,
        allotCount: 0,
        cancelCount: 0,
        review_count: 0,
        fee_collect_count: 0,
        docs_enable: "Yes",
        fee_collect_enable: "Yes",
        confirm_enable: "Yes",
      };
      for (var ref of ongoing) {
        custom_obj.selectCount += ref?.selectedApplication?.length ?? 0;
        custom_obj.confirmCount += ref?.confirmedApplication?.length ?? 0;
        custom_obj.receievedCount += ref?.receievedApplication?.length ?? 0;
        custom_obj.allotCount += ref?.allottedApplication?.length ?? 0;
        custom_obj.cancelCount += ref?.cancelApplication?.length ?? 0;
        custom_obj.review_count += ref?.reviewApplication?.length ?? 0;
        custom_obj.fee_collect_count +=
          ref?.FeeCollectionApplication?.length ?? 0;
      }

      const ads_obj = {
        message: "All Ongoing Application from DB 🙌",
        custom_obj: custom_obj,
      };
      res.status(200).send({
        ads_obj,
      });
    } else {
      const ads_obj = {
        message: "Dark side in depth nothing to find",
        custom_obj: null,
      };
      res.status(200).send({
        ads_obj,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllSelectMergedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await Hostel.findById({ _id: aid })
        // .select("selectCount")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber valid_full_name form_no new_app",
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
      for (let data of apply.selectedApplication) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      for (let data of filter_select) {
        if (data?.application) {
          const apps = await NewApplication.findById({
            _id: `${data?.application}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationUnit = apps?.applicationUnit;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: filter_select?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    } else {
      var apply = await Admission.findById({ _id: aid })
        // .select("selectCount")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber form_no new_app",
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
        apply?.selectedApplication?.reverse()
      );
      for (let data of all_select_query) {
        if (data?.application) {
          const apps = await NewApplication.findById({
            _id: `${data?.application}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationUnit = apps?.applicationUnit;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
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

exports.fetchAllFeeCollectedMergedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await Hostel.findById({ _id: aid })
        .select("FeeCollectionApplication")
        .populate({
          path: "FeeCollectionApplication",
          populate: {
            path: "student payment_flow app_card gov_card fee_struct application",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            // select:
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber valid_full_name",
            // populate: {
            //   path: "fee_structure",
            //   select:
            //     "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
            //   populate: {
            //     path: "category_master",
            //     select: "category_name",
            //   },
            // },
          },
        });
      for (let data of apply.FeeCollectionApplication) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      for (let data of filter_select) {
        if (data?.application?._id) {
          const apps = await NewApplication.findById({
            _id: `${data?.application?._id}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationUnit = apps?.applicationUnit;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection required make sure you come up with Tea and Snack from DB 🙌",
          fees: filter_select?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    } else {
      var apply = await Admission.findById({ _id: aid })
        // .select("fee_collect_count")
        .select("FeeCollectionApplication")
        .populate({
          path: "FeeCollectionApplication",
          populate: {
            path: "student payment_flow app_card gov_card fee_struct application",
            // select:
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber",
            // populate: {
            //   path: "fee_structure",
            //   select:
            //     "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
            //   populate: {
            //     path: "category_master",
            //     select: "category_name",
            //   },
            // },
          },
        });
      var all_select_query = nested_document_limit(
        page,
        limit,
        apply?.FeeCollectionApplication?.reverse()
      );
      for (let data of all_select_query) {
        if (data?.application?._id) {
          const apps = await NewApplication.findById({
            _id: `${data?.application?._id}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationUnit = apps?.applicationUnit;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection Selection required make sure you come up with Tea and Snack from DB 🙌",
          fees: all_select_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllConfirmedMergedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_confirm = [];
      const apply = await Hostel.findById({ _id: aid })
        // .select("confirmCount")
        .populate({
          path: "confirmedApplication_query",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt valid_full_name institute form_no new_app",
            populate: {
              path: "fee_structure hostel_fee_structure fee_receipt",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
              // populate: {
              //   path: "category_master",
              //   select: "category_name",
              // },
            },
          },
        });
      for (let data of apply.confirmedApplication_query) {
        if (data.student !== null) {
          filter_confirm.push(data);
        }
      }
      for (let data of filter_confirm) {
        if (data?.application) {
          const apps = await NewApplication.findById({
            _id: `${data?.application}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationUnit = apps?.applicationUnit;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (filter_confirm?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: filter_confirm?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    } else {
      const apply = await Admission.findById({ _id: aid })
        // .select("confirmCount")
        .populate({
          path: "confirmedApplication_query",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt institute form_no new_app",
            populate: {
              path: "fee_structure hostel_fee_structure fee_receipt",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
              // populate: {
              //   path: "category_master",
              //   select: "category_name",
              // },
            },
          },
        });
      var all_confirm_query = nested_document_limit(
        page,
        limit,
        apply?.confirmedApplication_query?.reverse()
      );
      for (let data of all_confirm_query) {
        if (data?.application) {
          const apps = await NewApplication.findById({
            _id: `${data?.application}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationUnit = apps?.applicationUnit;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (all_confirm_query?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
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

exports.renderApplicationPinnedQuery = async (req, res) => {
  try {
    const { id } = req?.params;
    const { did, type, flow } = req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_ins = await Hostel.findById({ _id: id });
    var app = await NewApplication.findById({ _id: did });
    if (flow === "INDEPENDENT") {
      one_ins.independent_pinned_application.push(did);
      app.pin.status = "Pinned";
      app.pin.flow = "INDEPENDENT";
      app.pin.flow_id = app?._id;
      await Promise.all([one_ins.save(), app.save()]);
    } else if (flow === "DEPENDENT") {
      let is_avail = one_ins?.dependent_pinned_application?.filter((val) => {
        if (`${val?.section_type}` === `${type}`) return val;
      });
      if (is_avail?.length > 0) {
        for (let ele of is_avail) {
          ele.application.push(did);
          app.pin.status = "Pinned";
          app.pin.flow = "DEPENDENT";
          app.pin.flow_id = app?._id;
        }
      } else {
        one_ins.dependent_pinned_application.push({
          section_type: type,
          application: did,
        });
        app.pin.status = "Pinned";
        app.pin.flow = "DEPENDENT";
        app.pin.flow_id = app?._id;
      }
      // if (one_ins?.dependent_pinned_application?.length > 0) {

      // }
      // else {
      //   one_ins.dependent_pinned_application.push({
      //     section_type: type,
      //     application: did
      //   })
      // }
      for (let ele of one_ins.dependent_pinned_application) {
        if (`${ele?.application}` === `${app?._id}`) {
          app.pin.flow_id = ele?._id;
        }
      }
      await Promise.all([one_ins.save(), app.save()]);
    }
    res
      .status(200)
      .send({ message: "Explore One Application Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderApplicationUnPinnedQuery = async (req, res) => {
  try {
    const { id } = req?.params;
    const { did, flow } = req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_ins = await Hostel.findById({ _id: id });
    if (flow === "INDEPENDENT") {
      var app = await NewApplication.findById({ _id: did });
      one_ins.independent_pinned_application.pull(did);
      app.pin.status = "";
      app.pin.flow = "";
      app.pin.flow_id = null;
      await Promise.all([one_ins.save(), app.save()]);
    } else if (flow === "DEPENDENT") {
      for (var ele of one_ins?.dependent_pinned_application) {
        if (ele?.application?.includes(`${did}`)) {
          var app = await NewApplication.findById({ _id: did });
          ele.application.pull(did);
          app.pin.status = "";
          app.pin.flow = "";
          app.pin.flow_id = null;
          await app.save();
        } else if (`${ele?._id}` === `${did}`) {
          for (let val of ele?.application) {
            var app = await NewApplication.findById({ _id: `${val}` });
            app.pin.status = "";
            app.pin.flow = "";
            app.pin.flow_id = null;
            await app.save();
          }
          one_ins.dependent_pinned_application.pull(did);
        }
      }
      await one_ins.save();
    }
    res
      .status(200)
      .send({ message: "Explore One Un Pin Application Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retieveHostelAdminAllApplicationPinned = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const ins = await InstituteAdmin.findById({ _id: id }).select(
      "admissionDepart hostelDepart"
    );
    const apply = await Hostel.findById({
      _id: `${ins?.hostelDepart?.[0]}`,
    }).populate({
      path: "dependent_pinned_application",
      populate: {
        path: "application",
        populate: {
          path: "applicationUnit",
          select: "hostel_unit_name",
        },
      },
    });
    var nums = await NewApplication.find({
      $and: [{ _id: { $in: apply?.independent_pinned_application } }],
    })
      .select(
        "applicationName applicationEndDate applicationTypeStatus receievedApplication pin selectedApplication confirmedApplication admissionAdmin selectCount confirmCount receievedCount allottedApplication allotCount applicationStatus applicationSeats applicationMaster applicationAbout admissionProcess application_flow applicationBatch gr_initials cancelApplication cancelCount reviewApplication review_count FeeCollectionApplication fee_collect_count student_form_setting"
      )
      .populate({
        path: "applicationUnit",
        select: "hostel_unit_name",
      });
    var list = [];
    // const unique = [...new Set(apply?.dependent_pinned_application.map(item => item.section_type))]
    for (let val of apply?.dependent_pinned_application) {
      list.push({
        type: val?.section_type,
        apps: val?.application,
      });
    }

    const ongoing = [...list, ...nums];
    const ads_obj = {
      message: "All Ongoing Application from DB 🙌",
      // depend: apply?.dependent_pinned_application,
      // independ: nums,
      ongoing: ongoing,
    };
    const adsEncrypt = await encryptionPayload(ads_obj);
    res.status(200).send({
      encrypt: adsEncrypt,
      ads_obj,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.completeHostelApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        complete_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    });
    const admission_ins = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    apply.applicationStatus = "Completed";
    if (admission_ins?.hostelCount > 0) {
      admission_ins.hostelCount -= 1;
    }
    if (admission?.newAppCount > 0) {
      admission.newAppCount -= 1;
    }
    admission.completedCount += 1;
    await Promise.all([apply.save(), admission.save(), admission_ins.save()]);
    res.status(200).send({
      message: "Enjoy your work load is empty go for party",
      complete_status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.inCompleteHostelApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        complete_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    });
    const admission_ins = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    apply.applicationStatus = "Ongoing";
    admission_ins.hostelCount += 1;
    admission.newAppCount += 1;
    if (admission?.completedCount > 0) {
      admission.completedCount -= 1;
    }
    await Promise.all([apply.save(), admission.save(), admission_ins.save()]);
    res.status(200).send({
      message: "Enjoy your work load.",
      complete_status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.all_student_bed_query = async (req, res) => {
  try {
    // const all = await HostelUnit.findById({ _id: "64c29db52031578e33d6dac7" })
    // const all_room = await HostelRoom.find({ _id: { $in: all?.rooms } })

    // for (let ele of all_room) {
    //   ele.room_name = `L-${ele.room_name}`
    //   await ele.save()
    // }
    // const all_student = await Student.find({ institute: "6449c83598fec071fbffd3ad" })

    // let all_student_bed = all_student?.filter((val) => {
    //   if(val?.student_bed_number) return val
    // })
    // var i = 0
    // for (let ele of all_student_bed) {
    //   const bed = await HostelBed.findById({ _id: ele?.student_bed_number })
    //   const room = await HostelRoom.findById({ _id: `${bed?.hostelRoom}` })
    //   room.vacant_count += 1
    //   ele.student_bed_number = null
    //   await Promise.all([ele.save(), room.save()])
    //   await HostelBed.findByIdAndDelete(bed?._id)
    //   console.log(i)
    //   i+= 1
    // }
    res.status(200).send({
      message: "Explore All Bed Delete",
      access: true,
      all_student_bed: all_student_bed?.length,
      all_student: all_student?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.cancelAllottedHostelApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, mode, remainAmount, struct, classId, staffId } = req.body;
    if (!sid && !aid && !amount && !remainAmount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        refund_status: false,
      });
    var price = parseInt(amount);
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const apply = await NewApplication.findById({ _id: aid }).populate({
      path: "applicationDepartment",
      select: "dName",
    });
    const admission = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    }).populate({
      path: "hostel_manager",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const aStatus = new Status({});
    const notify = new StudentNotification({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.refund_status = "Refunded";
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.receipt_generated_from = "BY_HOSTEL_MANAGER";
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    if (
      price &&
      mode === "Offline" &&
      price > finance.financeTotalBalance &&
      price > admission.offlineFee &&
      price > finance.financeSubmitBalance
    ) {
      res.status(200).send({
        message:
          "insufficient Cash Balance in Finance Department to make refund",
      });
    } else if (
      price &&
      mode === "Online" &&
      price > finance.financeTotalBalance &&
      price > admission.onlineFee &&
      price > finance.financeBankBalance
    ) {
      res.status(200).send({
        message:
          "insufficient Bank Balance in Finance Department to make refund",
      });
    } else {
      const order = new OrderPayment({});
      apply.cancelCount += 1;
      if (apply.remainingFee >= parseInt(remainAmount)) {
        apply.remainingFee -= parseInt(remainAmount);
      }
      if (mode === "Offline") {
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeSubmitBalance >= price) {
          finance.financeSubmitBalance -= price;
        }
        if (admission.offlineFee >= price) {
          admission.offlineFee -= price;
        }
        if (admission.collected_fee >= price) {
          admission.collected_fee -= price;
        }
        if (apply.offlineFee >= price) {
          apply.offlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
      } else if (mode === "Online") {
        if (admission.onlineFee >= price) {
          admission.onlineFee -= price;
        }
        if (apply.onlineFee >= price) {
          apply.onlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeBankBalance >= price) {
          finance.financeBankBalance -= price;
        }
      }
      if (admission.remainingFeeCount >= parseInt(remainAmount)) {
        admission.remainingFeeCount -= parseInt(remainAmount);
      }
      aStatus.content = `your admission has been cancelled successfully with refund of Rs. ${price}`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      notify.notifyContent = `your admission has been cancelled successfully with refund of Rs. ${price}`;
      notify.notifySender = admission?.hostel_manager?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      student.admissionRemainFeeCount = 0;
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Admission",
        refund_amount: price,
        refund_from: apply?._id,
      });
      const all_remain_fee_list = await RemainingList.findOne({
        $and: [{ fee_structure: struct }, { student: student?._id }],
      });
      new_receipt.fee_structure = all_remain_fee_list?.fee_structure;
      const nest_app_card = await NestedCard.findById({
        _id: `${all_remain_fee_list?.applicable_card}`,
      });
      const filter_student_install = nest_app_card?.remaining_array?.filter(
        (stu) => {
          if (`${stu.appId}` === `${apply._id}` && stu.status === "Not Paid")
            return stu;
        }
      );
      for (var can = 0; can < filter_student_install?.length; can++) {
        nest_app_card?.remaining_array.pull(filter_student_install[can]);
      }
      all_remain_fee_list.fee_receipts.push(new_receipt?._id);
      all_remain_fee_list.refund_fee += price;
      if (all_remain_fee_list.paid_fee >= price) {
        all_remain_fee_list.paid_fee -= price;
      }
      if (nest_app_card.paid_fee >= price) {
        nest_app_card.paid_fee -= price;
      }
      all_remain_fee_list.remaining_fee = 0;
      nest_app_card.remaining_fee = 0;
      for (var ele of student?.active_fee_heads) {
        if (`${ele?.appId}` === `${apply?._id}`) {
          ele.paid_fee = 0;
          ele.remain_fee = 0;
        }
      }
      nest_app_card.remaining_array.push({
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
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "cancel_by",
      });
      all_remain_fee_list.status = "Cancel";
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
      await fee_receipt_count_query(
        institute,
        new_receipt,
        order,
        finance?.show_invoice_pattern,
        apply?.applicationHostel
      );
      order.fee_receipt = new_receipt?._id;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      // await renderAllStudentToUnApprovedAutoCatalogQuery(
      //   student?.studentClass,
      //   [sid]
      // );
      await Promise.all([
        apply.save(),
        student.save(),
        finance.save(),
        admission.save(),
        aStatus.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
        all_remain_fee_list.save(),
        new_receipt.save(),
        notify.save(),
        nest_app_card.save(),
      ]);
      res.status(200).send({
        message: "Refund & Cancellation of Admission",
        refund_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      if (apply.allottedApplication?.length > 0) {
        for (var val of apply.allottedApplication) {
          if (`${val?.student}` === `${student?._id}`) {
            apply.allottedApplication.pull(val?._id);
          }
        }
        apply.cancelApplication.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          from: "Allotted_Tab",
        });
        admission.cancel_admission.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          from: "Allotted_Tab",
        });
        admission.cancel_admission_count += price;
        await Promise.all([apply.save(), admission.save()]);
      }
      if (admission?.remainingFee?.length > 0) {
        if (admission.remainingFee?.includes(`${student._id}`)) {
          admission.remainingFee.pull(student._id);
        }
        await admission.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

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

exports.hosteInFinanceAllStructureQuery = async (req, res) => {
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
    var all_structures = [];
    if (master_query) {
      if (master_by) {
        all_structures = await FeeStructure.find({
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
          })
          .populate({
            path: "unit_master",
            select: "hostel_unit_name",
          })
          .populate({
            path: "batch_master",
            select: "batchName",
          });
      } else {
        all_structures = await FeeStructure.find({
          $and: [
            { _id: { $in: one_hostel?.fees_structures } },
            { batch_master: master_query },
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
          })
          .populate({
            path: "unit_master",
            select: "hostel_unit_name",
          })
          .populate({
            path: "batch_master",
            select: "batchName",
          });
      }
    } else {
      all_structures = await FeeStructure.find({
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
        })
        .populate({
          path: "unit_master",
          select: "hostel_unit_name",
        })
        .populate({
          path: "batch_master",
          select: "batchName",
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
