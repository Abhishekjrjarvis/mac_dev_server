const GetTouch = require("../../models/LandingModel/GetTouch");
const Career = require("../../models/LandingModel/Career");
const LandingCareer = require("../../models/LandingModel/Career/landingCareer");
const Vacancy = require("../../models/LandingModel/Career/Vacancy");
const Admin = require("../../models/superAdmin");
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const sendAnEmail = require("../../Service/email.js");
const User = require("../../models/User");
const invokeSpecificRegister = require("../../Firebase/specific");
const moment = require("moment");
const { generate_date } = require("../../helper/dayTimer");
const InstituteAdmin = require("../../models/InstituteAdmin");
const LandingTender = require("../../models/LandingModel/Tender/landingTender");
const Tender = require("../../models/LandingModel/Tender/Tender");
const { nested_document_limit } = require("../../helper/databaseFunction");
const Academic = require("../../models/LandingModel/SinglePage/Academic");
const NSS = require("../../models/LandingModel/SinglePage/NSS");
const Facilities = require("../../models/LandingModel/SinglePage/facilities");
const LandingControl = require("../../models/LandingModel/LandingControl");
const Post = require("../../models/Post");
const AcademicPage = require("../../models/LandingModel/AcademicPage");
const AcademicNestedPage = require("../../models/LandingModel/AcademicNestedPage");

exports.uploadGetTouchDetail = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const check_touch = await GetTouch.findOne({
      endUserEmail: req.body.endUserEmail,
    });
    if (check_touch) {
      res
        .status(200)
        .send({ message: "Email Already Registered", status: false });
    } else {
      const touch = new GetTouch({ ...req.body });
      admin.getTouchUsers.push(touch._id);
      admin.getTouchCount += 1;
      await Promise.all([touch.save(), admin.save()]);
      sendAnEmail(`${touch.endUserName}`, `${touch.endUserEmail}`);
      res.status(200).send({ message: "Uploaded", status: true });
    }
  } catch {}
};

exports.uploadUserCareerDetail = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const file = req.file;
    const results = await uploadDocFile(file);
    const check_career = await Career.findOne({
      endUserEmail: req.body.endUserEmail,
    });
    if (check_career) {
      res
        .status(200)
        .send({ message: "Email Already Registered", status: false });
    } else {
      const career = new Career({ ...req.body });
      career.endUserResume = results.key;
      admin.careerUserArray.push(career._id);
      admin.careerCount += 1;
      await Promise.all([career.save(), admin.save()]);
      await unlinkFile(file.path);
      sendAnEmail(`${career.endUserName}`, `${career.endUserEmail}`);
      res.status(200).send({ message: "Uploaded", status: true });
    }
  } catch {}
};

const AppUpdate = async (req, res) => {
  try {
    var data = `A New Update Available. Update your app to get smoother experience 😀`;
    const users = await User.find({}).select("deviceToken");
    if (users?.length > 0) {
      users?.forEach((ele) => {
        invokeSpecificRegister(
          "Specific Notification",
          data,
          "App Update Notification",
          ele._id,
          ele.deviceToken
        );
      });
      return true;
    }
  } catch (e) {
    console.log(e);
  }
};

// console.log(AppUpdate());

