const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Batch = require("../../models/Batch");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Subject = require("../../models/Subject");
const SubjectMaster = require("../../models/SubjectMaster");
const ClassMaster = require("../../models/ClassMaster");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const DisplayPerson = require("../../models/DisplayPerson");
const Notification = require("../../models/notification");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const {
  designation_alarm,
  email_sms_designation_alarm,
} = require("../../WhatsAppSMS/payload");
const Hostel = require("../../models/Hostel/hostel");
const Transport = require("../../models/Transport/transport");
const { handle_undefined } = require("../../Handler/customError");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

// const StudentPreviousData = require("../../models/StudentPreviousData");
exports.departmentDetail = async (req, res) => {
  try {
    if (!req.params.did) throw "Please send department id to perform task";
    const department = await Department.findById(req.params.did)
      .populate({
        path: "dHead",
        select:
          "staffProfilePhoto photoId staffFirstName staffMiddleName staffLastName",
      })
      .select("dName dTitle dHead gr_initials")
      .lean()
      .exec();
    // const dEncrypt = await encryptionPayload(department);
    res.status(200).send({
      message: "Department details got successfully👍",
      department,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.departmentEdit = async (req, res) => {
  try {
    if (!req.params.did) throw "Please send department id to perform task";
    const department = await Department.findById(req.params.did);
    var institute = await InstituteAdmin.findById(department.institute);
    if (req.body?.dName) department.dName = req.body?.dName;
    if (req.body?.dTitle) department.dTitle = req.body?.dTitle;
    if (req.body?.sid) {
      if (department?.dHead) {
        const previousStaff = await Staff.findById(department.dHead);
        previousStaff.staffDepartment?.pull(department._id);
        if (previousStaff?.staffDesignationCount > 0) {
          previousStaff.staffDesignationCount -= 1;
        }
        previousStaff.recentDesignation = "";
        await previousStaff.save();
      }
      const staff = await Staff.findById(req.body?.sid);
      var user = await User.findById(staff.user);
      const notify = new Notification({});
      staff.staffDepartment.push(department._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = department.dTitle;
      department.dHead = staff._id;
      if (
        department?.departmentChatGroup?.length >= 1 &&
        department?.departmentChatGroup?.includes(`${staff._id}`)
      ) {
      } else {
        department?.departmentChatGroup?.push(staff._id);
        department.staffCount += 1;
        await department.save();
      }
      notify.notifyContent = `you got the designation of ${department.dName} as ${department.dTitle}`;
      notify.notifySender = institute._id;
      notify.notifyCategory = "Department Designation";
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = institute._id;
      await Promise.all([staff.save(), user.save(), notify.save()]);

      if (user.deviceToken) {
        await invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
      }
    } else {
    }
    await department.save();
    res.status(200).send({
      message: "department edited successfully👍",
    });
    designation_alarm(
      user?.userPhoneNumber,
      "DHEAD",
      institute?.sms_lang,
      department?.dName,
      department?.dTitle,
      ""
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "DHEAD",
        institute?.sms_lang,
        department?.dName,
        department?.dTitle,
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.departmentDelete = async (req, res) => {
  try {
    if (!req.params.did) throw "Please send department id to perform task";
    const department = await Department.findById(req.params.did);
    if (department?.ApproveStudent?.length) {
      return res.status(200).send({
        message: "You can't delete department because students existence",
        error: true,
      });
    }
    if (department?.displayPersonList?.length > 0) {
      for (let display of department?.displayPersonList) {
        const displayPerson = await DisplayPerson.findById(display).populate({
          path: "displayUser",
        });
        displayPerson.displayUser.displayPersonArray?.pull(display);
        await displayPerson.displayUser.save();
        await DisplayPerson.findByIdAndDelete(display);
      }
    }
    const institute = await InstituteAdmin.findById(department.institute);
    if (department?.batches?.length > 0) {
      for (let btId of department?.batches) {
        const batch = await Batch.findById(btId);
        institute?.idCardBatch?.pull(batch._id);
        if (batch?.classroom?.length > 0) {
          for (let cls of batch?.classroom) {
            const classes = await Class.findById(cls);
            if (classes?.displayPersonList?.length > 0) {
              for (let display of classes?.displayPersonList) {
                const displayPerson = await DisplayPerson.findById(
                  display
                ).populate({
                  path: "displayUser",
                });
                displayPerson.displayUser.displayPersonArray?.pull(display);
                await displayPerson.displayUser.save();
                await DisplayPerson.findByIdAndDelete(display);
              }
            }
            if (classes?.subject?.length > 0) {
              for (let sub of classes?.subject) {
                const subject = await Subject.findById(sub);
                if (subject.subjectTeacherName) {
                  const subjectTeacherName = await Staff.findById(
                    subject.subjectTeacherName
                  );
                  subjectTeacherName?.staffSubject.pull(subject._id);
                  subjectTeacherName.staffDesignationCount -= 1;
                  await subjectTeacherName.save();
                }
                await Subject.findByIdAndDelete(sub);
              }
            }
            if (classes.classTeacher) {
              const classTeacher = await Staff.findById(classes.classTeacher);
              classTeacher?.staffClass?.pull(classes._id);
              classTeacher.staffDesignationCount -= 1;
              institute?.classRooms?.pull(classes._id);
              await classTeacher.save();
            }
            await Class.findByIdAndDelete(cls);
          }
        }

        await Batch.findByIdAndDelete(btId);
      }
    }
    if (department?.departmentClassMasters?.length > 0) {
      for (let classMas of department?.departmentClassMasters) {
        await ClassMaster.findByIdAndDelete(classMas);
      }
    }
    if (department?.departmentSubjectMasters?.length > 0) {
      for (let subMas of department?.departmentSubjectMasters) {
        await SubjectMaster.findByIdAndDelete(subMas);
      }
    }
    institute?.depart?.pull(department._id);
    if (department.dHead) {
      const dHead = await Staff.findById(department.dHead);
      dHead?.staffDepartment?.pull(department._id);
      dHead.staffDesignationCount -= 1;
      await dHead.save();
    }
    await institute.save();
    await Department.findByIdAndDelete(req.params.did);
    res.status(200).send({
      message: "Department deleted successfully👍",
      error: false,
    });
  } catch (e) {
    console.log(e);
  }
};


exports.batchEdit = async (req, res) => {
  try {
    if (!req.params.bid) throw "Please send batch id to perform task";
    await Batch.findByIdAndUpdate(req.params.bid, req.body);
    res.status(200).send({
      message: "batch edited successfully👍",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
      edited: "No",
    });
  }
};

exports.batchDelete = async (req, res) => {
  try {
    if (!req.params.bid) throw "Please send batch id to perform task";
    var batch = await Batch.findById(req.params.bid);
    if (batch?.ApproveStudent?.length)
      throw "You can't delete batch because students existence";
    const institute = await InstituteAdmin.findById(batch.institute);
    institute?.idCardBatch?.pull(batch._id);
    const department = await Department.findById(batch.department);
    department?.batches?.pull(batch._id);
    department.batchCount -= 1;
    if (String(department.departmentSelectBatch) === String(batch._id)) {
      department.departmentSelectBatch = null;
    }
    if (String(department.userBatch) === String(batch._id))
      department.userBatch = null;
    for (let cls of batch?.classroom) {
      var classes = await Class.findById({ _id: `${cls}`});
      // for (let display of classes?.displayPersonList) {
      //   const displayPerson = await DisplayPerson.findById(display).populate({
      //     path: "displayUser",
      //   });
      //   displayPerson.displayUser.displayPersonArray?.pull(display);
      //   await displayPerson.displayUser.save();
      //   await DisplayPerson.findByIdAndDelete(display);
      // }
      if(classes?.subject?.length > 0){
        for (let sub of classes?.subject) {
          const subject = await Subject.findById(sub);
          const subjectMaster = await SubjectMaster.findById(
            subject.subjectMasterName
          );
          subjectMaster?.subjects.pull(subject._id);
          subjectMaster.subjectCount -= 1;
          if(subject.subjectTeacherName){
            const subjectTeacherName = await Staff.findById(
              subject.subjectTeacherName
            );
            subjectTeacherName?.staffSubject.pull(subject._id);
            subjectTeacherName.staffDesignationCount -= 1;
            await subjectTeacherName.save()
          }
          await subjectMaster.save()
          await Subject.findByIdAndDelete(sub);
        }
      }

      if(classes?.masterClassName){
      const classMaster = await ClassMaster.findById({ _id: `${classes?.masterClassName}`});
      classMaster?.classDivision?.pull(classes._id);
      classMaster.classCount -= 1;
      await classMaster.save()
      }
      if(classes?.classTeacher){
        const classTeacher = await Staff.findById(classes?.classTeacher);
        classTeacher?.staffClass?.pull(classes._id);
        classTeacher.staffDesignationCount -= 1;
        await classTeacher.save()
      }
      if(classes?.institute){
        var ins = await InstituteAdmin.findById({ _id: `${classes?.institute}`});
      ins?.classRooms?.pull(classes?._id);
      await ins.save()
      }
      if(classes?.department){
        const department = await Department.findById(classes?.department);
      department?.class?.pull(classes?._id);
      
      if(department?.classCount > 0){
      department.classCount -= 1;
      }
      await 
        department.save()
    }

      await Class.findByIdAndDelete(cls);
    }
    await Promise.all([institute.save(), department.save()]);
    await Batch.findByIdAndDelete(req.params.bid);
    res.status(200).send({
      message: "batch deleted successfully👍",
      deleted: "Yes",
    });
  } catch (e) {
    console.log(e)
    res.status(200).send({
      message: e,
      deleted: "No",
    });
  }
};

exports.classMasterDelete = async (req, res) => {
  try {
    if (!req.params.cmid) throw "Please send Class Master id to perform task";
    const classMaster = await ClassMaster.findById(req.params.cmid);
    if (classMaster?.classDivision?.length)
      throw "You can't delete class Master because class existence";
    await ClassMaster.findByIdAndDelete(req.params.cmid);
    res.status(200).send({
      message: "Class Master Deleted successfully👍",
      deleted: "Yes",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
      deleted: "No",
    });
  }
};

exports.classDetail = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "classTeacher",
        select:
          "staffProfilePhoto photoId staffFirstName staffMiddleName staffLastName",
      })
      .select(
        "className classTitle classHeadTitle classTeacher masterClassName finalReportsSettings.aggregatePassingPercentage optionalSubjectCount"
      )
      .lean()
      .exec();
    // const cEncrypt = await encryptionPayload(classes);
    res.status(200).send({
      message: "Class details got successfully👍",
      classes,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.classEdit = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send Class id to perform task";
    var classes = await Class.findById(req.params.cid);
    var department = await Department.findById({
      _id: `${classes?.department}`,
    });
    var institute = await InstituteAdmin.findById(classes.institute);
    if (req.body.mcId) {
      const previousClassMaster = await ClassMaster.findById(
        classes.masterClassName
      );
      previousClassMaster?.classDivision?.pull(classes._id);
      await previousClassMaster.save();

      const classMaster = await ClassMaster.findById(req.body?.mcId);
      classMaster?.classDivision?.push(classes._id);
      classes.className = classMaster.className;
      classes.masterClassName = req.body?.mcId;
      await classMaster.save();
    }
    classes.finalReportsSettings.aggregatePassingPercentage =
      req.body?.aggregatePassingPercentage;
    classes.optionalSubjectCount = req.body?.optionalSubjectCount;
    if (req.body.classTitle) classes.classTitle = req.body?.classTitle;
    if (req.body.classHeadTitle)
      classes.classHeadTitle = req.body?.classHeadTitle;
    if (req.body.classTeacher) {
      if (classes?.classTeacher) {
        const previousStaff = await Staff.findById(classes.classTeacher);
        previousStaff.staffClass?.pull(classes._id);
        if (previousStaff?.staffDesignationCount > 0) {
          previousStaff.staffDesignationCount -= 1;
        }
        previousStaff.recentDesignation = "";
        await previousStaff.save();
      }
      const staff = await Staff.findById(req.body?.classTeacher);
      var user = await User.findById(staff.user);
      const notify = new Notification({});
      staff.staffClass.push(classes._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = classes.classHeadTitle;
      if (
        department?.departmentChatGroup?.length >= 1 &&
        department?.departmentChatGroup?.includes(`${staff._id}`)
      ) {
      } else {
        department?.departmentChatGroup?.push(staff._id);
        department.staffCount += 1;
        await department.save();
      }
      classes.classTeacher = staff._id;
      notify.notifyContent = `you got the designation of ${classes.className} as ${classes.classTitle}`;
      notify.notifySender = institute._id;
      notify.notifyCategory = "Class Designation";
      notify.notifyReceiever = user._id;
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
      await Promise.all([staff.save(), user.save(), notify.save()]);
    } else {
    }
    await classes.save();

    res.status(200).send({
      message: "class edited successfully👍",
    });
    designation_alarm(
      user?.userPhoneNumber,
      "CLASS",
      institute?.sms_lang,
      classes?.className,
      classes?.classTitle,
      ""
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "CLASS",
        institute?.sms_lang,
        classes?.className,
        classes?.classTitle,
        ""
      );
    }
  } catch (e) {
    res.status(200).send({
      message: e,
      edited: "No",
    });
  }
};

exports.classDelete = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";

    var classes = await Class.findById(req.params.cid);
    if (classes?.ApproveStudent?.length)
      throw "You can't delete class because students existence";
    if (classes?.subject?.length > 0) {
      for (let sub of classes?.subject) {
        const subject = await Subject.findById(sub);
        const subjectMaster = await SubjectMaster.findById(
          subject.subjectMasterName
        );
        subjectMaster?.subjects.pull(subject._id);
        subjectMaster.subjectCount -= 1;
        const subjectTeacherName = await Staff.findById(
          subject.subjectTeacherName
        );
        subjectTeacherName?.staffSubject.pull(subject._id);
        subjectTeacherName.staffDesignationCount -= 1;
        await Promise.all([subjectMaster.save(), subjectTeacherName.save()]);
        await Subject.findByIdAndDelete(sub);
      }
    }

    if (classes?.masterClassName) {
      var classMaster = await ClassMaster.findOne(classes?.masterClassName);
      if (classMaster) {
        classMaster?.classDivision?.pull(classes._id);
        if (classMaster?.classCount > 0) {
          classMaster.classCount -= 1;
        }
        await classMaster.save();
      }
    }
    if (classes?.classTeacher) {
      var classTeacher = await Staff.findById(classes?.classTeacher);
      classTeacher?.staffClass?.pull(classes._id);
      classTeacher.staffDesignationCount -= 1;
      await classTeacher.save();
    }
    if (classes?.institute) {
      const institute = await InstituteAdmin.findById(classes?.institute);
      institute?.classRooms?.pull(classes._id);
      const batch = await Batch.findById(classes.batch);
      batch?.classroom?.pull(classes._id);
      batch.classCount -= 1;
      const department = await Department.findById(classes.department);
      department?.class?.pull(classes._id);
      department.classCount -= 1;
      await Promise.all([institute.save(), batch.save(), department.save()]);
    }
    await Class.findByIdAndDelete(req.params.cid);
    res
      .status(200)
      .send({ message: "Class deleted successfully👍", deleted: "Yes" });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
      deleted: "No",
    });
  }
};

exports.subjectMasterDelete = async (req, res) => {
  try {
    if (!req.params.smid) throw "Please send subject master id to perform task";
    const subjectMaster = await SubjectMaster.findById(req.params.smid);
    if (subjectMaster?.subjects?.length)
      throw "You can't delete subject Master because subject existence";
    await SubjectMaster.findByIdAndDelete(req.params.smid);
    res.status(200).send({
      message: "Subject master deleted successfully👍",
      deleted: "Yes",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
      deleted: "No",
    });
  }
};

exports.subjectDetail = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send Subject id to perform task";
    const subject = await Subject.findById(req.params.sid)
      .populate({
        path: "subjectTeacherName",
        select:
          "staffProfilePhoto photoId staffFirstName staffMiddleName staffLastName",
      })
      .select(
        "subjectName subject_category subjectTitle subjectOptional subjectTeacherName subjectMasterName setting.subjectPassingMarks lecture_analytic practical_analytic tutorial_analytic selected_batch_query"
      )
      .populate({
        path: "selected_batch_query",
        select: "batchName batchStatus",
      })
      .lean()
      .exec();
    // const sEncrypt = await encryptionPayload(subject);
    res.status(200).send({
      message: "Subject details got successfully👍",
      subject,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
      detail: "No",
    });
  }
};

