const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
  },
  date: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  status: {
    type: String,
    default: "Request",
  },
  attach: {
    type: String,
  },
  leave_type: {
    type: String,
  },
  granted_on: {
    type: Date,
  },
  recommend: {
    recommend_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    recommend_on: {
      type: Date,
    },
    recommend_status: {
      type: String,
      default: "Request",
    },
  },
  review: {
    review_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    review_on: {
      type: Date,
    },
    review_status: {
      type: String,
      default: "Request",
    },
  },
  sanction: {
    sanction_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    sanction_on: {
      type: Date,
    },
    sanction_status: {
      type: String,
      default: "Request",
    },
  },
  leave_grant: {
    type: Number,
    default: 0,
  },
  lms: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LMS",
  },
  leave_dates: [
    {
      date: {
        type: String,
      },
      from: {
        type: String,
      },
      to: {
        type: String,
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      replace_staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      which_type: {
        type: String,
        default: "Single",
      },
    },
  ],
  from: {
    type: Date,
  },
  to: {
    type: Date,
  },
  total_days: {
    type: Number,
  },
  leave_number: {
    type: String,
  },
  staff_replace_type: {
    type: String,
    default: "Single",
  },
});

const Leave = mongoose.model("Leave", leaveSchema);

module.exports = Leave;
