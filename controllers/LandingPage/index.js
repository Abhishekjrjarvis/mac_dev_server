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
        const touch = new GetTouch({...req.body})
        admin.getTouchUsers.push(touch._id)
        await Promise.all([
            touch.save(),
            admin.save()
        ])
        sendAnEmail(`${touch.endUserName}`, `${touch.endUserEmail}`)
        res.status(200).send({ message: 'Uploaded'})
    }
    catch{

    }
}



exports.uploadUserCareerDetail = async(req, res) =>{
    try{
        const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
        const file = req.file;
        const results = await uploadDocFile(file);
        const career = new Career({...req.body})
        career.endUserResume = results.key;
        admin.careerUserArray.push(career._id)
        await Promise.all([
            career.save(),
            admin.save()
        ])
        await unlinkFile(file.path);
        sendAnEmail(`${career.endUserName}`, `${career.endUserEmail}`)
        res.status(200).send({ message: 'Uploaded'})
    }
    catch{

    }
}


// sendAnEmail('Pankaj Jr.', 'pankajphad.stuff@gmail.com')