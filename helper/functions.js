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

exports.send_email_student_message_query = (email, message) => {
  const subject = "Qviple Student Message";
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

exports.send_email_authentication_custom = async function (recipientEmail) {
  // Create the bodyhtml part of the email
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  const OTP = `${rand1}${rand2}${rand3}${rand4}`;
  const bodyhtml = `
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
      <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css">
  </head>
  <body style="padding:0; margin:0; background:#e4e6ec;">
      <table style="height:100%; width:100%; background-color:rgb(228, 230, 236);" align="center">
          <tbody>
              <tr>
                  <td valign="top" id="dbody" data-version="2.31" style="width:100%; height:100%; margin-top:50px; margin-bottom:50px; padding-top:0px; padding-bottom:0px; background-color:rgb(228, 230, 236);">
                      <table class="layer_1" align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:588px; box-sizing:border-box; width:100%; margin:0px auto;">
                          <tbody>
                              <tr>
                                  <td class="drow" valign="top" align="center" style="background-color:rgb(255, 255, 255); box-sizing:border-box; font-size:0px; text-align:center;">
                                      <div class="layer_2" style="max-width:588px; display:inline-block; vertical-align:top; width:100%;">
                                          <table border="0" cellspacing="0" cellpadding="0" class="edcontent" style="border-collapse:collapse;width:100%">
                                              <tbody>
                                                  <tr>
                                                      <td valign="top" class="edimg" style="padding:0px; box-sizing:border-box; text-align:center;">
                                                          <img src="https://api.smtprelay.co/userfile/ab0e9f76-f4d1-4afb-b6af-f543b59ed4e0/Group_41_(3).png" alt="Image" style="border-width:0px; border-style:none; max-width:401px; width:100%;" width="401">
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </div>
                                  </td>
                              </tr>
                              <tr>
                                  <td class="drow" valign="top" align="center" style="background-color:rgb(255, 255, 255); box-sizing:border-box; font-size:0px; text-align:center;">
                                      <div class="layer_2" style="max-width:588px; display:inline-block; vertical-align:top; width:100%;">
                                          <table border="0" cellspacing="0" class="edcontent" style="border-collapse:collapse;width:100%">
                                              <tbody>
                                                  <tr>
                                                      <td valign="top" class="edtext" style="padding:20px; text-align:left; color:rgb(95, 95, 95); font-size:12px; font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break:break-word; direction:ltr; box-sizing:border-box;">
                                                          <p style="margin:0px; padding:0px;">
                                                              <span style="color:#000000;">To Verify your email address, please use the following One Time Password (OTP):</span>
                                                          </p>
                                                          <p style="margin:0px; padding:0px;"><br></p>
                                                          <p class="style3" style="margin:0px; padding:0px; color:rgb(68, 68, 68); font-size:16px; line-height:normal; font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                                              <strong>${OTP}</strong>
                                                          </p>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </div>
                                  </td>
                              </tr>
                              <tr>
                                  <td class="drow" valign="top" align="center" style="background-color:rgb(255, 255, 255); box-sizing:border-box; font-size:0px; text-align:center;">
                                      <div class="layer_2" style="max-width:588px; display:inline-block; vertical-align:top; width:100%;">
                                          <table border="0" cellspacing="0" class="edcontent" style="border-collapse:collapse;width:100%">
                                              <tbody>
                                                  <tr>
                                                      <td valign="top" class="edtext" style="padding:20px; text-align:left; color:rgb(95, 95, 95); font-size:12px; font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break:break-word; direction:ltr; box-sizing:border-box;">
                                                          <p style="margin:0px; padding:0px;">
                                                              <span style="color:#000000;">Do not share this OTP with anyone. Qviple never calls to ask for OTP. Qviple takes your account security very seriously. Qviple Customer Service will never ask you to disclose or verify your Qviple password, OTP, credit card, or banking account number. If you receive a suspicious email with a link to update your account information, do not click on the link—instead, report the email to Qviple for investigation.</span>
                                                          </p>
                                                          <p style="margin:0px; padding:0px;"><br></p>
                                                          <p style="margin:0px; padding:0px;">
                                                              <span style="color:#000000;">Thank you!</span>
                                                          </p>
                                                          <p style="margin:0px; padding:0px;"><font color="#000000">Team Qviple</font></p>
                                                          <p style="margin:0px; padding:0px;"><br></font></p>
                                                          <p style="margin:0px; padding:0px;"><font color="#000000">Kindly do not share your OTP, as it is confidential.</font></p>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </div>
                                  </td>
                              </tr>
                              <tr>
                                  <td class="drow" valign="top" align="center" style="background-color:rgb(255, 255, 255); box-sizing:border-box; font-size:0px; text-align:center;">
                                      <div class="layer_2" style="max-width:588px; display:inline-block; vertical-align:top; width:100%;">
                                          <table border="0" cellspacing="0" class="edcontent" style="border-collapse:collapse;width:100%">
                                              <tbody>
                                                  <tr>
                                                      <td valign="top" class="edsocialfollow" style="padding:20px;">
                                                          <table align="center" style="margin:0 auto" class="edsocialfollowcontainer" cellpadding="0" border="0" cellspacing="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td>
                                                                          <table align="left" border="0" cellpadding="0" cellspacing="0" data-service="facebook">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="center" valign="middle" style="padding:10px;">
                                                                                          <a href="https://www.facebook.com/Qviple" target="_blank" style="color:;font-size:12px;font-family:">
                                                                                              <img src="https://api.etrck.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/ro_sol_li_32_facebook.png" style="display:block; width:100%; max-width:32px; border:none;" alt="Facebook" width="32">
                                                                                          </a>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                          <table align="left" border="0" cellpadding="0" cellspacing="0" data-service="twitter">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="center" valign="middle" style="padding:10px;">
                                                                                          <a href="https://twitter.com/Qviple1" target="_blank" style="color:;font-size:12px;font-family:">
                                                                                              <img src="https://api.etrck.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/ro_sol_li_32_twitter.png" style="display:block; width:100%; max-width:32px; border:none;" alt="Twitter" width="32">
                                                                                          </a>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                          <table align="left" border="0" cellpadding="0" cellspacing="0" data-service="instagram">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="center" valign="middle" style="padding:10px;">
                                                                                          <a href="https://www.instagram.com/qviple/" target="_blank" style="color:;font-size:12px;font-family:">
                                                                                              <img src="https://api.etrck.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/ro_sol_li_32_instagram.png" style="display:block; width:100%; max-width:32px; border:none;" alt="Instagram" width="32">
                                                                                          </a>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                          <table align="left" border="0" cellpadding="0" cellspacing="0" data-service="linkedin">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td align="center" valign="middle" style="padding:10px;">
                                                                                          <a href="https://www.linkedin.com/company/qviple" target="_blank" style="color:;font-size:12px;font-family:">
                                                                                              <img src="https://api.etrck.com/userfile/a18de9fc-4724-42f2-b203-4992ceddc1de/ro_sol_li_32_linkedin.png" style="display:block; width:100%; max-width:32px; border:none;" alt="LinkedIn" width="32">
                                                                                          </a>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                      </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </div>
                                  </td>
                              </tr>
                              <tr>
                                  <td class="drow" valign="top" align="center" style="background-color:rgb(228, 230, 236); box-sizing:border-box; font-size:0px; text-align:center;">
                                      <div class="layer_2" style="max-width:588px; display:inline-block; vertical-align:top; width:100%;">
                                          <table border="0" cellspacing="0" cellpadding="0" class="edcontent" style="border-collapse:collapse;width:100%">
                                              <tbody>
                                                  <tr>
                                                      <td valign="top" class="edtext" style="padding:10px; text-align:center; color:rgb(158, 158, 158); font-size:12px; font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; word-break:break-word; direction:ltr; box-sizing:border-box;">
                                                          <p style="margin:0px; padding:0px;">
                                                              <span style="color:#000000;">Copyright © 2023, Qviple, All rights reserved.</span>
                                                          </p>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </div>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>
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
        // return response.data;
      })
      .catch((error) => {
        console.error("Error sending email:", error.message);
      });

    // Log response or return as needed
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

// console.log(
//   send_email_authentication_promotional("pankajphad.stuff@gmail.com")
// );

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
