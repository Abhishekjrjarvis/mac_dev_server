const mongoose = require("mongoose");

const subdomainSchema = new mongoose.Schema({
  sub_domain_name: {
    type: String,
  },
  sub_domain_path: {
    type: String,
  },
  link_up: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  valid_up_to: {
    type: String,
  },
  ssl_secure: {
    type: String,
    default: "Yes",
  },
  domain: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Allotted",
  },
});

module.exports = mongoose.model("SubDomain", subdomainSchema);
