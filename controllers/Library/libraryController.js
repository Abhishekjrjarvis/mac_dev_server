const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Library = require("../../models/Library/Library");
const Book = require("../../models/Library/Book");
const IssueBook = require("../../models/Library/IssueBook");
const CollectBook = require("../../models/Library/CollectBook");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const {
  deleteFile,
  uploadFile,
  uploadDocFile,
} = require("../../S3Configuration");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const Notification = require("../../models/notification");

//for Institute side Activate library
exports.activateLibrary = async (req, res) => {
  try {
    if (!req.params.id) throw "Please send institute id to perform task";
    const { sid } = req.body;
    const institute = await InstituteAdmin.findById(req.params.id);
    const staff = await Staff.findById(sid);
    const user = await User.findById({ _id: `${staff?.user}` });
    const notify = new Notification({});
    const library = new Library({
      libraryHead: sid,
      institute: institute._id,
      photoId: "1",
      coverId: "2",
    });
    institute.libraryActivate = "Enable";
    institute.library.push(library._id);
    staff.library.push(library._id);
    notify.notifyContent = `you got the designation of as Library Head`;
    notify.notifySender = institute._id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify._id);
    notify.notifyCategory = "Library Designation";
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
      library.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({ message: "Library Head is assign" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

//For Library Head side that is staff side

exports.libraryByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send library id to perform task";
    const library = await Library.findById(req.params.lid)
      .populate({
        path: "libraryHead",
        select:
          "staffProfilePhoto photoId staffFirstName staffMiddleName staffLastName",
      })
      .select(
        "libraryHead libraryHeadTitle emailId phoneNumber about photoId photo coverId cover bookCount memberCount totalFine offlineFine onlineFine"
      )
      .lean()
      .exec();
    res
      .status(200)
      .send({ message: "library profile is data", library: library });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.libraryAbout = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send Library id to perform task";
    await Library.findByIdAndUpdate(req.params.lid, req.body);
    res.status(200).send({ message: "Library edited successfully👍" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.allBookByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send Library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const library = await Library.findById(req.params.lid)
      .populate({
        path: "books",
        select: "bookName photoId photo author language bookStatus",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select("library")
      .lean()
      .exec();
    res
      .status(200)
      .send({ message: "List of All Books", books: library.books });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.createBookByStaffSide = async (req, res) => {
  try {
    const { lid } = req.params
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid);
    const book = new Book(req.body);
    library.books.push(book._id);
    library.bookCount += 1;
    book.library = lid;
    book.leftCopies = book.totalCopies;
    if (req?.files?.length > 0) {
      let count = 0;
      for (file of req?.files) {
        if (count === 0) {
          const width = 150;
          const height = 150;
          const results = await uploadFile(file, width, height);
          book.photo = results.Key;
          book.photoId = "0";
          await unlinkFile(file.path);
        } else {
          const results = await uploadDocFile(file);
          book?.attachment?.push({
            documentType: file.mimetype,
            documentName: file.originalname,
            documentSize: file.size,
            documentKey: results.Key,
            documentEncoding: file.encoding,
          });
          await unlinkFile(file.path);
        }
        ++count;
      }
    }
    await Promise.all([book.save(), library.save()]);
    res.status(201).send({ message: "book is created" });
  } catch (e) {
    console.log(e)
  }
};

exports.getStaffOneBookDetail = async (req, res) => {
  try {
    if (!req.params.bid) throw "Please send book id to perform task";
    const book = await Book.findById(req.params.bid)
      .select(
        "bookName bookStatus author publication language totalPage price leftCopies totalCopies shellNumber description attachment photoId photo"
      )
      // .skip(dropItem).limit(itemPerPage)
      .lean()
      .exec();
    res.status(200).send({ message: "book all details", book });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.editBookByStaffSide = async (req, res) => {
  try {
    if (!req.params.bid) throw "Please send book id to perform task";
    await Book.findByIdAndUpdate(req.params.bid, req.body);
    const book = await Book.findById(req.params.bid);
    if (req?.files) {
      let count = 0;
      for (file of req?.files) {
        if (count === 0 && req.body?.photoUpdate) {
          const width = 150;
          const height = 150;
          await deleteFile(book.photo);
          const results = await uploadFile(file, width, height);
          book.photo = results.Key;
          book.photoId = "0";
          await unlinkFile(file.path);
        } else {
          //for loop atachment some logic left
          // if (req.body?.deleteImage?.length) {
          //   for (let dimage of req.body?.deleteImage) {
          //     await deleteFile(dimage);
          //     book?.attachment?.pull(dimage);
          //   }
          // }
          const results = await uploadDocFile(file);
          book?.attachment?.push({
            documentType: file.mimetype,
            documentName: file.originalname,
            documentSize: file.size,
            documentKey: results.Key,
            documentEncoding: file.encoding,
          });
          await unlinkFile(file.path);
        }
        ++count;
      }
    }
    await Promise.all([book.save(), library.save()]);
    res.status(201).send({ message: "book is created" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.bookIssueByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send library id to perform task";
    const { member, book } = req.body;
    const library = await Library.findById(req.params.lid);
    const student = await Student.findById(member);
    const bookData = await Book.findById(book);
    if (!bookData.leftCopies) throw "Not copy available of this book";
    const issue = new IssueBook({
      member: member,
      book: book,
      library: library._id,
      // bookName: bookData.bookName,
      // author: bookData.author,
      // language: bookData.language,
      // photoId: bookData.photoId,
      // photo: bookData.photo,
    });
    student?.borrow?.push(issue._id);
    library?.issued?.push(issue._id);
    if (library?.members?.includes(member)) {
    } else {
      library?.members?.push(member);
      library.memberCount += 1;
    }
    bookData.leftCopies -= 1;
    await Promise.all([
      issue.save(),
      student.save(),
      library.save(),
      bookData.save(),
    ]);
    res.status(201).send({ message: "book is issued" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.allBookIssueByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const library = await Library.findById(req.params.lid)
      .populate({
        path: "issued",
        populate: {
          path: "book",
          select: "bookName author language photoId photo",
        },
        select: "book member",
        skip: dropItem,
        limit: itemPerPage,
      })
      .populate({
        path: "issued",
        populate: {
          path: "member",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO",
        },
        select: "book member",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select("issued")
      .lean()
      .exec();
    res
      .status(200)
      .send({ message: "List of all issued books", issues: library.issued });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.bookColletedByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send issued id to perform task";
    const issue = await IssueBook.findById(req.params.lid);
    const library = await Library.findById(issue.library);
    const book = await Book.findById(issue.book);
    const student = await Student.findById(issue.member);
    const collect = new CollectBook({
      member: issue.member,
      book: issue.book,
      library: library._id,
      chargeBy: req.body?.chargeBy,
      fineCharge: req.body?.fineCharge,
      issuedDate: issue.createdAt,
    });
    student?.borrow?.pull(issue._id);
    student?.deposite?.push(Book._id);
    library?.issued?.pull(issue._id);
    library?.collected?.push(collect._id);
    book.leftCopies += 1;
    await Promise.all([
      collect.save(),
      issue.save(),
      student.save(),
      library.save(),
      book.save(),
    ]);
    res.status(201).send({ message: "book collected" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.allBookCollectedLogsByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const library = await Library.findById(req.params.lid)
      .populate({
        path: "collected",
        populate: {
          path: "book",
          select: "bookName photoId photo",
        },
        select: "book issuedDate issuedDate",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select("collected")
      .lean()
      .exec();
    res.status(200).send({
      message: "List of all collected log books",
      collected: library.collected,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.oneBookCollectedLogsByStaffSide = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send Colleted logs id to perform task";
    const collect = await CollectBook.findById(req.params.cid)
      .populate({
        path: "book",
        select: "bookName photoId photo author language",
      })
      .populate({
        path: "member",
        select:
          "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO",
      })
      .select("book member issuedDate createdAt")
      .lean()
      .exec();
    res.status(200).send({
      message: "One collected log books",
      collectedDetail: collect,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.allMembersByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send Library logs id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const library = await Library.findById(req.params.lid)
      .populate({
        path: "members",
        select:
          "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select("members")
      .lean()
      .exec();
    res.status(200).send({
      message: "List of all members in Library",
      members: library?.members,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.oneMemberIssuedByStaffSide = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send Student logs id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "borrow",
        populate: {
          path: "book",
          select: "bookName author language photo photoId",
        },
        select: "book",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select(
        "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO borrow"
      )
      .lean()
      .exec();
    res.status(200).send({
      message: "List of all issued book for one member in Library",
      student,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.oneMemberHistoryByStaffSide = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send Student logs id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "deposite",
        populate: {
          path: "book",
          select: "bookName photoId photo",
        },
        select: "book issuedDate createdAt",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select("deposite")
      .lean()
      .exec();
    res.status(200).send({
      message: "List of all history book for one member in Library",
      history: student?.deposite,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};