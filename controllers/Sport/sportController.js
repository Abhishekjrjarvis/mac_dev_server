const InstituteAdmin = require('../../models/InstituteAdmin')
const Sport = require('../../models/Sport')
const Staff = require('../../models/Staff')
const Notification = require('../../models/notification')
const SportClass = require('../../models/SportClass')
const SportEvent = require('../../models/SportEvent')
const SportEventMatch = require('../../models/SportEventMatch')
const SportTeam = require('../../models/SportTeam')
const Student = require('../../models/Student')
const User = require('../../models/User')
const invokeFirebaseNotification = require("../../Firebase/firebase")
const { uploadDocFile } = require('../../S3Configuration')
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

exports.getSportDepart = async(req, res) =>{
    try {
        const { id, sid } = req.params;
        const institute = await InstituteAdmin.findById({ _id: id });
        const staff = await Staff.findById({ _id: sid });
        const user = await User.findById({ _id: `${staff.user}` });
        const sport = new Sport({});
        const notify = new Notification({})
        staff.sportDepartment.push(sport._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = 'Sport & Arts Head';
        sport.sportHead = staff._id;
        institute.sportDepart.push(sport._id);
        institute.sportStatus = 'Enable'
        sport.institute = institute._id;
        notify.notifyContent = `you got the designation as Sport & Arts Head`;
        notify.notify_hi_content = `आपको खेल और कला प्रमुख प्रशिक्षक के रूप में पदनाम मिला है |`
        notify.notify_mr_content = `तुम्हाला क्रीडा आणि कला मुख्य प्रशिक्षक म्हणून पद मिळाले आहे.`
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByInsPhoto = institute._id;
        invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([
          institute.save(),
          sport.save(),
          staff.save(),
          user.save(),
          notify.save()
        ])
        res.status(200).send({
          message: "Successfully Assigned Staff",
          sport: sport._id,
          status: true
        });
      } catch(e) {
        console.log(e);
      }
      
}

exports.retrieveSportDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const sport = await Sport.findById({ _id: id })
          .select('sportName sportPhoneNumber sportAbout sportEmail photoId coverId photo cover sportClassCount sportEventCount sportMemberCount sportTeamCount')
          .populate({
            path: "sportHead",
            select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
          })
          .populate({
            path: "institute",
            select: 'insName'
          })
          .lean()
          .exec()
        res.status(200).send({ message: "All Master Sport Details  👍", sport });
      } catch(e) {
        console.log(e);
      }
}

exports.retrieveSportDetailEvent = async(req, res) =>{
  try {
    const { status } = req.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params
    const skip = (page - 1) * limit;
    
    const sport = await Sport.findById({_id: id})
    .select('sportEvent')

    const event = await SportEvent.find({ $and: [{ _id: { $in: sport?.sportEvent}}, { sportEventStatus: `${status}` }]})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .select('sportEventName sportEventCategory sportEventPlace sportEventDate sportEventDescription sportEventProfilePhoto photoId')
    
    if(event?.length > 0 ){
      res.status(200).send({ message: "Let's Explore Sport Event data 👍", event });
    }
    else{
      res.status(200).send({ message: "No Sport Event data 😒", event: [] });
    }
    
    } catch(e) {
      console.log(e);
    }
}


exports.retrieveSportDetailClass = async(req, res) =>{
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params
    const skip = (page - 1) * limit;
    
    const sport = await Sport.findById({_id: id})
    .select('sportClass')

    const classes = await SportClass.find({ $and: [{ _id: { $in: sport?.sportClass}}]})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .select('sportClassName')
    
    if(classes?.length > 0 ){
      res.status(200).send({ message: "Let's Explore Sport Class data 👍", classes });
    }
    else{
      res.status(200).send({ message: "No Sport Class data 😒", classes: [] });
    }
    
    } catch(e) {
      console.log(e);
    }
}

