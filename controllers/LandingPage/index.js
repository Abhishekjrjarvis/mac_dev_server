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
    const career = await LandingCareer.findById({ _id: lcid });
    res.status(200).send({
      message: "Explore Career Module",
      access: true,
      career: career,
    });
  } catch (e) {
    console.log();
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
    const career = await Career.findById({ _id: `${vacancy?.career}` });
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
    const { vid } = req.query;
    if (!vid)
      return res
        .status(200)
        .send({
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
    const apply = await Career.findByIdAndUpdate({ _id: acid });
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
