const { shuffleArray } = require("../Utilities/Shuffle");
const Admin = require("../models/superAdmin");
const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcryptjs");

const random_password = () => {
  const upperCase = ["A", "B", "C", "D", "E", "F", "G", "H", "Z"];
  const lowerCase = ["i", "j", "k", "l", "m", "n", "o", "p", "W"];
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  const exp = [".", "_", "@", "#", "$", "!", "%", "&", "*"];
  const u_1 = Math.floor(Math.random() * 9);
  const u_2 = Math.floor(Math.random() * 9);
  const u_3 = Math.floor(Math.random() * 9);
  const u_4 = Math.floor(Math.random() * 9);
  const u_5 = Math.floor(Math.random() * 9);
  const u_6 = Math.floor(Math.random() * 9);
  const u_7 = Math.floor(Math.random() * 9);
  const u_8 = Math.floor(Math.random() * 9);
  const u_9 = Math.floor(Math.random() * 9);
  const userExp = `${lowerCase[u_1]}${upperCase[u_2]}${digits[u_3]}${upperCase[u_4]}${exp[u_6]}${digits[u_5]}${lowerCase[u_8]}${exp[u_7]}${exp[u_9]}`;
  return userExp;
};

exports.filter_unique_username = async (name, dob) => {
  const new_query = `${dob?.substring(5, 7)}${dob?.substring(8, 10)}`.split("");
  const shuffle_date = shuffleArray(new_query);
  const combined_name = `${name?.trim()}_${shuffle_date.join("")}`;
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