exports.getSportClass = async(req, res) =>{
    try {
        const { id, sid } = req.params;
        const { staffId } = req.body;
        const institute = await InstituteAdmin.findById({ _id: id });
        const sport = await Sport.findById({ _id: sid });
        const staff = await Staff.findById({ _id: staffId });
        const user = await User.findById({ _id: `${staff.user}` });
        const sportClasses = new SportClass({...req.body});
        const notify = new Notification({})
        sport.sportClass.push(sportClasses._id);
        sport.sportClassCount += 1
        sportClasses.sportClassHead = staff._id;
        institute.sportClassDepart.push(sportClasses._id);
        institute.sportClassStatus = 'Enable'
        sportClasses.institute = institute._id;
        staff.staffSportClass.push(sportClasses._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = 'Sport & Arts Class Head';
        sportClasses.sportDepartment = sport._id;
        notify.notifyContent = `you got the designation of ${sportClasses.sportClassName} as Class Head`;
        notify.notify_hi_content = `आपको प्रशिक्षक के रूप में ${sportClasses.sportClassName} का पदनाम मिला है |`
        notify.notify_mr_content = `तुम्हाला ${sportClasses.sportClassName} चे प्रशिक्षक म्हणून पद मिळाले आहे`
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByInsPhoto = institute._id;
        invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([
          sport.save(),
          institute.save(),
          staff.save(),
          sportClasses.save(),
          user.save(),
          notify.save()
        ])
        res.status(200).send({
          message: "Successfully Created Sport Class",
          sportClasses: sportClasses._id,
          status: true
        });
      } catch(e) {
        console.log(e);
      }
}

exports.getSportEvent = async(req, res) =>{
    try {
        const { sid } = req.params;
        const sport = await Sport.findById({ _id: sid });
        const event = new SportEvent({ ...req.body });
        sport.sportEvent.push(event._id);
        sport.sportEventCount += 1
        event.sportDepartment = sport._id;
        const file = req.file
        const results = await uploadDocFile(file);
        event.sportEventProfilePhoto = results.key;
        event.photoId = "1";
        await Promise.all([
          sport.save(),
          event.save()
        ])
        await unlinkFile(file.path);
        res.status(200).send({ message: `${event.sportEventName} Event Created`, event: event._id });
        var institute = await InstituteAdmin.findById({_id: `${sport.institute}`})
        var student = await Student.find({ institute: institute._id })
        .select('user sportEvent sportEventCount')
        .populate({
          path: 'user',
          select: 'id uNotify deviceToken'
        })
        const notify = new Notification({})
        notify.notifyContent = `Get Ready for Fun & Enjoy ${event.sportEventName} is held on ${event.sportEventDate} at ${event.sportEventPlace}`;
        notify.notify_hi_content = `मौज-मस्ती और आनंद के लिए तैयार हो जाइए ${event.sportEventName} का आयोजन ${event.sportEventDate} को ${event.sportEventPlace} पर किया जाता है`
        notify.notify_mr_content = `मनोरंजनासाठी सज्ज व्हा आणि आनंद घ्या ${event.sportEventName} ${event.sportEventDate} रोजी ${event.sportEventPlace} येथे आयोजित केले आहे`
        notify.notifySender = sport._id;
        notify.notifyByInsPhoto = institute._id;
        for (let i = 0; i < student.length; i++) {
          student[i].sportEvent.push(event._id);
          student[i].sportEventCount += 1
          notify.notifyReceiever = student[i].user._id;
          student[i].user.uNotify.push(notify._id);
          notify.user = student[i].user._id;
          invokeFirebaseNotification(
            "Designation Allocation",
            notify,
            'New Event',
            student[i].user._id,
            student[i].user.deviceToken
          );
          await Promise.all([
            student[i].save(),
            student[i].user.save()
          ])
        }
        await notify.save()
      } catch(e) {
        console.log(e);
      }
}

exports.updateSportInfo = async(req, res) =>{
    try {
        const { sid } = req.params;
        await Sport.findByIdAndUpdate(sid, req.body);
        res.status(200).send({ message: "Sport Department Info Updated", status: true });
      } catch(e) {
        console.log(e);
      }
}

exports.retrieveSportEventDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const event = await SportEvent.findById({ _id: id })
        .select('sportEventName sportEventMatchCount sportEventStatus sportEventCategory sportEventPlace sportEventDate sportEventDescription sportEventProfilePhoto')
        .populate({
          path: 'sportDepartment',
          select: '_id'
        })
        res.status(200).send({ message: "One Event Detail", event });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.retrieveSportEventQuery = async(req, res) => {
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { eid } = req.params
    const skip = (page - 1) * limit;
    const event_query = await SportEvent.findById({_id: eid})
    .select('sportEventMatch')

    const match_query = await SportEventMatch.find({ _id: { $in: event_query?.sportEventMatch}})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .select('sportEventMatchName sportEventMatchCategory sportEventMatchCategoryLevel sportEventMatchDate')
    .populate({
      path: 'sportPlayer1',
      select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
    })
    .populate({
      path: 'sportTeam1',
      select: 'sportClassTeamName'
    })
    .populate({
      path: 'sportPlayer2',
      select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
    })
    .populate({
      path: 'sportTeam2',
      select: 'sportClassTeamName'
    })
    .populate({
      path: 'sportFreePlayer',
      select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
    })


    if(match_query?.length > 0){
      res.status(200).send({ message: 'Awesome Event', match_query })
    }
    else{
      res.status(200).send({ message: 'Awesome Event', match_query: [] })
    }
  }
  catch{

  }
}

