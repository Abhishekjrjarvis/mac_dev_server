const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  guide_type: {
    type: String,
  },
  mentees_count: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  mentees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  total_query_count: {
    type: Number,
    default: 0,
  },
  pending_query_count: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  queries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queries",
    },
  ],
  feed_question: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedQuestion",
    },
  ],
  feed_question_count: {
    type: Number,
    default: 0,
  },
  total_feedback_count: {
    type: Number,
    default: 0,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  meetings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
    },
  ],
  meetings_count: {
    type: Number,
    default: 0,
  },
  export_collection: [
    {
      excel_type: {
        type: String,
        // enum: ["MENTEE", "ATTENDACE_SEMESTER", "ATTENDACE_MONTHLY"],
      },
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  export_collection_count: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model("Guide", guideSchema);
