const { universal_random_password } = require("../../Custom/universalId")
const encryptionPayload = require("../../Utilities/Encrypt/payload")
const { connect_redis_miss, connect_redis_hit } = require("../../config/redis-config")
const { generateAccessToken } = require("../../helper/functions")
const Admission = require("../../models/Admission/Admission")
const Alumini = require("../../models/Alumini/Alumini")
const Class = require("../../models/Class")
const Department = require("../../models/Department")
const EventManager = require("../../models/Event/eventManager")
const Finance = require("../../models/Finance")
const Hostel = require("../../models/Hostel/hostel")
const Library = require("../../models/Library/Library")
const Staff = require("../../models/Staff")
const Student = require("../../models/Student")
const Subject = require("../../models/Subject")
const Transport = require("../../models/Transport/transport")
const User = require("../../models/User")

exports.random_module_unique_id = async(req, res) => {
    try{
        // const all_staff = await Staff.find({})
        // for(var all of all_staff){
        //     const code = universal_random_password()
        //     all.member_module_unique = `${code}`
        //     await all.save()
        // }

        // const all_student = await Student.find({})
        // for(var all of all_student){
        //     const code = universal_random_password()
        //     all.member_module_unique = `${code}`
        //     await all.save()
        // }

        const depart = await Department.find({})
        for(var all of depart){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const classes = await Class.find({})
        for(var all of classes){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const subject = await Subject.find({})
        for(var all of subject){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const finance = await Finance.find({})
        for(var all of finance){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const hostel = await Hostel.find({})
        for(var all of hostel){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const ads = await Admission.find({})
        for(var all of ads){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const libs = await Library.find({})
        for(var all of libs){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const event = await EventManager.find({})
        for(var all of event){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const trans = await Transport.find({})
        for(var all of trans){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        const alumini = await Alumini.find({})
        for(var all of alumini){
            const code = universal_random_password()
            all.member_module_unique = `${code}`
            await all.save()
        }

        res.status(200).send({ message: "Explore Random Module Unique ID", access: true})
        // const all_depart = await Department.find({})
    }
    catch(e){
        console.log(e)
    }
}

exports.loginUsernameQuery = async(req, res) => {
    try{
        const { username } = req?.query
        if(!username) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

        const user = await User.findOne({ username: `${username}`})
        .select("username userLegalName photoId profilePhoto userPassword last_login is_developer")

        if(user?._id){
        const token = generateAccessToken(
            user?.username,
            user?._id,
            user?.userPassword
          );
          const custom_user = {
            username: user?.username,
            userLegalName: user?.userLegalName,
            profilePhoto: user?.profilePhoto,
            _id: user?._id
          }
          const admin_encrypt = {
            token: `Bearer ${token}`,
            user: custom_user,
            login: true,
            is_developer: user?.is_developer,
          }
        //   const loginEncrypt = await encryptionPayload(admin_encrypt);
          res.status(200).send({ 
            token: `Bearer ${token}`,
            user: custom_user,
            login: true,
            is_developer: user?.is_developer,
          });
          user.last_login = new Date();
          await user.save();
        }
        else{
            const admin_encrypt = {
                message: "Invalid User"
              }
              const loginEncrypt = await encryptionPayload(admin_encrypt);
            res.status(200).send({ encrypt: loginEncrypt, admin_encrypt });
        }
    }
    catch(e){
        console.log(e)
    }
}

exports.memberSequencingQuery = async(req, res) => {
    try{
        const { member } = req?.query
        if(!member) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        const is_staff_cache = await connect_redis_hit(`Member-Staff-${member}`);
        const is_student_cache = await connect_redis_hit(`Member-Student-${member}`);
        if (is_staff_cache?.hit)
        return res.status(200).send({
            message: "All Detail Staff Member Sequencing from Cache 🙌",
            member: is_staff_cache,
            member_type: "Staff"
        });

        if (is_student_cache?.hit)
        return res.status(200).send({
            message: "All Detail Student Member Sequencing from Cache 🙌",
            member: is_student_cache,
            member_type: "Student"
        });

        const staff = await Staff.findOne({ member_module_unique: `${member}`})
        .select("member_module_unique")

        const student = await Student.findOne({ member_module_unique: `${member}` })
        .select("member_module_unique")

        
        if(staff?._id){
            const cached = await connect_redis_miss(
                `Member-Staff-${member}`,
                staff
                );
            res.status(200).send({ message: "All Detail Staff Member Sequencing from DB 🙌", access: true, member: cached?._doc, member_type: "Staff"})
        }
        else if(student?._id){
            const cached = await connect_redis_miss(
                `Member-Student-${member}`,
                student
                );
            res.status(200).send({ message: "All Detail Student Member Sequencing from DB 🙌", access: true, member: cached?._doc, member_type: "Student"})
        }
        else{
            res.status(200).send({ message: "No Detail Member Sequencing from DB 🙌", access: true, member_type: ""})
        }
    }
    catch(e){
        console.log(e)
    }
}

exports.moduleSequencingQuery = async(req, res) => {
    try{
        const { module, module_type } = req?.query
        if(!module) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

        
        if(`${module_type}` === "DEPARTMENT"){
            var depart = await Department.findOne({ member_module_unique: `${module}`})
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: depart, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "CLASS"){
            var classes = await Class.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: classes, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "SUBJECT"){
            var subject = await Subject.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: subject, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "FINANCE"){
            var finance = await Finance.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: finance, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "ADMISSION"){
            var admission = await Admission.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: admission, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "HOSTEL"){
            var hostel = await Hostel.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: hostel, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "LIBRARY"){
            var libs = await Library.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: libs, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "EVENT"){
            var event = await EventManager.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: event, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "ALUMINI"){
            var alumini = await Alumini.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: alumini, 
                module_type: module_type
            })
        }
        else if(`${module_type}` === "TRANSPORT"){
            var trans = await Transport.findOne({ member_module_unique: `${module}` })
            .select("member_module_unique")
            res.status(200).send({ 
                message: `Explore ${module_type} Query`, 
                access: true, 
                module: trans, 
                module_type: module_type
            })
        }
        else {
            console.log("ERROR")
        }
        
    }
    catch(e){
        console.log(e)
    }
}