// const InstituteAdmin = require("../../models/InstituteAdmin");
// const Finance = require("../../models/Finance");
// const Student = require("../../models/Student");
// const Staff = require("../../models/Staff");
// const User = require("../../models/User");
// const OrderPayment = require("../../models/RazorPay/orderPayment");
// const Notification = require("../../models/notification");
// const Admin = require("../../models/superAdmin");
// const Income = require("../../models/Income");
// const Expense = require("../../models/Expense");
// const Class = require("../../models/Class");
// const ClassMaster = require("../../models/ClassMaster");
// const Fees = require("../../models/Fees");
// const Department = require("../../models/Department");
// const {
//   uploadDocFile,
//   getFileStream,
//   deleteFile,
// } = require("../../S3Configuration");
// const fs = require("fs");
// const util = require("util");
// const unlinkFile = util.promisify(fs.unlink);
// const Payroll = require("../../models/Finance/Payroll");
// const StudentNotification = require("../../models/Marks/StudentNotification");
// const invokeMemberTabNotification = require("../../Firebase/MemberTab");
// const invokeFirebaseNotification = require("../../Firebase/firebase");
// const BusinessTC = require("../../models/Finance/BToC");
// const FeeCategory = require("../../models/Finance/FeesCategory");
// const FeeStructure = require("../../models/Finance/FeesStructure");
// const FeeMaster = require("../../models/Finance/FeeMaster");
// // const encryptionPayload = require("../../Utilities/Encrypt/payload");
// const Transport = require("../../models/Transport/transport");
// const Store = require("../../models/Finance/Inventory");
// const BankAccount = require("../../models/Finance/BankAccount");
// const { nested_document_limit } = require("../../helper/databaseFunction");
// const { designation_alarm } = require("../../WhatsAppSMS/payload");
// const {
//   connect_redis_hit,
//   connect_redis_miss,
// } = require("../../config/redis-config");
// const moment = require("moment");
// const Admission = require("../../models/Admission/Admission");
// const Library = require("../../models/Library/Library");
// const { handle_undefined } = require("../../Handler/customError");
// const FeeReceipt = require("../../models/RazorPay/feeReceipt");
// const RemainingList = require("../../models/Admission/RemainingList");
// const { generate_hash_pass } = require("../../helper/functions");
// const { render_finance_current_role } = require("../Moderator/roleController");

// exports.renderActivateHostelQuery = async (req, res) => {
//   try {
//     const { id, sid } = req.params;
//     const institute = await InstituteAdmin.findById({ _id: id });
//     const staff = await Staff.findById({ _id: sid });
//     const user = await User.findById({ _id: `${staff.user}` });
//     const finance = new Finance({});
//     const notify = new Notification({});
//     staff.financeDepartment.push(finance._id);
//     staff.staffDesignationCount += 1;
//     staff.recentDesignation = "Finance Manager";
//     staff.designation_array.push({
//       role: "Finance Manager",
//       role_id: finance?._id,
//     });
//     finance.financeHead = staff._id;
//     let password = await generate_hash_pass();
//     finance.designation_password = password?.pass;
//     institute.financeDepart.push(finance._id);
//     institute.financeStatus = "Enable";
//     finance.institute = institute._id;
//     notify.notifyContent = `you got the designation of as Finance Manager A/c Access Pin - ${password?.pin}`;
//     notify.notify_hi_content = `आपको वित्त व्यवस्थापक के रूप में पदनाम मिला है |`;
//     notify.notify_mr_content = `तुम्हाला वित्त व्यवस्थापक म्हणून पद मिळाले आहे`;
//     notify.notifySender = id;
//     notify.notifyReceiever = user._id;
//     notify.notifyCategory = "Finance Designation";
//     user.uNotify.push(notify._id);
//     notify.user = user._id;
//     notify.notifyByInsPhoto = institute._id;
//     invokeFirebaseNotification(
//       "Designation Allocation",
//       notify,
//       institute.insName,
//       user._id,
//       user.deviceToken
//     );
//     await Promise.all([
//       institute.save(),
//       staff.save(),
//       finance.save(),
//       user.save(),
//       notify.save(),
//     ]);
//     // const fEncrypt = await encryptionPayload(finance._id);
//     res.status(200).send({
//       message: "Successfully Assigned Staff",
//       finance: finance._id,
//       status: true,
//     });
//     designation_alarm(
//       user?.userPhoneNumber,
//       "FINANCE",
//       institute?.sms_lang,
//       "",
//       "",
//       ""
//     );
//   } catch (e) {
//     console.log(e);
//   }
// };
