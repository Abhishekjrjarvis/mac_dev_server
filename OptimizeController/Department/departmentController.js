const encryptionPayload = require("../../Utilities/Encrypt/payload");
const NewApplication = require("../../models/Admission/NewApplication");
const Department = require("../../models/Department");

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
    const { sid, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req?.query
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_subject = await SubjectMaster.findById({ _id: sid });
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
    }
    else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("receievedApplication")
      for (let ele of apply?.receievedApplication) {
        if (ele.student !== null) {
          numss.push(ele?.student);
        }
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
        if (`${ele?._id}` === `${one_subject?._id}`) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (`${ele?._id}` === `${one_subject?._id}`) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (`${ele?._id}` === `${one_subject?._id}`) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = await Student.find({ _id: { $in: unique } })
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no"
      )
      .populate({
        path: "user",
        select: "userLegalName username userPhone Number userEmail",
      });
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Receieved Application Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: unique?.length,
    });
  } catch (e) {
    console.log(e);
  }
};
