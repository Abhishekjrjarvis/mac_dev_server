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
    return response?.data?.result;
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

