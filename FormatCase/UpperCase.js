exports.all_upper_case_query = async (stu_args) => {
  try {
    stu_args.studentFirstName = stu_args?.studentFirstName
      ? stu_args?.studentFirstName.toUpperCase()
      : stu_args?.studentFirstName;
    stu_args.studentMiddleName = stu_args?.studentMiddleName
      ? stu_args?.studentMiddleName.toUpperCase()
      : stu_args?.studentMiddleName;
    stu_args.studentLastName = stu_args?.studentLastName
      ? stu_args?.studentLastName.toUpperCase()
      : stu_args?.studentLastName;
    stu_args.valid_full_name = stu_args?.valid_full_name
      ? stu_args?.valid_full_name.toUpperCase()
      : stu_args?.valid_full_name;
    stu_args.studentMTongue = stu_args?.studentMTongue
      ? stu_args?.studentMTongue.toUpperCase()
      : stu_args?.studentMTongue;
    // stu_args.studentReligion = stu_args?.studentReligion
    //   ? stu_args?.studentReligion.toUpperCase()
    //   : stu_args?.studentReligion;
    // stu_args.studentNationality = stu_args?.studentNationality
    //   ? stu_args?.studentNationality.toUpperCase()
    //   : stu_args?.studentNationality;
    stu_args.studentCast = stu_args?.studentCast
      ? stu_args?.studentCast.toUpperCase()
      : stu_args?.studentCast;
    // stu_args.studentCastCategory = stu_args?.studentCastCategory
    //   ? stu_args?.studentCastCategory.toUpperCase()
    //   : stu_args?.studentCastCategory;
    stu_args.studentMotherName = stu_args?.studentMotherName
      ? stu_args?.studentMotherName.toUpperCase()
      : stu_args?.studentMotherName;
    stu_args.studentBirthPlace = stu_args?.studentBirthPlace
      ? stu_args?.studentBirthPlace.toUpperCase()
      : stu_args?.studentBirthPlace;
    stu_args.studentBirthPlaceState = stu_args?.studentBirthPlaceState
      ? stu_args?.studentBirthPlaceState.toUpperCase()
      : stu_args?.studentBirthPlaceState;
    stu_args.studentBirthPlaceDistrict = stu_args?.studentBirthPlaceDistrict
      ? stu_args?.studentBirthPlaceDistrict.toUpperCase()
      : stu_args?.studentBirthPlaceDistrict;
    stu_args.studentDistrict = stu_args?.studentDistrict
      ? stu_args?.studentDistrict.toUpperCase()
      : stu_args?.studentDistrict;
    stu_args.studentState = stu_args?.studentState
      ? stu_args?.studentState.toUpperCase()
      : stu_args?.studentState;
    stu_args.studentAddress = stu_args?.studentAddress
      ? stu_args?.studentAddress.toUpperCase()
      : stu_args?.studentAddress;
    stu_args.studentCurrentDistrict = stu_args?.studentCurrentDistrict
      ? stu_args?.studentCurrentDistrict.toUpperCase()
      : stu_args?.studentCurrentDistrict;
    stu_args.studentCurrentState = stu_args?.studentCurrentState
      ? stu_args?.studentCurrentState.toUpperCase()
      : stu_args?.studentCurrentState;
    stu_args.studentCurrentAddress = stu_args?.studentCurrentAddress
      ? stu_args?.studentCurrentAddress.toUpperCase()
      : stu_args?.studentCurrentAddress;
    stu_args.studentParentsName = stu_args?.studentParentsName
      ? stu_args?.studentParentsName.toUpperCase()
      : stu_args?.studentParentsName;
    stu_args.studentParentsOccupation = stu_args?.studentParentsOccupation
      ? stu_args?.studentParentsOccupation.toUpperCase()
      : stu_args?.studentParentsOccupation;
    stu_args.studentPreviousSchool = stu_args?.studentPreviousSchool
      ? stu_args?.studentPreviousSchool.toUpperCase()
      : stu_args?.studentPreviousSchool;
    stu_args.studentBankName = stu_args?.studentBankName
      ? stu_args?.studentBankName.toUpperCase()
      : stu_args?.studentBankName;
    stu_args.studentBankAccountHolderName =
      stu_args?.studentBankAccountHolderName
        ? stu_args?.studentBankAccountHolderName.toUpperCase()
        : stu_args?.studentBankAccountHolderName;
    stu_args.studentBankIfsc = stu_args?.studentBankIfsc
      ? stu_args?.studentBankIfsc.toUpperCase()
      : stu_args?.studentBankIfsc;
    stu_args.studentEmail = stu_args?.studentEmail
      ? stu_args?.studentEmail.toUpperCase()
      : stu_args?.studentEmail;
    stu_args.student_degree_institute = stu_args?.student_degree_institute
      ? stu_args?.student_degree_institute.toUpperCase()
      : stu_args?.student_degree_institute;
    stu_args.student_programme = stu_args?.student_programme
      ? stu_args?.student_programme.toUpperCase()
      : stu_args?.student_programme;
    stu_args.student_branch = stu_args?.student_branch
      ? stu_args?.student_branch.toUpperCase()
      : stu_args?.student_branch;

    await stu_args.save();
    return { case: "UPPER" };
  } catch (e) {
    console.log(e);
  }
};
