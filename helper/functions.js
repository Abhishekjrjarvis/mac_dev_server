const { shuffleArray } = require("../Utilities/Shuffle");
const Admin = require("../models/superAdmin");
const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcryptjs");
var querystring = require("querystring");

const random_password = () => {
  const upperCase = ["A", "B", "C", "D", "E", "F", "G", "H", "Z"];
  const lowerCase = ["i", "j", "k", "l", "m", "n", "o", "p", "W"];
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  const exp = ["_", "#", "@", "$"];
  // const exp = [".", "_", "@", "#", "$", "!", "%", "&", "*"];
  const u_1 = Math.floor(Math.random() * 9);
  const u_2 = Math.floor(Math.random() * 9);
  const u_3 = Math.floor(Math.random() * 9);
  const u_4 = Math.floor(Math.random() * 9);
  const u_5 = Math.floor(Math.random() * 9);
  const u_6 = Math.floor(Math.random() * 9);
  const u_7 = Math.floor(Math.random() * 9);
  const u_8 = Math.floor(Math.random() * 9);
  const u_9 = Math.floor(Math.random() * 4);
  const userExp = `${lowerCase[u_1]}${upperCase[u_2]}${digits[u_3]}${upperCase[u_4]}${exp[u_9]}${digits[u_5]}${lowerCase[u_8]}${exp[u_9]}${exp[u_9]}`;
  return userExp;
};

exports.filter_unique_username = async (name, dob) => {
  const u_1 = Math.floor(Math.random() * 9);
  const u_2 = Math.floor(Math.random() * 9);
  const u_3 = Math.floor(Math.random() * 9);
  const u_4 = Math.floor(Math.random() * 9);
  // const new_query = `${dob?.substring(5, 7)}${dob?.substring(8, 10)}`.split("");
  const new_query = `${u_1}${u_2}${u_3}${u_4}`;
  const shuffle_date = shuffleArray(new_query);
  const combined_name = `${name?.trim()}_${new_query}`;
  const username = combined_name;
  const existAdmin = await Admin.findOne({ adminUserName: username });
  const existInstitute = await InstituteAdmin.findOne({ name: username });
  const existUser = await User.findOne({ username: username });
  if (existAdmin) {
    const combined_name_one = `${name?.trim()}_${new_query}`.split("");
    const username_one = shuffleArray(combined_name_one);
    const valid_username_one = {
      username: username_one.join(""),
      password: random_password(),
      exist: false,
    };
    return valid_username_one;
  } else if (existInstitute) {
    const combined_name_two = `${name?.trim()}_${new_query}`.split("");
    const username_two = shuffleArray(combined_name_two);
    const valid_username_two = {
      username: username_two.join(""),
      password: random_password(),
      exist: false,
    };
    return valid_username_two;
  } else if (existUser) {
    const combined_name_three = `${name?.trim()}_${new_query}`.split("");
    const username_three = shuffleArray(combined_name_three);
    const valid_username_three = {
      username: username_three.join(""),
      password: random_password(),
      exist: false,
    };
    return valid_username_three;
  } else {
    const valid_username = {
      username: username,
      password: random_password(),
      exist: false,
    };
    return valid_username;
  }
};

exports.generateAccessToken = (username, userId, userPassword) => {
  return jwt.sign(
    { username, userId, userPassword },
    process.env.TOKEN_SECRET,
    { expiresIn: "1y" }
  );
};

exports.generateAccessInsToken = (name, insId, insPassword) => {
  return jwt.sign({ name, insId, insPassword }, process.env.TOKEN_SECRET, {
    expiresIn: "1y",
  });
};

exports.generateAccessAdminToken = (adminUserName, adminId, adminPassword) => {
  return jwt.sign(
    { adminUserName, adminId, adminPassword },
    process.env.TOKEN_SECRET,
    { expiresIn: "1y" }
  );
};

exports.generateAccessDesignationToken = async (status, password) => {
  return jwt.sign({ status, password }, process.env.TOKEN_SECRET, {
    expiresIn: "2h",
  });
};

exports.generate_hash_pass = async () => {
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  var pass = `${rand1}${rand2}${rand3}${rand4}`;
  const new_user_pass = bcrypt.genSaltSync(12);
  const hash_user_pass = bcrypt.hashSync(pass, new_user_pass);
  var result = {
    pass: hash_user_pass,
    pin: pass,
  };
  return result;
};

