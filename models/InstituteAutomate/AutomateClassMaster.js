const mongoose = require("mongoose");

const automateClsMasterSchema = new mongoose.Schema({
  className: String,
  stream_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StreamType",
  },

  created_by: {
    type: String,
    // Admin or other institute
    default: "Admin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  subject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomateSubjectMaster",
    },
  ],
});

module.exports = mongoose.model("AutomateClassMaster", automateClsMasterSchema);