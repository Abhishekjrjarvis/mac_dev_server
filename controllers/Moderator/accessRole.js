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
        ],
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
    SOCIAL_MEDIA_ACCESS: {
      role: "SOCIAL_MEDIA_ACCESS",
      permission: {
        allow: true,
        bound: [
          "HANDLE_SOCIAL",
          "MAKE_POST",
          "MAKE_POLL",
          "MAKE_QUESTION",
          "MAKE_ANSWER",
        ],
        addons: [],
        accessStaff: "",
      },
    },
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
  };
  return access_role_hostel;
};
