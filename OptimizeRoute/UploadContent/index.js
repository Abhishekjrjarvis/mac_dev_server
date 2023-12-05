const app = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = app.Router();
const { isLoggedIn } = require("../../middleware");
const {
  getImage,
  uploadOneImage,
  patchInstituteImagePhoto,
  patchInstituteImageCover,
  // patchInstituteDoc,
  patchInstituteAnnouncementPhoto,
  patchInstituteAnnouncementDoc,
  patchUserImagePhoto,
  patchUserImageCover,
  patchDepartmentImagePhoto,
  patchDepartmentImageCover,
  patchClassImagePhoto,
  patchClassImageCover,
  patchFinanceImagePhoto,
  patchFinanceImageCover,
  patchElearningImagePhoto,
  patchElearningImageCover,
  postElearningVideoResources,
  patchLibraryImagePhoto,
  patchLibraryImageCover,
  patchAdmissionImagePhoto,
  patchAdmissionImageCover,
  patchSportImagePhoto,
  patchSportImageCover,
  patchSportClassImagePhoto,
  patchSportClassImageCover,
  patchSportTeamImageCover,
  uploadOneWithDeletedPreviousImage,
  patchVehicleImageCover,
  patchTransportImageCover,
  patchEventManagerImageCover,
  patchLandingCareerImageCover,
  patchLandingTenderImageCover,
  patchAluminiImageCover,
  patchHostelImageCover,
  patchHostelUnitImageCover,
  patchHostelRoomImageCover,
  uploadOneImageDocs,
  uploadChatDocumentImages,
  uploadOneImageWeb,
  // patchStaffImagePhoto,
  // patchStaffAddharDoc,
  // patchStudentImagePhoto,
  // patchStudentAddharDoc,
} = require("../../OptimizeController/UploadContent/index");

router.route("/:key").get(getImage);
router.route("/onefile").patch(upload.single("file"), uploadOneImage);
router.route("/onefile/web").patch(upload.single("file"), uploadOneImageWeb);
router
  .route("/:id/institute/photo")
  .patch(isLoggedIn, upload.single("file"), patchInstituteImagePhoto);

router
  .route("/:id/institute/cover")
  .patch(isLoggedIn, upload.single("file"), patchInstituteImageCover);
// router
//   .route("/:id/ins-register/doc")
//   .patch(isLoggedIn, upload.single("file"), patchInstituteDoc);

router
  .route("/:id/ins-announcement/photo")
  .patch(isLoggedIn, upload.single("file"), patchInstituteAnnouncementPhoto);

router
  .route("/:id/ins-announcement/doc")
  .patch(isLoggedIn, upload.array("file"), patchInstituteAnnouncementDoc);

router
  .route("/:id/user/photo")
  .patch(isLoggedIn, upload.single("file"), patchUserImagePhoto);

router
  .route("/:id/user/cover")
  .patch(isLoggedIn, upload.single("file"), patchUserImageCover);
router
  .route("/:did/department/photo")
  .patch(isLoggedIn, upload.single("file"), patchDepartmentImagePhoto);

router
  .route("/:did/department/cover")
  .patch(isLoggedIn, upload.single("file"), patchDepartmentImageCover);
router
  .route("/:cid/class/photo")
  .patch(isLoggedIn, upload.single("file"), patchClassImagePhoto);

router
  .route("/:cid/class/cover")
  .patch(isLoggedIn, upload.single("file"), patchClassImageCover);

router
  .route("/:fid/finance/photo")
  .patch(isLoggedIn, upload.single("file"), patchFinanceImagePhoto);

router
  .route("/:fid/finance/cover")
  .patch(isLoggedIn, upload.single("file"), patchFinanceImageCover);

router
  .route("/:eid/elearning/photo")
  .patch(isLoggedIn, upload.single("file"), patchElearningImagePhoto);

router
  .route("/:eid/elearning/cover")
  .patch(isLoggedIn, upload.single("file"), patchElearningImageCover);

router
  .route("/:vid/video/resources")
  .patch(isLoggedIn, upload.single("file"), postElearningVideoResources);

