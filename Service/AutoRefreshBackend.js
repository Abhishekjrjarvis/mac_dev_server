const Poll = require("../models/Question/Poll");
const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const { shuffleArray } = require("../Utilities/Shuffle");
const Election = require("../models/Elections/Election");
const Student = require("../models/Student");
const StudentNotification = require("../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../Firebase/MemberTab");
const Post = require("../models/Post");
const Department = require("../models/Department");
const { custom_date_time } = require("../helper/dayTimer");
const { large_vote_candidate } = require("../Custom/checkInitials");
const { nested_document_limit } = require("../helper/databaseFunction");

exports.check_poll_status = async (req, res) => {
  var r_date = new Date();
  var hrs = r_date.getHours();
  var min = r_date.getMinutes();
  var day = r_date.getDate();
  var month = r_date.getMonth() + 1;
  year = r_date.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  if (min <= 9) {
    min = `0${min}`;
  }
  if (min <= 9) {
    min = `0${r_date.getMinutes()}`;
  }
  if (day <= 9) {
    day = `0${day}`;
  }
  const poll = await Poll.find({
    duration_date: `${year}-${month}-${day}T${hrs}:${min}`,
  });
  if (poll.length >= 1) {
    poll.forEach(async (pl) => {
      pl.poll_status = "Closed";
      await pl.save();
    });
    // console.log('Poll Closed')
  } else {
    // console.log('No Poll Close')
  }
};

