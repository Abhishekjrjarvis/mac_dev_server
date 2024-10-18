const Subject = require("../../models/Subject");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");
const { subject_json_to_excel } = require("../../Custom/JSONToExcel");

exports.getSubjectTabManageQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { flow } = req.query;

    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    if (flow === "Subject") {
      let subject = await Subject.findById(sid)
        .populate({
          path: "class",
          select: "institute",
        })
        .populate({
          path: "subjectMasterName",
        });
      if (subject?.class?.institute) {
        const inst = await InstituteAdmin.findById(
          subject?.class?.institute
        ).select("subject_tab_manage");
        res.status(200).send({
          message: "Subject Tab Manage toggle",
          tab_manage: inst?.subject_tab_manage,
        });
      } else {
        const inst = await InstituteAdmin.findById(
          subject?.subjectMasterName?.institute
        ).select("subject_tab_manage");
        res.status(200).send({
          message: "Subject Tab Manage toggle",
          tab_manage: inst?.subject_tab_manage,
        });
      }
    } else {
      const inst = await InstituteAdmin.findById(sid).select(
        "subject_tab_manage"
      );
      res.status(200).send({
        message: "Subject Tab Manage toggle",
        tab_manage: inst?.subject_tab_manage,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.updateSubjectTabManageQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    await InstituteAdmin.findByIdAndUpdate(sid, req.body);
    res.status(200).send({
      message: "Subject Tab Manage toggle updated",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_catalog_export_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let excel_key = "";
    const subjects = await Subject.findById(sid)
      .populate({
        path: "selected_batch_query",
        select: "class_student_query",
      })
      .populate({
        path: "class",
        select: "classTitle ApproveStudent",
      });
    let student_list = [];
    if (subjects?.selected_batch_query?._id) {
      student_list = subjects?.selected_batch_query?.class_student_query;
    } else {
      if (subjects?.optionalStudent?.length > 0) {
        student_list = subjects?.optionalStudent;
      } else {
        const cdt = await Class.findById(subjects?.class);
        student_list = cdt?.ApproveStudent;
      }
    }

    let students = [];

    if (student_list?.length > 0) {
      for (let st of student_list) {
        const student = await Student.findById(st)
          .select(
            "studentFirstName studentLastName studentMiddleName studentGRNO studentROLLNO student_prn_enroll_number studentGender studentEmail studentPhoneNumber studentAddress studentParentsPhoneNumber"
          )
          .lean()
          .exec();
        let dObj = {
          GRNO: student?.studentGRNO ?? "N/A",
          "Enrollment / PRN": student?.student_prn_enroll_number
            ? student?.student_prn_enroll_number
            : "N/A",
          RollNo: student?.studentROLLNO,
          Name: `${
            student?.studentFirstName +
            " " +
            student?.studentMiddleName +
            " " +
            student?.studentLastName
          }`,
          Gender: student?.studentGender,
          Email: student?.studentEmail ?? "N/A",
          "Mobile No": student?.studentPhoneNumber ?? "N/A",
          "Parent's Mobile No": student?.studentParentsPhoneNumber ?? "N/A",
          Address: student?.studentAddress ?? "N/A",
        };
        students.push(dObj);
      }
    }

    if (students?.length > 0) {
      excel_key = await subject_json_to_excel(
        sid,
        students,
        "Catalog Students",
        "CATALOG_STUDENT",
        `catalog-of-student-${subjects?.subjectName ?? ""}-${
          subjects?.class?.classTitle ?? ""
        }`
      );
    }
    return res.status(200).send({
      message: "All student zip with catalog.",
      excel_key: excel_key,
    });
  } catch (e) {
    console.log(e);
  }
};
