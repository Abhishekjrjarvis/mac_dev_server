const mongoose = require("mongoose");

const classMasterSchema = new mongoose.Schema({
  className: { type: String, required: true },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  classDivision: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  testSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMasterTestSet",
    },
  ],
  classCount: {
    type: Number,
    default: 0,
  },
  standard_mark_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StandardMarkList",
    },
  ],
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  transport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transport",
  },
  automate_class_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AutomateClassMaster",
  },
  theory_classes: [
    {
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
      },
      did: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
      }
    }
  ],
  theory_classes_count: {
    type: Number,
    default: 0
  },
  practical_batch: [
    {
      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch"
      },
      did: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
      }
    }
  ],
  practical_batch_count: {
    type: Number,
    default: 0
  }
});

const ClassMaster = mongoose.model("ClassMaster", classMasterSchema);

module.exports = ClassMaster;