exports.getIntraMatchEvent = async(req, res) =>{
    try {
        const { eid } = req.params;
        const { sportEventMatchClass, sportInPlayer1, sportInPlayer2, sportTPlayer1, sportTPlayer2, sportPlayerFree } = req.body;
        const event = await SportEvent.findById({ _id: eid });
        const sport = await Sport.findById({_id: `${event.sportDepartment}`})
        var sportStaff = await Staff.findById({_id: `${sport.sportHead}`})
        const classes = await SportClass.findById({
          _id: `${sportEventMatchClass}`,
        });
        var match = new SportEventMatch({...req.body});
        match.sportEventMatchClass = classes._id;
        event.sportEventMatch.push(match._id);
        event.sportEventMatchCount += 1
        match.sportEvent = event._id;
        await Promise.all([
          event.save(),
          match.save()
        ])
        res.status(200).send({ message: "Match Created", match: match._id, status: true });
        //
        if (sportInPlayer1 !== "" && sportInPlayer2 !== "") {
          const student1 = await Student.findById({ _id: `${sportInPlayer1}` });
          const student2 = await Student.findById({ _id: `${sportInPlayer2}` });
          match.sportPlayer1 = student1._id;
          match.sportPlayer2 = student2._id;
          student1.studentSportsEventMatch.push({
            eventMatch: match._id
          })
          student2.studentSportsEventMatch.push({
            eventMatch: match._id
          })
          await Promise.all([ match.save(), student1.save(), student2.save()]);
        } else if (sportTPlayer1 !== "" && sportTPlayer2 !== "") {
          const Team1 = await SportTeam.findById({ _id: `${sportTPlayer1}` })
          const Team2 = await SportTeam.findById({ _id: `${sportTPlayer2}` })
          match.sportTeam1 = Team1._id;
          match.sportTeam2 = Team2._id;
          const students1 = await Student.find({_id: { $in: Team1.sportTeamStudent}})
          students1.forEach(async (arr) => {
            arr.studentSportsEventMatch.push({
              eventMatch: match._id
            })
            await arr.save()
          })
          const students2 = await Student.find({_id: { $in: Team2.sportTeamStudent}})
          students2.forEach(async (arr) => {
            arr.studentSportsEventMatch.push({
              eventMatch: match._id
            })
            await arr.save()
          })
          await match.save();
        } else if (sportPlayerFree.length >= 1) {
          for (let i = 0; i < sportPlayerFree.length; i++) {
            const student = await Student.findById({
              _id: sportPlayerFree[i],
            });
            match.sportFreePlayer.push(student._id);
            match.sportFreePlayerCount += 1
            student.studentSportsEventMatch.push({
              eventMatch: match._id
            })
            await Promise.all([ match.save(), student.save() ]);
          }
        }
        const student = await Student.find({ $and: [{institute: `${sport.institute}`}, { studentStatus: 'Approved'}]})
        .select('id')
        .populate({
          path: 'user',
          select: 'uNotify deviceToken'
        })
        var notify = new Notification({})
        notify.notifyContent = `${match.sportEventMatchName} (${match.sportEventMatchCategory}) is held on ${match.sportEventMatchDate} in ${event.sportEventName}`;
        notify.notify_hi_content = `${match.sportEventMatchName} (${match.sportEventMatchCategory}) ${match.sportEventMatchDate} को ${event.sportEventName} में आयोजित किया जाता है`
        notify.notify_mr_content = `${match.sportEventMatchName} (${match.sportEventMatchCategory}) ${event.sportEventName} मध्ये ${match.sportEventMatchDate} रोजी आयोजित केले आहे`
        notify.notifySender = sportStaff._id;
        notify.notifyByInsPhoto = sport.institute;
        student.forEach(async (ele) => {
          notify.notifyReceiever = ele.user._id;
          ele.user.uNotify.push(notify._id);
          notify.user = ele.user._id;
          invokeFirebaseNotification(
            "Designation Allocation",
            notify,
            'New Intra Match',
            ele.user._id,
            ele.user.deviceToken
          );
          await ele.save()
        })
        await notify.save()
        //
      } catch(e) {
        console.log(e);
      }
}