exports.subjectEdit = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send subject id to perform task";
    const { batch_arr, delete_arr } = req.body;
    var subject = await Subject.findById(req.params.sid);
    var classes = await Class.findById({ _id: `${subject?.class}` });
    var department = await Department.findById({
      _id: `${classes?.department}`,
    });
    var institute = await InstituteAdmin.findById(classes?.institute);
    // console.log(subject);
    if (req.body?.subjectTitle) {
      subject.subjectTitle = req.body?.subjectTitle;
    }
    if (req.body?.subject_category) {
      subject.subject_category = req.body?.subject_category;
    }
    if (subject?.subjectTeacherName) {
      const staff = await Staff.findById({ _id: subject?.subjectTeacherName });
      if (delete_arr?.length > 0) {
        for (var ref of delete_arr) {
          staff.staffBatch.pull(ref);
          subject.selected_batch_query = null;
        }
      }
      if (batch_arr?.length > 0) {
        for (var ref of batch_arr) {
          staff.staffBatch.push(ref);
          subject.selected_batch_query = ref;
        }
      }
      await Promise.all([staff.save(), subject.save()]);
    }
    subject.setting.subjectPassingMarks = req.body?.subjectPassingMarks;
    if (req.body?.smId) {
      const previousSubjectMaster = await SubjectMaster.findById(
        subject.subjectMasterName
      );
      previousSubjectMaster?.subjects?.pull(subject._id);
      await previousSubjectMaster.save();
      const subjectMaster = await SubjectMaster.findById(req.body?.smId);
      subject.subjectName = subjectMaster.subjectName;
      subject.subjectMasterName = req.body?.smId;
      subjectMaster?.subjects?.push(subject._id);
      await subjectMaster.save();
    }
    if (req?.body?.lecture_analytic) {
      subject.lecture_analytic = req.body?.lecture_analytic;
    }
    if (req?.body?.practical_analytic) {
      subject.practical_analytic = req.body?.practical_analytic;
    }
    if (req?.body?.tutorial_analytic) {
      subject.tutorial_analytic = req.body?.tutorial_analytic;
    }

    if (req.body?.sid) {
      if (subject?.subjectTeacherName) {
        const previousStaff = await Staff.findById(subject.subjectTeacherName);
        previousStaff.staffSubject?.pull(subject._id);
        if (previousStaff?.staffDesignationCount > 0) {
          previousStaff.staffDesignationCount -= 1;
        }
        previousStaff.recentDesignation = "";
        await previousStaff.save();
      }
      var staff = await Staff.findById(req.body?.sid);
      var user = await User.findById(staff.user);
      const notify = new Notification({});
      staff.staffSubject.push(subject._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = subject.subjectTitle;
      if (subject?.selected_batch_query) {
        if (staff?.staffBatch?.includes(`${subject?.selected_batch_query}`)) {
        } else {
          staff.staffBatch.push(subject?.selected_batch_query);
        }
      }
      subject.subjectTeacherName = staff._id;
      if (
        department?.departmentChatGroup?.length >= 1 &&
        department?.departmentChatGroup?.includes(`${staff?._id}`)
      ) {
      } else {
        department?.departmentChatGroup?.push(staff?._id);
        department.staffCount += 1;
        await department.save();
      }
      notify.notifyContent = `you got the designation of ${subject.subjectName} of ${classes?.className} as ${subject.subjectTitle}`;
      notify.notifySender = institute._id;
      notify.notifyCategory = "Subject Designation";
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = institute._id;
      await invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        subject.subjectName,
        user._id,
        user.deviceToken
      );
      await Promise.all([staff.save(), user.save(), notify.save()]);
    } else {
    }
    await subject.save();
    res.status(200).send({
      message: "Subject edited successfully👍",
    });
    designation_alarm(
      user?.userPhoneNumber,
      "SUBJECT",
      institute?.sms_lang,
      subject?.subjectName,
      subject?.subjectTitle,
      classes?.className
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "SUBJECT",
        institute?.sms_lang,
        subject?.subjectName,
        subject?.subjectTitle,
        classes?.className
      );
    }
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
      edited: "No",
    });
  }
};

