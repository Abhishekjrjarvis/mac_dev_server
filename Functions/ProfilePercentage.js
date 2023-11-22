const Student = require("../models/Student")

exports.calc_profile_percentage = async(student) => {
  try{
    const one_student = await Student.findById({ _id: `${student?._id}`})
    var real = 0
    var total = 36
    if(one_student?.studentFirstName) real += 1
    if(one_student?.studentLastName) real += 1
    if(one_student?.studentDOB) real += 1
    if(one_student?.studentGender) real += 1
    if(one_student?.studentMotherName) real += 1
    if(one_student?.studentProfilePhoto) real += 1

    if(one_student?.studentBirthPlace) real += 1
    if(one_student?.studentPhoneNumber) real += 1
    if(one_student?.studentFatherRationCardColor) real += 1
    if(one_student?.studentAadharNumber) real += 1
    if(one_student?.studentEmail) real += 1
    if(one_student?.student_blood_group) real += 1

    if(one_student?.studentNationality) real += 1
    if(one_student?.studentReligion) real += 1
    if(one_student?.studentCast) real += 1
    if(one_student?.studentCastCategory) real += 1
    if(one_student?.studentMTongue) real += 1

    if(one_student?.studentAddress) real += 1
    if(one_student?.studentCurrentAddress) real += 1
    if(one_student?.studentPincode) real += 1
    if(one_student?.studentCurrentPincode) real += 1

    if(one_student?.studentParentsName) real += 1
    if(one_student?.studentParentsPhoneNumber) real += 1
    if(one_student?.studentParentsOccupation) real += 1
    if(one_student?.studentParentsAnnualIncom) real += 1

    if(one_student?.studentBankName) real += 1
    if(one_student?.studentBankAccount) real += 1
    if(one_student?.studentBankAccountHolderName) real += 1
    if(one_student?.studentBankIfsc) real += 1
    if(one_student?.studentBankPassbook) real += 1

    if (one_student?.student_anti_ragging) real += 1

    if (one_student?.student_id_card_front) real += 1
    if (one_student?.student_id_card_back) real += 1

    if (one_student?.studentPreviousSchool) real += 1

    if (one_student?.studentAadharFrontCard) real += 1
    if (one_student?.studentAadharBackCard) real += 1

    one_student.profile_percentage = ((real / total) * 100).toFixed(0)
    await one_student.save()
  }
  catch(e){
    console.log(e)
  }
}