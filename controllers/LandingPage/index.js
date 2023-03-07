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
    const career = new LandingCareer({});
    institute.careerDepart.push(career?._id);
    institute.careerStatus = "Enable";
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
      "admin_vacancy_count staff_vacancy_count other_vacancy_count filled_vacancy_count career_photo"
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
    const tender = new LandingTender({});
    institute.tenderDepart.push(tender?._id);
    institute.tenderStatus = "Enable";
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
      "open_tender_count closed_tender_count tender_photo"
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
            ele.p;
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
        "insName name photoId insProfilePhoto career_passage tender_passage contact_list website_looks website_active_tab"
      )
      .populate({
        path: "website_looks.leading_person",
        select: "userLegalName username photoId profilePhoto",
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

exports.renderOneCareerTenderPassage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_ins = await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({ message: "Explore Career Passage", access: true });
  } catch (e) {
    console.log(e);
  }
};

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