exports.subjectDelete = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send subject id to perform task";
    const subject = await Subject.findById(req.params.sid).populate({
      path: "class",
      select: "ApproveStudent",
    });
    // const valid_subject_teacher = handle_undefined(subject?.subjectTeacherName)
    if (subject?.class?.ApproveStudent?.length)
      throw "You can't delete subject because students existence";
    const subjectMaster = await SubjectMaster.findById(
      subject.subjectMasterName
    );
    subjectMaster?.subjects.pull(subject._id);
    subjectMaster.subjectCount -= 1;
    const classes = await Class.findById(subject.class);
    classes?.subject.pull(subject._id);
    classes.subjectCount -= 1;
    if(subject?.subjectTeacherName){
      const subjectTeacherName = await Staff.findById(subject?.subjectTeacherName);
      subjectTeacherName.staffSubject.pull(subject._id);
      subjectTeacherName.staffDesignationCount -= 1;
      await subjectTeacherName.save()
    }

    await Promise.all([
      subjectMaster.save(),
      classes.save(),
    ]);
    await Subject.findByIdAndDelete(req.params.sid);
    res
      .status(200)
      .send({ message: "Subject deleted successfully👍", deleted: "Yes" });
  } catch (e) {
    console.log(e)
  }
};

exports.renderHostelbatchDelete = async (req, res) => {
  try {
    if (!req.params.bid) throw "Please send batch id to perform task";
    const batch = await Batch.findById(req.params.bid);
    if (batch?.ApproveStudent?.length)
      throw "You can't delete batch because students existence";
    const one_hostel = await Hostel.findById(batch.hostel);
    one_hostel?.batches?.pull(batch._id);
    one_hostel.batchCount -= 1;
    if (String(one_hostel.departmentSelectBatch) === String(batch._id)) {
      one_hostel.departmentSelectBatch = null;
    }
    await one_hostel.save();
    await Batch.findByIdAndDelete(req.params.bid);
    res.status(200).send({
      message: "batch deleted successfully👍",
      deleted: "Yes",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
      deleted: "No",
    });
  }
};

