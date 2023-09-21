const mongoose = require("mongoose");

const transportSiteSchema = new mongoose.Schema({
  transport_about: { type: String },
  transport_process: { type: String },
  transport_contact: [
    {
      contact_department_name: { type: String },
      contact_person_name: { type: String },
      contact_person_mobile: { type: String },
      contact_person_email: { type: String },
    },
  ],
  related_transport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transport",
  },
  cashier_name: String,
  cashier_signature: String,
});

module.exports = mongoose.model("TransportSite", transportSiteSchema);
