const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const { email_sms_designation_application } = require("../../WhatsAppSMS/payload");
const Admission = require("../../models/Admission/Admission");
const NewApplication = require("../../models/Admission/NewApplication");
const Status = require("../../models/Admission/status");
const Department = require("../../models/Department");
const Finance = require("../../models/Finance");
const FeeStructure = require("../../models/Finance/FeesStructure");
const InstituteAdmin = require("../../models/InstituteAdmin");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Student = require("../../models/Student");
const User = require("../../models/User");

exports.renderStudentFormQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_depart = await Department.findById(did).select(
      "studentFormSetting ug_undertakings_admission pg_undertakings_admission"
    );
    res.status(200).send({
      message: "Explore Department Student form setting details Query",
      studentFormSetting: valid_depart?.studentFormSetting,
      ug_undertakings_admission: valid_depart?.ug_undertakings_admission,
      pg_undertakings_admission: valid_depart?.pg_undertakings_admission,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFormUpdateQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    await Department.findByIdAndUpdate(did, req.body);
    res.status(200).send({
      message: "Explore Department Student form updated successfully 👏",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAddApplicationQuery = async (req, res) => {
  try {
    const { did } = req?.params
    const { apps, flow } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const depart = await Department.findById({ _id: did })
    if (flow === "ADD") {
      for (let ele of apps) {
        depart.filter_application.push(ele)
      }
    }
    else if (flow === "REMOVE") {
      for (let ele of apps) {
        depart.filter_application.pull(ele)
      }
    }
    await depart.save()
    res.status(200).send({ message: `${flow} Application In Department`, access: true})
  }
  catch (e) {
    console.log()
  }
}

exports.retieveDepartmentAllApplication = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const depart = await Department.findById({ _id: did }).select(
      "filter_application"
    );
    const ongoing = await NewApplication.find({
      $and: [
        { _id: { $in: depart.filter_application } },
        { applicationStatus: "Ongoing" },
        { applicationTypeStatus: "Normal Application" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationEndDate applicationTypeStatus receievedApplication selectedApplication confirmedApplication admissionAdmin selectCount confirmCount receievedCount allottedApplication allotCount applicationStatus applicationSeats applicationMaster applicationAbout admissionProcess application_flow applicationBatch gr_initials cancelApplication cancelCount reviewApplication review_count FeeCollectionApplication fee_collect_count student_form_setting pin"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName photoId photo",
      })
      .populate({
        path: "admissionAdmin",
        select: "institute",
        populate: {
          path: "institute",
          select: "insName",
        },
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
        message: "All Ongoing Application from DB 🙌",
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

exports.render_application_tab_query = async (req, res) => {
  try {
    const { did, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    var numss = [];
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("receievedApplication")
        .populate({
          path: "receievedApplication",
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
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
          },
        });
      for (let ele of apply?.receievedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.receievedApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    res.status(200).send({
      message: "Explore All Receieved Application Students Master Query",
      access: true,
      student: all?.length > 0 ? all : [],
      student_count: all?.length ?? 0,
    });
    }
    else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("receievedApplication")
      for (let ele of apply?.receievedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.receievedApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Receieved Application Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: all?.length,
    });
    }
    // await Student.find({ _id: { $in: unique } })
    //   .select(
    //     "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no"
    //   )
    //   .populate({
    //     path: "user",
    //     select: "userLegalName username userPhone Number userEmail",
    //   });
  } catch (e) {
    console.log(e);
  }
};

exports.render_selected_tab_query = async (req, res) => {
  try {
    const { did, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    var numss = [];
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("selectedApplication")
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
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
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
      for (let ele of apply?.selectedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.selectedApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    res.status(200).send({
      message: "Explore All Receieved Application Students Master Query",
      access: true,
      student: all?.length > 0 ? all : [],
      student_count: all?.length ?? 0,
    });
    }
    else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("selectedApplication")
      for (let ele of apply?.selectedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.selectedApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Selected Application Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: all?.length,
    });
    }
    // await Student.find({ _id: { $in: unique } })
    //   .select(
    //     "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no"
    //   )
    //   .populate({
    //     path: "user",
    //     select: "userLegalName username userPhone Number userEmail",
    //   });
  } catch (e) {
    console.log(e);
  }
};

exports.render_fees_tab_query = async (req, res) => {
  try {
    const { did, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    var numss = [];
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("FeeCollectionApplication")
        .populate({
          path: "FeeCollectionApplication",
          populate: {
            path: "student payment_flow app_card gov_card fee_struct",
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
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
            //   populate: {
            //     path: "fee_structure hostel_fee_structure",
            //     select:
            //       "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
            //     populate: {
            //       path: "category_master",
            //       select: "category_name",
            //     },
            //   },
          },
        });
      for (let ele of apply?.FeeCollectionApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.FeeCollectionApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    res.status(200).send({
      message: "Explore All Receieved Application Students Master Query",
      access: true,
      student: all?.length > 0 ? all : [],
      student_count: all?.length ?? 0,
    });
    }
    else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("FeeCollectionApplication")
      for (let ele of apply?.FeeCollectionApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.FeeCollectionApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Fees Application Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: all?.length,
    });
    }
    // await Student.find({ _id: { $in: unique } })
    //   .select(
    //     "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no"
    //   )
    //   .populate({
    //     path: "user",
    //     select: "userLegalName username userPhone Number userEmail",
    //   });
  } catch (e) {
    console.log(e);
  }
};

exports.render_confirm_tab_query = async (req, res) => {
  try {
    const { did, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    var numss = [];
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("confirmedApplication")
        .populate({
          path: "confirmedApplication",
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
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
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
      for (let ele of apply?.confirmedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.confirmedApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    res.status(200).send({
      message: "Explore All Receieved Application Students Master Query",
      access: true,
      student: all?.length > 0 ? all : [],
      student_count: all?.length ?? 0,
    });
    }
    else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("confirmedApplication")
      for (let ele of apply?.confirmedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.confirmedApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Confirmed Application Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: all?.length,
    });
    }
    // await Student.find({ _id: { $in: unique } })
    //   .select(
    //     "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no"
    //   )
    //   .populate({
    //     path: "user",
    //     select: "userLegalName username userPhone Number userEmail",
    //   });
  } catch (e) {
    console.log(e);
  }
};

exports.render_review_tab_query = async (req, res) => {
  try {
    const { did, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    var numss = [];
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("reviewApplication")
        .populate({
          path: "reviewApplication",
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
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
              populate: {
                path: "fee_structure hostel_fee_structure fee_receipt",
                select:
                  "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
                // populate: {
                //   path: "category_master",
                //   select: "category_name",
                // },
              },
        });
      for (let ele of apply?.reviewApplication) {
        if (ele._id !== null) {
          numss.push(ele?._id);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.reviewApplication?.filter((ele) => {
      if(unique?.includes(`${ele}`)) return ele
    })
    res.status(200).send({
      message: "Explore All Review Application Students Master Query",
      access: true,
      student: all?.length > 0 ? all : [],
      student_count: all?.length ?? 0,
    });
    }
    else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("reviewApplication")
      for (let ele of apply?.reviewApplication) {
        if (ele._id !== null) {
          numss.push(ele?._id);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.reviewApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Review Application Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: all?.length,
    });
    }
    // await Student.find({ _id: { $in: unique } })
    //   .select(
    //     "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no"
    //   )
    //   .populate({
    //     path: "user",
    //     select: "userLegalName username userPhone Number userEmail",
    //   });
  } catch (e) {
    console.log(e);
  }
};

exports.render_allotted_tab_query = async (req, res) => {
  try {
    const { did, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    var numss = [];
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("allottedApplication")
        .populate({
          path: "allottedApplication",
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
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
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
      for (let ele of apply?.allottedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.allottedApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    res.status(200).send({
      message: "Explore All Receieved Application Students Master Query",
      access: true,
      student: all?.length > 0 ? all : [],
      student_count: all?.length ?? 0,
    });
    }
    else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("allottedApplication")
      for (let ele of apply?.allottedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.allottedApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Allotted Application Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: all?.length,
    });
    }
    // await Student.find({ _id: { $in: unique } })
    //   .select(
    //     "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no"
    //   )
    //   .populate({
    //     path: "user",
    //     select: "userLegalName username userPhone Number userEmail",
    //   });
  } catch (e) {
    console.log(e);
  }
};

exports.render_cancelled_tab_query = async (req, res) => {
  try {
    const { did, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    var numss = [];
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("cancelApplication")
        .populate({
          path: "cancelApplication",
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
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
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
      for (let ele of apply?.cancelApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.cancelApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    res.status(200).send({
      message: "Explore All Receieved Application Students Master Query",
      access: true,
      student: all?.length > 0 ? all : [],
      student_count: all?.length ?? 0,
    });
    }
    else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("cancelApplication")
      for (let ele of apply?.cancelApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
      }
      const all_student = await Student.find({ _id: { $in: numss } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (depart?.merged_subject_master?.includes(`${ele?._id}`)) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (depart?.merged_subject_master?.includes(`${ele?._id}`)) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = apply?.cancelApplication?.filter((ele) => {
      if(unique?.includes(`${ele?.student}`)) return ele
    })
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Cancelled Application Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: all?.length,
    });
    }
    // await Student.find({ _id: { $in: unique } })
    //   .select(
    //     "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no"
    //   )
    //   .populate({
    //     path: "user",
    //     select: "userLegalName username userPhone Number userEmail",
    //   });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveDepartmentSelectedApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { fee_struct, staffId, intake_type } = req.body;
    if (!sid && !aid && !fee_struct)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    })
      .select("institute admissionAdminHead selectedApplication")
      .populate({
        path: "admissionAdminHead",
        select: "user",
      });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const structure = await FeeStructure.findById({ _id: fee_struct });
    const institute = await InstituteAdmin.findById({
      _id: `${admission_admin?.institute}`,
    });
    const finance = await Finance.findOne({
      institute: admission_admin?.institute,
    });
    const status = new Status({});
    const notify = new StudentNotification({});
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
        apply.receieved_array.pull(student?._id);
      } else {
      }
    }
    apply.selectedApplication.push({
      student: student._id,
      fee_remain: structure.total_admission_fees,
      revert_request_status: status?._id,
    });
    admission_admin.selectedApplication.push({
      student: student._id,
      fee_remain: structure.total_admission_fees,
      revert_request_status: status?._id,
      application: apply?._id,
    });
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "select_by",
    });
    apply.selectCount += 1;
    status.content = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${structure?.structure_name}. And required documents are 'click here for details'.   
Start your admission process by confirming below.`;
    status.applicationId = apply._id;
    status.for_docs = "Yes";
    status.studentId = student._id;
    status.group_by = "Admission_Document_Verification";
    status.student = student._id;
    status.admissionFee = structure.total_admission_fees;
    status.instituteId = admission_admin?.institute;
    status.feeStructure = structure?._id;
    student.fee_structure = structure?._id;
    status.document_visible = true;
    status.finance = finance?._id;
    user.applicationStatus.push(status._id);
    student.active_status.push(status?._id);
    status.structure_edited = "Edited";
    notify.notifyContent = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${structure?.structure_name}. And required documents are 'click here for details'. 
Start your admission process by confirming below.`;
    notify.notifySender = admission_admin?.admissionAdminHead?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission_admin?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    student.intake_type = intake_type ?? "";
    await Promise.all([
      apply.save(),
      student.save(),
      user.save(),
      status.save(),
      notify.save(),
      admission_admin.save(),
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

exports.retrieveDepartmentCancelApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { reason, staffId } = req?.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    })
      .populate({
        path: "admissionAdminHead",
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
    notify.notifySender = admission_admin?.admissionAdminHead?.user;
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

