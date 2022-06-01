const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Library = require("../../models/Library");
const Book = require("../../models/Book");
const Issue = require("../../models/Issue");
const Collect = require("../../models/Collect");
const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const { deleteFile, uploadFile } = require("../../S3Configuration");
// http://localhost:8080/ins-login
// {
//   "insPassword":"Hello12@#",
//   "insUserName":"rajeev11"
// }
// s%3AasNphQmPHDLB0TKO2Z7IIGqbZwwMe_9-.5VArJMyHDDf5mbm72SOLXXQURQC%2BoFvRDke%2FD%2BWZJ%2Bo
exports.getInstituteLibrary = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate(
      "library"
    );
    res.status(200).send({ message: "data is fetched", institute });
  } catch (err) {
    console.log(err.message);
  }
};

exports.postInstituteLibrary = async (req, res) => {
  try {
    const insId = req.params.id;
    const { sid } = req.body;
    const institute = await InstituteAdmin.findById({ _id: insId });
    const staff = await Staff.findById({ _id: sid });
    const library = new Library({
      libraryHead: sid,
      institute: insId,
      photoId: "1",
      coverId: "2",
    });
    institute.libraryActivate = "Activated";
    institute.library = library._id;
    staff.library.push(library._id);
    await Promise.all([institute.save(), staff.save(), library.save()]);
    res.status(201).send({ message: "Library Head is assign" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.getInstituteLibraryInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const library = await Library.findById({
      _id: institute.library,
    })
      .populate({ path: "libraryHead" })
      .populate({ path: "books" })
      .lean()
      .exec();
    res.status(200).send({ message: "Library info fetched", library });
  } catch (err) {
    console.log(err.message);
  }
};
exports.getLibraryAllBook = async (req, res) => {
  try {
    const library = await Book.find({});
    res.status(200).send({ message: "fetched", library });
  } catch (err) {
    console.log(err.message);
  }
};
exports.getLibraryAll = async (req, res) => {
  try {
    const { lid } = req.params;
    const library = await Library.findById({ _id: lid })
      .populate({
        path: "members",
      })
      .populate({
        path: "books",
      })
      .populate({
        path: "issues",
        populate: {
          path: "book",
        },
      })
      .populate({
        path: "issues",
        populate: {
          path: "member",
        },
      })
      .populate({
        path: "collects",
        populate: {
          path: "book",
        },
      })
      .populate({
        path: "collects",
        populate: {
          path: "member",
        },
      })
      .populate({
        path: "institute",
        populate: {
          path: "ApproveStudent",
        },
      });
    res
      .status(200)
      .send({ message: "Library is successfully is fetched", library });
  } catch (err) {
    console.log(err.message);
  }
};
exports.postLibraryAbout = async (req, res) => {
  try {
    const { lid } = req.params;
    const { emailId, phoneNumber, about } = req.body;
    console.log(req.body);
    const library = await Library.findById({
      _id: lid,
    });
    library.emailId = emailId;
    library.phoneNumber = phoneNumber;
    library.about = about;
    await library.save();
    res.status(200).send({ message: "Library is successfully is updated" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.postLibraryCreateBook = async (req, res) => {
  try {
    const { lid } = req.params;
    const file = req.file;
    const width = 150;
    const height = 150;
    const results = await uploadFile(file, width, height);
    const book = new Book(req.body);
    const library = await Library.findById({ _id: lid });
    library.books.push(book._id);
    book.library = lid;
    book.photo = results.key;
    book.photoId = "0";
    await library.save();
    await book.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "book is created" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.getLibraryOneBook = async (req, res) => {
  try {
    const { bid } = req.params;
    const book = await Book.findById({ _id: bid });
    res.status(200).send({ message: "fetched", book });
  } catch (err) {
    console.log(err.message);
  }
};
exports.patchLibraryOneBook = async (req, res) => {
  try {
    const { bid } = req.params;
    const book = await Book.findByIdAndUpdate(bid, req.body);
    await book.save();
    res.status(201).send({ message: "book is updated updated" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.putLibraryOneBook = async (req, res) => {
  try {
    const { bid } = req.params;
    const {
      bookName,
      author,
      totalPage,
      language,
      publication,
      price,
      totalCopies,
      shellNumber,
    } = req.body;
    const file = req.file;
    const width = 150;
    const height = 150;
    const book = await Book.findById({ _id: bid });
    if (book.photo) {
      await deleteFile(book.photo);
    }
    const results = await uploadFile(file, width, height);
    book.photo = results.key;
    book.bookName = bookName;
    book.author = author;
    book.totalPage = totalPage;
    book.language = language;
    book.publication = publication;
    book.totalCopies = totalCopies;
    book.shellNumber = shellNumber;
    book.price = price;
    await book.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "book is updated" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.deleteLibraryOneBook = async (req, res) => {
  try {
    const { bid } = req.params;
    const book = await Book.findById({ _id: bid });
    if (book.totalCopies > 0) {
      book.totalCopies = book.totalCopies - 1;
      await book.save();
    }
    res.status(200).send({ message: "book is deleted" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.postLibraryBookIssue = async (req, res) => {
  try {
    const { lid } = req.params;
    const { member, book } = req.body;
    // console.log(req.body);
    const library = await Library.findById({ _id: lid });
    const student = await Student.findById({ _id: member });
    const bookData = await Book.findById({ _id: book });
    const issue = new Issue(req.body);
    student.borrow.push(issue._id);
    library.issues.push(issue._id);
    library.members.push(member);
    issue.library = lid;
    bookData.totalCopies = bookData.totalCopies - 1;
    await student.save();
    await library.save();
    await issue.save();
    await bookData.save();
    res.status(200).send({ message: "book is issued" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.postLibraryBookCollect = async (req, res) => {
  try {
    const { lid, cid } = req.params;
    const issue = await Issue.findById({ _id: cid });
    const library = await Library.findById({ _id: lid });
    const book = await Book.findById({ _id: issue.book });
    const collect = new Collect({
      book: issue.book,
      member: issue.member,
      library: issue.library,
    });
    const student = await Student.findById({ _id: issue.member });
    student.deposite.push(collect._id);
    student.borrow.pull(cid);
    library.issues.pull(cid);
    library.collects.push(collect._id);
    collect.library = lid;
    book.totalCopies = book.totalCopies + 1;
    await book.save();
    await student.save();
    await library.save();
    await collect.save();
    res.status(200).send({ message: "book is collected" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getLibraryUserBorrow = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id }).populate({
      path: "student",
    });
    res.status(200).send({ user });
  } catch (err) {
    console.log(err.message);
  }
};
exports.getLibraryStudentBorrow = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById({ _id: id })
      .populate({
        path: "borrow",
        populate: {
          path: "book",
        },
      })
      .populate({
        path: "deposite",
        populate: {
          path: "book",
        },
      });
    res.status(200).send({ student });
  } catch (err) {
    console.log(err.message);
  }
};
