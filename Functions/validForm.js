const personal_query = (one_student) => {
  if (
    one_student?.studentFirstName &&
    one_student?.studentLastName &&
    one_student?.studentDOB &&
    one_student?.studentGender &&
    one_student?.studentMotherName &&
    one_student?.studentProfilePhoto
  ) {
    return {
      form_status: "Filled",
      access: true,
      go_through: "Personal Info",
    };
  }
  return {
    form_status: "Not Filled",
    access: false,
    go_through: "Personal Info",
  };
};

const other_personal_query = (one_student) => {
  if (
    one_student?.studentBirthPlace &&
    one_student?.studentPhoneNumber &&
    one_student?.studentFatherRationCardColor &&
    one_student?.studentAadharNumber
  ) {
    return {
      form_status: "Filled",
      access: true,
      go_through: "Other Personal Info",
    };
  }
  return {
    form_status: "Not Filled",
    access: false,
    go_through: "Other Personal Info",
  };
};

const match_identity = (one_student) => {
  if (
    one_student?.studentNationality &&
    one_student?.studentReligion &&
    one_student?.studentCast &&
    one_student?.studentCastCategory &&
    one_student?.studentMTongue
  ) {
    return {
      form_status: "Filled",
      access: true,
      go_through: "Identity Details",
    };
  }
  return {
    form_status: "Not Filled",
    access: false,
    go_through: "Identity Details",
  };
};

const match_address_query = (one_student) => {
  if (
    one_student?.studentAddress &&
    one_student?.studentCurrentAddress &&
    one_student?.studentPincode &&
    one_student?.studentCurrentPincode
  ) {
    return {
      form_status: "Filled",
      access: true,
      go_through: "Address Info",
    };
  }
  return {
    form_status: "Not Filled",
    access: false,
    go_through: "Address Info",
  };
};

const match_parent_query = (one_student) => {
  if (
    one_student?.studentParentsName &&
    one_student?.studentParentsPhoneNumber &&
    one_student?.studentParentsOccupation &&
    one_student?.studentParentsAnnualIncom
  ) {
    return {
      form_status: "Filled",
      access: true,
      go_through: "Parents Details",
    };
  }
  return {
    form_status: "Not Filled",
    access: false,
    go_through: "Parents Details",
  };
};

const match_bank_query = (one_student) => {
  if (
    one_student?.studentBankName &&
    one_student?.studentBankAccount &&
    one_student?.studentBankAccountHolderName &&
    one_student?.studentBankIfsc &&
    one_student?.studentBankPassbook
  ) {
    return {
      form_status: "Filled",
      access: true,
      go_through: "Bank Details",
    };
  }
  return {
    form_status: "Not Filled",
    access: false,
    go_through: "Bank Details",
  };
};

const document_web = async (arr) => {
  var obj = {};
  for (let i = 0; i < arr.length; i++) {
    const { documentName, documentKey } = arr[i];
    obj[documentName] = documentKey;
  }
  return obj;
};

const match_income_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.incomeCertificate) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Income Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Income Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.incomeCertificate) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Income Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Income Documents",
      };
    }
  }
};
const match_leavingTransfer_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.leavingTransferCertificate) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Leaving Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Leaving Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.leavingTransferCertificate) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Leaving Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Leaving Documents",
      };
    }
  }
};
const match_nonCreamyLayer_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.nonCreamyLayerCertificate) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Non Creamy Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Non Creamy Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.nonCreamyLayerCertificate) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Non Creamy Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Non Creamy Documents",
      };
    }
  }
};
const match_domicile_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.domicileCertificate) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Domicile Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Domicile Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.domicileCertificate) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Domicile Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Domicile Documents",
      };
    }
  }
};
const match_nationality_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.nationalityCertificate) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Nationality Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Nationality Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.nationalityCertificate) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Nationality Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Nationality Documents",
      };
    }
  }
};
const match_lastYear_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.lastYearMarksheet) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Last Year Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Last Year Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.lastYearMarksheet) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Last Year Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Last Year Documents",
      };
    }
  }
};
const match_joiningTransfer_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.joiningTransferLetter) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Joining Transfer Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Joining Transfer Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.joiningTransferLetter) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Joining Transfer Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Joining Transfer Documents",
      };
    }
  }
};
const match_identity_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.identityDocument) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Identity Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Identity Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.identityDocument) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Identity Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Identity Documents",
      };
    }
  }
};
const match_caste_document_query = async (one_student, flow) => {
  if (flow === "APK") {
    if (one_student?.casteCertificate) {
      return {
        form_status: "Filled",
        access: true,
        go_through: "Caste Documents",
      };
    }
    return {
      form_status: "Not Filled",
      access: false,
      go_through: "Caste Documents",
    };
  } else {
    if (one_student?.studentDocuments?.length > 0) {
      var result = await document_web(one_student?.studentDocuments);
      if (result?.casteCertificate) {
        return {
          form_status: "Filled",
          access: true,
          go_through: "Caste Documents",
        };
      }
      return {
        form_status: "Not Filled",
        access: false,
        go_through: "Caste Documents",
      };
    }
  }
};

