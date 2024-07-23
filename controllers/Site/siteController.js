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
const Transport = require("../../models/Transport/transport");
const TransportSite = require("../../models/SiteModels/TransportSite");
const AcademicNestedPage = require("../../models/LandingModel/AcademicNestedPage");
const { nested_document_limit } = require("../../helper/databaseFunction");
const Activity = require("../../models/LandingModel/RND/Activity");
const Staff = require("../../models/Staff");
const Batch = require("../../models/Batch");


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
      )
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
        department_site_status: department?.department_status
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
      hostelSite.cashier_signature = req.body?.cashier_signature;
      hostelSite.cashier_name = req.body?.cashier_name;
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
      if (req.body?.previousKey) await deleteFile(req.body.previousKey);

      // await DepartmentSite.findByIdAndUpdate(department.site_info[0], req.body);
    } else {
      const hostelSite = new HostelSite({
        hostel_about: req.body.hostel_about,
        hostel_process: req.body.hostel_process,
        hostel_contact: req.body.hostel_contact,
        related_hostel: hostel?._id,
        cashier_name: req.body?.cashier_name,
        cashier_signature: req.body?.cashier_signature,
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

exports.trashInstituteSiteOpeners = async (req, res) => {
  try {
    const { id } = req.params;
    const { fid } = req.body;
    if (!id || !fid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const institute = await InstituteAdmin.findById(id).select(
      "site_flash_notice"
    );
    let remain_flash = [];
    for (let rflash of institute?.site_flash_notice) {
      if (`${rflash?._id}` === `${fid}`) {
      } else {
        remain_flash.push(rflash);
      }
    }
    institute.site_flash_notice = remain_flash;
    remain_flash = [];
    await institute.save();
    res.status(200).send({
      message: "trash institute site opener detail 😋😊😋",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getTransportInfo = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const trans = await Transport.findById(tid);
    if (trans.site_info?.[0]) {
      const transSite = await TransportSite.findById(trans.site_info[0]);
      res.status(200).send({
        message: "get Transport site info detail 😋😊😋",
        trans_site: transSite,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Transport site info is not updated 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateTransportInfo = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "You fetch api with proper knownledge",
        access: true,
      });
    const trans = await Transport.findById(tid);
    if (trans.site_info?.[0]) {
      const transSite = await TransportSite.findById(trans.site_info[0]);
      transSite.transport_about = req.body.transport_about;
      transSite.transport_process = req.body.transport_process;
      transSite.cashier_signature = req.body?.cashier_signature;
      transSite.cashier_name = req.body?.cashier_name;
      for (let contact of req?.body?.edit_transport_contact) {
        for (let cont of transSite?.transport_contact) {
          if (String(contact?.contactId) === String(cont?._id)) {
            cont.contact_department_name = contact.contact_department_name;
            cont.contact_person_name = contact.contact_person_name;
            cont.contact_person_mobile = contact.contact_person_mobile;
            cont.contact_person_email = contact.contact_person_email;
          }
        }
      }
      transSite.transport_contact.push(...req?.body?.transport_contact);
      await transSite.save();
      res.status(200).send({
        message: "Transport site info is updated 😋😊😋",
        access: true,
      });
      // await DepartmentSite.findByIdAndUpdate(department.site_info[0], req.body);
    } else {
      const transSite = new TransportSite({
        transport_about: req?.body?.transport_about,
        transport_process: req?.body?.transport_process,
        transport_contact: req?.body?.transport_contact,
        related_transport: trans?._id,
        cashier_name: req.body?.cashier_name,
        cashier_signature: req.body?.cashier_signature,
      });
      trans.site_info.push(transSite?._id);
      await Promise.all([transSite.save(), trans.save()]);
      res.status(200).send({
        message: "Transport site info is updated first time 😋😊😋",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_department_extra_docs_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { flow, title, image, description } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var d_site = await DepartmentSite.findById({ _id: dsid })
    if (flow === "PROFESSIONAL_BODY") {
      d_site.professional_body.push({
        title: title,
        description: description,
        image: image
      })
    } else if (flow === "STUDENT_ASSOCIATIONS") {
      d_site.student_associations.push({
        title: title,
        description: description,
        image: image
      })
    }
    else if (flow === "STUDENT_ACHIEVEMENTS") {
      d_site.student_achievements.push({
        title: title,
        description: description,
        image: image
      })
    }
    else if (flow === "INNOVATIVE_PRACTICES") {
      d_site.innovative_practices.push({
        title: title,
        description: description,
        image: image
      })
    }
    await d_site.save()
    res.status(200).send({ message: "Explore Department Site Updated Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_department_syllabus_projects_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { flow, name, attach } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var d_site = await DepartmentSite.findById({ _id: dsid })
    if (flow === "SYLLABUS") {
      d_site.syllabus.push({
        name: name,
        attach: attach
      })
    } else if (flow === "PROJECTS") {
      d_site.projects.push({
        name: name,
        attach: attach
      })
    }
    await d_site.save()
    res.status(200).send({ message: "Explore Department Site Updated Syllabus + Projects Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_department_pso_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { title, description } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

    var d_site = await DepartmentSite.findById({ _id: dsid })
    d_site.po_pso.push({
      title: title,
      description: description
    })
    await d_site.save()
    res.status(200).send({ message: "Explore Department Site Updated PO / PSO Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_department_edit_extra_docs_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { flow, title, image, description, cid } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var d_site = await DepartmentSite.findById({ _id: dsid })
    if (flow === "PROFESSIONAL_BODY") {
      for (let ele of d_site?.professional_body) {
        if (`${ele?._id}` === `${cid}`) {
          ele.title = title ? title : ele?.title
          ele.description = description ? description : ele?.description
          ele.image = image ? image : ele?.image
        }
      }
    } else if (flow === "STUDENT_ASSOCIATIONS") {
      for (let ele of d_site?.student_associations) {
        if (`${ele?._id}` === `${cid}`) {
          ele.title = title ? title : ele?.title
          ele.description = description ? description : ele?.description
          ele.image = image ? image : ele?.image
        }
      }
    }
    else if (flow === "STUDENT_ACHIEVEMENTS") {
      for (let ele of d_site?.student_achievements) {
        if (`${ele?._id}` === `${cid}`) {
          ele.title = title ? title : ele?.title
          ele.description = description ? description : ele?.description
          ele.image = image ? image : ele?.image
        }
      }
    }
    else if (flow === "INNOVATIVE_PRACTICES") {
      for (let ele of d_site?.innovative_practices) {
        if (`${ele?._id}` === `${cid}`) {
          ele.title = title ? title : ele?.title
          ele.description = description ? description : ele?.description
          ele.image = image ? image : ele?.image
        }
      }
    }
    await d_site.save()
    res.status(200).send({ message: "Explore Edit Department Site Updated Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_department_edit_syllabus_projects_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { flow, name, attach, cid } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var d_site = await DepartmentSite.findById({ _id: dsid })
    if (flow === "SYLLABUS") {
      for (let ele of d_site?.syllabus) {
        if (`${ele?._id}` === `${cid}`) {
          ele.name = name ? name : ele?.name
          ele.attach = attach ? attach : ele?.attach
        }
      }
    } else if (flow === "PROJECTS") {
      for (let ele of d_site?.projects) {
        if (`${ele?._id}` === `${cid}`) {
          ele.name = name ? name : ele?.name
          ele.attach = attach ? attach : ele?.attach
        }
      }
    }
    await d_site.save()
    res.status(200).send({ message: "Explore Edit Department Site Updated Syllabus + Projects Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_department_edit_pso_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { title, description, cid } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

    var d_site = await DepartmentSite.findById({ _id: dsid })
    for (let ele of d_site?.po_pso) {
      if (`${ele?._id}` === `${cid}`) { 
        ele.title = title ? title : ele?.title
        ele.description = description ? description : ele?.description
      }
    }
    await d_site.save()
    res.status(200).send({ message: "Explore Edit Department Site Updated PO / PSO Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_department_delete_extra_docs_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { cid, flow } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var d_site = await DepartmentSite.findById({ _id: dsid })
    if (flow === "PROFESSIONAL_BODY") {
      for (let ele of d_site?.professional_body) {
        if (`${ele?._id}` === `${cid}`) {
          d_site?.professional_body.pull(ele?._id)
        }
      }
    } else if (flow === "STUDENT_ASSOCIATIONS") {
      for (let ele of d_site?.student_associations) {
        if (`${ele?._id}` === `${cid}`) {
          d_site?.student_associations.pull(ele?._id)
        }
      }
    }
    else if (flow === "STUDENT_ACHIEVEMENTS") {
      for (let ele of d_site?.student_achievements) {
        if (`${ele?._id}` === `${cid}`) {
          d_site?.student_achievements.pull(ele?._id)
        }
      }
    }
    else if (flow === "INNOVATIVE_PRACTICES") {
      for (let ele of d_site?.innovative_practices) {
        if (`${ele?._id}` === `${cid}`) {
          d_site?.innovative_practices.pull(ele?._id)
        }
      }
    }
    await d_site.save()
    res.status(200).send({ message: "Explore Delete Department Site Updated Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_department_delete_syllabus_projects_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { cid, flow } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var d_site = await DepartmentSite.findById({ _id: dsid })
    if (flow === "SYLLABUS") {
      for (let ele of d_site?.syllabus) {
        if (`${ele?._id}` === `${cid}`) {
          d_site?.syllabus.pull(ele?._id)
        }
      }
    } else if (flow === "PROJECTS") {
      for (let ele of d_site?.projects) {
        if (`${ele?._id}` === `${cid}`) {
          d_site?.projects.pull(ele?._id)
        }
      }
    }
    await d_site.save()
    res.status(200).send({ message: "Explore Delete Department Site Updated Syllabus + Projects Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_department_delete_pso_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { cid } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

    var d_site = await DepartmentSite.findById({ _id: dsid })
    for (let ele of d_site?.po_pso) {
      if (`${ele?._id}` === `${cid}`) { 
        d_site?.po_pso.pull(ele?._id)
      }
    }
    await d_site.save()
    res.status(200).send({ message: "Explore Delete Department Site Updated PO / PSO Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_edit_academic_sub_head_query = async (req, res) => {
  try {
    const { dsid } = req?.params
    const { sub_head_title, sub_heading_image, sub_head_body } = req?.body
    if (!dsid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const site = await DepartmentSite.findById({ _id: dsid })
    site.about.push({
      sub_head_title: sub_head_title,
      sub_heading_image: sub_heading_image,
      sub_head_body: sub_head_body
    })
    await site.save()
    res.status(200).send({ message: "Explore Sub Head Edit Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_add_mou_collab_query = async (req, res) => {
  try {
    const { did } = req?.params
    const { srn, org_name, institution_industry, durations, link, attach, batch, student_count, staff_count } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const depart = await Department.findById({ _id: did })
    depart.mou_collab.push({
      srn: srn,
      org_name: org_name,
      institution_industry: institution_industry,
      durations: durations,
      link: link ?? "",
      attach: attach ?? "",
      batch: batch,
      student_count: student_count,
      staff_count: staff_count
    })
    await depart.save()
    res.status(200).send({ message: "Explore All Mou/Collab Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_mou_query = async (req, res) => {
  try {
    const { did } = req?.params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { batch } = req?.query
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    var site = await Department.findById({ _id: did })
      .populate({
        path: "mou_collab",
        populate: {
          path: "batch",
          select: "batchName batchStatus"
        }
      })
      .populate({
        path: "mou_collab",
        populate: {
          path: "activities",
          select: "activity_name activity_type"
        }
    })
    if (batch) {
      var nums = site?.mou_collab?.filter((ele) => {
        if (`${ele?.batch?._id}` === `${batch}`) return ele
      })
      var all_mou = await nested_document_limit(page, limit, nums)
    }
    else {
      var all_mou = await nested_document_limit(page, limit, site?.mou_collab)
    }
    res.status(200).send({ message: "Explore All MOU / Collab Query", access: true, all_mou: all_mou})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_edit_mou_collab_query = async (req, res) => {
  try {
    const { did } = req?.params
    const { srn, org_name, institution_industry, durations, link, attach, batch, student_count, staff_count, mid } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const depart = await Department.findById({ _id: did })
    for (let ele of depart?.mou_collab) {
      if (`${ele?._id}` === `${mid}`) {
        ele.srn = srn
        ele.org_name = org_name
        ele.institution_industry = institution_industry
        ele.durations = durations
        ele.link = link ?? ""
        ele.attach = attach ?? ""
        ele.batch = batch
        ele.student_count = student_count
        ele.staff_count = staff_count
      }
    }
    await depart.save()
    res.status(200).send({ message: "Explore Edit Mou/Collab Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_delete_mou_collab_query = async (req, res) => {
  try {
    const { did } = req?.params
    const { mid } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const depart = await Department.findById({ _id: did })
    for (let ele of depart?.mou_collab) {
      if (`${ele?._id}` === `${mid}`) {
        depart?.mou_collab?.pull(ele?._id)
      }
    }
    await depart.save()
    res.status(200).send({ message: "Explore Delete Mou/Collab Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_universal_batch_query = async (req, res) => {
  try {
    const { did } = req?.params
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const depart = await Department.findById({ _id: did })
    const all_batch = await Batch.find({ $and: [{ department: depart?._id }, { merged_batch: "Merged" }] })
      .select("_id u_batch")
      .populate({
        path: "u_batch",
        select: "batchName batchStatus"
      })
    res.status(200).send({ message: "Explore All Site Batches Query", access: true, all_batch: all_batch})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_add_activity_query = async (req, res) => {
  try {
    const { did } = req?.params
    const { staff_id, mid } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const depart = await Department.findById({ _id: did })
    const staff = await Staff.findById({ _id: staff_id })
    const new_act = new Activity({ ...req?.body })
    new_act.activity_staff = staff?._id
    new_act.activity_department = depart?._id
    depart.activity.push(new_act?._id)
    staff.activity.push(new_act?._id)
    if (mid) {
      for (let val of depart?.mou_collab) {
        if (`${val?._id}` === `${mid}`) {
          val.activities = new_act?._id
        }
      }
    }
    await Promise.all([ depart.save(), staff.save(), new_act.save() ])
    res.status(200).send({ message: "Explore Add Activity Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_activity_query = async (req, res) => {
  try {
    const { sid, flow } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    if (flow === "STAFF") {
      const staff = await Staff.findById({ _id: sid })
      const all_act = await Activity.find({ _id: { $in: staff?.activity } })
        .select("activity_name activity_type")
        .populate({
          path: "activity_staff",
          select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId staffGender staffROLLNO"
        })
        .populate({
          path: "activity_department",
          select: "dName"
        })
        .populate({
          path: "activity_batch",
          select: "batchName"
        })
        .limit(limit)
        .skip(skip)
    res.status(200).send({ message: "Explore All Activity Query", access: true, all_act: all_act})
      
    }
    else if (flow === "DEPARTMENT") {
      const depart = await Department.findById({ _id: sid })
      const all_act = await Activity.find({ _id: { $in: depart?.activity } })
        .select("activity_name activity_type")
        .populate({
          path: "activity_staff",
          select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId staffGender staffROLLNO"
        })
        .populate({
          path: "activity_department",
          select: "dName"
        })
        .populate({
          path: "activity_batch",
          select: "batchName"
        })
        .limit(limit)
        .skip(skip)
    res.status(200).send({ message: "Explore All Activity Query", access: true, all_act: all_act})
      
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_activity_query_type = async (req, res) => {
  try {
    const { id, type } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

      const ins = await InstituteAdmin.findById({ _id: id })
      const all_act = await Activity.find({ $and: [{ activity_department: { $in: ins?.depart }}, { activity_type: type }] })
        .select("activity_name activity_type")
        .populate({
          path: "activity_staff",
          select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId staffGender staffROLLNO"
        })
        .populate({
          path: "activity_department",
          select: "dName"
        })
        .populate({
          path: "activity_batch",
          select: "batchName"
        })
        .limit(limit)
        .skip(skip)
    res.status(200).send({ message: "Explore All Activity Query", access: true, all_act: all_act})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_activity_query = async (req, res) => {
  try {
    const { acid } = req?.params
    if (!acid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

    const act = await Activity.findById({ _id: acid })
    .populate({
      path: "activity_staff",
      select: "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId staffGender staffROLLNO"
    })
    .populate({
      path: "activity_department",
      select: "dName"
    })
    .populate({
      path: "activity_batch",
      select: "batchName"
    })
    res.status(200).send({ message: "Explore One Activity Query", access: true, act: act})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_delete_activity_query = async (req, res) => {
  try {
    const { acid } = req?.params
    if (!acid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

    const act = await Activity.findById({ _id: acid })
    const depart = await Department.findById({ _id: act?.activity_department })
    const staff = await Staff.findById({ _id: act?.activity_staff })

    staff.activity.pull(act?._id)
    depart.activity.pull(act?._id)
    await Promise.all([staff.save(), depart.save()])
    await Activity.findByIdAndDelete(acid)
    res.status(200).send({ message: "Explore One Activity Delete Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_add_activity_documents_query = async (req, res) => {
  try {
    const { acid } = req?.params
    const { name, attach, flow } = req?.body
    if (!acid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

    var act = await Activity.findById({ _id: acid })
    if (flow === "NOTICE") {
      act.notice.push(attach)
    }
    else if (flow === "PERMISSION_LETTER") {
      act.permission_letter.push(attach)
    }
    else if (flow === "ACTIVITY_REPORTS") {
      act.activity_report.push(attach)
    }
    else if (flow === "ATTENDANCE") {
      act.attendance.push(attach)
    }
    else if (flow === "OTHER") { 
      act.other.push({
        name: name,
        attach: attach
      })
    }
    await act.save()
    res.status(200).send({ message: "Explore One Activity Documents Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_add_projects_query = async (req, res) => {
  try {
    const { did } = req?.params
    const { srn, title, student, classes, subject, guide_name, link, attach, abstract, department, sid } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const depart = await Department.findById({ _id: did })
    const staff = await Staff.findById({ _id: sid })
    depart.projects.push({
      srn: srn,
      title: title,
      student: student,
      link: link,
      attach: attach,
      classes: classes,
      subject: subject,
      guide_name: guide_name,
      abstract: abstract,
      department: department
    })
    staff.projects.push({
      srn: srn,
      title: title,
      student: student,
      link: link,
      attach: attach,
      classes: classes,
      subject: subject,
      guide_name: guide_name,
      abstract: abstract,
      department: department
    })
    await Promise.all([ staff.save(), depart.save()])
    res.status(200).send({ message: "Explore Add Projects Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_projects_query = async (req, res) => {
  try {
    const { did, flow } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

    if (flow === "DEPARTMENT") {
      const depart = await Department.findById({ _id: did })
      .populate({
        path: "projects",
        populate: {
            path: "student classes department",
            select: "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO className classTitle dName"
        }
})
      const all_act = await nested_document_limit(page, limit, depart?.projects)
      res.status(200).send({ message: "Explore All Projects Department Query", access: true, all_act: all_act })
    }
    else if (flow === "STAFF") {
      const staff = await Staff.findById({ _id: did })
      .populate({
        path: "projects",
        populate: {
            path: "student classes department",
            select: "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO className classTitle dName"
        }
})
      const all_act = await nested_document_limit(page, limit, staff?.projects)
      res.status(200).send({ message: "Explore All Projects Satff Query", access: true, all_act: all_act })
    }
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_delete_projects_query = async (req, res) => {
  try {
    const { did } = req?.params
    const { pid, sid } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

    const depart = await Department.findById({ _id: did })
    const staff = await Staff.findById({ _id: sid })
    for (let val of depart?.projects) {
      if (`${val?._id}` === `${pid}`) {
        depart?.projects?.pull(val?._id)
      }
    }
    for (let val of staff?.projects) {
      if (`${val?._id}` === `${pid}`) {
        staff?.projects?.pull(val?._id)
      }
    }
    await Promise.all([ staff.save(), depart.save()])
    res.status(200).send({ message: "Explore One Projects Delete Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_add_hall_ticket_query = async (req, res) => {
  try {
    const { did } = req?.params
    const { name, attach } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const depart = await Department.findById({ _id: did })
    depart.hall_ticket.push({
      name: name,
      attach: attach
    })
    await depart.save()
    res.status(200).send({ message: "Explore Add Hall Ticket Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_hall_ticket_query = async (req, res) => {
  try {
    const { did, flow } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

      const depart = await Department.findById({ _id: did })
      const all_ticket = await nested_document_limit(page, limit, depart?.hall_ticket)
    res.status(200).send({ message: "Explore All Hall Ticket Query", access: true, all_ticket: all_ticket})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_delete_hall_ticket_query = async (req, res) => {
  try {
    const { did } = req?.params
    const { pid } = req?.body
    if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

    const depart = await Department.findById({ _id: did })
    for (let val of depart?.hall_ticket) {
      if (`${val?._id}` === `${pid}`) {
        depart?.hall_ticket?.pull(val?._id)
      }
    }
    await depart.save()
    res.status(200).send({ message: "Explore One Hall Ticket Delete Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_admission_video_gallery_query = async (req, res) => {
  try {
    const { aid } = req?.params
    const { title, video, link } = req?.body
    if (!aid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const ads = await AdmissionSite.findById({ _id: aid })
    ads.video_gallery.push({
      title: title,
      video: video,
      link: link
    })
    await ads.save()
    res.status(200).send({ message: "Explore New Video By Admission Site", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_admission_edit_video_gallery_query = async (req, res) => {
  try {
    const { aid } = req?.params
    const { title, video, link, vid } = req?.body
    if (!aid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const ads = await AdmissionSite.findById({ _id: aid })
    for (let ele of ads?.video_gallery) {
      if (`${ele?._id}` === `${vid}`) {
        ele.title = title
        ele.video = video
        ele.link = link
      }
    }
    await ads.save()
    res.status(200).send({ message: "Explore Edit Video By Admission Site", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_admission_delete_video_gallery_query = async (req, res) => {
  try {
    const { aid } = req?.params
    const { vid } = req?.body
    if (!aid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const ads = await AdmissionSite.findById({ _id: aid })
    for (let ele of ads?.video_gallery) {
      if (`${ele?._id}` === `${vid}`) {
        ads?.video_gallery?.pull(ele?._id)
      }
    }
    await ads.save()
    res.status(200).send({ message: "Explore Delete Video By Admission Site", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

// intiate query for all not created department
exports.notCreatedSiteInfoDepartmentQuery = async (req, res) => {
  try {
    const department = await Department.find({});
    for (let i = 0; i < department?.length; i++) {
      let d_site = department[i];
      if (d_site?.site_info?.[0]) {
      } else {
        const departmentSite = new DepartmentSite({
          related_department: department?._id,
          department_site_status: department?.department_status,
        });
        d_site.site_info.push(departmentSite?._id);
        await Promise.all([departmentSite.save(), d_site.save()]);
        console.log("Value of i", i);
      }
    }
    res.status(200).send({
      message: "Department site info is updated first time 😋😊😋",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.one_department_site_other_card_query = async (req, res) => {
  try {
    const { dsid, cid } = req.params;
    const { sub_head_title, sub_heading_image, sub_head_body, flow } = req.body;
    if (!dsid || !cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    var d_site = await DepartmentSite.findById(dsid);
    if (flow === "ABOUT") {
      for (let dt of d_site?.about) {
        if (`${dt?._id}` === `${cid}`) {
          dt.sub_head_title = sub_head_title;
          dt.sub_heading_image = sub_heading_image;
          dt.sub_head_body = sub_head_body;
        }
      }
    }
    await d_site.save();
    return res.status(200).send({
      message: "About Edited successfully",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.one_department_site_other_card_delete_query = async (req, res) => {
  try {
    const { dsid, cid } = req.params;
    const { flow } = req.body;

    if (!dsid || !cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    var d_site = await DepartmentSite.findById(dsid);
    if (flow === "ABOUT") {
      d_site.about = d_site?.about?.filter((dt) => `${dt?._id}` !== `${cid}`);
    }
    await d_site.save();
    return res.status(200).send({
      message: "About Deleted successfully",
    });
  } catch (e) {
    console.log(e);
  }
};


