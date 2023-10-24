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
        "libraryHead libraryHeadTitle emailId phoneNumber about photoId photo coverId cover bookCount memberCount totalFine collectedFine requestStatus offlineFine onlineFine remainFine"
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
                      publication: { $regex: req.query.search, $options: "i" },
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
      publisher: val?.publisher
      });
      library.books.push(book._id);
      library.bookCount += 1;
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
