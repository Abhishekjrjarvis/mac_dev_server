exports.staff_id_card_format = (arr, args) => {
  try {
    const live_data = [];
    arr.forEach((staff) => {
      live_data.push({
        indexNo: staff.staffROLLNO,
        fullName: args.fullName
          ? `${staff.staffFirstName} ${
              staff.staffMiddleName ? staff.staffMiddleName : ""
            } ${staff.staffLastName}`
          : "",
        photo: staff.staffProfilePhoto,
        cast: args.staffCast ? staff.staffCast : "",
        castCategory: args.staffCastCategory ? staff.staffCastCategory : "",
        religion: args.staffReligion ? staff.staffReligion : "",
        birthPlace: args.staffBirthPlace ? staff.staffBirthPlace : "",
        motherName: args.staffMotherName ? staff.staffMotherName : "",
        motherTongue: args.staffMTongue ? staff.staffMTongue : "",
        district: args.staffDistrict ? staff.staffDistrict : "",
        state: args.staffState ? staff.staffState : "",
        address: args.staffAddress ? staff.staffAddress : "",
        phoneNumber: args.staffPhoneNumber ? staff.staffPhoneNumber : "",
        aadharNumber: args.staffAadharNumber ? staff.staffAadharNumber : "",
        qualification: args.staffQualification ? staff.staffQualification : "",
        gender: args.staffGender ? staff.staffGender : "",
        dob: args.staffDOB ? staff.staffDOB : "",
        nationality: args.staffNationality ? staff.staffNationality : "",
        aadharFrontCard: args.staffAadharFrontCard
          ? staff.staffAadharFrontCard
          : "",
        aadharBackCard: args.staffAadharBackCard
          ? staff.staffAadharBackCard
          : "",
        panNumber: args.staffPanNumber ? staff.staffPanNumber : "",
        bankDetails: args.staffBankDetails ? staff.staffBankDetails : "",
        upiId: args.staffUpiId ? staff.staffUpiId : "",
        castCertificate: args.staffCasteCertificate
          ? staff.staffCasteCertificate
          : "",
        height: args.staffHeight ? staff.staffHeight : "",
        weight: args.staffWeight ? staff.staffWeight : "",
        bmi: args.staffBMI ? staff.staffBMI : "",
      });
    });
    return live_data;
  } catch (e) {
    console.log(e);
  }
};
