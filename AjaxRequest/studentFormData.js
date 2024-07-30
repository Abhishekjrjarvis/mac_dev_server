require("dotenv").config();

const axios = require("axios");
const https = require("https");
const InstituteAdmin = require("../models/InstituteAdmin");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
const obj = {
  DEV: "http://44.197.120.176/api/api",
  PROD: "http://qviple.com/api",
  OTHER: false,
};

const getAdmissionFormCase = async (instituteId) => {
  const institute = await InstituteAdmin.findById(instituteId);
  return institute?.admission_form_print_case;
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

const upperCase = (str) => {
  // let dt = `${str}`;
  // return str?.toUpperCase();
  if (typeof str === "string") {
    return str?.toUpperCase();
  } else {
    return str;
  }
};

const titleCase = (args) => {
  if (typeof args === "string") {
    let str = args
      .toLowerCase()
      .split(" ")
      ?.map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
    return str?.join(" ");
  } else {
    return args;
  }
};

const modifyDataTitle = async (args) => {
  let det = args;
  if (det?.length > 0) {
    for (let i = 0; i < det?.length; i++) {
      let ft_o = args[i];

      if (
        [
          "antiragging_affidavit",
          "undertakings",
          "documents",
          "social_reservation_information_section",
          "antiragging_affidavit_parents",
        ]?.includes(ft_o?.static_key)
      ) {
      } else {
        let ft_obj = ft_o["fields"];
        for (let ot of ft_obj) {
          if (ot?.nested_form_checklist?.length > 0) {
            if (
              ot?.nested_form_checklist?.nested_form_checklist_nested?.length >
              0
            ) {
              for (let rt of ot?.nested_form_checklist
                ?.nested_form_checklist_nested) {
                if (rt?.value) {
                  rt.value = titleCase(rt.value);
                }
              }
            } else {
              for (let wt of ot?.nested_form_checklist) {
                if (wt?.value) {
                  wt.value = titleCase(wt.value);
                }
              }
            }
          } else {
            if (ot?.value) {
              ot.value = titleCase(ot.value);
            }
          }
        }
      }
    }
  }
  return det;
};

const modifyDataUpper = async (args) => {
  let det = args;
  if (det?.length > 0) {
    for (let i = 0; i < det?.length; i++) {
      let ft_o = args[i];

      if (
        [
          "antiragging_affidavit",
          "undertakings",
          "documents",
          "social_reservation_information_section",
          "antiragging_affidavit_parents",
        ]?.includes(ft_o?.static_key)
      ) {
      } else {
        let ft_obj = ft_o["fields"];
        for (let ot of ft_obj) {
          if (ot?.nested_form_checklist?.length > 0) {
            if (
              ot?.nested_form_checklist?.nested_form_checklist_nested?.length >
              0
            ) {
              for (let rt of ot?.nested_form_checklist
                ?.nested_form_checklist_nested) {
                if (rt?.value) {
                  rt.value = upperCase(rt.value);
                }
              }
            } else {
              for (let wt of ot?.nested_form_checklist) {
                if (wt?.value) {
                  wt.value = upperCase(wt.value);
                }
              }
            }
          } else {
            if (ot?.value) {
              ot.value = upperCase(ot.value);
            }
          }
        }
      }
    }
  }
  return det;
};

const studentFormData = async (studentId, instituteId) => {
  let ft = await getStudentProfile(studentId);
  const gt = await getOneStudentProfile(studentId);
  const dt = await getInstituteProfile(instituteId);
  const whichCase = await getAdmissionFormCase(instituteId);
  // console.log(whichCase);
  if (whichCase === "Title Case") {
    // ft = await modifyDataTitle(ft);
    ft.result = await modifyDataTitle(ft?.result);
  } else if (whichCase === "Upper Case") {
    ft.result = await modifyDataUpper(ft?.result);
  } else {
  }
  // const ft = await getStudentProfile(studentId);
  return { ft, dt, oneProfile: gt };
};
module.exports = studentFormData;
