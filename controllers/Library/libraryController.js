const Library = require("../../models/Library/Library");
const Book = require("../../models/Library/Book");
const IssueBook = require("../../models/Library/IssueBook");
const CollectBook = require("../../models/Library/CollectBook");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const Notification = require("../../models/notification");

//for Institute side Activate library
exports.activateLibrary = async (req, res) => {
  try {
    if (!req.params.id) throw "Please send institute id to perform task";
    const { sid } = req.body;
    if (!sid) throw "Please send staff id to activate library head";
    const institute = await InstituteAdmin.findById(req.params.id);
    const staff = await Staff.findById(sid);
    const user = await User.findById({ _id: `${staff?.user}` });
    const notify = new Notification({});
    const library = new Library({
      libraryHead: sid,
      institute: institute._id,
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
      library.save(),
      institute.save(),
      staff.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(201).send({ message: "Library Head is assign" });
  } catch (e) {
    res.status(200).send({
      message: e.message,
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
      message: e.message,
    });
  }
};

// exports.libraryAbout = async (req, res) => {
//   try {
//     if (!req.params.lid) throw "Please send Library id to perform task";
//     await Library.findByIdAndUpdate(req.params.lid, req.body);
//     res.status(200).send({ message: "Library edited successfully👍" });
//   } catch (e) {
//     res.status(200).send({
//       message: e,
//     });
//   }
// };
exports.allBookByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send Library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    if (
      req.query.search ||
      req.query.search.trim() !== "" ||
      req.query.search !== undefined
    ) {
      const library = await Library.findById(req.params.lid)
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
          select: "bookName photoId photo author language bookStatus",
          skip: dropItem,
          limit: itemPerPage,
        })
        .select("books")
        .lean()
        .exec();
      res.status(200).send({
        message: "List of All Books with pagination search",
        books: library.books?.length ? library.books : [],
      });
    } else {
      const library = await Library.findById(req.params.lid)
        .populate({
          path: "books",
          select: "bookName photoId photo author language bookStatus",
          skip: dropItem,
          limit: itemPerPage,
        })
        .select("books")
        .lean()
        .exec();
      res.status(200).send({
        message: "List of All Books",
        books: library.books?.length ? library.books : [],
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};

exports.createBookByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send library id to perform task";
    const library = await Library.findById(req.params.lid);
    const book = new Book(req.body);
    library.books.push(book._id);
    library.bookCount += 1;
    book.library = req.params.lid;
    book.leftCopies = book.totalCopies;
    if (req.body?.photo) book.photoId = "0";
    if (req.body?.attachment?.length) book.attachment = req.body?.attachment;
    await Promise.all([book.save(), library.save()]);
    res.status(201).send({ message: "book is created" });
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};

exports.getStaffOneBookDetail = async (req, res) => {
  try {
    if (!req.params.bid) throw "Please send book id to perform task";
    const book = await Book.findById(req.params.bid)
      .select(
        "bookName bookStatus author publication language totalPage price leftCopies totalCopies shellNumber description attachment.documentKey attachment.documentType attachment.documentName photoId photo"
      )
      .lean()
      .exec();
    res.status(200).send({ message: "book all details", book });
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};

exports.editBookByStaffSide = async (req, res) => {
  try {
    if (!req.params.bid) throw "Please send book id to perform task";
    const book = await Book.findById(req.params.bid);
    book.bookName = req.body?.bookName;
    book.bookStatus = req.body?.bookStatus;
    book.author = req.body?.author;
    book.publication = req.body?.publication;
    book.language = req.body?.language;
    book.totalPage = req.body?.totalPage;
    book.price = req.body?.price;
    book.totalCopies = req.body?.totalCopies;
    book.leftCopies = req.body?.leftCopies;
    book.shellNumber = req.body?.shellNumber;
    book.description = req.body?.description;
    if (req.body?.photo) {
      book.photo = req.body?.photo;
      book.photoId = "0";
    } else {
      book.photoId = "1";
    }
    if (req.body.attachment?.length) book.attachment = req.body.attachment;
    await book.save();
    res.status(200).send({ message: "book is updated successfully 😪😪" });
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};

exports.bookIssueByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send library id to perform task";
    const { memberId, bookId } = req.body;
    if (!memberId || !bookId)
      throw "Please send bookId id and memberId to perform task";
    const library = await Library.findById(req.params.lid);
    const student = await Student.findById(memberId);
    const book = await Book.findById(bookId);
    if (!book.leftCopies && book.bookStatus === "Offline")
      throw "No copy available for this book 😊";
    if (book.bookStatus === "Offline") book.leftCopies -= 1;
    const issue = new IssueBook({
      member: memberId,
      book: bookId,
      library: library._id,
    });
    student?.borrow?.push(issue._id);
    library?.issued?.push(issue._id);
    if (library?.members?.includes(memberId)) {
    } else {
      library?.members?.push(memberId);
      library.memberCount += 1;
    }
    await Promise.all([
      issue.save(),
      student.save(),
      library.save(),
      book.save(),
    ]);
    res.status(200).send({ message: "book is issued 😎😎" });
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
        select: "book member createdAt",
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
        select: "book member createdAt",
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
      message: e.message,
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
      chargeBy: req.body?.chargeBy || "",
      fineCharge: req.body?.fineCharge || 0,
      issuedDate: issue.createdAt,
    });
    student?.borrow?.pull(issue._id);
    student?.deposite?.push(collect._id);
    library?.issued?.pull(issue._id);
    library?.collected?.push(collect._id);
    if (book.bookStatus === "Offline") book.leftCopies += 1;
    await Promise.all([
      collect.save(),
      issue.save(),
      student.save(),
      book.save(),
      library.save(),
    ]);
    res.status(201).send({ message: "book collected by librarian 😊😊" });
  } catch (e) {
    res.status(200).send({
      message: e.message,
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
        select: "book createdAt issuedDate",
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
      message: "One collected log books detail",
      collectedDetail: collect,
    });
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};

exports.allMembersByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send Library id to perform task of logs";
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
      message: e.message,
    });
  }
};

exports.oneMemberIssuedByStaffSide = async (req, res) => {
  try {
    if (!req.params.sid)
      throw "Please send Student id to perform task for issued logs";
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
      message: e.message,
    });
  }
};

exports.oneMemberHistoryByStaffSide = async (req, res) => {
  try {
    if (!req.params.sid)
      throw "Please send Student id to perform task for logs history";
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
      message: e.message,
    });
  }
};

exports.allHistoryOfCollectByStaffSide = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const library = await Library.findById(req.params.lid)
      .populate({
        path: "charge_history",
        populate: {
          path: "book",
          select: "bookName author language photoId photo",
        },
        select: "book member createdAt",
        skip: dropItem,
        limit: itemPerPage,
      })
      .populate({
        path: "charge_history",
        populate: {
          path: "member",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO",
        },
        select: "book member createdAt",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select("charge_history")
      .lean()
      .exec();
    res
      .status(200)
      .send({
        message: "List of all history of payment when collect the books",
        charge_history: library.charge_history,
      });
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};