const HappyNew = async (req, res) => {
  try {
    var data = `Wishing you lots of love and laughter in 2023 and success in reaching your goals! 🎉🎉🎆🎆`;
    const users = await User.find({}).select("deviceToken");
    if (users?.length > 0) {
      users?.forEach((ele) => {
        invokeSpecificRegister(
          "Specific Notification",
          data,
          "Happy New Year 2023 🎆",
          ele._id,
          ele.deviceToken
        );
      });
      return true;
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderActivateLandingCareerQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const institute = await InstituteAdmin.findById({ _id: id });
    const career = new LandingCareer({ ...req.body });
    institute.careerDepart.push(career?._id);
    institute.careerStatus = "Enable";
    institute.career_passage = req.body?.career_passage;
    career.institute = institute?._id;
    institute.career_count += 1;
    await Promise.all([institute.save(), career.save()]);
    res.status(200).send({
      message: "Successfully Activate Career Module",
      access: true,
      landing_career: career?._id,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneLandingCareerQuery = async (req, res) => {
  try {
    const { lcid } = req.params;
    if (!lcid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const career = await LandingCareer.findById({ _id: lcid }).select(
      "admin_vacancy_count career_passage staff_vacancy_count other_vacancy_count filled_vacancy_count career_photo"
    );
    res.status(200).send({
      message: "Explore Career Module",
      access: true,
      career: career,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderCareerNewVacancyQuery = async (req, res) => {
  try {
    const { lcid } = req.params;
    if (!lcid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const career = await LandingCareer.findById({ _id: lcid });
    const vacancy = new Vacancy({ ...req.body });
    career.vacancy.push(vacancy?._id);
    vacancy.career = career?._id;
    if (vacancy?.vacancy_job_type === "Administrative Job") {
      career.admin_vacancy_count += 1;
    } else if (vacancy?.vacancy_job_type === "Teaching Job") {
      career.staff_vacancy_count += 1;
    } else {
      career.other_vacancy_count += 1;
    }
    await Promise.all([career.save(), vacancy.save()]);
    res.status(200).send({
      message: "Explore New Ongoing Vacancy",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllLandingCareerVacancyQuery = async (req, res) => {
  try {
    const { lcid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;
    if (!lcid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const career = await LandingCareer.findById({ _id: lcid }).select(
      "vacancy"
    );

    const all_vacancy = await Vacancy.find({
      $and: [{ _id: { $in: career?.vacancy } }, { vacancy_status: status }],
    })
      .limit(limit)
      .skip(skip)
      .select(
        "vacancy_position vacancy_job_type vacancy_status application_count"
      )
      .populate({
        path: "department",
        select: "dName",
      });

    if (all_vacancy?.length > 0) {
      res.status(200).send({
        message: `Explore New ${status} Vacancy`,
        access: true,
        all_vacancy: all_vacancy,
      });
    } else {
      res.status(200).send({
        message: `No New ${status} Vacancy`,
        access: false,
        all_vacancy: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneVacancyStatusQuery = async (req, res) => {
  try {
    const { vid } = req.params;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });

    const vacancy = await Vacancy.findById({ _id: vid });
    const career = await LandingCareer.findById({ _id: `${vacancy?.career}` });
    vacancy.vacancy_status = "Completed";
    if (vacancy?.vacancy_job_type === "Administrative Job") {
      if (career.admin_vacancy_count > 0) {
        career.admin_vacancy_count -= 1;
      }
    } else if (vacancy?.vacancy_job_type === "Teaching Job") {
      if (career.staff_vacancy_count > 0) {
        career.staff_vacancy_count -= 1;
      }
    } else {
      if (career.other_vacancy_count > 0) {
        career.other_vacancy_count -= 1;
      }
    }
    career.filled_vacancy_count += 1;
    await Promise.all([career.save(), vacancy.save()]);
    res.status(200).send({ message: "Explore Filled Positions", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneVacancyApplyQuery = async (req, res) => {
  try {
    const { vid } = req.params;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });

    const vacancy = await Vacancy.findById({ _id: vid });
    const apply = new Career({ ...req.body });
    apply.vacancy = vacancy?._id;
    vacancy.application.push(apply?._id);
    vacancy.application_count += 1;
    await Promise.all([vacancy.save(), apply.save()]);
    res.status(200).send({ message: "Thanks for Applying", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneVacancyQuery = async (req, res) => {
  try {
    const { vid } = req.params;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const vacancy = await Vacancy.findById({ _id: vid })
      .select(
        "vacancy_job_type vacancy_position vacancy_package vacancy_about vacancy_status vacancy_banner application_count"
      )
      .populate({
        path: "department",
        select: "dName",
      });
    res
      .status(200)
      .send({ message: "Explore One Vacancies", access: true, vacancy });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneVacancyAllApplicationsQuery = async (req, res) => {
  try {
    const { vid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const career = await Vacancy.findById({ _id: vid }).select("application");

    const all_apps = await Career.find({
      $and: [{ _id: { $in: career?.application } }],
      $or: [{ endUserName: { $regex: search, $options: "i" } }],
    })
      .limit(limit)
      .skip(skip);

    if (all_apps?.length > 0) {
      res.status(200).send({
        message: `Explore New Application`,
        access: true,
        all_apps: all_apps,
      });
    } else {
      res.status(200).send({
        message: `No New Application`,
        access: false,
        all_apps: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneVacancyOneApplicationScheduleQuery = async (req, res) => {
  try {
    const { acid } = req.params;
    if (!acid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const date_query = new Date(
      `${req.body?.interview_date}T${
        req.body?.interview_time
      }:${new Date().getSeconds()}.${new Date().getMilliseconds()}Z`
    ).toISOString();
    const apply = await Career.findById({ _id: acid });
    apply.interview_type = req.body?.interview_type;
    apply.interview_date = generate_date(req.body?.interview_date);
    apply.interview_time = date_query;
    apply.interview_place = req.body?.interview_place;
    apply.interview_link = req.body?.interview_link;
    apply.interview_guidelines = req.body?.interview_guidelines;
    await apply.save();
    res.status(200).send({
      message: `Your Interview is Schedule on ${moment(
        apply?.interview_date
      ).format("DD-MM-YYYY")}`,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneVacancyDestroyQuery = async (req, res) => {
  try {
    const { vid } = req.params;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const vacancy = await Vacancy.findById({ _id: vid });
    const landing_career = await LandingCareer.findById({
      _id: `${vacancy?.career}`,
    });
    landing_career.vacancy.pull(vacancy?._id);
    if (
      vacancy?.vacancy_status === "Ongoing" &&
      vacancy?.vacancy_job_type === "Administrative Job"
    ) {
      if (landing_career?.admin_vacancy_count > 0) {
        landing_career.admin_vacancy_count -= 1;
      }
    } else if (
      vacancy?.vacancy_status === "Ongoing" &&
      vacancy?.vacancy_job_type === "Teaching Job"
    ) {
      if (landing_career?.staff_vacancy_count > 0) {
        landing_career.staff_vacancy_count -= 1;
      }
    } else if (
      vacancy?.vacancy_status === "Ongoing" &&
      vacancy?.vacancy_job_type === "Other"
    ) {
      if (landing_career?.other_vacancy_count > 0) {
        landing_career.other_vacancy_count -= 1;
      }
    } else {
      if (landing_career?.filled_vacancy_count > 0) {
        landing_career.filled_vacancy_count -= 1;
      }
    }
    await landing_career.save();
    await Vacancy.findByIdAndDelete(vid);
    res
      .status(200)
      .send({ message: "Vacancy Deletion Operation Completed", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderActivateLandingTenderQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const institute = await InstituteAdmin.findById({ _id: id });
    const tender = new LandingTender({ ...req.body });
    institute.tenderDepart.push(tender?._id);
    institute.tenderStatus = "Enable";
    institute.tender_passage = req.body?.tender_passage;
    tender.institute = institute?._id;
    institute.tender_count += 1;
    await Promise.all([institute.save(), tender.save()]);
    res.status(200).send({
      message: "Successfully Activate Tender Module",
      access: true,
      landing_tender: tender?._id,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneLandingTenderQuery = async (req, res) => {
  try {
    const { ltid } = req.params;
    if (!ltid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const tender = await LandingTender.findById({ _id: ltid }).select(
      "open_tender_count tender_passage closed_tender_count tender_photo"
    );
    res.status(200).send({
      message: "Explore Tender Module",
      access: true,
      tender: tender,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderTenderNewQuery = async (req, res) => {
  try {
    const { ltid } = req.params;
    if (!ltid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const landing_tender = await LandingTender.findById({ _id: ltid });
    const new_tender = new Tender({ ...req.body });
    landing_tender.tender.push(new_tender?._id);
    new_tender.landing_tender = landing_tender?._id;
    landing_tender.open_tender_count += 1;
    await Promise.all([landing_tender.save(), new_tender.save()]);
    res.status(200).send({
      message: "Explore New Open Tender",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllTenderQuery = async (req, res) => {
  try {
    const { ltid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;
    if (!ltid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const landing_tender = await LandingTender.findById({ _id: ltid }).select(
      "tender"
    );

    const all_tender = await Tender.find({
      $and: [
        { _id: { $in: landing_tender?.tender } },
        { tender_status: status },
      ],
    })
      .limit(limit)
      .skip(skip)
      .select("tender_requirement tender_budget tender_status bid_count")
      .populate({
        path: "department",
        select: "dName",
      });

    if (all_tender?.length > 0) {
      res.status(200).send({
        message: `Explore New ${status} Tender`,
        access: true,
        all_tender: all_tender,
      });
    } else {
      res.status(200).send({
        message: `No New ${status} Tender`,
        access: false,
        all_tender: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTenderStatusQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const tender = await Tender.findById({ _id: tid });
    const landing_tender = await LandingTender.findById({
      _id: `${tender?.landing_tender}`,
    });
    tender.tender_status = "Closed";
    landing_tender.closed_tender_count += 1;
    if (landing_tender.open_tender_count > 0) {
      landing_tender.open_tender_count -= 1;
    }
    await Promise.all([landing_tender.save(), tender.save()]);
    res.status(200).send({ message: "Explore Closed Tender", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTenderBidQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });

    const tender = await Tender.findById({ _id: tid });
    tender.bid.push({
      bidder_name: req.body?.bidder_name,
      bidder_email: req.body?.bidder_email,
      bidder_phone_number: req.body?.bidder_phone_number,
      bidder_address: req.body?.bidder_address,
      bidder_quotation: req.body?.bidder_quotation,
    });
    tender.bid_count += 1;
    await tender.save();
    res.status(200).send({ message: "Thanks for Biding", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTenderQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const tender = await Tender.findById({ _id: tid })
      .select(
        "tender_requirement tender_budget tender_about tender_status tender_order bid_count"
      )
      .populate({
        path: "department",
        select: "dName",
      });
    res
      .status(200)
      .send({ message: "Explore One Tender", access: true, tender });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTenderAllBidderQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const tender = await Tender.findById({ _id: tid }).select("bid");

    const all_bids = await nested_document_limit(page, limit, tender?.bid);

    if (all_bids?.length > 0) {
      res.status(200).send({
        message: `Explore New Bidder`,
        access: true,
        all_bids: all_bids,
      });
    } else {
      res.status(200).send({
        message: `No New Bidder`,
        access: false,
        all_bids: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTenderOneBidderOfferQuery = async (req, res) => {
  try {
    const { tid, bid } = req.params;
    if (!tid && !bid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const tender = await Tender.findById({ _id: tid });
    for (var ref of tender?.bid) {
      if (`${ref?._id}` === `${bid}`) {
        ref.offer_price = req.body?.offer_price;
        ref.order_detail = req.body?.order_detail;
        ref.purchase_order = req.body?.purchase_order;
      }
    }
    await tender.save();
    res.status(200).send({
      message: `Offer for You`,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneTenderDestroyQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug nee to fixed immediatley",
        access: false,
      });
    const tender = await Tender.findById({ _id: tid });
    const landing_tender = await LandingTender.findById({
      _id: `${tender?.landing_tender}`,
    });
    landing_tender.tender.pull(tender?._id);
    if (tender?.tender_status === "Open") {
      if (landing_tender?.open_tender_count > 0) {
        landing_tender.open_tender_count -= 1;
      }
    } else {
      if (landing_tender?.closed_tender_count > 0) {
        landing_tender.closed_tender_count -= 1;
      }
    }
    await landing_tender.save();
    await Tender.findByIdAndDelete(tid);
    res
      .status(200)
      .send({ message: "Tender Deletion Operation Completed", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.rendeUpdateWebLooks = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({
      message: "Explore All New Look Up of Your's Website ",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.rendeUpdateWebTabs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({
      message: "Explore All New Active Tab of Your's Website ",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.rendeUpdateWebContacts = async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_array, edit_array } = req.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({
      message: "Explore All New Active Tab of Your's Website ",
      access: true,
    });
    if (contact_array?.length > 0) {
      const one_ins = await InstituteAdmin.findById({ _id: id });
      for (var ref of contact_array) {
        one_ins.contact_list.persons.push({
          department_name: ref?.departmentName,
          person_name: ref?.personName,
          person_phone_number: ref?.personPhoneNumber,
          person_email: ref?.personEmail,
        });
      }
      await one_ins.save();
    }
    if (edit_array?.length > 0) {
      const one_ins = await InstituteAdmin.findById({ _id: id });
      for (var ref of edit_array) {
        for (var ele of one_ins?.contact_list?.persons) {
          if (`${ele?._id}` === `${ref?.personId}`) {
            ele.department_name = ref?.departmentName;
            ele.person_name = ref?.personName;
            ele.person_email = ref?.personEmail;
            ele.person_phone_number = ref?.personPhoneNumber;
          }
        }
      }
      await one_ins.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneWebProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_ins = await InstituteAdmin.findById({ _id: id })
      .select(
        "insName name photoId insProfilePhoto sub_domain_link_up_status career_passage tender_passage contact_list website_looks website_active_tab insEstdDate insEmail insPhoneNumber insAddress insAffiliated naac_motto insEditableText_one insEditableText_two testimonials home_opener iso_certificate"
      )
      .populate({
        path: "website_looks.leading_person",
        select: "userLegalName username photoId profilePhoto userBio userAbout",
      })
      .populate({
        path: "request_at",
        select: "affiliation_name photo",
      })
      .populate({
        path: "affiliation_by",
        select: "affiliation_name photo",
      })
      .populate({
        path: "sub_domain",
        select: "sub_domain_path sub_domain_name status",
      })
      .populate({
        path: "academic_module",
        select: "academic_about",
      })
      .populate({
        path: "nss_module",
        select: "nss_about",
      })
      .populate({
        path: "facilities_module",
        select: "institute",
      })
      .populate({
        path: "landing_control",
        populate: {
          path: "academic_courses_desk",
          populate: {
            path: "sub_head"
          }
        }
      })
      .populate({
        path: "landing_control",
        populate: {
          path: "administration_object",
          populate: {
            path: "leading_person",
            select: "username userLegalName photoId profilePhoto"
          }
        }
      });
    res.status(200).send({
      message: "Explore One Institute All Profile Details",
      access: true,
      one_ins: one_ins,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAcademicSectionQuery = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid)
      return res.status(200).send({
        message: "Thier is a bug need to fixed immediately",
        access: false,
      });

    const academic = await Academic.findById({ _id: aid })
      .populate({
        path: "institute",
        select: "insName name",
      })
      .populate({
        path: "academic_head",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffEmail staffPhoneNumber staffROLLNO",
      });

    res.status(200).send({
      message: "Explore Master Academic Module Query",
      access: true,
      academic: academic,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewAcademicSectionQuery = async (req, res) => {
  try {
    const { id } = req?.params;
    const { academic_about, academic_head, academic_photo } = req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var ins = await InstituteAdmin.findById({ _id: id });
    var n_a = new Academic({});
    n_a.institute = ins?._id;
    n_a.academic_about = academic_about;
    n_a.academic_head = academic_head;
    n_a.academic_photo = academic_photo;
    ins.academic_module = n_a?._id;
    await Promise.all([n_a.save(), ins.save()]);
    res
      .status(200)
      .send({ message: "Explore New Academic Module Query", access: true });
    if (req?.body?.academic_rules?.length > 0) {
      for (var ref of req?.body?.academic_rules) {
        n_a.academic_rules.push(ref);
      }
    }
    if (req?.body?.academic_mechanism?.length > 0) {
      for (var ref of req?.body?.academic_mechanism) {
        n_a.academic_mechanism.push(ref);
      }
    }
    if (req?.body?.academic_student_feedback?.length > 0) {
      for (var ref of req?.body?.academic_student_feedback) {
        n_a.academic_student_feedback.push(ref);
      }
    }
    if (req?.body?.academic_ict_faculty?.length > 0) {
      for (var ref of req?.body?.academic_ict_faculty) {
        n_a.academic_ict_faculty.push(ref);
      }
    }
    if (req?.body?.academic_peer?.length > 0) {
      for (var ref of req?.body?.academic_peer) {
        n_a.academic_peer.push(ref);
      }
    }
    if (req?.body?.academic_development_courses?.length > 0) {
      for (var ref of req?.body?.academic_development_courses) {
        n_a.academic_development_courses.push(ref);
      }
    }
    if (req?.body?.academic_results?.length > 0) {
      for (var ref of req?.body?.academic_results) {
        n_a.academic_results.push(ref);
      }
    }
    if (req?.body?.academic_toppers?.length > 0) {
      for (var ref of req?.body?.academic_toppers) {
        n_a.academic_toppers.push(ref);
      }
    }
    if (req?.body?.academic_student_survey?.length > 0) {
      for (var ref of req?.body?.academic_student_survey) {
        n_a.academic_student_survey.push(ref);
      }
    }
    if (req?.body?.academic_annual_report?.length > 0) {
      for (var ref of req?.body?.academic_annual_report) {
        n_a.academic_annual_report.push(ref);
      }
    }
    if (req?.body?.academic_action_plan?.length > 0) {
      for (var ref of req?.body?.academic_action_plan) {
        n_a.academic_action_plan.push(ref);
      }
    }
    if (req?.body?.academic_calendar?.length > 0) {
      for (var ref of req?.body?.academic_calendar) {
        n_a.academic_calendar.push({
          calendar_name: ref?.calendar_name,
          calendar: ref?.calendar,
        });
      }
    }
    await n_a.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderExistAcademicSectionQuery = async (req, res) => {
  try {
    const { aid } = req?.params;
    const { academic_about, academic_head, academic_photo } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var exist_academic = await Academic.findById({ _id: aid });
    if (academic_about) {
      exist_academic.academic_about = academic_about
        ? academic_about
        : exist_academic.academic_about;
    }
    if (academic_head) {
      exist_academic.academic_head = academic_head
        ? academic_head
        : exist_academic.academic_head;
    }
    if (academic_photo) {
      exist_academic.academic_photo = academic_photo
        ? academic_photo
        : exist_academic.academic_photo;
    }
    if (req?.body?.academic_rules?.length > 0) {
      for (var ref of req?.body?.academic_rules) {
        exist_academic.academic_rules.push(ref);
      }
    }
    if (req?.body?.academic_mechanism?.length > 0) {
      for (var ref of req?.body?.academic_mechanism) {
        exist_academic.academic_mechanism.push(ref);
      }
    }
    if (req?.body?.academic_student_feedback?.length > 0) {
      for (var ref of req?.body?.academic_student_feedback) {
        exist_academic.academic_student_feedback.push(ref);
      }
    }
    if (req?.body?.academic_ict_faculty?.length > 0) {
      for (var ref of req?.body?.academic_ict_faculty) {
        exist_academic.academic_ict_faculty.push(ref);
      }
    }
    if (req?.body?.academic_peer?.length > 0) {
      for (var ref of req?.body?.academic_peer) {
        exist_academic.academic_peer.push(ref);
      }
    }
    if (req?.body?.academic_development_courses?.length > 0) {
      for (var ref of req?.body?.academic_development_courses) {
        exist_academic.academic_development_courses.push(ref);
      }
    }
    if (req?.body?.academic_results?.length > 0) {
      for (var ref of req?.body?.academic_results) {
        exist_academic.academic_results.push(ref);
      }
    }
    if (req?.body?.academic_toppers?.length > 0) {
      for (var ref of req?.body?.academic_toppers) {
        exist_academic.academic_toppers.push(ref);
      }
    }
    if (req?.body?.academic_student_survey?.length > 0) {
      for (var ref of req?.body?.academic_student_survey) {
        exist_academic.academic_student_survey.push(ref);
      }
    }
    if (req?.body?.academic_annual_report?.length > 0) {
      for (var ref of req?.body?.academic_annual_report) {
        exist_academic.academic_annual_report.push(ref);
      }
    }
    if (req?.body?.academic_action_plan?.length > 0) {
      for (var ref of req?.body?.academic_action_plan) {
        exist_academic.academic_action_plan.push(ref);
      }
    }
    if (req?.body?.academic_calendar?.length > 0) {
      for (var ref of req?.body?.academic_calendar) {
        exist_academic.academic_calendar.push({
          calendar_name: ref?.calendar_name,
          calendar: ref?.calendar,
        });
      }
    }
    if (req?.body?.academic_suggestion?.length > 0) {
      for (var ref of req?.body?.academic_suggestion) {
        exist_academic.academic_suggestion.push({
          stake_type: ref?.stake_type,
          name: ref?.name,
          phone_number: ref?.phone_number,
          email: ref?.email,
          subject: ref?.subject,
          complaint: ref?.complaint,
        });
      }
    }
    await exist_academic.save();
    res
      .status(200)
      .send({ message: "Explore Updated Academic Module Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNSSQuery = async (req, res) => {
  try {
    const { nid } = req.params;
    if (!nid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var nss = await NSS.findById({ _id: nid })
      .populate({
        path: "institute",
        select: "insName name",
      })
      .populate({
        path: "nss_head",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      })
      .select(
        "nss_about nss_objective created_at nss_roles nss_commitee_count"
      );

    res
      .status(200)
      .send({ message: "Explore master NSS Query", access: true, nss: nss });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewNSSQuery = async(req, res) => {
  try{
    const { id } = req.params
    const { nss_about, nss_head, nss_photo, nss_objective, nss_roles, nss_commitee } = req?.body
    if(!id) return res.status(200).send({ message: "Their is a bug need to immediately", access: false })

    const ins = await InstituteAdmin.findById({ _id: id })
    const nss_query = new NSS({})

    ins.nss_module = nss_query?._id
    nss_query.institute = ins?._id
    nss_query.nss_about = nss_about;
    nss_query.nss_head = nss_head;
    nss_query.nss_photo = nss_photo;
    nss_query.nss_objective = nss_objective
    await Promise.all([nss_query.save(), ins.save()]);
    res
      .status(200)
      .send({ message: "Explore New NSS Module Query", access: true });

    if(nss_roles?.length > 0){
      for(var ref of nss_roles){
        nss_query.nss_roles.push({
          headline: ref?.headline,
          headline_description: ref?.headline_description
        })
      }
    }
    if(nss_commitee?.length > 0){
      for(var ref of nss_commitee){
        nss_query.nss_commitee.push({
          staff: ref?.staff,
          designation: ref?.designation
        })
        nss_query.nss_commitee_count += 1
      }
    }

    await nss_query.save()
  }
catch(e){
  console.log(e)
}
}

exports.renderFacilitiesQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var fact = await Facilities.findById({ _id: fid })
      .populate({
        path: "institute",
        select: "insName name",
      })

    res
      .status(200)
      .send({ message: "Explore master NSS Query", access: true, fact: fact });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewFacilitiesQuery = async(req, res) => {
  try{
    const { id } = req.params
    const { post_content, content } = req?.body
    if(!id) return res.status(200).send({ message: "Their is a bug need to immediately", access: false })

    const ins = await InstituteAdmin.findById({ _id: id })
    const fact = new Facilities({})

    ins.facilities_module = fact?._id
    fact.institute = ins?._id
    if(post_content?.attach){
      fact.facilities_attach.attach = post_content?.attach
      fact.facilities_attach.title = post_content?.title
    }
    if(content?.length > 0){
      for(var ele of content){
      fact.facilities_overview.push({
        headline: ele?.headline,
        headline_content: ele?.headline_content
      })
      }
    }
    await Promise.all([fact.save(), ins.save()]);
    res
      .status(200)
      .send({ message: "Explore New Facilities Module Query", access: true });
  }
catch(e){
  console.log(e)
}
}

exports.renderEditFacilitiesQuery = async(req, res) => {
  try{
    const { fid } = req?.params
    const { post_content, content } = req?.body
    if(!fid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    var fact = await Facilities.findById({ _id: fid })
    if(post_content?.attach){
      fact.facilities_attach.attach = post_content?.attach
      fact.facilities_attach.title = post_content?.title
    }
    if(content?.length > 0){
      for(var ele of content){
      fact.facilities_overview.push({
        headline: ele?.headline,
        headline_content: ele?.headline_content
      })
      }
    }

    await fact.save()
    res.status(200).send({ message: "Update Facilities Module Query", access: true})
  }
  catch(e){
    console.log(e)
  }
}

exports.render_testimonials_query = async (req, res) => {
  try {
    const { id } = req?.params
    const { test } = req?.body
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const ins = await InstituteAdmin.findById({ _id: id })
    for (var val of test) {
      ins.testimonials.push({
        name: val?.name,
        image: val?.image,
        bio: val?.bio,
        link: val?.link
      })
    }
    await ins.save()
    res.status(200).send({ message: "Testimonials Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_home_opener_query = async (req, res) => {
  try {
    const { id } = req?.params
    const { home } = req?.body
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const ins = await InstituteAdmin.findById({ _id: id })
    for (var val of home) {
      ins.home_opener.push({
        image: val?.image,
        link: val?.link,
        quick_links: [...val?.quick_links],
      })
    }
    await ins.save()
    res.status(200).send({ message: "Home Opener Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_home_opener_query = async (req, res) => {
  try {
    const { id, hid } = req?.params
    const { image, link, quick } = req?.body
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const ins = await InstituteAdmin.findById({ _id: id })
    for (var val of ins?.home_opener) {
      if (`${val?._id}` === `${hid}`) {
        val.image = image ? image : val?.image
        val.link = link ? link : val?.link
        for (var ele of quick) {
          val.quick_links.push({
            name: ele?.name,
            link: ele?.link,
            attach: ele?.attach
          })
        }
      }
    }
    await ins.save()
    res.status(200).send({ message: "One Home Opener Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_testimonials_query = async (req, res) => {
  try {
    const { id, tid } = req?.params
    const { image, link, name, bio } = req?.body
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const ins = await InstituteAdmin.findById({ _id: id })
    for (var val of ins?.testimonials) {
      if (`${val?._id}` === `${tid}`) {
        val.image = image ? image : val?.image
        val.name = name ? name : val?.name
        val.link = link ? link : val?.link
        val.bio = bio ? bio : val?.bio
      }
    }
    await ins.save()
    res.status(200).send({ message: "One Testimonials Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_Landing_Control_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    await LandingControl.findByIdAndUpdate(lcid, req?.body)
    res.status(200).send({ message: "Explore One Institute Landing Control Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_iso_query = async (req, res) => {
  try {
    const { id } = req?.params
    const { iso } = req?.body
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const ins = await InstituteAdmin.findById({ _id: id })
    for (var val of iso) {
      ins.iso_certificate.push({
        name: val?.name,
        image: val?.image,
        link: val?.link
      })
    }
    await ins.save()
    res.status(200).send({ message: "New ISO Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_gallery_post_query = async (req, res) => {
  try {
    const { id } = req?.params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

    const institute = await InstituteAdmin.findById(id)
            .select("id")
            .populate({ path: "featured_post" });
          if (institute && institute.featured_post.length >= 1) {
            const post = await Post.find({
              _id: { $in: institute.featured_post },
            })
              // .sort("-createdAt")
              .limit(limit)
              .skip(skip)
              .select(
                "postTitle postText postDescription isHelpful needCount needUser questionCount pollCount isNeed endUserSave authorOneLine authorFollowersCount tagPeople createdAt postType postImage postVideo video_cover imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
              )
              .populate({
                path: "poll_query",
              })
              .populate({
                path: "new_application",
                select:
                  "applicationSeats applicationStartDate applicationPhoto photoId applicationEndDate applicationAbout applicationStatus admissionFee applicationName",
                populate: {
                  path: "applicationDepartment",
                  select: "dName",
                },
              })
              .populate({
                path: "new_announcement",
                select: "insAnnTitle insAnnDescription",
              });
            if (institute.featured_post.length >= 1) {
              const postCount = await Post.find({
                _id: { $in: institute.featured_post },
              });
              if (page * limit >= postCount.length) {
              } else {
                var totalPage = page + 1;
              }
              // Add Another Encryption
              res.status(200).send({
                message: "Success",
                post: post.reverse(),
                postCount: postCount.length,
                totalPage: totalPage,
              });
            }
          } else {
            res.status(204).send({ message: "No Posts Yet...", post: [] });
          }
  
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_founder_desk_post_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { desk } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const landing = await LandingControl.findById({ _id: lcid })
    for (var val of desk) {
      landing.founder_desk.push({
        video: val?.video,
        image: val?.image,
        link: val?.link,
        description: val?.description
      })
    }
    await landing.save()
    res.status(200).send({ message: "Founder's Desk Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_accreditation_desk_post_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { desk } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const landing = await LandingControl.findById({ _id: lcid })
    for (var val of desk) {
      landing.accreditations_desk.push({
        image: val?.image,
        link: val?.link
      })
    }
    await landing.save()
    res.status(200).send({ message: "Accreditations Desk Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_gallery_desk_post_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { gallery } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const landing = await LandingControl.findById({ _id: lcid })
    for (var val of gallery) {
      landing.gallery.push({
        category: val?.category,
        image: val?.image
      })
    }
    await landing.save()
    res.status(200).send({ message: "Gallery Desk Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_gallery_desk_post_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { category } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const landing = await LandingControl.findById({ _id: lcid })
      .select("gallery")
    
    var filter = landing?.gallery?.filter((val) => {
      if(`${val?.category}` === `${category}`) return val
    })
    var all_gallery = await nested_document_limit(page, limit, filter)
    if (all_gallery?.length > 0) {
      res.status(200).send({ message: "All Gallery Desk Updated Query", access: true, all_gallery: all_gallery }) 
    }
    else {
      res.status(200).send({ message: "No Gallery Desk Updated Query", access: true, all_gallery: [] })
    }
    
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_affiliation_desk_post_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { name, logo } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const landing = await LandingControl.findById({ _id: lcid })
    landing.affiliation_name = name ? name : landing?.affiliation_name
    landing.affiliation_logo = logo?.length > 0  ? [...logo] : [...landing.affiliation_logo]
    await landing.save()
    res.status(200).send({ message: "Affiliation Desk Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_society_desk_post_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { name, vision, about, mission, organisation_structure, founder_message_image, founder_message_designation, founder_message_message, founder_message_name } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    const landing = await LandingControl.findById({ _id: lcid })

    landing.about_society_dynamic.dynamic_name = name ? name : landing?.about_society_dynamic?.dynamic_name
    landing.about_society_dynamic.vision = vision ? vision : landing?.about_society_dynamic?.vision
    landing.about_society_dynamic.about = about ? about : landing?.about_society_dynamic?.about
    landing.about_society_dynamic.mission = mission ? mission : landing?.about_society_dynamic?.mission
    landing.about_society_dynamic.organisation_structure = organisation_structure ? organisation_structure : landing?.about_society_dynamic?.organisation_structure
    landing.about_society_dynamic.founder_message_image = founder_message_image ? founder_message_image : landing?.about_society_dynamic?.founder_message_image
    landing.about_society_dynamic.founder_message_designation = founder_message_designation ? founder_message_designation : landing?.about_society_dynamic?.founder_message_designation
    landing.about_society_dynamic.founder_message_message = founder_message_message ? founder_message_message : landing?.about_society_dynamic?.founder_message_message
    landing.about_society_dynamic.founder_message_name = founder_message_name ? founder_message_name : landing?.about_society_dynamic?.founder_message_name
    
    await landing.save()
    res.status(200).send({ message: "Society Desk Updated Query", access: true })
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_pinned_department_query = async (req, res) => {
  try {
    const { id } = req?.params
    const { flow } = req?.query
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })
    
    if (flow === "INDEPENDENT") {
      const ins = await InstituteAdmin.findById({ _id: id })
      .select("independent_pinned_department")
      .populate({
        path: "independent_pinned_department",
        select: "dName"
      })
    res.status(200).send({ message: "Explore Independent Pinned Department", access: true, ins: ins?.independent_pinned_department})
    }
    else if (flow === "DEPENDENT") {
      const ins = await InstituteAdmin.findById({ _id: id })
      .select("dependent_pinned_department")
      .populate({
        path: "dependent_pinned_department",
        select: "dName"
      })
      const unique = [...new Set(ins?.dependent_pinned_department.map(item => item.section_type))]; 
    res.status(200).send({ message: "Explore Dependent Pinned Department", access: true, ins: unique})
    }
    
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_pinned_department_query = async (req, res) => {
  try {
    const { id } = req?.params
    const { type } = req?.query
    if (!id) return res.status(200).send({ message: "Their is a bug need to fixed immediatley", access: false })

      const ins = await InstituteAdmin.findById({ _id: id })
      .select("dependent_pinned_department")
      .populate({
        path: "dependent_pinned_department",
        select: "dName"
      })
    var nums = []
    for (let ele of ins?.dependent_pinned_department) {
      if (`${ele?.section_type}` === `${type}`) {
        nums.push(ele?.department)
      }
    }
    res.status(200).send({ message: "Explore Dependent Pinned Department", access: true, ins: nums})
    
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_academic_head_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { head_name, head_images, head_about } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const landing = await LandingControl.findById({ _id: lcid })
    const new_academic = new AcademicPage({
      head_name: head_name,
      head_images: [...head_images],
      head_about: head_about
    })
    landing.academic_courses_desk.push(new_academic?._id)
    new_academic.landing_control = landing?._id
    await Promise.all([landing.save(), new_academic.save()])
    res.status(200).send({ message: "Explore New Academic Head Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_academic_sub_head_query = async (req, res) => {
  try {
    const { acid } = req?.params
    const { sub_head_title_main } = req?.body
    if (!acid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const page = await AcademicPage.findById({ _id: acid })
    const academic = new AcademicNestedPage({
      sub_head_title_main: sub_head_title_main,
    })
    page.sub_head.push(academic?._id)
    academic.academic_page = page?._id
    await Promise.all([page.save(), academic.save()])
    res.status(200).send({ message: "Explore New Academic Sub Head Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_edit_academic_sub_head_query = async (req, res) => {
  try {
    const { anid } = req?.params
    const { sub_head_title, sub_heading_image, sub_head_body } = req?.body
    if (!anid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const n_page = await AcademicNestedPage.findById({ _id: anid })
    n_page.sub_head_title.push(sub_head_title)
    n_page.sub_heading_image.push(sub_heading_image)
    n_page.sub_head_body.push(sub_head_body)
    n_page.sub_topic.push({
      sub_head_title: sub_head_title,
      sub_heading_image: sub_heading_image,
      sub_head_body: sub_head_body
    })
    
    await n_page.save()
    res.status(200).send({ message: "Explore New Academic Sub Head Edit Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_enable_data_query = async (req, res) => {
  try {
    const all_ins = await InstituteAdmin.find({ status: "Approved" })
    .select("website_looks")
    for (var val of all_ins) {
      val.website_looks.background_image = [val.website_looks.background_image]
      await val.save()
    }
    res.status(200).send({ message: "Success"})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_home_header_object_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    await LandingControl.findByIdAndUpdate(lcid, req?.body)
    res.status(200).send({ message: "Home Header Object Update Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_home_background_object_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    await LandingControl.findByIdAndUpdate(lcid, req?.body)
    res.status(200).send({ message: "Home Header Background Object Update Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_home_about_object_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    await LandingControl.findByIdAndUpdate(lcid, req?.body)
    res.status(200).send({ message: "Home Header About Object Update Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_home_quick_opener_object_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    await LandingControl.findByIdAndUpdate(lcid, req?.body)
    res.status(200).send({ message: "Home Header Quick + Opener Object Update Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_home_footer_object_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    await LandingControl.findByIdAndUpdate(lcid, req?.body)
    res.status(200).send({ message: "Home Header Footer Object Update Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_home_accreditation_object_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { name, image, about } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const landing = await LandingControl.findById({ _id: lcid })
    landing.home_accreditation_object.push({
      name: name,
      image: image,
      about: about
    })
    await landing.save()
    res.status(200).send({ message: "Home Header Accreditation Object Update Query", access: true})

  }
  catch (e) {
    console.log(e)
  }
}

exports.render_home_accreditation_nested_object_query = async (req, res) => {
  try {
    const { lcid, acid } = req?.params
    const { c_name, c_attach } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const landing = await LandingControl.findById({ _id: lcid })
    for (var val of landing?.home_accreditation_object) {
      if (`${val?._id}` === `${acid}`) {
        val.c_name = c_name
        val.c_attach = c_attach
        val.combined.push({
          c_name: c_name,
          c_attach: c_attach
        })
      }
    }
    await landing.save()
    res.status(200).send({ message: "Home Header Accreditation Nested Object Update Query", access: true})

  }
  catch (e) {
    console.log(e)
  }
}

exports.render_about_institute_object_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { affiliation } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    await LandingControl.findByIdAndUpdate(lcid, req?.body)
    res.status(200).send({ message: "Home About Us Institute Object Update Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_about_institute_administration_object_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { admins } = req?.body
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const landing = await LandingControl.findById(lcid)
    for (var val of admins) {
      landing.administration_object.push({
        leading_person: val?.leading_person,
        leading_person_position: val?.leading_person_position,
        leading_person_message: val?.leading_person_message
      })
    }
    await landing.save()
    res.status(200).send({ message: "Home About Institute Administration Object Update Query", access: true})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_academic_page_query = async (req, res) => {
  try {
    const { acid } = req?.params
    if (!acid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const all_page = await AcademicPage.findById({ _id: acid })
      .select("sub_head")
      .populate({
        path: "sub_head",
        select: "sub_head_title_main"
    })
    res.status(200).send({ message: "All Academic Page Query", access: true, all_page: all_page?.sub_head})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_academic_nested_page_query = async (req, res) => {
  try {
    const { anid } = req?.params
    if (!anid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const all_page = await AcademicNestedPage.findById({ _id: anid })
      .select("sub_topic")
    res.status(200).send({ message: "All Academic Nested Page Query", access: true, all_page: all_page?.sub_topic?.length >0?all_page?.sub_topic :[]})
 }  catch (e) {
    console.log(e)
  }
}

exports.render_one_accreditation_query = async (req, res) => {
  try {
    const { lcid } = req?.params
    const { hid } = req?.query
    if (!lcid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    const landing = await LandingControl.findById({ _id: lcid })
      .select("home_accreditation_object")
    var obj = {}
    var filter = landing?.home_accreditation_object?.filter((val) => {
      if (`${val?._id}` === `${hid}`) {
        obj["list"] = val?.combined
      }
    })
    res.status(200).send({ message: "All Accreditation Combined Query", access: true, ac_data: obj?.list?.length >0?obj?.list :[]})
 }  catch (e) {
    console.log(e)
  }
}

// var is_true = true;
// setInterval(async () => {
//   if (
//     is_true &&
//     `${moment(new Date()).format("YYYY-MM-DD")}` === "2023-01-01"
//   ) {
//     await HappyNew();
//     is_true = false;
//     return "Done";
//   }
// }, 1000);

// console.log(HappyNew());

// const axios = require("axios");

// const options = {
//   method: 'POST',
//   url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
//   params: {
//     'to[0]': 'hi',
//     'api-version': '3.0',
//     profanityAction: 'NoAction',
//     textType: 'plain'
//   },
//   headers: {
//     'content-type': 'application/json',
//     'X-RapidAPI-Key': 'fc7ed05a15msh3985985ec5ef152p14a24cjsn91c90e91c1e9',
//     'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
//   },
//   data: `[{"Text":"I am I silverman man"}]`
// };

// axios.request(options).then(function (response) {
// 	console.log(response.data[0]?.translations[0]?.text);
// }).catch(function (error) {
// 	console.error(error.message);
// });
