const InstituteAdmin = require("../../models/InstituteAdmin");
const Finance = require("../../models/Finance");
const Student = require("../../models/Student");
const Hostel = require("../../models/Hostel/hostel");
const HostelUnit = require("../../models/Hostel/hostelUnit");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const Notification = require("../../models/notification");
const Admin = require("../../models/superAdmin");
const Income = require("../../models/Income");
const Batch = require("../../models/Batch");
const Expense = require("../../models/Expense");
const Class = require("../../models/Class");
const ClassMaster = require("../../models/ClassMaster");
const Fees = require("../../models/Fees");
const Department = require("../../models/Department");
const {
  uploadDocFile,
  getFileStream,
  deleteFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Payroll = require("../../models/Finance/Payroll");
const PayrollMaster = require("../../models/Finance/PayrollMaster");
const PayMaster = require("../../models/Finance/PayMaster");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const BusinessTC = require("../../models/Finance/BToC");
const FeeCategory = require("../../models/Finance/FeesCategory");
const FeeStructure = require("../../models/Finance/FeesStructure");
const FeeMaster = require("../../models/Finance/FeeMaster");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const Store = require("../../models/Finance/Inventory");
const BankAccount = require("../../models/Finance/BankAccount");
const { nested_document_limit } = require("../../helper/databaseFunction");
const {
  designation_alarm,
  email_sms_designation_alarm,
} = require("../../WhatsAppSMS/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const moment = require("moment");
const Admission = require("../../models/Admission/Admission");
const Library = require("../../models/Library/Library");
const { handle_undefined } = require("../../Handler/customError");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const RemainingList = require("../../models/Admission/RemainingList");
const {
  generate_hash_pass,
  installment_checker_query,
} = require("../../helper/functions");
const { render_finance_current_role } = require("../Moderator/roleController");
const {
  retro_student_heads_sequencing_query,
  retro_receipt_heads_sequencing_query,
} = require("../../helper/Installment");
const NewApplication = require("../../models/Admission/NewApplication");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");
const { universal_random_password } = require("../../Custom/universalId");
const IQAC = require("../../models/LandingModel/IQAC");
const CustomAuthority = require("../../models/LandingModel/CustomAuthority");


exports.render_new_iqac_query = async (req, res) => {
    try {
        const { id } = req.params;
        var institute = await InstituteAdmin.findById({ _id: id });
        var iqac = new IQAC({});
        institute.iqac_module.push(iqac._id);
        institute.iqac_module_status = "Enable";
        iqac.institute = institute._id;
        await Promise.all([institute.save(), iqac.save()]);
        // const fEncrypt = await encryptionPayload(iqac._id);
        res.status(200).send({
          message: "Successfully Assigned Staff",
          iqac: iqac._id,
          status: true,
        });
      } catch (e) {
        console.log(e);
      }
}

exports.render_master_query = async (req, res) => {
    try {
        const { qid } = req?.params
        if (!qid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const iqac = await IQAC.findById({ _id: qid })
        res.status(200).send({ message: "Explore IQAC Master Query", access: true, iqac})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_add_authority_query = async (req, res) => {
    try {
        const { qid } = req?.params
        if (!qid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false }) 

        const iq = await IQAC.findById({ _id: qid })
        const new_custom = new CustomAuthority({ ...req?.body })
        const staff = await Staff.findById({ _id: `${custom_head_person}`})
        new_custom.institute = iq?.institute
        new_custom.iqac = iq?._id
        iq.authority.push(new_custom?._id)
        iq.authority_count += 1
        staff.custom_authority.push(new_custom?._id)
        await Promise.all([iq.save(), new_custom.save(), staff.save()])
        res.status(200).send({ message: "Explore Add Custom Authority Query", access: true})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_authority_query = async (req, res) => {
    try {
        const { qid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!qid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false }) 

        const iq = await IQAC.findById({ _id: qid })
            
        const all_au = await CustomAuthority.find({ _id: { $in: iq?.authority } })
            .select("custom_head_name custom_title_person custom_head_person")
            .limit(limit)
            .skip(skip)
            .populate({
                path: "custom_head_person",
                select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId staffROLLNO"
            })
        if (all_au?.length > 0) {
        res.status(200).send({ message: "Explore All Authority Query", access: true, all_au: all_au})
            
        }
        else {
        res.status(200).send({ message: "No Authority Query", access: false, all_au})
            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_master_custom_query = async (req, res) => {
    try {
        const { qcid } = req?.params
        if (!qcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const custom = await CustomAuthority.findById({ _id: qcid })
        .populate({
            path: "custom_head_person",
            select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId staffROLLNO"
        })
        res.status(200).send({ message: "Explore custom Master Query", access: true, custom})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_add_composition_query = async (req, res) => {
    try {
        const { qcid } = req?.params
        const { staff_arr, student_arr } = req?.body
        if (!qcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false }) 

        const new_custom = await CustomAuthority.findById({ _id: qcid })
        if (staff_arr?.length > 0) {
            for (var val of staff_arr) {
                new_custom.composition.push({
                    staff: val?.staff,
                    designation: val?.designation
                })   
            }
        }
        if (student_arr?.length > 0) {
            for (var val of student_arr) {
                new_custom.composition.push({
                    student: val?.student,
                    designation: val?.designation
                })   
            }
        }
        await new_custom.save()
        res.status(200).send({ message: "Explore Add Custom Authority composition Query", access: true})
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_composition_query = async (req, res) => {
    try {
        const { qcid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!qcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false }) 

        const new_custom = await CustomAuthority.findById({ _id: qcid })
            .select("composition")
            .populate({
                path: "composition.staff",
                select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId staffROLLNO"
            })
            .populate({
                path: "composition.student",
                select: "studentFirstName studentMiddleName studentLastName studentProfilePhoto photoId studentGRNO"
            })
        var all_com = await nested_document_limit(page, limit, new_custom?.composition)
        if (all_com?.length > 0) {
        res.status(200).send({ message: "Explore All composition Query", access: true, all_com: all_com})
            
        }
        else {
        res.status(200).send({ message: "No composition Query", access: false})
            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_syllabus_feedback_object_query = async (req, res) => {
    try {
      const { qcid } = req?.params
      const { name, image, about, flow } = req?.body
      if (!qcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
      const custom = await CustomAuthority.findById({ _id: qcid })
      custom.syllabus_feedback_object.push({
        name: name,
        image: image,
          about: about,
        flow: flow
      })
      await custom.save()
      res.status(200).send({ message: "Syllabus Object Update Query", access: true})
  
    }
    catch (e) {
      console.log(e)
    }
  }
  
  exports.render_syllabus_feedback_nested_object_query = async (req, res) => {
    try {
      const { qcid, acid } = req?.params
      const { c_name, c_attach } = req?.body
      if (!qcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
      const custom = await CustomAuthority.findById({ _id: qcid })
      for (var val of custom?.syllabus_feedback_object) {
        if (`${val?._id}` === `${acid}`) {
          val.c_name = c_name
          val.c_attach = c_attach
          val.combined.push({
            c_name: c_name,
            c_attach: c_attach
          })
        }
      }
      await custom.save()
      res.status(200).send({ message: "Syllabus Nested Object Update Query", access: true})
  
    }
    catch (e) {
      console.log(e)
    }
  }

exports.render_add_documents_all_section_query = async (req, res) => {
    try {
        const { qcid } = req?.params
        const { name, attach, flow } = req?.body
        if (!qcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        var custom = await CustomAuthority.findById({ _id: qcid })
        if (flow === "ACADEMIC_CALENDAR") {
            custom.academic_calendar.push({
                name: name,
                attach: attach
            })
        }
        else if (flow === "IQAC_AQAR") {
            custom.iqac_aqar.push({
                name: name,
                attach: attach
            })
        }
        else if (flow === "IQAC_REPORTS") {
            custom.iqac_reports.push({
                name: name,
                attach: attach
            })
        }
        else if (flow === "SSR_REPORTS") {
            custom.ssr_reports.push({
                name: name,
                attach: attach
            })
        }
        else if (flow === "SSR_DOCUMENTS") {
            custom.ssr_documents.push({
                name: name,
                attach: attach
            })
        }
        else if (flow === "STUDENT_SATISFACTORY") {
            custom.student_satisfactory.push({
                name: name,
                attach: attach
            })
        }
        else if (flow === "ANNUAL_REPORTS") {
            custom.annual_reports.push({
                name: name,
                attach: attach
            })
        }
        else if (flow === "IDD") {
            custom.idd.push({
                name: name,
                attach: attach
            })
        }
        await custom.save()
        res.status(200).send({ message: `Add ${flow} Documents Query`, access: true})
    }
    catch (e) {
        console.log(e)
    }
}
  
exports.render_add_documents_section_query = async (req, res) => {
    try {
        const { qcid } = req?.params
        const { name, attach, description, flow } = req?.body
        if (!qcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        var custom = await CustomAuthority.findById({ _id: qcid })
        if (flow === "NAAC") {
            custom.naac.push({
                name: name,
                attach: attach,
                description: description
            })
        }
        else if (flow === "IQAC") {
            custom.iqac.push({
                name: name,
                attach: attach,
                description: description
            })
        }
        await custom.save()
        res.status(200).send({ message: `Add ${flow} Documents Query`, access: true})
    }
    catch (e) {
        console.log(e)
    }
  }