exports.send_email_authentication = async (email) => {
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  const OTP = `${rand1}${rand2}${rand3}${rand4}`;
  const subject = "OTP Verification";
  const message = `Welcome to Qviple, Your Qviple account verification OTP is ${OTP} Mithkal Minds Pvt Ltd.`;
  const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${email}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
  const encodeURL = encodeURI(url);
  axios
    .post(encodeURL)
    .then((res) => {
      console.log("Sended Successfully");
    })
    .catch((e) => {
      console.log("SMS API Bug", e.message);
    });
  return OTP;
};

exports.send_email_authentication_login_query = (
  email,
  i_email,
  name,
  i_name
) => {
  const subject = "Qviple ERP Login Details";
  const message = `Hello ${name},
Qviple is ERP software of ${i_name}.
You are requested to login to your account with your email ${email} (on which this e-mail is received).
Stay updated about your fees, exams, events and much more about your school/college.

Now know your classmates, teachers and institute to a profound level. And grow your network.

Login by Downloading app 'Qviple: Your College Online' from playstore

OR

Through link : https://play.google.com/store/apps/details?id=com.mithakalminds.qviple


Note: 
If you are not able to login or are facing difficulty in login reach out to us at: connect@qviple.com
  
If you have queries regarding your fees, profile information or other, reach out to your institute's appropriate authority or at: ${i_email}

`;
  const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${email}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
  const encodeURL = encodeURI(url);
  axios
    .post(encodeURL)
    .then((res) => {
      console.log("Sended Successfully");
    })
    .catch((e) => {
      console.log("SMS API Bug", e.message);
    });
};

exports.send_phone_login_query = async (mob, valid_sname, valid_iname) => {
  var sName = `${valid_sname?.slice(0, 30)}`;
  var iName = `${valid_iname?.slice(0, 30)}`;
  const e_message = `Hi ${sName}. "Qviple" is ERP Software of ${iName}. You are requested to login to your account with your mobile number(On which this SMS is received) to stay updated about your fees, exams and events of your school or college. Login by downloading app 'Qviple Community' from playstore or through link: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - From "Qviple"`;
  const url = `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=${e_message}&senderid=QVIPLE&accusage=1&entityid=1701164286216096677&tempid=1707168309247841573`;
  axios
    .post(url)
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("E-messsage Sent Successfully", res.data);
      } else {
        console.log("E-something went wrong");
      }
    })
    .catch((e) => {
      console.log(e);
    });
  return true;
};

// console.log(
//   send_email_authentication_promotional("pankajphad.stuff@gmail.com")
// );

