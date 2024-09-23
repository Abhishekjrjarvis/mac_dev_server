exports.all_access_role = () => {
  const access_role = {
    FULL_ACCESS: {
      role: "FULL_ACCESS",
      permission: {
        allow: true,
        bound: ["NO"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    ALL_FEE_ACCESS: {
      role: "ALL_FEE_ACCESS",
      permission: {
        allow: true,
        bound: ["FUNDS_ACCESS", "CASH_FLOW_TO_FINANCE"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    MULTI_APP_ACCESS: {
      role: "MULTI_APP_ACCESS",
      permission: {
        allow: true,
        bound: [
          "ONGOING",
          "COMPLETED",
          "MARK_COMPLETE",
          "MARK_REMAINING_FEES",
          "ADD_STUDENT_ACCESS",
        ],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    INQUIRY_ACCESS: {
      role: "INQUIRY_ACCESS",
      permission: {
        allow: true,
        bound: ["NEW_INQUIRY", "REVIEW_INQUIRY"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    SCHOLARSHIP_ACCESS: {
      role: "SCHOLARSHIP_ACCESS",
      permission: {
        allow: true,
        bound: ["Scholarship"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    REFUND_ACCESS: {
      role: "REFUND_ACCESS",
      permission: {
        allow: true,
        bound: ["GIVE REFUND"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    PENDING_FEE_ACCESS: {
      role: "PENDING_FEE_ACCESS",
      permission: {
        allow: true,
        bound: ["COLLECT PENDING FEES", "EXEMPT PENDING FEES"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    ONE_TAB_ACCESS: {
      role: "ONE_TAB_ACCESS",
      permission: {
        allow: true,
        bound: [
          "APPLICATION TAB",
          "SELECTED TAB",
          "CONFIRMED TAB",
          "ALLOTTED TAB",
          "CANCELLED TAB",
          "FEE COLLECTION TAB",
          "REVIEW TAB",
        ],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    DATA_EXPORT_ACCESS: {
      role: "DATA_EXPORT_ACCESS",
      permission: {
        allow: true,
        bound: [".xlsx", ".pdf", ".doc"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    COMBINED_APP_ACCESS: {
      role: "COMBINED_APP_ACCESS",
      permission: {
        allow: true,
        bound: ["DOCS_COLLECT", "FEES_COLLECT", "CONFIRM_TAB"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    ONGOING_ACCESS: {
      role: "ONGOING_ACCESS",
      permission: {
        allow: true,
        bound: ["ONGOING_APPLICATION"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    ONGOING_VIEW_ACCESS: {
      role: "ONGOING_VIEW_ACCESS",
      permission: {
        allow: true,
        bound: ["ONGOING_APPLICATION"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    REQUIRED_DOCUMENTS: {
      role: "REQUIRED_DOCUMENTS",
      permission: {
        allow: true,
        bound: ["DOCUMENTS"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
  };
  return access_role;
};

exports.all_access_role_finance = () => {
  const access_role_finance = {
    FULL_ACCESS: {
      role: "FULL_ACCESS",
      permission: {
        allow: true,
        bound: ["NO"],
        addons: [],
        accessStaff: "",
      },
    },
    CASH_RECEIPT_ACCESS: {
      role: "CASH_RECEIPT_ACCESS",
      permission: {
        allow: true,
        bound: [
          "CLASS RECEIPT",
          "TRANSPORT RECEIPT",
          "ADMISSION RECEIPT",
          "LIBRARY RECEIPT",
        ],
        addons: [],
        accessStaff: "",
      },
    },
    INVENTORY_ACCESS: {
      role: "INVENTORY_ACCESS",
      permission: {
        allow: true,
        bound: ["INVENTORY"],
        addons: [],
        accessStaff: "",
      },
    },
    FEE_MASTER_ACCESS: {
      role: "FEE_MASTER_ACCESS",
      permission: {
        allow: true,
        bound: ["FEE CATEGORY", "FEE MASTER", "FEE STRUCTURE"],
        addons: [],
        accessStaff: "",
      },
    },
    PAYROLL_ACCESS: {
      role: "PAYROLL_ACCESS",
      permission: {
        allow: true,
        bound: ["MARK PAYROLL", "DOWNLOAD PAYROLL"],
        addons: [],
        accessStaff: "",
      },
    },
    DEPOSIT_ACCESS: {
      role: "DEPOSIT_ACCESS",
      permission: {
        allow: true,
        bound: ["REFUND DEPOSIT", "DOWNLOAD DEPOSIT STATEMENT"],
        addons: [],
        accessStaff: "",
      },
    },
    BANK_ACCOUNT_ACCESS: {
      role: "BANK_ACCOUNT_ACCESS",
      permission: {
        allow: true,
        bound: ["ADD BANK ACCOUNT", "EDIT BANK ACCOUNT", "DELETE BANK ACCOUNT"],
        addons: [],
        accessStaff: "",
      },
    },
    DATA_EXPORT_ACCESS: {
      role: "DATA_EXPORT_ACCESS",
      permission: {
        allow: true,
        bound: [".xlsx", ".pdf", ".doc"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    SCHOLARSHIP_ACCESS: {
      role: "SCHOLARSHIP_ACCESS",
      permission: {
        allow: true,
        bound: ["Scholarship"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    OFFLINE_PAYMENT_VERIFICATION_ACCESS: {
      role: "OFFLINE_PAYMENT_VERIFICATION_ACCESS",
      permission: {
        allow: true,
        bound: [
          "FEE RECEIPT REQUEST",
          "FEE RECEIPT APPROVE",
          "FEE RECEIPT REJECT",
        ],
        addons: [],
        accessStaff: "",
      },
    },
    EXCESS_FEE_REFUND_ACCESS: {
      role: "EXCESS_FEE_REFUND_ACCESS",
      permission: {
        allow: true,
        bound: ["REFUND LIST", "REFUNDED LIST"],
        addons: [],
        accessStaff: "",
      },
    },
    ADMISSION_PENDING_FEES_ACCESS: {
      role: "ADMISSION_PENDING_FEES_ACCESS",
      permission: {
        allow: true,
        bound: ["COLLECT PENDING FEES", "EXEMPT PENDING FEES"],
        addons: [],
        accessStaff: "",
      },
    },
    MISCELLENOUS_FEE: {
      role: "MISCELLENOUS_FEE",
      permission: {
        allow: true,
        bound: ["MISCELLENOUS"],
        addons: [],
        accessStaff: "",
      },
    },
    DAYBOOK_AUTHORITY: {
      role: "DAYBOOK_AUTHORITY",
      permission: {
        allow: true,
        bound: ["NEW DAYBOOK", "DAYBOOK HISTORY"],
        addons: [],
        accessStaff: "",
      },
    },
  };
  return access_role_finance;
};

exports.all_access_role_ins = () => {
  const access_role_ins = {
    CERTIFICATE_ACCESS: {
      role: "CERTIFICATE_ACCESS",
      permission: {
        allow: true,
        bound: ["MAKE CERTIFICATE", "DOWNLOAD CERTIFICATE"],
        addons: [],
        accessStaff: "",
      },
    },
    STUDENT_PROMOTE_ACCESS: {
      role: "STUDENT_PROMOTE_ACCESS",
      permission: {
        allow: true,
        bound: ["PROMOTE_STUDENT"],
        addons: [],
        accessStaff: "",
      },
    },
    // SOCIAL_MEDIA_ACCESS: {
    //   role: "SOCIAL_MEDIA_ACCESS",
    //   permission: {
    //     allow: true,
    //     bound: [
    //       "HANDLE_SOCIAL",
    //       "MAKE_POST",
    //       "MAKE_POLL",
    //       "MAKE_QUESTION",
    //       "MAKE_ANSWER",
    //     ],
    //     addons: [],
    //     accessStaff: "",
    //   },
    // },
    SITE_MANAGE_ACCESS: {
      role: "SITE_MANAGE_ACCESS",
      permission: {
        allow: true,
        bound: ["SITE_OPENER", "EDIT_SITE_INFO"],
        addons: [],
        accessStaff: "",
      },
    },
    EXAM_MANAGER_ACCESS: {
      role: "EXAM_MANAGER_ACCESS",
      permission: {
        allow: true,
        bound: ["CREATE EXAM", "SCHEDULE EXAM", "ADD SUBJECT EXAM"],
        addons: [],
        accessStaff: "",
      },
    },
    ID_CARD_ACCESS: {
      role: "ID_CARD_ACCESS",
      permission: {
        allow: true,
        bound: ["NEW_ID_CARD", "ID_CARD_ZIP", "ID_CARD_EXCEL"],
        addons: [],
        accessStaff: "",
      },
    },
    SOCIAL_MEDIA_ACCESS: {
      role: "SOCIAL_MEDIA_ACCESS",
      permission: {
        allow: true,
        bound: [
          "CREATE_POST",
          "EDIT_SITE_INFO",
          "CREATE_POLL",
          "CREATE_QUESTION",
          "CREATE_ANNOUNCEMENT",
        ],
        addons: [],
        accessStaff: "",
      },
    },
    SOCIAL_MEDIA_ASSISTANT_ACCESS: {
      role: "SOCIAL_MEDIA_ASSISTANT_ACCESS",
      permission: {
        allow: true,
        bound: [
          "CREATE_POST",
          "EDIT_SITE_INFO",
          "CREATE_POLL",
          "CREATE_QUESTION",
          "CREATE_ANNOUNCEMENT",
        ],
        addons: [],
        accessStaff: "",
      },
    },
    ACADEMIC_ADMINISTRATOR_ACCESS: {
      role: "ACADEMIC_ADMINISTRATOR_ACCESS",
      permission: {
        allow: true,
        bound: ["ASSIGN SUBJECT TEACHER", "EDIT SUBJECT ANALYTICS"],
        addons: [],
        accessStaff: "",
      },
    },
    LEAVING_AND_TRANSFER_ACCESS: {
      role: "LEAVING_AND_TRANSFER_ACCESS",
      permission: {
        allow: true,
        bound: ["ASSIGN LEAVE", "MAKE STAFF TRANSFER"],
        addons: [],
        accessStaff: "",
      },
    },
    LEAVE_RECOMMENDATION_ACCESS: {
      role: "LEAVE_RECOMMENDATION_ACCESS",
      permission: {
        allow: true,
        bound: ["HANDLE RECOMMEND LEAVE"],
        addons: [],
        accessStaff: "",
      },
    },
    LEAVE_REVIEW_ACCESS: {
      role: "LEAVE_REVIEW_ACCESS",
      permission: {
        allow: true,
        bound: ["HANDLE LEAVE VERIFICATION"],
        addons: [],
        accessStaff: "",
      },
    },
    LEAVE_SANCTION_ACCESS: {
      role: "LEAVE_SANCTION_ACCESS",
      permission: {
        allow: true,
        bound: ["HANDLE LEAVE SANCTION"],
        addons: [],
        accessStaff: "",
      },
    },
    INSTITUTE_ADMIN: {
      role: "INSTITUTE_ADMIN",
      permission: {
        allow: true,
        bound: ["INSTITUTE ADMIN FULL READ ACCESS"],
        addons: [],
        accessStaff: "",
      },
    },
    PRINCIPLE_VIEW: {
      role: "PRINCIPLE_VIEW",
      permission: {
        allow: true,
        bound: ["PRINCIPLE VIEW FULL READ ACCESS"],
        addons: [],
        accessStaff: "",
      },
    },
  };
  return access_role_ins;
};

exports.all_access_role_hostel = () => {
  const access_role_hostel = {
    FULL_ACCESS: {
      role: "FULL_ACCESS",
      permission: {
        allow: true,
        bound: ["NO"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    ALL_FEE_ACCESS: {
      role: "ALL_FEE_ACCESS",
      permission: {
        allow: true,
        bound: ["FUNDS_ACCESS", "CASH_FLOW_TO_FINANCE"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    MULTI_APP_ACCESS: {
      role: "MULTI_APP_ACCESS",
      permission: {
        allow: true,
        bound: ["ONGOING", "COMPLETED", "MARK_COMPLETE", "MARK_REMAINING_FEES"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    PENDING_FEE_ACCESS: {
      role: "PENDING_FEE_ACCESS",
      permission: {
        allow: true,
        bound: ["COLLECT PENDING FEES", "EXEMPT PENDING FEES"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    RENEWAL_UNIT_ACCESS: {
      role: "RENEWAL_UNIT_ACCESS",
      permission: {
        allow: true,
        bound: ["SELECT RENEWAL STRUCTURE", "ALLOT BED"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    DEPOSIT_ACCESS: {
      role: "DEPOSIT_ACCESS",
      permission: {
        allow: true,
        bound: ["MARK DEPOSIT", "MAKE REFUND"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    ONE_TAB_ACCESS: {
      role: "ONE_TAB_ACCESS",
      permission: {
        allow: true,
        bound: [
          "APPLICATION TAB",
          "SELECTED TAB",
          "CONFIRMED TAB",
          "ALLOTTED TAB",
          "CANCELLED TAB",
        ],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    FEE_MASTER_ACCESS: {
      role: "FEE_MASTER_ACCESS",
      permission: {
        allow: true,
        bound: ["FEE CATEGORY", "FEE MASTER", "FEE STRUCTURE"],
        addons: [],
        accessStaff: "",
      },
    },
    COMPLAINT_ACCESS: {
      role: "COMPLAINT_ACCESS",
      permission: {
        allow: true,
        bound: ["SOLVED COMPLAINT", "UNSOLVED COMPLAINT"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    RULES_AND_ANNOUNCEMENT_ACCESS: {
      role: "RULES_AND_ANNOUNCEMENT_ACCESS",
      permission: {
        allow: true,
        bound: ["ADD NEW RULE", "ADD NEW ANNOUNCEMENT"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    INCOME_AND_EXPENSE_ACCESS: {
      role: "INCOME_AND_EXPENSE_ACCESS",
      permission: {
        allow: true,
        bound: ["ADD NEW INCOME", "ADD NEW EXPENSE"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
    DATA_EXPORT_ACCESS: {
      role: "DATA_EXPORT_ACCESS",
      permission: {
        allow: true,
        bound: [".xlsx", ".pdf", ".doc"],
        addons: [],
        accessStaff: "",
        accessApplication: "",
        appArray: [],
      },
    },
  };
  return access_role_hostel;
};