exports.getInterMatchEvent = async(req, res) =>{
    try {
        const { eid } = req.params;
        const { sportEventMatchClass, sportPlayer, sportTeam, sportPlayerFree } = req.body;
        const event = await SportEvent.findById({ _id: eid });
        const sport = await Sport.findById({_id: `${event.sportDepartment}`})
        var sportStaff = await Staff.findById({_id: `${sport.sportHead}`})
        const classes = await SportClass.findById({_id: `${sportEventMatchClass}`});
        var match = new SportEventMatch({...req.body});
        match.sportEventMatchClass = classes._id;
        event.sportEventMatch.push(match._id);
        event.sportEventMatchCount += 1
        match.sportEvent = event._id;
        await Promise.all([
          event.save(),
          match.save()
        ])
        res.status(200).send({ message: "Inter Match Created", match: match, status: true });
        if(sportPlayer){
          match.sportPlayer1 = sportPlayer;
        }
        else if(sportTeam){
          const team = await SportTeam.findById({_id: `${sportTeam}`}).select('sportTeamStudent')
          const students = await Student.find({_id: { $in: team.sportTeamStudent}})
          match.sportTeam1 = team._id;
          students.forEach(async (arr) => {
            arr.studentSportsEventMatch.push({
              eventMatch: match._id
            })
            await arr.save()
          })
        }
        else if(sportPlayerFree?.length >= 1){
          for (let i = 0; i < sportPlayerFree.length; i++) {
            const student = await Student.findById({
              _id: sportPlayerFree[i],
            });
            match.sportFreePlayer.push(student._id);
          }
        }
        await match.save()
        const student = await Student.find({ $and: [{institute: `${sport.institute}`}, { studentStatus: 'Approved'}]})
        .select('id')
        .populate({
          path: 'user',
          select: 'uNotify deviceToken'
        })
        var notify = new Notification({})
        notify.notifyContent = `${match.sportEventMatchName} (${match.sportEventMatchCategory}) is held on ${match.sportEventMatchDate} in ${event.sportEventName}`;
        notify.notify_hi_content = `${match.sportEventMatchName} (${match.sportEventMatchCategory}) ${match.sportEventMatchDate} को ${event.sportEventName} में आयोजित किया जाता है`
        notify.notify_mr_content = `${match.sportEventMatchName} (${match.sportEventMatchCategory}) ${event.sportEventName} मध्ये ${match.sportEventMatchDate} रोजी आयोजित केले आहे`
        notify.notifySender = sportStaff._id;
        notify.notifyByInsPhoto = sport.institute;
        student.forEach(async (ele) => {
          notify.notifyReceiever = ele.user._id;
          ele.user.uNotify.push(notify._id);
          notify.user = ele.user._id;
          invokeFirebaseNotification(
            "Designation Allocation",
            notify,
            'New Inter Match',
            ele.user._id,
            ele.user.deviceToken
          );
          await ele.save()
        })
        await notify.save()
        //
      } catch(e) {
        console.log(e);
      }
}

exports.retrieveSportClassDetail = async(req, res) =>{
    try {
        const { cid } = req.params;
        const classes = await SportClass.findById({ _id: cid })
          .select('sportClassName sportClassEmail sportClassPhoneNumber sportClassAbout photoId photo coverId cover sportStudentCount sportTeamCount createdAt')
          .populate({
            path: "sportClassHead",
            select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
          })
          .populate({
            path: "institute",
            select: 'insName'
          })
          .populate({
            path: "sportDepartment",
            select: 'sportName'
          })
          .lean()
          .exec()
        res.status(200).send({ message: "One Sport Class Data", classes });
      } catch(e) {
        console.log(e);
      }
}

exports.updateStudentSportClass = async(req, res) =>{
    try {
        const { cid } = req.params;
        const { request } = req.body
        var classes = await SportClass.findById({ _id: cid });
        var sport_depart = await Sport.findById({_id: `${classes.sportDepartment}`})
        if(request?.length > 0){
          for(let i=0; i< request.length; i++){
            const student = await Student.findById({ _id: request[i] });
            classes.sportStudent.push(student._id);
            classes.sportStudentCount += 1
            sport_depart.sportMemberCount += 1
            student.sportClass = classes._id;
            await student.save()
          }
          await Promise.all([ classes.save(), sport_depart.save()])
          res.status(200).send({ message: "Student added to sports class", classes: classes._id, status: true });
        }
        else{
          res.status(200).send({ message: "No Student added to sports class", status: false });
        }
      } catch(e) {
        console.log(e);
      }
}

