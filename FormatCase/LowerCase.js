exports.all_lower_case_query = async (stu_args) => {
  try {
    stu_args.studentFirstName = stu_args?.studentFirstName
      ? stu_args?.studentFirstName.toLowerCase()
      : stu_args?.studentFirstName;
    stu_args.studentMiddleName = stu_args?.studentMiddleName
      ? stu_args?.studentMiddleName.toLowerCase()
      : stu_args?.studentMiddleName;
    stu_args.studentLastName = stu_args?.studentLastName
      ? stu_args?.studentLastName.toLowerCase()
      : stu_args?.studentLastName;
    stu_args.valid_full_name = stu_args?.valid_full_name
      ? stu_args?.valid_full_name.toLowerCase()
      : stu_args?.valid_full_name;
    stu_args.studentMTongue = stu_args?.studentMTongue
      ? stu_args?.studentMTongue.toLowerCase()
      : stu_args?.studentMTongue;
    stu_args.studentReligion = stu_args?.studentReligion
      ? stu_args?.studentReligion.toLowerCase()
      : stu_args?.studentReligion;
    stu_args.studentNationality = stu_args?.studentNationality
      ? stu_args?.studentNationality.toLowerCase()
      : stu_args?.studentNationality;
    stu_args.studentCast = stu_args?.studentCast
      ? stu_args?.studentCast.toLowerCase()
      : stu_args?.studentCast;
    stu_args.studentCastCategory = stu_args?.studentCastCategory
      ? stu_args?.studentCastCategory.toLowerCase()
      : stu_args?.studentCastCategory;
    stu_args.studentMotherName = stu_args?.studentMotherName
      ? stu_args?.studentMotherName.toLowerCase()
      : stu_args?.studentMotherName;
    stu_args.studentBirthPlace = stu_args?.studentBirthPlace
      ? stu_args?.studentBirthPlace.toLowerCase()
      : stu_args?.studentBirthPlace;
    stu_args.studentBirthPlaceState = stu_args?.studentBirthPlaceState
      ? stu_args?.studentBirthPlaceState.toLowerCase()
      : stu_args?.studentBirthPlaceState;
    stu_args.studentBirthPlaceDistrict = stu_args?.studentBirthPlaceDistrict
      ? stu_args?.studentBirthPlaceDistrict.toLowerCase()
      : stu_args?.studentBirthPlaceDistrict;
    stu_args.studentDistrict = stu_args?.studentDistrict
      ? stu_args?.studentDistrict.toLowerCase()
      : stu_args?.studentDistrict;
    stu_args.studentState = stu_args?.studentState
      ? stu_args?.studentState.toLowerCase()
      : stu_args?.studentState;
    stu_args.studentAddress = stu_args?.studentAddress
      ? stu_args?.studentAddress.toLowerCase()
      : stu_args?.studentAddress;
    stu_args.studentCurrentDistrict = stu_args?.studentCurrentDistrict
      ? stu_args?.studentCurrentDistrict.toLowerCase()
      : stu_args?.studentCurrentDistrict;
    stu_args.studentCurrentState = stu_args?.studentCurrentState
      ? stu_args?.studentCurrentState.toLowerCase()
      : stu_args?.studentCurrentState;
    stu_args.studentCurrentAddress = stu_args?.studentCurrentAddress
      ? stu_args?.studentCurrentAddress.toLowerCase()
      : stu_args?.studentCurrentAddress;
    stu_args.studentParentsName = stu_args?.studentParentsName
      ? stu_args?.studentParentsName.toLowerCase()
      : stu_args?.studentParentsName;
    stu_args.studentParentsOccupation = stu_args?.studentParentsOccupation
      ? stu_args?.studentParentsOccupation.toLowerCase()
      : stu_args?.studentParentsOccupation;
    stu_args.studentPreviousSchool = stu_args?.studentPreviousSchool
      ? stu_args?.studentPreviousSchool.toLowerCase()
      : stu_args?.studentPreviousSchool;
    stu_args.studentBankName = stu_args?.studentBankName
      ? stu_args?.studentBankName.toLowerCase()
      : stu_args?.studentBankName;
    stu_args.studentBankAccountHolderName =
      stu_args?.studentBankAccountHolderName
        ? stu_args?.studentBankAccountHolderName.toLowerCase()
        : stu_args?.studentBankAccountHolderName;
    stu_args.studentBankIfsc = stu_args?.studentBankIfsc
      ? stu_args?.studentBankIfsc.toLowerCase()
      : stu_args?.studentBankIfsc;
    stu_args.studentEmail = stu_args?.studentEmail
      ? stu_args?.studentEmail.toLowerCase()
      : stu_args?.studentEmail;
    stu_args.student_degree_institute = stu_args?.student_degree_institute
      ? stu_args?.student_degree_institute.toLowerCase()
      : stu_args?.student_degree_institute;
    stu_args.student_programme = stu_args?.student_programme
      ? stu_args?.student_programme.toLowerCase()
      : stu_args?.student_programme;
    stu_args.student_branch = stu_args?.student_branch
      ? stu_args?.student_branch.toLowerCase()
      : stu_args?.student_branch;

    await stu_args.save();
    return { case: "LOWER" };
  } catch (e) {
    console.log(e);
  }
};
