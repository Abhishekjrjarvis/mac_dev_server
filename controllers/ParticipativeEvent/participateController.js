const Department = require('../../models/Department')
const User = require('../../models/User')
const Student = require('../../models/Student')
const StudentNotification = require('../../models/Marks/StudentNotification')
const invokeMemberTabNotification = require('../../firebase/MemberTab')
const Participate = require('../../models/ParticipativeEvent/participate')
const Class = require('../../models/Class')

exports.retrieveNewParticipateQuery = async(req, res) => {
    try{
        const { did } = req.params
        var depart = await Department.findById({_id: did})
        var part = new Participate({...req.body})
        depart.participate_event.push(part._id)
        depart.participate_event_count += 1
        part.department = depart._id
        part.event_app_last_date = new Date(`${req.body?.lastDate}`).toISOString()
        part.event_date = new Date(`${req.body?.date}`).toISOString()
        part.event_classes.push(req.body?.classes)
        await Promise.all([ depart.save(), part.save() ])
        res.status(200).send({ message: 'New Participate Event Application will be available', status: true})

        var all_student = await Student.find({ _id: { $in: depart?.ApproveStudent }}).select('user notification')
        all_student?.forEach(async (ele) => {
            const notify = new StudentNotification({});
            const user = await User.findById({_id: `${ele?.user}`}).select('activity_tab deviceToken')
            notify.notifyContent = `New ${part.event_name} Event will be held on ${part.event_date}`;
            notify.notifySender = depart._id;
            notify.notifyReceiever = user._id;
            notify.participateEventId= part?._id;
            notify.notifyType = "Student";
            notify.participate_event_type = 'New Participate Event App'
            notify.notifyPublisher = ele._id;
            user.activity_tab.push(notify._id);
            ele.notification.push(notify._id);
            notify.notifyByDepartPhoto = depart._id;
            notify.notifyCategory = "Participate Event";
            notify.redirectIndex = 13;
            invokeMemberTabNotification(
            "Student Activity",
            notify,
            "New Participative Event Application",
            user._id,
            user.deviceToken,
            "Student",
            notify
            );
            await Promise.all([ele.save(), notify.save(), user.save()]);
        })
    }
    catch(e){
        console.log(e)
    }
}

exports.retrieveAllParticipateEventQuery = async(req, res) => {
    try{
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const part = await Participate.find({})
        .sort('-created_at')
        .limit(limit)
        .skip(skip)
        .select('event_name event_fee event_app_last_date event_date')
        if(part?.length > 0){
            res.status(200).send({ message: 'All Upcoming Participate Event', part: part })
        }
        else{
            res.status(200).send({ message: 'No Upcoming Participate Event', part: [] })
        }
    }
    catch(e){
        console.log(e)
    }
}

exports.retrieveOneParticipateEventQuery = async(req, res) => {
    try{
        const { pid } = req.params
        const part = await Participate.find({_id: pid})
        .select('event_name event_date event_fee event_about event_app_last_date event_fee_critiria event_checklist_critiria event_ranking_critiria')
        .populate({
            path: 'event_classes',
            select: 'className classTitle studentCount'
        })
        res.status(200).send({ message: 'One Participate Event Process Query ', part: part })
    }
    catch(e){
        console.log(e)
    }
}

exports.retrieveAllParticipateEventStudent = async(req, res) => {
    try{
        var event = []
        const { pid } = req.params
        const part = await Participate.findById({_id: pid}).select('id')
        .populate({
            path: 'event_classes',
            populate: {
                path: 'ApproveStudent',
                select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO'
            },
            select: '_id'
        })
        part?.event_classes?.forEach(async (classId) => {
            event.push(...classId?.ApproveStudent)
        })
        if(event?.length >= 0){
            res.status(200).send({ message: 'All Participate Event Student', event })
        }
        else{
            res.status(200).send({ message: 'No Participate Event Student', event: [] })
        }
    }
    catch(e){
        console.log(e)
    }
}

