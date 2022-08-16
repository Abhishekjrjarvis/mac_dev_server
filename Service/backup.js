// exports.getPassIns = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { insPassword, insRePassword } = req.body;
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
//       const genPass = bcrypt.genSaltSync(12);
//       const hashPass = bcrypt.hashSync(insPassword, genPass);
//       if (insPassword === insRePassword) {
//         institute.insPassword = hashPass;
//         await institute.save();
//         const token = generateAccessInsToken(institute?.name, institute?._id, institute?.insPassword);
//         res.json({ token: `Bearer ${token}`, institute: institute, login: true});
//         // var isChat = await SupportChat.find({
//         //   isGroupChat: false,
//         //   $and: [
//         //     { users: { $elemMatch: { $eq: admin._id } } },
//         //     { users: { $elemMatch: { $eq: institute._id } } },
//         //   ],
//         // })
//         //   .populate("latestMessage");
  
//         // if (isChat.length > 0) {
//         //   res.send(isChat[0]);
//         // } else {
//         //   var chatData = {
//         //     chatName: `Qviple Support Platform`,
//         //     isGroupChat: false,
//         //     participant_one: 'Qviple Support Platform',
//         //     participant_two: `${institute.insName}`,
//         //     users: [admin._id, institute._id],
//         //   };
  
//         //   try {
//         //     const createdChat = await SupportChat.create(chatData);
//         //     institute.supportChat = createdChat._id
//         //     admin.supportInstituteChat.push(createdChat._id)
//         //     await Promise.all(institute.save(), admin.save())
//         //     const FullChat = await SupportChat.findOne({ _id: createdChat._id })
//         //     res.status(200).json(FullChat);
//         //   } catch (error) {
//         //     res.status(400);
//         //     throw new Error(error.message);
//         //   }
//         // }
  
//       } else {
//         res.send({ message: "Invalid Combination", login: false });
//       }
//       // const user = new User({})
//       // user.userPhoneNumber = institute.insPhoneNumber
//       // user.userStatus = institute.insMobileStatus
//       // user.userLegalName = institute.insName
//       // user.username = usernameExp && usernameExp
//       // user.userGender = 'NA'
//       // user.userDateOfBirth = '2020-01-01'
//       // user.photoId = "0"
//       // user.coverId = "2"
//       // user.userPassword = institute.insPassword
//       // user.createdAt = institute.createdAt
//       // institute.userProfile = user._id
//       // admin.users.push(user._id);
//       // admin.userCount += 1
//       // await Promise.all([user.save(), institute.save(), admin.save()])
//       // const uInstitute = await InstituteAdmin.findOne({ isUniversal: 'Universal'})
//       // .populate({ path: 'posts' })
//       // const post = await Post.find({ _id: { $in: uInstitute.posts }, postVisibility: 'Anyone'})
//       // post.forEach(async (ele) => {
//       //   user.userPosts.push(ele)
//       // })
//       // await user.save()
//     } catch (e) {
//       console.log(`Error`, e.message);
//     }
//   };




// exports.getUserPassword = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { userPassword, userRePassword } = req.body;
//       const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
//       const user = await User.findById({ _id: id });
//       const genUserPass =  bcrypt.genSaltSync(12);
//       const hashUserPass =  bcrypt.hashSync(
//         req.body.userPassword,
//         genUserPass
//       );
//       if (user) {
//         if (userPassword === userRePassword) {
//           user.userPassword = hashUserPass;
//           await user.save();
//           const token = generateAccessToken(user?.username, user?._id, user?.userPassword);
//           res.json({ token: `Bearer ${token}`, user: user});
  
//           var isChat = await SupportChat.find({
//             isGroupChat: false,
//             $and: [
//               { users: { $elemMatch: { $eq: admin._id } } },
//               { users: { $elemMatch: { $eq: user._id } } },
//             ],
//           })
//             .populate("latestMessage");
  
//           if (isChat.length > 0) {
//             res.send(isChat[0]);
//           } else {
//             var chatData = {
//               chatName: `Qviple Support Platform`,
//               isGroupChat: false,
//               participant_one: 'Qviple Support Platform',
//               participant_two: `${user.username}`,
//               users: [admin._id, user._id],
//             };
  
