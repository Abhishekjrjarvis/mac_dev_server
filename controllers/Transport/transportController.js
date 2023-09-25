const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");
const Finance = require("../../models/Finance");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const Student = require("../../models/Student");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");
const Direction = require("../../models/Transport/direction");
const TransportBatch = require("../../models/Transport/TransportBatch");
const {
  uploadDocFile,
  uploadFile,
  uploadPostImageFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../Firebase/firebase");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const {
  designation_alarm,
  email_sms_designation_alarm,
} = require("../../WhatsAppSMS/payload");
const { nested_document_limit } = require("../../helper/databaseFunction");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const Batch = require("../../models/Batch");
const ClassMaster = require("../../models/ClassMaster");
const RemainingList = require("../../models/Admission/RemainingList");
const {
  add_all_installment,
  render_installment,
  add_total_installment,
  exempt_installment,
  set_fee_head_query,
  remain_one_time_query,
  update_fee_head_query,
  lookup_applicable_grant,
} = require("../../helper/TransportInstallment");
const StudentNotification = require("../../models/Marks/StudentNotification");
const FeeMaster = require("../../models/Finance/FeeMaster");
const { handle_undefined } = require("../../Handler/customError");
const FeeStructure = require("../../models/Finance/FeesStructure");

exports.renderNewTransportManager = async (req, res) => {
  try {
    const { id, sid } = req.params;
    if (!sid && !id)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    var institute = await InstituteAdmin.findById({ _id: id });
    var transport = new Transport({});
    if (sid) {
      var staff = await Staff.findById({ _id: sid });
      var user = await User.findById({ _id: `${staff.user}` });
      var notify = new Notification({});
      staff.transportDepartment.push(transport._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = "Transportation Manager";
      staff.designation_array.push({
        role: "Transportation Manager",
        role_id: transport?._id,
      });
      transport.transport_manager = staff._id;
      notify.notifyContent = `you got the designation of Transportation Manager 🎉🎉`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Transport Designation";
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = institute._id;
      await invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        institute.insName,
        user._id,
        user.deviceToken
      );
      await Promise.all([
        staff.save(),
        transport.save(),
        user.save(),
        notify.save(),
      ]);
      designation_alarm(
        user?.userPhoneNumber,
        "TRANSPORT",
        institute?.sms_lang,
        "",
        "",
        ""
      );
      if (user?.userEmail) {
        email_sms_designation_alarm(
          user?.userEmail,
          "TRANSPORT",
          institute?.sms_lang,
          "",
          "",
          ""
        );
      }
    } else {
      transport.transport_manager = null;
    }
    institute.transportDepart.push(transport._id);
    institute.transportStatus = "Enable";
    transport.institute = institute._id;
    await Promise.all([institute.save(), transport.save()]);
    // const tEncrypt = await encryptionPayload(transport._id);
    res.status(200).send({
      message: "Successfully Assigned Transport Manager",
      transport: transport._id,
      access: true,
      status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportManagerDashboard = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const trans_panel = await Transport.findById({ _id: tid })
      .select(
        "vehicle_count transport_staff_count transport_photo photoId passenger_count requested_status collected_fee pending_student exempt_fee online_fee offline_fee remaining_fee departmentSelectBatch batchCount fees_structures_count fees_structures_count masterCount refundCount refundedCount"
      )
      .populate({
        path: "transport_manager",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "institute",
        select: "insProfilePhoto financeDepart admissionDepart hostelDepart",
        populate: {
          path: "financeDepart",
          select: "fee_master_array_count fees_category_count",
        },
      });
    // const tEncrypt = await encryptionPayload(trans_panel);
    res.status(200).send({
      message: "Handle Lot's of Data Counts Enjoy 😀",
      access: true,
      trans_panel: trans_panel,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewVehicleQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    const { dsid, csid, duid, cuid } = req.body;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const trans_panel = await Transport.findById({ _id: tid });
    if (dsid) {
      var d_staff = await Staff.findOne({ _id: dsid });
    }
    if (csid) {
      var c_staff = await Staff.findOne({ _id: csid });
    }
    if (duid) {
      var d_user = await User.findById({ _id: duid });
    }
    if (cuid) {
      var c_user = await User.findById({ _id: cuid });
    }
    const new_vehicle = new Vehicle({ ...req.body });
    if (new_vehicle?.vehicle_type === "Own") {
      if (d_staff) {
        new_vehicle.vehicle_driver = d_staff._id;
        d_staff.vehicle.push(new_vehicle._id);
        d_staff.vehicle_category = new_vehicle.vehicle_type;
        trans_panel.transport_staff_count += 1;
        trans_panel.transport_drivers.push(d_staff._id);
        await d_staff.save();
      }
      if (c_staff) {
        new_vehicle.vehicle_conductor = c_staff._id;
        c_staff.vehicle.push(new_vehicle._id);
        c_staff.vehicle_category = new_vehicle.vehicle_type;
        trans_panel.transport_staff_count += 1;
        trans_panel.transport_conductors.push(c_staff._id);
        await c_staff.save();
      }
    } else if (new_vehicle?.vehicle_type === "Outsider") {
      if (d_user) {
        new_vehicle.vehicle_no_driver = d_user?._id;
        d_user.vehicle.push(d_user?._id);
        trans_panel.transport_staff_count += 1;
        trans_panel.transport_ndconductors.push(d_user._id);
        await d_user.save();
      }
      if (c_user) {
        new_vehicle.vehicle_no_conductor = c_user?._id;
        c_user.vehicle.push(c_user?._id);
        trans_panel.transport_staff_count += 1;
        trans_panel.transport_ndconductors.push(c_user._id);
        await c_user.save();
      }
    } else {
    }
    trans_panel.transport_vehicles.push(new_vehicle?._id);
    trans_panel.vehicle_count += 1;
    new_vehicle.transport = trans_panel._id;
    await Promise.all([trans_panel.save(), new_vehicle.save()]);
    res.status(200).send({
      message: "Awesome Give me party for Another new Vehicle 🎉",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderVehicleNewRoute = async (req, res) => {
  try {
    const { vid } = req.params;
    const { route_path } = req.body;
    if (!vid && route_path?.length > 0)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    route_path.unshift({ stop: "At Institute", fee: 0 });
    const vehicle = await Vehicle.findById({ _id: vid });
    const route = new Direction({});
    for (var path of route_path) {
      route.direction_route.push({
        route_stop: path.stop,
        // route_fees: path.fee,
        route_structure: path.structure,
      });
      vehicle.route_count += 1;
    }
    route.vehicle = vehicle._id;
    vehicle.vehicle_route = route._id;
    await Promise.all([route.save(), vehicle.save()]);
    res
      .status(200)
      .send({ message: "Your vehicle get some direction 🎉", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderVehicleUpdateRoute = async (req, res) => {
  try {
    const { vid } = req.params;
    const { edit_path, rid, route_stop, route_structure } = req.body;
    const { route_status } = req.query;
    if (!vid && !route_status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const vehicle = await Vehicle.findById({ _id: vid });
    const route = await Direction.findById({ _id: `${vehicle.vehicle_route}` });
    if (route_status === "Renaming_Route" && rid) {
      for (var path of route.direction_route) {
        if (`${path?._id}` === `${rid}`) {
          path.route_stop = route_stop ? route_stop : path.route_stop;
          // path.route_fees = route_fees ? route_fees : path.route_fees;
          path.route_structure = route_structure
            ? route_structure
            : path.route_structure;
        }
      }
      await route.save();
    } else if (route_status === "Add_New_Stop_Point" && edit_path?.length > 0) {
      for (var path of edit_path) {
        if (path?.index > route.direction_route?.length) {
          route.direction_route.push({
            route_stop: path.stop,
            // route_fees: path.fee,
            route_structure: path.structure,
          });
        } else {
          route.direction_route.splice(path.index, 0, {
            route_stop: path.stop,
            // route_fees: path.fee,
            route_structure: path.structure,
          });
        }
        vehicle.route_count += 1;
      }
      await Promise.all([vehicle.save(), route.save()]);
    } else {
    }
    res.status(200).send({
      message: "Your vehicle get some updated direction 🎉",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderVehicleNewPassenger = async (req, res) => {
  try {
    const { vid } = req.params;
    const { sid, rid } = req.body;
    // var remain_fee = parseInt(amount);
    if (!vid && !sid && !rid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const vehicle = await Vehicle.findById({ _id: vid });
    const trans = await Transport.findById({ _id: `${vehicle?.transport}` });
    const route = await Direction.findById({
      _id: `${vehicle?.vehicle_route}`,
    });
    const student = await Student.findById({ _id: sid });
    const trans_batch = new TransportBatch({
      batchId: student.batches,
      student: student._id,
      vehicle: vehicle._id,
      transport: trans._id,
    });
    trans.passenger_count += 1;
    trans.transport_passengers.push(student?._id);
    trans.transport_passengers_with_batch.push(trans_batch?._id);
    vehicle.passenger_count += 1;
    vehicle.passenger_array.push(student?._id);
    vehicle.passenger_array_with_batch.push(trans_batch?._id);
    student.vehicle = vehicle._id;
    trans.pending_student.push(student?._id);
    for (var path of route?.direction_route) {
      if (`${path?._id}` === `${rid}`) {
        path.passenger_list.push(student?._id);
        path.passenger_list_with_batch.push(trans_batch?._id);
        path.passenger_count += 1;
        student.routes.push({
          routeId: path?._id,
          routePath: path?.route_stop,
          routeStructure: path?.route_structure,
        });
        student.transport_fee_structure = path?.route_structure;
        student.active_routes = path?.route_stop;
        // if (remain_fee) {
        //   student.vehicleRemainFeeCount += remain_fee;
        //   vehicle.remaining_fee += remain_fee;
        //   trans.remaining_fee += remain_fee;
        // } else {
        //   student.vehicleRemainFeeCount += path?.route_fees;
        //   vehicle.remaining_fee += path?.route_fees;
        //   trans.remaining_fee += path?.route_fees;
        // }
      }
    }
    await Promise.all([
      trans_batch.save(),
      trans.save(),
      vehicle.save(),
      route.save(),
      student.save(),
    ]);
    res
      .status(200)
      .send({ message: "Awesome You Got a first Passenger 🎆", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderVehicleDestroyPassenger = async (req, res) => {
  try {
    const { vid, sid } = req.params;
    if (!vid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const vehicle = await Vehicle.findById({ _id: vid });
    const trans = await Transport.findById({ _id: `${vehicle?.transport}` });
    const route = await Direction.findById({
      _id: `${vehicle?.vehicle_route}`,
    });
    const student = await Student.findById({ _id: sid });
    if (trans.passenger_count > 0) {
      trans.passenger_count -= 1;
    }
    trans.transport_passengers.pull(student?._id);
    if (vehicle.passenger_count > 0) {
      vehicle.passenger_count -= 1;
    }
    vehicle.passenger_array.pull(student?._id);
    student.vehicle = null;
    for (var path of route?.direction_route) {
      for (var ref of student?.routes) {
        if (`${path?._id}` === `${ref?.routeId}`) {
          path.passenger_list.pull(student?._id);
          if (path.passenger_count > 0) {
            path.passenger_count -= 1;
          }
          student.routes.pull(ref?._id);
          student.active_routes = null;
          // student.vehicleRemainFeeCount -= student.vehicleRemainFeeCount;
          // vehicle.remaining_fee -= student.vehicleRemainFeeCount;
          // trans.remaining_fee -= student.vehicleRemainFeeCount;
        }
      }
    }
    await Promise.all([
      trans.save(),
      vehicle.save(),
      route.save(),
      student.save(),
    ]);
    res
      .status(200)
      .send({ message: "Awesome You Remove your Passenger 🎆", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportAllVehicle = async (req, res) => {
  try {
    const { tid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const trans = await Transport.findById({ _id: tid }).select(
      "transport_vehicles"
    );
    if (search) {
      var all_vehicles = await Vehicle.find({
        $and: [{ _id: { $in: trans?.transport_vehicles } }],
        $or: [
          {
            vehicle_number: { $regex: search, $options: "i" },
          },
          {
            vehicle_type: { $regex: search, $options: "i" },
          },
        ],
      })
        .select(
          "vehicle_number passenger_count vehicle_type vehicle_photo photoId vehicle_name"
        )
        .populate({
          path: "vehicle_conductor",
          select: "staffFirstName staffMiddleName staffLastName",
        })
        .populate({
          path: "vehicle_driver",
          select: "staffFirstName staffMiddleName staffLastName",
        })
        .populate({
          path: "vehicle_no_driver",
          select: "userLegalName userPhoneNumber",
        })
        .populate({
          path: "vehicle_no_conductor",
          select: "userLegalName userPhoneNumber",
        });
    } else {
      var all_vehicles = await Vehicle.find({
        _id: { $in: trans?.transport_vehicles },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "vehicle_number passenger_count vehicle_type vehicle_photo photoId vehicle_name"
        )
        .populate({
          path: "vehicle_conductor",
          select: "staffFirstName staffMiddleName staffLastName",
        })
        .populate({
          path: "vehicle_driver",
          select: "staffFirstName staffMiddleName staffLastName",
        })
        .populate({
          path: "vehicle_no_driver",
          select: "userLegalName userPhoneNumber",
        })
        .populate({
          path: "vehicle_no_conductor",
          select: "userLegalName userPhoneNumber",
        });
    }
    if (all_vehicles?.length > 0) {
      res.status(200).send({
        message: "Lot's of vehicles 😀",
        access: true,
        all_vehicles: all_vehicles,
      });
    } else {
      res.status(200).send({
        message: "No vehicles found 😥",
        access: false,
        all_vehicles: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportAllPassenger = async (req, res) => {
  try {
    const { tid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { filter_by, search } = req.query;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    var trans = await Transport.findById({ _id: tid }).select(
      "transport_passengers"
    );

    if (filter_by) {
      if (search) {
        var all_passengers = await Student.find({
          $and: [{ _id: { $in: trans?.transport_passengers } }],
          $or: [
            {
              studentFirstName: { $regex: search, $options: "i" },
            },
            {
              studentMiddleName: { $regex: search, $options: "i" },
            },
            {
              studentLastName: { $regex: search, $options: "i" },
            },
          ],
        })
          .sort("-vehicleRemainFeeCount")
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          });
      } else {
        var all_passengers = await Student.find({
          _id: { $in: trans?.transport_passengers },
        })
          .sort("-vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          });
      }
    } else {
      if (search) {
        var all_passengers = await Student.find({
          $and: [{ _id: { $in: trans?.transport_passengers } }],
          $or: [
            {
              studentFirstName: { $regex: search, $options: "i" },
            },
            {
              studentMiddleName: { $regex: search, $options: "i" },
            },
            {
              studentLastName: { $regex: search, $options: "i" },
            },
          ],
        })
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          });
      } else {
        var all_passengers = await Student.find({
          _id: { $in: trans?.transport_passengers },
        })
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          });
      }
    }
    if (all_passengers?.length > 0) {
      res.status(200).send({
        message: "Lot's of Passengers / Student 😀",
        access: true,
        all_passengers: all_passengers,
      });
    } else {
      res.status(200).send({
        message: "No Passengers / Student found 😥",
        access: false,
        all_passengers: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportAllVehicleStaffQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const trans = await Transport.findById({ _id: tid }).select(
      "transport_drivers transport_conductors transport_ndconductors"
    );
    const merge_staff = [
      ...trans?.transport_conductors,
      ...trans?.transport_drivers,
    ];
    const all_dcStaff = await Staff.find({
      _id: { $in: merge_staff },
    })
      .limit(limit)
      .skip(skip)
      .select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO staffDOB staffGender staffJoinDate"
      )
      .populate({
        path: "vehicle",
        select: "vehicle_number vehicle_type",
      })
      .populate({
        path: "user",
        select: "userPhoneNumber",
      });

    const all_dcUser = await User.find({
      _id: { $in: trans?.transport_ndconductors },
    })
      .limit(limit)
      .skip(skip)
      .select(
        "userLegalName photoId profilePhoto userDateOfBirth userPhoneNumber userGender"
      )
      .populate({
        path: "vehicle",
        select: "vehicle_number vehicle_type",
      });

    if (all_dcStaff?.length > 0 || all_dcUser?.length > 0) {
      res.status(200).send({
        message: "Lot's of Drivers & Conductors 😀",
        access: true,
        all_dcStaff: [...all_dcStaff, ...all_dcUser],
      });
    } else {
      res.status(200).send({
        message: "No Drivers & Conductors found 😥",
        access: false,
        all_dcStaff: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportOneVehicleQuery = async (req, res) => {
  try {
    const { vid } = req.params;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    const one_vehicle = await Vehicle.findById({
      _id: vid,
    })
      .select(
        "vehicle_number passenger_count vehicle_type vehicle_photo photoId remaining_fee"
      )
      .populate({
        path: "vehicle_conductor",
        select: "staffFirstName staffMiddleName staffLastName",
        populate: {
          path: "user",
          select: "userPhoneNumber",
        },
      })
      .populate({
        path: "vehicle_driver",
        select: "staffFirstName staffMiddleName staffLastName",
        populate: {
          path: "user",
          select: "userPhoneNumber",
        },
      })
      .populate({
        path: "vehicle_no_driver",
        select: "userLegalName userPhoneNumber",
      })
      .populate({
        path: "vehicle_no_conductor",
        select: "userLegalName userPhoneNumber",
      })
      .populate({
        path: "transport",
        select: "institute",
      });

    if (one_vehicle) {
      res.status(200).send({
        message: "One Vehicle with Lot's of Passengers / Student 😀",
        access: true,
        one_vehicle: one_vehicle,
      });
    } else {
      res.status(200).send({
        message: " One Vehicle with No Passengers / Student found 😥",
        access: false,
        one_vehicle: {},
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportOneVehicleQueryAllPassengers = async (req, res) => {
  try {
    const { vid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    var one_vehicle = await Vehicle.findById({
      _id: vid,
    }).select("passenger_array");
    if (search) {
      var all_passengers = await Student.find({
        $and: [{ _id: { $in: one_vehicle?.passenger_array } }],
        $or: [
          {
            studentFirstName: { $regex: search, $options: "i" },
          },
          {
            studentMiddleName: { $regex: search, $options: "i" },
          },
          {
            studentLastName: { $regex: search, $options: "i" },
          },
        ],
      })
        .select(
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle",
        })
        .populate({
          path: "user",
          select: "userPhoneNumber",
        });
    } else {
      var all_passengers = await Student.find({
        _id: { $in: one_vehicle?.passenger_array },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle",
        })
        .populate({
          path: "user",
          select: "userPhoneNumber",
        });
    }

    if (all_passengers?.length > 0) {
      res.status(200).send({
        message: "One Vehicle with Lot's of Passengers / Student 😀",
        access: true,
        all_passengers: all_passengers,
      });
    } else {
      res.status(200).send({
        message: " One Vehicle with No Passengers / Student found 😥",
        access: false,
        all_passengers: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportOneVehicleRoute = async (req, res) => {
  try {
    const { vid } = req.params;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const route = await Direction.findOne({
      vehicle: vid,
    })
      .select("direction_route")
      .populate({
        path: "direction_route",
        populate: {
          path: "route_structure",
        },
      });

    if (route) {
      const refactor_path = {
        boarding_points: route?.direction_route,
        boarding_count: route?.direction_route?.length,
      };
      res.status(200).send({
        message: "Lot's of Boarding Points 😀",
        access: true,
        route: refactor_path,
      });
    } else {
      res.status(200).send({
        message: "No Boarding Points 😡",
        access: false,
        route: {},
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportVehicleStudentRoute = async (req, res) => {
  try {
    const { vid, sid } = req.params;
    if (!vid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const all_routes = [];
    const vehicle = await Vehicle.findById({ _id: vid }).select(
      "vehicle_route"
    );
    const route = await Direction.findById({
      _id: `${vehicle?.vehicle_route}`,
    }).select("direction_route");

    const student = await Student.findById({ _id: sid }).select(
      "routes vehicleRemainFeeCount vehiclePaidFeeCount"
    );

    for (var path of route.direction_route) {
      for (var stu of student.routes) {
        if (`${stu?.routeId}` === `${path?._id}`) {
          all_routes.push(path);
        }
      }
    }
    if (all_routes?.length > 0) {
      res.status(200).send({
        message: "It is Students Boarding Points 🙄",
        access: true,
        all_routes: all_routes,
        student: student,
      });
    } else {
      res.status(200).send({
        message: "No Boarding Points 🙄",
        access: true,
        all_routes: [],
        student: student,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportVehicleStaffManage = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const staff = await Staff.findById({ _id: sid }).select("vehicle");

    const all_vehicle = await Vehicle.findById({ _id: `${staff?.vehicle[0]}` })
      .select(
        "vehicle_number passenger_count vehicle_photo photoId vehicle_type remaining_fee"
      )
      .populate({
        path: "vehicle_conductor",
        select: "staffFirstName staffMiddleName staffLastName",
      })
      .populate({
        path: "vehicle_driver",
        select: "staffFirstName staffMiddleName staffLastName",
      });
    if (all_vehicle) {
      res.status(200).send({
        message: "Awesome you have a vehicle access 🙄",
        access: true,
        all_vehicle: all_vehicle,
      });
    } else {
      res.status(200).send({
        message: "No vehicle access 😡",
        access: false,
        all_vehicle: {},
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportVehicleUserManage = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const user = await User.findById({ _id: uid }).select("vehicle");

    const all_vehicle = await Vehicle.findById({ _id: `${user?.vehicle[0]}` })
      .select(
        "vehicle_number passenger_count vehicle_photo photoId vehicle_type"
      )
      .populate({
        path: "vehicle_no_driver",
        select: "userLegalName",
      })
      .populate({
        path: "vehicle_no_conductor",
        select: "userLegalName",
      });
    if (all_vehicle) {
      res.status(200).send({
        message: "Awesome you have a vehicle access 🙄",
        access: true,
        all_vehicle: all_vehicle,
      });
    } else {
      res.status(200).send({
        message: "No vehicle access 😡",
        access: false,
        all_vehicle: {},
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// exports.renderTransportStudentCollect = async (req, res) => {
//   try {
//     const { tid, sid } = req.params;
//     const { amount, mode, is_install } = req.body;
//     if (!tid && !amount && !mode && !is_install)
//       return res.status(200).send({
//         message: "Their is a bug need to fix immediately 😡",
//         access: false,
//       });
//     const price = parseInt(amount);
//     const trans = await Transport.findById({ _id: tid });
//     const one_student = await Student.findById({ _id: sid });
//     const one_vehicle = await Vehicle.findById({
//       _id: `${one_student?.vehicle}`,
//     });
//     const institute = await InstituteAdmin.findById({
//       _id: `${trans?.institute}`,
//     });
//     const finance = await Finance.findById({
//       _id: `${institute?.financeDepart[0]}`,
//     });
//     if (price > one_student?.vehicleRemainFeeCount) {
//       res.status(200).send({
//         message: "No Balance Pool for further Operation 😡",
//         access: false,
//       });
//     } else if (price <= one_student?.vehicleRemainFeeCount) {
//       var exempt = one_student?.vehicleRemainFeeCount - price;
//       if (!is_install) {
//         trans.exempt_fee += one_student?.vehicleRemainFeeCount - price;
//         finance.financeExemptBalance +=
//           one_student?.vehicleRemainFeeCount - price;
//       }
//       trans.collected_fee += price;
//       if (one_vehicle?.remaining_fee >= price) {
//         one_vehicle.remaining_fee -= price;
//       }
//       if (one_student?.vehicleRemainFeeCount >= price) {
//         one_student.vehicleRemainFeeCount -= price + exempt;
//       }
//       one_student.vehiclePaidFeeCount += price;
//       if (mode === "Online") {
//         trans.online_fee += price;
//       } else if (mode === "Offline") {
//         trans.offline_fee += price;
//       } else {
//       }
//       if (trans.remaining_fee > price) {
//         trans.remaining_fee -= price;
//       }
//       trans.fund_history.push({
//         student: one_student?._id,
//         is_install: is_install ? true : false,
//         amount: price,
//         mode: mode,
//       });
//       await Promise.all([
//         finance.save(),
//         trans.save(),
//         one_student.save(),
//         one_vehicle.save(),
//       ]);
//       res.status(200).send({
//         message: "Installment Operation Completed 😀",
//         access: true,
//       });
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

// trans.exempt_fee += one_student?.vehicleRemainFeeCount - price;
//         finance.financeExemptBalance +=
//           one_student?.vehicleRemainFeeCount - price;

exports.renderTransportStudentCollect = async (req, res) => {
  try {
    const { sid, tid } = req.params;
    const { receipt_status, id } = req.query;
    const { amount, mode } = req.body;
    if (!sid && !tid && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    const trans = await Transport.findById({ _id: tid });
    const student = await Student.findById({ _id: sid }).populate({
      path: "transport_fee_structure",
    });
    const user = await User.findById({ _id: `${student.user}` });
    const one_vehicle = await Vehicle.findById({
      _id: `${student?.vehicle}`,
    });
    var institute = await InstituteAdmin.findById({
      _id: id,
    });
    var finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const order = new OrderPayment({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.vehicle = one_vehicle?._id;
    new_receipt.receipt_generated_from = "BY_TRANSPORT";
    new_receipt.finance = finance?._id;
    new_receipt.receipt_status = receipt_status
      ? receipt_status
      : "Already Generated";
    order.payment_module_type = "Transport Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = one_vehicle._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_transport = one_vehicle._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.fee_receipt = new_receipt?._id;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    var total_amount = await add_total_installment(student);
    var is_install;
    if (
      price <= student?.transport_fee_structure?.total_admission_fees &&
      price <= student?.transport_fee_structure?.one_installments?.fees
    ) {
      is_install = true;
    } else {
      is_install = false;
    }
    if (price > 0 && is_install) {
      trans.remainingFee.push(student._id);
      student.vehicleRemainFeeCount += total_amount - price;
      one_vehicle.remaining_fee += total_amount - price;
      trans.remaining_fee += total_amount - price;
      var new_remainFee = new RemainingList({
        vehicleId: one_vehicle._id,
        applicable_fee: total_amount,
        institute: institute?._id,
        remaining_flow: "Transport Application",
      });
      new_remainFee.access_mode_card = "Installment_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        vehicleId: one_vehicle._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "First Installment";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.transport_fee_structure?._id;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      if (new_remainFee.remaining_fee > 0) {
        await add_all_installment(
          one_vehicle,
          institute._id,
          new_remainFee,
          price,
          student
        );
      }
      if (
        new_remainFee.remaining_fee > 0 &&
        `${student?.transport_fee_structure?.total_installments}` === "1"
      ) {
        new_remainFee.remaining_array.push({
          remainAmount: new_remainFee?.remaining_fee,
          vehicleId: one_vehicle._id,
          instituteId: institute._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      }
    } else if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        vehicleId: one_vehicle._id,
        applicable_fee: student?.fee_structure?.total_admission_fees,
        institute: institute?._id,
        remaining_flow: "Transport Application",
      });
      new_remainFee.access_mode_card = "One_Time_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        vehicleId: one_vehicle._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "One Time Fees";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.transport_fee_structure?._id;
      new_remainFee.remaining_fee +=
        student?.transport_fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      trans.remainingFee.push(student._id);
      student.vehicleRemainFeeCount +=
        student?.transport_fee_structure?.total_admission_fees - price;
      one_vehicle.remaining_fee +=
        student?.transport_fee_structure?.total_admission_fees - price;
      trans.remaining_fee +=
        student?.transport_fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.transport_fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        trans.remainingFee.pull(student._id);
      } else {
        new_remainFee.remaining_array.push({
          remainAmount:
            student?.transport_fee_structure?.total_admission_fees - price,
          vehicleId: one_vehicle._id,
          status: "Not Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
      }
    }
    if (mode === "Offline") {
      trans.offline_fee += price;
      one_vehicle.collectedFeeCount += price;
      one_vehicle.offlineFee += price;
      trans.collected_fee += price;
      finance.financeTransportBalance += price;
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
    } else if (mode === "Online") {
      trans.online_fee += price;
      one_vehicle.collectedFeeCount += price;
      one_vehicle.onlineFee += price;
      finance.financeTransportBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    } else {
    }
    if (req.body?.fee_payment_mode === "Government/Scholarship") {
      // New Logic
    } else {
      console.log("Enter");
      await set_fee_head_query(student, price, one_vehicle, new_receipt);
      console.log("Exit");
    }
    if (new_remainFee?.remaining_fee > 0) {
    } else {
      new_remainFee.status = "Paid";
    }
    await lookup_applicable_grant(
      req.body?.fee_payment_mode,
      price,
      new_remainFee,
      new_receipt
    );
    student.vehiclePaidFeeCount += price;
    trans.fund_history.push({
      student: student?._id,
      is_install: is_install ? true : false,
      amount: price,
      mode: mode,
    });
    if (trans?.pending_student?.includes(`${student?._id}`)) {
      trans.pending_student.pull(student?._id);
    }
    // notify.notifyContent = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
    // notify.notifySender = admission?.admissionAdminHead?.user;
    // notify.notifyReceiever = user?._id;
    // notify.notifyType = "Student";
    // notify.notifyPublisher = student?._id;
    // notify.fee_receipt = new_receipt?._id;
    // user.activity_tab.push(notify?._id);
    // notify.notifyByAdmissionPhoto = admission?._id;
    // notify.notifyCategory = "Status Alert";
    // notify.redirectIndex = 29;
    // if (
    //   `${new_receipt?.fee_payment_mode}` === "Demand Draft" ||
    //   `${new_receipt?.fee_payment_mode}` === "Cheque"
    // ) {
    //   status.receipt_status = "Requested";
    //   status.receipt = new_receipt?._id;
    //   if (admission?.request_array?.includes(`${new_receipt?._id}`)) {
    //   } else {
    //     admission.request_array.push(new_receipt?._id);
    //     admission.fee_receipt_request.push({
    //       receipt: new_receipt?._id,
    //       demand_cheque_status: "Requested",
    //     });
    //   }
    // }
    await Promise.all([
      trans.save(),
      one_vehicle.save(),
      student.save(),
      finance.save(),
      user.save(),
      order.save(),
      institute.save(),
      // s_admin.save(),
      new_remainFee.save(),
      new_receipt.save(),
      // status.save(),
      // notify.save(),
    ]);
    res.status(200).send({
      message: "Look like a party mood",
      confirm_status: true,
    });
    // invokeMemberTabNotification(
    //   "Admission Status",
    //   status.content,
    //   "Application Status",
    //   user._id,
    //   user.deviceToken
    // );
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportStudentExempt = async (req, res) => {
  try {
    const { sid, tid } = req.params;
    const { amount, mode, id } = req.body;
    if (!sid && !tid && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    const trans = await Transport.findById({ _id: tid });
    const student = await Student.findById({ _id: sid }).populate({
      path: "transport_fee_structure",
    });
    const user = await User.findById({ _id: `${student.user}` });
    const one_vehicle = await Vehicle.findById({
      _id: `${student?.vehicle}`,
    });
    var institute = await InstituteAdmin.findById({
      _id: id,
    });
    var finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const remaining_fee_lists = await RemainingList.findOne({
      $and: [{ student: student?._id }, { vehicleId: one_vehicle?._id }],
    });
    const order = new OrderPayment({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date();
    new_receipt.vehicle = one_vehicle?._id;
    new_receipt.receipt_generated_from = "BY_TRANSPORT";
    new_receipt.finance = finance?._id;
    order.payment_module_type = "Transport Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = one_vehicle._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_transport = one_vehicle._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.fee_receipt = new_receipt?._id;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    if (req?.body?.fee_payment_mode === "Exempted/Unrecovered") {
      await exempt_installment(
        req?.body?.fee_payment_mode,
        remaining_fee_lists,
        student,
        trans,
        one_vehicle,
        finance,
        price,
        new_receipt
      );
    }
    await Promise.all([
      user.save(),
      student.save(),
      new_receipt.save(),
      trans.save(),
      one_vehicle.save(),
      finance.save(),
      institute.save(),
      remaining_fee_lists.save(),
      order.save(),
    ]);
    res
      .status(200)
      .send({ message: "Explore Exempted Transport Fees", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportFundsQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    const { amount, id } = req.body;
    if (!tid && !amount)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const price = parseInt(amount);
    const trans = await Transport.findById({ _id: tid });
    const one_ins = await InstituteAdmin.findById({
      _id: id,
    });
    const finance = await Finance.findById({
      _id: `${one_ins?.financeDepart[0]}`,
    });
    if (
      finance?.requestArray?.length > 0 &&
      finance?.requestArray?.includes(`${trans?._id}`)
    ) {
      res.status(200).send({
        message: "Already requested for processing 🔍",
        access: false,
      });
    } else {
      finance.requestArray.push(trans?._id);
      finance.transport_request.push({
        transport_module: trans?._id,
        amount: price,
        status: "Requested",
      });
      trans.requested_status = "Requested";
      await Promise.all([finance.save(), trans.save()]);
      res.status(200).send({
        message: "Installment Operation Completed 😀",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.destroyOneVehicleRouteQuery = async (req, res) => {
  try {
    const { vid, rid } = req.params;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    const vehicle = await Vehicle.findById({ _id: vid });
    const route = await Direction.findById({ _id: `${vehicle.vehicle_route}` });
    for (var path of route?.direction_route) {
      if (`${path?._id}` === `${rid}`) {
        if (path?.passenger_list?.length >= 1) {
        } else {
          route.direction_route.pull(rid);
          if (vehicle?.route_count > 0) {
            vehicle.route_count -= 1;
          }
          break;
        }
      }
    }
    await Promise.all([vehicle.save(), route.save()]);
    res.status(200).send({
      message: "Route / Path Deletion Operation Completed ",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

const getALLBatchPassengerWithoutSearch = async (
  passenger_list,
  currentBatches,
  pastBatches,
  page,
  limit,
  filter_by
) => {
  try {
    const trans_batch_all_current = await TransportBatch.find({
      $and: [
        {
          batchId: {
            $in: currentBatches,
          },
        },
        {
          _id: {
            $in: passenger_list,
          },
        },
      ],
    })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount",
        populate: {
          path: "user",
          select: "userPhoneNumber",
        },
      })
      // .limit(limit)
      // .skip(skip)
      .select("student");
    const trans_batch_all_past = await TransportBatch.find({
      $and: [
        {
          batchId: {
            $in: pastBatches,
          },
        },
        {
          _id: {
            $in: passenger_list,
          },
        },
      ],
    })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender previous_transport_history.vehicleRemainFeeCount",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender previous_transport_history.vehicleRemainFeeCount",
        populate: {
          path: "user",
          select: "userPhoneNumber",
        },
      })
      // .limit(limit)
      // .skip(skip)
      .select("student");
    var all_passengers = [];
    for (let stud of trans_batch_all_current) {
      if (stud.student) all_passengers.push(stud.student);
    }
    for (let stud of trans_batch_all_past) {
      if (stud.student) all_passengers.push(stud.student);
    }
    if (filter_by === "true") {
      all_passengers.sort(function (st1, st2) {
        return (
          parseInt(st2.previous_transport_history?.[0].vehicleRemainFeeCount) -
          parseInt(st1.previous_transport_history?.[0].vehicleRemainFeeCount)
        );
      });
      all_passengers.sort(function (st1, st2) {
        return (
          parseInt(st2.vehicleRemainFeeCount) -
          parseInt(st1.vehicleRemainFeeCount)
        );
      });
    }
    all_passengers = await nested_document_limit(page, limit, all_passengers);
    return all_passengers;
  } catch (e) {
    console.log(e);
  }
};

const getALLBatchPassengerWithSearch = async (
  passenger_list,
  currentBatches,
  pastBatches,
  page,
  limit,
  search,
  filter_by
) => {
  try {
    const trans_batch_all_current = await TransportBatch.find({
      $and: [
        {
          batchId: {
            $in: currentBatches,
          },
        },
        {
          _id: {
            $in: passenger_list,
          },
        },
      ],
    })
      .populate({
        path: "student",
        match: {
          $or: [
            {
              studentFirstName: { $regex: search, $options: "i" },
            },
            {
              studentMiddleName: { $regex: search, $options: "i" },
            },
            {
              studentLastName: { $regex: search, $options: "i" },
            },
          ],
        },
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        match: {
          $or: [
            {
              studentFirstName: { $regex: search, $options: "i" },
            },
            {
              studentMiddleName: { $regex: search, $options: "i" },
            },
            {
              studentLastName: { $regex: search, $options: "i" },
            },
          ],
        },
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount",
        populate: {
          path: "user",
          select: "userPhoneNumber",
        },
      })
      // .limit(limit)
      // .skip(skip)
      .select("student");

    const trans_batch_all_past = await TransportBatch.find({
      $and: [
        {
          batchId: {
            $in: pastBatches,
          },
        },
        {
          _id: {
            $in: passenger_list,
          },
        },
      ],
    })
      .populate({
        path: "student",
        match: {
          $or: [
            {
              studentFirstName: { $regex: search, $options: "i" },
            },
            {
              studentMiddleName: { $regex: search, $options: "i" },
            },
            {
              studentLastName: { $regex: search, $options: "i" },
            },
          ],
        },
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender previous_transport_history.vehicleRemainFeeCount",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        match: {
          $or: [
            {
              studentFirstName: { $regex: search, $options: "i" },
            },
            {
              studentMiddleName: { $regex: search, $options: "i" },
            },
            {
              studentLastName: { $regex: search, $options: "i" },
            },
          ],
        },
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender previous_transport_history.vehicleRemainFeeCount",
        populate: {
          path: "user",
          select: "userPhoneNumber",
        },
      })
      // .limit(limit)
      // .skip(skip)
      .select("student");
    var all_passengers = [];

    for (let stud of trans_batch_all_current) {
      if (stud.student) all_passengers.push(stud.student);
    }
    for (let stud of trans_batch_all_past) {
      if (stud.student) all_passengers.push(stud.student);
    }
    if (filter_by === "true") {
      all_passengers.sort(function (st1, st2) {
        return (
          parseInt(
            st2?.previous_transport_history?.[0].vehicleRemainFeeCount ?? ""
          ) -
          parseInt(
            st1?.previous_transport_history?.[0].vehicleRemainFeeCount ?? ""
          )
        );
      });
      all_passengers.sort(function (st1, st2) {
        return (
          parseInt(st2?.vehicleRemainFeeCount) -
          parseInt(st1?.vehicleRemainFeeCount)
        );
      });
    }
    all_passengers = await nested_document_limit(page, limit, all_passengers);
    return all_passengers;
  } catch (e) {
    console.log(e);
  }
};

const getPastBatchPassengerWithoutSearch = async (
  passenger_list,
  batches,
  page,
  limit,
  filter_by
) => {
  try {
    const trans_batch = await TransportBatch.find({
      $and: [
        {
          batchId: {
            $in: batches,
          },
        },
        {
          _id: {
            $in: passenger_list,
          },
        },
      ],
    })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender previous_transport_history.vehicleRemainFeeCount",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender previous_transport_history.vehicleRemainFeeCount",
        populate: {
          path: "user",
          select: "userPhoneNumber",
        },
      })
      .select("student");
    var all_passengers = [];
    for (let stud of trans_batch) {
      if (stud.student) all_passengers.push(stud.student);
    }
    // console.log("all_passengers", all_passengers);
    if (filter_by === "true") {
      all_passengers.sort(function (st1, st2) {
        return (
          parseInt(st2?.previous_transport_history?.[0].vehicleRemainFeeCount) -
          parseInt(st1?.previous_transport_history?.[0].vehicleRemainFeeCount)
        );
      });
    }
    // console.log("all_passengers after", all_passengers);

    all_passengers = await nested_document_limit(page, limit, all_passengers);

    return all_passengers;
  } catch (e) {
    console.log(e);
  }
};

const getPastBatchPassengerWithSearch = async (
  passenger_list,
  batches,
  page,
  limit,
  search,
  filter_by
) => {
  try {
    const trans_batch = await TransportBatch.find({
      $and: [
        {
          batchId: {
            $in: batches,
          },
        },
        {
          _id: {
            $in: passenger_list,
          },
        },
      ],
    })
      .populate({
        path: "student",
        match: {
          $or: [
            {
              studentFirstName: { $regex: search, $options: "i" },
            },
            {
              studentMiddleName: { $regex: search, $options: "i" },
            },
            {
              studentLastName: { $regex: search, $options: "i" },
            },
          ],
        },
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender previous_transport_history.vehicleRemainFeeCount",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        match: {
          $or: [
            {
              studentFirstName: { $regex: search, $options: "i" },
            },
            {
              studentMiddleName: { $regex: search, $options: "i" },
            },
            {
              studentLastName: { $regex: search, $options: "i" },
            },
          ],
        },
        select:
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender previous_transport_history.vehicleRemainFeeCount",
        populate: {
          path: "user",
          select: "userPhoneNumber",
        },
      })
      .select("student");
    var all_passengers = [];
    for (let stud of trans_batch) {
      if (stud.student) all_passengers.push(stud.student);
    }
    if (filter_by === "true") {
      all_passengers.sort(function (st1, st2) {
        return (
          parseInt(st2?.previous_transport_history?.[0].vehicleRemainFeeCount) -
          parseInt(st1?.previous_transport_history?.[0].vehicleRemainFeeCount)
        );
      });
    }
    all_passengers = await nested_document_limit(page, limit, all_passengers);

    return all_passengers;
  } catch (e) {
    console.log(e);
  }
};

const getCurrentBatchPassengerWithoutSearch = async (
  transport_passengers,
  batches,
  skip,
  limit,
  filter_by
) => {
  try {
    if (filter_by === "true") {
      const all_passengers = await Student.find({
        $and: [
          { _id: { $in: transport_passengers } },
          { batches: { $in: batches } },
        ],
      })
        .sort("-vehicleRemainFeeCount")
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle",
        })
        .populate({
          path: "user",
          select: "userPhoneNumber",
        })
        .exec();

      return all_passengers;
    } else {
      const all_passengers = await Student.find({
        $and: [
          { _id: { $in: transport_passengers } },
          { batches: { $in: batches } },
        ],
      })
        .sort("vehicleRemainFeeCount")
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle",
        })
        .populate({
          path: "user",
          select: "userPhoneNumber",
        })
        .exec();

      return all_passengers;
    }
  } catch (e) {
    console.log(e);
  }
};

const getCurrentBatchPassengerWithSearch = async (
  transport_passengers,
  batches,
  skip,
  limit,
  search,
  filter_by
) => {
  try {
    if (filter_by === "true") {
      const all_passengers = await Student.find({
        $and: [
          { _id: { $in: transport_passengers } },
          { batches: { $in: batches } },
          {
            $or: [
              {
                studentFirstName: { $regex: search, $options: "i" },
              },
              {
                studentMiddleName: { $regex: search, $options: "i" },
              },
              {
                studentLastName: { $regex: search, $options: "i" },
              },
            ],
          },
        ],
      })
        .sort("-vehicleRemainFeeCount")
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle",
        })
        .populate({
          path: "user",
          select: "userPhoneNumber",
        })
        .exec();

      return all_passengers;
    } else {
      const all_passengers = await Student.find({
        $and: [
          { _id: { $in: transport_passengers } },
          { batches: { $in: batches } },
          {
            $or: [
              {
                studentFirstName: { $regex: search, $options: "i" },
              },
              {
                studentMiddleName: { $regex: search, $options: "i" },
              },
              {
                studentLastName: { $regex: search, $options: "i" },
              },
            ],
          },
        ],
      })
        .sort("vehicleRemainFeeCount")
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle",
        })
        .populate({
          path: "user",
          select: "userPhoneNumber",
        })
        .exec();

      return all_passengers;
    }
  } catch (e) {
    console.log(e);
  }
};
exports.renderTransportAllPassengerWithBatch = async (req, res) => {
  try {
    const { tid } = req.params;
    const { id } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { filter_by, search, batch_filter } = req.query;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    var trans = await Transport.findById({ _id: tid }).select(
      "transport_passengers institute transport_passengers_with_batch"
    );

    if (id) {
      if (filter_by === "true") {
        var all_passengers = await Student.find({
          $and: [
            { _id: { $in: trans?.transport_passengers } },
            { institute: id },
          ],
        })
          .sort("-vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          })
          .populate({
            path: "transport_fee_structure",
          })
          .exec();
      } else {
        var all_passengers = await Student.find({
          $and: [
            { _id: { $in: trans?.transport_passengers } },
            { institute: id },
          ],
        })
          .sort("vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          })
          .populate({
            path: "transport_fee_structure",
          })
          .exec();
      }
    } else {
      if (filter_by === "true") {
        var all_passengers = await Student.find({
          $and: [{ _id: { $in: trans?.transport_passengers } }],
        })
          .sort("-vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          })
          .populate({
            path: "transport_fee_structure",
          })
          .populate({
            path: "institute",
            select: "insName name",
          })
          .exec();
      } else {
        var all_passengers = await Student.find({
          $and: [{ _id: { $in: trans?.transport_passengers } }],
        })
          .sort("vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          })
          .populate({
            path: "transport_fee_structure",
          })
          .populate({
            path: "institute",
            select: "insName name",
          })
          .exec();
      }
    }

    if (all_passengers?.length > 0) {
      res.status(200).send({
        message: "Lot's of Passengers / Student 😀",
        access: true,
        all_passengers: all_passengers,
      });
    } else {
      res.status(200).send({
        message: "No Passengers / Student found 😥",
        access: false,
        all_passengers: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderVehicleAllPassengerWithBatch = async (req, res) => {
  try {
    const { vid } = req.params;
    const { id } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { filter_by, search, batch_filter } = req.query;
    if (!vid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    var one_vehicle = await Vehicle.findById({
      _id: vid,
    })
      .populate({
        path: "transport",
        select: "institute",
      })
      .select("passenger_array transport passenger_array_with_batch");
    // fetch all current data

    if (id) {
      if (filter_by === "true") {
        var all_passengers = await Student.find({
          $and: [
            { _id: { $in: one_vehicle?.passenger_array } },
            { institute: id },
          ],
        })
          .sort("-vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          })
          .populate({
            path: "transport_fee_structure",
          })
          .exec();
      } else {
        var all_passengers = await Student.find({
          $and: [
            { _id: { $in: one_vehicle?.passenger_array } },
            { institute: id },
          ],
        })
          .sort("vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          })
          .populate({
            path: "transport_fee_structure",
          })
          .exec();
      }
    } else {
      if (filter_by === "true") {
        var all_passengers = await Student.find({
          $and: [{ _id: { $in: one_vehicle?.passenger_array } }],
        })
          .sort("-vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          })
          .populate({
            path: "transport_fee_structure",
          })
          .populate({
            path: "institute",
            select: "insName name",
          })
          .exec();
      } else {
        var all_passengers = await Student.find({
          $and: [{ _id: { $in: one_vehicle?.passenger_array } }],
        })
          .sort("vehicleRemainFeeCount")
          .limit(limit)
          .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName active_routes photoId studentProfilePhoto studentGRNO studentDOB studentGender vehicleRemainFeeCount"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle",
          })
          .populate({
            path: "user",
            select: "userPhoneNumber",
          })
          .populate({
            path: "transport_fee_structure",
          })
          .populate({
            path: "institute",
            select: "insName name",
          })
          .exec();
      }
    }

    if (all_passengers?.length > 0) {
      res.status(200).send({
        message: "Lot's of Passengers / Student 😀",
        access: true,
        all_passengers: all_passengers,
      });
    } else {
      res.status(200).send({
        message: "No Passengers / Student found 😥",
        access: false,
        all_passengers: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewBatchQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    const { id } = req.query;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const trans = await Transport.findById({ _id: tid });
    const institute = await InstituteAdmin.findById({
      _id: id,
    });
    const batch = new Batch({ ...req.body });
    trans.batches.push(batch?._id);
    trans.batchCount += 1;
    batch.transport = trans?._id;
    institute.batches.push(batch._id);
    batch.institute = institute?._id;
    await Promise.all([trans.save(), batch.save(), institute.save()]);
    res.status(200).send({
      message: "Explore New Batch Query",
      batch: batch._id,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllBatchQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const trans = await Transport.findById({ _id: tid }).select(
      "departmentSelectBatch batches"
    );

    var all_batches = await Batch.find({ _id: { $in: trans?.batches } })
      .limit(limit)
      .skip(skip)
      .select("batchName batchStatus createdAt");

    if (all_batches?.length > 0) {
      res.status(200).send({
        message: "Explore All Batches Query",
        access: true,
        all_batches: all_batches,
        select_batch: trans?.departmentSelectBatch,
      });
    } else {
      res.status(200).send({
        message: "No All Batches Query",
        all_batches: [],
        access: false,
        select_batch: null || "",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderCurrentSelectBatchQuery = async (req, res) => {
  try {
    const { tid, bid } = req.params;
    if (!tid && !bid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const valid_trans = await Transport.findById({ _id: tid });
    var valid_active_batch = await handle_undefined(
      valid_trans?.departmentSelectBatch
    );
    if (valid_active_batch) {
      var prev_batches = await Batch.findById({
        _id: valid_trans.departmentSelectBatch,
      });
      prev_batches.activeBatch = "Not Active";
      await prev_batches.save();
    }
    const batches = await Batch.findById({ _id: bid });
    valid_trans.departmentSelectBatch = batches._id;
    valid_trans.userBatch = batches._id;
    batches.activeBatch = "Active";
    await Promise.all([valid_trans.save(), batches.save()]);
    res.status(200).send({
      message: "Explore Selected Batch Detail Query",
      batches: batches._id,
      valid_trans: valid_trans?.departmentSelectBatch,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewMasterQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const trans = await Transport.findById({ _id: tid });
    const master = new ClassMaster({ ...req.body });
    trans.masters.push(master?._id);
    trans.masterCount += 1;
    master.transport = trans?._id;
    await Promise.all([trans.save(), master.save()]);
    res.status(200).send({
      message: "Explore New Master Query",
      master: master._id,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllMasterQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const trans = await Transport.findById({ _id: tid }).select("masters");

    var all_masters = await ClassMaster.find({
      _id: { $in: trans?.masters },
    }).select("className");

    if (all_masters?.length > 0) {
      res.status(200).send({
        message: "Explore All Masters Query",
        access: true,
        all_masters: all_masters,
      });
    } else {
      res.status(200).send({
        message: "No All Masters Query",
        all_masters: [],
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportAllFeeStructure = async (req, res) => {
  try {
    const { tid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { filter_by, master_by, vehicle_by } = req.query;
    const master_query = await handle_undefined(filter_by);
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const trans = await Transport.findById({ _id: tid }).select(
      "fees_structures"
    );
    if (master_query) {
      var all_structures = await FeeStructure.find({
        $and: [
          { _id: { $in: trans?.fees_structures } },
          { batch_master: master_query },
          { document_update: false },
        ],
        $or: [
          {
            class_master: `${master_by}`,
          },
          {
            vehicle_master: `${vehicle_by}`,
          },
        ],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "total_admission_fees structure_name unique_structure_name applicable_fees"
        )
        .populate({
          path: "category_master",
          select: "category_name",
        })
        .populate({
          path: "class_master",
          select: "className",
        });
    } else {
      var all_structures = await FeeStructure.find({
        $and: [
          { _id: { $in: trans?.fees_structures } },
          { document_update: false },
        ],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "total_admission_fees structure_name unique_structure_name applicable_fees"
        )
        .populate({
          path: "category_master",
          select: "category_name",
        })
        .populate({
          path: "class_master",
          select: "className",
        });
    }
    if (all_structures?.length > 0) {
      res.status(200).send({
        message: "Lot's of Fees Structures Available 👍",
        access: true,
        all_structures: all_structures,
      });
    } else {
      res.status(200).send({
        message: "No Fees Structures Available 👍",
        access: true,
        all_structures: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.paidRemainingFeeStudent = async (req, res) => {
  try {
    const { tid, sid } = req.params;
    const { amount, mode, type } = req.body;
    const { receipt_status, id } = req.query;
    if (!sid && !tid && !amount && !mode && !type)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    var extra_price = 0;
    const admin_ins = await Transport.findById({ _id: tid });
    const student = await Student.findById({ _id: sid }).populate({
      path: "transport_fee_structure",
    });
    const one_vehicle = await Vehicle.findById({
      _id: `${student?.vehicle}`,
    });
    var institute = await InstituteAdmin.findById({
      _id: id,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    const order = new OrderPayment({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.vehicle = one_vehicle?._id;
    new_receipt.receipt_generated_from = "BY_TRANSPORT";
    new_receipt.finance = finance?._id;
    new_receipt.receipt_status = receipt_status
      ? receipt_status
      : "Already Generated";
    order.payment_module_type = "Transport Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = one_vehicle._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_transport = one_vehicle._id;
    order.payment_from = student._id;
    order.fee_receipt = new_receipt?._id;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findById({
      _id: rid,
    });
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    if (req?.body?.fee_payment_mode === "Exempted/Unrecovered") {
      await exempt_installment(
        req?.body?.fee_payment_mode,
        remaining_fee_lists,
        student,
        admin_ins,
        one_vehicle,
        finance,
        price,
        new_receipt
      );
    } else {
      remaining_fee_lists.paid_fee += price;
      if (remaining_fee_lists.remaining_fee >= price) {
        remaining_fee_lists.remaining_fee -= price;
      }
      await render_installment(
        type,
        student,
        mode,
        price,
        admin_ins,
        student?.transport_fee_structure,
        remaining_fee_lists,
        new_receipt,
        one_vehicle,
        institute
      );
    }
    if (admin_ins?.remaining_fee >= price) {
      admin_ins.remaining_fee -= price;
    }
    if (one_vehicle?.remaining_fee >= price) {
      one_vehicle.remaining_fee -= price;
    }
    if (student?.vehicleRemainFeeCount >= price) {
      student.vehicleRemainFeeCount -= price;
    }
    student.vehiclePaidFeeCount += price;
    if (mode === "Online") {
      admin_ins.online_fee += price + extra_price;
      one_vehicle.onlineFee += price + extra_price;
      one_vehicle.collectedFeeCount += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeTransportBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
    } else if (mode === "Offline") {
      admin_ins.offline_fee += price + extra_price;
      one_vehicle.offlineFee += price + extra_price;
      one_vehicle.collectedFeeCount += price + extra_price;
      admin_ins.collected_fee += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeTransportBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
    } else {
    }
    // await set_fee_head_query(student, price, apply);
    if (req?.body?.fee_payment_mode === "Government/Scholarship") {
    } else {
      await update_fee_head_query(student, price, one_vehicle, new_receipt);
    }
    await lookup_applicable_grant(
      req?.body?.fee_payment_mode,
      price,
      remaining_fee_lists,
      new_receipt
    );
    if (type === "One Time Fees Remain") {
      await remain_one_time_query(
        admin_ins,
        remaining_fee_lists,
        one_vehicle,
        institute,
        student,
        price,
        new_receipt
      );
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      one_vehicle.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
    });
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          admin_ins.refundCount += is_refund;
        }
      } else {
        admin_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        admin_ins.refundCount += is_refund;
      }
    }
    await admin_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      one_vehicle?.vehicle_number
    } ${price}`;
    notify.notifySender = admin_ins?._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByTransportPhoto = admin_ins._id;
    notify.notifyCategory = "Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveTransportRemainingArray = async (req, res) => {
  try {
    const { tid } = req.params;
    const { id } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const admin_ins = await Transport.findById({ _id: tid }).select(
      "remainingFee"
    );
    if (id) {
      if (search) {
        var student = await Student.find({
          $and: [{ _id: { $in: admin_ins?.remainingFee } }, { institute: id }],
          $or: [
            { studentFirstName: { $regex: search, $options: "i" } },
            { studentMiddleName: { $regex: search, $options: "i" } },
            { studentLastName: { $regex: search, $options: "i" } },
            { studentGRNO: { $regex: search, $options: "i" } },
            { studentCast: { $regex: search, $options: "i" } },
            { studentCastCategory: { $regex: search, $options: "i" } },
            { studentGender: { $regex: search, $options: "i" } },
          ],
        })
          .sort("-vehicleRemainFeeCount")
          .select(
            "studentFirstName studentMiddleName batches studentGender studentCast studentCastCategory studentLastName photoId studentGRNO studentProfilePhoto vehicleRemainFeeCount"
          )
          .populate({
            path: "department",
            select: "dName",
          })
          .populate({
            path: "vehicle",
            select: "vehicle_number",
          })
          .populate({
            path: "institute",
            select: "insName name",
          });
        var remain_fee = student?.filter((ref) => {
          if (ref?.vehicleRemainFeeCount > 0) return ref;
        });
        res.status(200).send({
          message: "Its a party time from DB 🙌",
          remain: remain_fee,
          remainCount: remain_fee?.length,
        });
        // }
      } else {
        var student = await Student.find({
          $and: [{ _id: { $in: admin_ins?.remainingFee } }, { institute: id }],
        })
          .sort("-vehicleRemainFeeCount")
          .select(
            "studentFirstName studentMiddleName studentLastName batches photoId studentGRNO studentProfilePhoto vehicleRemainFeeCount"
          )
          .populate({
            path: "department",
            select: "dName",
          })
          .populate({
            path: "vehicle",
            select: "vehicle_number",
          })
          .populate({
            path: "institute",
            select: "insName name",
          });
        student = student?.filter((ref) => {
          if (ref?.vehicleRemainFeeCount > 0) return ref;
        });
        var remain_fee = await nested_document_limit(page, limit, student);
        res.status(200).send({
          message: "Its a party time from DB 🙌",
          remain: remain_fee,
          remainCount: remain_fee?.length,
        });
      }
    } else {
      if (search) {
        var student = await Student.find({
          $and: [{ _id: { $in: admin_ins?.remainingFee } }],
          $or: [
            { studentFirstName: { $regex: search, $options: "i" } },
            { studentMiddleName: { $regex: search, $options: "i" } },
            { studentLastName: { $regex: search, $options: "i" } },
            { studentGRNO: { $regex: search, $options: "i" } },
            { studentCast: { $regex: search, $options: "i" } },
            { studentCastCategory: { $regex: search, $options: "i" } },
            { studentGender: { $regex: search, $options: "i" } },
          ],
        })
          .sort("-vehicleRemainFeeCount")
          .select(
            "studentFirstName studentMiddleName batches studentGender studentCast studentCastCategory studentLastName photoId studentGRNO studentProfilePhoto vehicleRemainFeeCount"
          )
          .populate({
            path: "department",
            select: "dName",
          })
          .populate({
            path: "vehicle",
            select: "vehicle_number",
          })
          .populate({
            path: "institute",
            select: "insName name",
          });
        var remain_fee = student?.filter((ref) => {
          if (ref?.vehicleRemainFeeCount > 0) return ref;
        });
        res.status(200).send({
          message: "Its a party time from DB 🙌",
          remain: remain_fee,
          remainCount: remain_fee?.length,
        });
        // }
      } else {
        var student = await Student.find({
          $and: [{ _id: { $in: admin_ins?.remainingFee } }],
        })
          .sort("-vehicleRemainFeeCount")
          .select(
            "studentFirstName studentMiddleName studentLastName batches photoId studentGRNO studentProfilePhoto vehicleRemainFeeCount"
          )
          .populate({
            path: "department",
            select: "dName",
          })
          .populate({
            path: "vehicle",
            select: "vehicle_number",
          })
          .populate({
            path: "institute",
            select: "insName name",
          });
        student = student?.filter((ref) => {
          if (ref?.vehicleRemainFeeCount > 0) return ref;
        });
        var remain_fee = await nested_document_limit(page, limit, student);
        res.status(200).send({
          message: "Its a party time from DB 🙌",
          remain: remain_fee,
          remainCount: remain_fee?.length,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportMasterDepositQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const trans = await Transport.findById({ _id: tid }).populate({
      path: "institute",
      select: "financeDepart",
    });
    const master = await FeeMaster.findOne({
      $and: [
        { master_status: "Transport Linked" },
        { finance: trans?.institute?.financeDepart?.[0] },
      ],
    }).select(
      "paid_student_count deposit_amount master_name refund_student_count refund_amount"
    );

    res.status(200).send({
      message: "Explore Linked Fee Masters",
      access: true,
      master: master,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportMasterAllDepositHistory = async (req, res) => {
  try {
    const { tid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const trans = await Transport.findById({ _id: tid }).select(
      "refund_deposit"
    );

    if (search) {
      var all_receipts = await FeeReceipt.find({
        _id: { $in: trans?.refund_deposit },
      }).populate({
        path: "student",
        match: {
          studentFirstName: { $regex: search, $options: "i" },
        },
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
      });

      all_receipts = all_receipts?.filter((ref) => {
        if (ref?.student !== null) return ref;
      });
    } else {
      var all_receipts = await FeeReceipt.find({
        _id: { $in: trans?.refund_deposit },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        });
    }
    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore All Refund History",
        access: true,
        all_receipts: all_receipts,
      });
    } else {
      res.status(200).send({
        message: "No Refund History",
        access: false,
        all_receipts: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllNotLinkedQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    if (search) {
      var all_ins = await InstituteAdmin.find({
        $and: [
          {
            status: "Approved",
          },
        ],
        $or: [
          {
            insName: { $regex: `${search}`, $options: "i" },
          },
          {
            name: { $regex: `${search}`, $options: "i" },
          },
        ],
      }).select(
        "insName name photoId insProfilePhoto status transport_linked_status transportDepart"
      );
    } else {
      var all_ins = await InstituteAdmin.find({
        status: "Approved",
      })
        .sort({ createdAt: "-1" })
        .limit(limit)
        .skip(skip)
        .select(
          "insName name photoId insProfilePhoto status transport_linked_status transportDepart"
        );
    }

    if (all_ins?.length > 0) {
      for (var ref of all_ins) {
        if (`${ref?.transportDepart?.includes(`${tid}`)}`) {
          transport_linked_status = "Linked";
        } else {
          transport_linked_status = "Not Linked";
        }
      }
      res.status(200).send({
        message: "Explore Not Linked Query",
        access: true,
        all_ins: all_ins,
      });
    } else {
      res
        .status(200)
        .send({ message: "You're lost in space", access: false, all_ins: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneLinkedQuery = async (req, res) => {
  try {
    const { tid, id } = req.params;
    if (!tid && !id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var trans = await Transport.findById({ _id: tid });
    var one_ins = await InstituteAdmin.findById({ _id: id });

    if (one_ins?.transportDepart?.includes(`${trans?._id}`)) {
      res.status(200).send({ message: "Already Linked", access: true });
    } else {
      one_ins.transportDepart.push(trans?._id);
      one_ins.transportStatus = "Enable";
      trans.linked_institute.push(one_ins?._id);
      trans.linked_institute_count += 1;
      await Promise.all([one_ins.save(), trans.save()]);
      res
        .status(200)
        .send({ message: "Linking Operation Completed", access: true });
    }
  } catch (e) {
    console.log(e);
  }
};
