const GetTouch = require('../../models/LandingModel/GetTouch')
const Career = require('../../models/LandingModel/Career')
const Admin = require('../../models/superAdmin')
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const sendAnEmail = require('../../Service/email.js')

exports.uploadGetTouchDetail = async(req, res) =>{
    try{
        const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
        const check_touch = await GetTouch.findOne({ endUserEmail: req.body.endUserEmail})
        if(check_touch){
            res.status(200).send({ message: 'Email Already Registered', status: false})
        }
        else{
            const touch = new GetTouch({...req.body})
            admin.getTouchUsers.push(touch._id)
            admin.getTouchCount += 1
            await Promise.all([
                touch.save(),
                admin.save()
            ])
            sendAnEmail(`${touch.endUserName}`, `${touch.endUserEmail}`)
            res.status(200).send({ message: 'Uploaded', status: true})
        }
    }
    catch{

    }
}



exports.uploadUserCareerDetail = async(req, res) =>{
    try{
        const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
        const file = req.file;
        const results = await uploadDocFile(file);
        const check_career = await Career.findOne({ endUserEmail: req.body.endUserEmail })
        if(check_career){
            res.status(200).send({ message: 'Email Already Registered', status: false})
        }
        else{
            const career = new Career({...req.body})
            career.endUserResume = results.key;
            admin.careerUserArray.push(career._id)
            admin.careerCount += 1
            await Promise.all([
                career.save(),
                admin.save()
            ])
            await unlinkFile(file.path);
            sendAnEmail(`${career.endUserName}`, `${career.endUserEmail}`)
            res.status(200).send({ message: 'Uploaded', status: true})
        }
    }
    catch{

    }
}

// const axios = require("axios");
// var dynamic_data = "Bhaiya Dooj/Bhai Dooj, Bhau-Beej/Bhai Phonta is a festival which is celebrated among Hindus of India, Nepal and other countries on the second lunar day of the Shukla Paksha of the Kartika month of Vikram Samvat Hindu calendar. The occasion falls on the last day of the five day long celebrations of Diwali🪔✨. It is also celebrated as 'Yama Dwitiya'."
// const encodedParams = new URLSearchParams();
// encodedParams.append("q", `${dynamic_data}`);
// encodedParams.append("target", "hi");
// encodedParams.append("source", "en");

// const options = {
//   method: 'POST',
//   url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
//   headers: {
//     'content-type': 'application/x-www-form-urlencoded',
//     'Accept-Encoding': 'application/gzip',
//     'X-RapidAPI-Key': 'fc7ed05a15msh3985985ec5ef152p14a24cjsn91c90e91c1e9',
//     'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
//   },
//   data: encodedParams
// };

// axios.request(options).then(function (response) {
// 	console.log(response?.data?.data?.translations[0]?.translatedText);
// }).catch(function (error) {
// 	console.error(error);
// });