const {
  generate_random_code,
  generateAccessInsToken,
} = require("../../helper/functions");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");

exports.renderSearchInstituteByCodeQuery = async (req, res) => {
  try {
    const { code, gr } = req.body;
    if (!code && !gr)
      return res.status(200).send({
        message: "I Think you did not know. what you want to search",
        access: false,
      });
    var valid_ins = await InstituteAdmin.findOne({
      random_institute_code: code,
    }).select(
      "insName insProfilePhoto photoId name status insPassword financeDepart admissionDepart hostelDepart"
    );

    if (valid_ins) {
      var valid_student = await Student.findOne({
        $and: [
          { institute: valid_ins?._id },
          { studentStatus: "Approved" },
        ],
        $or: [
          { studentGRNO: gr },
          { qviple_student_pay_id: gr },
        ]
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentProfilePhoto valid_full_name studentGRNO qviple_student_pay_id"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle",
        });
      if (valid_student) {
        const token = generateAccessInsToken(
          valid_ins?.name,
          valid_ins?._id,
          valid_ins?.insPassword
        );
        res.status(200).send({
          message: "Explore Student By Its GR and Institute",
          access: true,
          valid_student: valid_student,
          valid_ins: valid_ins,
          token: `Bearer ${token}`,
          login: true,
        });
        valid_student.pay_as_a_guest = "Guested";
        await valid_student.save();
      } else {
        res.status(200).send({
          message: "You are lost in space 🌌 Invalid GR",
          access: false,
          valid_student: "",
        });
      }
    } else {
      res.status(200).send({
        message: "You are lost in space 🌌 Invalid Code",
        access: false,
        valid_ins: "",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderSearchInstituteCodeQuery = async (req, res) => {
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
      "insName insProfilePhoto photoId name financeDepart admissionDepart hostelDepart"
    );

    if (valid_ins) {
      res.status(200).send({
        message: "Explore Institute By Its Code",
        access: true,
        valid_ins: valid_ins,
      });
    } else {
      res.status(200).send({
        message: "You are lost in space 🌌 Invalid Code",
        access: false,
        valid_ins: "",
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