router
  .route("/:lid/library/photo")
  .patch(isLoggedIn, upload.single("file"), patchLibraryImagePhoto);

router
  .route("/:lid/library/cover")
  .patch(isLoggedIn, upload.single("file"), patchLibraryImageCover);

router
  .route("/:aid/admission/photo")
  .patch(isLoggedIn, upload.single("file"), patchAdmissionImagePhoto);

router
  .route("/:aid/admission/cover")
  .patch(isLoggedIn, upload.single("file"), patchAdmissionImageCover);
router
  .route("/:sid/sport/photo")
  .patch(isLoggedIn, upload.single("file"), patchSportImagePhoto);

router
  .route("/:sid/sport/cover")
  .patch(isLoggedIn, upload.single("file"), patchSportImageCover);

router
  .route("/:sid/sport/class/photo")
  .patch(isLoggedIn, upload.single("file"), patchSportClassImagePhoto);

router
  .route("/:sid/sport/class/cover")
  .patch(isLoggedIn, upload.single("file"), patchSportClassImageCover);

router
  .route("/:sid/sport/team/cover")
  .patch(isLoggedIn, upload.single("file"), patchSportTeamImageCover);

router
  .route("/onefile/update")
  .patch(upload.single("file"), uploadOneWithDeletedPreviousImage);

router
  .route("/:vid/vehicle/cover")
  .patch(isLoggedIn, upload.single("file"), patchVehicleImageCover);

router
  .route("/:tid/transport/cover")
  .patch(isLoggedIn, upload.single("file"), patchTransportImageCover);

router
  .route("/:eid/event/manager/cover")
  .patch(isLoggedIn, upload.single("file"), patchEventManagerImageCover);

router
  .route("/:lcid/landing/career/cover")
  .patch(isLoggedIn, upload.single("file"), patchLandingCareerImageCover);

router
  .route("/:ltid/landing/tender/cover")
  .patch(isLoggedIn, upload.single("file"), patchLandingTenderImageCover);

router
  .route("/:aid/alumini/cover")
  .patch(isLoggedIn, upload.single("file"), patchAluminiImageCover);

router
  .route("/:hid/hostel/cover")
  .patch(isLoggedIn, upload.single("file"), patchHostelImageCover);

router
  .route("/:huid/hostel/unit/cover")
  .patch(isLoggedIn, upload.single("file"), patchHostelUnitImageCover);

router
  .route("/:hrid/hostel/room/cover")
  .patch(isLoggedIn, upload.single("file"), patchHostelRoomImageCover);

// Chat Document Upload With Key + Location
router
  .route("/onefile/document")
  .patch(upload.single("file"), uploadOneImageDocs);

// Chat Multiple Images Upto 30 Images
router
  .route("/multiple/images/upload/query")
  .post(
    upload.fields([
      { name: "file1" },
      { name: "file2" },
      { name: "file3" },
      { name: "file4" },
      { name: "file5" },
      { name: "file6" },
      { name: "file7" },
      { name: "file8" },
      { name: "file9" },
      { name: "file10" },
      { name: "file11" },
      { name: "file12" },
      { name: "file13" },
      { name: "file14" },
      { name: "file15" },
      { name: "file16" },
      { name: "file17" },
      { name: "file18" },
      { name: "file19" },
      { name: "file20" },
      { name: "file21" },
      { name: "file22" },
      { name: "file23" },
      { name: "file24" },
      { name: "file25" },
      { name: "file26" },
      { name: "file27" },
      { name: "file28" },
      { name: "file29" },
      { name: "file30" },
    ]),
    uploadChatDocumentImages
  );

// router
//   .route("/:id/staff/photo")
//   .patch(isLoggedIn, upload.single("file"), patchStaffImagePhoto);

// router
//   .route("/:id/student/addhar")
//   .patch(isLoggedIn, upload.single("file"), patchStaffAddharDoc);

// router
//   .route("/:id/student/photo")
//   .patch(isLoggedIn, upload.single("file"), patchStudentImagePhoto);

// router
//   .route("/:id/student/addhar")
//   .patch(isLoggedIn, upload.single("file"), patchStudentAddharDoc);

module.exports = router;
