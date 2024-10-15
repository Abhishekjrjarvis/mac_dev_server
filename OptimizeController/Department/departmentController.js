const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const {
  email_sms_designation_application,
} = require("../../WhatsAppSMS/payload");
const { nested_document_limit } = require("../../helper/databaseFunction");
const Admission = require("../../models/Admission/Admission");
const NewApplication = require("../../models/Admission/NewApplication");
const Status = require("../../models/Admission/status");
const Class = require("../../models/Class");
const Department = require("../../models/Department");
const Finance = require("../../models/Finance");
const FeeStructure = require("../../models/Finance/FeesStructure");
const InstituteAdmin = require("../../models/InstituteAdmin");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Student = require("../../models/Student");
const User = require("../../models/User");

const Subject = require("../../models/Subject");
const Batch = require("../../models/Batch");
const SubjectMaster = require("../../models/SubjectMaster");
const Staff = require("../../models/Staff");

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
    const { did } = req?.params;
    const { apps, flow } = req?.body;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    if (flow === "ADD") {
      for (let ele of apps) {
        depart.filter_application.push(ele);
      }
    } else if (flow === "REMOVE") {
      for (let ele of apps) {
        depart.filter_application.pull(ele);
      }
    }
    await depart.save();
    res
      .status(200)
      .send({ message: `${flow} Application In Department`, access: true });
  } catch (e) {
    console.log();
  }
};

