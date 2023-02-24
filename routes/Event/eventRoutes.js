const express = require("express");
const router = express.Router();
const Event = require("../../controllers/Event/eventController");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

router.post(
  "/ins/:id/staff/:sid/manager",
  // isLoggedIn,
  catchAsync(Event.renderNewEventManagerQuery)
);

router.get("/manager/:eid", catchAsync(Event.renderOneEventManagerQuery));

router.get(
  "/manager/:eid/all/events",
  catchAsync(Event.renderOneEventManagerAllEvents)
);

router.get(
  "/manager/:eid/all/seminars",
  catchAsync(Event.renderOneEventManagerAllSeminars)
);

router.post(
  "/manager/:eid/new/event",
  catchAsync(Event.renderOneEventManagerNewEvent)
);

router.post(
  "/manager/:eid/new/seminar",
  catchAsync(Event.renderOneEventManagerNewSeminar)
);

router.get("/one/event/:evid", catchAsync(Event.renderOneEventQuery));

router.get("/one/seminar/:smid", catchAsync(Event.renderOneSeminarQuery));

router.get(
  "/department/:did/all/seminars",
  catchAsync(Event.renderOneDepartmentAllSeminars)
);

router.get(
  "/department/:did/all/events",
  catchAsync(Event.renderOneDepartmentAllEvents)
);

module.exports = router;
