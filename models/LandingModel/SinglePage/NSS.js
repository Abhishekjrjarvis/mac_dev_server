const mongoose = require("mongoose");

const nssSchema = new mongoose.Schema({
  nss_about: {
    type: String,
  },
  nss_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  nss_objective: {
    type: String,
  },
  nss_photo: {
    type: String
  },
  nss_roles: [
    {
      headline: {
        type: String,
      },
      headline_description: {
        type: String,
      },
    },
  ],
  nss_commitee: [
    {
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      designation: {
        type: String,
      },
    },
  ],
  nss_commitee_count: {
    type: Number,
    default: 0,
  },
  nss_program: [
    {
      calendar: {
        title: {
          type: String,
        },
        article: [
          {
            name: {
              type: String,
            },
            post: [],
            content: {
              type: String,
            },
          },
        ],
      },
    },
  ],
});

module.exports = mongoose.model("NSS", nssSchema);
