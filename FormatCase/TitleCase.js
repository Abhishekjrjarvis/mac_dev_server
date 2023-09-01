function title_case(str) {
  if (str === null || str === "") return false;
  else str = str.toString();

  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

exports.all_title_case_query = async (stu_args) => {
  try {
    stu_args.studentFirstName = stu_args?.studentFirstName
      ? title_case(stu_args?.studentFirstName)
      : stu_args?.studentFirstName;
    stu_args.studentMiddleName = stu_args?.studentMiddleName
      ? title_case(stu_args?.studentMiddleName)
      : stu_args?.studentMiddleName;
    stu_args.studentLastName = stu_args?.studentLastName
      ? title_case(stu_args?.studentLastName)
      : stu_args?.studentLastName;
    stu_args.valid_full_name = stu_args?.valid_full_name
      ? title_case(stu_args?.valid_full_name)
      : stu_args?.valid_full_name;
    stu_args.studentMTongue = stu_args?.studentMTongue
      ? title_case(stu_args?.studentMTongue)
      : stu_args?.studentMTongue;
    stu_args.studentReligion = stu_args?.studentReligion
      ? title_case(stu_args?.studentReligion)
      : stu_args?.studentReligion;
    stu_args.studentNationality = stu_args?.studentNationality
      ? title_case(stu_args?.studentNationality)
      : stu_args?.studentNationality;
    stu_args.studentCast = stu_args?.studentCast
      ? title_case(stu_args?.studentCast)
      : stu_args?.studentCast;
    stu_args.studentCastCategory = stu_args?.studentCastCategory
      ? title_case(stu_args?.studentCastCategory)
      : stu_args?.studentCastCategory;
    stu_args.studentMotherName = stu_args?.studentMotherName
      ? title_case(stu_args?.studentMotherName)
      : stu_args?.studentMotherName;
    stu_args.studentBirthPlace = stu_args?.studentBirthPlace
      ? title_case(stu_args?.studentBirthPlace)
      : stu_args?.studentBirthPlace;
    stu_args.studentBirthPlaceState = stu_args?.studentBirthPlaceState
      ? title_case(stu_args?.studentBirthPlaceState)
      : stu_args?.studentBirthPlaceState;
    stu_args.studentBirthPlaceDistrict = stu_args?.studentBirthPlaceDistrict
      ? title_case(stu_args?.studentBirthPlaceDistrict)
      : stu_args?.studentBirthPlaceDistrict;
    stu_args.studentDistrict = stu_args?.studentDistrict
      ? title_case(stu_args?.studentDistrict)
      : stu_args?.studentDistrict;
    stu_args.studentState = stu_args?.studentState
      ? title_case(stu_args?.studentState)
      : stu_args?.studentState;
    stu_args.studentAddress = stu_args?.studentAddress
      ? title_case(stu_args?.studentAddress)
      : stu_args?.studentAddress;
    stu_args.studentCurrentDistrict = stu_args?.studentCurrentDistrict
      ? title_case(stu_args?.studentCurrentDistrict)
      : stu_args?.studentCurrentDistrict;
    stu_args.studentCurrentState = stu_args?.studentCurrentState
      ? title_case(stu_args?.studentCurrentState)
      : stu_args?.studentCurrentState;
    stu_args.studentCurrentAddress = stu_args?.studentCurrentAddress
      ? title_case(stu_args?.studentCurrentAddress)
      : stu_args?.studentCurrentAddress;
    stu_args.studentParentsName = stu_args?.studentParentsName
      ? title_case(stu_args?.studentParentsName)
      : stu_args?.studentParentsName;
    stu_args.studentParentsOccupation = stu_args?.studentParentsOccupation
      ? title_case(stu_args?.studentParentsOccupation)
      : stu_args?.studentParentsOccupation;
    stu_args.studentPreviousSchool = stu_args?.studentPreviousSchool
      ? title_case(stu_args?.studentPreviousSchool)
      : stu_args?.studentPreviousSchool;
    stu_args.studentBankName = stu_args?.studentBankName
      ? title_case(stu_args?.studentBankName)
      : stu_args?.studentBankName;
    stu_args.studentBankAccountHolderName =
      stu_args?.studentBankAccountHolderName
        ? title_case(stu_args?.studentBankAccountHolderName)
        : stu_args?.studentBankAccountHolderName;
    stu_args.studentBankIfsc = stu_args?.studentBankIfsc
      ? title_case(stu_args?.studentBankIfsc)
      : stu_args?.studentBankIfsc;
    stu_args.studentEmail = stu_args?.studentEmail
      ? title_case(stu_args?.studentEmail)
      : stu_args?.studentEmail;
    stu_args.student_degree_institute = stu_args?.student_degree_institute
      ? title_case(stu_args?.student_degree_institute)
      : stu_args?.student_degree_institute;
    stu_args.student_programme = stu_args?.student_programme
      ? title_case(stu_args?.student_programme)
      : stu_args?.student_programme;
    stu_args.student_branch = stu_args?.student_branch
      ? title_case(stu_args?.student_branch)
      : stu_args?.student_branch;

    await stu_args.save();
    return { case: "TITLE" };
  } catch (e) {
    console.log(e);
  }
};
