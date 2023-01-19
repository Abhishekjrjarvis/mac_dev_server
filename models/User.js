const mongoose = require("mongoose");
const Post = require("./Post");
const Staff = require("./Staff");
const Student = require("./Student");
const Status = require("./Admission/status");
const Answer = require("./Question/Answer");
const OrderPayment = require("./RazorPay/orderPayment");
const Notification = require("./notification");

const userSchema = new mongoose.Schema({
  userPhoneNumber: { type: Number, maxlength: 10 },
  userEmail: { type: String },
  userPassword: { type: String, minlength: 10 },
  userStatus: { type: String, default: "Not Verified" },
  username: { type: String, required: true, unique: true },
  userLegalName: { type: String },
  userDateOfBirth: { type: String },
  userGender: { type: String },
  userAddress: { type: String },
  userBio: { type: String },
  userPassword: { type: String },
  userAbout: { type: String },
  userCity: { type: String },
  userState: { type: String },
  userCountry: { type: String },
  userHobbies: { type: String },
  userEducation: { type: String },
  referalPercentage: { type: Number, default: 0 },
  profilePhoto: { type: String },
  google_avatar: { type: String },
  profileCoverPhoto: { type: String },
  photoId: { type: String },
  coverId: { type: String },
  userPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  userFollowers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  userFollowing: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  userCircle: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  userInstituteFollowing: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  addUser: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  addUserInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  activeStatus: {
    type: String,
    default: "Activated",
  },
  activeDate: {
    type: String,
  },
  followerCount: {
    type: Number,
    default: 0,
  },
  followingUICount: {
    type: Number,
    default: 0,
  },
  circleCount: {
    type: Number,
    default: 0,
  },
  postCount: {
    type: Number,
    default: 0,
  },
  videoLike: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  videoSave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  watchLater: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  playlistJoin: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
  payment_history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderPayment",
    },
  ],
  videoPurchase: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  transferInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  createdAt: {
    type: String,
  },
  remindLater: {
    type: String,
  },
  uNotify: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  displayPersonArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisplayPerson",
    },
  ],
  starAnnouncement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsAnnouncement",
    },
  ],
  followInsAnnouncement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsAnnouncement",
    },
  ],
  recoveryMail: {
    type: String,
  },
  qvipleAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  recentChat: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  deviceToken: {
    type: String,
  },
  referralArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },
  ],
  userCommission: {
    type: Number,
    default: 0,
  },
  userEarned: {
    type: Number,
    default: 0,
  },
  referralStatus: {
    type: String,
    default: "Not Granted",
  },
  ageRestrict: {
    type: String,
    default: "No",
  },
  paymentStatus: {
    type: String,
    default: "Not Paid",
  },
  supportChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupportChat",
  },
  questionCount: {
    type: Number,
    default: 0,
  },
  answerQuestionCount: {
    type: Number,
    default: 0,
  },
  poll_Count: {
    type: Number,
    default: 0,
  },
  answered_query: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
  is_developer: {
    type: Boolean,
    default: false,
  },
  user_birth_privacy: {
    type: String,
    default: "Every one",
  },
  user_address_privacy: {
    type: String,
    default: "Every one",
  },
  user_circle_privacy: {
    type: String,
    default: "Every one",
  },
  tag_privacy: {
    type: String,
    default: "Every one",
  },
  user_saved_post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  tag_post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  user_saved_answer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
  applicationStatus: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
    },
  ],
  applyApplication: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewApplication",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  one_line_about: {
    type: String,
  },
  user_follower_notify: {
    type: String,
    default: "Enable",
  },
  user_comment_notify: {
    type: String,
    default: "Enable",
  },
  user_answer_notify: {
    type: String,
    default: "Enable",
  },
  user_institute_notify: {
    type: String,
    default: "Enable",
  },
  activity_tab: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentNotification",
    },
  ],
  blockStatus: {
    type: String,
    default: "UnBlocked",
  },
  inquiryList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inquiry",
    },
  ],
  userBlock: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  blockedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  user_block_institute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  blockCount: {
    type: Number,
    default: 0,
  },
  departmentChat: [
    {
      isDepartmentHead: { type: String },
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    },
  ],
  classChat: [
    {
      isClassTeacher: { type: String },
      classes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    },
  ],
  subjectChat: [
    {
      isSubjectTeacher: { type: String },
      subjects: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    },
  ],
  user_latitude: {
    type: Number,
  },
  user_longitude: {
    type: Number,
  },
  user_accuracy: {
    type: Number,
  },
  user_altitude: {
    type: Number,
  },
  user_speed: {
    type: Number,
  },
  user_heading: {
    type: Number,
  },
  user_time: {
    type: String,
  },
  user_isMock: {
    type: Boolean,
  },
  profile_ads_count: {
    type: Number,
    default: 0,
  },
  show_suggestion: {
    type: String,
    default: "Enable",
  },
  lang_mode: {
    type: String,
    default: "en",
  },
  is_mentor: {
    type: Boolean,
    default: false,
  },
  last_seen: {
    type: Date,
  },
  follow_hashtag: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HashTag",
    },
  ],
  follow_hashtag_count: {
    type: Number,
    default: 0,
  },
  next_date: {
    type: String,
  },
  manage_admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManageAdmin",
    },
  ],
  active_member_role: {
    type: String,
  },
  vehicle: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  ],
});

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Post.deleteMany({
      _id: {
        $in: doc.userPosts,
      },
    });
    await Staff.deleteMany({
      _id: {
        $in: doc.staff,
      },
    });
    await Student.deleteMany({
      _id: {
        $in: doc.student,
      },
    });
    await Status.deleteMany({
      _id: {
        $in: doc.applicationStatus,
      },
    });
    await Answer.deleteMany({
      _id: {
        $in: doc.answered_query,
      },
    });
    await OrderPayment.deleteMany({
      _id: {
        $in: doc.payment_history,
      },
    });
    await Notification.deleteMany({
      _id: {
        $in: doc.uNotify,
      },
    });
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
