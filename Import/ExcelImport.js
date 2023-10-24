const InstituteAdmin = require("../models/InstituteAdmin");
const Department = require("../models/Department");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const ClassMaster = require("../models/ClassMaster");
const SubjectMaster = require("../models/SubjectMaster");
const Batch = require("../models/Batch");
const ExamFeeStructure = require("../models/BacklogStudent/ExamFeeStructure");
const { generate_random_code } = require("../helper/functions");
const { todayDate } = require("../Utilities/timeComparison");

exports.render_new_department_query = async (arr, id) => {
  try {
    if (arr?.length > 0) {
      var institute = await InstituteAdmin.findById({ _id: id });
      for (var ref of arr) {
        var department = new Department({
          dName: ref?.dName,
          dTitle: ref?.dTitle,
        });
        institute.depart.push(department._id);
        institute.departmentCount += 1;
        department.institute = institute._id;
        department.dHead = null;
        await department.save();
        const new_exam_fee = new ExamFeeStructure({
          exam_fee_type: "Per student",
          exam_fee_status: "Static Department Linked",
        });
        new_exam_fee.department = department?._id;
        department.exam_fee_structure.push(new_exam_fee?._id);
        department.exam_fee_structure_count += 1;
        await Promise.all([department.save(), new_exam_fee.save()]);
      }
      await institute.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_new_class_master_query = async (arr, did) => {
  try {
    if (arr?.length > 0) {
      const department = await Department.findById({ _id: did });
      for (var ref of arr) {
        const classroomMaster = new ClassMaster({
          className: ref?.className,
          institute: department?.institute,
          department: department?._id,
        });
        department.departmentClassMasters.push(classroomMaster._id);
        department.classMasterCount += 1;
        await classroomMaster.save();
      }
      await department.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_new_subject_master_query = async (arr, did) => {
  try {
    if (arr?.length > 0) {
      const depart = await Department.findById({ _id: did });
      for (var ref of arr) {
        const subjectMaster = new SubjectMaster({
          subjectName: ref?.subjectName,
          institute: depart?.institute,
          department: depart?._id,
          subjectType: ref?.subjectType,
          course_code: ref?.course_code
        });
        depart.departmentSubjectMasters.push(subjectMaster._id);
        depart.subjectMasterCount += 1;
        await subjectMaster.save();
      }
      await depart.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_new_class_query = async (arr, did) => {
  try {
    if (arr?.length > 0) {
      var depart = await Department.findById({ _id: did });
      var institute = await InstituteAdmin.findById({
        _id: `${depart?.institute}`,
      });
      var batch = await Batch.findById({
        _id: `${depart?.departmentSelectBatch}`,
      });
      for (var ref of arr) {
        var result = await generate_random_code();
        var masterClass = await ClassMaster.findById({ _id: ref?.mcId });
        if (institute.classCodeList.includes(`${result}`)) {
        } else {
          const date = await todayDate();
          var classRoom = new Class({
            masterClassName: masterClass?._id,
            className: masterClass?.className,
            classTitle: ref?.classTitle,
            classHeadTitle: ref?.classHeadTitle,
            classCode: `${result}`,
            classStartDate: date,
          });
          classRoom.classTeacher = null;
          institute.classCodeList.push(`${result}`);
          institute.classRooms.push(classRoom._id);
          classRoom.institute = institute._id;
          batch.classroom.push(classRoom._id);
          batch.classCount += 1;
          masterClass.classDivision.push(classRoom._id);
          masterClass.classCount += 1;
          classRoom.batch = batch._id;
          depart.class.push(classRoom._id);
          depart.classCount += 1;
          classRoom.department = depart._id;
          await Promise.all([masterClass.save(), classRoom.save()]);
        }
      }
      await Promise.all([institute.save(), batch.save(), depart.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_new_subject_query = async (arr, cid) => {
  try {
    if (arr?.length > 0) {
      var classes = await Class.findById({ _id: cid }).populate({
        path: "classTeacher",
      });
      var institute = await InstituteAdmin.findById({
        _id: `${classes?.institute}`,
      });
      var depart = await Department.findById({ _id: `${classes?.department}` });
      for (var ref of arr) {
        var subjectMaster = await SubjectMaster.findById({ _id: ref?.msid });
        const subject = new Subject({
          subjectTitle: ref?.subjectTitle,
          subjectName: subjectMaster?.subjectName,
          subjectMasterName: subjectMaster?._id,
          subjectOptional: subjectMaster?.subjectType,
          subject_category: ref?.subject_category,
        });
        subject.subjectTeacherName = null;
        classes.subject.push(subject._id);
        classes.subjectCount += 1;
        subjectMaster.subjects.push(subject._id);
        subjectMaster.subjectCount += 1;
        subject.class = classes._id;
        if (ref?.selected_batch) {
          subject.selected_batch_query = ref?.selected_batch;
        }
        await Promise.all([subjectMaster.save(), subject.save()]);
      }
      await Promise.all([classes.save(), depart.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};
