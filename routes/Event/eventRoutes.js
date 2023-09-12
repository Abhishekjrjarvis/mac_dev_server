const express = require("express");
const router = express.Router();
const Event = require("../../controllers/Event/eventController");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

router.post(
  "/ins/:id/event/manager/query",
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

router.post(
  "/manager/:eid/new/election",
  catchAsync(Event.renderOneEventManagerNewElection)
);

router.get(
  "/manager/:eid/one/institute",
  catchAsync(Event.renderOneEventManagerInstituteQuery)
);

router.post(
  "/manager/:eid/new/participate",
  catchAsync(Event.renderOneEventManagerNewParticipate)
);

router.get(
  "/manager/:eid/all/elections",
  catchAsync(Event.renderOneEventManagerAllElections)
);

router.get(
  "/manager/:eid/all/participate",
  catchAsync(Event.renderOneEventManagerAllParticipate)
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

router.patch(
  "/one/event/:eid/edit",
  catchAsync(Event.renderOneEventUpdateQuery)
);

router.patch(
  "/one/seminar/:smid/edit",
  catchAsync(Event.renderOneSeminarUpdateQuery)
);

router.delete(
  "/one/event/:eid/destroy",
  catchAsync(Event.renderOneEventDestroyQuery)
);

router.delete(
  "/one/seminar/:smid/destroy",
  catchAsync(Event.renderOneSeminarDestroyQuery)
);

module.exports = router;