exports.retrieveChecklistParticipateEventStudent = async(req, res) => {
    try{
        const { pid, sid } = req.params
        var part = await Participate.findById({_id: pid})
        var depart = await Department.findById({_id: `${part.department}`})
        var student = await Student.findById({_id: sid})
        if(part.event_checklist_critiria === 'Yes'){
            part.event_checklist.push({
                student: student._id,
                checklist_status: 'Alloted'
            })
            part.assigned_checklist_count += 1
            await part.save()
            res.status(200).send({ message: 'Checklist Assigned By Department Head for Participative Event', check: true})
            const notify = new StudentNotification({});
            const user = await User.findById({_id: `${student?.user}`}).select('activity_tab deviceToken')
            notify.notifyContent = `New Checklist Item assigned for ${part.event_name} on ${event_date}`;
            notify.notifySender = depart._id;
            notify.notifyReceiever = user._id;
            notify.participateEventId= part?._id;
            notify.notifyType = "Student";
            notify.participate_event_type = 'New Participate Event Checklist'
            notify.notifyPublisher = student._id;
            user.activity_tab.push(notify._id);
            student.notification.push(notify._id);
            notify.notifyByDepartPhoto = depart._id;
            notify.notifyCategory = "Participate Event";
            notify.redirectIndex = 13;
            invokeMemberTabNotification(
            "Student Activity",
            notify,
            "Assigned Participative Event Checklist",
            user._id,
            user.deviceToken,
            "Student",
            notify
            );
            await Promise.all([student.save(), notify.save(), user.save()]);
        }
        else{
            res.status(200).send({ message: 'Checklist Not Enable', check: false})
        }
    }
    catch(e){
        console.log(e)
    }
}

// Student Participant Extra Point Remain Given Result Declare (AutoRefresh)
exports.retrieveResultParticipateEventStudent = async(req, res) => {
    try{
        const { pid, sid } = req.params
        const { rank } = req.query
        var part = await Participate.findById({_id: pid})
        var depart = await Department.findById({_id: `${part.department}`})
        var student = await Student.findById({_id: sid})
        if(part.event_ranking_critiria === 'Yes'){
            part.event_rank.push({
                student: student._id,
                rank_title: rank,
                points: rank === 'Winner' ? 25 : rank === 'Ist Runner' ? 15 : rank === 'IInd Runner' ? 5 : 5
            })
            if(rank === 'Winner'){
                student.extraPoints += 20
            }
            else if(rank === 'Ist Runner'){
                student.extraPoints += 10
            }
            else{}
            await Promise.all([ part.save(), student.save() ])
            res.status(200).send({ message: 'Result Declared By Department Head for Participative Event', result: true})
            
            var all_student = await Student.find({ _id: { $in: depart?.ApproveStudent }}).select('user studentFirstName notification')
            all_student?.forEach(async (ele) => {
                const notify = new StudentNotification({});
                const user = await User.findById({_id: `${ele?.user}`}).select('activity_tab deviceToken')
                notify.notifyContent = `${ele.studentFirstName} is the ${rank} of ${part.event_name}`;
                notify.notifySender = depart._id;
                notify.notifyReceiever = user._id;
                notify.participateEventId= part?._id;
                notify.notifyType = "Student";
                notify.participate_event_type = 'Result Participate Event'
                notify.notifyPublisher = ele._id;
                user.activity_tab.push(notify._id);
                ele.notification.push(notify._id);
                notify.notifyByDepartPhoto = depart._id;
                notify.notifyCategory = "Participate Event";
                notify.redirectIndex = 13;
                invokeMemberTabNotification(
                "Student Activity",
                notify,
                "Result Declaration",
                user._id,
                user.deviceToken,
                "Student",
                notify
                );
                await Promise.all([ele.save(), notify.save(), user.save()]);
            })
        }
        else{
            res.status(200).send({ message: 'Result Not Declared', result: false})
        }
    }
    catch(e){
        console.log(e)
    }
}