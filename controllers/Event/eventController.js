const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const Admin = require("../../models/superAdmin");
const Class = require("../../models/Class");
const Department = require("../../models/Department");
const EventManager = require("../../models/Event/eventManager");
const Events = require("../../models/Event/events");
const Seminar = require("../../models/Event/seminar");
const {
  uploadDocFile,
  getFileStream,
  deleteFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const invokeFirebaseNotification = require("../../Firebase/firebase");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const { nested_document_limit } = require("../../helper/databaseFunction");
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const moment = require("moment");
const { handle_undefined } = require("../../Handler/customError");

exports.renderNewEventManagerQuery = async (req, res) => {
  try {
    const { id, sid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff.user}` });
    const event_manager = new EventManager({});
    const notify = new Notification({});
    staff.eventManagerDepartment.push(event_manager._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Events / Seminar Administrator";
    event_manager.event_head = staff._id;
    institute.eventManagerDepart.push(event_manager._id);
    institute.eventManagerStatus = "Enable";
    event_manager.institute = institute._id;
    notify.notifyContent = `you got the designation of as Events / Seminar Administrator`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Event Manager Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      institute.save(),
      staff.save(),
      event_manager.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Staff",
      manager: event_manager._id,
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "EVENT_MANAGER",
      institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const manager = await EventManager.findById({ _id: eid })
      .select(
        "event_count created_at seminar_count election_count participate_count remaining_fee"
      )
      .populate({
        path: "event_head",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      });

    res.status(200).send({
      message: "Explore Event Manager Process",
      access: true,
      manager: manager,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerAllEvents = async (req, res) => {
  try {
    const { eid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const manager = await EventManager.findById({ _id: eid }).select("events");

    const all_events = await Events.find({ _id: { $in: manager?.events } })
      .limit(limit)
      .skip(skip)
      .select(
        "event_banner event_name event_guest event_date event_time event_status"
      );

    if (all_events?.length > 0) {
      res.status(200).send({
        message: "Explore All Events",
        access: true,
        all_events: all_events,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Event",
        access: false,
        all_events: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerAllSeminars = async (req, res) => {
  try {
    const { eid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const manager = await EventManager.findById({ _id: eid }).select(
      "seminars"
    );

    const all_seminars = await Seminar.find({ _id: { $in: manager?.seminars } })
      .limit(limit)
      .skip(skip)
      .select(
        "seminar_banner seminar_name seminar_guest seminar_date seminar_time seminar_status seminar_mode"
      );

    if (all_seminars?.length > 0) {
      res.status(200).send({
        message: "Explore All Seminars",
        access: true,
        all_seminars: all_seminars,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Seminar",
        access: false,
        all_seminars: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerNewEvent = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const seconds = new Date().getSeconds();
    const mill = new Date().getMilliseconds();
    const manager = await EventManager.findById({ _id: eid });
    const new_event = new Events({ ...req.body });
    for (var ref of req?.body?.depart) {
      var depart = await Department.findById({ _id: ref });
      depart.events.push(new_event?._id);
      depart.events_count += 1;
      new_event.for_department.push(depart?._id);
      await depart.save();
    }
    new_event.event_manager = manager?._id;
    new_event.event_date = new Date(`${req.body?.event_date}`);
    new_event.event_time = new Date(
      `${req.body?.event_date}T${req.body?.event_time}:${seconds}.${mill}Z`
    );
    manager.events.push(new_event?._id);
    manager.event_count += 1;
    await Promise.all([manager.save(), new_event.save()]);
    res.status(200).send({ message: "Explore New Event", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerNewSeminar = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const seconds = new Date().getSeconds();
    const mill = new Date().getMilliseconds();
    const manager = await EventManager.findById({ _id: eid });
    const new_seminar = new Seminar({ ...req.body });
    for (var ref of req?.body?.depart) {
      var depart = await Department.findById({ _id: ref });
      depart.seminars.push(new_seminar?._id);
      depart.seminars_count += 1;
      new_seminar.for_department.push(depart?._id);
      await depart.save();
    }
    new_seminar.event_manager = manager?._id;
    new_seminar.seminar_date = new Date(`${req.body?.seminar_date}`);
    new_seminar.seminar_time = new Date(
      `${req.body?.event_date}T${req.body?.seminar_time}:${seconds}.${mill}Z`
    );
    manager.seminars.push(new_seminar?._id);
    manager.seminar_count += 1;
    await Promise.all([manager.save(), new_seminar.save()]);
    res.status(200).send({ message: "Explore New Seminar", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventQuery = async (req, res) => {
  try {
    const { evid } = req.params;
    if (!evid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_event = await Events.findById({ _id: evid }).populate({
      path: "for_department",
      select: "dName dTitle photo ",
    });

    res.status(200).send({
      message: "Explore One Event",
      access: true,
      one_event: one_event,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneSeminarQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    if (!smid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_seminar = await Seminar.findById({ _id: smid }).populate({
      path: "for_department",
      select: "dName dTitle photo ",
    });

    res.status(200).send({
      message: "Explore One Seminar",
      access: true,
      one_seminar: one_seminar,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneDepartmentAllEvents = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did }).select("events");

    const all_events = await Events.find({ _id: { $in: depart?.events } })
      .limit(limit)
      .skip(skip)
      .select(
        "event_banner event_name event_guest event_date event_time event_status"
      );

    if (all_events?.length > 0) {
      res.status(200).send({
        message: "Explore All Events",
        access: true,
        all_events: all_events,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Event",
        access: false,
        all_events: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneDepartmentAllSeminars = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did }).select("seminars");

    const all_seminars = await Seminar.find({ _id: { $in: depart?.seminars } })
      .limit(limit)
      .skip(skip)
      .select(
        "seminar_banner seminar_name seminar_guest seminar_date seminar_time seminar_status seminar_mode"
      );

    if (all_seminars?.length > 0) {
      res.status(200).send({
        message: "Explore All Seminars",
        access: true,
        all_seminars: all_seminars,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Seminar",
        access: false,
        all_seminars: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};
