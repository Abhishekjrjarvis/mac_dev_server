const mongoose = require("mongoose");

const resourcesKeySchema = new mongoose.Schema({
  resourceName: {
    type: String,
  },
  resourceKey: {
    type: String,
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
  },
});

module.exports = mongoose.model("ResourcesKey", resourcesKeySchema);
