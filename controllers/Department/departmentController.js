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
      "studentFormSetting"
    );
    res.status(200).send({
      message: "Explore Department Student form setting details Query",
      studentFormSetting: valid_depart?.studentFormSetting,
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
