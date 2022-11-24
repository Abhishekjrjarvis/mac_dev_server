const mongoose = require("mongoose");

const manageAdminSchema = new mongoose.Schema({
  affiliation_name: {
    type: String,
    required: true,
  },
  affiliation_username: {
    type: String,
    unique: true,
    required: true,
  },
  affiliation_password: {
    type: String,
  },
  affiliation_admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  affiliation_institute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  affiliation_institute_count: {
    type: Number,
    default: 0,
  },
  photo: {
    type: String,
  },
  photoId: {
    type: String,
    default: 0,
  },
  permission: [
    {
      role: { type: String },
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ManageAdmin", manageAdminSchema);
