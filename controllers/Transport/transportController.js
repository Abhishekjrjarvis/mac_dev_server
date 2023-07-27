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

exports.renderNewTransportManager = async (req, res) => {
  try {
    const { id, sid } = req.params;
    if (!sid && !id)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff.user}` });
    const transport = new Transport({});
    const notify = new Notification({});
    staff.transportDepartment.push(transport._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Transportation Manager";
    staff.designation_array.push({
      role: "Transportation Manager",
      role_id: transport?._id,
    });
    transport.transport_manager = staff._id;
    institute.transportDepart.push(transport._id);
    institute.transportStatus = "Enable";
    transport.institute = institute._id;
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
      institute.save(),
      staff.save(),
      transport.save(),
      user.save(),
      notify.save(),
    ]);
    // const tEncrypt = await encryptionPayload(transport._id);
    res.status(200).send({
      message: "Successfully Assigned Transport Manager",
      transport: transport._id,
      access: true,
      status: true,
    });
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
        "vehicle_count transport_staff_count transport_photo photoId passenger_count requested_status collected_fee exempt_fee online_fee offline_fee remaining_fee"
      )
      .populate({
        path: "transport_manager",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "institute",
        select: "insProfilePhoto",
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
        route_fees: path.fee,
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
    const { edit_path, rid, route_stop, route_fees } = req.body;
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
          path.route_fees = route_fees ? route_fees : path.route_fees;
        }
      }
      await route.save();
    } else if (route_status === "Add_New_Stop_Point" && edit_path?.length > 0) {
      for (var path of edit_path) {
        if (path?.index > route.direction_route?.length) {
          route.direction_route.push({
            route_stop: path.stop,
            route_fees: path.fee,
          });
        } else {
          route.direction_route.splice(path.index, 0, {
            route_stop: path.stop,
            route_fees: path.fee,
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
    const { sid, rid, amount } = req.body;
    var remain_fee = parseInt(amount);
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
    for (var path of route?.direction_route) {
      if (`${path?._id}` === `${rid}`) {
        path.passenger_list.push(student?._id);
        path.passenger_list_with_batch.push(trans_batch?._id);
        path.passenger_count += 1;
        student.routes.push({
          routeId: path?._id,
          routePath: path?.route_stop,
        });
        student.active_routes = path?.route_stop;
        if (remain_fee) {
          student.vehicleRemainFeeCount += remain_fee;
          vehicle.remaining_fee += remain_fee;
          trans.remaining_fee += remain_fee;
        } else {
          student.vehicleRemainFeeCount += path?.route_fees;
          vehicle.remaining_fee += path?.route_fees;
          trans.remaining_fee += path?.route_fees;
        }
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
          student.vehicleRemainFeeCount -= student.vehicleRemainFeeCount;
          vehicle.remaining_fee -= student.vehicleRemainFeeCount;
          trans.remaining_fee -= student.vehicleRemainFeeCount;
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
          "vehicle_number passenger_count vehicle_type vehicle_photo photoId"
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
          "vehicle_number passenger_count vehicle_type vehicle_photo photoId"
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
    }).select("direction_route");

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

exports.renderTransportStudentCollect = async (req, res) => {
  try {
    const { tid, sid } = req.params;
    const { amount, mode, is_install } = req.body;
    if (!tid && !amount && !mode && !is_install)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const price = parseInt(amount);
    const trans = await Transport.findById({ _id: tid });
    const one_student = await Student.findById({ _id: sid });
    const one_vehicle = await Vehicle.findById({
      _id: `${one_student?.vehicle}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${trans?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    if (price > one_student?.vehicleRemainFeeCount) {
      res.status(200).send({
        message: "No Balance Pool for further Operation 😡",
        access: false,
      });
    } else if (price <= one_student?.vehicleRemainFeeCount) {
      var exempt = one_student?.vehicleRemainFeeCount - price;
      if (!is_install) {
        trans.exempt_fee += one_student?.vehicleRemainFeeCount - price;
        finance.financeExemptBalance +=
          one_student?.vehicleRemainFeeCount - price;
      }
      trans.collected_fee += price;
      if (one_vehicle?.remaining_fee >= price) {
        one_vehicle.remaining_fee -= price;
      }
      if (one_student?.vehicleRemainFeeCount >= price) {
        one_student.vehicleRemainFeeCount -= price + exempt;
      }
      one_student.vehiclePaidFeeCount += price;
      if (mode === "Online") {
        trans.online_fee += price;
      } else if (mode === "Offline") {
        trans.offline_fee += price;
      } else {
      }
      if (trans.remaining_fee > price) {
        trans.remaining_fee -= price;
      }
      trans.fund_history.push({
        student: one_student?._id,
        is_install: is_install ? true : false,
        amount: price,
        mode: mode,
      });
      await Promise.all([
        finance.save(),
        trans.save(),
        one_student.save(),
        one_vehicle.save(),
      ]);
      res.status(200).send({
        message: "Installment Operation Completed 😀",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportFundsQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    const { amount } = req.body;
    if (!tid && !amount)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const price = parseInt(amount);
    const trans = await Transport.findById({ _id: tid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${trans?.institute}`,
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
    if (batch_filter === "ALL") {
      // fetch all data
      const instituteCurrentBatch = await InstituteAdmin.findById(
        trans.institute
      )
        .populate({
          path: "batches",
          match: {
            activeBatch: { $eq: `Active` },
          },
          select: "_id",
        })
        .select("batches");
      const institutePreviousBatch = await InstituteAdmin.findById(
        trans.institute
      )
        .populate({
          path: "batches",
          match: { activeBatch: { $eq: "Not Active" } },
          select: "_id",
        })
        .select("batches");
      if (search)
        var all_passengers = await getALLBatchPassengerWithSearch(
          trans.transport_passengers_with_batch,
          instituteCurrentBatch?.batches,
          institutePreviousBatch?.batches,
          page,
          limit,
          search,
          filter_by
        );
      else
        var all_passengers = await getALLBatchPassengerWithoutSearch(
          trans.transport_passengers_with_batch,
          instituteCurrentBatch?.batches,
          institutePreviousBatch?.batches,
          page,
          limit,
          filter_by
        );
    } else if (batch_filter === "PAST") {
      // fetch all past data
      const institute = await InstituteAdmin.findById(trans.institute)
        .populate({
          path: "batches",
          match: { activeBatch: { $eq: "Not Active" } },
          select: "_id",
        })
        .select("batches");
      if (search)
        var all_passengers = await getPastBatchPassengerWithSearch(
          trans.transport_passengers_with_batch,
          institute?.batches,
          page,
          limit,
          search,
          filter_by
        );
      else
        var all_passengers = await getPastBatchPassengerWithoutSearch(
          trans.transport_passengers_with_batch,
          institute?.batches,
          page,
          limit,
          filter_by
        );
      // console.log(all_passengers);
    } else {
      // fetch all current data
      const institute = await InstituteAdmin.findById(trans.institute)
        .populate({
          path: "batches",
          match: {
            activeBatch: { $eq: `Active` },
          },
          select: "_id",
        })
        .select("batches");

      if (search)
        var all_passengers = await getCurrentBatchPassengerWithSearch(
          trans?.transport_passengers,
          institute?.batches,
          skip,
          limit,
          search,
          filter_by
        );
      else
        var all_passengers = await getCurrentBatchPassengerWithoutSearch(
          trans?.transport_passengers,
          institute?.batches,
          skip,
          limit,
          filter_by
        );
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
    if (batch_filter === "ALL") {
      // fetch all data
      const instituteCurrentBatch = await InstituteAdmin.findById(
        one_vehicle.transport.institute
      )
        .populate({
          path: "batches",
          match: {
            activeBatch: { $eq: `Active` },
          },
          select: "_id",
        })
        .select("batches");
      const institutePreviousBatch = await InstituteAdmin.findById(
        one_vehicle.transport.institute
      )
        .populate({
          path: "batches",
          match: { activeBatch: { $eq: "Not Active" } },
          select: "_id",
        })
        .select("batches");
      if (search)
        var all_passengers = await getALLBatchPassengerWithSearch(
          one_vehicle.passenger_array_with_batch,
          instituteCurrentBatch?.batches,
          institutePreviousBatch?.batches,
          page,
          limit,
          search,
          filter_by
        );
      else
        var all_passengers = await getALLBatchPassengerWithoutSearch(
          one_vehicle.passenger_array_with_batch,
          instituteCurrentBatch?.batches,
          institutePreviousBatch?.batches,
          page,
          limit,
          filter_by
        );
    } else if (batch_filter === "PAST") {
      // fetch all past data
      const institute = await InstituteAdmin.findById(
        one_vehicle.transport.institute
      )
        .populate({
          path: "batches",
          match: { activeBatch: { $eq: "Not Active" } },
          select: "_id",
        })
        .select("batches");
      if (search)
        var all_passengers = await getPastBatchPassengerWithSearch(
          one_vehicle.passenger_array_with_batch,
          institute?.batches,
          page,
          limit,
          search,
          filter_by
        );
      else
        var all_passengers = await getPastBatchPassengerWithoutSearch(
          one_vehicle.passenger_array_with_batch,
          institute?.batches,
          page,
          limit,
          filter_by
        );
      // console.log(all_passengers);
    } else {
      // fetch all current data
      const institute = await InstituteAdmin.findById(
        one_vehicle.transport.institute
      )
        .populate({
          path: "batches",
          match: {
            activeBatch: { $eq: `Active` },
          },
          select: "_id",
        })
        .select("batches");

      if (search)
        var all_passengers = await getCurrentBatchPassengerWithSearch(
          one_vehicle?.passenger_array,
          institute?.batches,
          skip,
          limit,
          search,
          filter_by
        );
      else
        var all_passengers = await getCurrentBatchPassengerWithoutSearch(
          one_vehicle?.passenger_array,
          institute?.batches,
          skip,
          limit,
          filter_by
        );
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
