const Checklist = require("../../models/Checklist");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Notification = require("../../models/notification");

exports.viewDepartment = async (req, res) => {
  const department = await Department.findById(req.params.did);
  res.status(200).send({ department });
};

exports.getAllChecklistClass = async (req, res) => {
  try {
    // const page = req.query.page ? parseInt(req.query.page) : 1;
    // const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // const skip = (page - 1) * limit;
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "checklist",
        select: "checklistName checklistAmount createdAt",
      })
      .select("checklist")
      .lean()
      .exec();
    // .limit(limit)
    // .skip(skip);
    res
      .status(200)
      .send({ message: "checklist data", checklist: classes.checklist });
  } catch {}
};
exports.createChecklist = async (req, res) => {
  try {
    const { did } = req.params;
    const { ClassId } = req.body;
    const department = await Department.findById({ _id: did }).populate({
      path: "ApproveStudent",
      select: "_id",
    });

    const check = new Checklist(req.body);
    department.checklists.push(check._id);
    check.checklistDepartment = department._id;

    await department.save();
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      classes.checklist.push(check._id);
      check.checklistClass = classes._id;
      await classes.save();
      await check.save();
    }
    for (let i = 0; i < department.ApproveStudent.length; i++) {
      const student = await Student.findById({
        _id: department.ApproveStudent[i]._id,
      }).populate({
        path: "user",
        select: "_id",
      });
      const user = await User.findById({ _id: `${student.user._id}` });
      const notify = new Notification({});
      notify.notifyContent = `New ${check.checklistName} (checklist) has been created. check your member's Tab`;
      notify.notifySender = did;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByDepartPhoto = department._id;
      await Promise.all([user.save(), notify.save()]);
    }
    res.status(201).send({ message: "Checklist Created", checklist: check });
  } catch {}
};

exports.getOneChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.cid)
      .populate({
        path: "student",
        select:
          "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentROLLNO",
      })
      .select("_id")
      .lean()
      .exec();
    res.status(200).send({ message: "Checklist Data", checklist });
  } catch {}
};

exports.studentAssignChecklist = async (req, res) => {
  try {
    const { sid, cid } = req.params;
    const student = await Student.findById({ _id: sid }).populate({
      path: "user",
      select: "_id",
    });
    const user = await User.findById({ _id: `${student.user._id}` });
    const checklist = await Checklist.findById({ _id: cid });
    const notify = new Notification({});
    student.checklist.push(checklist._id);
    student.checklistAllottedStatus = "Allotted";
    checklist.student.push(student._id);
    checklist.studentAssignedStatus = "Assigned";
    notify.notifyContent = `${checklist.checklistName} (checklist) Allotted to you check your member's Tab`;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    await Promise.all([
      student.save(),
      checklist.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({ message: "checklist Assigned" });
  } catch {}
};

exports.updateChecklist = async (req, res) => {
  try {
    await Checklist.findByIdAndUpdate(req.params.cid, req.body);
    res.status(200).send({
      message: "checklist is updated succefully",
    });
  } catch {}
};

exports.getAllChecklistDepartment = async (req, res) => {
  try {
    // const page = req.query.page ? parseInt(req.query.page) : 1;
    // const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // const skip = (page - 1) * limit;
    const department = await Department.findById(req.params.did)
      .populate({
        path: "checklists",
        select: "checklistName checklistAmount createdAt",
      })
      .select("checklists")
      .lean()
      .exec();
    // .limit(limit)
    // .skip(skip);
    res.status(200).send({
      message: "checklist data",
      checklist: department.checklists,
    });
  } catch (e) {
    console.log(e);
  }
};

// exports.delChecklist = async (req, res) => {
//   try {
//     await Checklist.findByIdAndDelete(req.params.cid);
//     res.status(200).send({
//       message: "deleted",
//     });
//   } catch {}
// };