exports.retieveDepartmentAllApplication = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const depart = await Department.findById({ _id: did }).select(
      "filter_application department_status merged_subject_master"
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
      if (depart?.department_status === "Academic") {
        for (var ref of ongoing) {
          if (ref?.receievedApplication?.length > 0) {
            var numss = [];
            for (let ele of ref?.receievedApplication) {
              if (ele.student !== null) {
                numss.push(ele?.student);
              }
            }
            const all_student = await Student.find({
              _id: { $in: numss },
            }).select(
              "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId student_optional_subject major_subject nested_subject"
            );
            var na = [];
            for (let val of all_student) {
              for (let ele of val?.student_optional_subject) {
                if (depart?.merged_subject_master?.includes(`${ele}`))
                  na.push(val);
              }
              for (let val of all_student) {
                for (let ele of val?.major_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    na.push(val);
                  }
                }
              }
              for (let val of all_student) {
                for (let ele of val?.nested_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    na.push(val);
                  }
                }
              }
            }
            const unique = [...new Set(na.map((item) => item._id))];
            var all_rec = [];
            for (let stu of ref?.receievedApplication) {
              for (let cls of unique) {
                if (`${cls}` === `${stu?.student}`) {
                  all_rec.push(stu);
                }
              }
            }
            ref.receievedCount = all_rec?.length ?? 0;
          }
          if (ref?.selectedApplication?.length > 0) {
            var numss_sel = [];
            for (let ele of ref?.selectedApplication) {
              if (ele.student !== null) {
                numss_sel.push(ele?.student);
              }
            }
            const all_student = await Student.find({
              _id: { $in: numss_sel },
            }).select(
              "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId student_optional_subject major_subject nested_subject"
            );
            var nb = [];
            for (let val of all_student) {
              for (let ele of val?.student_optional_subject) {
                if (depart?.merged_subject_master?.includes(`${ele}`))
                  nb.push(val);
              }
              for (let val of all_student) {
                for (let ele of val?.major_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    nb.push(val);
                  }
                }
              }
              for (let val of all_student) {
                for (let ele of val?.nested_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    nb.push(val);
                  }
                }
              }
            }
            const unique = [...new Set(nb.map((item) => item._id))];
            var all_sel = [];
            for (let stu of ref?.selectedApplication) {
              for (let cls of unique) {
                if (`${cls}` === `${stu?.student}`) {
                  all_sel.push(stu);
                }
              }
            }
            ref.selectCount = all_sel?.length ?? 0;
          }
          if (ref?.FeeCollectionApplication?.length > 0) {
            var numss_fee = [];
            for (let ele of ref?.FeeCollectionApplication) {
              if (ele.student !== null) {
                numss_fee.push(ele?.student);
              }
            }
            const all_student = await Student.find({
              _id: { $in: numss_fee },
            }).select(
              "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId student_optional_subject major_subject nested_subject"
            );
            var n = [];
            for (let val of all_student) {
              for (let ele of val?.student_optional_subject) {
                if (depart?.merged_subject_master?.includes(`${ele}`))
                  n.push(val);
              }
              for (let val of all_student) {
                for (let ele of val?.major_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
              for (let val of all_student) {
                for (let ele of val?.nested_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
            }
            const unique = [...new Set(n.map((item) => item._id))];
            var all_fee = [];
            for (let stu of ref?.FeeCollectionApplication) {
              for (let cls of unique) {
                if (`${cls}` === `${stu?.student}`) {
                  all_fee.push(stu);
                }
              }
            }
            ref.fee_collect_count = all_fee?.length ?? 0;
          }
          if (ref?.confirmedApplication?.length > 0) {
            var numss_conf = [];
            for (let ele of ref?.confirmedApplication) {
              if (ele.student !== null) {
                numss_conf.push(ele?.student);
              }
            }
            const all_student = await Student.find({
              _id: { $in: numss_conf },
            }).select(
              "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId student_optional_subject major_subject nested_subject"
            );
            var n = [];
            for (let val of all_student) {
              for (let ele of val?.student_optional_subject) {
                if (depart?.merged_subject_master?.includes(`${ele}`))
                  n.push(val);
              }
              for (let val of all_student) {
                for (let ele of val?.major_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
              for (let val of all_student) {
                for (let ele of val?.nested_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
            }
            const unique = [...new Set(n.map((item) => item._id))];
            var all_conf = [];
            for (let stu of ref?.confirmedApplication) {
              for (let cls of unique) {
                if (`${cls}` === `${stu?.student}`) {
                  all_conf.push(stu);
                }
              }
            }
            ref.confirmCount = all_conf?.length ?? 0;
          }
          if (ref?.reviewApplication?.length > 0) {
            var numss_rev = [];
            for (let ele of ref?.reviewApplication) {
              if (ele.student !== null) {
                numss_rev.push(ele?.student);
              }
            }
            const all_student = await Student.find({
              _id: { $in: numss_rev },
            }).select(
              "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId student_optional_subject major_subject nested_subject"
            );
            var n = [];
            for (let val of all_student) {
              for (let ele of val?.student_optional_subject) {
                if (depart?.merged_subject_master?.includes(`${ele}`))
                  n.push(val);
              }
              for (let val of all_student) {
                for (let ele of val?.major_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
              for (let val of all_student) {
                for (let ele of val?.nested_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
            }
            const unique = [...new Set(n.map((item) => item._id))];
            var all_rev = [];
            for (let stu of ref?.reviewApplication) {
              for (let cls of unique) {
                if (`${cls}` === `${stu?.student}`) {
                  all_rev.push(stu);
                }
              }
            }
            ref.review_count = all_rev?.length ?? 0;
          }
          if (ref?.allottedApplication?.length > 0) {
            var numss_all = [];
            for (let ele of ref?.allottedApplication) {
              if (ele.student !== null) {
                numss_all.push(ele?.student);
              }
            }
            const all_student = await Student.find({
              _id: { $in: numss_all },
            }).select(
              "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId student_optional_subject major_subject nested_subject"
            );
            var n = [];
            for (let val of all_student) {
              for (let ele of val?.student_optional_subject) {
                if (depart?.merged_subject_master?.includes(`${ele}`))
                  n.push(val);
              }
              for (let val of all_student) {
                for (let ele of val?.major_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
              for (let val of all_student) {
                for (let ele of val?.nested_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
            }
            const unique = [...new Set(n.map((item) => item._id))];
            var all_allot = [];
            for (let stu of ref?.allottedApplication) {
              for (let cls of unique) {
                if (`${cls}` === `${stu?.student}`) {
                  all_allot.push(stu);
                }
              }
            }
            ref.allotCount = all_allot?.length ?? 0;
          }
          if (ref?.cancelApplication?.length > 0) {
            var numss_can = [];
            for (let ele of ref?.cancelApplication) {
              if (ele.student !== null) {
                numss_can.push(ele?.student);
              }
            }
            const all_student = await Student.find({
              _id: { $in: numss_can },
            }).select(
              "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId student_optional_subject major_subject nested_subject"
            );
            var n = [];
            for (let val of all_student) {
              for (let ele of val?.student_optional_subject) {
                if (depart?.merged_subject_master?.includes(`${ele}`))
                  n.push(val);
              }
              for (let val of all_student) {
                for (let ele of val?.major_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
              for (let val of all_student) {
                for (let ele of val?.nested_subject) {
                  if (depart?.merged_subject_master?.includes(`${ele}`)) {
                    n.push(val);
                  }
                }
              }
            }
            const unique = [...new Set(n.map((item) => item._id))];
            var all_can = [];
            for (let stu of ref?.cancelApplication) {
              for (let cls of unique) {
                if (`${cls}` === `${stu?.student}`) {
                  all_can.push(stu);
                }
              }
            }
            ref.cancelCount = all_can?.length ?? 0;
          }
        }
      } else {
        for (var ref of ongoing) {
          ref.selectCount = ref?.selectedApplication?.length;
          ref.confirmCount = ref?.confirmedApplication?.length;
          ref.receievedCount = ref?.receievedApplication?.length;
          ref.allotCount = ref?.allottedApplication?.length;
          ref.cancelCount = ref?.cancelApplication?.length;
          ref.review_count = ref?.reviewApplication?.length;
          ref.fee_collect_count = ref?.FeeCollectionApplication?.length;
        }
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
    const { search } = req?.query;
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.receievedApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.receievedApplication];
      }
      res.status(200).send({
        message: "Explore All Receieved Application Students Master Query",
        access: true,
        student: all?.length > 0 ? all : [],
        student_count: all?.length ?? 0,
      });
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("receievedApplication")
        .populate({
          path: "receievedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
          },
        });
      for (let ele of apply?.receievedApplication) {
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.receievedApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.receievedApplication];
      }
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
    const { search } = req?.query;
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.selectedApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.selectedApplication];
      }
      res.status(200).send({
        message: "Explore All Receieved Application Students Master Query",
        access: true,
        student: all?.length > 0 ? all : [],
        student_count: all?.length ?? 0,
      });
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("selectedApplication")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.selectedApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.selectedApplication];
      }
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
    const { search } = req?.query;
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.FeeCollectionApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.FeeCollectionApplication];
      }
      res.status(200).send({
        message: "Explore All Receieved Application Students Master Query",
        access: true,
        student: all?.length > 0 ? all : [],
        student_count: all?.length ?? 0,
      });
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("FeeCollectionApplication")
        .populate({
          path: "FeeCollectionApplication",
          populate: {
            path: "student payment_flow app_card gov_card fee_struct",
          },
        });
      for (let ele of apply?.FeeCollectionApplication) {
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.FeeCollectionApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.FeeCollectionApplication];
      }
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
    const { search } = req?.query;
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.confirmedApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.confirmedApplication];
      }
      res.status(200).send({
        message: "Explore All Receieved Application Students Master Query",
        access: true,
        student: all?.length > 0 ? all : [],
        student_count: all?.length ?? 0,
      });
    } else {
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
        if (ele.student?._id !== null) {
          numss.push(ele.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.confirmedApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.confirmedApplication];
      }
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
    const { search } = req?.query;
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.reviewApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.reviewApplication];
      }
      res.status(200).send({
        message: "Explore All Review Application Students Master Query",
        access: true,
        student: all?.length > 0 ? all : [],
        student_count: all?.length ?? 0,
      });
    } else {
      var apply = await NewApplication.findById({ _id: aid }).select(
        "reviewApplication"
      );
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.reviewApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.reviewApplication];
      }
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
    const { search } = req?.query;
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.allottedApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.allottedApplication];
      }
      res.status(200).send({
        message: "Explore All Allotted Application Students Master Query",
        access: true,
        student: all?.length > 0 ? all : [],
        student_count: all?.length ?? 0,
      });
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("allottedApplication")
        .populate({
          path: "allottedApplication",
          populate: {
            path: "student",
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.allottedApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.allottedApplication];
      }
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
    const { search } = req?.query;
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.cancelApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.cancelApplication];
      }
      res.status(200).send({
        message: "Explore All Cancelled Application Students Master Query",
        access: true,
        student: all?.length > 0 ? all : [],
        student_count: all?.length ?? 0,
      });
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("cancelApplication")
        .populate({
          path: "cancelApplication",
          populate: {
            path: "student",
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
        if (ele.student?._id !== null) {
          numss.push(ele?.student?._id);
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
          if (depart?.merged_subject_master?.includes(`${ele?._id}`))
            n.push(val);
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
      var all = [];
      if (depart?.department_status === "Academic") {
        for (let stu of apply?.cancelApplication) {
          for (let cls of unique) {
            if (`${cls}` === `${stu?.student?._id}`) {
              all.push(stu);
            }
          }
        }
      } else {
        all = [...apply?.cancelApplication];
      }
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

exports.custom_batch_data_correction = async (req, res) => {
  try {
    const { did } = req?.params;
    if (!did)
      return res
        .status(200)
        .send({ message: "Their is a need to fixed", access: false });

    //     const dep = await Department.findById({ _id: did }).select("batches");

    //     const all_class = await Class.find({
    //       $and: [
    //         { department: did },
    //         {
    //           batch: {
    //             $in: ["669e07e4ee30ba0b12e68d89"],
    //             // $in: ["6538cc57e79fb543afc4f461"],
    //           },
    //         },
    //       ],
    //     }).select("multiple_batches classTitle batch");

    //     // let nums = [];
    //     // for (let cls of all_class) {
    //     //   if (cls?.multiple_batches?.length > 0) {
    //     //     nums.push(...cls?.multiple_batches);
    //     //   }
    //     // }

    //     // let previous_batches = [
    //     //   "653a5ce22fc2206530d68a8d",
    //     //   "653a5ce82fc2206530d68aa6",
    //     //   "653a5cc72fc2206530d68a2e",
    //     //   "653a5ccd2fc2206530d68a34",
    //     //   "653a5cd22fc2206530d68a48",
    //     // ];

    // //     let previous_batches = [
    // //       "65380c631fd08661b6c77493",
    // //       "65380c6c1fd08661b6c774ca",
    // //       "65380c731fd08661b6c774f1",
    // //       "65380c7d1fd08661b6c7750a",
    // //       "65380c831fd08661b6c77510",
    // //       "65380cb81fd08661b6c7759a",
    // //       "65380cc41fd08661b6c775df",
    // //       "6538169e1fd08661b6c791fc",
    // //       "653816a41fd08661b6c79202",
    // //       "653816ab1fd08661b6c79208",
    // //       "653816b31fd08661b6c7920e",
    // //       "653816bb1fd08661b6c79214",
    // //       "653816c81fd08661b6c79254",
    // //       "653a59b5e79fb543afca316e",
    // //       "653816dc1fd08661b6c792ed",
    // //       "653816e21fd08661b6c79313",
    // //       "653816e81fd08661b6c79338",
    // //       "653816ee1fd08661b6c79358",
    // //       "653816f71fd08661b6c7935e",
    // //       "6538171b1fd08661b6c7939c",
    // //       "653817211fd08661b6c793c1",
    // //       "653817281fd08661b6c793e8",
    // //       "6538172d1fd08661b6c7940a",
    // //       "653817331fd08661b6c79434",
    // //     ];

    //     let nums = [];
    //     let batch_remove_class_select = [];
    //     let batch_remove_cls = [];

    //     // for (let cls of all_class) {
    //     //   if (cls?.multiple_batches?.length > 0) {
    //     //     let cty = [...cls?.multiple_batches];
    //     //     for (let ot of cty) {
    //     //       if (previous_batches?.includes(`${ot}`)) {
    //     //         batch_remove_cls.push({
    //     //           cls: cls?._id,
    //     //           ot: ot,
    //     //         });
    //     //         cls?.multiple_batches.pull(ot);
    //     //         await cls.save();
    //     //         const batch_internal = await Batch.findById(ot);
    //     //         if (batch_internal?._id) {
    //     //           if (`${batch_internal?.class_batch_select}` === `${cls?._id}`) {
    //     //             batch_remove_class_select.push({
    //     //               ct: cls?._id,
    //     //               bt_internal: batch_internal?._id,
    //     //             });
    //     //             batch_internal.class_batch_select = null;
    //     //             await batch_internal.save();
    //     //           }
    //     //         }
    //     //       }
    //     //     }
    //     //   }
    //     // }

    //     // let dft_subject = [
    //     //   {
    //     //     cls: "669e07e5ee30ba0b12e68d8e",
    //     //     ot: "653a5ce22fc2206530d68a8d",
    //     //   },
    //     //   {
    //     //     cls: "669e07e5ee30ba0b12e68d8e",
    //     //     ot: "653a5ce82fc2206530d68aa6",
    //     //   },
    //     //   {
    //     //     cls: "669e07fbee30ba0b12e68ee1",
    //     //     ot: "653a5cc72fc2206530d68a2e",
    //     //   },
    //     //   {
    //     //     cls: "669e07fbee30ba0b12e68ee1",
    //     //     ot: "653a5ccd2fc2206530d68a34",
    //     //   },
    //     //   {
    //     //     cls: "669e07fbee30ba0b12e68ee1",
    //     //     ot: "653a5cd22fc2206530d68a48",
    //     //   },
    //     // ];
    //     // if (dft_subject?.length > 0) {
    //     //   for (let ot of dft_subject) {
    //     //     const sub_all = await Subject.find({
    //     //       class: `${ot?.cls}`,
    //     //     });
    //     //     if (sub_all?.length) {
    //     //       for (let sub of sub_all) {
    //     //         if (sub?.selected_batch_query) {
    //     //           if (`${sub?.selected_batch_query}` === `${ot?.ot}`) {
    //     //             sub.selected_batch_query = null;
    //     //             await sub.save();
    //     //           }
    //     //         }
    //     //       }
    //     //     }
    //     //   }
    //     // }

    const dep = await Department.findById({ _id: did }).select(
      "departmentSelectBatch"
    );
    const bt = await Batch.findById(dep?.departmentSelectBatch);

    let previous_batches = [];

    if (bt?.identical_batch) {
      const prev_all_class = await Class.find({
        $and: [
          { department: did },
          {
            batch: {
              $in: [bt?.identical_batch],
            },
          },
        ],
      }).select("multiple_batches classTitle batch");

      for (let cls of prev_all_class) {
        if (cls?.multiple_batches?.length > 0) {
          for (let rf of cls?.multiple_batches) {
            previous_batches.push(`${rf}`);
          }
        }
      }
    }

    const all_class = await Class.find({
      $and: [
        { department: did },
        {
          batch: {
            $in: [dep?.departmentSelectBatch],
          },
        },
      ],
    }).select("multiple_batches classTitle batch");

    let batch_remove_class_select = [];
    let batch_remove_cls = [];
    let class_remove_batch_select = [];

    for (let cls of all_class) {
      if (cls?.multiple_batches?.length > 0) {
        let cty = [...cls?.multiple_batches];
        for (let ot of cty) {
          if (previous_batches?.includes(`${ot}`)) {
            // const batch_internal = await Batch.findById(ot);
            // const new_batch = new Batch({
            //   batchName: batch_internal?.batchName,
            // });
            // cls.multiple_batches.push(new_batch?._id);
            // new_batch.class_batch_select = cls?._id;
            // batch_remove_cls.push({
            //   cls: cls?._id,
            //   ot: ot,
            //   n_batch: new_batch?._id,
            // });
            // cls?.multiple_batches.pull(ot);
            // await Promise.all([await cls.save(), new_batch.save()]);
            // if (batch_internal?._id) {
            //   if (`${batch_internal?.class_batch_select}` === `${cls?._id}`) {
            //     batch_remove_class_select.push({
            //       ct: cls?._id,
            //       bt_internal: batch_internal?._id,
            //     });
            //     batch_internal.class_batch_select = null;
            //     await batch_internal.save();
            //   }
            // }
          } else {
            // const batch_internal = await Batch.findById(ot);
            // class_remove_batch_select.push({
            //   cls: cls?._id,
            //   ot: ot,
            // });
            // cls?.multiple_batches.pull(ot);
            // await Promise.all([await cls.save()]);
            // if (batch_internal?._id) {
            //   if (`${batch_internal?.class_batch_select}` === `${cls?._id}`) {
            //     batch_internal.class_batch_select = null;
            //     await batch_internal.save();
            //   }
            // }
          }
        }
      }
    }

    // if (batch_remove_cls?.length > 0) {
    //   for (let ot of batch_remove_cls) {
    //     const sub_all = await Subject.find({
    //       class: `${ot?.cls}`,
    //     });
    //     if (sub_all?.length) {
    //       for (let sub of sub_all) {
    //         if (sub?.selected_batch_query) {
    //           if (`${sub?.selected_batch_query}` === `${ot?.ot}`) {
    //             sub.selected_batch_query = ot?.n_batch;
    //             await sub.save();
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    // if (class_remove_batch_select?.length > 0) {
    //   for (let ot of class_remove_batch_select) {
    //     const sub_all = await Subject.find({
    //       class: `${ot?.cls}`,
    //     });
    //     if (sub_all?.length) {
    //       for (let sub of sub_all) {
    //         if (sub?.selected_batch_query) {
    //           if (`${sub?.selected_batch_query}` === `${ot?.ot}`) {
    //             sub.selected_batch_query = null;
    //             await sub.save();
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    res.status(200).send({
      message: "Explore",
      previous_batches,
      batch_remove_class_select,
      batch_remove_cls,
      class_remove_batch_select,
    });

    // const all_batch = await Batch.find({ _id: { $in: ?.batches } })
  } catch (e) {
    console.log(e);
  }
};

exports.custom_department_delete_subject_query = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const department = await Department.findById(did);

    const cls = await Class.find({
      batch: {
        $in: department?.batches ?? [],
      },
    });

    if (cls?.length > 0) {
      for (let ct of cls) {
        const classes = await Class.findById(ct?._id);
        if (ct?.subject?.length > 0) {
          for (let st of ct?.subject) {
            const subject = await Subject.findById(st);
            if (subject?.subjectMasterName) {
              const subjectMaster = await SubjectMaster.findById(
                subject.subjectMasterName
              );
              subjectMaster?.subjects.pull(subject._id);
              subjectMaster.subjectCount -= 1;
              // await subjectMaster.save();
            }
            if (subject?.subjectTeacherName) {
              const subjectTeacherName = await Staff.findById(
                subject?.subjectTeacherName
              );
              subjectTeacherName.staffSubject.pull(subject._id);
              subjectTeacherName.staffDesignationCount -= 1;
              // await subjectTeacherName.save();
            }
            classes?.subject.pull(subject._id);
            classes.subjectCount -= 1;
            // await Subject.findByIdAndDelete(st);
          }
        }
        // await classes.save();
      }
    }
    res.status(200).send({
      message: "Outward published on feed",
    });
  } catch (e) {
    console.log(e);
  }
};
