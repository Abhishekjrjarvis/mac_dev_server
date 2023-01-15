const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const Department = require("../../models/Department");
const Class = require("../../models/Class");
const ClassMaster = require("../../models/ClassMaster");
const SubjectMaster = require("../../models/SubjectMaster");
const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const InsAnnouncement = require("../../models/InsAnnouncement");
const Complaint = require("../../models/Complaint");
const SportClass = require("../../models/SportClass");
const Checklist = require("../../models/Checklist");
const Fees = require("../../models/Fees");
const Batch = require("../../models/Batch");

const Library = require("../../models/Library/Library");
const { shuffleArray } = require("../../Utilities/Shuffle");
const HashTag = require("../../models/HashTag/hashTag");

exports.searchUserUniversalWeb = async (req, res) => {
  try {
    if (req.query.search.trim() === "")
      res.status(203).send({ message: "Please Provide a string to search" });
    else {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const { filter } = req.query;
      const allInstitutes = await InstituteAdmin.find({
        $and: [
          { status: "Approved" },
          {
            $or: [
              { insName: { $regex: req.query.search, $options: "i" } },
              { name: { $regex: req.query.search, $options: "i" } },
            ],
          },
        ],
      })
        .select("insName insProfilePhoto photoId name blockStatus status")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();

      const users = await User.find({
        $and: [
          { _id: { $ne: [req.params.id] } },
          { activeStatus: "Activated" },
        ],
        $or: [
          { userLegalName: { $regex: req.query.search, $options: "i" } },
          { username: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .limit(itemPerPage)
        .skip(dropItem)
        .select(
          "userLegalName profilePhoto photoId username blockStatus userStatus"
        )
        .lean()
        .exec();

      // const allMentors = await Staff.find({
      //   $and: [
      //     { status: "Approved" },
      //     {
      //       $or: [
      //         { staffFirstName: { $regex: req.query.search, $options: "i" } },
      //         { staffMiddleName: { $regex: req.query.search, $options: "i" } },
      //         { staffLastName: { $regex: req.query.search, $options: "i" } },
      //       ],
      //     },
      //   ],
      // })
      //   .select(
      //     "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
      //   )
      //   .limit(itemPerPage)
      //   .skip(dropItem)
      //   .populate({
      //     path: "user",
      //     select: "username",
      //   })
      //   .lean()
      //   .exec();

      const allHashtag = await HashTag.find({
        $and: [
          {
            $or: [
              { hashtag_name: { $regex: req.query.search, $options: "i" } },
            ],
          },
        ],
      })
        .select(
          "hashtag_name hashtag_follower_count hashtag_profile_photo hashtag_photo_id"
        )
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (
        !allInstitutes.length &&
        !users.length &&
        // !allMentors.length &&
        !allHashtag.length
      )
        res.status(204).send({ message: "Not found any search" });
      else {
        if (filter === "Institute") {
          res.status(200).send({
            message: "filter by Institute",
            universalArrayUser: allInstitutes,
            filter: true,
          });
        }
        //  else if (filter === "Mentor") {
        //   res.status(200).send({
        //     message: "filter by Mentor",
        //     universalArrayUser: allMentors,
        //     filter: true,
        //   });
        // }
        else if (filter === "People") {
          res.status(200).send({
            message: "filter by People",
            universalArrayUser: users,
            filter: true,
          });
        } else if (filter === "Hashtag") {
          res.status(200).send({
            message: "filter by Hashtag",
            universalArrayUser: allHashtag,
            filter: true,
          });
        } else {
          var mergeArray = [
            ...allInstitutes,
            ...users,
            // ...allMentors,
            ...allHashtag,
          ];
          var universalArrayUser = shuffleArray(mergeArray);
          res.status(200).send({
            universalArrayUser,
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.searchInstituteUniversalWeb = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const { filter } = req.query;
      const allInstitutes = await InstituteAdmin.find({
        $and: [
          { _id: { $ne: [req.params.id] } },
          { status: { $eq: "Approved" } },
        ],
        $or: [
          { insName: { $regex: req.query.search, $options: "i" } },
          { name: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .select("insName insProfilePhoto photoId name blockStatus")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      const departments = await Department.find({
        $and: [{ institute: req.params.id }],
        $or: [
          { dName: { $regex: req.query.search, $options: "i" } },
          { dTitle: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .select("dName photo photoId")
        .limit(itemPerPage)
        .skip(dropItem)
        .populate({
          path: "dHead",
          select: "staffFirstName staffMiddleName staffLastName",
        })
        .lean()
        .exec();

      const staff = await Staff.find({
        $and: [
          { institute: req.params.id },
          { staffStatus: { $ne: "Not Approved" } },
        ],
        $or: [
          { staffFirstName: { $regex: req.query.search, $options: "i" } },
          {
            staffMiddleName: { $regex: req.query.search, $options: "i" },
          },
          { staffLastName: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .select(
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
        )
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();

      const students = await Student.find({
        $and: [
          { institute: req.params.id },
          { studentStatus: { $ne: "Not Approved" } },
        ],
        $or: [
          { studentFirstName: { $regex: req.query.search, $options: "i" } },
          {
            studentMiddleName: { $regex: req.query.search, $options: "i" },
          },
          { studentLastName: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO"
        )
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();

      if (
        !allInstitutes.length &&
        !departments.length &&
        !staff.length &&
        !students.length
      )
        res.status(202).send({ message: "Not found any search" });
      else {
        if (filter === "Institute") {
          res.status(200).send({
            message: "filter by Institute",
            universalArray: allInstitutes,
            filter: true,
          });
        } else if (filter === "Staff") {
          res.status(200).send({
            message: "filter by Staff",
            universalArray: staff,
            filter: true,
          });
        } else if (filter === "Department") {
          res.status(200).send({
            message: "filter by Department",
            universalArray: departments,
            filter: true,
          });
        } else if (filter === "Student") {
          res.status(200).send({
            message: "filter by Student",
            universalArray: students,
            filter: true,
          });
        } else {
          var mergeArray = [
            ...allInstitutes,
            ...departments,
            ...staff,
            ...students,
          ];
          var universalArray = shuffleArray(mergeArray);
          res.status(200).send({
            universalArray,
          });
        }
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchUserUniversal = async (req, res) => {
  try {
    if (req.query.search.trim() === "")
      res.status(203).send({ message: "Please Provide a string to search" });
    else {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const allInstitutes = await InstituteAdmin.find({
        $and: [
          { status: "Approved" },
          {
            $or: [
              { insName: { $regex: req.query.search, $options: "i" } },
              { name: { $regex: req.query.search, $options: "i" } },
            ],
          },
        ],
      })
        .select("insName insProfilePhoto photoId name blockStatus status")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();

      const users = await User.find({
        $and: [
          { _id: { $ne: [req.params.id] } },
          { activeStatus: "Activated" },
        ],
        $or: [
          { userLegalName: { $regex: req.query.search, $options: "i" } },
          { username: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .limit(itemPerPage)
        .skip(dropItem)
        .select(
          "userLegalName profilePhoto photoId username blockStatus userStatus"
        )
        .lean()
        .exec();

      // const staffs = await Staff.find({
      //   $or: [
      //     { staffFirstName: { $regex: req.query.search, $options: "i" } },
      //     {
      //       staffMiddleName: { $regex: req.query.search, $options: "i" },
      //     },
      //     { staffLastName: { $regex: req.query.search, $options: "i" } },
      //   ],
      // })
      //   .select(
      //     "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto user"
      //   )
      //   .limit(itemPerPage)
      //   .skip(dropItem)
      //   .lean()
      // && !staffs.length
      //   .exec();
      if (!allInstitutes.length && !users.length)
        res.status(204).send({ message: "Not found any search" });
      else {
        res.status(200).send({
          // allInstitutes,
          // users,
          universalArrayUser: [...allInstitutes, ...users],
          // staffs,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.searchInstituteUniversal = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const allInstitutes = await InstituteAdmin.find({
        $and: [
          { _id: { $ne: [req.params.id] } },
          { status: { $eq: "Approved" } },
        ],
        $or: [
          { insName: { $regex: req.query.search, $options: "i" } },
          { name: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .select("insName insProfilePhoto photoId name blockStatus")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      const departments = await Department.find({
        $and: [{ institute: req.params.id }],
        $or: [
          { dName: { $regex: req.query.search, $options: "i" } },
          { dTitle: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .select("dName dTitle photo photoId")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();

      const staff = await Staff.find({
        $and: [
          { institute: req.params.id },
          { staffStatus: { $ne: "Not Approved" } },
        ],
        $or: [
          { staffFirstName: { $regex: req.query.search, $options: "i" } },
          {
            staffMiddleName: { $regex: req.query.search, $options: "i" },
          },
          { staffLastName: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .select(
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
        )
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();

      const students = await Student.find({
        $and: [
          { institute: req.params.id },
          { studentStatus: { $ne: "Not Approved" } },
        ],
        $or: [
          { studentFirstName: { $regex: req.query.search, $options: "i" } },
          {
            studentMiddleName: { $regex: req.query.search, $options: "i" },
          },
          { studentLastName: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto"
        )
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();

      if (
        !allInstitutes.length &&
        !departments.length &&
        !staff.length &&
        !students.length
      )
        res.status(202).send({ message: "Not found any search" });
      else
        var universalArray = [
          ...allInstitutes,
          ...departments,
          ...staff,
          ...students,
        ];
      res.status(200).send({
        allInstitutes,
        departments,
        staff,
        students,
        universalArray,
      });
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchInstitute = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $or: [
              { insName: { $regex: req.query.search, $options: "i" } },
              { name: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const allInstitutes = await InstituteAdmin.find(search)
        .select(
          "insName insProfilePhoto photoId name insState insDistrict followers userFollowersList"
        )
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!allInstitutes.length)
        res.status(202).send({ message: "Not found any search" });
      else
        res.status(200).send({
          allInstitutes,
        });
    }
  } catch (e) {
    console.log(e.kind);
  }
};
exports.searchUserInstitute = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $or: [
              { insName: { $regex: req.query.search, $options: "i" } },
              { name: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const allInstitutes = await InstituteAdmin.find(search)
        // .populate({
        //   path: "followers",
        //   // select: "",
        // })
        .select("insName insProfilePhoto photoId name status")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!allInstitutes.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          allInstitutes,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchUser = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [{ activeStatus: "Activated" }],
            $or: [
              { userLegalName: { $regex: req.query.search, $options: "i" } },
              { username: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const user = await User.find(search)
        .limit(itemPerPage)
        .skip(dropItem)
        .select("userLegalName profilePhoto photoId username")
        .lean()
        .exec();
      if (!user.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          user,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchDepartment = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                institute: req.params.id,
              },
            ],
            $or: [
              { dName: { $regex: req.query.search, $options: "i" } },
              { dTitle: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const department = await Department.find(search)
        .select("dName photo photoId batches")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!department.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          department,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.searchClass = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [{ department: req.params.did }, { batch: req.params.bid }],

            $or: [
              { className: { $regex: req.query.search, $options: "i" } },
              { classTitle: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const classData = await Class.find(search)
        .select("className classTitle photo photoId")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!classData.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          classData,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchClassMaster = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [{ department: req.params.did }],
            $or: [
              { className: { $regex: req.query.search, $options: "i" } },
              { classTitle: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const classMaster = await ClassMaster.find(search)
        .select("className classTitle classDivision")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!classMaster.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          classMaster,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchSubject = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [{ department: req.params.did }],
            $or: [{ subjectName: { $regex: req.query.search, $options: "i" } }],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const subject = await SubjectMaster.find(search)
        .select("subjectName subjects")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!subject.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          subject,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};
exports.searchStudent = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      const student = await Student.find({
        $and: [{ institute: req.params.id }, { studentStatus: "Approved" }],
      })
        .sort("createdAt")
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentPhoneNumber studentGRNO studentROLLNO studentAdmissionDate studentGender"
        )
        .populate({
          path: "user",
          select: "_id userPhoneNumber",
        })
        .populate({
          path: "studentClass",
          select: "className",
        })
        .lean()
        .exec();
      res
        .status(200)
        .send({ message: "Without Query All Student", student: student });
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                institute: req.params.id,
              },
              {
                studentStatus: { $ne: "Not Approved" },
              },
            ],
            $or: [
              { studentFirstName: { $regex: req.query.search, $options: "i" } },
              {
                studentMiddleName: { $regex: req.query.search, $options: "i" },
              },
              { studentLastName: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const student = await Student.find(search)
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentPhoneNumber studentGRNO studentROLLNO studentAdmissionDate studentGender"
        )
        .populate({
          path: "user",
          select: "_id userPhoneNumber",
        })
        .populate({
          path: "studentClass",
          select: "className",
        })
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!student.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          student,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchStaff = async (req, res) => {
  // change here this api add absent function
  try {
    if (!req.query.search?.trim()) {
      if (req.query.date) {
        const staff = await Staff.find({
          $and: [{ institute: req.params.id }, { staffStatus: "Approved" }],
        })
          .sort("-createdAt")
          .select(
            "staffFirstName staffMiddleName staff_biometric_id recentDesignation staffLastName photoId staffProfilePhoto staffPhoneNumber staffJoinDate staffROLLNO staffGender"
          )
          .populate({
            path: "user",
            select: "_id userLegalName userPhoneNumber",
          })
          .populate({
            path: "staffLeave",
            match: {
              date: { $eq: req.query?.date },
            },
            select: "_id date",
          })
          .lean()
          .exec();
        res
          .status(200)
          .send({ message: "Without Query All Staff", staff: staff });
      } else {
        const staff = await Staff.find({
          $and: [{ institute: req.params.id }, { staffStatus: "Approved" }],
        })
          .sort("-createdAt")
          .select(
            "staffFirstName staffMiddleName staff_biometric_id recentDesignation staffLastName photoId staffProfilePhoto staffPhoneNumber staffJoinDate staffROLLNO staffGender"
          )
          .populate({
            path: "user",
            select: "_id userLegalName userPhoneNumber",
          })
          .lean()
          .exec();
        res
          .status(200)
          .send({ message: "Without Query All Staff", staff: staff });
      }
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                institute: req.params.id,
              },
              {
                staffStatus: { $ne: "Not Approved" },
              },
            ],
            $or: [
              { staffFirstName: { $regex: req.query.search, $options: "i" } },
              {
                staffMiddleName: { $regex: req.query.search, $options: "i" },
              },
              { staffLastName: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const staff = await Staff.find(search)
        .select(
          "staffFirstName staffMiddleName staff_biometric_id recentDesignation staffLastName photoId staffProfilePhoto staffPhoneNumber staffJoinDate staffROLLNO staffGender"
        )
        .populate({
          path: "user",
          select: "_id userLegalName userPhoneNumber",
        })
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!staff.length) {
        res.status(202).send({ message: "Not found any search", staff: [] });
      } else {
        res.status(200).send({
          staff,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.searchStaffRequest = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                institute: req.params.id,
              },
              {
                staffStatus: { $eq: "Not Approved" },
              },
            ],
            $or: [
              { staffFirstName: { $regex: req.query.search, $options: "i" } },
              {
                staffMiddleName: { $regex: req.query.search, $options: "i" },
              },
              { staffLastName: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const staff = await Staff.find(search)
        .select(
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
        )
        .populate({
          path: "user",
          select: "_id userLegalName",
        })
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!staff.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          staff,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};
exports.searchAllStaff = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $or: [
              { staffFirstName: { $regex: req.query.search, $options: "i" } },
              {
                staffMiddleName: { $regex: req.query.search, $options: "i" },
              },
              { staffLastName: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const staff = await Staff.find(search)
        .select(
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto user"
        )

        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!staff.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          staff,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchSubjectMaster = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $or: [
              { insName: { $regex: req.query.search, $options: "i" } },
              { name: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const department = await Subject.find(search)
        .select("insName insProfilePhoto photoId")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!department.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          department,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchInsitiuteAnnouncement = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                institute: req.params.id,
              },
            ],
            $or: [
              { insAnnTitle: { $regex: req.query.search, $options: "i" } },
              // { name: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const instituteNotification = await InsAnnouncement.find(search)
        .select("insAnnTitle insAnnPhoto")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!instituteNotification.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          instituteNotification,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchInsitiuteComplaint = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                institute: req.params.id,
              },
            ],
            $or: [
              { complaintType: { $regex: req.query.search, $options: "i" } },
              { complaintStatus: { $regex: req.query.search, $options: "i" } },
              {
                complaintInsStatus: { $regex: req.query.search, $options: "i" },
              },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const instituteNotification = await Complaint.find(search)
        .select("insAnnTitle insAnnPhoto")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!instituteNotification.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          instituteNotification,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchInsitiuteClass = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                institute: req.params.id,
              },
            ],
            $or: [
              { sportClassName: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const instituteSportClass = await SportClass.find(search)
        .select("photoId photo sportClassName institute")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!instituteSportClass.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          instituteSportClass,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchDepartmentStaff = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const staff = await Batch.findById(req.params.bid)
        .populate({
          path: "batchStaff",
          match: {
            $or: [
              { staffFirstName: { $regex: req.query.search, $options: "i" } },
              {
                staffMiddleName: { $regex: req.query.search, $options: "i" },
              },
              { staffLastName: { $regex: req.query.search, $options: "i" } },
            ],
          },
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        })
        .limit(itemPerPage)
        .skip(dropItem)
        .select("_id")
        .lean()
        .exec();
      if (!staff.batchStaff.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          staff: staff.batchStaff,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchChecklist = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                checklistDepartment: req.params.did,
              },
            ],
            $or: [
              { checklistName: { $regex: req.query.search, $options: "i" } },
              // {
              //   checklistFees: { $regex: req.query.search, $options: "i" },
              // },
              // { checklistAmount: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const checklist = await Checklist.find(search)
        .select("checklistName checklistFees checklistAmount createdAt")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!checklist.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          checklist,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchFees = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $and: [
              {
                feeDepartment: req.params.did,
              },
            ],
            $or: [{ feeName: { $regex: req.query.search, $options: "i" } }],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const fees = await Fees.find(search)
        .select("feeName feeAmount createdAt feeDate")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!fees.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          fees,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.searchClassStudent = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      // const getPage = req.query.page ? parseInt(req.query.page) : 1;
      // const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      // const dropItem = (getPage - 1) * itemPerPage;
      const { cid } = req.params;
      const catalogClass = await Class.findById({ _id: cid })
        .populate({
          path: "ApproveStudent",
          match: {
            $or: [
              { studentFirstName: { $regex: req.query.search, $options: "i" } },
              {
                studentMiddleName: { $regex: req.query.search, $options: "i" },
              },
              { studentLastName: { $regex: req.query.search, $options: "i" } },
            ],
          },
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
        })
        .select("_id")
        // .limit(itemPerPage)
        // .skip(dropItem)
        .lean()
        .exec();
      if (!catalogClass.ApproveStudent.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          student: catalogClass.ApproveStudent,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.searchSubjectStudent = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      // const getPage = req.query.page ? parseInt(req.query.page) : 1;
      // const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      // const dropItem = (getPage - 1) * itemPerPage;
      const sujectStudent = await Subject.findById(req.params.sid)
        .populate({
          path: "class",
          populate: {
            path: "ApproveStudent",
            match: {
              $or: [
                {
                  studentFirstName: { $regex: req.query.search, $options: "i" },
                },
                {
                  studentMiddleName: {
                    $regex: req.query.search,
                    $options: "i",
                  },
                },
                {
                  studentLastName: { $regex: req.query.search, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
          },
          select: "_id",
        })
        .select("_id")
        .lean()
        .exec();
      if (!sujectStudent.class.ApproveStudent.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          student: sujectStudent.class.ApproveStudent,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.searchLibraryBook = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      // const search = req.query.search
      //   ? {
      //       $or: [
      //         { insName: { $regex: req.query.search, $options: "i" } },
      //         { name: { $regex: req.query.search, $options: "i" } },
      //       ],
      //     }
      //   : {};
      // const getPage = req.query.page ? parseInt(req.query.page) : 1;
      // const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      // const dropItem = (getPage - 1) * itemPerPage;
      const books = await Library.findById(req.params.lid)
        .populate({
          path: "books",
          match: {
            $or: [
              {
                bookName: { $regex: req.query.search, $options: "i" },
              },
              {
                author: { $regex: req.query.search, $options: "i" },
              },
              {
                publication: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        })
        .select("_id")
        // .limit(itemPerPage)
        // .skip(dropItem)
        .lean()
        .exec();
      if (!books.books.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          books: books.books,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchLibraryBookIssue = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      // const search = req.query.search
      //   ? {
      //       $or: [
      //         { insName: { $regex: req.query.search, $options: "i" } },
      //         { name: { $regex: req.query.search, $options: "i" } },
      //       ],
      //     }
      //   : {};
      // const getPage = req.query.page ? parseInt(req.query.page) : 1;
      // const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      // const dropItem = (getPage - 1) * itemPerPage;
      const issueBooks = await Library.findById(req.params.lid)
        .populate({
          path: "issues",
          populate: {
            path: "book",
            match: {
              $or: [
                {
                  bookName: { $regex: req.query.search, $options: "i" },
                },
                {
                  author: { $regex: req.query.search, $options: "i" },
                },
              ],
            },
            select: "bookName author photoId photo",
          },
          select: "",
        })
        .populate({
          path: "issues",
          populate: {
            path: "member",
            match: {
              $or: [
                {
                  studentFirstName: { $regex: req.query.search, $options: "i" },
                },
                {
                  studentMiddleName: {
                    $regex: req.query.search,
                    $options: "i",
                  },
                },
                {
                  studentLastName: { $regex: req.query.search, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
          },
          select: "_id",
        })
        .select("_id")
        // .limit(itemPerPage)
        // .skip(dropItem)
        .lean()
        .exec();
      console.log(issueBooks);
      if (!issueBooks.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          issueBooks,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchLibraryBookCollect = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      // const search = req.query.search
      //   ? {
      //       $or: [
      //         { insName: { $regex: req.query.search, $options: "i" } },
      //         { name: { $regex: req.query.search, $options: "i" } },
      //       ],
      //     }
      //   : {};
      // const getPage = req.query.page ? parseInt(req.query.page) : 1;
      // const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      // const dropItem = (getPage - 1) * itemPerPage;
      const collectBooks = await Library.findById(req.params.lid)
        .populate({
          path: "collects",
          populate: {
            path: "book",
            match: {
              $or: [
                {
                  bookName: { $regex: req.query.search, $options: "i" },
                },
                {
                  author: { $regex: req.query.search, $options: "i" },
                },
              ],
            },
            select: "bookName author photoId photo",
          },
          populate: {
            path: "member",
            match: {
              $or: [
                {
                  studentFirstName: { $regex: req.query.search, $options: "i" },
                },
                {
                  studentMiddleName: {
                    $regex: req.query.search,
                    $options: "i",
                  },
                },
                {
                  studentLastName: { $regex: req.query.search, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
          },
          select: "_id",
        })
        .select("_id")
        // .limit(itemPerPage)
        // .skip(dropItem)
        .lean()
        .exec();
      if (!collectBooks.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          collectBooks,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchLibraryBookMember = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      // const search = req.query.search
      //   ? {
      //       $or: [
      //         { insName: { $regex: req.query.search, $options: "i" } },
      //         { name: { $regex: req.query.search, $options: "i" } },
      //       ],
      //     }
      //   : {};
      // const getPage = req.query.page ? parseInt(req.query.page) : 1;
      // const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      // const dropItem = (getPage - 1) * itemPerPage;
      const memberBooks = await Library.findById(req.params.lid)
        .populate({
          path: "members",
          match: {
            $or: [
              {
                studentFirstName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentMiddleName: {
                  $regex: req.query.search,
                  $options: "i",
                },
              },
              {
                studentLastName: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
        })
        .select("_id")
        // .limit(itemPerPage)
        // .skip(dropItem)
        .lean()
        .exec();

      if (!memberBooks.members.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          institute: { ApproveStudent: memberBooks.members },
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchLibraryBookMember = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      // const search = req.query.search
      //   ? {
      //       $or: [
      //         { insName: { $regex: req.query.search, $options: "i" } },
      //         { name: { $regex: req.query.search, $options: "i" } },
      //       ],
      //     }
      //   : {};
      // const getPage = req.query.page ? parseInt(req.query.page) : 1;
      // const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      // const dropItem = (getPage - 1) * itemPerPage;
      const memberBooks = await Library.findById(req.params.lid)
        .populate({
          path: "members",
          match: {
            $or: [
              {
                studentFirstName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentMiddleName: {
                  $regex: req.query.search,
                  $options: "i",
                },
              },
              {
                studentLastName: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
        })
        .select("_id")
        // .limit(itemPerPage)
        // .skip(dropItem)
        .lean()
        .exec();

      if (!memberBooks.members.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          institute: { ApproveStudent: memberBooks.members },
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};
