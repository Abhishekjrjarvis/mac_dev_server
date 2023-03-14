const DepartmentSite = require("../../models/SiteModels/DepartmentSite");
const AdmissionSite = require("../../models/SiteModels/AdmissionSite");
const LibrarySite = require("../../models/SiteModels/LibrarySite");
const Department = require("../../models/Department");
const Admission = require("../../models/Admission/Admission");
const Library = require("../../models/Library/Library");
const { deleteFile } = require("../../S3Configuration");

exports.getDepartmentInfo = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const department = await Department.findById(did);
    if (department.site_info?.[0]) {
      const departmentSite = await DepartmentSite.findById(
        department.site_info[0]
      );
      res.status(200).send({
        message: "get Department site info detail 😋😊😋",
        department_site: departmentSite,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Department site info is not updated 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.updateDepartmentInfo = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const department = await Department.findById(did);
    if (department.site_info?.[0]) {
      const departmentSite = await DepartmentSite.findById(
        department.site_info[0]
      );
      departmentSite.department_vission = req.body.department_vission;
      departmentSite.department_mission = req.body.department_mission;
      departmentSite.department_about = req.body.department_about;
      departmentSite.department_hod_message = req.body.department_hod_message;
      departmentSite.department_image = req.body.department_image;
      for (let contact of req.body.edit_department_contact) {
        for (let cont of departmentSite.department_contact) {
          if (String(contact?.contactId) === String(cont?._id)) {
            cont.contact_department_name = contact.contact_department_name;
            cont.contact_person_name = contact.contact_person_name;
            cont.contact_person_mobile = contact.contact_person_mobile;
            cont.contact_person_email = contact.contact_person_email;
          }
        }
      }
      departmentSite.department_contact.push(...req.body.department_contact);
      await departmentSite.save();
      res.status(200).send({
        message: "Department site info is updated 😋😊😋",
        access: true,
      });
      if (req.body?.previousKey) await deleteFile(req.body.previousKey);

      // await DepartmentSite.findByIdAndUpdate(department.site_info[0], req.body);
    } else {
      const departmentSite = new DepartmentSite({
        department_vission: req.body.department_vission,
        department_mission: req.body.department_mission,
        department_about: req.body.department_about,
        department_hod_message: req.body.department_hod_message,
        department_image: req.body.department_image,
        department_contact: req.body.department_contact,
      });
      department.site_info.push(departmentSite?._id);
      await Promise.all([departmentSite.save(), department.save()]);
      res.status(200).send({
        message: "Department site info is updated first time 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAdmissionInfo = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const admission = await Admission.findById(aid);
    if (admission.site_info?.[0]) {
      const admissionSite = await AdmissionSite.findById(
        admission.site_info[0]
      );
      res.status(200).send({
        message: "get Admission site info detail 😋😊😋",
        admission_site: admissionSite,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Admission site info is not updated 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateAdmissonInfo = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const admission = await Admission.findById(aid);
    if (admission.site_info?.[0]) {
      const admissionSite = await AdmissionSite.findById(
        admission.site_info[0]
      );
      admissionSite.admission_about = req.body.admission_about;
      admissionSite.admission_process = req.body.admission_process;
      for (let contact of req.body.edit_admission_contact) {
        for (let cont of admissionSite.admission_contact) {
          if (String(contact?.contactId) === String(cont?._id)) {
            cont.contact_department_name = contact.contact_department_name;
            cont.contact_person_name = contact.contact_person_name;
            cont.contact_person_mobile = contact.contact_person_mobile;
            cont.contact_person_email = contact.contact_person_email;
          }
        }
      }
      admissionSite.admission_contact.push(...req.body.admission_contact);
      await admissionSite.save();
      res.status(200).send({
        message: "Admission site info is updated 😋😊😋",
        access: true,
      });
      // await DepartmentSite.findByIdAndUpdate(department.site_info[0], req.body);
    } else {
      const admissionSite = new AdmissionSite({
        admission_about: req.body.admission_about,
        admission_process: req.body.admission_process,
        admission_contact: req.body.admission_contact,
      });
      admission.site_info.push(admissionSite?._id);
      await Promise.all([admissionSite.save(), admission.save()]);
      res.status(200).send({
        message: "Admission site info is updated first time 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getLibraryInfo = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const library = await Library.findById(lid);
    if (library.site_info?.[0]) {
      const librarySite = await LibrarySite.findById(library.site_info[0]);
      res.status(200).send({
        message: "get Library site info detail 😋😊😋",
        library_site: librarySite,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Library site info is not updated 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateLibraryInfo = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const library = await Library.findById(lid);
    if (library.site_info?.[0]) {
      const librarySite = await LibrarySite.findById(library.site_info[0]);
      librarySite.library_message = req.body.library_message;
      librarySite.library_rule = req.body.library_rule;
      librarySite.library_timing = req.body.library_timing;
      librarySite.library_image = req.body.library_image;
      for (let contact of req.body.edit_library_contact) {
        for (let cont of librarySite.library_contact) {
          if (String(contact?.contactId) === String(cont?._id)) {
            cont.contact_department_name = contact.contact_department_name;
            cont.contact_person_name = contact.contact_person_name;
            cont.contact_person_mobile = contact.contact_person_mobile;
            cont.contact_person_email = contact.contact_person_email;
          }
        }
      }
      librarySite.library_contact.push(...req.body.library_contact);
      await librarySite.save();
      res.status(200).send({
        message: "Library site info is updated 😋😊😋",
        access: true,
      });
      if (req.body?.previousKey?.length) {
        for (let fileKey of req.body.previousKey) await deleteFile(fileKey);
      }
      // await DepartmentSite.findByIdAndUpdate(department.site_info[0], req.body);
    } else {
      const librarySite = new LibrarySite({
        library_message: req.body.library_message,
        library_rule: req.body.library_rule,
        library_timing: req.body.library_timing,
        library_image: req.body.library_image,
        library_contact: req.body.library_contact,
      });
      library.site_info.push(librarySite?._id);
      await Promise.all([librarySite.save(), library.save()]);
      res.status(200).send({
        message: "Library site info is updated first time 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