exports.retrieveAllSportStudent = async(req, res) => {
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { cid } = req.params
    const skip = (page - 1) * limit;
    const classes = await SportClass.findById({_id: cid})
    .select('sportStudent')

    const student_query = await Student.find({ _id: { $in: classes?.sportStudent}})
    .limit(limit)
    .skip(skip)
    .select('studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto')

    if(student_query?.length > 0){
      res.status(200).send({ message: 'All student of Sport Classes', student_query })
    }
    else{
      res.status(200).send({ message: 'Nope...', student_query: [] })
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveAllSportTeam = async(req, res) => {
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { cid } = req.params
    const skip = (page - 1) * limit;
    const classes = await SportClass.findById({_id: cid})
    .select('sportTeam')

    const team_query = await SportTeam.find({ _id: { $in: classes?.sportTeam}})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .select('sportClassTeamName sportTeamStudentCount rankTitle teamPoints')

    if(team_query?.length > 0){
      res.status(200).send({ message: 'All Team of Sport Classes', team_query })
    }
    else{
      res.status(200).send({ message: 'Nope...', team_query: [] })
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.updateSportClassInfo = async(req, res) =>{
    try {
        const { cid } = req.params;
        await SportClass.findById(cid, req.body);
        res.status(200).send({ message: "Sport Class Info Updated", status: true });
      } catch(e) {
        console.log(e);
      }
}


exports.removeStudentSportClass = async(req, res) =>{
  try {
      const { cid } = req.params;
      const { remove } = req.body
      var classes = await SportClass.findById({ _id: cid });
      var sport_depart = await Sport.findById({_id: `${classes.sportDepartment}`})
      if(remove?.length > 0){
        for(let i=0; i< remove.length; i++){
          const student = await Student.findById({ _id: remove[i] });
          classes.sportStudent.pull(student._id);
          if(classes?.sportStudentCount > 0){
            classes.sportStudentCount -= 1
          }
          if(sport_depart.sportMemberCount > 0){
            sport_depart.sportMemberCount -= 1
          }
          student.sportClass = null;
          await student.save()
        }
        await Promise.all([ classes.save(), sport_depart.save()])
        res.status(200).send({ message: "Student Remove from sports class", classes: classes._id, remove: true });
      }
      else{
        res.status(200).send({ message: "No Student from sports class", remove: false });
      }
    } catch(e) {
      console.log(e);
    }
}

exports.updateSportTeam = async(req, res) =>{
    try {
        const { request, captain, cid } = req.body;
        const classes = await SportClass.findById({ _id: cid });
        const sport = await Sport.findById({_id: `${classes.sportDepartment}`})
        const parsedRequest = JSON.parse(request)
        if(parsedRequest?.length > 0){
          var team = new SportTeam({ ...req.body });
          const file = req.file
          if(file){
            const results = await uploadDocFile(file);
            team.sportTeamPhoto = results.key;
            team.photoId = "1";
          }
          for (let i = 0; i < parsedRequest.length; i++) {
            const student = await Student.findById({_id: parsedRequest[i] });
            team.sportTeamStudent.push({
              student: student._id,
              asCaptain: `${student._id}` === `${captain}` ? 'Captain' : 'Member'
            });
            team.sportTeamStudentCount += 1
            student.sportTeam = team._id;
            await student.save();
          }
          classes.sportTeam.push(team._id);
          classes.sportTeamCount += 1
          sport.sportTeamCount += 1
          team.sportClass = classes._id;
          team.sportTeamCaptain = `${captain}`
          await Promise.all([
            classes.save(),
            team.save(),
            sport.save()
          ])
          res.status(200).send({ message: "Team Created", team: team._id, status: true });
        }
        else{
          res.status(404).send({ message: "Student require to create a team", status: false });
        }
      } catch(e) {
        console.log(e);
      }
}

exports.retrieveMatchDetail = async(req, res) =>{
    try {
        const { mid } = req.params;
        const match = await SportEventMatch.findById({ _id: mid })
          .select('sportEventMatchName rankMatch sportOpponentPlayer matchStatus ')
          .populate({
            path: "sportFreePlayer",
            select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
          })
          .populate({
            path: "sportEvent",
            select: 'sportEventName sportEventCategory'
          })
          .populate({
            path: "sportPlayer1",
            select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
          })
          .populate({
            path: "sportTeam1",
            select: 'sportClassTeamName sportTeamStudentCount'
          })
          .populate({
            path: "sportPlayer2",
            select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
          })
          .populate({
            path: "sportTeam2",
            select: 'sportClassTeamName sportTeamStudentCount'
          })
          .populate({
            path: "sportEventMatchClass",
            select: 'sportEventMatchClassName'
          })
          .populate({
            path: 'sportWinner',
            select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
          })
          .populate({
            path: 'sportWinnerTeam',
            select: 'sportClassTeamName'
          })
          .populate({
            path: 'sportRunner',
            select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
          })
          .populate({
            path: 'sportRunnerTeam',
            select: 'sportClassTeamName'
          })
        res.status(200).send({ message: "One Match Data", match });
      } catch(e) {
        console.log(e);
      }
}

exports.updateIntraMatchIndividual = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { studentWinner, studentRunner } = req.body;
        var match = await SportEventMatch.findById({ _id: mid });
        var student1 = await Student.findById({ _id: `${studentWinner}` });
        var student2 = await Student.findById({ _id: `${studentRunner}` });
        match.sportWinner = student1._id;
        match.sportRunner = student2._id;
        match.matchStatus = "Completed";
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          student1.extraPoints += 25;
          student2.extraPoints += 15;
          await Promise.all([
            student1.save(),
            student2.save()  
          ])
        }
        await match.save();
        res.status(200).send({ message: "Its Party Time Everyone Enjoy...", match_status: true });
        student1.studentSportsEventMatch?.forEach(async (res) => {
          if(`${res.eventMatch}` === `${match._id}`){
            res.rankTitle = 'Winner'
          }
        })
        await student1.save()
        student2.studentSportsEventMatch?.forEach(async (res) => {
          if(`${res.eventMatch}` === `${match._id}`){
            res.rankTitle = 'Runner'
          }
        })
        await student2.save()
      } catch(e) {
        console.log(e);
      }
}

exports.updateInterMatchIndividual = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { studentPlayer, studentRankTitle, studentOpponentPlayer } = req.body;
        var match = await SportEventMatch.findById({ _id: mid });
        var student = await Student.findById({ _id: `${studentPlayer}` });
        match.sportOpponentPlayer = studentOpponentPlayer;
        match.matchStatus = "Completed";
        match.rankMatch = studentRankTitle;
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          if (studentRankTitle === "Winner") {
            student.extraPoints += 40;
            match.sportWinner = student._id
          } else if (studentRankTitle === "Runner") {
            student.extraPoints += 25;
            match.sportRunner = student._id
          }
        }
        await Promise.all([
          match.save(),
          student.save()
        ])
        res.status(200).send({ message: "Inter Match Result Updated", match_status: true });
        student.studentSportsEventMatch?.forEach(async (res) => {
          if(`${res.eventMatch}` === `${match._id}`){
            res.rankTitle = studentRankTitle
          }
        })
        await student.save()
      } catch(e) {
        console.log(e)
      }
}

