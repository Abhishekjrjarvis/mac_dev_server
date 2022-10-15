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



                    // exports.postLike = async (req, res) => {
                    //     try {
                    //       const { pid } = req.params;
                    //       const { reaction_type } = req.query
                    //       const post = await Post.findById({ _id: pid });
                    //       const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
                    //       if (user_session) {
                    //         if ((post.endUserLike.length >= 1 && post.endUserLike.includes(String(user_session))) || 
                    //               (post.endUserFun.length >= 1 && post.endUserFun.includes(String(user_session))) || 
                    //               (post.endUserFact.length >= 1 && post.endUserFact.includes(String(user_session))) || 
                    //               (post.endUserSupport.length >= 1 && post.endUserSupport.includes(String(user_session)))
                    //             ) {
                    //             post.endUserLike.pull(user_session);
                    //             if (post.likeCount >= 1) {
                    //               post.likeCount -= 1;
                    //             }
                    //             await post.save();
                    //             res.status(200).send({ message: "Removed from Likes", likeCount: post.likeCount });
                    //           } else {
                    //             post.endUserLike.push(user_session);
                    //             post.likeCount += 1;
                    //             await post.save();
                    //             res.status(200).send({ message: "Added To Likes", likeCount: post.likeCount });
                    //           }
                    //       } else {
                    //         res.status(401).send();
                    //       }
                    //     } catch(e) {
                    //       console.log(e)
                    //     }
                    //   };




                    // require("dotenv").config();
                    // const PaytmChecksum = require("paytmchecksum");
                    // const https = require("https");
                    // const Payment = require("../../models/Payment");
                    // const Student = require("../../models/Student");
                    // const Fees = require("../../models/Fees");
                    // const Checklist = require("../../models/Checklist");
                    // const Finance = require("../../models/Finance");
                    // const User = require("../../models/User");
                    // const ApplyPayment = require("../../models/ApplyPayment");
                    // const IdCardPayment = require("../../models/IdCardPayment");
                    // const Admin = require("../../models/superAdmin");
                    // const InstituteAdmin = require("../../models/InstituteAdmin");
                    // const Notification = require("../../models/notification");
                    // const Class = require('../../models/Class')
                    // const { v4: uuidv4 } = require("uuid");
                    
                    // exports.generateTxnToken = async(req, res) => {
                    //     const { amount, fiid, uid, sid, fid } = req.body;
                    // var paytmParams = {};
                    
                    // paytmParams.body = {
                    //  "requestType"  : "Payment",
                    //  "mid"   : process.env.PAYTM_MID,
                    //  "websiteName"  : process.env.PAYTM_MERCHANT_KEY,
                    //  "orderId"   : "oid" + uuidv4(),
                    //  "callbackUrl"  : `https://qviple.com/api/v1/verify/status/${fiid}/${uid}/student/${sid}/fee/${fid}`,
                    //  "txnAmount"  : {
                    //  "value"  : amount,
                    //  "currency" : "INR",
                    //  },
                    //  "userInfo"  : {
                    //  "custId"  : process.env.PAYTM_CUST_ID,
                    //  },
                    // };
                    
                    
                    // PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function(checksum){
                    
                    //  paytmParams.head = {
                    //   "signature" : checksum
                    //  };
                    
                    //  var post_data = JSON.stringify(paytmParams);
                    
                    //  var options = {
                    
                    //  /* for Staging */
                    // //  hostname: 'securegw-stage.paytm.in',
                    
                    //  /* for Production */
                    //  hostname: 'securegw.paytm.in',
                    
                    //  port: 443,
                    //  path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${paytmParams.body.orderId}`,
                    //  method: 'POST',
                    //  headers: {
                    //  'Content-Type': 'application/json',
                    //  'Content-Length': post_data.length
                    //  }
                    //  };
                    
                    //  var response = ""; 
                    //  var post_req = https.request(options, function(post_res) {
                    //  post_res.on('data', function (chunk) {
                    //   response += chunk;
                    //  });
                            
                    //  post_res.on('end', function(){
                    //         res.send({signature: JSON.parse(response), oid: paytmParams.body.orderId, mid: paytmParams.body.mid})
                    //  });
                    //  });
                    
                    //  post_req.write(post_data);
                    //  post_req.end();
                    // });
                    // }
                    
                    
                    // exports.paytmVerifyResponseStatus = async(req, res) =>{
                    //     const { fiid, uid, sid, fid } = req.params;
                    // var paytmParams = {};
                    // paytmParams.body = {
                    //     "mid" : `${req.body.mid}`,
                    //     "orderId" : `${req.body.orderId}`,
                    // };
                    
                    // PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function(checksum){
                    //     paytmParams.head = {
                    //         "signature"	: checksum
                    //     };
                    
                    //     var post_data = JSON.stringify(paytmParams);
                    
                    //     var options = {
                    
                    //         /* for Staging */
                    //         // hostname: 'securegw-stage.paytm.in',
                    
                    //         /* for Production */
                    //         hostname: 'securegw.paytm.in',
                    
                    //         port: 443,
                    //         path: '/v3/order/status',
                    //         method: 'POST',
                    //         headers: {
                    //             'Content-Type': 'application/json',
                    //             'Content-Length': post_data.length
                    //         }
                    //     };
                    
                    //     var response = "";
                    //     var post_req = https.request(options, function(post_res) {
                    //         post_res.on('data', function (chunk) {
                    //             response += chunk;
                    //         });
                    
                    //         post_res.on('end', async function(){
                    //             let { body } = JSON.parse(response);
                    //             let status = body.resultInfo.resultStatus;
                    //             let price = body.txnAmount;
                    //             let pay_mode = body.paymentMode
                    //             // TXN_SUCCESS
                    //             // PENDING
                    //             if (status === "TXN_SUCCESS") {
                    //                 await addPayment(body, sid, fid, uid);
                    //                 await studentPaymentUpdated(fiid, sid, fid, status, price, pay_mode);
                    //                 res.status(200).send({ message: 'Payment Successfull 🎉✨🎉✨'})
                    //               } else {
                    //                 res.status(402).send({ message: 'Payment Required'})
                    //               }
                    //         });
                    //     });
                    
                    //     post_req.write(post_data);
                    //     post_req.end();
                    // });
                    
                    // }
                    
                    
                    // const addPayment = async (data, studentId, feeId, userId) => {
                    //     try {
                    //       const student = await Student.findById({ _id: studentId });
                    //       const fee = await Fees.findOne({_id: feeId})
                    //       const checklist = await Checklist.findOne({_id: feeId})
                    //       const payment = new Payment(data);
                    //       payment.studentId = student._id;
                    //       payment.feeId = feeId;
                    //       payment.userId = userId;
                    //       student.paymentList.push(payment._id);
                    //       if(fee){
                    //         payment.feeType = fee.feeName
                    //       }
                    //       else if(checklist){
                    //         payment.feeType = checklist.checklistName
                    //       }
                    //       else{}
                    //       await Promise.all([ payment.save(), student.save()])
                    //     } catch (error) {
                    //       console.log("Payment Failed!", error);
                    //     }
                    //   };
                    
                    
                    // const studentPaymentUpdated = async (financeId, studentId, feeId, statusType, tx_amount, mode) => {
                    //     try {
                    //       var payment_modes = ['CC', 'DC', 'NB', 'PPI']
                    //       const student = await Student.findById({ _id: studentId });
                    //       const finance = await Finance.findById({ _id: financeId }).populate({
                    //           path: "institute",
                    //         })
                    //         .populate({
                    //           path: "financeHead",
                    //           populate: {
                    //             path: "user",
                    //           },
                    //         });
                    //       const user = await User.findById({
                    //         _id: `${finance.financeHead.user._id}`,
                    //       });
                    //       const classes = await Class.findById({_id: `${student.studentClass}`})
                    //       const fData = await Fees.findById({ _id: feeId });
                    //       const checklistData = await Checklist.findById({ _id: feeId });
                    //       const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
                    //       const notify = new Notification({});
                    //       if (fData) {
                    //         if (fData.studentsList.length >= 1 && fData.studentsList.includes(String(student._id))) {
                    //           res.status(200).send({ message: `${student.studentFirstName} paid the ${fData.feeName}`});
                    //         } 
                    //         else {
                    //           try {
                    //             student.studentFee.push(fData._id);
                    //             fData.onlineList.push(student._id);
                    //             student.onlineFeeList.push(fData._id);
                    //             student.studentPaidFeeCount += fData.feeAmount
                    //             student.studentRemainingFeeCount -= fData.feeAmount
                    //             if(payment_modes?.includes(`${mode}`)){
                    //               let charged_amount = (parseInt(tx_amount) * 1.99 )/100
                    //               let add_amount = (parseInt(tx_amount) - charged_amount)
                    //               finance.financeBankBalance = finance.financeBankBalance + add_amount;
                    //               finance.financeTotalBalance = finance.financeTotalBalance + add_amount
                    //               finance.institute.insBankBalance = finance.institute.insBankBalance + add_amount;
                    //               finance.institute.adminRepayAmount = finance.institute.adminRepayAmount + add_amount;
                    //               admin.returnAmount += add_amount
                    //               finance.payment_gateway_charges.push({
                    //                 original_amount: parseInt(tx_amount),
                    //                 payment_mode: mode,
                    //                 percent: '1.99 %',
                    //                 deduct_charge_gateway_amount: charged_amount,
                    //                 return_amount: add_amount
                    //               })
                    //             }
                    //             else{
                    //               finance.financeBankBalance = finance.financeBankBalance + parseInt(tx_amount);
                    //               finance.financeTotalBalance = finance.financeTotalBalance + parseInt(tx_amount)
                    //               finance.institute.insBankBalance = finance.institute.insBankBalance + parseInt(tx_amount);
                    //               finance.institute.adminRepayAmount = finance.institute.adminRepayAmount + parseInt(tx_amount);
                    //               admin.returnAmount += parseInt(tx_amount)
                    //               finance.payment_gateway_charges.push({
                    //                 original_amount: parseInt(tx_amount),
                    //                 payment_mode: mode,
                    //                 percent: '0 %',
                    //                 deduct_charge_gateway_amount: 0,
                    //                 return_amount: 0
                    //               })
                    //             }
                    //             notify.notifyContent = `${student.studentFirstName}${
                    //               student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
                    //             } ${student.studentLastName} paid the ${
                    //               fData.feeName
                    //             }/ (Rs.${tx_amount}) successfully`;
                    //             notify.notifySender = student._id;
                    //             notify.notifyReceiever = user._id;
                    //             finance.institute.iNotify.push(notify._id);
                    //             notify.institute = finance.institute;
                    //             user.uNotify.push(notify._id);
                    //             notify.user = user._id;
                    //             notify.notifyByStudentPhoto = student._id;
                    //             classes.onlineFeeCollection.push({
                    //               fee: parseInt(tx_amount),
                    //               feeId: fData._id
                    //             })
                    //             await Promise.all([
                    //               student.save(),
                    //               fData.save(),
                    //               finance.save(),
                    //               finance.institute.save(),
                    //               user.save(),
                    //               notify.save(),
                    //               admin.save(),
                    //               classes.save()
                    //             ])
                    //           } catch(e){
                    //             console.log(e)
                    //           }
                    //         }
                    //       } else if (checklistData) {
                    //         if (checklistData.studentsList.length >= 1 && checklistData.studentsList.includes(String(student._id))) {
                    //           res.status(200).send({ message: `${student.studentFirstName} paid the ${checklistData.checklistName}`});
                    //         } 
                    //         else {
                    //           try {
                    //             student.studentChecklist.push(checklistData._id);
                    //             student.studentPaidFeeCount += fData.feeAmount
                    //             student.studentRemainingFeeCount -= fData.feeAmount
                    //             checklistData.checklistFeeStatus = statusType;
                    //             checklistData.studentsList.push(student._id);
                    //             checklistData.checklistStudent = student._id;
                    //             student.onlineCheckList.push(checklistData._id);
                    //             if(payment_modes?.includes(`${mode}`)){
                    //               let charged_amounts = (parseInt(tx_amount) * 1.99 )/100
                    //               let add_amounts = (parseInt(tx_amount) - charged_amounts)
                    //               finance.financeBankBalance = finance.financeBankBalance + add_amounts;
                    //               finance.financeTotalBalance = finance.financeTotalBalance + add_amounts
                    //               finance.institute.insBankBalance = finance.institute.insBankBalance + add_amounts;
                    //               finance.institute.adminRepayAmount = finance.institute.adminRepayAmount + add_amounts;
                    //               admin.returnAmount += add_amounts
                    //               finance.payment_gateway_charges.push({
                    //                 original_amount: parseInt(tx_amount),
                    //                 payment_mode: mode,
                    //                 percent: '1.99 %',
                    //                 deduct_charge_gateway_amount: charged_amounts,
                    //                 return_amount: add_amounts
                    //               })
                    //             }
                    //             else{
                    //               finance.financeBankBalance = finance.financeBankBalance + parseInt(tx_amount);
                    //               finance.financeTotalBalance = finance.financeTotalBalance + parseInt(tx_amount)
                    //               finance.institute.insBankBalance = finance.institute.insBankBalance + parseInt(tx_amount);
                    //               finance.institute.adminRepayAmount = finance.institute.adminRepayAmount + parseInt(tx_amount);
                    //               admin.returnAmount += parseInt(tx_amount)
                    //               finance.payment_gateway_charges.push({
                    //                 original_amount: parseInt(tx_amount),
                    //                 payment_mode: mode,
                    //                 percent: '0 %',
                    //                 deduct_charge_gateway_amount: 0,
                    //                 return_amount: 0
                    //               })
                    //             }
                    //             notify.notifyContent = `${student.studentFirstName}${
                    //               student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
                    //             } ${student.studentLastName} paid the ${
                    //               checklistData.checklistName
                    //             }/ (Rs.${tx_amount}) successfully`;
                    //             notify.notifySender = student._id;
                    //             notify.notifyReceiever = user._id;
                    //             finance.institute.iNotify.push(notify._id);
                    //             notify.institute = finance.institute;
                    //             user.uNotify.push(notify._id);
                    //             notify.user = user._id;
                    //             notify.notifyByStudentPhoto = student._id;
                    //             await Promise.all([
                    //               student.save(),
                    //               checklistData.save(),
                    //               finance.save(),
                    //               finance.institute.save(),
                    //               user.save(),
                    //               notify.save(),
                    //               admin.save()
                    //             ])
                    //           } catch(e) {
                    //             console.log(e)
                    //           }
                    //         }
                    //       }
                    //     } catch(e) {
                    //       console.log(e)
                    //     }
                    //   };
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    // // ============================================ Activate Institute APK ======================================
                    
                    // exports.generateActivateTxnToken = async(req, res) => {
                    //     const { amount, id, name } = req.body;
                    // var paytmParams = {};
                    
                    // paytmParams.body = {
                    //  "requestType"  : "Payment",
                    //  "mid"   : process.env.PAYTM_MID,
                    //  "websiteName"  : process.env.PAYTM_MERCHANT_KEY,
                    //  "orderId"   : "oid" + uuidv4(),
                    //  "callbackUrl"  : `https://qviple.com/api/v1/verify/activate/status/${id}/user/${name}`,
                    //  "txnAmount"  : {
                    //  "value"  : amount,
                    //  "currency" : "INR",
                    //  },
                    //  "userInfo"  : {
                    //  "custId"  : process.env.PAYTM_CUST_ID,
                    //  },
                    // };
                    
                    
                    // PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function(checksum){
                    
                    //  paytmParams.head = {
                    //   "signature" : checksum
                    //  };
                    
                    //  var post_data = JSON.stringify(paytmParams);
                    
                    //  var options = {
                    
                    //  /* for Staging */
                    // //  hostname: 'securegw-stage.paytm.in',
                    
                    //  /* for Production */
                    //  hostname: 'securegw.paytm.in',
                    
                    //  port: 443,
                    //  path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${paytmParams.body.orderId}`,
                    //  method: 'POST',
                    //  headers: {
                    //  'Content-Type': 'application/json',
                    //  'Content-Length': post_data.length
                    //  }
                    //  };
                    
                    //  var response = ""; 
                    //  var post_req = https.request(options, function(post_res) {
                    //  post_res.on('data', function (chunk) {
                    //   response += chunk;
                    //  });
                            
                    //  post_res.on('end', function(){
                    //         res.send({signature: JSON.parse(response), oid: paytmParams.body.orderId, mid: paytmParams.body.mid})
                    //  });
                    //  });
                    
                    //  post_req.write(post_data);
                    //  post_req.end();
                    // });
                    // }
                    
                    
                    // exports.paytmVerifyActivateResponseStatus = async(req, res) =>{
                    //     const { id, name } = req.params;
                    // var paytmParams = {};
                    // paytmParams.body = {
                    //     "mid" : `${req.body.mid}`,
                    //     "orderId" : `${req.body.orderId}`,
                    // };
                    
                    // PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function(checksum){
                    //     paytmParams.head = {
                    //         "signature"	: checksum
                    //     };
                    
                    //     var post_data = JSON.stringify(paytmParams);
                    
                    //     var options = {
                    
                    //         /* for Staging */
                    //         // hostname: 'securegw-stage.paytm.in',
                    
                    //         /* for Production */
                    //         hostname: 'securegw.paytm.in',
                    
                    //         port: 443,
                    //         path: '/v3/order/status',
                    //         method: 'POST',
                    //         headers: {
                    //             'Content-Type': 'application/json',
                    //             'Content-Length': post_data.length
                    //         }
                    //     };
                    
                    //     var response = "";
                    //     var post_req = https.request(options, function(post_res) {
                    //         post_res.on('data', function (chunk) {
                    //             response += chunk;
                    //         });
                    
                    //         post_res.on('end', function(){
                    //             let { body } = JSON.parse(response);
                    //             let status = body.resultInfo.resultStatus;
                    //             let price = body.txnAmount;
                    //             if (status === "TXN_SUCCESS") {
                    //                 addUnlockPayment(body, id, name);
                    //                 unlockInstitute(id, price);
                    //                 res.status(200).send({ message: 'Payment Successfull 🎉✨🎉✨'})
                    //               } else {
                    //                 res.status(402).send({ message: 'Payment Required'})
                    //               }
                    //         });
                    //     });
                    
                    //     post_req.write(post_data);
                    //     post_req.end();
                    // });
                    
                    // }
                    
                    
                    // const addUnlockPayment = async (data, insId ) => {
                    //     try {
                    //       const unlock = new IdCardPayment(data);
                    //       const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
                    //       unlock.insId = insId;
                    //       admin.exploreFeatureList.push(unlock._id);
                    //       await unlock.save();
                    //       await admin.save();
                    //     } catch (error) {
                    //       console.log("Unlock Payment Failed!", error);
                    //     }
                    //   };
                      
                      
                    //   const unlockInstitute = async (insId, tx_iAmounts) => {
                    //     try {
                    //       const institute = await InstituteAdmin.findById({ _id: insId });
                    //       const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
                    //       const notify = new Notification({});
                    //       admin.featureAmount = admin.featureAmount + parseInt(tx_iAmounts);
                    //       admin.activateAccount += 1
                    //       institute.featurePaymentStatus = 'Paid'
                    //       institute.accessFeature = 'UnLocked'
                    //       institute.activateStatus = 'Activated'
                    //       institute.activateDate = new Date()
                    //       notify.notifyContent = `Feature Unlock Amount ${institute.insName}/ (Rs.${tx_iAmounts})  has been paid successfully stay tuned...`;
                    //       notify.notifySender = institute._id
                    //       notify.notifyReceiever = admin._id
                    //       admin.aNotify.push(notify._id);
                    //       notify.notifyByInsPhoto = institute._id;
                    //       await Promise.all([ institute.save(), admin.save(), notify.save()])
                    //     } catch(e) {
                    //       console.log(e)
                    //     }
                    //   };
                                       


// Class Fee Student
      // fData.studentsList.push(student._id);
      // fData.feeStudent = student;
    //   student.studentFee.push(fData._id);
    //   fData.feeStatus = "Paid";

// Class Exempt Fee
// student.studentExemptFee.push(fData._id);
// fData.feeStatus = status;
// fData.studentExemptList.push(student._id);
// fData.feeStudent = student;
        // finance.financeTotalBalance += fData.feeAmount
