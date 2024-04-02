const Department = require("../../models/Department");
const InstituteAdmin = require("../../models/InstituteAdmin");

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


exports.getDepartmentTabManageQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { flow } = req.query;
    if (!did) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    if (flow === "Department") {
      const department = await Department.findById(did);
      const inst = await InstituteAdmin.findById(department.institute).select(
        "department_tab_manage"
      );
      res.status(200).send({
        message: "Department Tab Manage toggle",
        tab_manage: inst?.department_tab_manage,
      });
    } else {
      const inst = await InstituteAdmin.findById(did).select(
        "department_tab_manage"
      );
      res.status(200).send({
        message: "Department Tab Manage toggle",
        tab_manage: inst?.department_tab_manage,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.updateDepartmentTabManageQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    await InstituteAdmin.findByIdAndUpdate(did, req.body);
    res.status(200).send({
      message: "Department Tab Manage toggle updated",
    });
  } catch (e) {
    console.log(e);
  }
};