exports.updateIntraMatchTeam = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { teamWinner, teamRunner } = req.body;
        var match = await SportEventMatch.findById({ _id: mid });
        var team1 = await SportTeam.findById({ _id: `${teamWinner}` })
        .populate({
          path: 'sportTeamStudent',
          select: 'studentSportsEventMatch',
          populate: {
            path: 'student',
            select: '_id extraPoints'
          }
        });
        var team2 = await SportTeam.findById({ _id: `${teamRunner}` })
        .populate({
          path: 'sportTeamStudent',
          select: 'studentSportsEventMatch',
          populate: {
            path: 'student',
            select: '_id extraPoints'
          }
        });
        match.sportWinnerTeam = team1._id;
        match.sportRunnerTeam = team2._id;
        match.matchStatus = "Completed";
        await match.save();
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          team1.teamPoints += 25;
          team2.teamPoints += 15;
          await Promise.all([
            team1.save(),
            team2.save()
          ])
          for (let i = 0; i < team1.sportTeamStudent.length; i++) {
            const student1 = await Student.findById({ _id: team1.sportTeamStudent[i].student._id});
            student1.extraPoints += 25;
            await student1.save();
          }
          for (let i = 0; i < team2.sportTeamStudent.length; i++) {
            const student2 = await Student.findById({_id: team2.sportTeamStudent[i].student._id});
            student2.extraPoints += 15;
            await student2.save();
          }
        }
        res.status(200).send({ message: "Intra Team Match Result Updated", match_status: true });
        for (let i = 0; i < team1.sportTeamStudent.length; i++) {
          const student = await Student.findById({_id: team1.sportTeamStudent[i].student._id});
          student.studentSportsEventMatch?.forEach((ele) => {
            if(`${ele.eventMatch}` === `${match._id}`){
              ele.rankTitle = 'Winner'
            }
          })
          await student.save()
        }
        for (let i = 0; i < team2.sportTeamStudent.length; i++) {
          const student = await Student.findById({_id: team2.sportTeamStudent[i].student._id});
          student.studentSportsEventMatch?.forEach((ele) => {
            if(`${ele.eventMatch}` === `${match._id}`){
              ele.rankTitle = 'Runner'
            }
          })
          await student.save()
        }
      } catch(e) {
        console.log(e);
      }
}