exports.student_sms_trigger_query = async (i_args, c_args) => {
  try {
    var all_student = await Student.find({
      $and: [
        { institute: i_args?._id },
        { studentStatus: "Approved" },
        { studentClass: c_args },
      ],
    });

    for (var ref of all_student) {
      var one_user = await User.findById({ _id: `${ref?.user}` });
      const valid_sname = `${ref?.studentFirstName} ${
        ref?.studentMiddleName ?? ""
      } ${ref?.studentLastName}`;
      const sName = `${valid_sname?.slice(0, 30)}`;
      const iName = `${i_args?.insName?.slice(0, 30)}`;
      var e_message = `Hi ${sName}. 
      "Qviple" is ERP Software of ${iName}. 
      You are requested to login to your account with your mobile number(On which this SMS is received) to stay updated about your fees, exams and events of your school or college. 
      Login by downloading app 'Qviple Community' from playstore or through link: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - From "Qviple"`;

      if (one_user?.userPhoneNumber) {
        const url = `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${one_user?.userPhoneNumber}&message=${e_message}&senderid=QVIPLE&accusage=1&entityid=1701164286216096677&tempid=1707168309247841573`;
        axios
          .post(url)
          .then((res) => {
            if (
              (res && res.data.includes("success")) ||
              res.data.includes("sent")
            ) {
              console.log(
                `Custom SMS Sent Successfully -> ${one_user?.userPhoneNumber}`
              );
            } else {
              console.log("Custom SMS API Bug");
            }
          })
          .catch((e) => {
            console.log(e);
          });
        return true;
      } else if (one_user?.userEmail) {
        const subject = "Qviple ERP Login Details";
        const valid_sname = `${ref?.studentFirstName} ${
          ref?.studentMiddleName ?? ""
        } ${ref?.studentLastName}`;
        const sName = `${valid_sname?.slice(0, 30)}`;
        const iName = `${i_args?.insName?.slice(0, 30)}`;
        const message = `Hello ${sName},
Qviple is ERP software of ${iName}.
You are requested to login to your account with your email ${one_user?.userEmail}.
Stay updated about your fees, exams, events and much more about your school/college.
        
Now know your classmates, teachers and institute to a profound level. And grow your network.
        
Login by Downloading app 'Qviple: Your College Online' from playstore
        
OR
        
Through link : https://play.google.com/store/apps/details?id=com.mithakalminds.qviple
        
Note: 
If you are not able to login or are facing difficulty in login reach out to us at: connect@qviple.com
        
If you have queries regarding your fees, profile information or other, reach out to your institute's appropriate authority or at: ${i_args?.insEmail}

`;
        const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${one_user?.userEmail}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
        const encodeURL = encodeURI(url);
        axios
          .post(encodeURL)
          .then((res) => {
            console.log(
              `Custom Email Sended Successfully -> ${one_user?.userEmail}`
            );
          })
          .catch((e) => {
            console.log("Custom Email API Bug", e.message);
          });
        return true;
      } else {
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const installment_obj = () => {
  try {
    var obj = {
      one_installments: 1,
      two_installments: 2,
      three_installments: 3,
      four_installments: 4,
      five_installments: 5,
      six_installments: 6,
      seven_installments: 7,
      eight_installments: 8,
      nine_installments: 9,
      ten_installments: 10,
      eleven_installments: 11,
      tweleve_installments: 12,
    };
    return obj;
  } catch (e) {
    console.log(e);
  }
};

exports.installment_checker_query = async (count, struct) => {
  try {
    var valid_count = count === "0" ? 0 : parseInt(count);
    var data = installment_obj();
    if (valid_count > 0) {
      struct.one_installments.fees =
        data?.one_installments <= count ? struct?.one_installments?.fees : 0;
      struct.two_installments.fees =
        data?.two_installments <= count ? struct?.two_installments?.fees : 0;
      struct.three_installments.fees =
        data?.three_installments <= count
          ? struct?.three_installments?.fees
          : 0;
      struct.four_installments.fees =
        data?.four_installments <= count ? struct?.four_installments?.fees : 0;
      struct.five_installments.fees =
        data?.five_installments <= count ? struct?.five_installments?.fees : 0;
      struct.six_installments.fees =
        data?.six_installments <= count ? struct?.six_installments?.fees : 0;
      struct.seven_installments.fees =
        data?.seven_installments <= count
          ? struct?.seven_installments?.fees
          : 0;
      struct.eight_installments.fees =
        data?.eight_installments <= count
          ? struct?.eight_installments?.fees
          : 0;
      struct.nine_installments.fees =
        data?.nine_installments <= count ? struct?.nine_installments?.fees : 0;
      struct.ten_installments.fees =
        data?.ten_installments <= count ? struct?.ten_installments?.fees : 0;
      struct.eleven_installments.fees =
        data?.eleven_installments <= count
          ? struct?.eleven_installments?.fees
          : 0;
      struct.tweleve_installments.fees =
        data?.tweleve_installments <= count
          ? struct?.tweleve_installments?.fees
          : 0;
      await struct.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.call_back_urls_redirection_query = async (
  type,
  moduleId,
  paidBy,
  name,
  paidTo,
  amount_nocharges,
  isApk,
  payment_installment,
  payment_card_type,
  payment_remain_1,
  ad_status_id
) => {
  try {
    var url = "";
    if (type === "Fees") {
      url = `${process.env.CALLBACK_URLS}/v1/paytm/verify/internal/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/query/${name}`;
    } else if (type === "Admission") {
      url = `${process.env.CALLBACK_URLS}/v1/paytm/verify/admission/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/install/${payment_installment}/remain/${payment_remain_1}/query/${name}/card/${payment_card_type}/status/${ad_status_id}`;
    } else if (type === "Hostel") {
      url = `${process.env.CALLBACK_URLS}/v1/paytm/verify/hostel/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/install/${payment_installment}/status/${ad_status_id}/query/${name}`;
    } else if (type === "Backlog") {
      url = `${process.env.CALLBACK_URLS}/v1/paytm/verify/backlog/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/query/${name}`;
    } else if (type === "Transport") {
      url = `${process.env.CALLBACK_URLS}/v1/paytm/verify/transport/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/query/${name}`;
    } else if (type === "Participate") {
      url = `${process.env.CALLBACK_URLS}/v1/paytm/verify/participate/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/status/${ad_status_id}/query/${name}`;
    } else if (type === "Direct Admission") {
      url = "";
    } else if (type === "Library Fees") {
      url = "";
    } else {
      url = "";
    }
    return url;
  } catch (e) {
    console.log(e);
  }
};

exports.call_back_urls_redirection_apk_query = async (
  type,
  moduleId,
  paidBy,
  name,
  paidTo,
  amount_nocharges,
  isApk,
  payment_installment,
  payment_card_type,
  payment_remain_1,
  ad_status_id
) => {
  try {
    var url = "";
    if (type === "Fees") {
      url = `${process.env.CALLBACK_URLS}/v1/apk/paytm/verify/internal/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/query/${name}`;
    } else if (type === "Admission") {
      url = `${process.env.CALLBACK_URLS}/v1/apk/paytm/verify/admission/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/install/${payment_installment}/remain/${payment_remain_1}/query/${name}/card/${payment_card_type}/status/${ad_status_id}`;
    } else if (type === "Hostel") {
      url = `${process.env.CALLBACK_URLS}/v1/apk/paytm/verify/hostel/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/install/${payment_installment}/status/${ad_status_id}/query/${name}`;
    } else if (type === "Backlog") {
      url = `${process.env.CALLBACK_URLS}/v1/apk/paytm/verify/backlog/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/query/${name}`;
    } else if (type === "Transport") {
      url = `${process.env.CALLBACK_URLS}/v1/apk/paytm/verify/transport/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/query/${name}`;
    } else if (type === "Participate") {
      url = `${process.env.CALLBACK_URLS}/v1/apk/paytm/verify/participate/fee/${moduleId}/paid/${paidBy}/to/${paidTo}/price/${amount_nocharges}/device/${isApk}/status/${ad_status_id}/query/${name}`;
    } else if (type === "Direct Admission") {
      url = "";
    } else if (type === "Library Fees") {
      url = "";
    } else {
      url = "";
    }
    return url;
  } catch (e) {
    console.log(e);
  }
};

exports.generate_random_code = async () => {
  let rand1 = Math.floor(Math.random() * 9);
  let rand2 = Math.floor(Math.random() * 9);
  let rand3 = Math.floor(Math.random() * 9);
  let rand4 = Math.floor(Math.random() * 9);
  let rand5 = Math.floor(Math.random() * 9);
  let rand6 = Math.floor(Math.random() * 9);
  var pass = `${rand1}${rand2}${rand3}${rand4}${rand5}${rand6}`;
  return pass;
};

exports.remove_duplicated_arr = (arr) => {
  jsonObject = arr.map(JSON.stringify);
  uniqueSet = new Set(jsonObject);
  uniqueArray = Array.from(uniqueSet).map(JSON.parse);
  return uniqueArray;
};

exports.generate_random_code_structure = () => {
  let rand1 = Math.floor(Math.random() * 9);
  let rand2 = Math.floor(Math.random() * 9);
  let rand3 = Math.floor(Math.random() * 9);
  let rand4 = Math.floor(Math.random() * 9);
  let rand5 = Math.floor(Math.random() * 9);
  let rand6 = Math.floor(Math.random() * 9);
  let rand7 = Math.floor(Math.random() * 9);
  let rand8 = Math.floor(Math.random() * 9);
  var pass = `${rand1}${rand3}${rand2}${rand4}${rand6}${rand7}${rand5}${rand8}`;
  return pass;
};

exports.new_chat_username_unique = async (LName) => {
  const u_1 = Math.floor(Math.random() * 9);
  const u_2 = Math.floor(Math.random() * 9);
  const u_3 = Math.floor(Math.random() * 9);
  const u_4 = Math.floor(Math.random() * 9);
  const u_5 = Math.floor(Math.random() * 9);
  const u_6 = Math.floor(Math.random() * 9);
  const u_7 = Math.floor(Math.random() * 9);
  const u_8 = Math.floor(Math.random() * 9);
  const u_9 = Math.floor(Math.random() * 9);
  const new_query = `${u_1}${u_2}${u_3}${u_4}${u_5}${u_6}${u_7}${u_8}${u_9}`;
  let splitted = LName?.split(" ");
  let combined_list = `${splitted[0]?.toLowerCase()}_${new_query}`;
  return combined_list;
};

exports.send_email_student_message_query = (
  email,
  message,
  instituteName,
  studentName
) => {
  const subject = "Qviple Student Message";
  const bodyhtml = `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
  
      <!--[if !mso]><!-->
      <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap">
  
      <style type="text/css">
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
      </style>
      <!--<![endif]-->
  
      <!--[if mso]>
      <style>
          * {
              font-family: sans-serif !important;
          }
      </style>
      <![endif]-->
  
      <title></title>
  
      <!--[if gte mso 9]>
      <xml>
          <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
  
      <style>
          :root {
              color-scheme: light;
              supported-color-schemes: light;
          }
  
          html, body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              overflow-wrap: break-word;
              word-break: break-all;
          }
  
          ul, ol {
              padding: 0;
              margin: 0;
          }
  
          li {
              margin-bottom: 0;
          }
  
          .paragraph {
              font-size: 15px;
              font-family: 'Open Sans', sans-serif;
              color: #5f5f5f;
          }
  
          .heading1 {
              font-size: 32px;
              font-family: 'Open Sans', sans-serif;
              color: #000000;
          }
  
          .heading2 {
              font-size: 26px;
              font-family: 'Open Sans', sans-serif;
              color: #000000;
          }
  
          .heading3 {
              font-size: 19px;
              font-family: 'Open Sans', sans-serif;
              color: #000000;
          }
  
          p a, li a {
              color: #5457FF;
              text-decoration: none;
          }
  
          @media only screen and (max-width: 900px) {
              .contentMainTable, .single-column, .multi-column, .imageBlockWrapper {
                  width: 100% !important;
                  margin: auto !important;
              }
          }
      </style>
  
      <!--[if mso | IE]>
      <style>
          .button-eDjHYThLl2LLTvxBdpbI1 { padding: 16px 32px; };
          .button-eDjHYThLl2LLTvxBdpbI1 a { margin: -16px -32px; };
      </style>
      <![endif]-->
  </head>
  
  <body width="100%" style="margin: 0; padding: 0 !important; background-color: #F5F6F8;">
      <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #F5F6F8;">
          <!--[if mso | IE]>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F6F8;">
          <tbody>
              <tr>
                  <td>
                  <![endif]-->
                      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="900" style="margin: auto;" class="contentMainTable">
                          <!-- Image Block -->
                          <tr>
                              <td style="background-color:#ffffff; padding: 0;" align="center">
                                  <table align="center" width="900" class="imageBlockWrapper" style="width:900px; border-spacing: 0; border-collapse: collapse;" role="presentation">
                                      <tbody>
                                          <tr>
                                              <td style="padding:0">
                                                  <img src="https://api.smtprelay.co/userfile/ab0e9f76-f4d1-4afb-b6af-f543b59ed4e0/Your_paragraph_text_(1)2023-06-02T11_19_32.png" width="900" alt="" style="border-radius: 0; display: block; height: auto; width: 100%; max-width: 100%; border: 0;">
                                              </td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </td>
                          </tr>
                          <!-- Paragraph Block -->
                          <tr>
                              <td valign="top" style="padding: 32px; background-color: #ffffff;">
                                  <p class="paragraph" style="font-family: 'Open Sans', sans-serif; font-size: 15px; line-height: 1.5; color: #5f5f5f;">
                                      Hello <span style="font-weight: bold">${studentName}</span>,<br>
                                      This is the ERP System of <span style="font-weight: bold">${instituteName}</span>.<br><br>
                                      <span style="font-weight: bold">${message?.message_title}:-</span><br>
                                      ${message?.message}
                                  </p>
                              </td>
                          </tr>
                      </table>
                  <!--[if mso | IE]>
                  </td>
              </tr>
          </tbody>
          </table>
          <![endif]-->
      </center>
  </body>
  
  </html>`;

  const formData = {
    to: email,
    from: "connect@qviple.com",
    subject: "Qviple Student Message",
    encodingType: "0",
    from_name: "Qviple",
    bodyhtml: bodyhtml,
  };

  const apiUrl = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}`;

  axios
    .post(apiUrl, querystring.stringify(formData), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      console.log("Email sent successfully:", response.data);
      // return response.data;
    })
    .catch((error) => {
      console.error("Error sending email:", error.message);
    });
  // const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${email}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
  // const encodeURL = encodeURI(url);
  // axios
  //   .post(encodeURL)
  //   .then((res) => {
  //     console.log("Sended Successfully");
  //   })
  //   .catch((e) => {
  //     console.log("SMS API Bug", e.message);
  //   });
};

// console.log(
//   send_email_student_message_query("deepu51196@gmail.com", "Dynamic")
// );

exports.send_email_authentication_custom = async (recipientEmail) => {
  // Create the bodyhtml part of the email
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  const OTP = `${rand1}${rand2}${rand3}${rand4}`;
  const bodyhtml = `
  <!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="x-apple-disable-message-reformatting">
        <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">

        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">

        
        <!--[if !mso]><!-->
          
          <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap">

          <style type="text/css">
          // TODO: fix me!
            @import url(https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap);
        </style>
        
        <!--<![endif]-->

        <!--[if mso]>
          <style>
              // TODO: fix me!
              * {
                  font-family: sans-serif !important;
              }
          </style>
        <![endif]-->
    
        
        <!-- NOTE: the title is processed in the backend during the campaign dispatch -->
        <title></title>

        <!--[if gte mso 9]>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        
    <style>
        :root {
            color-scheme: light;
            supported-color-schemes: light;
        }

        html,
        body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;

            overflow-wrap: break-word;
            -ms-word-break: break-all;
            -ms-word-break: break-word;
            word-break: break-all;
            word-break: break-word;
        }


        
  


  center,
  #body_table {
    
  }

  ul, ol {
    padding: 0;
    margin-top: 0;
    margin-bottom: 0;
  }

  li {
    margin-bottom: 0;
  }

  

  .list-block-list-outside-left li {
    margin-left: 20px !important;
  }

  .list-block-list-outside-right li {
    margin-right: 20px !important;
  }

  
     .paragraph {
      font-size: 15px;
      font-family: Open Sans, sans-serif;
      font-weight: normal;
      font-style: normal;
      text-align: start;
      line-height: 1;
      text-decoration: none;
      color: #5f5f5f;
      
    }
  

     .heading1 {
      font-size: 32px;
      font-family: Open Sans, sans-serif;
      font-weight: normal;
      font-style: normal;
      text-align: start;
      line-height: 1;
      text-decoration: none;
      color: #000000;
      
    }
  

     .heading2 {
      font-size: 26px;
      font-family: Open Sans, sans-serif;
      font-weight: normal;
      font-style: normal;
      text-align: start;
      line-height: 1;
      text-decoration: none;
      color: #000000;
      
    }
  

     .heading3 {
      font-size: 19px;
      font-family: Open Sans, sans-serif;
      font-weight: normal;
      font-style: normal;
      text-align: start;
      line-height: 1;
      text-decoration: none;
      color: #000000;
      
    }
  

     .list {
      font-size: 15px;
      font-family: Open Sans, sans-serif;
      font-weight: normal;
      font-style: normal;
      text-align: start;
      line-height: 1;
      text-decoration: none;
      color: #5f5f5f;
      
    }
  

  p a, 
  li a {
    
  display: inline-block;  
    color: #5457FF;
    text-decoration: none;
    font-style: normal;
    font-weight: normal;

  }

  .button-table a {
    text-decoration: none;
    font-style: normal;
    font-weight: normal;
  }

  .paragraph > span {text-decoration: none;}.heading1 > span {text-decoration: none;}.heading2 > span {text-decoration: none;}.heading3 > span {text-decoration: none;}.list > span {text-decoration: none;}


        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        div[style*="margin: 16px 0"] {
            margin: 0 !important;
        }

        #MessageViewBody,
        #MessageWebViewDiv {
            width: 100% !important;
        }

        table {
            border-collapse: collapse;
            border-spacing: 0;
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }
        table:not(.button-table) {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
        }

        th {
            font-weight: normal;
        }

        tr td p {
            margin: 0;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        a[x-apple-data-detectors],

        .unstyle-auto-detected-links a,
        .aBn {
            border-bottom: 0 !important;
            cursor: default !important;
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        .im {
            color: inherit !important;
        }

        .a6S {
            display: none !important;
            opacity: 0.01 !important;
        }

        img.g-img+div {
            display: none !important;
        }

        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
            u~div .contentMainTable {
                min-width: 320px !important;
            }
        }

        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
            u~div .contentMainTable {
                min-width: 375px !important;
            }
        }

        @media only screen and (min-device-width: 414px) {
            u~div .contentMainTable {
                min-width: 414px !important;
            }
        }
    </style>

    <style>
        @media only screen and (max-device-width: 900px) {
            .contentMainTable {
                width: 100% !important;
                margin: auto !important;
            }
            .single-column {
                width: 100% !important;
                margin: auto !important;
            }
            .multi-column {
                width: 100% !important;
                margin: auto !important;
            }
            .imageBlockWrapper {
                width: 100% !important;
                margin: auto !important;
            }
        }
        @media only screen and (max-width: 900px) {
            .contentMainTable {
                width: 100% !important;
                margin: auto !important;
            }
            .single-column {
                width: 100% !important;
                margin: auto !important;
            }
            .multi-column {
                width: 100% !important;
                margin: auto !important;
            }
            .imageBlockWrapper {
                width: 100% !important;
                margin: auto !important;
            }
        }
    </style>
    <!--[if mso | IE]>
<style>
.button-GayoDUm67tvxnB-vsbIA8 { padding: 16px 32px; };
.button-GayoDUm67tvxnB-vsbIA8 a { margin: -16px -32px; }; </style>
<![endif]-->
    
<!--[if mso | IE]>
    <style>
        .list-block-outlook-outside-left {
            margin-left: -18px;
        }
    
        .list-block-outlook-outside-right {
            margin-right: -18px;
        }

        a:link, span.MsoHyperlink {
            mso-style-priority:99;
            
  display: inline-block;  
    color: #5457FF;
    text-decoration: none;
    font-style: normal;
    font-weight: normal;

        }
    </style>
<![endif]-->


    </head>

    <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #F5F6F8;">
        <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #F5F6F8;">
            <!--[if mso | IE]>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" id="body_table" width="100%" style="background-color: #F5F6F8;">
            <tbody>    
                <tr>
                    <td>
                    <![endif]-->
                        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="900" style="margin: auto;" class="contentMainTable">
                            <tr class="wp-block-editor-imageblock-v1"><td style="background-color:#ffffff;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0" align="center"><table align="center" width="900" class="imageBlockWrapper" style="width:900px;border-spacing:0;border-collapse:collapse" role="presentation"><tbody><tr><td style="padding:0"><img src="https://api.smtprelay.co/userfile/ab0e9f76-f4d1-4afb-b6af-f543b59ed4e0/Your_paragraph_text_(1)2023-06-02T11_19_32.png" width="900" height="" alt="" style="border-radius:0px;display:block;height:auto;width:100%;max-width:100%;border:0" class="g-img"></td></tr></tbody></table></td></tr><tr class="wp-block-editor-paragraphblock-v1"><td valign="top" style="padding:0px 32px 32px 32px;background-color:#ffffff"><p class="paragraph" style="font-family:Open Sans, sans-serif;text-align:left;line-height:30.00px;font-size:15px;margin:0;color:#5f5f5f;word-break:normal">Hello <span style="font-weight: bold" class="bold">"Students_Name"</span>,<br>This is ERP System of <span style="font-weight: bold" class="bold">"Institue_Name"</span><br><br><span style="font-weight: bold" class="bold">"Title of Message":-<br></span>"Message_Content"</p></td></tr><tr class="wp-block-editor-buttonblock-v1" align="left"><td style="background-color:#ffffff;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;width:100%" valign="top"><table role="presentation" cellspacing="0" cellpadding="0" class="button-table"><tbody><tr><td valign="top" class="button-GayoDUm67tvxnB-vsbIA8 button-td button-td-primary" style="cursor:pointer;border:none;border-radius:4px;background-color:#5457ff;font-size:16px;font-family:Open Sans, sans-serif;width:fit-content;text-decoration:none;color:#ffffff;overflow:hidden"><a style="color:#ffffff;display:block;padding:16px 32px 16px 32px">Download Attachement</a></td></tr></tbody></table></td></tr><tr class="wp-block-editor-socialiconsblock-v1" role="article" aria-roledescription="social-icons" style="display:table-row;background-color:#FFFFFF"><td style="width:100%"><table style="background-color:#FFFFFF;width:100%;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px;border-collapse:separate !important" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr><td align="center" valign="top"><div style="max-width:860px"><table role="presentation" style="width:100%" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td valign="top"><div style="margin-left:auto;margin-right:auto;margin-top:-5px;margin-bottom:-5px;width:100%;max-width:208px"><table role="presentation" style="padding-left:326" width="100%" cellpadding="0" cellspacing="0"><tbody><tr><td><table role="presentation" align="left" style="float:left" class="single-social-icon" cellpadding="0" cellspacing="0"><tbody><tr><td valign="top" style="padding-top:5px;padding-bottom:5px;padding-left:10px;padding-right:10px;border-collapse:collapse !important;border-spacing:0;font-size:0"><a class="social-icon--link" href="https://www.facebook.com/Qviple" target="_blank" rel="noreferrer"><img src="https://d2u6lzrmbvw8bs.cloudfront.net/assets/social-icons/facebook/facebook-square-outline-color.png" width="32" height="32" style="max-width:32px;display:block;border:0" alt="Facebook"></a></td></tr></tbody></table><table role="presentation" align="left" style="float:left" class="single-social-icon" cellpadding="0" cellspacing="0"><tbody><tr><td valign="top" style="padding-top:5px;padding-bottom:5px;padding-left:10px;padding-right:10px;border-collapse:collapse !important;border-spacing:0;font-size:0"><a class="social-icon--link" href="https://x.com/qviple1" target="_blank" rel="noreferrer"><img src="https://d2u6lzrmbvw8bs.cloudfront.net/assets/social-icons/x/x-square-outline-color.png" width="32" height="32" style="max-width:32px;display:block;border:0" alt="X (formerly Twitter)"></a></td></tr></tbody></table><table role="presentation" align="left" style="float:left" class="single-social-icon" cellpadding="0" cellspacing="0"><tbody><tr><td valign="top" style="padding-top:5px;padding-bottom:5px;padding-left:10px;padding-right:10px;border-collapse:collapse !important;border-spacing:0;font-size:0"><a class="social-icon--link" href="https://www.youtube.com/@qviple3353" target="_blank" rel="noreferrer"><img src="https://d2u6lzrmbvw8bs.cloudfront.net/assets/social-icons/youtube/youtube-square-outline-color.png" width="32" height="32" style="max-width:32px;display:block;border:0" alt="Youtube"></a></td></tr></tbody></table><table role="presentation" align="left" style="float:left" class="single-social-icon" cellpadding="0" cellspacing="0"><tbody><tr><td valign="top" style="padding-top:5px;padding-bottom:5px;padding-left:10px;padding-right:10px;border-collapse:collapse !important;border-spacing:0;font-size:0"><a class="social-icon--link" href="https://www.linkedin.com/company/qviple/?viewAsMember=true" target="_blank" rel="noreferrer"><img src="https://d2u6lzrmbvw8bs.cloudfront.net/assets/social-icons/linkedin/linkedin-square-outline-color.png" width="32" height="32" style="max-width:32px;display:block;border:0" alt="LinkedIn"></a></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div></td></tr></tbody></table></td></tr><tr><td valign="top" align="center" style="padding:8px 8px 8px 8px;background-color:#FFFFFF"><p aria-label="Unsubscribe" class="paragraph" style="font-family:Open Sans, sans-serif;text-align:center;line-height:22.00px;font-size:11px;margin:0;color:#5f5f5f;word-break:normal">If you no longer wish to receive mail from us, you can <a class="c0c4d759-1c22-48d4-a614-785d6acaf420-6V201gHRzhDxAzaNqZiJS" href="{unsubscribe}" data-type="mergefield" data-id="c0c4d759-1c22-48d4-a614-785d6acaf420-6V201gHRzhDxAzaNqZiJS" data-filename="" style="color: #5457FF; display: inline-block;" data-mergefield-value="unsubscribe" data-mergefield-input-value="">unsubscribe</a>.</p></td></tr><tr class="wp-block-editor-paragraphblock-v1"><td valign="top" style="padding:12px 12px 12px 12px;background-color:#FFFFFF"><p class="paragraph" style="font-family:Open Sans, sans-serif;text-align:center;line-height:11.50px;font-size:10px;margin:0;color:#5f5f5f;word-break:normal">Unable to view? Read it <a href="{view}" data-type="mergefield" data-id="62d10d6d-b252-49a7-af10-c771dbd58b15-Xzt0XJLlayJkgPI0XyMI5" data-filename="" class="62d10d6d-b252-49a7-af10-c771dbd58b15-Xzt0XJLlayJkgPI0XyMI5" data-mergefield-value="view" data-mergefield-input-value="" style="color: #5457FF; display: inline-block;">Online</a></p></td></tr><tr class="wp-block-editor-imageblock-v1"><td style="background-color:#ffffff;padding-top:0;padding-bottom:0;padding-left:0;padding-right:0" align="center"><table align="center" width="900" class="imageBlockWrapper" style="width:900px;border-spacing:0;border-collapse:collapse" role="presentation"><tbody><tr><td style="padding:0"><img src="https://api.smtprelay.co/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/n_footer-default.png" width="900" height="" alt="" style="border-radius:0px;display:block;height:auto;width:100%;max-width:100%;border:0" class="g-img"></td></tr></tbody></table></td></tr>
                        </table>
                    <!--[if mso | IE]>
                    </td>
                </tr>
            </tbody>
            </table>
            <![endif]-->
        </center>
    </body>
</html>
  `;

  // Prepare the form data
  const formData = {
    to: recipientEmail,
    from: "connect@qviple.com",
    subject: "OTP Verification",
    encodingType: "0",
    from_name: "Qviple",
    bodyhtml: bodyhtml,
  };

  try {
    // Make the POST request
    const apiUrl = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}`;

    axios
      .post(apiUrl, querystring.stringify(formData), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => {
        console.log("Email sent successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error sending email:", error.message);
      });

    return OTP;
    // Log response or return as needed
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

// console.log(
//   send_email_authentication_promotional("pankajphad.stuff@gmail.com")
// );

// console.log(send_email_authentication_custom("pankajphad.stuff@gmail.com"));

// console.log(await student_sms_trigger_query(ins, cid))

// const dataa = () => {
//   const new_user_pass = bcrypt.genSaltSync(12);
//   const hash_user_pass = bcrypt.hashSync("Hello12@#", new_user_pass);
//   console.log(hash_user_pass);
// };
// dataa();

// const bug = (a1, a2, p1) => {
//   if (p1 <= a1 && p1 <= a2) {
//     return true;
//   } else {
//     return false;
//   }
// };

// console.log(bug(5000, 3000, 3000));