//             try {
//               const createdChat = await SupportChat.create(chatData);
//               user.supportChat = createdChat._id
//               admin.supportUserChat.push(createdChat._id)
//               await Promise.all([user.save(), admin.save()])
//               const FullChat = await SupportChat.findOne({ _id: createdChat._id })
//               res.status(200).json(FullChat);
//             } catch (error) {
//               res.status(400);
//               throw new Error(error.message);
//             }
//           }
  
//         } else {
//           res.send({ message: "Invalid Password Combination" });
//         }
//       } else {
//         res.send({ message: "Invalid User" });
//       }
//     } catch (e) {
//       console.log(`Error`, e.message);
//     }
//   };


// module.exports.authentication = async(req, res) =>{
//   try{
//     const { insUserName, insPassword } = req.body;
//   // Ideally search the user in a database and validate password, throw an error if not found.
//   const user = await User.findOne({ username: insUserName });
//   const compare = bcrypt.compareSync(insPassword, user.userPassword)
//   if(compare){
//       const token = generateAccessToken(user?.username, user?._id, user?.userPassword);
//       res.json({
//         token: `Bearer ${token}`,
//       });
//   }
//   else{
//     res.status(401).send({ message: 'Unauthorized'})
//   }
//   }
//   catch{

//   }
// }



// exports.retrieveProfileData = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const user = await User.findById({ _id: id })
//         .select(
//           "userLegalName photoId recentChat profilePhoto user_birth_privacy user_address_privacy user_circle_privacy userBio userAddress userEducation userHobbies userGender coverId profileCoverPhoto username followerCount followingUICount circleCount postCount userAbout userEmail userAddress userDateOfBirth userPhoneNumber userHobbies userEducation "
//         )
      
//         // const chat = await Chat.find({ _id: {$in: user.recentChat}})
//         // .select('chatName chatProfilePhoto chatDescription updatedAt isGroupChat createdAt groupAdmin')
//         // .populate({
//         //   path: 'latestMessage',
//         //   select: 'content updatedAt',
//         //   populate: {
//         //     path: 'sender',
//         //     populate: 'username'
//         //   }
//         // })
//         // .populate({
//         //     path: 'latestMessage',
//         //     select: 'content updatedAt',
//         //     populate: {
//         //       path: 'document',
//         //       populate: 'documentName documentType documentKey documentSize'
//         //     }
//         // })
//         // .populate({
//         //     path: 'message',
//         //     select: 'content updatedAt',
//         //     populate: {
//         //       path: 'sender',
//         //       select: 'username'
//         //     }
//         // })
//         // .populate({
//         //     path: 'message',
//         //     select: 'content updatedAt',
//         //     populate: {
//         //       path: 'replyMessage',
//         //       select: 'reply replyContent replyIndex',
//         //       populate: {
//         //         path: 'replySender',
//         //         select: 'username'
//         //       }
//         //     }
//         // })
//         // .populate({
//         //     path: 'message',
//         //     select: 'content updatedAt',
//         //     populate: {
//         //       path: 'forwardMessage',
//         //       select: 'isForward'
//         //     }
//         // })
//         // .populate({
//         //     path: 'message',
//         //     select: 'content updatedAt',
//         //     populate: {
//         //       path: 'document',
//         //       select: 'documentName documentType documentSize document documentKey'
//         //     }
//         // })
//         // .populate({
//         //     path: 'users',
//         //     select: 'username userLegalName photoId profilePhoto',
//         // })
//         // .sort("-updatedAt")
//         // .lean()
//         // .exec();
//       res.status(200).send({ message: "Limit User Profile Data ", user });
//     } catch (e) {
//       console.log(e);
//     }
//   };



// poll.poll_answer[i].users.pull(user_session);
                    // poll.userPollCount -= 1
                    // poll.poll_answer[i].percent_vote = (poll.poll_answer[i].users.length / poll.userPollCount) * 100
                    // if (poll.total_votes >= 1) {
                    //     poll.total_votes -= 1;
                    // }
                    // await poll.save();
                    // res.status(200).send({ message: "Removed from Poll", voteAtPoll: poll.total_votes });