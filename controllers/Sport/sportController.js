const InstituteAdmin = require('../../models/InstituteAdmin')
const Sport = require('../../models/Sport')
const Staff = require('../../models/Staff')
const Notification = require('../../models/notification')
const SportClass = require('../../models/SportClass')
const SportEvent = require('../../models/SportEvent')
const SportEventMatch = require('../../models/SportEventMatch')
const SportTeam = require('../../models/SportTeam')
const Student = require('../../models/Student')



exports.getSportDepart = async(req, res) =>{
    try {
        const { id, sid } = req.params;
        const institute = await InstituteAdmin.findById({ _id: id });
        const staff = await Staff.findById({ _id: sid });
        const sport = await new Sport({});
        staff.sportDepartment.push(sport);
        sport.sportHead = staff;
        institute.sportDepart.push(sport);
        sport.institute = institute;
        await institute.save();
        await staff.save();
        await sport.save();
        res.status(200).send({
          message: "Successfully Assigned Staff",
          sport,
          staff,
          institute,
        });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.retrieveSportDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const sport = await Sport.findById({ _id: id })
          .populate({
            path: "sportHead",
            select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
          })
          .populate({
            path: "institute",
          })
          .populate({
            path: "sportClass",
            populate: {
              path: "sportStudent",
            },
          })
          .populate("sportEvent");
        res.status(200).send({ message: "sport data", sport });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getSportClass = async(req, res) =>{
    try {
        const { id, sid } = req.params;
        const { staffId, sportClassName } = req.body;
        const institute = await InstituteAdmin.findById({ _id: id });
        const sport = await Sport.findById({ _id: sid });
        const staff = await Staff.findById({ _id: staffId });
        const sportClasses = await new SportClass({
          sportClassName: sportClassName,
        });
        sport.sportClass.push(sportClasses);
        sportClasses.sportClassHead = staff;
        institute.sportClassDepart.push(sportClasses);
        sportClasses.institute = institute;
        staff.staffSportClass.push(sportClasses);
        sportClasses.sportDepartment = sport;
        await sport.save();
        await institute.save();
        await staff.save();
        await sportClasses.save();
        res.status(200).send({
          message: "Successfully Created Sport Class",
          sport,
          staff,
          sportClasses,
        });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getSportEvent = async(req, res) =>{
    try {
        const { sid } = req.params;
        const sport = await Sport.findById({ _id: sid });
        const student = await Student.find({});
        const event = await new SportEvent({ ...req.body });
        sport.sportEvent.push(event);
        event.sportDepartment = sport;
        await sport.save();
        await event.save();
        for (let i = 0; i < student.length; i++) {
          student[i].sportEvent.push(event);
          await student[i].save();
        }
        res.status(200).send({ message: "Event Created", sport, event });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.updateSportInfo = async(req, res) =>{
    try {
        const { sid } = req.params;
        const { sportName, sportEmail, sportAbout, sportPhoneNumber } = req.body;
        const sport = await Sport.findById({ _id: sid });
        sport.sportName = sportName;
        sport.sportEmail = sportEmail;
        sport.sportAbout = sportAbout;
        sport.sportPhoneNumber = sportPhoneNumber;
        await sport.save();
        res.status(200).send({ message: "Sport Department Info Updated" });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.retrieveSportEventDetail = async(req, res) =>{
    try {
        const { id } = req.params;
        const event = await SportEvent.findById({ _id: id })
          .populate({
            path: "sportEventMatch",
            populate: {
              path: "sportEventMatchClass",
              populate: {
                path: "sportStudent",
              },
            },
          })
          .populate({
            path: "sportDepartment",
          })
          .populate({
            path: "sportEventMatch",
            populate: {
              path: "sportEvent",
            },
          })
          .populate({
            path: "sportEventMatch",
            populate: {
              path: "sportWinner",
            },
          })
          .populate({
            path: "sportEventMatch",
            populate: {
              path: "sportWinnerTeam",
            },
          })
          .populate({
            path: "sportEventMatch",
            populate: {
              path: "sportRunner",
            },
          })
          .populate({
            path: "sportEventMatch",
            populate: {
              path: "sportRunnerTeam",
            },
          });
        res.status(200).send({ message: "Event Detail", event });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getIntraMatchEvent = async(req, res) =>{
    try {
        const { eid } = req.params;
        const {
          sportEventMatchName,
          sportEventMatchClass,
          sportEventMatchCategory,
          sportEventMatchCategoryLevel,
          sportEventMatchDate,
          sportInPlayer1,
          sportInPlayer2,
          sportTPlayer1,
          sportTPlayer2,
          sportPlayerFree,
        } = req.body;
        const event = await SportEvent.findById({ _id: eid });
        const classes = await SportClass.findById({
          _id: `${sportEventMatchClass}`,
        });
        var match = await new SportEventMatch({
          sportEventMatchName: sportEventMatchName,
          sportEventMatchCategory: sportEventMatchCategory,
          sportEventMatchDate: sportEventMatchDate,
          sportEventMatchCategoryLevel: sportEventMatchCategoryLevel,
        });
        match.sportEventMatchClass = classes;
        event.sportEventMatch.push(match);
        match.sportEvent = event;
        await event.save();
        await match.save();
        if (sportInPlayer1 !== "" && sportInPlayer2 !== "") {
          const student1 = await Student.findById({ _id: `${sportInPlayer1}` });
          const student2 = await Student.findById({ _id: `${sportInPlayer2}` });
          match.sportPlayer1 = student1;
          match.sportPlayer2 = student2;
          await match.save();
        } else if (sportTPlayer1 !== "" && sportTPlayer2 !== "") {
          const Team1 = await SportTeam.findById({ _id: `${sportTPlayer1}` });
          const Team2 = await SportTeam.findById({ _id: `${sportTPlayer2}` });
          match.sportTeam1 = Team1;
          match.sportTeam2 = Team2;
          await match.save();
        } else if (sportPlayerFree.length >= 1) {
          for (let i = 0; i < sportPlayerFree.length; i++) {
            const student = await Student.findById({
              _id: sportPlayerFree[i].studentId,
            });
            match.sportFreePlayer.push(student);
            await match.save();
          }
        }
        res.status(200).send({ message: "Match Created", event, match });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getInterMatchEvent = async(req, res) =>{
    try {
        const { eid } = req.params;
        const {
          sportEventMatchName,
          sportEventMatchClass,
          sportEventMatchCategory,
          sportEventMatchCategoryLevel,
          sportEventMatchDate,
          sportPlayer,
          sportTeam,
          sportPlayerFree,
        } = req.body;
        const event = await SportEvent.findById({ _id: eid });
        const classes = await SportClass.findById({
          _id: `${sportEventMatchClass}`,
        });
        var match = await new SportEventMatch({
          sportEventMatchName: sportEventMatchName,
          sportEventMatchCategory: sportEventMatchCategory,
          sportEventMatchDate: sportEventMatchDate,
          sportEventMatchCategoryLevel: sportEventMatchCategoryLevel,
        });
        match.sportEventMatchClass = classes;
        event.sportEventMatch.push(match);
        match.sportEvent = event;
        await event.save();
        await match.save();
        if (sportPlayer !== "") {
          const student1 = await Student.findById({ _id: `${sportPlayer}` });
          match.sportPlayer1 = student1;
          await match.save();
        } else if (sportTeam !== "") {
          const Team1 = await SportTeam.findById({ _id: `${sportTeam}` });
          match.sportTeam1 = Team1;
          await match.save();
        } else if (sportPlayerFree.length >= 1) {
          for (let i = 0; i < sportPlayerFree.length; i++) {
            const student = await Student.findById({
              _id: sportPlayerFree[i].studentId,
            });
            match.sportFreePlayer.push(student);
            await match.save();
          }
        }
        res.status(200).send({ message: "Match Created", event, match });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.retrieveSportClassDetail = async(req, res) =>{
    try {
        const { cid } = req.params;
        const classes = await SportClass.findById({ _id: cid })
          .populate("sportStudent")
          .populate({
            path: "sportClassHead",
          })
          .populate({
            path: "institute",
          })
          .populate({
            path: "sportDepartment",
          })
          .populate("sportTeam");
        res.status(200).send({ message: "Sport Class Data", classes });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateStudentSportClass = async(req, res) =>{
    try {
        const { cid } = req.params;
        const classes = await SportClass.findById({ _id: cid });
        const student = await Student.findById({ _id: sid });
        classes.sportStudent.push(student);
        student.sportClass = classes;
        await classes.save();
        await student.save();
        res
          .status(200)
          .send({ message: "Student added to sports class", classes, student });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateSportClassInfo = async(req, res) =>{
    try {
        const { sid } = req.params;
        const { sportClassEmail, sportClassAbout, sportClassPhoneNumber } =
          req.body;
        const classes = await SportClass.findById({ _id: sid });
        classes.sportClassEmail = sportClassEmail;
        classes.sportClassAbout = sportClassAbout;
        classes.sportClassPhoneNumber = sportClassPhoneNumber;
        await classes.save();
        res.status(200).send({ message: "Sport Class Info Updated" });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getStudentSportClass = async(req, res) =>{
    try {
        const { cid, id } = req.params;
        const classes = await SportClass.findById({ _id: cid });
        const student = await Student.findById({ _id: id });
        classes.sportStudent.push(student);
        student.sportClass = classes;
        await classes.save();
        await student.save();
        res.status(200).send({ message: "Student Added" });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.removeStudentSportClass = async(req, res) =>{
    try {
        const { cid, id } = req.params;
        const classes = await SportClass.findById({ _id: cid });
        const student = await Student.findById({ _id: id });
        classes.sportStudent.pull(student);
        student.sportClass = "";
        await classes.save();
        await student.save();
        res.status(200).send({ message: "Student Removed" });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateSportTeam = async(req, res) =>{
    try {
        const { cid } = req.params;
        const { sportClassTeamName, sportStudentData } = req.body;
        const classes = await SportClass.findById({ _id: cid });
        var team = await new SportTeam({ sportClassTeamName: sportClassTeamName });
        for (let i = 0; i < sportStudentData.length; i++) {
          const student = await Student.findById({
            _id: sportStudentData[i].studentId,
          });
          team.sportTeamStudent.push(student);
          student.sportTeam = team;
          await team.save();
          await student.save();
        }
        classes.sportTeam.push(team);
        team.sportClass = classes;
        await classes.save();
        await team.save();
        res.status(200).send({ message: "Team Created", classes, team });
      } catch(e) {
        console.log(
          `Error`,e.message
        );
      }
}

exports.retrieveMatchDetail = async(req, res) =>{
    try {
        const { mid } = req.params;
        const match = await SportEventMatch.findById({ _id: mid })
          .populate("sportFreePlayer")
          .populate({
            path: "sportEvent",
          })
          .populate({
            path: "sportPlayer1",
          })
          .populate({
            path: "sportTeam1",
          })
          .populate({
            path: "sportPlayer2",
          })
          .populate({
            path: "sportTeam2",
          })
          .populate({
            path: "sportEventMatchClass",
          });
        res.status(200).send({ message: "Match Data", match });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.updateIntraMatchIndividual = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { studentWinner, studentRunner } = req.body;
        const match = await SportEventMatch.findById({ _id: mid });
        const student1 = await Student.findById({ _id: `${studentWinner}` });
        const student2 = await Student.findById({ _id: `${studentRunner}` });
        match.sportWinner = student1;
        match.sportRunner = student2;
        match.matchStatus = "Completed";
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          student1.extraPoints += 25;
          student2.extraPoints += 15;
          await student1.save();
          await student2.save();
        }
        await match.save();
        res.status(200).send({ message: "Match Result Updated", match });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateInterMatchIndividual = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { studentPlayer, studentRankTitle, studentOpponentPlayer } = req.body;
        const match = await SportEventMatch.findById({ _id: mid });
        const student = await Student.findById({ _id: `${studentPlayer}` });
        match.sportOpponentPlayer = studentOpponentPlayer;
        match.matchStatus = "Completed";
        match.rankMatch = studentRankTitle;
        student.rankTitle = studentRankTitle;
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          if (studentRankTitle === "Winner") {
            student.extraPoints += 40;
            await student.save();
          } else if (studentRankTitle === "Runner") {
            student.extraPoints += 25;
            await student.save();
          }
        }
        await match.save();
        await student.save();
        res.status(200).send({ message: "Match Result Updated", match });
      } catch {}
      try {
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateIntraMatchTeam = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { teamWinner, teamRunner } = req.body;
        const match = await SportEventMatch.findById({ _id: mid });
        const team1 = await SportTeam.findById({ _id: `${teamWinner}` }).populate(
          "sportTeamStudent"
        );
        const team2 = await SportTeam.findById({ _id: `${teamRunner}` }).populate(
          "sportTeamStudent"
        );
        match.sportWinnerTeam = team1;
        match.sportRunnerTeam = team2;
        match.matchStatus = "Completed";
        await match.save();
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          team1.teamPoints += 25;
          team2.teamPoints += 15;
          await team1.save();
          await team2.save();
          for (let i = 0; i < team1.sportTeamStudent.length; i++) {
            const student1 = await Student.findById({
              _id: team1.sportTeamStudent[i]._id,
            });
            student1.extraPoints += 25;
            await student1.save();
          }
          for (let i = 0; i < team2.sportTeamStudent.length; i++) {
            const student2 = await Student.findById({
              _id: team2.sportTeamStudent[i]._id,
            });
            student2.extraPoints += 15;
            await student2.save();
          }
        }
        res.status(200).send({ message: "Match Result Updated", match });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateInterMatchTeam = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { teamPlayer, studentRankTitle, teamOpponentPlayer } = req.body;
        const match = await SportEventMatch.findById({ _id: mid });
        const team = await SportTeam.findById({ _id: `${teamPlayer}` }).populate(
          "sportTeamStudent"
        );
        match.sportOpponentPlayer = teamOpponentPlayer;
        match.matchStatus = "Completed";
        match.rankMatch = studentRankTitle;
        team.rankTitle = studentRankTitle;
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          if (studentRankTitle === "Winner") {
            team.teamPoints += 40;
            await team.save();
            for (let i = 0; i < team.sportTeamStudent.length; i++) {
              const student = await Student.findById({
                _id: team.sportTeamStudent[i]._id,
              });
              student.extraPoints += 40;
              await student.save();
            }
          } else if (studentRankTitle === "Runner") {
            team.teamPoints += 25;
            await team.save();
            for (let i = 0; i < team.sportTeamStudent.length; i++) {
              const student = await Student.findById({
                _id: team.sportTeamStudent[i]._id,
              });
              student.extraPoints += 25;
              await student.save();
            }
          }
        }
        await match.save();
        await team.save();
        res.status(200).send({ message: "Match Result Updated", match });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateIntraMatchFree = async(req, res) =>{
    try {
        const { mid } = req.params;
        const { studentWinner, studentRunner, studentParticipants } = req.body;
        var match = await SportEventMatch.findById({ _id: mid });
        const student1 = await Student.findById({ _id: `${studentWinner}` });
        const student2 = await Student.findById({ _id: `${studentRunner}` });
        match.sportWinner = student1;
        match.sportRunner = student2;
        match.matchStatus = "Completed";
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          student1.extraPoints += 25;
          student2.extraPoints += 15;
          await student1.save();
          await student2.save();
        }
        await match.save();
        if (studentParticipants.length >= 1) {
          for (let i = 0; i < studentParticipants.length; i++) {
            const student = await Student.findById({
              _id: studentParticipants[i].studentId,
            });
            match.sportParticipants.push(student);
            if (match.sportEventMatchCategoryLevel === "Final Match") {
              student.extraPoints += 5;
              await student.save();
            }
            await match.save();
          }
        }
        res.status(200).send({ message: "Match Free Updated", match });
      } catch {}
      try {
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateInterMatchFree = async(req, res) =>{
    try {
        const { mid } = req.params;
        const {
          studentPlayer,
          studentRankTitle,
          studentParticipants,
          studentOpponentPlayer,
        } = req.body;
        var match = await SportEventMatch.findById({ _id: mid });
        const student = await Student.findById({ _id: `${studentPlayer}` });
        match.sportOpponentPlayer = studentOpponentPlayer;
        match.rankMatch = studentRankTitle;
        match.matchStatus = "Completed";
        student.rankTitle = studentRankTitle;
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          if (studentRankTitle === "Winner") {
            student.extraPoints += 40;
            await student.save();
          } else if (studentRankTitle === "Runner") {
            student.extraPoints += 25;
            await student.save();
          }
        }
        await match.save();
        await student.save();
        if (studentParticipants.length >= 1) {
          for (let i = 0; i < studentParticipants.length; i++) {
            const student = await Student.findById({
              _id: studentParticipants[i].studentId,
            });
            match.sportInterParticipants.push(student);
            if (match.sportEventMatchCategoryLevel === "Final Match") {
              student.extraPoints += 5;
              await student.save();
            }
            await match.save();
          }
        }
        res.status(200).send({ message: "Match Free Updated", match });
      } catch {}
      try {
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.updateEvent = async(req, res) =>{
  try {
    const { sid, eid } = req.params;
    const event = await SportEvent.findByIdAndUpdate(eid, req.body);
    await event.save();
    res.status(200).send({ message: "Event Updated", event });
  } catch(e) {
    console.log(
      `Error`, e.message
    );
  }
}

exports.removeMatchEvent = async(req, res) =>{
  try {
    const { eid, mid } = req.params;
    const event = await SportEvent.findById({ _id: eid });
    event.sportEventMatch.pull(mid);
    await event.save();
    const match = await SportEventMatch.findByIdAndDelete({ _id: mid });
    res.status(200).send({ message: "Deleted Event", sport, event });
  } catch (e){
    console.log(
      `Error`, e.message
    );
  }
}

exports.removeEvent = async(req, res) =>{
  try {
    const { sid, eid } = req.params;
    var student = await Student.find({});
    for (let i = 0; i < student.length; i++) {
      if (
        student[i].sportEvent.length >= 1 &&
        student[i].sportEvent.includes(String(eid))
      ) {
        console.log("match");
        student[i].sportEvent.pull(eid);
        await student[i].save();
      } else {
      }
    }
    const sport = await Sport.findByIdAndUpdate(sid, {
      $pull: { sportEvent: eid },
    });
    const event = await SportEvent.findByIdAndDelete({ _id: eid });
    res.status(200).send({ message: "Deleted Event", sport, event });
  } catch(e) {
    console.log(
      `Error`, e.message
    );
  }
}
