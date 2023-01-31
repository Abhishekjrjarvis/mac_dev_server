exports.student_form_loop = async (ost, arr, sargs, pic, uargs) => {
  try {
    const studentOptionalSubject = ost ? ost : [];
    for (var file of arr) {
      if (file.name === "file") {
        sargs.photoId = "0";
        sargs.studentProfilePhoto = file.key;
        uargs.profilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        sargs.studentAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        sargs.studentAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        sargs.studentBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        sargs.studentCasteCertificatePhoto = file.key;
      else {
        sargs.studentDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    if (studentOptionalSubject?.length > 0) {
      sargs.studentOptionalSubject.push(...studentOptionalSubject);
    }
    if (pic) {
      uargs.profilePhoto = pic;
      sargs.photoId = "0";
      sargs.studentProfilePhoto = pic;
    }
    // await Promise.all([user.save(), student.save()]);
  } catch (e) {
    console.log(e);
  }
};
