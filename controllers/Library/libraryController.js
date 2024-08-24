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
    const { mid } = req.query;
    if (mid) {
      const library = await Library.findById(req.params.lid)
        .populate({
          path: "libraryHead",
          select:
            "staffProfilePhoto photoId staffFirstName staffMiddleName staffLastName",
        })
        .populate({
          path: "institute",
          select: "financeDepart admissionDepart",
        })
        .populate({
          path: "moderator",
          match: {
            _id: { $eq: `${mid}` },
          },
        })
        .select(
          "libraryHead institute libraryHeadTitle emailId phoneNumber about photoId photo coverId cover bookCount memberCount totalFine collectedFine requestStatus offlineFine onlineFine remainFine qr_code filter_by timing"
        )
        .lean()
        .exec();

      res
        .status(200)
        .send({ message: "library profile is data", library: library });
    } else {
      const library = await Library.findById(req.params.lid)
        .populate({
          path: "libraryHead",
          select:
            "staffProfilePhoto photoId staffFirstName staffMiddleName staffLastName",
        })
        .populate({
          path: "institute",
          select: "financeDepart admissionDepart",
        })
        .select(
          "libraryHead institute libraryHeadTitle emailId phoneNumber about photoId photo coverId cover bookCount memberCount totalFine collectedFine requestStatus offlineFine onlineFine remainFine qr_code filter_by timing"
        )
        .lean()
        .exec();

      res
        .status(200)
        .send({ message: "library profile is data", library: library });
    }
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
        var library = await Library.findById(req.params.lid);
        if (library?.filter_by?.department?.length > 0) {
          var all_book = await Book.find({
            $and: [
              { _id: { $in: library?.books } },
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
              {
                department: { $in: library?.filter_by?.department },
              },
            ],
          })
            .select(
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher publication"
            )
            .limit(itemPerPage)
            .skip(dropItem);
        } else {
          var all_book = await Book.find({
            $and: [
              { _id: { $in: library?.books } },
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
          })
            .select(
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher publication"
            )
            .limit(itemPerPage)
            .skip(dropItem);
        }
        if (all_book?.length > 0) {
          res.status(200).send({
            message: "List of All Books with pagination search",
            books: all_book?.length ? all_book : [],
          });
        } else {
          res.status(200).send({
            message: "List of All Books with pagination search",
            books: all_book?.length ? all_book : [],
          });
        }
      } else {
        var library = await Library.findById(req.params.lid);

        var all_book = await Book.find({
          $and: [{ _id: { $in: library?.books } }],
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
        })
          .select(
            "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher publication"
          )
          .limit(itemPerPage)
          .skip(dropItem);
        res.status(200).send({
          message: "List of All Books with pagination search",
          books: all_book?.length ? all_book : [],
        });
      }
    } else {
      if (req.query?.flow === "ISSUE_BOOK") {
        var library = await Library.findById(req.params.lid);

        if (library?.filter_by?.department?.length > 0) {
          var all_book = await Book.find({
            $and: [
              { _id: { $in: library?.books } },
              {
                bookStatus: "Offline",
              },
              {
                leftCopies: { $gt: 0 },
              },
              {
                department: { $in: library?.filter_by?.department },
              },
            ],
          })
            .select(
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher publication"
            )
            .limit(itemPerPage)
            .skip(dropItem);
        } else {
          var all_book = await Book.find({
            $and: [
              { _id: { $in: library?.books } },
              {
                bookStatus: "Offline",
              },
              {
                leftCopies: { $gt: 0 },
              },
            ],
          })
            .select(
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher publication"
            )
            .limit(itemPerPage)
            .skip(dropItem);
        }
        if (all_book?.length > 0) {
          res.status(200).send({
            message: "List of All Books",
            books: all_book?.length ? all_book : [],
          });
        } else {
          res.status(200).send({
            message: "List of All Books",
            books: all_book?.length ? all_book : [],
          });
        }
      } else {
        var library = await Library.findById(req.params.lid);

        if (library?.filter_by?.department?.length > 0) {
          var all_book = await Book.find({
            $and: [
              { _id: { $in: library?.books } },
              {
                department: { $in: library?.filter_by?.department },
              },
            ],
          })
            .select(
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher publication"
            )
            .limit(itemPerPage)
            .skip(dropItem);
        } else {
          var all_book = await Book.find({
            $and: [{ _id: { $in: library?.books } }],
          })
            .select(
              "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher publication"
            )
            .limit(itemPerPage)
            .skip(dropItem);
        }
        if (all_book?.length > 0) {
          res.status(200).send({
            message: "List of All Books",
            books: all_book?.length ? all_book : [],
          });
        } else {
          res.status(200).send({
            message: "List of All Books",
            books: all_book?.length ? all_book : [],
          });
        }
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
    // book.leftCopies = book.totalCopies;
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
      .populate({
        path: "department",
        select: "dName",
      })
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
    book.department = req.body?.department ?? null;
    // if (req.body?.totalCopies > book.totalCopies) {
    //   let num = req.body?.totalCopies - book.totalCopies;
    //   book.leftCopies += num;
    // } else {
    //   let num = book.totalCopies - req.body?.totalCopies;
    //   book.leftCopies -= num;
    // }
    // book.totalCopies = req.body?.totalCopies;
    book.shellNumber = req.body?.shellNumber;
    book.description = req.body?.description;
    if (req.body?.photo) {
      book.photo = req.body?.photo;
      book.photoId = "0";
    } else {
      book.photoId = "1";
    }
    if (req.body.attachment?.length) book.attachment = req.body.attachment;

    book.subject = req.body?.subject;
    book.bill_date = req.body?.bill_date;
    book.bill_number = req.body?.bill_number;
    book.purchase_order_date = req.body?.purchase_order_date;
    book.purchase_order_number = req.body?.purchase_order_number;
    book.supplier = req.body?.supplier;
    book.publisher_place = req.body?.publisher_place;
    book.publication_year = req.body?.publication_year;
    book.edition = req.body?.edition;
    book.class_number = req.body?.class_number;
    book.accession_number = req.body?.accession_number;
    book.date = req.body?.date;
    book.publisher = req.body?.publisher;
    // book.qviple_book_id = req.body?.qviple_book_id;
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
    const { memberId, bookId, flow, day_overdue_charge, for_days } = req.body;
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
      day_overdue_charge: day_overdue_charge,
      for_days: for_days,
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
    const library = await Library.findById(req.params.lid);
    var issued = [];
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      var all_book = await Book.find({
        $and: [
          { library: { $eq: library?._id } },
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
        ],
      }).select("_id");
      all_book = all_book?.filter((bt) => bt?._id);

      var all_student = await Student.find({
        $and: [
          { institute: { $eq: library?.institute } },
          {
            $or: [
              {
                studentFirstName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentLastName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentMiddleName: { $regex: req.query.search, $options: "i" },
              },
              {
                valid_full_name: { $regex: req.query.search, $options: "i" },
              },
              {
                studentGRNO: {
                  $regex: req.query.search,
                  $options: "i",
                },
              },
            ],
          },
        ],
      }).select("_id");

      all_student = all_student?.filter((bt) => bt?._id);
      issued = await IssueBook.find({
        $and: [
          {
            _id: { $in: library.issued },
          },
          {
            $or: [
              {
                book: { $in: all_book },
              },
              {
                member: { $in: all_student },
              },
            ],
          },
        ],
      })
        .populate({
          path: "book member staff_member",
          select:
            "bookName author language accession_number photoId photo photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        })
        .select(
          "book member staff_member createdAt day_overdue_charge for_days"
        )
        .sort({
          createdAt: -1,
        });
      res.status(200).send({
        message: "List of all issued books with search",
        issues: issued,
      });
    } else {
      issued = await IssueBook.find({
        _id: { $in: library.issued },
      })
        .populate({
          path: "book member staff_member",
          select:
            "bookName author language accession_number photoId photo photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        })
        .select(
          "book member staff_member createdAt day_overdue_charge for_days"
        )
        .sort({
          createdAt: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .lean()
        .exec();
      res
        .status(200)
        .send({ message: "List of all issued books", issues: issued });
    }
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
      day_overdue_charge: issue?.day_overdue_charge,
      for_days: issue?.for_days,
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
    if (book.bookStatus === "Offline" && req.body?.chargeBy !== "Lost")
      book.leftCopies += 1;

    if (req.body?.chargeBy === "Lost") book.status = "Lost";
    if (
      req.body?.chargeBy === "Damaged" ||
      req.body?.chargeBy === "Lost" ||
      req.body?.chargeBy === "Overdue_Fines"
    ) {
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
        new_internal.internal_fee_reason =
          req.body?.chargeBy === "Overdue_Fines"
            ? `Book Overdue Fines`
            : `${req.body?.chargeBy} Book Fine`;
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
    const library = await Library.findById(req.params.lid);

    var collected = [];
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      var all_book = await Book.find({
        $and: [
          { library: { $eq: library?._id } },
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
        ],
      }).select("_id");
      all_book = all_book?.filter((bt) => bt?._id);

      var all_student = await Student.find({
        $and: [
          { institute: { $eq: library?.institute } },
          {
            $or: [
              {
                studentFirstName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentLastName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentMiddleName: { $regex: req.query.search, $options: "i" },
              },
              {
                valid_full_name: { $regex: req.query.search, $options: "i" },
              },
              {
                studentGRNO: {
                  $regex: req.query.search,
                  $options: "i",
                },
              },
            ],
          },
        ],
      }).select("_id");
      all_student = all_student?.filter((bt) => bt?._id);

      collected = await CollectBook.find({
        $and: [
          { library: { $eq: `${req.params.lid}` } },
          {
            $or: [
              {
                book: { $in: all_book },
              },
              {
                member: { $in: all_student },
              },
            ],
          },
        ],
      })
        .populate({
          path: "book member staff_member",
          select:
            "bookName photoId photo accession_number studentFirstName studentMiddleName studentLastName studentGRNO studentROLLNO valid_full_name photoId studentProfilePhoto staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        })
        .select(
          "book createdAt issuedDate fineCharge day_overdue_charge for_days"
        )
        .sort({
          createdAt: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .lean()
        .exec();

      res.status(200).send({
        message: "List of all collected log books by search",
        collected: collected,
      });
    } else {
      collected = await CollectBook.find({
        library: { $eq: `${req.params.lid}` },
      })
        .populate({
          path: "book member staff_member",
          select:
            "bookName photoId photo accession_number studentFirstName studentMiddleName studentLastName studentGRNO studentROLLNO valid_full_name photoId studentProfilePhoto staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        })
        .select(
          "book createdAt issuedDate fineCharge day_overdue_charge for_days"
        )
        .sort({
          createdAt: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .lean()
        .exec();

      res.status(200).send({
        message: "List of all collected log books",
        collected: collected,
      });
    }
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
      .select(
        "book member issuedDate createdAt day_overdue_charge for_days fineCharge"
      )
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
    const library = await Library.findById(req.params.lid).select("members");

    var all_student = [];
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      all_student = await Student.find({
        $and: [
          { _id: { $in: library?.members } },
          {
            $or: [
              {
                studentFirstName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentLastName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentMiddleName: { $regex: req.query.search, $options: "i" },
              },
              {
                valid_full_name: { $regex: req.query.search, $options: "i" },
              },
              {
                studentGRNO: {
                  $regex: req.query.search,
                  $options: "i",
                },
              },
            ],
          },
        ],
      }).select(
        "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO library_total_time_spent"
      );
    } else {
      all_student = await Student.find({
        _id: { $in: library?.members },
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO library_total_time_spent"
        )
        .lean()
        .exec();
    }
    res.status(200).send({
      message: "List of all members in Library",
      members: all_student,
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
          select: "bookName author language photo photoId accession_number",
        },
        select: "book createdAt for_days day_overdue_charge",
        skip: dropItem,
        limit: itemPerPage,
      })
      .select(
        "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentGRNO borrow library_total_time_spent"
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
        book_type: val?.book_type,
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
      let sort_list = library?.export_collection?.sort(
        (a, b) => b?.created_at - a?.created_at
      );
      res.status(200).send({
        message: "ALl Library Export list",
        excel_arr: sort_list,
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

    if (!lid || !from || !to) throw "Please send library id to perform task";
    const gte_Date = new Date(from);
    const lte_Date = new Date(to);
    lte_Date.setDate(lte_Date.getDate() + 1);
    const library = await Library.findById(lid)
      .populate({
        path: "issued",
        match: {
          createdAt: { $gte: gte_Date, $lte: lte_Date },
        },
        populate: {
          path: "book member",
          select:
            "studentGRNO student_prn_enroll_number studentFirstName studentMiddleName studentLastName bookName bookStatus author language accession_number",
        },
        select: "book member createdAt for_days",
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
      let dt = new Date(exc?.createdAt);
      dt.setDate(dt.getDate() + +exc?.for_days);

      excel_list.push({
        "Book Name": exc?.book?.bookName ?? "#NA",
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
        "Issue Time": moment(exc?.createdAt).format("hh:mm:ss A") ?? "#NA",
        "To Be Submitted": moment(dt).format("DD/MM/YYYY") ?? "#NA",
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
    if (!lid || !from || !to) throw "Please send library id to perform task";
    const gte_Date = new Date(from);
    const lte_Date = new Date(to);
    lte_Date.setDate(lte_Date.getDate() + 1);
    const library = await Library.findById(lid)
      .populate({
        path: "collected",
        match: {
          createdAt: { $gte: gte_Date, $lte: lte_Date },
        },
        populate: {
          path: "book member",
          select:
            "studentGRNO student_prn_enroll_number studentFirstName studentMiddleName studentLastName bookName bookStatus author language accession_number",
        },
        select:
          "book member chargeBy paymentType fineCharge issuedDate createdAt for_days",
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
      let dt = new Date(exc?.issuedDate);
      dt.setDate(dt.getDate() + +exc?.for_days);

      excel_list.push({
        "Book Name": exc?.book?.bookName ?? "#NA",
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
        "Issue Time": moment(exc?.issuedDate).format("hh:mm:ss A") ?? "#NA",
        "To Be Submitted": moment(dt).format("DD/MM/YYYY") ?? "#NA",
        "Collect Date": moment(exc?.createdAt).format("DD/MM/YYYY") ?? "#NA",
        "Collect Time": moment(exc?.createdAt).format("hh:mm:ss A") ?? "#NA",
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
      lid: libd?._id,
      instituteId: libd.institute,
    };
    // let f = [libd?._id];
    // let f2 = [libd?._id];
    // console.log(f2?.includes(f?.[0]));
    let imageKey = await generate_qr({
      fileName: "library",
      object_contain: library,
    });
    libd.qr_code = imageKey;
    await libd.save();
    res.status(200).send({ message: "qr geenrated", imageKey });
    // res.status(200).send({ message: "qr geenrated" });
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
    var flag = "";
    if (flow === "STAFF") {
      flag = library.is_generated_qr_staff ?? false;
      library.is_generated_qr_staff = true;
    } else {
      flag = library.is_generated_qr_student ?? false;
      library.is_generated_qr_student = true;
    }
    await library.save();
    res.status(200).send({
      message: "Library qr code generation processing",
      access: true,
    });
    if (flow === "STAFF") {
      if (!flag) {
        var staff_id = library?.institute?.ApproveStaff?.filter((bid) =>
          library?.generated_qr_staff?.includes(bid) ? null : bid
        );
        for (let sid of staff_id) {
          const staff = await Staff.findById(sid);
          if (staff) {
            // if (staff?.library_qr_code) {
            // } else {
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
            library.generated_qr_staff?.push(staff?._id);
          }
          // }
        }
        library.is_generated_qr_staff = false;
        await library.save();
      }
    } else {
      if (!flag) {
        var student_id = library?.institute?.ApproveStudent?.filter((bid) =>
          library?.generated_qr_student?.includes(bid) ? null : bid
        );
        for (let sid of student_id) {
          const student = await Student.findById(sid);
          if (student) {
            // if (student?.library_qr_code) {
            // } else {
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
            library.generated_qr_student?.push(student?._id);
          }
          // }
        }
        library.is_generated_qr_student = false;
        await library.save();
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
    let flag = library.is_generated_qr_book ?? false;
    library.is_generated_qr_book = true;
    await library.save();
    res.status(200).send({
      message: "Library qr code book generation processing",
      access: true,
    });
    // let i = 0;
    // var book_id = library?.books?.slice(3458);
    // var book_id = library?.books?.slice(3458);
    // var i = 0;
    if (!flag) {
      var book_id = library?.books?.filter((bid) =>
        library?.generated_qr_book?.includes(bid) ? null : bid
      );
      for (let bid of book_id) {
        const book = await Book.findById(bid);
        if (book?.book_qr_code) {
        } else {
          if (book) {
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
            library.generated_qr_book?.push(book?._id);
            // console.log("count :-> ", i);
            // ++i;
          }
        }
      }
      library.is_generated_qr_book = false;
      await library.save();
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
        select: "book_qr_code qviple_book_id bookName accession_number",
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

const time_convertor = (data) => {
  let splt = data?.split(" ");
  let nt = splt?.[0]?.split(":");
  let hr = 0;
  let total_min = 0;
  if (splt?.[1] === "Pm" || splt?.[1] === "pm") {
    if (+nt?.[0] === 12) {
      hr = +nt?.[0];
    } else {
      hr = +nt?.[0] + 12;
    }
  } else {
    hr = +nt?.[0];
  }
  total_min = hr * 60 + +nt?.[1];
  return total_min;
};
exports.getInOutStudentQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { lid, date } = req.query;
    if (!sid) throw "Please send student id to perform task";
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const library = await Library.findById(lid);
    const inout_g = await LibraryInOut.find({
      $and: [
        {
          student: { $eq: `${sid}` },
        },
        {
          date: { $eq: `${date}` },
        },
        {
          is_valid: { $eq: "No" },
        },
      ],
    });
    let current_time = moment(currentDate).format("hh:mm a");
    if (
      +time_convertor(library?.timing?.from) <= +time_convertor(current_time) &&
      +time_convertor(library?.timing?.to) >= +time_convertor(current_time)
    ) {
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
        res.status(200).send({
          message: "Library visit entry time record.",
          access: true,
        });
      } else {
        if (inout_g?.[0]?._id) {
          const inout = await LibraryInOut.findById(inout_g?.[0]?._id);
          inout.out_time = moment(currentDate).format("hh:mm:ss a");
          inout.hour_out_24 = moment(currentDate).format("H");
          inout.minute_out = moment(currentDate).format("m");
          inout.second_out = moment(currentDate).format("s");
          inout.is_valid = "Yes";
          // it is delayed about 1:30 seconds
          // let x = moment(inout?.created_at);
          // let y = moment(currentDate);
          // var duration = moment.duration(y.diff(x));
          // let hr = duration.get("hours");
          // let mit = duration.get("minutes");
          // let sec = duration.get("seconds");
          let hr = +(inout.hour_out_24 - inout.hour_in_24);
          let mit = 0;
          let sec = 0;
          if (inout.minute_out >= inout.minute_in) {
            mit = inout.minute_out - inout.minute_in;
          } else {
            hr -= 1;
            mit = inout.minute_out + 60 - inout.minute_in;
          }
          if (inout.second_out >= inout.second_in) {
            sec = inout.second_out - inout.second_in;
          } else {
            mit -= 1;
            sec = inout.second_out + 60 - inout.second_in;
          }

          inout.total_spent_time = `${hr > 9 ? hr : `0${hr}`}:${
            mit > 9 ? mit : `0${mit}`
          }:${sec > 9 ? sec : `0${sec}`}`;
          await inout.save();
          res.status(200).send({
            message: "Library visit exit time record.",
            access: true,
            inout,
          });

          const student = await Student.findById(sid);
          student.library_total_time_spent.hours += hr;
          student.library_total_time_spent.minutes += mit;
          student.library_total_time_spent.seconds += sec;
          if (student.library_total_time_spent.seconds > 59) {
            student.library_total_time_spent.seconds %= 60;
            student.library_total_time_spent.minutes += Math.floor(
              student.library_total_time_spent.seconds / 60
            );
          }
          if (student.library_total_time_spent.minutes > 59) {
            student.library_total_time_spent.minutes %= 60;
            student.library_total_time_spent.hours += Math.floor(
              student.library_total_time_spent.minutes / 60
            );
          }
          await student.save();
        }
      }
    } else {
      res.status(200).send({
        message: "Library time is over.",
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
    const { date, lid } = req.query;
    if (!sid) throw "Please send student id to perform task";
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const library = await Library.findById(lid);
    const inout_g = await LibraryInOut.find({
      $and: [
        {
          staff: { $eq: `${sid}` },
        },
        {
          date: { $eq: `${date}` },
        },
        {
          is_valid: { $eq: "No" },
        },
      ],
    });
    let current_time = moment(currentDate).format("hh:mm a");

    if (
      +time_convertor(library?.timing?.from) <= +time_convertor(current_time) &&
      +time_convertor(library?.timing?.to) >= +time_convertor(current_time)
    ) {
      if (!inout_g?.[0]?._id) {
        const staff = await Staff.findById(sid);
        const inout = new LibraryInOut({
          staff: sid,
          library: lid,
          date: date,
          in_time: moment(currentDate).format("hh:mm:ss a"),
          hour_in_24: moment(currentDate).format("H"),
          minute_in: moment(currentDate).format("m"),
          second_in: moment(currentDate).format("s"),
        });
        staff.library_in_out?.push(inout?._id);
        await Promise.all([inout.save(), staff.save()]);
        res.status(200).send({
          message: "Library visit entry time record.",
          access: true,
        });
      } else {
        if (inout_g?.[0]?._id) {
          const inout = await LibraryInOut.findById(inout_g?.[0]?._id);
          inout.out_time = moment(currentDate).format("hh:mm:ss a");
          inout.hour_out_24 = moment(currentDate).format("H");
          inout.minute_out = moment(currentDate).format("m");
          inout.second_out = moment(currentDate).format("s");
          inout.is_valid = "Yes";
          let hr = +(inout.hour_out_24 - inout.hour_in_24);
          let mit = 0;
          let sec = 0;
          if (inout.minute_out >= inout.minute_in) {
            mit = inout.minute_out - inout.minute_in;
          } else {
            hr -= 1;
            mit = inout.minute_out + 60 - inout.minute_in;
          }
          if (inout.second_out >= inout.second_in) {
            sec = inout.second_out - inout.second_in;
          } else {
            mit -= 1;
            sec = inout.second_out + 60 - inout.second_in;
          }

          inout.total_spent_time = `${hr > 9 ? hr : `0${hr}`}:${
            mit > 9 ? mit : `0${mit}`
          }:${sec > 9 ? sec : `0${sec}`}`;
          await inout.save();
          res.status(200).send({
            message: "Library visit exit time record.",
            access: true,
            inout,
          });

          const staff = await Staff.findById(sid);
          staff.library_total_time_spent.hours += hr;
          staff.library_total_time_spent.minutes += mit;
          staff.library_total_time_spent.seconds += sec;
          if (staff.library_total_time_spent.seconds > 59) {
            staff.library_total_time_spent.seconds %= 60;
            staff.library_total_time_spent.minutes += Math.floor(
              staff.library_total_time_spent.seconds / 60
            );
          }
          if (staff.library_total_time_spent.minutes > 59) {
            staff.library_total_time_spent.minutes %= 60;
            staff.library_total_time_spent.hours += Math.floor(
              staff.library_total_time_spent.minutes / 60
            );
          }
          await staff.save();
        }
      }
    } else {
      res.status(200).send({
        message: "Library time is over.",
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
          "studentFirstName studentLastName studentMiddleName studentGRNO studentROLLNO photoId studentProfilePhoto staffFirstName staffLastName staffMiddleName staffROLLNO photoId staffProfilePhoto",
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
          "staffFirstName staffLastName staffMiddleName staffROLLNO photoId staffProfilePhoto dName",
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
              "bookName author bookStatus language qviple_book_id book_qr_code accession_number photo",
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
            "bookName author bookStatus language qviple_book_id book_qr_code accession_number photo",
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
      message:
        "Librarian stocktake added successfully and other process started.",
      access: true,
    });

    const other_book_id = library?.books?.filter((bd) => {
      if (bookIds?.includes(bd)) return null;
      else {
        return bd;
      }
    });

    const issue = await IssueBook.find({
      _id: { $in: library.issued ?? [] },
    });
    let ib_arr = [];
    if (issue?.length > 0) {
      for (let it of issue) {
        ib_arr.push(it?.book);
      }
      stocktake.book_isssue = ib_arr;
      stocktake.book_isssue_count = ib_arr?.length;
    }

    const obi = other_book_id?.filter((bd) => {
      if (ib_arr?.includes(bd)) return null;
      else {
        return bd;
      }
    });

    const lost = await Book.find({
      status: { $eq: `Lost` },
    });
    let l_arr = [];
    if (lost?.length > 0) {
      for (let it of lost) {
        l_arr.push(it?._id);
      }
      stocktake.book_lost = l_arr;
      stocktake.book_lost_count = l_arr?.length;
    }

    const missing_arr = obi?.filter((bd) => {
      if (l_arr?.includes(bd)) return null;
      else {
        return bd;
      }
    });
    if (missing_arr?.length > 0) {
      let arr = [];
      for (let mt of missing_arr) {
        arr.push({
          book: mt,
          status: "None",
        });
      }
      stocktake.book_missing = arr;
      stocktake.book_missing_count = arr?.length;
    }

    await stocktake.save();
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
          "studentFirstName studentLastName studentMiddleName studentGRNO studentProfilePhoto photoId",
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
        rating: rating ?? 0,
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

exports.allBookByModetatorStaffSide = async (req, res) => {
  try {
    if (!req.params.mid)
      throw "Please send Library moderator id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const l_mod = await LibraryModerator.findById(req.params.mid);

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      if (req.query?.flow === "ISSUE_BOOK") {
        var all_book = await Book.find({
          $and: [
            { library: { $eq: l_mod?.library } },
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
            {
              department: { $in: l_mod?.department },
            },
          ],
        })
          .select(
            "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher"
          )
          .limit(itemPerPage)
          .skip(dropItem);
        if (all_book?.length > 0) {
          res.status(200).send({
            message:
              "Library Moderator List of All Books with pagination search",
            books: all_book?.length ? all_book : [],
          });
        } else {
          res.status(200).send({
            message:
              "Library Moderator List of All Books with pagination search",
            books: all_book?.length ? all_book : [],
          });
        }
      } else {
        var all_book = await Book.find({
          $and: [
            { library: { $eq: l_mod?.library } },
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
              department: { $in: l_mod?.department },
            },
          ],
        })
          .select(
            "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher"
          )
          .limit(itemPerPage)
          .skip(dropItem);
        res.status(200).send({
          message: "Library Moderator List of All Books with pagination search",
          books: all_book?.length ? all_book : [],
        });
      }
    } else {
      if (req.query?.flow === "ISSUE_BOOK") {
        var all_book = await Book.find({
          $and: [
            { library: { $eq: l_mod?.library } },
            {
              bookStatus: "Offline",
            },
            {
              leftCopies: { $gt: 0 },
            },
            {
              department: { $in: l_mod?.department },
            },
          ],
        })
          .select(
            "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher"
          )
          .limit(itemPerPage)
          .skip(dropItem);
        if (all_book?.length > 0) {
          res.status(200).send({
            message: "Library Moderator List of All Books",
            books: all_book?.length ? all_book : [],
          });
        } else {
          res.status(200).send({
            message: "Library Moderator List of All Books",
            books: all_book?.length ? all_book : [],
          });
        }
      } else {
        var all_book = await Book.find({
          $and: [
            { library: { $eq: l_mod?.library } },
            {
              department: { $in: l_mod?.department },
            },
          ],
        })
          .select(
            "bookName photoId photo author language bookStatus subject bill_date bill_number purchase_order_date purchase_order_number supplier publisher_place publication_year edition accession_number publisher"
          )
          .limit(itemPerPage)
          .skip(dropItem);
        if (all_book?.length > 0) {
          res.status(200).send({
            message: "Library Moderator List of All Books",
            books: all_book?.length ? all_book : [],
          });
        } else {
          res.status(200).send({
            message: "Library Moderator List of All Books",
            books: all_book?.length ? all_book : [],
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getLibraryUpdateTimeQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    await Library.findByIdAndUpdate(lid, req.body);
    res.status(200).send({
      message: "Library timing edited successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getStocktakeLibraryMissingBookUpdateQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    const { status, bookId, card_id } = req.body;
    if (!stid && !bookId && !status)
      throw "Please send library stocktake id to perform task";
    const stocktake = await LibraryStocktake.findById(stid);

    if (status === "book_isssue") {
      stocktake.book_isssue?.push(bookId);
      stocktake.book_isssue_count += 1;
      stocktake.book_missing_count -= 1;
      stocktake?.book_missing.pull(card_id);
      // for (let lt of stocktake?.book_missing) {
      //   if (`${lt?._id}` === `${card_id}`) {
      //     lt.status = "ISSUE_STUDENT";
      //   }
      // }
    } else if (status === "book_at_library") {
      stocktake.book_at_library?.push(bookId);
      stocktake.book_at_library_count += 1;
      stocktake.book_missing_count -= 1;
      stocktake?.book_missing.pull(card_id);

      // for (let lt of stocktake?.book_missing) {
      //   if (`${lt?._id}` === `${card_id}`) {
      //     lt.status = "FOUNDED_AT_LIBRARY";
      //   }
      // }
    } else if (status === "book_lost") {
      stocktake.book_lost?.push(bookId);
      stocktake.book_lost_count += 1;
      stocktake.book_missing_count -= 1;
      stocktake?.book_missing.pull(card_id);

      // for (let lt of stocktake?.book_missing) {
      //   if (`${lt?._id}` === `${card_id}`) {
      //     lt.status = "LOST";
      //   }
      // }
    } else {
    }

    await stocktake.save();
    res.status(200).send({
      message: "Librarian stocktake missing book status updated",
      access: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};
exports.getStudentTotalLibraryTimeQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) throw "Please send student id to perform task";
    const student = await Student.findById(sid).select(
      "library_total_time_spent library_qr_code"
    );

    res.status(200).send({
      message: "Student total library time",
      access: true,
      student: student,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getAllStaffQrCodeQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid).populate({
      path: "institute",
      select: "ApproveStaff",
    });
    var all_staff = [];
    all_staff = await Staff.find({
      _id: { $in: library?.institute?.ApproveStaff },
    }).select(
      "staffFirstName staffLastName staffMiddleName staffROLLNO staff_emp_code library_qr_code"
    );
    res.status(200).send({
      message: "Library qr code staff generation processing",
      access: true,
      all_staff: all_staff,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};
exports.getAllStudentQrCodeQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    if (!lid) throw "Please send library id to perform task";
    const library = await Library.findById(lid).populate({
      path: "institute",
      select: "ApproveStudent",
    });
    var all_student = [];
    all_student = await Student.find({
      _id: { $in: library?.institute?.ApproveStudent },
    }).select(
      "studentFirstName studentLastName studentMiddleName studentROLLNO staffGRNO library_qr_code"
    );
    res.status(200).send({
      message: "Library qr code student generation processing",
      access: true,
      all_student: all_student,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getAllEntryLogsExport = async (req, res) => {
  try {
    const { lid } = req.params;
    const { from, to } = req.query;

    if (!lid || !from || !to) throw "Please send library id to perform task";
    const gte_Date = new Date(from);
    const lte_Date = new Date(to);
    lte_Date.setDate(lte_Date.getDate() + 1);
    const entry_logs = await LibraryInOut.find({
      $and: [
        {
          library: { $eq: lid },
        },
        {
          created_at: { $gte: gte_Date, $lte: lte_Date },
        },
      ],
    })
      .populate({
        path: "student staff",
        select:
          "studentGRNO student_prn_enroll_number studentFirstName studentMiddleName studentLastName staffROLLNO staff_emp_code staffFirstName staffMiddleName staffLastName",
      })
      .select("date in_time out_time total_spent_time");

    res.status(200).send({
      message: "Generating excel all entry logs for library",
    });
    const excel_list = [];
    for (let exc of entry_logs) {
      if (exc?.student) {
        excel_list.push({
          GRNO: exc?.student?.studentGRNO ?? "#NA",
          "Enrollment / Prn Number":
            exc?.student?.student_prn_enroll_number ?? "#NA",
          Name: `${exc?.student?.studentFirstName} ${
            exc?.student?.studentMiddleName
              ? `${exc?.student?.studentMiddleName} `
              : " "
          }${exc?.student?.studentLastName}`,
          Date: exc?.date,
          "In Time": exc?.in_time,
          "Out Time": exc?.out_time,
          "Spent Time": exc?.total_spent_time,
        });
      } else {
        excel_list.push({
          GRNO: exc?.staff?.staffROLLNO ?? "#NA",
          "Enrollment / Prn Number": exc?.staff?.staff_emp_code ?? "#NA",
          Name: `${exc?.staff?.staffFirstName} ${
            exc?.staff?.staffMiddleName
              ? `${exc?.staff?.staffMiddleName} `
              : " "
          }${exc?.staff?.staffLastName}`,
          Date: exc?.date,
          "In Time": exc?.in_time,
          "Out Time": exc?.out_time,
          "Spent Time": exc?.total_spent_time,
        });
      }
    }
    if (excel_list?.length > 0)
      await library_json_to_excel(
        lid,
        excel_list,
        "Entry Logs",
        "LIBRARY_ENTRY_EXPORT",
        "entry-logs"
      );
  } catch (e) {
    console.log(e);
  }
};

exports.getAllBookReviewExport = async (req, res) => {
  try {
    const { lid } = req.params;
    const { from, to } = req.query;

    if (!lid || !from || !to) throw "Please send library id to perform task";
    const gte_Date = new Date(from);
    const lte_Date = new Date(to);
    lte_Date.setDate(lte_Date.getDate() + 1);
    const book_review = await LibraryBookRemark.find({
      $and: [
        {
          library: { $eq: lid },
        },
        {
          created_at: { $gte: gte_Date, $lte: lte_Date },
        },
      ],
    })
      .populate({
        path: "student book",
        select:
          "studentFirstName studentMiddleName studentLastName bookName bookStatus author accession_number edition",
      })
      .select("created_at description rating");

    res.status(200).send({
      message: "Generating excel all book review for library",
    });
    const excel_list = [];
    for (let exc of book_review) {
      excel_list.push({
        "Student Name": `${exc?.student?.studentFirstName} ${
          exc?.student?.studentMiddleName
            ? `${exc?.student?.studentMiddleName} `
            : " "
        }${exc?.student?.studentLastName}`,
        "Book Name": exc?.book?.bookName ?? "#NA",
        "Accession Number": exc?.book?.accession_number ?? "#NA",
        Author: exc?.book?.author ?? "#NA",
        Mode: exc?.book?.bookStatus ?? "#NA",
        Edition: exc?.book?.edition,
        Date: moment(exc?.created_at).format("DD/MM/yyyy"),
        Description: exc?.description,
        Rating: exc?.rating,
      });
    }
    // res.status(200).send({
    //   message: "Generating excel all book review for library",
    //   excel_list,
    // });
    if (excel_list?.length > 0)
      await library_json_to_excel(
        lid,
        excel_list,
        "Book Review",
        "LIBRARY_BOOK_REVIEW",
        "book-review"
      );
  } catch (e) {
    console.log(e);
  }
};

// for staff side show that library things

exports.own_staff_borrow_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const staff = await Staff.findById(sid);

    let borrow = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      borrow = await IssueBook.find({
        $and: [
          {
            _id: { $in: staff.borrow },
          },
          {
            $or: [
              {
                "book.bookName": { $regex: req.query.search, $options: "i" },
              },
              {
                "book.author": { $regex: req.query.search, $options: "i" },
              },
              {
                "book.language": { $regex: req.query.search, $options: "i" },
              },
              {
                "book.accession_number": {
                  $regex: req.query.search,
                  $options: "i",
                },
              },
            ],
          },
        ],
      })
        .populate({
          path: "book",
          select: "bookName author language photo photoId accession_number",
        })
        .select("book createdAt for_days day_overdue_charge")
        .lean()
        .exec();
    } else {
      borrow = await IssueBook.find({
        $and: [
          {
            _id: { $in: staff.borrow },
          },
        ],
      })
        .populate({
          path: "book",
          select: "bookName author language photo photoId accession_number",
        })
        .select("book createdAt for_days day_overdue_charge")
        .skip(dropItem)
        .limit(itemPerPage)
        .lean()
        .exec();
    }

    res.status(200).send({
      message: "List of all issued book for one member in Library",
      borrow: borrow,
    });
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};

exports.own_staff_history_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const staff = await Staff.findById(sid);
    let history = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      history = await IssueBook.find({
        $and: [
          {
            _id: { $in: staff.deposite },
          },
          {
            $or: [
              {
                "book.bookName": { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "book",
          select: "bookName photoId photo createdAt",
        })
        .select("book issuedDate createdAt")
        .lean()
        .exec();
    } else {
      history = await IssueBook.find({
        $and: [
          {
            _id: { $in: staff.deposite },
          },
        ],
      })
        .populate({
          path: "book",
          select: "bookName photoId photo createdAt",
        })
        .select("book issuedDate createdAt")
        .skip(dropItem)
        .limit(itemPerPage)
        .lean()
        .exec();
    }

    res.status(200).send({
      message: "List of all history book for one member in Library",
      history: history,
    });
  } catch (e) {
    res.status(200).send({
      message: e.message,
    });
  }
};
