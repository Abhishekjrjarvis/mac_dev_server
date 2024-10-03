const InstituteAdmin = require("../../models/InstituteAdmin");
const OutwardCreate = require("../../models/InwardOutward/OutwardCreate");
const InwardOutward = require("../../models/InwardOutward/InwardOutward");
const InwardOutwardStaff = require("../../models/InwardOutward/InwardOutwardStaff");
const Staff = require("../../models/Staff");
const InwardCreate = require("../../models/InwardOutward/InwardCreate");
const Student = require("../../models/Student");
const outwardCreateReport = require("../../scripts/inwardOutward/outwardCreateReport");
const moment = require("moment");

exports.custom_institute_generate_inward_outward_query = async (req, res) => {
  try {
    const institute = await InstituteAdmin.findById("651ba22de39dbdf817dd520c");
    if (institute?.inward_outward) {
    } else {
      const inou = new InwardOutward({
        institute: institute?._id,
      });
      institute.inward_outward = inou?._id;
      await Promise.all([inou.save(), institute.save()]);
    }

    // const institute = await InstituteAdmin.find({
    //   status: "Approved",
    // });

    // if (institute?.length > 0) {
    //   for (let inst of institute) {
    //     if (inst?.inward_outward) {
    //     } else {
    //       const inou = new InwardOutward({
    //         institute: inst?._id,
    //       });
    //       inst.inward_outward = inou?._id;
    //       await Promise.all([inou.save(), inst.save()]);
    //     }
    //   }
    // }
    res.status(200).send({
      message: "All institute check inward outward reltaed things",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.custom_staff_generate_inward_outward_query = async (req, res) => {
  try {
    const staff = await Staff.findById("651bea1b08e427c667ee25ae");
    if (staff?.inward_outward) {
    } else {
      const inou = new InwardOutwardStaff({
        institute: staff?.institute,
        staff: staff?._id,
      });
      staff.inward_outward = inou?._id;
      await Promise.all([inou.save(), staff.save()]);
    }

    // const staff = await Staff.find({
    //   staffStatus: "Approved",
    // });

    // if (staff?.length > 0) {
    //   for (let inst of staff) {
    //     if (inst?.inward_outward) {
    //     } else {
    //       const inou = new InwardOutwardStaff({
    //         institute: inst?.institute,
    //         staff: inst?._id,
    //       });
    //       inst.inward_outward = inou?._id;
    //       await Promise.all([inou.save(), inst.save()]);
    //     }
    //   }
    // }
    res.status(200).send({
      message: "All staff check inward outward reltaed things",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.inoutward_detail_query = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const inoutward = await InwardOutward.findOne({
      institute: { $eq: `${id}` },
    }).select("outward_number monthly_outward_number monthly_number");
    res.status(200).send({
      message: "Institute Inward Outward detail",
      access: true,
      inoutward: inoutward,
    });
  } catch (e) {
    console.log(e);
  }
};

const notice_outward_create = async () => {};

exports.outward_creation_query = async (req, res) => {
  try {
    const { ioid } = req.params;
    const {
      outward_type,
      subject,
      body,
      image,
      attachment,
      prepare_by,
      approvals_for,
      isInward,
      name,
      number,
      date,
    } = req.body;
    if (!ioid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const inou = await InwardOutward.findById(ioid);
    inou.outward_number += 1;
    let ct_number = "";
    let dt = new Date();
    dt = moment(dt)?.format("MMYYYY");
    dt = +dt;
    if (inou?.monthly_number) {
      if (dt > inou?.monthly_number) {
        inou.monthly_number_pattern.push(
          `${dt}-${inou.monthly_outward_number}`
        );
        inou.monthly_number = dt;
        inou.monthly_outward_number += 1;
        ct_number += `${dt}-`;
        ct_number += `1`;
      } else {
        ct_number += `${inou?.monthly_number}-`;
        inou.monthly_outward_number += 1;
        ct_number += `${inou.monthly_outward_number}`;
      }
    } else {
      inou.monthly_number = dt;
      inou.monthly_outward_number += 1;
      ct_number += `${dt}-`;
      ct_number += `1`;
    }
    let outward = null;
    if (isInward === "ADD_MANUAL") {
      outward = new OutwardCreate({
        outward_type,
        name: name,
        number,
        date,
        attachment,
        prepare_by,
        approvals_for,
        inward_outward: ioid,
        outward_number: ct_number,
        institute: inou.institute,
        model_type: "INWARD",
      });

      inou.outward.push(outward?._id);
      await Promise.all([outward.save(), inou.save()]);
      res.status(200).send({
        message: "All outward created things",
        access: true,
      });

      if (prepare_by) {
        const staff_ou = await InwardOutwardStaff.findOne({
          staff: `${prepare_by}`,
        });
        staff_ou.sent_outward_pending.push(outward?._id);
        await staff_ou.save();
      }
    } else if (isInward === "STUDENT") {
      outward = new OutwardCreate({
        outward_type,
        subject,
        body,
        image,
        attachment,
        prepare_by,
        approvals_for,
        inward_outward: ioid,
        outward_number: ct_number,
        institute: inou.institute,
        date: new Date(),
        is_prepare_by: "STUDENT",
        model_type: "INWARD",
      });

      inou.outward.push(outward?._id);
      await Promise.all([outward.save(), inou.save()]);
      res.status(200).send({
        message: "All outward created things",
        access: true,
      });

      if (prepare_by) {
        const student_ou = await Student.findById(prepare_by);
        student_ou.inward_create.push(outward?._id);
        await student_ou.save();
      }
    } else {
      outward = new OutwardCreate({
        outward_type,
        subject,
        body,
        image,
        attachment,
        prepare_by,
        approvals_for,
        inward_outward: ioid,
        outward_number: ct_number,
        institute: inou.institute,
      });

      inou.outward.push(outward?._id);
      await Promise.all([outward.save(), inou.save()]);
      res.status(200).send({
        message: "All outward created things",
        access: true,
      });

      if (prepare_by) {
        const staff_ou = await InwardOutwardStaff.findOne({
          staff: `${prepare_by}`,
        });
        staff_ou.sent_outward_pending.push(outward?._id);
        await staff_ou.save();
      }
    }

    if (approvals_for?.length > 0) {
      for (let dt of approvals_for) {
        const staff_ou = await InwardOutwardStaff.findOne({
          staff: `${dt?.staff}`,
        });
        staff_ou.recieve_outward_pending.push(outward?._id);
        await staff_ou.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.outward_apprve_by_staff_query = async (req, res) => {
  try {
    const { oid, sid } = req.params;
    if (!oid || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const outward = await OutwardCreate.findById(oid);

    if (outward?.approvals_for?.length > 0) {
      for (let dt of outward?.approvals_for) {
        if (`${dt?.staff}` === `${sid}`) {
          dt.status = "Approved";
          let staff_ou = await InwardOutwardStaff.findOne({
            staff: { $eq: `${sid}` },
          });
          staff_ou.recieve_outward_pending.pull(oid);
          staff_ou.recieve_outward_approved.push(oid);
          await staff_ou.save();
        }
      }
    }
    await outward.save();
    res.status(200).send({
      message: "Outward approved successfully",
      access: true,
    });

    const out = await OutwardCreate.findById(oid);
    let ap_flag = true;
    if (out?.approvals_for?.length > 0) {
      for (let dt of out?.approvals_for) {
        if (dt?.status === "Pending") {
          ap_flag = false;
          break;
        }
      }
    }
    if (ap_flag) {
      out.outward_status = "Approved";
    }
    await out.save();

    if (ap_flag && out?.inward_outward) {
      const inout = await InwardOutward.findById(out?.inward_outward);
      inout.ready_to_pulish.push(out?._id);
      inout.outward.pull(out?._id);
      await inout.save();
    }
    if (out?.is_prepare_by === "STAFF") {
      if (out?.prepare_by && ap_flag) {
        let staff_ou = await InwardOutwardStaff.findOne({
          staff: { $eq: `${out?.prepare_by}` },
        });
        staff_ou.sent_outward_pending.pull(oid);
        staff_ou.sent_outward_approved.push(oid);
        await staff_ou.save();
      }
    } else {
    }
    if (out?.model_type === "OUTWARD" && ap_flag) {
      await outwardCreateReport(out?._id, out.institute);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.staff_outward_recieve_pending_list_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const staff_ou = await InwardOutwardStaff.findOne({
      staff: { $eq: `${sid}` },
    });
    let outward = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      outward = await OutwardCreate.find({
        $and: [
          {
            _id: { $in: staff_ou?.recieve_outward_pending },
          },
          {
            $or: [
              {
                subject: { $regex: req.query.search, $options: "i" },
              },
              {
                body: { $regex: req.query.search, $options: "i" },
              },
              {
                outward_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject body generated_report prepare_by outward_status created_at model_type name number cancle_by_staff"
        );
    } else {
      outward = await OutwardCreate.find({
        $and: [
          {
            _id: { $in: staff_ou?.recieve_outward_pending },
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject body generated_report prepare_by outward_status created_at model_type name number cancle_by_staff"
        )
        .sort({
          created_at: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Mentee List",
      access: true,
      outward: outward,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staff_outward_recieve_approved_list_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const staff_ou = await InwardOutwardStaff.findOne({
      staff: { $eq: `${sid}` },
    });

    let outward = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      outward = await OutwardCreate.find({
        $and: [
          {
            _id: { $in: staff_ou?.recieve_outward_approved },
          },
          {
            $or: [
              {
                subject: { $regex: req.query.search, $options: "i" },
              },
              {
                body: { $regex: req.query.search, $options: "i" },
              },
              {
                outward_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject body generated_report prepare_by outward_status created_at model_type name number"
        );
    } else {
      outward = await OutwardCreate.find({
        $and: [
          {
            _id: { $in: staff_ou?.recieve_outward_approved },
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject body generated_report prepare_by outward_status created_at model_type name number"
        )
        .sort({
          created_at: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Mentee List",
      access: true,
      outward: outward,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staff_outward_sent_pending_list_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const staff_ou = await InwardOutwardStaff.findOne({
      staff: { $eq: `${sid}` },
    });

    let outward = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      outward = await OutwardCreate.find({
        $and: [
          {
            _id: { $in: staff_ou?.sent_outward_pending },
          },
          {
            $or: [
              {
                subject: { $regex: req.query.search, $options: "i" },
              },
              {
                body: { $regex: req.query.search, $options: "i" },
              },
              {
                outward_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "approvals_for.staff",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject generated_report outward_status approvals_for model_type name number date created_at"
        );
    } else {
      outward = await OutwardCreate.find({
        $and: [
          {
            _id: { $in: staff_ou?.sent_outward_pending },
          },
        ],
      })
        .populate({
          path: "approvals_for.staff",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject generated_report outward_status approvals_for model_type name number date created_at"
        )
        .sort({
          created_at: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Mentee List",
      access: true,
      outward: outward,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staff_outward_sent_approved_list_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const staff_ou = await InwardOutwardStaff.findOne({
      staff: { $eq: `${sid}` },
    });

    let outward = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      outward = await OutwardCreate.find({
        $and: [
          {
            _id: { $in: staff_ou?.sent_outward_approved },
          },
          {
            $or: [
              {
                subject: { $regex: req.query.search, $options: "i" },
              },
              {
                body: { $regex: req.query.search, $options: "i" },
              },
              {
                outward_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "approvals_for.staff",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject generated_report outward_status approvals_for model_type name number date created_at"
        );
    } else {
      outward = await OutwardCreate.find({
        $and: [
          {
            _id: { $in: staff_ou?.sent_outward_approved },
          },
        ],
      })
        .populate({
          path: "approvals_for.staff",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject generated_report outward_status approvals_for model_type name number date created_at"
        )
        .sort({
          created_at: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Mentee List",
      access: true,
      outward: outward,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.inward_add_manual_query = async (req, res) => {
  try {
    const { ioid } = req.params;
    const {
      inward_type,
      name,
      number,
      date,
      attachment,
      prepare_by,
      approvals_for,
    } = req.body;
    if (!ioid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const outward = new InwardCreate({
      inward_type,
      name,
      number,
      date,
      attachment,
      prepare_by,
      approvals_for,
      inward_outward: ioid,
    });
    const inou = await InwardOutward.findById(ioid);
    inou.inward.push(outward?._id);
    await Promise.all([outward.save(), inou.save()]);
    res.status(200).send({
      message: "Add manual inward created things",
      access: true,
    });

    if (prepare_by) {
      const staff_ou = await InwardOutwardStaff.findOne({
        staff: `${prepare_by}`,
      });
      staff_ou.sent_inward_pending.push(outward?._id);
      await staff_ou.save();
    }

    if (approvals_for?.length > 0) {
      for (let dt of approvals_for) {
        const staff_ou = await InwardOutwardStaff.findOne({
          staff: `${dt?.staff}`,
        });
        staff_ou.recieve_inward_pending.push(outward?._id);
        await staff_ou.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.inward_add_by_student_query = async (req, res) => {
  try {
    const { ioid } = req.params;
    const {
      inward_type,
      subject,
      body,
      image,
      attachment,
      prepare_by,
      approvals_for,
    } = req.body;
    if (!ioid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const outward = new InwardCreate({
      inward_type,
      subject,
      body,
      image,
      attachment,
      date: new Date(),
      prepare_by,
      approvals_for,
      inward_outward: ioid,
      is_prepare_by: "STUDENT",
    });
    const inou = await InwardOutward.findById(ioid);
    inou.inward.push(outward?._id);
    await Promise.all([outward.save(), inou.save()]);
    res.status(200).send({
      message: "Add manual inward created things",
      access: true,
    });

    if (prepare_by) {
      const sstudent_ou = await Student.findById(prepare_by);
      sstudent_ou.inward_create.push(outward?._id);
      await sstudent_ou.save();
    }

    if (approvals_for?.length > 0) {
      for (let dt of approvals_for) {
        const staff_ou = await InwardOutwardStaff.findOne({
          staff: `${dt?.staff}`,
        });
        staff_ou.recieve_inward_pending.push(outward?._id);
        await staff_ou.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// for not staff personal realetd
exports.outward_list_query = async (req, res) => {
  try {
    const { ioid } = req.params;
    if (!ioid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    let outward = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      outward = await OutwardCreate.find({
        $and: [
          {
            inward_outward: { $eq: `${ioid}` },
          },
          {
            model_type: { $eq: "OUTWARD" },
          },
          {
            outward_status: { $eq: "Pending" },
          },
          {
            $or: [
              {
                subject: { $regex: req.query.search, $options: "i" },
              },
              {
                body: { $regex: req.query.search, $options: "i" },
              },
              {
                outward_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject body image attachment generated_report prepare_by outward_status"
        );
    } else {
      outward = await OutwardCreate.find({
        $and: [
          {
            inward_outward: { $eq: `${ioid}` },
          },
          {
            model_type: { $eq: "OUTWARD" },
          },
          {
            outward_status: { $eq: "Pending" },
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject body image attachment generated_report prepare_by outward_status"
        )
        .sort("-1")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Mentee List",
      access: true,
      outward: outward,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.inward_list_query = async (req, res) => {
  try {
    const { ioid } = req.params;
    if (!ioid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    let outward = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      outward = await OutwardCreate.find({
        $and: [
          {
            inward_outward: { $eq: `${ioid}` },
          },
          {
            model_type: { $eq: "INWARD" },
          },
          {
            outward_status: { $eq: "Pending" },
          },
          {
            $or: [
              {
                subject: { $regex: req.query.search, $options: "i" },
              },
              {
                body: { $regex: req.query.search, $options: "i" },
              },
              {
                outward_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type attachment generated_report prepare_by outward_status model_type name number date"
        );
    } else {
      outward = await OutwardCreate.find({
        $and: [
          {
            inward_outward: { $eq: `${ioid}` },
          },
          {
            model_type: { $eq: "INWARD" },
          },
          {
            outward_status: { $eq: "Pending" },
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type attachment generated_report prepare_by outward_status model_type name number date"
        )
        .sort("-1")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Mentee List",
      access: true,
      outward: outward,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.ready_to_publish_list_query = async (req, res) => {
  try {
    const { ioid } = req.params;
    if (!ioid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    let outward = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      outward = await OutwardCreate.find({
        $and: [
          {
            inward_outward: { $eq: `${ioid}` },
          },
          {
            outward_status: { $eq: "Approved" },
          },
          {
            $or: [
              {
                subject: { $regex: req.query.search, $options: "i" },
              },
              {
                body: { $regex: req.query.search, $options: "i" },
              },
              {
                outward_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject body image attachment generated_report prepare_by outward_status approvals_for"
        );
    } else {
      outward = await OutwardCreate.find({
        $and: [
          {
            inward_outward: { $eq: `${ioid}` },
          },
          {
            outward_status: { $eq: "Approved" },
          },
        ],
      })
        .populate({
          path: "prepare_by",
          select:
            "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
        })

        .select(
          "outward_type subject body image attachment generated_report prepare_by outward_status approvals_for"
        )
        .sort("-1")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Mentee List",
      access: true,
      outward: outward,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.inward_outward_detail_query = async (req, res) => {
  try {
    const { oid } = req.params;
    if (!oid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let outward = await OutwardCreate.findById(oid)
      .populate({
        path: "prepare_by",
        select:
          "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
      })
      .populate({
        path: "approvals_for.staff",
        select:
          "staffFirstName staffLastName staffMiddleName staffROLLNO staffProfilePhoto",
      });

    res.status(200).send({
      message: "One outward detail",
      access: true,
      outward: outward,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.outward_reject_by_staff_query = async (req, res) => {
  try {
    const { oid, sid } = req.params;
    if (!oid || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const outward = await OutwardCreate.findById(oid);

    if (outward?.approvals_for?.length > 0) {
      for (let dt of outward?.approvals_for) {
        if (`${dt?.staff}` === `${sid}`) {
          dt.status = "Reject";
          outward.cancle_by_staff.push(sid);
        }
      }
    }
    await outward.save();
    res.status(200).send({
      message: "Outward reject successfully",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};