exports.updateInterMatchTeam = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { teamPlayer, studentRankTitle, teamOpponentPlayer } = req.body;
        var match = await SportEventMatch.findById({ _id: mid });
        var team = await SportTeam.findById({ _id: `${teamPlayer}` })
        .populate({
          path: 'sportTeamStudent',
          select: 'studentSportsEventMatch',
          populate: {
            path: 'student',
            select: '_id extraPoints'
          }
        });
        match.sportOpponentPlayer = teamOpponentPlayer;
        match.matchStatus = "Completed";
        match.rankMatch = studentRankTitle;
        team.rankTitle = studentRankTitle;
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          if (studentRankTitle === "Winner") {
            team.teamPoints += 40;
            for (let i = 0; i < team.sportTeamStudent.length; i++) {
              const student = await Student.findById({_id: team.sportTeamStudent[i].student._id});
              student.extraPoints += 40;
              await student.save();
            }
            match.sportWinnerTeam = team._id
          } else if (studentRankTitle === "Runner") {
            team.teamPoints += 25;
            for (let i = 0; i < team.sportTeamStudent.length; i++) {
              const student = await Student.findById({_id: team.sportTeamStudent[i].student._id});
              student.extraPoints += 25;
              await student.save();
            }
            match.sportRunnerTeam = team._id
          }
        }
        await Promise.all([
          match.save(),
          team.save()
        ])
        res.status(200).send({ message: "Inter Team Match Result Updated", match_status: true });
        for (let i = 0; i < team.sportTeamStudent.length; i++) {
          const student = await Student.findById({_id: team.sportTeamStudent[i].student._id});
          student.studentSportsEventMatch?.forEach((ele) => {
            if(`${ele.eventMatch}` === `${match._id}`){
              ele.rankTitle = studentRankTitle
            }
          })
          await student.save()
        }
      } catch(e) {
        console.log(e);
      }
}

exports.updateIntraMatchFree = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { studentWinner, studentRunner, studentParticipants } = req.body;
        var match = await SportEventMatch.findById({ _id: mid });
        var student1 = await Student.findById({ _id: `${studentWinner}` });
        var student2 = await Student.findById({ _id: `${studentRunner}` });
        match.sportWinner = student1._id;
        match.sportRunner = student2._id;
        match.matchStatus = "Completed";
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          student1.extraPoints += 25;
          student2.extraPoints += 15;
          await Promise.all([
            student1.save(),
            student2.save()
          ])
        }
        await match.save();
        if (studentParticipants.length >= 1) {
          for (let i = 0; i < studentParticipants.length; i++) {
            const student = await Student.findById({_id: studentParticipants[i]});
            match.sportParticipants.push(student._id);
            if (match.sportEventMatchCategoryLevel === "Final Match") {
              student.extraPoints += 5;
              await student.save();
            }
            await match.save();
          }
        }
        res.status(200).send({ message: "Intra Match Free Updated", match_status: true });
        student1.studentSportsEventMatch?.forEach(async (res) => {
          if(`${res.eventMatch}` === `${match._id}`){
            res.rankTitle = 'Winner'
          }
        })
        await student1.save()
        student2.studentSportsEventMatch?.forEach(async (res) => {
          if(`${res.eventMatch}` === `${match._id}`){
            res.rankTitle = 'Runner'
          }
        })
        await student2.save()

        studentParticipants?.forEach(async (ele) => {
          const student = await Student.findById({_id: ele})
          student.studentSportsEventMatch?.forEach(async (res) => {
            if(`${res.eventMatch}` === `${match._id}`){
              res.rankTitle = 'Participants'
            }
          })
          await student.save()
        })
      } catch(e) {
        console.log(e)
      }
}

