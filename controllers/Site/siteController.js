const DepartmentSite = require("../../models/SiteModels/DepartmentSite");
const AdmissionSite = require("../../models/SiteModels/AdmissionSite");
const LibrarySite = require("../../models/SiteModels/LibrarySite");
const HostelSite = require("../../models/SiteModels/HostelSite");
const Department = require("../../models/Department");
const Admission = require("../../models/Admission/Admission");
const Library = require("../../models/Library/Library");
const Hostel = require("../../models/Hostel/hostel");
const InstituteAdmin = require("../../models/InstituteAdmin");
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
        related_department: department?._id,
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
      admissionSite.cashier_signature = req.body?.cashier_signature;
      admissionSite.cashier_name = req.body?.cashier_name;
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
      if (req.body?.previousKey) await deleteFile(req.body.previousKey);
    } else {
      const admissionSite = new AdmissionSite({
        admission_about: req.body.admission_about,
        admission_process: req.body.admission_process,
        admission_contact: req.body.admission_contact,
        related_admission: admission?._id,
        cashier_name: req.body?.cashier_name,
        cashier_signature: req.body?.cashier_signature,
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
        related_library: library?._id,
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

exports.getHostelInfo = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const hostel = await Hostel.findById(hid);
    if (hostel.site_info?.[0]) {
      const hostelSite = await HostelSite.findById(hostel.site_info[0]);
      res.status(200).send({
        message: "get Hostel site info detail 😋😊😋",
        hostel_site: hostelSite,
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

exports.updateHostelInfo = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const hostel = await Hostel.findById(hid);
    if (hostel.site_info?.[0]) {
      const hostelSite = await HostelSite.findById(hostel.site_info[0]);
      hostelSite.hostel_about = req.body.hostel_about;
      hostelSite.hostel_process = req.body.hostel_process;
      for (let contact of req.body.edit_hostel_contact) {
        for (let cont of hostelSite.hostel_contact) {
          if (String(contact?.contactId) === String(cont?._id)) {
            cont.contact_department_name = contact.contact_department_name;
            cont.contact_person_name = contact.contact_person_name;
            cont.contact_person_mobile = contact.contact_person_mobile;
            cont.contact_person_email = contact.contact_person_email;
          }
        }
      }
      hostelSite.hostel_contact.push(...req.body.hostel_contact);
      await hostelSite.save();
      res.status(200).send({
        message: "Hostel site info is updated 😋😊😋",
        access: true,
      });
      // await DepartmentSite.findByIdAndUpdate(department.site_info[0], req.body);
    } else {
      const hostelSite = new HostelSite({
        hostel_about: req.body.hostel_about,
        hostel_process: req.body.hostel_process,
        hostel_contact: req.body.hostel_contact,
        related_hostel: hostel?._id,
      });
      hostel.site_info.push(hostelSite?._id);
      await Promise.all([hostelSite.save(), hostel.save()]);
      res.status(200).send({
        message: "Hostel site info is updated first time 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getInstituteSiteOpeners = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const institute = await InstituteAdmin.findById(id).select(
      "site_flash_notice"
    );
    res.status(200).send({
      message: "get institute site opener detail 😋😊😋",
      institute: institute ?? null,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.updateInstituteSiteOpeners = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });

    const institute = await InstituteAdmin.findById(id);

    for (let flash of req.body?.flash_notice) {
      if (flash?.flashId) {
        for (let a_flash of institute.site_flash_notice) {
          if (String(a_flash?._id) === String(flash?.flashId)) {
            a_flash.notice_title = flash.notice_title;
            a_flash.notice_image = flash.notice_image;
            a_flash.notice_button_name = flash.notice_button_name;
            a_flash.notice_button_link = flash.notice_button_link;
          }
        }
      } else {
        institute.site_flash_notice.push({
          notice_title: flash.notice_title,
          notice_image: flash.notice_image,
          notice_button_name: flash.notice_button_name,
          notice_button_link: flash.notice_button_link,
        });
      }
    }

    await institute.save();
    res.status(200).send({
      message: "flash notices edited successful. 😙",
      access: true,
    });
    if (req.body?.previousKey) await deleteFile(req.body.previousKey);
  } catch (e) {
    console.log(e);
  }
};