exports.renderTransportbatchDelete = async (req, res) => {
  try {
    if (!req.params.bid) throw "Please send batch id to perform task";
    const batch = await Batch.findById(req.params.bid);
    if (batch?.ApproveStudent?.length)
      throw "You can't delete batch because students existence";
    const one_trans = await Transport.findById(batch.transport);
    one_trans?.batches?.pull(batch._id);
    one_trans.batchCount -= 1;
    if (String(one_trans.departmentSelectBatch) === String(batch._id)) {
      one_trans.departmentSelectBatch = null;
    }
    await one_trans.save();
    await Batch.findByIdAndDelete(req.params.bid);
    res.status(200).send({
      message: "batch deleted successfully👍",
      deleted: "Yes",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
      deleted: "No",
    });
  }
};

// exports.classMasterDelete = async (req, res) => {
//   try {
//   } catch (e) {
//     console.log(e);
//   }
// };
// exports.subjectMasterDelete = async (req, res) => {
//   try {
//     if (!req.params.smid) throw "Please send subject id to perform task";
//     await SubjectMaster.findByIdAndUpdate(req.params.smid, req.body);
//     res.status(200).send({
//       message: "subject edited successfully👍",
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.classMasterEdit = async (req, res) => {
//   try {
//     if (!req.params.cmid) throw "Please send Class Master id to perform task";
//     const classMaster = await ClassMaster.findById(req.params.cmid);
//     if (classMaster?.classDivision?.length)
//       throw "You can't edit name because class existence";
//     classMaster.className = req.body.className;
//     await classMaster.save();
//     res.status(200).send({
//       message: "Class Master edited successfully👍",
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.subjectMasterEdit = async (req, res) => {
//   try {
//     if (!req.params.smid) throw "Please send subject master id to perform task";
//     const subjectMaster = await SubjectMaster.findById(req.params.smid);
//     if (subjectMaster?.subjects?.length)
//       throw "You can't edit name because subject existence";
//     subjectMaster.subjectName = req.body.subjectName;
//     await subjectMaster.save();
//     res.status(200).send({
//       message: "Subject master name edited successfully👍",
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.subjectDeleteAll = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send subject id to perform task";
    const classes = await Class.findById({ _id: req?.params?.cid })
    const subject = await Subject.find({ _id: { $in: classes?.subject }}).populate({
      path: "class",
      select: "ApproveStudent",
    });
    for(var ref of subject){
    const subjectMaster = await SubjectMaster.findById(
      ref?.subjectMasterName
    );
    subjectMaster?.subjects.pull(ref?._id);
    subjectMaster.subjectCount -= 1;
    const classes = await Class.findById(ref?.class);
    classes?.subject.pull(ref?._id);
    classes.subjectCount -= 1;

    await Promise.all([
      subjectMaster.save(),
      classes.save(),
    ]);
    await Subject.findByIdAndDelete(ref?._id);
    }
    res
      .status(200)
      .send({ message: "Subject deleted successfully👍", deleted: "Yes" });
  } catch (e) {
    console.log(e)
  }
};