const match_previous_query = (one_student) => {
  if (one_student?.studentPreviousSchool) {
    return {
      form_status: "Filled",
      access: true,
      go_through: "Previous Document School",
    };
  }
  return {
    form_status: "Not Filled",
    access: false,
    go_through: "Previous Document School",
  };
};

const match_aadhar_query = (one_student) => {
  if (
    one_student?.studentAadharFrontCard &&
    one_student?.studentAadharBackCard
  ) {
    return {
      form_status: "Filled",
      access: true,
      go_through: "Aadhar Card Front & Back",
    };
  }
  return {
    form_status: "Not Filled",
    access: false,
    go_through: "Aadhar Card Front & Back",
  };
};

exports.valid_student_form_query = async (one_ins, one_student, flow) => {
  try {
    var status;
    if (one_ins?.studentFormSetting?.personalInfo) {
      var person_query = personal_query(one_student);
      status = person_query?.form_status;
    }
    if (one_ins?.studentFormSetting?.otherPersonalInfo) {
      var other_query = other_personal_query(one_student);
      status = other_query?.form_status;
    }
    if (one_ins?.studentFormSetting?.identityDetails) {
      var ident_query = match_identity(one_student);
      status = ident_query?.form_status;
    }
    if (one_ins?.studentFormSetting?.addressInfo) {
      var address_query = match_address_query(one_student);
      status = address_query?.form_status;
    }
    if (one_ins?.studentFormSetting?.parentsInfo) {
      var parent_query = match_parent_query(one_student);
      status = parent_query?.form_status;
    }
    if (one_ins?.studentFormSetting?.bankDetails) {
      var bank_query = match_bank_query(one_student);
      status = bank_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument?.incomeCertificate
    ) {
      var income_query = await match_income_document_query(one_student, flow);
      status = income_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument
        ?.leavingTransferCertificate
    ) {
      var leaving_query = await match_leavingTransfer_document_query(
        one_student,
        flow
      );
      status = leaving_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument
        ?.nonCreamyLayerCertificate
    ) {
      var creamy_query = await match_nonCreamyLayer_document_query(
        one_student,
        flow
      );
      status = creamy_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument
        ?.domicileCertificate
    ) {
      var domicile_query = await match_domicile_document_query(
        one_student,
        flow
      );
      status = domicile_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument
        ?.nationalityCertificate
    ) {
      var national_query = await match_nationality_document_query(
        one_student,
        flow
      );
      status = national_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument?.lastYearMarksheet
    ) {
      var last_query = await match_lastYear_document_query(one_student, flow);
      status = last_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument
        ?.joiningTransferLetter
    ) {
      var join_query = await match_joiningTransfer_document_query(
        one_student,
        flow
      );
      status = join_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument?.identityDocument
    ) {
      var identity_query = await match_identity_document_query(
        one_student,
        flow
      );
      status = identity_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument?.casteCertificate
    ) {
      var caste_query = await match_caste_document_query(one_student, flow);
      status = caste_query?.form_status;
    }
    if (
      one_ins?.studentFormSetting?.previousSchoolAndDocument
        ?.previousSchoolDocument
    ) {
      var previous_query = match_previous_query(one_ins, one_student);
      status = previous_query?.form_status;
    }
    if (one_ins?.studentFormSetting?.previousSchoolAndDocument?.aadharCard) {
      var aadhar_query = match_aadhar_query(one_ins, one_student);
      status = aadhar_query?.form_status;
    }
    if (status === "Filled") {
      var new_status = {
        form_status: status,
        access: true,
        go_through: "All Section Completed",
      };
      one_student.form_status = "Filled";
      await one_student.save();
      return new_status;
    } else {
      var new_status = {
        form_status: status,
        access: false,
        go_through: "No Section Completed",
      };
      return new_status;
    }
  } catch (e) {
    console.log(e);
  }
};
