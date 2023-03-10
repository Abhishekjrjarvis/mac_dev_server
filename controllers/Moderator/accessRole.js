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
  };
  return access_role_finance;
};
