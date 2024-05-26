const mongoose = require("mongoose");

const instituteLogSchema = new mongoose.Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  certificate_logs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteCertificateLog",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("InstituteLog", instituteLogSchema);