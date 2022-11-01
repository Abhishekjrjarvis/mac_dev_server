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