const { shuffleArray } = require("../Utilities/Shuffle");
const Admin = require("../models/superAdmin");
const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcryptjs");

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
      console.log("SMS API Bug", e);
    });
  return OTP;
};

const send_email_authentication_promotional = (email) => {
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  const OTP = `${rand1}${rand2}${rand3}${rand4}`;
  const subject = "Qviple ERP Login Details";

  const message = `Hello Pankaj Phad,
Qviple is ERP software of Mithkal Minds.
You are requested to login to your account with your email ${email} (on which this e-mail is received).
Stay updated about your fees, exams, events and much more about your school/college.

Now know your classmates, teachers and institute to a profound level. And grow your network.

Login by Downloading app 'Qviple: Your College Online' from playstore

OR

Through link : https://play.google.com/store/apps/details?id=com.mithakalminds.qviple


Note: 
If you are not able to login or are facing difficulty in login reach out to us at: connect@qviple.com
  
If you have queries regarding your fees, profile information or other, reach out to your institute's appropriate authority or at: pankaj@qviple.com

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
  return OTP;
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
