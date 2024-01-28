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
const Admin = require("../../models/superAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const Finance = require("../../models/Finance");
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const InternalFees = require("../../models/RazorPay/internalFees");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const BankAccount = require("../../models/Finance/BankAccount");
const { nested_document_limit } = require("../../helper/databaseFunction");
const { randomSixCode } = require("../../Service/close");

const { library_json_to_excel } = require("../../Custom/JSONToExcel");
const moment = require("moment");
const { universal_random_password } = require("../../Custom/universalId");
const Department = require("../../models/Department");

const { generate_qr } = require("../../Utilities/qrGeneration/qr_generation");
const LibraryInOut = require("../../models/Library/LibraryInOut");
const LibraryModerator = require("../../models/Library/LibraryModerator");
const LibraryStocktake = require("../../models/Library/LibraryStocktake");
const LibraryBookRemark = require("../../models/Library/LibraryBookRemark");
//for Institute side Activate library
exports.activateLibrary = async (req, res) => {
  try {
    if (!req.params.id) throw "Please send institute id to perform task";
    const { sid } = req.body;
    var institute = await InstituteAdmin.findById(req.params.id);
    var library = new Library({
      institute: institute._id,
      coverId: "2",
    });
    const codess = universal_random_password();
    library.member_module_unique = `${codess}`;
    if (sid) {
      var staff = await Staff.findById(sid);
      var user = await User.findById({ _id: `${staff?.user}` });
      var notify = new Notification({});
      library.libraryHead = staff?._id;
      staff.library.push(library._id);
      staff.recentDesignation = "Library Head";
      staff.staffDesignationCount += 1;
      staff.designation_array.push({
        role: "Library Head",
        role_id: library?._id,
      });
      notify.notifyContent = `you got the designation of as Library Head`;
      notify.notifySender = institute._id;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify._id);
      notify.notifyCategory = "Library Designation";
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
        user.save(),
        notify.save(),
        library.save(),
      ]);
      designation_alarm(
        user?.userPhoneNumber,
        "LIBRARY",
        institute?.sms_lang,
        "",
        "",
        ""
      );
      if (user?.userEmail) {
        email_sms_designation_alarm(
          user?.userEmail,
          "LIBRARY",
          institute?.sms_lang,
          "",
          "",
          ""
        );
      }
    } else {
      library.libraryHead = null;
    }
    institute.libraryActivate = "Enable";
    institute.library.push(library._id);
    await Promise.all([library.save(), institute.save()]);
    res.status(201).send({ message: "Library Head is assign", status: true });

    let library_qr = {
      libraryId: library?._id,
      instituteId: institute?._id,
    };
    let imageKey = await generate_qr({
      fileName: "initial-library-qr",
      object_contain: library_qr,
    });
    library.qr_code = imageKey;
    await library.save();
  } catch (e) {
    console.log(e);
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
        "libraryHead libraryHeadTitle emailId phoneNumber about photoId photo coverId cover bookCount memberCount totalFine collectedFine requestStatus offlineFine onlineFine remainFine qr_code"
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
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      if (req.query?.flow === "ISSUE_BOOK") {
        const library = await Library.findById(req.params.lid)
          .populate({
            path: "books",
            match: {
              $and: [
                {
                  $or: [
                    {
                      bookName: { $regex: req.query.search, $options: "i" },
                    },
                    {
                      author: { $regex: req.query.search, $options: "i" },
                    },
                    {
                      subject: { $regex: req.query.search, $options: "i" },
                    },
                    {
                      accession_number: {
                        $regex: req.query.search,
                        $options: "i",
                      },
                    },
                  ],
                },
                {
                  bookStatus: "Offline",
                },
                {
                  leftCopies: { $gt: 0 },
                },
              ],
            },
            select:
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher",
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
            match: {
              $or: [
                {
                  bookName: { $regex: req.query.search, $options: "i" },
                },
                {
                  author: { $regex: req.query.search, $options: "i" },
                },
                {
                  subject: { $regex: req.query.search, $options: "i" },
                },
                {
                  accession_number: { $regex: req.query.search, $options: "i" },
                },
              ],
            },
            select:
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher",
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
      }
    } else {
      if (req.query?.flow === "ISSUE_BOOK") {
        const library = await Library.findById(req.params.lid)
          .populate({
            path: "books",
            match: {
              $and: [
                {
                  bookStatus: "Offline",
                },
                {
                  leftCopies: { $gt: 0 },
                },
              ],
            },
            select:
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher",
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
      } else {
        const library = await Library.findById(req.params.lid)
          .populate({
            path: "books",
            select:
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher",
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
    }
  } catch (e) {
    console.log(e);
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

    let book_qr = {
      libraryId: library?._id,
      instituteId: library?.institute,
      bookId: book?._id,
    };
    let imageKey = await generate_qr({
      fileName: "initial-book-qr",
      object_contain: book_qr,
    });
    book.book_qr_code = imageKey;
    await book.save();
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
      // .select(
      //   "bookName bookStatus author publication language totalPage price leftCopies totalCopies shellNumber description attachment.documentKey attachment.documentType attachment.documentName photoId photo"
      // )
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
    if (req.body?.totalCopies > book.totalCopies) {
      let num = req.body?.totalCopies - book.totalCopies;
      book.leftCopies += num;
    } else {
      let num = book.totalCopies - req.body?.totalCopies;
      book.leftCopies -= num;
    }
    book.totalCopies = req.body?.totalCopies;
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
    const { memberId, bookId, flow } = req.body;
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
      issue_as: flow === "QR" ? "QR" : "Normal",
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
        select: "book member staff_member createdAt",
        skip: dropItem,
        limit: itemPerPage,
      })
      .populate({
        path: "issued",
        populate: {
          path: "member staff_member",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        },
        select: "book member staff_member createdAt",
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
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const library = await Library.findById(issue.library);
    const institute = await InstituteAdmin.findById({
      _id: `${library?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const book = await Book.findById(issue.book);
    const student = await Student.findById(issue.member);
    const user = await User.findById({ _id: `${student?.user}` });
    const price = parseInt(req.body?.fineCharge);
    const collect = new CollectBook({
      member: issue.member,
      book: issue.book,
      library: library._id,
      chargeBy: req.body?.chargeBy || "",
      fineCharge: price || 0,
      paymentType: req.body?.paymentType,
      issuedDate: issue.createdAt,
      collect_as: req.body?.flow === "QR" ? "QR" : "Normal",
    });
    student?.borrow?.pull(issue._id);
    student?.deposite?.push(collect._id);
    library?.issued?.pull(issue._id);
    library?.collected?.push(collect._id);
    if (req.body?.paymentType === "Offline") {
      var order = new OrderPayment({});
      const new_receipt = new FeeReceipt({});
      new_receipt.receipt_generated_from = "BY_LIBRARIAN";
      order.payment_module_type = "Library Fine";
      order.payment_to_end_user_id = institute?._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = library._id;
      order.payment_amount = parseInt(price);
      order.payment_status = "Captured";
      order.payment_flag_to = "Credit";
      order.payment_flag_by = "Debit";
      order.payment_mode = req.body?.paymentType;
      order.payment_admission = library._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      institute.invoice_count += 1;
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute.invoice_count}`;
      order.payment_invoice_number = new_receipt?.invoice_count;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      new_receipt.fee_payment_mode = "By Cash";
      new_receipt.fee_payment_amount = price;
      new_receipt.student = student?._id;
      new_receipt.finance = finance?._id;
      new_receipt.fee_transaction_date = new Date();
      order.fee_receipt = new_receipt?._id;
      library.offlineFine += price;
      library.collectedFine += price;
      library.totalFine += price;
      library.paid_fee.push({
        student: student?._id,
        book: book?._id,
        fee_receipt: new_receipt?._id,
        fine_charge: price,
        fine_type: `${req.body?.chargeBy}`,
        status: "Paid",
      });

      await Promise.all([order.save(), new_receipt.save()]);
    }
    if (book.bookStatus === "Offline") book.leftCopies += 1;

    if (req.body?.chargeBy === "Damaged" || req.body?.chargeBy === "Lost") {
      library.charge_history.push(collect?._id);
      if (req.body?.paymentType === "Offline") {
        // library.exemptFine +=req.body?.exemptFine
      } else {
        // library.onlineFine += price;
        // finance.financeTotalBalance += price;
        // finance.financeBankBalance += price;
        var new_internal = new InternalFees({});
        new_internal.internal_fee_type = "Library Fees";
        new_internal.internal_fee_amount = price;
        new_internal.library = library?._id;
        new_internal.internal_fee_reason = `${req.body?.chargeBy} Book Fine`;
        new_internal.student = student?._id;
        new_internal.book = book?._id;
        student.studentRemainingFeeCount += price;
        student.internal_fees_query.push(new_internal?._id);
        library.pending_fee.push({
          student: student?._id,
          book: book?._id,
          fine_charge: price,
          fine_type: `${req.body?.chargeBy}`,
        });
        student.libraryFineRemainCount += price;
        library.remainFine += price;
        await new_internal.save();
      }
    }
    await Promise.all([
      collect.save(),
      issue.save(),
      student.save(),
      book.save(),
      library.save(),
      user.save(),
      institute.save(),
      s_admin.save(),
      finance.save(),
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
          path: "book member",
          select:
            "bookName photoId photo studentFirstName studentMiddleName studentLastName studentGRNO studentROLLNO valid_full_name photoId studentProfilePhoto",
        },
        select: "book createdAt issuedDate fineCharge",
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
          select: "bookName author createdAt language photo photoId",
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
          select: "bookName photoId photo createdAt",
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
          path: "member",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO",
        },
        select: "member createdAt chargeBy fineCharge",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select("charge_history")
      .lean()
      .exec();
    res.status(200).send({
      message: "List of all history of payment when collect the books",
      charge_history: library.charge_history,
    });
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};

exports.allOnlineBookLandingPage = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send Library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    if (
      req.query?.search ||
      req.query?.search?.trim() !== "" ||
      req.query?.search !== undefined
    ) {
      const library = await Library.findById(req.params.lid)
        .populate({
          path: "books",
          match: {
            $and: [
              {
                bookStatus: { $eq: "Online" },
              },
              {
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
            ],
          },
          select:
            "bookName photoId photo author language bookStatus publication totalPage totalCopies price shellNumber description attachment",
          // skip: dropItem,
          // limit: itemPerPage,
        })
        .select("books")
        .lean()
        .exec();
      res.status(200).send({
        message: "List of All Books without pagination search",
        books: library.books?.length ? library.books : [],
      });
    } else {
      const library = await Library.findById(req.params.lid)
        .populate({
          path: "books",
          match: {
            $and: [
              {
                bookStatus: { $eq: "Online" },
              },
            ],
          },
          select:
            "bookName photoId photo author language bookStatus publication totalPage totalCopies price shellNumber description attachment",
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
    console.log(e);
  }
};

exports.renderFineChargesQuery = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { lid } = req.params;
    const { flow } = req.query;
    if (!lid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: true,
      });

    var one_lib = await Library.findById({ _id: lid })
      .select("pending_fee paid_fee")
      .populate({
        path: "pending_fee",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO libraryFineRemainCount libraryFinePaidCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        },
      })
      .populate({
        path: "pending_fee",
        populate: {
          path: "book",
        },
      })
      .populate({
        path: "pending_fee",
        populate: {
          path: "fee_receipt",
        },
      })
      .populate({
        path: "paid_fee",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO libraryFineRemainCount libraryFinePaidCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        },
      })
      .populate({
        path: "paid_fee",
        populate: {
          path: "book",
        },
      })
      .populate({
        path: "paid_fee",
        populate: {
          path: "fee_receipt",
        },
      });

    if (`${flow}` === "Remaining") {
      var all_student = nested_document_limit(
        page,
        limit,
        one_lib?.pending_fee
      );

      all_student = all_student?.filter((val) => {
        if (val?.student?.libraryFineRemainCount > 0) return val;
      });
      res.status(200).send({
        message: "Explore All Remaining Fine Charges Student Query",
        access: true,
        all_student: all_student,
      });
    } else if (`${flow}` === "Paid") {
      var all_student = nested_document_limit(page, limit, one_lib?.paid_fee);

      all_student = all_student?.filter((val) => {
        if (val?.student?.libraryFinePaidCount > 0) return val;
      });
      res.status(200).send({
        message: "Explore All Paid Fine Charges Student Query",
        access: true,
        all_student: all_student,
      });
    } else {
      res.status(200).send({
        message: "I Think You Lost In Space",
        access: false,
        all_student: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFineChargesCollectOfflineQuery = async (req, res) => {
  try {
    const { lid, sid, bid } = req.params;
    const { amount, prid } = req.body;
    if (!lid && !sid && !bid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: true,
      });

    var price = parseInt(amount);
    const s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const lib = await Library.findById({ _id: lid });
    const institute = await InstituteAdmin.findById({
      _id: `${lib?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart?.[0]}`,
    });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student?.user}` });
    const book = await Book.findById({ _id: bid });
    const new_receipt = new FeeReceipt({});
    new_receipt.receipt_generated_from = "BY_LIBRARIAN";
    const order = new OrderPayment({});
    order.payment_module_type = "Library Fine";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = lib._id;
    order.payment_amount = parseInt(price);
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = "Offline";
    order.payment_admission = lib._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    new_receipt.fee_payment_mode = "By Cash";
    new_receipt.fee_payment_amount = price;
    new_receipt.student = student?._id;
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    order.fee_receipt = new_receipt?._id;
    for (var val of lib?.pending_fee) {
      if (`${val?._id}` === `${prid}`) {
        lib.paid_fee.push({
          student: student?._id,
          book: book?._id,
          status: "Paid",
          fine_charge: price,
          fine_type: val?.fine_type,
          fee_receipt: new_receipt?._id,
        });
        lib.pending_fee.pull(val?._id);
      }
    }
    var valid_internal = await InternalFees.find({
      $and: [
        { _id: student?.internal_fees_query },
        { book: book?._id },
        { internal_fee_status: "Not Paid" },
      ],
    });
    if (valid_internal?.length > 0) {
      for (var val of valid_internal) {
        val.internal_fee_status = "Paid";
        val.fee_receipt = new_receipt?._id;
        await val.save();
      }
    }
    lib.offlineFine += price;
    lib.collectedFine += price;
    lib.totalFine += price;
    if (lib?.remainFine >= price) {
      lib.remainFine -= price;
    }
    student.libraryFinePaidCount += price;
    if (student?.libraryFineRemainCount >= price) {
      student.libraryFineRemainCount -= price;
    }
    await Promise.all([
      new_receipt.save(),
      s_admin.save(),
      order.save(),
      user.save(),
      institute.save(),
      lib.save(),
      student.save(),
    ]);
    res.status(200).send({
      message: "Explore Collected Fine Charges Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewOfflineBookAutoQuery = async (lid, book_array) => {
  try {
    // if (!lid) {
    var library = await Library.findById(lid);
    for (var val of book_array) {
      const book = new Book({
        bookName: val?.bookName,
        bookStatus: val?.bookStatus,
        author: val?.author,
        language: val?.language,
        totalCopies: val?.totalCopies ? parseInt(val?.totalCopies) : 0,
        price: val?.price ? parseInt(val?.price) : 0,
        description: val?.description,
        shellNumber: val?.shellNumber,
        subject: val?.Subject,
        bill_date: val?.bill_date,
        bill_number: val?.bill_number,
        purchase_order_date: val?.purchase_order_date,
        purchase_order_number: val?.purchase_order_number,
        supplier: val?.supplier,
        publisher_place: val?.publisher_place,
        publication_year: val?.publication_year,
        edition: val?.edition,
        class_number: val?.class_number,
        accession_number: val?.accession_number,
        date: val?.date,
        publisher: val?.publisher,
        totalPage: val?.totalPage,
        depart: val?.depart,
      });
      library.books.push(book._id);
      library.bookCount += 1;
      book.qviple_book_id = `QLB${randomSixCode()}${val?.accession_number}`;
      book.library = lid;
      book.leftCopies = book.totalCopies;
      await book.save();
    }
    await library.save();
    // } else {
    //   console.log("Invalid / Library ID");
    // }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDeleteAllBookQuery = async (req, res) => {
  try {
    const { lid } = req?.params;
    if (!lid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var libs = await Library.findById({ _id: lid });

    var all_books = await Book.find({ library: libs?._id });
    res.status(200).send({
      message: "Explore All Books Deletion Operation Completed Query",
      access: true,
    });

    for (var val of all_books) {
      libs.books.pull(val?._id);
      if (libs?.bookCount > 0) {
        libs.bookCount -= 1;
      }
      await Book.findByIdAndDelete(val?._id);
    }
    await libs.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllBookQuery = async (req, res) => {
  try {
    const { did } = req?.query;
    const depart = await Department.findById({ _id: did });
    const all_book = await Book.find({ accession_number: { $regex: "B-" } });
    var total = 0;
    for (var val of all_book) {
      // total += 1
      // val.qviple_book_id = `QLBD-${total}`
      // val.accession_number = `D-${total}`
      val.department = depart?._id;
      await val.save();
    }
    res.status(200).send({ message: "Explore All Book Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllExcelLibraryQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid)
      .select("export_collection")
      .lean()
      .exec();
    if (library?.export_collection?.length > 0) {
      res.status(200).send({
        message: "ALl Library Export list",
        excel_arr: library?.export_collection,
      });
    } else {
      res.status(200).send({
        message: "ALl Library Export list",
        excel_arr: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.getAllBookExport = async (req, res) => {
  try {
    const { lid } = req.params;
    const { from, to } = req.query;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid)
      .populate({
        path: "books",
        match: {
          date: {
            $gte: from,
            $lte: to,
          },
        },
      })
      .lean()
      .exec();
    res.status(200).send({
      message: "Generating excel all books for library",
    });
    const excel_list = [];
    for (let book of library?.books) {
      excel_list.push({
        "Book Name": book?.bookName ?? "#NA",
        "Book Mode": book?.bookStatus ?? "#NA",
        Author: book?.author ?? "#NA",
        Publication: book?.publication ?? "#NA",
        Language: book?.language ?? "#NA",
        "Total Page": book?.totalPage ?? "#NA",
        Price: book?.price ?? "#NA",
        "Total Copies": book?.totalCopies ?? "#NA",
        "Left Copies": book?.leftCopies ?? "#NA",
        "Shell Number": book?.shellNumber ?? "#NA",
        Description: book?.description ?? "#NA",
        "Created At": book?.createdAt ?? "#NA",
        Subject: book?.subject ?? "#NA",
        "Bill Date": book?.bill_date ?? "#NA",
        "Bill Number": book?.bill_number ?? "#NA",
        "Purchase Order Date": book?.purchase_order_date ?? "#NA",
        "Purchase Order Number": book?.purchase_order_number ?? "#NA",
        Supplier: book?.supplier ?? "#NA",
        "Publisher Place": book?.publisher_place ?? "#NA",
        "Publisher Year": book?.publication_year ?? "#NA",
        Edition: book?.edition ?? "#NA",
        "Class Number": book?.class_number ?? "#NA",
        "Accession Number": book?.accession_number ?? "#NA",
        Date: book?.date ?? "#NA",
        Publisher: book?.publisher ?? "#NA",
        "Qviple Book Id": book?.qviple_book_id ?? "#NA",
      });
    }
    if (excel_list?.length > 0)
      await library_json_to_excel(
        lid,
        excel_list,
        "Books",
        "LIBRARY_BOOK",
        "books"
      );
  } catch (e) {
    console.log(e);
  }
};

exports.getAllIssueExport = async (req, res) => {
  try {
    const { lid } = req.params;
    const { from, to } = req.query;

    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid)
      .populate({
        path: "issued",
        match: {
          createdAt: {
            $gte: from,
            $lte: to,
          },
        },
        populate: {
          path: "book member",
          select:
            "studentGRNO student_prn_enroll_number studentFirstName studentMiddleName studentLastName bookName bookStatus author language accession_number",
        },
        select: "book member createdAt",
      })
      .select("issued")
      .lean()
      .exec();
    res.status(200).send({
      message: "Generating excel all issue books for library",
      library,
    });
    const excel_list = [];
    for (let exc of library?.issued) {
      excel_list.push({
        "Book Name": exc?.book?.bookName ?? "#NA",
        "Book Mode": exc?.book?.bookStatus ?? "#NA",
        Author: exc?.book?.author ?? "#NA",
        Language: exc?.book?.language ?? "#NA",
        "Accession Number": exc?.book?.accession_number ?? "#NA",
        GRNO: exc?.member?.studentGRNO ?? "#NA",
        "Enrollment / Prn Number":
          exc?.member?.student_prn_enroll_number ?? "#NA",
        Name: `${exc?.member?.studentFirstName} ${
          exc?.member?.studentMiddleName
            ? `${exc?.member?.studentMiddleName} `
            : " "
        }${exc?.member?.studentLastName}`,
        "Issue Date": moment(exc?.createdAt).format("DD/MM/YYYY") ?? "#NA",
      });
    }
    if (excel_list?.length > 0)
      await library_json_to_excel(
        lid,
        excel_list,
        "Issued",
        "LIBRARY_ISSUE",
        "issued"
      );
  } catch (e) {
    console.log(e);
  }
};
exports.getAllCollectExport = async (req, res) => {
  try {
    const { lid } = req.params;
    const { from, to } = req.query;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid)
      .populate({
        path: "collected",
        match: {
          createdAt: {
            $gte: from,
            $lte: to,
          },
        },
        populate: {
          path: "book member",
          select:
            "studentGRNO student_prn_enroll_number studentFirstName studentMiddleName studentLastName bookName bookStatus author language accession_number",
        },
        select:
          "book member chargeBy paymentType fineCharge issuedDate createdAt",
      })
      .select("collected")
      .lean()
      .exec();
    res.status(200).send({
      message: "Generating excel all collected books for library",
      library: library.collected,
    });
    const excel_list = [];
    for (let exc of library?.collected) {
      excel_list.push({
        "Book Name": exc?.book?.bookName ?? "#NA",
        "Book Mode": exc?.book?.bookStatus ?? "#NA",
        Author: exc?.book?.author ?? "#NA",
        Language: exc?.book?.language ?? "#NA",
        "Accession Number": exc?.book?.accession_number ?? "#NA",
        GRNO: exc?.member?.studentGRNO ?? "#NA",
        "Enrollment / Prn Number":
          exc?.member?.student_prn_enroll_number ?? "#NA",
        Name: `${exc?.member?.studentFirstName} ${
          exc?.member?.studentMiddleName
            ? `${exc?.member?.studentMiddleName} `
            : " "
        }${exc?.member?.studentLastName}`,
        "Issue Date": moment(exc?.issuedDate).format("DD/MM/YYYY") ?? "#NA",
        "Collect Date": moment(exc?.createdAt).format("DD/MM/YYYY") ?? "#NA",
        "Charge By": exc?.chargeBy ?? "#NA",
        "Payment Type": exc?.paymentType ?? "#NA",
        "Fine Charge": exc?.fineCharge ?? "#NA",
      });
    }
    if (excel_list?.length > 0)
      await library_json_to_excel(
        lid,
        excel_list,
        "Collected",
        "LIBRARY_COLLECT",
        "collected"
      );
  } catch (e) {
    console.log(e);
  }
};
exports.getAllMemberExport = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid)
      .populate({
        path: "members",
        select:
          "studentGRNO student_prn_enroll_number studentFirstName studentMiddleName studentLastName",
      })
      .select("members")
      .lean()
      .exec();
    res.status(200).send({
      message: "Generating excel all members for library",
      library,
    });
    const excel_list = [];
    for (let exc of library?.members) {
      excel_list.push({
        GRNO: exc?.studentGRNO ?? "#NA",
        "Enrollment / Prn Number": exc?.student_prn_enroll_number ?? "#NA",
        Name: `${exc?.studentFirstName} ${
          exc?.studentMiddleName ? `${exc?.studentMiddleName} ` : " "
        }${exc?.studentLastName}`,
      });
    }
    if (excel_list?.length > 0)
      await library_json_to_excel(
        lid,
        excel_list,
        "Members",
        "LIBRARY_MEMBER",
        "members"
      );
  } catch (e) {
    console.log(e);
  }
};

exports.bookIssueByStaffSideQuery = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send library id to perform task";
    const { memberId, bookId, flow } = req.body;
    if (!memberId || !bookId)
      throw "Please send bookId id and memberId to perform task";
    const library = await Library.findById(req.params.lid);
    const staff = await Staff.findById(memberId);
    const book = await Book.findById(bookId);
    if (!book.leftCopies && book.bookStatus === "Offline")
      throw "No copy available for this book 😊";
    if (book.bookStatus === "Offline") book.leftCopies -= 1;
    const issue = new IssueBook({
      staff_member: memberId,
      book: bookId,
      library: library._id,
      issue_as: flow === "QR" ? "QR" : "Normal",
    });
    staff?.borrow?.push(issue._id);
    library?.issued?.push(issue._id);
    if (library?.staff_members?.includes(memberId)) {
    } else {
      library?.staff_members?.push(memberId);
      library.staff_members_count += 1;
    }
    await Promise.all([
      issue.save(),
      staff.save(),
      library.save(),
      book.save(),
    ]);
    res.status(200).send({ message: "staff book is issued 😎😎" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.bookColletedByStaffSideQuery = async (req, res) => {
  try {
    if (!req.params.lid) throw "Please send issued id to perform task";
    const issue = await IssueBook.findById(req.params.lid);
    const library = await Library.findById(issue.library);
    const book = await Book.findById(issue.book);
    const staff = await Staff.findById(issue.staff_member);
    const collect = new CollectBook({
      staff_member: issue.staff_member,
      book: issue.book,
      library: library._id,
      chargeBy: "",
      fineCharge: 0,
      issuedDate: issue.createdAt,
      collect_as: req.body?.flow === "QR" ? "QR" : "Normal",
    });
    staff?.borrow?.pull(issue._id);
    staff?.deposite?.push(collect._id);
    library?.issued?.pull(issue._id);
    library?.collected?.push(collect._id);
    if (book.bookStatus === "Offline") book.leftCopies += 1;
    await Promise.all([
      collect.save(),
      staff.save(),
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

exports.getLibraryQrCode = async (req, res) => {
  try {
    const libd = await Library.findById("651beb5a08e427c667ee2721");
    let library = {
      lid: "651beb5a08e427c667ee2721",
      instituteId: libd.institute,
    };

    let imageKey = await generate_qr({
      fileName: "library",
      object_contain: library,
    });
    libd.qr_code = imageKey;
    await libd.save();
    res
      .status(200)
      .send({ message: "qr geenrated", file: "uploads/library.png", imageKey });
  } catch (e) {
    console.log(e);
  }
};

exports.generateAllMemberQrCodeQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    const { flow } = req.query;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid).populate({
      path: "institute",
      select: "ApproveStaff ApproveStudent",
    });
    res.status(200).send({
      message: "Library qr code generation processing",
      access: true,
    });
    if (flow === "STAFF") {
      for (let sid of library?.institute?.ApproveStaff) {
        const staff = await Staff.findById(sid);
        if (staff) {
          if (staff?.library_qr_code) {
          } else {
            let book_qr = {
              libraryId: library?._id,
              instituteId: library?.institute?._id,
              staffId: sid,
            };
            let imageKey = await generate_qr({
              fileName: "initial-staff-qr",
              object_contain: book_qr,
            });
            staff.library_qr_code = imageKey;
            await staff.save();
          }
        }
      }
    } else {
      for (let sid of library?.institute?.ApproveStudent) {
        const student = await Student.findById(sid);
        if (student) {
          if (student?.library_qr_code) {
          } else {
            let book_qr = {
              libraryId: library?._id,
              instituteId: library?.institute?._id,
              studentId: sid,
            };
            let imageKey = await generate_qr({
              fileName: "initial-student-qr",
              object_contain: book_qr,
            });
            student.library_qr_code = imageKey;
            await student.save();
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
    // res.status(200).send({
    //   message: e,
    // });
  }
};

exports.generateAllBookQrCodeQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid);
    res.status(200).send({
      message: "Library qr code book generation processing",
      access: true,
    });

    for (let bid of library?.books) {
      const book = await Book.findById(bid);
      if (book?.book_qr_code) {
      } else {
        let book_qr = {
          libraryId: library?._id,
          instituteId: library?.institute,
          bookId: book?._id,
        };
        let imageKey = await generate_qr({
          fileName: "initial-book-qr",
          object_contain: book_qr,
        });
        book.book_qr_code = imageKey;
        await book.save();
      }
    }
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getAllBookQrCodeQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid)
      .populate({
        path: "books",
        select: "book_qr_code qviple_book_id bookName",
      })
      .select("books")
      .lean()
      .exec();

    res.status(200).send({
      message: "Library qr code book generation processing",
      access: true,
      book_qr: library?.books ?? [],
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getInOutStudentQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { lid, date } = req.query;
    if (!sid) throw "Please send student id to perform task";
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const inout_g = await LibraryInOut.find({
      $and: [
        {
          student: { $eq: `${sid}` },
        },
        {
          date: { $eq: `${date}` },
        },
      ],
    });
    if (!inout_g?.[0]?._id) {
      const student = await Student.findById(sid);
      const inout = new LibraryInOut({
        student: sid,
        library: lid,
        date: date,
        in_time: moment(currentDate).format("hh:mm:ss a"),
        hour_in_24: moment(currentDate).format("H"),
        minute_in: moment(currentDate).format("m"),
        second_in: moment(currentDate).format("s"),
      });
      student.library_in_out?.push(inout?._id);
      await Promise.all([inout.save(), student.save()]);
    } else {
      if (inout_g?.[0]?._id) {
        const inout = await LibraryInOut.findById(inout_g?.[0]?._id);
        inout.out_time = moment(currentDate).format("hh:mm:ss a");
        inout.hour_out_24 = moment(currentDate).format("H");
        inout.minute_out = moment(currentDate).format("m");
        inout.second_out = moment(currentDate).format("s");
        inout.is_valid = "Yes";
        let x = moment(inout?.created_at);
        let y = moment(currentDate);
        var duration = moment.duration(y.diff(x));
        let hr = duration.get("hours");
        let mit = duration.get("minutes");
        let sec = duration.get("seconds");
        inout.total_spent_time = `${hr}:${mit}:${sec}`;
        await inout.save();
      }
    }
    res.status(200).send({
      message: "Library visit history saved.",
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getInOutStudentHistoryQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) throw "Please send student id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const inout = await LibraryInOut.find({
      student: `${sid}`,
    })
      .sort({
        created_at: -1,
      })
      .skip(dropItem)
      .limit(itemPerPage)
      .lean()
      .exec();

    res.status(200).send({
      message: "Library visit history list.",
      history: inout ?? [],
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getInOutStaffQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { inId, lid } = req.query;
    if (!sid) throw "Please send student id to perform task";
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    if (!inId) {
      const staff = await Staff.findById(sid);
      const inout = new LibraryInOut({
        staff: sid,
        library: lid,
        in_time: moment(currentDate).format("hh:mm:ss a"),
        hour_in_24: moment(currentDate).format("H"),
        minute_in: moment(currentDate).format("m"),
        second_in: moment(currentDate).format("s"),
      });
      staff.library_in_out?.push(inout?._id);
      await Promise.all([inout.save(), staff.save()]);
    } else {
      const inout = await LibraryInOut.findById(inId);
      inout.out_time = moment(currentDate).format("hh:mm:ss a");
      inout.hour_out_24 = moment(currentDate).format("H");
      inout.minute_out = moment(currentDate).format("m");
      inout.second_out = moment(currentDate).format("s");
      inout.is_valid = "Yes";
      await inout.save();
    }
    res.status(200).send({
      message: "Library visit history saved.",
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getInOutStaffHistoryQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) throw "Please send student id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const inout = await LibraryInOut.find({
      staff: `${sid}`,
    })
      .sort({
        created_at: -1,
      })
      .skip(dropItem)
      .limit(itemPerPage)
      .lean()
      .exec();

    res.status(200).send({
      message: "Library visit history list.",
      history: inout ?? [],
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getInOutLibraryHistoryQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const inout = await LibraryInOut.find({
      library: `${lid}`,
    })
      .populate({
        path: "student staff",
        select:
          "studentFirstName studentLastName studentMiddleName studentGRNO studentROLLNO staffFirstName staffLastName staffMiddleName staffROLLNO",
      })
      .sort({
        created_at: -1,
      })
      .skip(dropItem)
      .limit(itemPerPage)
      .lean()
      .exec();

    res.status(200).send({
      message: "Librarian visit history list.",
      history: inout ?? [],
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

// library moderator
exports.getLibraryModeratorList = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const moderator = await LibraryModerator.find({
      library: `${lid}`,
    })
      .populate({
        path: "access_staff department",
        select:
          "staffFirstName staffLastName staffMiddleName staffROLLNO dName",
      })
      .sort({
        created_at: -1,
      })
      .skip(dropItem)
      .limit(itemPerPage)
      .select("access_role created_at")
      .lean()
      .exec();

    res.status(200).send({
      message: "Librarian moderator list.",
      moderator: moderator ?? [],
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};
exports.getLibraryCreateModerator = async (req, res) => {
  try {
    const { lid } = req.params;
    const { mod_role, sid, depart } = req.body;
    if (!lid && !sid && !mod_role)
      throw "Please send library id and staff id to perform task";
    const library = await Library.findById(lid);
    const institute = await InstituteAdmin.findById({
      _id: `${library?.institute}`,
    });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff?.user}` });
    const notify = new Notification({});
    const new_mod = new LibraryModerator({
      access_role: mod_role,
      access_staff: sid,
      library: lid,
      institute: library?.institute,
      department: depart ?? [],
    });
    library.moderator?.push(new_mod?._id);
    library.moderator_count += 1;

    staff.libraryModeratorDepartment.push(new_mod?._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = `Library Manager Moderator - ${mod_role}`;
    staff.designation_array.push({
      role: "Library Manager Moderator",
      role_id: new_mod?._id,
    });
    notify.notifyContent = `you got the designation of Library Manager Moderator for ${mod_role} 🎉🎉`;
    notify.notifySender = institute?._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Library Moderator Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyPid = "1";
    notify.notifyByInsPhoto = institute._id;
    await invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      new_mod.save(),
      staff.save(),
      library.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Library Moderator Staff",
      library: library._id,
      access: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "LIBRARY_MODERATOR",
      institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};
exports.getLibraryUpdateModerator = async (req, res) => {
  try {
    const { lid } = req.params;
    const { role, sid, depart } = req.body;
    if (!lid && !sid && !role)
      throw "Please send library id and staff id to perform task";
    const library = await Library.findById(lid).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const one_moderator = await LibraryModerator.findById({
      _id: lid,
    });
    one_moderator.access_role = role;
    one_moderator.department = depart ?? [];

    if (sid !== `${one_moderator?.access_staff}`) {
      var one_staff = await Staff.findById({
        _id: `${one_moderator?.access_staff}`,
      });
      one_staff.libraryModeratorDepartment.pull(one_moderator?._id);
      one_staff.recentDesignation = "";
      if (one_staff?.staffDesignationCount > 0) {
        one_staff.staffDesignationCount -= 1;
      }
      await one_staff.save();

      var new_staff = await Staff.findById({ _id: sid });
      new_staff.libraryModeratorDepartment.push(one_moderator?._id);
      new_staff.recentDesignation = `Library Manager Moderator - ${one_moderator?.access_role}`;
      new_staff.staffDesignationCount += 1;
      one_moderator.access_staff = new_staff?._id;
      const notify = new Notification({});
      var user = await User.findById({ _id: `${new_staff?.user}` });
      notify.notifyContent = `you got the designation of Library Manager Moderator 🎉🎉`;
      notify.notifySender = library?._id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Library Moderator Designation";
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = library?.institute?._id;
      await invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        library?.institute?.insName,
        user._id,
        user.deviceToken
      );
      designation_alarm(
        user?.userPhoneNumber,
        "LIBRARY_MODERATOR",
        library?.institute?.sms_lang,
        "",
        "",
        ""
      );
      await Promise.all([new_staff.save(), user.save(), notify.save()]);
    }
    await one_moderator.save();
    res.status(200).send({ message: "Explore Update Role", access: true });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};
exports.getLibraryRemoveModerator = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const one_moderator = await LibraryModerator.findById({ _id: lid });
    const library = await Library.findById(one_moderator?.library);
    const one_staff = await Staff.findById({
      _id: `${one_moderator?.access_staff}`,
    });
    library.moderator.pull(lid);
    one_staff.libraryModeratorDepartment.pull(lid);
    if (library.moderator_count > 0) {
      library.moderator_count -= 1;
    }
    if (one_staff.staffDesignationCount > 0) {
      one_staff.staffDesignationCount -= 1;
    }
    one_staff.recentDesignation = "";
    await Promise.all([one_staff.save(), library.save()]);
    await LibraryModerator.findByIdAndDelete(lid);
    res.status(200).send({
      message: "Deletion Operation Completed 👍",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

// for stocktake
exports.getStocktakeLibraryHistoryQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const stocktake = await LibraryStocktake.find({
      library: `${lid}`,
    })
      .sort({
        created_at: -1,
      })
      .skip(dropItem)
      .limit(itemPerPage)
      .select(
        "created_at book_isssue_count library book_lost_count book_at_library_count book_missing_count"
      )
      .lean()
      .exec();

    res.status(200).send({
      message: "Librarian stocktake history list.",
      stocktake: stocktake ?? [],
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getStocktakeBookHistoryQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    const { flow } = req.query;
    // flow:  "book_isssue"|| "book_lost" ||"book_at_library" || "book_missing"
    if (!stid && !flow) throw "Please send library id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    var stocktake = [];
    if (flow === "book_missing") {
      stocktake = await LibraryStocktake.findById(stid)
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "book_missing",
          populate: {
            path: "book",
            select:
              "bookName author bookStatus language qviple_book_id book_qr_code",
          },
        })
        .lean()
        .exec();
    } else {
      stocktake = await LibraryStocktake.findById(stid)
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: `${flow}`,
          select:
            "bookName author bookStatus language qviple_book_id book_qr_code",
        })
        .lean()
        .exec();
    }

    res.status(200).send({
      message: "Librarian stocktake history list.",
      stocktake_list: stocktake[flow] ?? [],
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getStocktakeLibraryUpdateRecordQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    const { bookIds } = req.body;
    if (!lid && bookIds?.length <= 0)
      throw "Please send library id to perform task";
    const library = await Library.findById(lid);
    const stocktake = new LibraryStocktake({
      library: lid,
      book_at_library_count: bookIds?.length,
      book_at_library: bookIds,
    });

    library.stocktake_count += 1;
    library.stocktake?.push(stocktake?._id);
    await Promise.all([stocktake.save(), library.save()]);
    res.status(200).send({
      message: "Librarian stocktake added successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

// for book remark
exports.getLibraryBookRemarkListQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    if (!bid) throw "Please send book id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const book = await Book.findById(bid);
    const remark = await LibraryBookRemark.find({
      _id: { $in: book?.book_remark },
    })
      .populate({
        path: "student",
        select:
          "studentFirstName studentLastName studentMiddleName studentGRNO studentProfilePhotot photoId",
      })
      .sort({
        created_at: -1,
      })
      .skip(dropItem)
      .limit(itemPerPage)
      .select("title description rating created_at student")
      .lean()
      .exec();

    res.status(200).send({
      message: "Book remark list",
      stocktake: remark ?? [],
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getLibraryUpdateBookRemarkQuery = async (req, res) => {
  s;
  try {
    const { bid } = req.params;
    const { title, description, rating, sid } = req.body;
    if (!bid && !sid)
      throw "Please send book id and student id to perform task";

    const prev_remark = await LibraryBookRemark.findOne({
      $and: [
        {
          book: { $eq: `${bid}` },
        },
        {
          student: { $eq: `${sid}` },
        },
      ],
    });
    if (prev_remark?._id) {
      await LibraryBookRemark.findByIdAndUpdate(prev_remark?._id, req.body);
      res.status(200).send({
        message: "Book Remark updated successfully.",
        access: true,
      });
    } else {
      const book = await Book.findById(bid);
      const remark = new LibraryBookRemark({
        title: title ?? "",
        description: description ?? "",
        rating: rating ?? "",
        book: book?._id,
        library: book?.library,
        student: sid,
      });
      book.book_remark?.push(remark?._id);
      book.book_remark_count += 1;
      await Promise.all([remark.save(), book.save()]);
      res.status(200).send({
        message: "Book Remark added successfully.",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getLibraryRemoveBookRemarkQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    const { sid } = req.query;
    if (!bid && !sid)
      throw "Please send book id and student id to perform task";

    const prev_remark = await LibraryBookRemark.findOne({
      $and: [
        {
          book: { $eq: `${bid}` },
        },
        {
          student: { $eq: `${sid}` },
        },
      ],
    });
    const book = await Book.findById(bid);
    if (book.book_remark_count > 0) {
      book.book_remark_count -= 1;
    }
    book.book_remark?.pull(prev_remark?._id);
    await book.save();
    await LibraryBookRemark.findByIdAndDelete(prev_remark?._id);
    res.status(200).send({
      message: "Book Remark deleted successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};
