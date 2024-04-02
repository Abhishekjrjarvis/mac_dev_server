const Subject = require("../../models/Subject");
const InstituteAdmin = require("../../models/InstituteAdmin");

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
      const subject = await Subject.findById(sid).populate({
        path: "class",
        select: "institute",
      });
      const inst = await InstituteAdmin.findById(
        subject?.class?.institute
      ).select("subject_tab_manage");
      res.status(200).send({
        message: "Subject Tab Manage toggle",
        tab_manage: inst.subject_tab_manage,
      });
    } else {
      const inst = await InstituteAdmin.findById(sid).select(
        "subject_tab_manage"
      );
      res.status(200).send({
        message: "Subject Tab Manage toggle",
        tab_manage: inst.subject_tab_manage,
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

