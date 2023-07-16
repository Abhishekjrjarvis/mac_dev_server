const { generate_random_code } = require("../../helper/functions");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");

exports.renderSearchInstituteByCodeQuery = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code)
      return res.status(200).send({
        message: "I Think you did not know. what you want to search",
        access: false,
      });
    var valid_ins = await InstituteAdmin.findOne({
      random_institute_code: code,
    }).select(
      "insName insProfilePhoto photoId name status financeDepart admissionDepart hostelDepart"
    );

    if (valid_ins) {
      res.status(200).send({
        message: "Explore Institute By Its Code",
        access: true,
        valid_ins: valid_ins,
      });
    } else {
      res.status(200).send({
        message: "You are lost in space 🌌",
        access: false,
        valid_ins: "",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderSearchStudentByGRQuery = async (req, res) => {
  try {
    const { gr, id } = req.query;
    if (!gr && !id)
      return res.status(200).send({
        message: "I Think you did not know. what you want to search",
        access: false,
      });
    var valid_student = await Student.findOne({
      $and: [
        { studentGRNO: gr },
        { institute: id },
        { studentStatus: "Approved" },
      ],
    })
      .select(
        "studentFirstName studentMiddleName studentLastName studentProfilePhoto valid_full_name studentGRNO"
      )
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "institute",
        select: "financeDepart admissionDepart hostelDepart",
      });

    if (valid_student) {
      res.status(200).send({
        message: "Explore Student By Its GR",
        access: true,
        valid_student: valid_student,
      });
    } else {
      res.status(200).send({
        message: "You are lost in space 🌌",
        access: false,
        valid_student: "",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewCodeQuery = async (req, res) => {
  try {
    var all = await InstituteAdmin.find({}).select(
      "random_institute_code insName"
    );

    // for (var ref of all) {
    //   var code = await generate_random_code();
    //   ref.random_institute_code = `${code}`;
    //   await ref.save();
    // }

    res.status(200).send({ message: "New Code", all: all });
  } catch (e) {
    console.log(e);
  }
};
