const mongoose = require("mongoose");
const UserPost = require("./userPost");
const Staff = require("./Staff");
const InstituteAdmin = require("./InstituteAdmin");
const Student = require("./Student");
const UserAnnouncement = require("./UserAnnouncement");
const Post = require("./Post");
const Role = require("./Role");
const DisplayPerson = require('./DisplayPerson')
const Conversation = require("./Conversation");
const Video = require("./Video");
const Playlist = require("./Playlist");
const UserSupport = require("./UserSupport");
const PreAppliedStudent = require("./PreAppliedStudent");
const DepartApplication = require("./DepartmentApplication");
const PlaylistPayment = require("./PlaylistPayment");
const Notification = require('./notification')
const InstituteChat = require('./InstituteChat')


const userSchema = new mongoose.Schema({
  userPhoneNumber: { type: Number, required: true, maxlength: 10 },
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
  profileCoverPhoto: { type: String },
  photoId: { type: String },
  coverId: { type: String },
  userPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPost",
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
  InstituteReferals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  announcement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAnnouncement",
    },
  ],
  saveUsersPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPost",
    },
  ],
  saveUserInsPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
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
    default: 0
  },
  followingUICount: {
    type: Number,
    default: 0
  },
  circleCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
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
  playlistPayment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlaylistPayment",
    },
  ],
  videoPurchase: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  applicationPaymentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepartmentApplication'
    }
  ],
  admissionPaymentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepartmentApplication'
    }
  ],
  transferInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  support: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSupport",
    },
  ],
  createdAt: {
    type: String,
  },
  remindLater: {
    type: String,
  },
  appliedForApplication: [
    {
      appName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DepartmentApplication",
      },
      appUpdates: [
        {
          notificationType: { type: Number },
          notification: { type: String },
          actonBtnText: { type: String },
          deActBtnText: { type: String },
        },
      ],
    },
  ],
  preAppliedStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PreAppliedStudent",
    },
  ],
  uNotify: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    }
  ],
  isAdmin: {
    type: Boolean,
    default: false,
  },
  chatAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstituteChat'
  },
  joinChat: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstituteChat'
    }
  ],
  displayPersonArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisplayPerson'
    }
  ],
  starAnnouncement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InsAnnouncement'
    }
  ],
  recoveryMail: {
    type: String
  }
});

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await UserPost.deleteMany({
      _id: {
        $in: doc.userPosts,
      },
    });
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
