module.exports.form_params = [
    {
        section_name: "",
        section_visibilty: true,
        section_key: "",
        form_checklist: [
            {
                form_checklist_name: "Profile Photo",
                form_checklist_key: "studentProfilePhoto",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Profile Photo",
                form_checklist_lable: "Upload Profile Photo",
                form_checklist_typo: "CROPIMAGE",
                form_checklist_required: true
            }, 
            {
                form_checklist_name: "Passport Photo for ID Card",
                form_checklist_key: "studentIdProfilePhoto",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Passport Photo for ID Card",
                form_checklist_lable: "Upload Passport Photo for ID Card",
                form_checklist_typo: "CROPIMAGE",
            },
        ]
    },
    {
        section_name: "Basic Details",
        section_visibilty: true,
        section_key: "basic_details",
        form_checklist: [
            {
                form_checklist_name: "First Name",
                form_checklist_key: "studentFirstName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your First Name",
                form_checklist_lable: "Student First Name",
                form_checklist_typo: "TEXT",
                form_checklist_required: true,
                width: "32%"
            },
            {
                form_checklist_name: "Father Name",
                form_checklist_key: "studentFatherName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your Father Name",
                form_checklist_lable: "Student Father's Name",
                form_checklist_typo: "TEXT",
                form_checklist_required: true,
                width: "32%"
            },
            {
                form_checklist_name: "Surname",
                form_checklist_key: "studentLastName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your Surname",
                form_checklist_lable: "Student Surname",
                form_checklist_typo: "TEXT",
                form_checklist_required: true,
                width: "32%"
            },
            {
                form_checklist_name: "Date of Birth",
                form_checklist_key: "studentDOB",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Date of Birth",
                form_checklist_lable: "DOB",
                form_checklist_typo: "CALENDAR",
                form_checklist_required: true
            },
            {
                form_checklist_name: "Gender",
                form_checklist_key: "studentGender",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Gender",
                form_checklist_lable: "Select Gender / Sex",
                form_checklist_typo: "SELECT",
                form_checklist_required: true,
                form_checklist_typo_option_pl: ["Male", "Female", "Other"]
            },
            {
                form_checklist_name: "Mother's Name",
                form_checklist_key: "studentMotherName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Mother's Name",
                form_checklist_lable: "Mother's Name",
                form_checklist_typo: "TEXT",
                form_checklist_required: true
            },
            {
                form_checklist_name: "Name as per marksheet",
                form_checklist_key: "studentNameAsMarksheet",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Name as per marksheet",
                form_checklist_lable: "Name as per marksheet",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Name as per LC / TC",
                form_checklist_key: "studentNameAsCertificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Name as per LC / TC",
                form_checklist_lable: "Name as per LC / TC",
                form_checklist_typo: "TEXT",
            },
        ]
    },
    {
        section_name: "Other Details",
        section_visibilty: true,
        section_key: "other_details",
        form_checklist: [
            {
                form_checklist_name: "Place of Birth",
                form_checklist_key: "studentBirthPlace",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your Place of Birth",
                form_checklist_lable: "Place of Birth",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Religion",
                form_checklist_key: "studentReligion",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Religion",
                form_checklist_lable: "Select Religion",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: [
                    "Hindu",
                    "Muslim",
                    "Sikh",
                    "Christian",
                    "Parsi",
                    "Jews",
                    "Indigenous Faith",
                    "Buddhism",
                    "Jainism",
                  ]
            },
            {
                form_checklist_name: "Caste",
                form_checklist_key: "studentCast",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Caste",
                form_checklist_lable: "Select Caste",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Caste Category",
                form_checklist_key: "studentCastCategory",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Caste Category",
                form_checklist_lable: "Select Caste Category",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: [
                    "General",
                    "OBC",
                    "SC",
                    "ST",
                    "NT-A",
                    "NT-B",
                    "NT-C",
                    "NT-D",
                    "VJ",
                  ]
            },
            {
                form_checklist_name: "Nationality",
                form_checklist_key: "studentNationality",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Nationality",
                form_checklist_lable: "Nationality",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Indian", "Non-Indian"]
            },
            {
                form_checklist_name: "Ration Card Color",
                form_checklist_key: "studentFatherRationCardColor",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Ration Card Color",
                form_checklist_lable: "Ration Card Color",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["White", "Yellow", "Orange", "Don't have ration Card"]
            },
            {
                form_checklist_name: "Blood Group",
                form_checklist_key: "student_blood_group",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Blood Group",
                form_checklist_lable: "Blood Group",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
            },
            {
                form_checklist_name: "Aadhar No.",
                form_checklist_key: "studentAadharNumber",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Aadhar No.",
                form_checklist_lable: "Aadhar No.",
                form_checklist_typo: "TEXT",
            },
        ]
    },
    {
        section_name: "Contact Details",
        section_visibilty: true,
        section_key: "contactDetails",
        form_checklist: [
            {
                form_checklist_name: "Student Contact No.",
                form_checklist_key: "studentPhoneNumber",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Contact No.",
                form_checklist_lable: "Student Contact No.",
                form_checklist_typo: "NUMBER",
            },
            {
                form_checklist_name: "Student Email ID",
                form_checklist_key: "studentEmail",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Email ID",
                form_checklist_lable: "Student Email ID",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Parents / Guardian Contact No.",
                form_checklist_key: "studentParentsPhoneNumber",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Parents / Guardian Contact No.",
                form_checklist_lable: "Parents / Guardian Contact No.",
                form_checklist_typo: "NUMBER",
            },
            {
                form_checklist_name: "Student Current Address",
                form_checklist_key: "studentCurrentAddress",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Current Address",
                form_checklist_lable: "Student Current Address",
                form_checklist_typo: "TEXTAREA",
                width: "100%"
            },
            {
                form_checklist_name: "Student Current Pincode",
                form_checklist_key: "studentCurrentPincode",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Current Pincode",
                form_checklist_lable: "Student Current Pincode",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "Student Current State",
                form_checklist_key: "studentCurrentState",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Current State",
                form_checklist_lable: "Student Current State",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "Student Current District",
                form_checklist_key: "studentCurrentDistrict",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Current District",
                form_checklist_lable: "Student Current District",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "",
                form_checklist_key: "",
                form_checklist_visibility: true,
                form_checklist_placeholder: "",
                form_checklist_lable: "",
                form_checklist_typo: "Same As",
                form_checklist_required: false,
                value: ""
              },
            {
                form_checklist_name: "Student Permanent Address",
                form_checklist_key: "studentAddress",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Permanent Address",
                form_checklist_lable: "Student Permanent Address",
                form_checklist_typo: "TEXTAREA",
                width: "100%"
            },
            {
                form_checklist_name: "Student Permanent Pincode",
                form_checklist_key: "studentPincode",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Permanent Pincode",
                form_checklist_lable: "Student Permanent Pincode",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "Student Permanent State",
                form_checklist_key: "studentState",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Permanent State",
                form_checklist_lable: "Student Permanent State",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "Student Permanent District",
                form_checklist_key: "studentDistrict",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Student Permanent District",
                form_checklist_lable: "Student Permanent District",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
        ]
    },
    {
        section_name: "Parent / Guardian Details",
        section_visibilty: true,
        section_key: "parentDetails",
        form_checklist: [
            {
                form_checklist_name: "Parent's Name",
                form_checklist_key: "studentParentsName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Parent's Name",
                form_checklist_lable: "Parent's Name",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Parent's Contact No.",
                form_checklist_key: "studentParentsPhoneNumber",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Parent's Contact No.",
                form_checklist_lable: "Parent's Contact No.",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Parent's Email ID",
                form_checklist_key: "studentParentsEmail",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Parent's Email ID",
                form_checklist_lable: "Parent's Email ID",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Parent's Occupation",
                form_checklist_key: "studentParentsOccupation",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Parent's Occupation",
                form_checklist_lable: "Parent's Occupation",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Parent's Office Address",
                form_checklist_key: "studentParentsAddress",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Parent's Office Address",
                form_checklist_lable: "Parent's Office Address",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Annual Income",
                form_checklist_key: "studentParentsAnnualIncom",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Annual Income",
                form_checklist_lable: "Select Annual Income",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: [
                    "Less than 1 Lac",
                    "Between 1 Lac to 2.5 lacs",
                    "Between 2.5 lacs to 5 lacs",
                    "Between 5 lacs to 10 lacs",
                    "Between 10 lacs to 30 lacs",
                    "More than 30 lacs",
                  ]
            },
        ]
    },
    {
        section_name: "Admission Details",
        section_visibilty: true,
        section_key: "admissionDetails",
        form_checklist: [
            {
                form_checklist_name: "Seat Type",
                form_checklist_key: "student_seat_type",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Seat Type",
                form_checklist_lable: "Seat Type",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["General/OPEN", "OBC", "SBC", "EWS", "TFWS", "VJNT", "NT-A", "NT-B", "NT-C", "Physically Handicapped", "Defence Quota", "J&K & NEUT", "PMSS"]
            },
            {
                form_checklist_name: "Physically Handicapped",
                form_checklist_key: "student_ph",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Physically Handicapped",
                form_checklist_lable: "Physically Handicapped",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Yes", "No"]
            },
            {
                form_checklist_name: "Physically Handicapped Type",
                form_checklist_key: "student_ph_type",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Physically Handicapped Type",
                form_checklist_lable: "Physically Handicapped Type",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Defence Personnel Word",
                form_checklist_key: "student_defence_personnel_word",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Defence Personnel Word",
                form_checklist_lable: "Defence Personnel Word",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Yes", "No"]
            },
            {
                form_checklist_name: "Marital Status",
                form_checklist_key: "student_marital_status",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Marital Status",
                form_checklist_lable: "Marital Status",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["UnMarried", "Married"]
            },
        ]
    },
    {
        section_name: "Previous Attended / Institute Details",
        section_visibilty: true,
        section_key: "previousAttendedInstituteDetails",
        form_checklist: [
            {
                form_checklist_name: "Board / University",
                form_checklist_key: "student_board_university",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Board / University",
                form_checklist_lable: "Board / University",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Previous Institute Name",
                form_checklist_key: "studentPreviousSchool",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Previous Institute Name",
                form_checklist_lable: "Previous Institute Name",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Course",
                form_checklist_key: "student_university_courses",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter University Courses",
                form_checklist_lable: "University Courses",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Passing Year",
                form_checklist_key: "student_year",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Passing Year",
                form_checklist_lable: "Passing Year",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Class",
                form_checklist_key: "student_previous_class",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Class",
                form_checklist_lable: "Class",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Marks",
                form_checklist_key: "student_previous_marks",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Marks",
                form_checklist_lable: "Marks",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Percentage",
                form_checklist_key: "student_previous_percentage",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Percentage",
                form_checklist_lable: "Percentage",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Seat No.",
                form_checklist_key: "student_previous_section",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Seat No.",
                form_checklist_lable: "Seat No.",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "LC / TC Attachment",
                form_checklist_key: "student_previous_lctc",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload LC / TC Attachment",
                form_checklist_lable: "Upload LC / TC Attachment",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Marksheet Attachment",
                form_checklist_key: "student_previous_marksheet_attachment",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Marksheet Attachment",
                form_checklist_lable: "Upload Marksheet Attachment",
                form_checklist_typo: "FILE",
            },
        ]
    },
    {
        section_name: "Undertakings",
        section_visibilty: true,
        section_key: "undertakings",
        section_view: "View Sample",
        section_pdf: "",
        section_stats: "undertakings",
        section_value: `
        1.I @STUDENT_NAME have read all the rules of admission for the year & undertake to abide by the same
 2.The information given by me in my application is true to be the best knowledge and belief
 3.I have not been debarred from appearing at any examination held by the government or any statutory body
 in India
4.I hereby agree to confirm to any Rules Act & Laws enforced by government and i hereby undertake that so
 long as I remain student of college, I will do nothing either inside or out of the college which my result in
 disciplinary action against the under the rules of conduct and discipline
 5.I fully understand that the Principal of the @INSTITUTE_NAME, Bhavans
 Campus, Munshi Nagar, Andheri West, Mumbai ,willhavefullyauthority to expel me from the
 college of any infringement of rules of conduct and discipline
 6.I am fully aware that there is likely to be change in the fee structure and I understand to pay fees
 whatsoever, approved by competent authority
 7.I am fully aware that i wil not be allow to appear for the examination if I do not attend minimum 75% class
 in theory, practical, drawing etc. , I am also aware that i will not allow to appear for the examination if I fail to
 submit satisfactory all the assignment job, journal, drawing, reports as specified by the university within
 stipulated time limit
 8.I am admitted under (SC / ST / OBC / VJNT / SBC / EWS) category. If i do not apply to appropriate authority
 for free ship / scholarship (State Government/ Central Government) for reimbursement of fees, i will be
 responsible to pay the full fees applicable for Open Category Student
 9.If the government decides not to reimburse or sanction the fees for any reason whatsoever then I am liable
 to pay the full fees as application to the Open Category Student
 10.If the government decides not to reimburse or sanction the fees for any reason whatsoever then I am
 liable to pay the full fees as application to the Open Category Student The fee structure for the year is
 tentative. In case competent authority makes any changes in the fees, i will be responsible to pay the fees
 accordingly
        `,
        form_checklist: [
            {
                form_checklist_name: "Undertakings",
                form_checklist_key: "student_undertakings",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Undertakings",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "I Agree",
                form_checklist_typo_option_pl: ["I Agree"]
            },
        ]
    },
    {
        section_name: "Anti-Ragging Affidavit By The Student",
        section_visibilty: true,
        section_key: "antiragging_affidavit",
        section_view: "View Sample",
        section_pdf: "",
        section_stats: "antiragging_affidavit",
        section_value: "",
        form_checklist: [
            {
                form_checklist_name: "Anti-Ragging Affidavit By The Student",
                form_checklist_key: "student_anti_ragging",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Anti-Ragging Affidavit By The Student",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "I Agree",
                form_checklist_typo_option_pl: ["I Agree"]
            },
        ]
    },
    {
        section_name: "Documents",
        section_visibilty: true,
        section_key: "documents",
        form_checklist: [ 
            {
                form_checklist_name: "Aadhar Card Front",
                form_checklist_key: "studentAadharFrontCard",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Aadhar Front Card",
                form_checklist_lable: "Upload Aadhar Front Card",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Aadhar Card Back",
                form_checklist_key: "studentAadharBackCard",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Aadhar Back Card",
                form_checklist_lable: "Upload Aadhar Back Card",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Student's Signature",
                form_checklist_key: "student_signature",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Student's Signature",
                form_checklist_lable: "Upload Student's Signature",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Student Parent's Signature",
                form_checklist_key: "student_parents_signature",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Student Parent's Signature",
                form_checklist_lable: "Upload Student Parent's Signature",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Student PAN Card",
                form_checklist_key: "student_pan_card",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Student PAN Card",
                form_checklist_lable: "Upload Student PAN Card",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Student Ration Card",
                form_checklist_key: "student_ration_card",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Student Ration Card",
                form_checklist_lable: "Upload Student Ration Card",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Income Certificate",
                form_checklist_key: "incomeCertificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Income Certificate",
                form_checklist_lable: "Upload Income Certificate",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Migration Certificate",
                form_checklist_key: "migrationCertificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Migration Certificate",
                form_checklist_lable: "Upload Migration Certificate",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Non - Creamy Layer Certificate",
                form_checklist_key: "nonCreamyLayerCertificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Non - Creamy Layer Certificate",
                form_checklist_lable: "Upload Non - Creamy Layer Certificate",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Domicile Certificate",
                form_checklist_key: "domicileCertificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Domicile Certificate",
                form_checklist_lable: "Upload Domicile Certificate",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Nationality Certificate",
                form_checklist_key: "nationalityCertificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Nationality Certificate",
                form_checklist_lable: "Upload Nationality Certificate",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Caste Certificate",
                form_checklist_key: "caste_certificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Caste Certificate",
                form_checklist_lable: "Upload Caste Certificate",
                form_checklist_typo: "FILE",
                // form_checklist_radio: ["Yes", "No"],
                // form_checklist_radio_lable: "Is Open Category Student",
                // form_checklist_
            },
            {
                form_checklist_name: "Eligibilty Certificate",
                form_checklist_key: "eligibilty_certificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Eligibilty Certificate",
                form_checklist_lable: "Upload Eligibilty Certificate",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "University Eligibilty Form",
                form_checklist_key: "university_eligibility_form",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload University Eligibilty Form",
                form_checklist_lable: "Upload University Eligibilty Form",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Physically Handicapped Certificate",
                form_checklist_key: "ph_certificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Physically Handicapped Certificate",
                form_checklist_lable: "Upload Physically Handicapped Certificate",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "GAP Certificate",
                form_checklist_key: "gap_certificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload GAP Certificate",
                form_checklist_lable: "Upload GAP Certificate",
                form_checklist_typo: "FILE",
            },
        ]
    },
    // {
    //     section_name: "Academic Details",
    //     section_visibilty: true,
    //     section_key: "academic_details",
    //     form_checklist: [ 
    //         {
    //             form_checklist_name: "Aadhar Card Front",
    //             form_checklist_key: "studentAadharFrontCard",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Aadhar Front Card",
    //             form_checklist_lable: "Upload Aadhar Front Card",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Aadhar Card Back",
    //             form_checklist_key: "studentAadharBackCard",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Aadhar Back Card",
    //             form_checklist_lable: "Upload Aadhar Back Card",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Student's Signature",
    //             form_checklist_key: "student_signature",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Student's Signature",
    //             form_checklist_lable: "Upload Student's Signature",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Student Parent's Signature",
    //             form_checklist_key: "student_parents_signature",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Student Parent's Signature",
    //             form_checklist_lable: "Upload Student Parent's Signature",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Student PAN Card",
    //             form_checklist_key: "student_pan_card",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Student PAN Card",
    //             form_checklist_lable: "Upload Student PAN Card",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Student Ration Card",
    //             form_checklist_key: "student_ration_card",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Student Ration Card",
    //             form_checklist_lable: "Upload Student Ration Card",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Income Certificate",
    //             form_checklist_key: "incomeCertificate",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Income Certificate",
    //             form_checklist_lable: "Upload Income Certificate",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Leaving / Transfer Certificate",
    //             form_checklist_key: "leavingTransferCertificate",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Leaving / Transfer Certificate",
    //             form_checklist_lable: "Upload Leaving / Transfer Certificate",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Non - Creamy Layer Certificate",
    //             form_checklist_key: "nonCreamyLayerCertificate",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Non - Creamy Layer Certificate",
    //             form_checklist_lable: "Upload Non - Creamy Layer Certificate",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Domicile Certificate",
    //             form_checklist_key: "domicileCertificate",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Domicile Certificate",
    //             form_checklist_lable: "Upload Domicile Certificate",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Nationality Certificate",
    //             form_checklist_key: "nationalityCertificate",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Nationality Certificate",
    //             form_checklist_lable: "Upload Nationality Certificate",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Last Year Certificate",
    //             form_checklist_key: "lastYearMarksheet",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Last Year Certificate",
    //             form_checklist_lable: "Upload Last Year Certificate",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Joining Transfer Letter",
    //             form_checklist_key: "joiningTransferLetter",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Joining Transfer Letter",
    //             form_checklist_lable: "Upload Joining Transfer Letter",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Identity Document",
    //             form_checklist_key: "identityDocument",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Identity Document",
    //             form_checklist_lable: "Upload Identity Document",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "University Eligibilty Form",
    //             form_checklist_key: "university_eligibility_form",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload University Eligibilty Form",
    //             form_checklist_lable: "Upload University Eligibilty Form",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "Physically Handicapped Certificate",
    //             form_checklist_key: "ph_certificate",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload Physically Handicapped Certificate",
    //             form_checklist_lable: "Upload Physically Handicapped Certificate",
    //             form_checklist_typo: "FILE",
    //         },
    //         {
    //             form_checklist_name: "GAP Certificate",
    //             form_checklist_key: "gap_certificate",
    //             form_checklist_visibility: true,
    //             form_checklist_placeholder: "Upload GAP Certificate",
    //             form_checklist_lable: "Upload GAP Certificate",
    //             form_checklist_typo: "FILE",
    //         },
    //     ]
    // }
]