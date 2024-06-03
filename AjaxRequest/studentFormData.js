require("dotenv").config();

const axios = require("axios");
const https = require("https");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
const obj = {
  DEV: "http://44.197.120.176/api/api",
  PROD: "http://qviple.com/api",
  OTHER: false,
};

const getOneStudentProfile = async (studentId) => {
  try {
    const response = await axios.get(
      `${obj[process.env.CONNECT_DB]}/v1/ins/student/${studentId}`,
      { httpsAgent }
    );
    return response?.data?.student;
  } catch (e) {
    console.log(e);
    return {};
  }
};
const getStudentProfile = async (studentId) => {
  try {
    const response = await axios.get(
      `${
        obj[process.env.CONNECT_DB]
      }/v1/department/${studentId}/dynamic/form/query/subject/list`,
      { httpsAgent }
    );
    // let mod_res = [];
    // let id_obj = {};
    // for (let i = 0; i < response?.data?.result?.length; i++) {
    //   let obj = response?.data?.result[i];
    //   if (
    //     [
    //       "selected_subjects",
    //       "antiragging_affidavit",
    //       "undertakings",
    //       "social_reservation_information_section",
    //       "documents",
    //     ]?.includes(obj?.static_key)
    //   ) {
    //     id_obj[obj?.static_key] = i;
    //   } else {
    //     mod_res.push(obj);
    //   }
    // }
    // if (id_obj["selected_subjects"]) {
    //   mod_res.push(response?.data?.result[id_obj["selected_subjects"]]);
    // }
    // if (id_obj["documents"]) {
    //   mod_res.push(response?.data?.result[id_obj["documents"]]);
    // }

    // if (id_obj["social_reservation_information_section"]) {
    //   mod_res.push(
    //     response?.data?.result[id_obj["social_reservation_information_section"]]
    //   );
    // }
    // if (id_obj["undertakings"]) {
    //   mod_res.push(response?.data?.result[id_obj["undertakings"]]);
    // }
    // if (id_obj["antiragging_affidavit"]) {
    //   mod_res.push(response?.data?.result[id_obj["antiragging_affidavit"]]);
    // }
    return {
      result: response?.data?.result,
      img_content: response?.data?.image_content,
    };
  } catch (e) {
    console.log(e);
    return {};
  }
};

const getInstituteProfile = async (instituteId) => {
  try {
    const response = await axios.get(
      `${
        obj[process.env.CONNECT_DB]
      }/v1/ins/${instituteId}/profile?user_mod_id=`,
      { httpsAgent }
    );
    return response?.data?.institute;
  } catch (e) {
    console.log(e);
    return {};
  }
};
const studentFormData = async (studentId, instituteId) => {
  const ft = await getStudentProfile(studentId);
  const dt = await getInstituteProfile(instituteId);
  const gt = await getOneStudentProfile(studentId);
  return { ft, dt, oneProfile: gt };
};
module.exports = studentFormData;