exports.election_vote_day = async (req, res) => {
  var today = custom_date_time(0);
  var next = custom_date_time(1);
  try {
    const elect_app = await Election.find({
      election_voting_date: {
        $gte: new Date(today),
        $lt: new Date(next),
      },
    });
    if (elect_app.length >= 1) {
      elect_app.forEach(async (elect) => {
        var depart = await Department.findById({
          _id: `${elect?.department}`,
        });
        if (elect?.vote_notification === "Close") {
          if (elect?.election_visible === "Only Institute") {
            var all_student = await Student.find({
              $and: [
                { institute: depart?.institute },
                { studentStatus: "Approved" },
              ],
            }).select("user notification");
          } else if (elect?.election_visible === "Only Department") {
            var all_student = await Student.find({
              _id: { $in: depart?.ApproveStudent },
            }).select("user notification");
          } else {
          }
          all_student?.forEach(async (ele) => {
            var notify = new StudentNotification({});
            const user = await User.findById({ _id: `${ele?.user}` }).select(
              "activity_tab deviceToken"
            );
            notify.notifyContent = `Voting form 00:00 to  23:59 today`;
            notify.notifySender = depart._id;
            notify.notifyReceiever = user._id;
            notify.electionId = elect?._id;
            notify.notifyType = "Student";
            notify.election_type = "Open for vote";
            notify.notifyPublisher = ele._id;
            user.activity_tab.push(notify._id);
            ele.notification.push(notify._id);
            notify.notifyByDepartPhoto = depart._id;
            notify.notifyCategory = "Election";
            notify.redirectIndex = 12;
            invokeMemberTabNotification(
              "Student Activity",
              notify,
              "Voting Day",
              user._id,
              user.deviceToken,
              "Student",
              notify
            );
            await Promise.all([ele.save(), user.save(), notify.save()]);
          });
          elect.vote_notification = "Opened";
          await elect.save();
          // console.log("Done");
        } else {
        }
      });
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.election_result_day = async (req, res) => {
  var today = custom_date_time(0);
  var next = custom_date_time(1);
  try {
    const elect_app = await Election.find({
      election_result_day: {
        $gte: new Date(today),
        $lt: new Date(next),
      },
    });
    if (elect_app.length >= 1) {
      elect_app.forEach(async (elect) => {
        var depart = await Department.findById({
          _id: `${elect?.department}`,
        });
        if (elect?.result_notification === "Not Declare") {
          var query = large_vote_candidate(elect?.election_candidate);
          if (elect?.election_visible === "Only Institute") {
            var all_student = await Student.find({
              $and: [
                { institute: depart?.institute },
                { studentStatus: "Approved" },
              ],
            }).select("user notification");
          } else if (elect?.election_visible === "Only Department") {
            var all_student = await Student.find({
              _id: { $in: depart?.ApproveStudent },
            }).select("user notification");
          } else {
          }
          all_student?.forEach(async (ele) => {
            var notify = new StudentNotification({});
            const user = await User.findById({ _id: `${ele?.user}` }).select(
              "activity_tab deviceToken"
            );
            notify.notifyContent = `Is winner with ${query.max_votes} votes`;
            notify.election_winner = query.winner;
            notify.notifySender = depart._id;
            notify.notifyReceiever = user._id;
            notify.electionId = elect?._id;
            notify.notifyType = "Student";
            notify.election_type = "Result Declared";
            notify.notifyPublisher = ele._id;
            user.activity_tab.push(notify._id);
            ele.notification.push(notify._id);
            notify.notifyByDepartPhoto = depart._id;
            notify.notifyCategory = "Election";
            notify.redirectIndex = 12;
            invokeMemberTabNotification(
              "Student Activity",
              notify,
              "Result Announcement",
              user._id,
              user.deviceToken,
              "Student",
              notify
            );
            await Promise.all([ele.save(), user.save(), notify.save()]);
          });
          elect.result_notification = "Declare";
          elect.election_candidate?.forEach(async (ele) => {
            if (`${ele.student}` === `${query.winner}`) {
              const winner_student_voters = await Student.find({
                _id: { $in: ele.voted_student },
              });
              winner_student_voters?.forEach(async (vote) => {
                vote.extraPoints += 20;
                vote.election_candidate.push(elect._id);
                await vote.save();
              });
              const winner_student = await Student.findById({
                _id: `${ele?.student}`,
              });
              winner_student.extraPoints += 5;
              winner_student.election_candidate.push(elect._id);
              ele.election_result_status = "Winner";
              await Promise.all([winner_student.save(), ele.save()]);
            }
          });
          elect.election_candidate?.forEach(async (ele) => {
            if (`${ele.student}` !== `${query.winner}`) {
              const candidate_student_voters = await Student.find({
                _id: { $in: ele.voted_student },
              });
              candidate_student_voters?.forEach(async (vote) => {
                vote.extraPoints += 5;
                vote.election_candidate.push(elect._id);
                await vote.save();
              });
              const candidate_student = await Student.findById({
                _id: `${ele?.student}`,
              });
              candidate_student.extraPoints += 5;
              candidate_student.election_candidate.push(elect._id);
              await candidate_student.save();
            }
          });
          election_status = "Completed";
          await elect.save();
          console.log("done");
        } else {
        }
      });
    } else {
      console.log("DOne");
    }
  } catch (e) {
    console.log(e);
  }
};

const distanceRecommend = (lat1, lon1, lat2, lon2, distanceId, expand) => {
  var p = 0.017453292519943295;
  var c = Math.cos;
  var a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  var euc_dis = 12742 * Math.asin(Math.sqrt(a));
  if (euc_dis <= expand) {
    return distanceId;
  }
};

const distanceCal = (lat1, lon1, lat2, lon2) => {
  var p = 0.017453292519943295;
  var c = Math.cos;
  var a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a));
};

const compareDistance = (rec_1, rec_2) => {
  return rec_1 - rec_2;
};

const remove_redundancy_recommend = (re1, uf1, uc1, uff1) => {
  const found_re1 = re1.filter((r) => !uf1.includes(r));
  const found_re2 = re1.filter((r) => !uc1.includes(r));
  const found_re3 = re1.filter((r) => !uff1.includes(r));
  const found_re4 = found_re1.filter((r) => found_re2.includes(r));
  const found_re5 = found_re3.filter((r) => found_re4.includes(r));
  const unique_follow = [...new Set(found_re5)];
  return unique_follow;
};
// Use in Next Year Working
// exports.recommendedAllIns = async (req, res) => {
//   try {
//     var recommend = [];
//     const { uid } = req.params;
//     const { expand_search } = req.query;
//     const expand = expand_search ? expand_search : 35;
//     var user = await User.findById({ _id: uid }).select(
//       "user_latitude user_longitude userInstituteFollowing userFollowers userCircle userFollowing"
//     );

//     const ins = await InstituteAdmin.find({}).select(
//       "ins_latitude ins_longitude"
//     );
//     if (ins?.length > 0) {
//       ins.forEach((rec) => {
//         // if(user?.userInstituteFollowing?.includes(rec?._id)) return
//         recommend.push(
//           distanceRecommend(
//             user?.user_latitude,
//             user?.user_longitude,
//             rec?.ins_latitude,
//             rec?.ins_longitude,
//             rec?._id,
//             expand
//           )
//         );
//       });
//     }
//     recommend = recommend.sort(compareDistance);
//     var refresh_recommend = recommend.filter((recomm) => recomm != null);
//     if (refresh_recommend?.length > 0) {
//       const recommend_ins = await InstituteAdmin.find({
//         $and: [{ _id: { $in: refresh_recommend } }, { status: "Approved" }],
//       })
//         .select(
//           "insName name photoId insProfilePhoto status isUniversal followersCount one_line_about coverId joinedUserList insEmail insAddress ins_latitude ins_longitude insProfileCoverPhoto"
//         )
//         .populate({
//           path: "displayPersonList",
//           select: "displayTitle createdAt",
//           populate: {
//             path: "displayUser",
//             select: "userLegalName username photoId profilePhoto",
//           },
//         })
//         .lean()
//         .exec();

//       var refresh_recommend_user = [];
//       recommend_ins?.forEach((recommend) => {
//         if (recommend?.joinedUserList.includes(user?._id)) return;
//         refresh_recommend_user.push(...recommend?.joinedUserList);
//       });
//       var refresh_recommend_ref = refresh_recommend_user?.filter(function (
//         user_ref
//       ) {
//         return `${user_ref}` !== `${user?._id}`;
//       });
//       var valid_recommend_user = remove_redundancy_recommend(
//         refresh_recommend_ref,
//         user?.userFollowers,
//         user?.userCircle,
//         user?.userFollowing
//       );
//       const recommend_user = await User.find({
//         _id: { $in: valid_recommend_user },
//       })
//         .select(
//           "userLegalName username followerCount photoId profilePhoto one_line_about"
//         )
//         .lean()
//         .exec();

//       var rec_user = [];
//       recommend_ins?.forEach((rem_rec_red) => {
//         if (user?.userInstituteFollowing?.includes(rem_rec_red?._id)) return;
//         var data_cal = distanceCal(
//           user?.user_latitude,
//           user?.user_longitude,
//           rem_rec_red?.ins_latitude,
//           rem_rec_red?.ins_longitude
//         );
//         rem_rec_red.ins_distance = data_cal.toFixed(3);
//         rec_user.push(rem_rec_red);
//       });
//       shuffleArray(rec_user);
//       res.status(200).send({
//         message: "Recommended Institute for follow and Joined",
//         recommend_ins_array: rec_user,
//         recommend: true,
//         refresh_recommend_user: recommend_user,
//       });
//     } else {
//       res.status(200).send({
//         message: "No Recommendation / Suggestion",
//         recommend_ins_array: [],
//         recommend: false,
//         refresh_recommend_user: [],
//       });
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.recommendedAllIns = async (req, res) => {
  try {
    const { uid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var user = await User.findById({ _id: uid }).select(
      "user_latitude user_longitude userInstituteFollowing userFollowers userCircle userFollowing"
    );
    const ins = await InstituteAdmin.find({
      _id: { $in: user?.userInstituteFollowing },
    }).select("joinedUserList ApproveStudent");
    if (ins?.length > 0) {
      var refresh_recommend_user = [];
      for (var recommend of ins) {
        for (var ref_rec of recommend?.joinedUserList) {
          if (`${ref_rec}` === `${user?._id}`) {
          } else {
            refresh_recommend_user.push(ref_rec);
          }
        }
        for (var ref_rec of recommend?.ApproveStudent) {
          var valid_student = await Student.findById({
            _id: `${ref_rec}`,
          }).select("user");
          if (`${valid_student?.user}` === `${user?._id}`) {
          } else {
            refresh_recommend_user.push(valid_student?.user);
          }
        }
      }
      var refresh_recommend_ref = refresh_recommend_user?.filter(function (
        user_ref
      ) {
        return `${user_ref}` !== `${user?._id}`;
        // return `${user_ref}` !== `${user?._id}`;
      });
      var valid_recommend_user = remove_redundancy_recommend(
        refresh_recommend_ref,
        user?.userFollowers,
        user?.userCircle,
        user?.userFollowing
      );
      const recommend_user = await User.find({
        _id: { $in: valid_recommend_user },
      })
        .select(
          "userLegalName username followerCount photoId profilePhoto one_line_about profileCoverPhoto"
        )
        .lean()
        .exec();

      var nest_array = await nested_document_limit(page, limit, recommend_user);
      var shuffle_query = shuffleArray(nest_array);
      res.status(200).send({
        message: "Recommended Institute for follow and Joined",
        recommend_ins_array: [],
        recommend: true,
        refresh_recommend_user: shuffle_query,
      });
    } else {
      res.status(200).send({
        message: "No Recommendation / Suggestion",
        recommend_ins_array: [],
        recommend: false,
        refresh_recommend_user: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.recommendedAllAdmissionPost = async (req, res) => {
  try {
    var recommend = [];
    const { id } = req.params;
    const { expand_search, post_query } = req.query;
    const expand = expand_search ? expand_search : 2;
    const ins = await InstituteAdmin.findById({ _id: id }).select(
      "ins_latitude ins_longitude"
    );

    var post = await Post.findById({ _id: post_query });
    var user = await User.find({}).select(
      "user_latitude user_longitude userPosts"
    );

    // user?.forEach(async (auth) => {
    //     if(auth.userPosts?.includes(post?._id)){
    //         auth.userPosts.pull(post?._id)
    //     }
    //     await auth.save()
    // })

    if (user?.length > 0) {
      user.forEach((rec) => {
        recommend.push(
          distanceRecommend(
            ins?.ins_latitude,
            ins?.ins_longitude,
            rec?.user_latitude,
            rec?.user_longitude,
            rec?._id,
            expand
          )
        );
      });
    }
    recommend = recommend.sort(compareDistance);
    var refresh_recommend = recommend.filter((recomm) => recomm != null);
    if (refresh_recommend?.length > 0) {
      const recommend_user_feed = await User.find({
        _id: { $in: refresh_recommend },
      });
      recommend_user_feed?.forEach(async (feed) => {
        if (feed.userPosts?.includes(post?._id)) {
        } else {
          feed.userPosts.push(post?._id);
        }
        await feed.save();
      });
      res.status(200).send({
        message: "Recommend App Author Increase visibility by expand area",
        show: true,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Recommend App met critiria", show: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.new_admission_recommend_post = async (
  id,
  post_query,
  expand_search
) => {
  var recommend = [];
  const expand = expand_search ? expand_search : 2;
  const ins = await InstituteAdmin.findById({ _id: id }).select(
    "ins_latitude ins_longitude"
  );

  const post = await Post.findById({ _id: post_query });
  var user = await User.find({}).select(
    "user_latitude user_longitude userPosts"
  );

  if (user?.length > 0) {
    user.forEach((rec) => {
      recommend.push(
        distanceRecommend(
          ins?.ins_latitude,
          ins?.ins_longitude,
          rec?.user_latitude,
          rec?.user_longitude,
          rec?._id,
          expand
        )
      );
    });
  }
  recommend = recommend.sort(compareDistance);
  var refresh_recommend = recommend.filter((recomm) => recomm != null);
  if (refresh_recommend?.length > 0) {
    const recommend_user_feed = await User.find({
      _id: { $in: refresh_recommend },
    });
    recommend_user_feed?.forEach(async (feed) => {
      if (feed.userPosts?.includes(post?._id)) {
      } else {
        feed.userPosts.push(post?._id);
      }
      await feed.save();
    });
    return true;
  }
  return false;
};