exports.updateInterMatchFree = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { studentPlayer, studentRankTitle, studentParticipants, studentOpponentPlayer } = req.body;
        var match = await SportEventMatch.findById({ _id: mid });
        var student = await Student.findById({ _id: `${studentPlayer}` });
        match.sportOpponentPlayer = studentOpponentPlayer;
        match.rankMatch = studentRankTitle;
        match.matchStatus = "Completed";
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          if (studentRankTitle === "Winner") {
            student.extraPoints += 40;
            match.sportWinner = student._id
          } else if (studentRankTitle === "Runner") {
            student.extraPoints += 25;
            match.sportRunner = student._id
          }
        }
        await Promise.all([
          match.save(),
          student.save()
        ])
        if (studentParticipants.length >= 1) {
          for (let i = 0; i < studentParticipants.length; i++) {
            const student = await Student.findById({_id: studentParticipants[i]});
            match.sportInterParticipants.push(student._id);
            if (match.sportEventMatchCategoryLevel === "Final Match") {
              student.extraPoints += 5;
              await student.save();
            }
            await match.save();
          }
        }
        res.status(200).send({ message: "Intra Match Free Updated", match_status: true });
        student.studentSportsEventMatch?.forEach(async (res) => {
          if(`${res.eventMatch}` === `${match._id}`){
            res.rankTitle = studentRankTitle
          }
        })
        await student.save()
      } catch(e) {
        console.log(e)
      }
}

exports.updateEvent = async(req, res) =>{
  try {
    const { eid } = req.params;
    await SportEvent.findByIdAndUpdate(eid, req.body);
    res.status(200).send({ message: "Event Updated", update_status: true });
  } catch(e) {
    console.log(e);
  }
}

exports.removeMatchEvent = async(req, res) =>{
  try {
    const { eid, mid } = req.params;
    const event = await SportEvent.findById({ _id: eid });
    event.sportEventMatch.pull(mid);
    if(event.sportEventMatchCount > 1){
      event.sportEventMatchCount -= 1
    }
    await event.save();
    await SportEventMatch.findByIdAndDelete({ _id: mid });
    res.status(200).send({ message: "Deleted Event", delete_status: true });
  } catch (e){
    console.log(e);
  }
}

exports.removeEvent = async(req, res) =>{
  try {
    const { sid, eid } = req.params;
    const sport = await Sport.findByIdAndUpdate(sid, { $pull: { sportEvent: eid } });
    const institute = await InstituteAdmin.findById({_id: `${sport.institute}`})
    await SportEvent.findByIdAndDelete({ _id: eid });
    res.status(200).send({ message: "Deleted Event", delete_status: true });
    //
    var student = await Student.find({ $and: [{ institute: institute._id}, { studentStatus: 'Approved' }]});
    for (let i = 0; i < student.length; i++) {
      if ( student[i].sportEvent.length >= 1 && student[i].sportEvent.includes(String(eid))) {
        student[i].sportEvent.pull(eid);
        await student[i].save();
      } else {}
    }
    //
  } catch(e) {
    console.log(e);
  }
}


exports.renderStudentSideEvent = async(req, res) =>{
  try{
    const { sid } = req.params
    const student = await Student.findById({_id: sid})
    .select('_id')
    .populate({
      path: 'sportEvent',
      select: 'sportEventName sportEventStatus sportEventProfilePhoto photoId sportEventDate sportEventCategory sportEventPlace'
    })
    .lean()
    .exec()
    res.status(200).send({ message: 'Event Detail Query', event_query: student})
  }
  catch(e){
    console.log(e)
  }
}

exports.renderStudentSideMatch = async(req, res) =>{
  try{
    const { sid, eid } = req.params
    const student = await Student.findById({_id: sid})
    .select('_id')
    .populate({
      path: 'studentSportsEventMatch',
      populate: {
        path: 'eventMatch',
        populate: {
          path: 'sportEvent',
          select: '_id'
        }
      }
    })
    .lean()
    .exec()

    var valid_match = student?.studentSportsEventMatch?.filter((val) =>{
      if(`${val.eventMatch.sportEvent._id}` === `${eid}`) return val
    })
    res.status(200).send({ message: 'Match Detail Query', match_query: valid_match })
  }
  catch(e){
    console.log(e)
  }
}

