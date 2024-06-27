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
                form_checklist_required: true
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
                    "Other"
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
                    "SBC"
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
                form_checklist_typo: "NUMBER",
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
                form_checklist_typo: "NUMBER",
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
                form_checklist_typo_option_pl: ["Yes", "No"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Physically Handicapped Type",
                form_checklist_key: "student_ph_type",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Physically Handicapped Type",
                form_checklist_lable: "Physically Handicapped Type",
                form_checklist_typo: "TEXT",
                form_common_key: "student_ph"
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
        section_name: "Academic Details",
        section_visibilty: true,
        section_key: "academic_details",
        form_checklist: [ 
            {
                form_checklist_name: "Std 10th Details",
                form_checklist_key: "std_tenth_details",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Std 10th Details",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Std 10th Details",
                form_checklist_typo_option_pl: ["Std 10th Details"],
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                    }
                ]
            },
            {
                form_checklist_name: "HSC (10+2) / Diploma",
                form_checklist_key: "hsc_diploma",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter HSC (10+2) / Diploma",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "HSC (10+2) / Diploma",
                form_checklist_typo_option_pl: ["HSC (10+2) / Diploma"],
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month",
                        form_checklist_key: "hsc_month",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month",
                        form_checklist_lable: "Enter Month",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Year",
                        form_checklist_key: "hsc_year",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year",
                        form_checklist_lable: "Enter Year",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "hsc_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "hsc_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Board",
                        form_checklist_key: "hsc_board",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Board",
                        form_checklist_lable: "Enter Board",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Board",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Candidate Type",
                        form_checklist_key: "hsc_candidate_type",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Candidate Type",
                        form_checklist_lable: "Enter Candidate Type",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Candidate Type",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Vocational Type",
                        form_checklist_key: "hsc_vocational_type",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Vocational Type",
                        form_checklist_lable: "Enter Vocational Type",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Vocational Type",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Physics Marks Obtained",
                        form_checklist_key: "hsc_physics_marks",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Physics Marks Obtained",
                        form_checklist_lable: "Enter Physics Marks Obtained",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Physics Marks Obtained",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Chemistry Marks Obtained",
                        form_checklist_key: "hsc_chemistry_marks",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Chemistry Marks Obtained",
                        form_checklist_lable: "Enter Chemistry Marks Obtained",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Chemistry Marks Obtained",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "Mathematics Marks Obtained",
                        form_checklist_key: "hsc_mathematics_marks",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Mathematics Marks Obtained",
                        form_checklist_lable: "Enter Mathematics Marks Obtained",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Mathematics Marks Obtained",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "PCM Total",
                        form_checklist_key: "hsc_pcm_total",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter PCM Total",
                        form_checklist_lable: "Enter PCM Total",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "PCM Total",
                        form_checklist_typo_option_pl: [],
                    },
                    {
                        form_checklist_name: "HSC Grand Total",
                        form_checklist_key: "hsc_grand_total",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter HSC Grand Total",
                        form_checklist_lable: "Enter HSC Grand Total",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "HSC Grand Total",
                        form_checklist_typo_option_pl: [],
                    }
                ]
            },
            {
                form_checklist_name: "UG For Engineering",
                form_checklist_key: "ug_engineering",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter UG For Engineering",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "UG For Engineering",
                form_checklist_typo_option_pl: ["UG For Engineering"],
                nested_form_checklist: [
                    {
                        form_checklist_name: "Pre-final Sem",
                        form_checklist_key: "pre_final_sem",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Pre-final Sem",
                        form_checklist_lable: "",
                        form_checklist_typo: "CHECKBOX",
                        form_checklist_sample: "Pre-final Sem",
                        form_checklist_typo_option_pl: ["Pre-final Sem"],
                        nested_form_checklist_nested: [
                            {
                                form_checklist_name: "Marks / Credits Obtain",
                                form_checklist_key: "pre_marks_credit_obtain",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Marks / Credits Obtain",
                                form_checklist_lable: "Enter Marks / Credits Obtain",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Marks / Credits Obtain",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Total Grade Points",
                                form_checklist_key: "pre_total_grade_points",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Total Grade Points",
                                form_checklist_lable: "Enter Total Grade Points",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Total Grade Points",
                                form_checklist_typo_option_pl: [],
                            },
                        ]
                    },
                    {
                        form_checklist_name: "Final Sem / Year",
                        form_checklist_key: "final_sem",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Final Sem / Year",
                        form_checklist_lable: "",
                        form_checklist_typo: "CHECKBOX",
                        form_checklist_sample: "Final Sem / Year",
                        form_checklist_typo_option_pl: ["Final Sem / Year"],
                        nested_form_checklist_nested: [
                            {
                                form_checklist_name: "Marks / Credits Obtain",
                                form_checklist_key: "final_marks_credit_obtain",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Marks / Credits Obtain",
                                form_checklist_lable: "Enter Marks / Credits Obtain",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Marks / Credits Obtain",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Total Grade Points",
                                form_checklist_key: "final_total_grade_points",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Total Grade Points",
                                form_checklist_lable: "Enter Total Grade Points",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Total Grade Points",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "CPI",
                                form_checklist_key: "final_cpi",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter CPI",
                                form_checklist_lable: "Enter CPI",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "CPI",
                                form_checklist_typo_option_pl: [],
                            },
                        ]
                    }
                ]
            },
            {
                form_checklist_name: "Entrance Exam",
                form_checklist_key: "entrance_exam",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Entrance Exam",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Entrance Exam",
                form_checklist_typo_option_pl: ["Entrance Exam"],
                nested_form_checklist: [
                    {
                        form_checklist_name: "JEE Details",
                        form_checklist_key: "jee_details",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter JEE Details",
                        form_checklist_lable: "",
                        form_checklist_typo: "CHECKBOX",
                        form_checklist_sample: "JEE Details",
                        form_checklist_typo_option_pl: ["JEE Details"],
                        nested_form_checklist_nested: [
                            {
                                form_checklist_name: "ROLL No.",
                                form_checklist_key: "jee_rollno",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter ROLL No.",
                                form_checklist_lable: "Enter ROLL No.",
                                form_checklist_typo: "TEXT",
                                form_checklist_sample: "ROLL No.",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Physics Marks Obtained",
                                form_checklist_key: "jee_physics_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Physics Marks Obtained",
                                form_checklist_lable: "Enter Physics Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Physics Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Chemistry Marks Obtained",
                                form_checklist_key: "jee_chemistry_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Chemistry Marks Obtained",
                                form_checklist_lable: "Enter Chemistry Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Chemistry Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Mathematics Marks Obtained",
                                form_checklist_key: "jee_mathematics_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Mathematics Marks Obtained",
                                form_checklist_lable: "Enter Mathematics Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Mathematics Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "JEE Total",
                                form_checklist_key: "jee_total",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter JEE Total",
                                form_checklist_lable: "Enter JEE Total",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "JEE Total",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "JEE Percentile",
                                form_checklist_key: "jee_percentile",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter JEE Percentile",
                                form_checklist_lable: "Enter JEE Percentile",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "JEE Percentile",
                                form_checklist_typo_option_pl: [],
                            }
                        ]
                    },
                    {
                        form_checklist_name: "CET Details",
                        form_checklist_key: "cet_details",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter CET Details",
                        form_checklist_lable: "",
                        form_checklist_typo: "CHECKBOX",
                        form_checklist_sample: "CET Details",
                        form_checklist_typo_option_pl: ["CET Details"],
                        nested_form_checklist_nested: [
                            {
                                form_checklist_name: "ROLL No.",
                                form_checklist_key: "cet_rollno",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter ROLL No.",
                                form_checklist_lable: "Enter ROLL No.",
                                form_checklist_typo: "TEXT",
                                form_checklist_sample: "ROLL No.",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Physics Marks Obtained",
                                form_checklist_key: "cet_physics_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Physics Marks Obtained",
                                form_checklist_lable: "Enter Physics Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Physics Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Chemistry Marks Obtained",
                                form_checklist_key: "cet_chemistry_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Chemistry Marks Obtained",
                                form_checklist_lable: "Enter Chemistry Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Chemistry Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Mathematics Marks Obtained",
                                form_checklist_key: "cet_mathematics_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Mathematics Marks Obtained",
                                form_checklist_lable: "Enter Mathematics Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Mathematics Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Biology Marks Obtained",
                                form_checklist_key: "cet_biology_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Biology Marks Obtained",
                                form_checklist_lable: "Enter Biology Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Biology Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "CET Total",
                                form_checklist_key: "cet_total",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter CET Total",
                                form_checklist_lable: "Enter CET Total",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "CET Total",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "CET Percentile",
                                form_checklist_key: "cet_percentile",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter CET Percentile",
                                form_checklist_lable: "Enter CET Percentile",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "CET Percentile",
                                form_checklist_typo_option_pl: [],
                            }
                        ]
                    },
                    {
                        form_checklist_name: "AIEEE Details",
                        form_checklist_key: "aieee_details",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter AIEEE Details",
                        form_checklist_lable: "",
                        form_checklist_typo: "CHECKBOX",
                        form_checklist_sample: "AIEEE Details",
                        form_checklist_typo_option_pl: ["AIEEE Details"],
                        nested_form_checklist_nested: [
                            {
                                form_checklist_name: "ROLL No.",
                                form_checklist_key: "aieee_rollno",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter ROLL No.",
                                form_checklist_lable: "Enter ROLL No.",
                                form_checklist_typo: "TEXT",
                                form_checklist_sample: "ROLL No.",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Physics Marks Obtained",
                                form_checklist_key: "aieee_physics_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Physics Marks Obtained",
                                form_checklist_lable: "Enter Physics Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Physics Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Chemistry Marks Obtained",
                                form_checklist_key: "aieee_chemistry_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Chemistry Marks Obtained",
                                form_checklist_lable: "Enter Chemistry Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Chemistry Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Mathematics Marks Obtained",
                                form_checklist_key: "aieee_mathematics_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Mathematics Marks Obtained",
                                form_checklist_lable: "Enter Mathematics Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Mathematics Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "Biology Marks Obtained",
                                form_checklist_key: "aieee_biology_marks",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter Biology Marks Obtained",
                                form_checklist_lable: "Enter Biology Marks Obtained",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "Biology Marks Obtained",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "AIEEE Total",
                                form_checklist_key: "aieee_total",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter AIEEE Total",
                                form_checklist_lable: "Enter AIEEE Total",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "AIEEE Total",
                                form_checklist_typo_option_pl: [],
                            },
                            {
                                form_checklist_name: "AIEEE Percentile",
                                form_checklist_key: "aieee_percentile",
                                form_checklist_visibility: true,
                                form_checklist_placeholder: "Enter AIEEE Percentile",
                                form_checklist_lable: "Enter AIEEE Percentile",
                                form_checklist_typo: "NUMBER",
                                form_checklist_sample: "AIEEE Percentile",
                                form_checklist_typo_option_pl: [],
                            }
                        ]
                    }
                ]
            },
            {
                form_checklist_name: "F.Y.J.C",
                form_checklist_key: "fyjc",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter F.Y.J.C",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "F.Y.J.C",
                form_checklist_typo_option_pl: ["F.Y.J.C"],
                form_checklist_key_status: "DYNAMIC",
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "fyjc_month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "fyjc_year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "fyjc_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "fyjc_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    }
                ]
            },
            {
                form_checklist_name: "F.Y. Sem-I",
                form_checklist_key: "fy_sem_I",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter F.Y. Sem-I",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "F.Y. Sem-I",
                form_checklist_typo_option_pl: ["F.Y. Sem-I"],
                form_checklist_key_status: "DYNAMIC",
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "fy_sem_I_month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "fy_sem_I_year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "fy_sem_I_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "fy_sem_I_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    }
                ]
            },
            {
                form_checklist_name: "F.Y. Sem-II",
                form_checklist_key: "fy_sem_II",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter F.Y. Sem-II",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "F.Y. Sem-II",
                form_checklist_typo_option_pl: ["F.Y. Sem-II"],
                form_checklist_key_status: "DYNAMIC",
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "fy_sem_II_month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "fy_sem_II_year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "fy_sem_II_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "fy_sem_II_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    }
                ]
            },
            {
                form_checklist_name: "S.Y. Sem-III",
                form_checklist_key: "sy_sem_III",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter S.Y. Sem-III",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "S.Y. Sem-III",
                form_checklist_typo_option_pl: ["S.Y. Sem-III"],
                form_checklist_key_status: "DYNAMIC",
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "sy_sem_III_month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "sy_sem_III_year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "sy_sem_III_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "sy_sem_III_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    }
                ]
            },
            {
                form_checklist_name: "S.Y. Sem-IV",
                form_checklist_key: "sy_sem_IV",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter S.Y. Sem-IV",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "S.Y. Sem-IV",
                form_checklist_typo_option_pl: ["S.Y. Sem-IV"],
                form_checklist_key_status: "DYNAMIC",
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "sy_sem_IV_month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "sy_sem_IV_year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "sy_sem_IV_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "sy_sem_IV_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    }
                ]
            },
            {
                form_checklist_name: "T.Y. Sem-V",
                form_checklist_key: "ty_sem_V",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter T.Y. Sem-V",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "T.Y. Sem-V",
                form_checklist_typo_option_pl: ["T.Y. Sem-V"],
                form_checklist_key_status: "DYNAMIC",
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "ty_sem_V_month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "ty_sem_V_year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "ty_sem_V_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "ty_sem_V_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    }
                ]
            },
            {
                form_checklist_name: "T.Y. Sem-VI",
                form_checklist_key: "ty_sem_VI",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter T.Y. Sem-VI",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "T.Y. Sem-VI",
                form_checklist_typo_option_pl: ["T.Y. Sem-VI"],
                form_checklist_key_status: "DYNAMIC",
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "ty_sem_VI_month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "ty_sem_VI_year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "ty_sem_VI_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "ty_sem_VI_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    }
                ]
            },
            {
                form_checklist_name: "M.Sc/M.Com",
                form_checklist_key: "msc_mcom",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter M.Sc/M.Com",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "M.Sc/M.Com",
                form_checklist_typo_option_pl: ["M.Sc/M.Com"],
                form_checklist_key_status: "DYNAMIC",
                nested_form_checklist: [
                    {
                        form_checklist_name: "Month of Passing",
                        form_checklist_key: "msc_mcom_month_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Month of Passing",
                        form_checklist_lable: "Enter Month of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Month of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Year of Passing",
                        form_checklist_key: "msc_mcom_year_of_passing",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Year of Passing",
                        form_checklist_lable: "Enter Year of Passing",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Year of Passing",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Percentage",
                        form_checklist_key: "msc_mcom_percentage",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Percentage",
                        form_checklist_lable: "Enter Percentage",
                        form_checklist_typo: "NUMBER",
                        form_checklist_sample: "Percentage",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    },
                    {
                        form_checklist_name: "Name of Institute",
                        form_checklist_key: "msc_mcom_name_of_institute",
                        form_checklist_visibility: true,
                        form_checklist_placeholder: "Enter Name of Institute",
                        form_checklist_lable: "Enter Name of Institute",
                        form_checklist_typo: "TEXT",
                        form_checklist_sample: "Name of Institute",
                        form_checklist_typo_option_pl: [],
                        form_checklist_key_status: "DYNAMIC"
                    }
                ]
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
                form_checklist_typo: "CROPIMAGE",
                form_checklist_required: true
            },
            {
                form_checklist_name: "Student Parent's Signature",
                form_checklist_key: "student_parents_signature",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Student Parent's Signature",
                form_checklist_lable: "Upload Student Parent's Signature",
                form_checklist_typo: "CROPIMAGE",
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
                form_checklist_name: "Are you from other than Pune University",
                form_checklist_key: "is_migrate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Are you from other than Pune University",
                form_checklist_lable: "Are you from other than Pune University",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Yes", "No"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Migration Certificate",
                form_checklist_key: "migrationCertificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Migration Certificate",
                form_checklist_lable: "Upload Migration Certificate",
                form_checklist_typo: "FILE",
                form_common_key: "is_migrate"
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
                form_checklist_name: "DOMICILE (Applicable)",
                form_checklist_key: "is_domicile",
                form_checklist_visibility: true,
                form_checklist_placeholder: "DOMICILE (Applicable)",
                form_checklist_lable: "DOMICILE (Applicable)",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Yes", "No"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Domicile Certificate",
                form_checklist_key: "domicileCertificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Domicile Certificate",
                form_checklist_lable: "Upload Domicile Certificate",
                form_checklist_typo: "FILE",
                form_common_key: "is_domicile"
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
                form_checklist_name: "Are you from Reserved Category (Other than Open)",
                form_checklist_key: "is_open_category",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Are you from Reserved Category (Other than Open)",
                form_checklist_lable: "Are you from Reserved Category (Other than Open)",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Yes", "No"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Caste Certificate",
                form_checklist_key: "caste_certificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Caste Certificate",
                form_checklist_lable: "Upload Caste Certificate",
                form_checklist_typo: "FILE",
                form_common_key: "is_open_category"
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
                form_checklist_name: "Are you physically handicapped",
                form_checklist_key: "is_ph",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Are you physically handicapped",
                form_checklist_lable: "Are you physically handicapped",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Yes", "No"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Physically Handicapped Certificate",
                form_checklist_key: "ph_certificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Physically Handicapped Certificate",
                form_checklist_lable: "Upload Physically Handicapped Certificate",
                form_checklist_typo: "FILE",
                form_common_key: "is_ph"
            },
            {
                form_checklist_name: "GAP (Applicable)",
                form_checklist_key: "is_gap",
                form_checklist_visibility: true,
                form_checklist_placeholder: "GAP (Applicable)",
                form_checklist_lable: "GAP (Applicable)",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Yes", "No"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "GAP Certificate",
                form_checklist_key: "gap_certificate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload GAP Certificate",
                form_checklist_lable: "Upload GAP Certificate",
                form_checklist_typo: "FILE",
                form_common_key: "is_gap"
            },
            {
                form_checklist_name: "Are you from other board / university",
                form_checklist_key: "is_migrate_other",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Are you from other board / university",
                form_checklist_lable: "Are you from other board / university",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Yes", "No"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Migration Certificate (Other)",
                form_checklist_key: "migrationCertificate_other",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Migration Certificate",
                form_checklist_lable: "Upload Migration Certificate",
                form_checklist_typo: "FILE",
                form_common_key: "is_migrate_other"
            },
        ]
    },
    {
        section_name: "Social Reservation Information Section",
        section_visibilty: true,
        section_key: "social_reservation_information_section",
        form_checklist: [ 
            {
                form_checklist_name: "Ex-Service man / Ward of Active-Service man",
                form_checklist_key: "student_esm_wasm_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Ex-Service man / Ward of Active-Service man",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Ex-Service man / Ward of Active-Service man",
                form_checklist_typo_option_pl: ["Ex-Service man / Ward of Active-Service man"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Ex-Service man / Ward of Active-Service man",
                form_checklist_key: "student_esm_wasm",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Ex-Service man / Ward of Active-Service man Certificate",
                form_checklist_lable: "Upload Ex-Service man / Ward of Active-Service man Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_esm_wasm_check"
            },
            {
                form_checklist_name: "Active-Service man / Ward of Active-Service man",
                form_checklist_key: "student_asm_wasm_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Active-Service man / Ward of Active-Service man",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Active-Service man / Ward of Active-Service man",
                form_checklist_typo_option_pl: ["Active-Service man / Ward of Active-Service man"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Active-Service man / Ward of Active-Service man",
                form_checklist_key: "student_asm_wasm",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Active-Service man / Ward of Active-Service man Certificate",
                form_checklist_lable: "Upload Active-Service man / Ward of Active-Service man Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_asm_wasm_check"
            },
            {
                form_checklist_name: "Freedom Fighter /Ward of Freedom Fighter",
                form_checklist_key: "student_ff_wff_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Freedom Fighter /Ward of Freedom Fighter",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Freedom Fighter /Ward of Freedom Fighter",
                form_checklist_typo_option_pl: ["Freedom Fighter /Ward of Freedom Fighter"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Freedom Fighter /Ward of Freedom Fighter",
                form_checklist_key: "student_ff_wff",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Freedom Fighter /Ward of Freedom Fighter Certificate",
                form_checklist_lable: "Upload Freedom Fighter /Ward of Freedom Fighter Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_ff_wff_check"
            },
            {
                form_checklist_name: "Ward of Primary Teacher",
                form_checklist_key: "student_wpt_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Ward of Primary Teacher",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Ward of Primary Teacher",
                form_checklist_typo_option_pl: ["Ward of Primary Teacher"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Ward of Primary Teacher",
                form_checklist_key: "student_wpt",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Ward of Primary Teacher Certificate",
                form_checklist_lable: "Upload Ward of Primary Teacher Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_wpt_check"
            },
            {
                form_checklist_name: "Ward of Secondary Teacher",
                form_checklist_key: "student_wst_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Ward of Secondary Teacher",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Ward of Secondary Teacher",
                form_checklist_typo_option_pl: ["Ward of Secondary Teacher"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Ward of Secondary Teacher",
                form_checklist_key: "student_wst",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Ward of Secondary Teacher Certificate",
                form_checklist_lable: "Upload Ward of Secondary Teacher Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_wst_check"
            },
            {
                form_checklist_name: "Deserted / Divorced / Widowed Women",
                form_checklist_key: "student_ddww_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Deserted / Divorced / Widowed Women",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Deserted / Divorced / Widowed Women",
                form_checklist_typo_option_pl: ["Deserted / Divorced / Widowed Women"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Deserted / Divorced / Widowed Women",
                form_checklist_key: "student_ddww",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Deserted / Divorced / Widowed Women Certificate",
                form_checklist_lable: "Upload Deserted / Divorced / Widowed Women Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_ddww_check"
            },
            {
                form_checklist_name: "Member of Project Affected Family",
                form_checklist_key: "student_mopaf_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Member of Project Affected Family",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Member of Project Affected Family",
                form_checklist_typo_option_pl: ["Member of Project Affected Family"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Member of Project Affected Family",
                form_checklist_key: "student_mopaf",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Member of Project Affected Family Certificate",
                form_checklist_lable: "Upload Member of Project Affected Family Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_mopaf_check"
            },
            {
                form_checklist_name: "Member of Earthquake Affected Family",
                form_checklist_key: "student_moeaf_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Member of Earthquake Affected Family",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Member of Earthquake Affected Family",
                form_checklist_typo_option_pl: ["Member of Earthquake Affected Family"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Member of Earthquake Affected Family",
                form_checklist_key: "student_moeaf",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Member of Earthquake Affected Family Certificate",
                form_checklist_lable: "Upload Member of Earthquake Affected Family Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_moeaf_check"
            },
            {
                form_checklist_name: "Member of Flood / Famine Affected Family",
                form_checklist_key: "student_moffaf_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Member of Flood / Famine Affected Family",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Member of Flood / Famine Affected Family",
                form_checklist_typo_option_pl: ["Member of Flood / Famine Affected Family"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Member of Flood / Famine Affected Family",
                form_checklist_key: "student_moffaf",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Member of Flood / Famine Affected Family Certificate",
                form_checklist_lable: "Upload Member of Flood / Famine Affected Family Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_moffaf_check"
            },
            {
                form_checklist_name: "Resident of Tribal Area",
                form_checklist_key: "student_rota_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Resident of Tribal Area",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Resident of Tribal Area",
                form_checklist_typo_option_pl: ["Resident of Tribal Area"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Resident of Tribal Area",
                form_checklist_key: "student_rota",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Resident of Tribal Area Certificate",
                form_checklist_lable: "Upload Resident of Tribal Area Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_rota_check"
            },
            {
                form_checklist_name: "Kashmir Migrant",
                form_checklist_key: "student_km_check",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Kashmir Migrant",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "Kashmir Migrant",
                form_checklist_typo_option_pl: ["Kashmir Migrant"],
                form_checklist_enable: "true"
            },
            {
                form_checklist_name: "Kashmir Migrant",
                form_checklist_key: "student_km",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Kashmir Migrant Certificate",
                form_checklist_lable: "Upload Kashmir Migrant Certificate",
                form_checklist_typo: "FILE",
                form_checklist_key_status: "DYNAMIC",
                form_common_key: "student_km_check"
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
        section_name: "Anti-Ragging Affidavit By The Parent's",
        section_visibilty: true,
        section_key: "antiragging_affidavit_parents",
        section_view: "View Sample",
        section_pdf: "",
        section_stats: "antiragging_affidavit",
        section_value: `ANNEXURE II
        ANTI RAGGING AFFIDAVIT BY PARENT/GUARDIAN
    
    
    I, Mr./Mrs./Ms. @PARENTS_NAME, father/mother/guardian of @STUDENT_NAME having been admitted to @INSTITUTE_NAME, have received or downloaded a copy of the UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, 2009, (hereinafter called the “Regulations”), carefully read and fully understood the provisions contained in the said Regulations :
    1) I have, in particular, perused clause 3 of the Regulations and am aware as to what constitutes ragging.
    2) I have also, in particular, perused clause 7 and clause 9.1 of the Regulations and am fully aware of the penal and administrative action that is liable to be taken against my ward in case he/she is found guilty of or abetting ragging, actively or passively, or being part of a conspiracy to promote ragging.
    3) I hereby solemnly aver and undertake that
    a) My ward will not indulge in any behavior or act that may be constituted as ragging under clause 3 of the Regulations.
    b) My ward will not participate in or abet or propagate through any act of commission or omission that may be constituted as ragging under clause 3 of the Regulations.
    4) I hereby affirm that, if found guilty of ragging, my ward is liable for punishment according to clause  9.1 of the Regulations, without
    prejudice to any other criminal action that may be taken against my ward under any penal law or any law for the time being in force.
    5) I hereby declare that my ward has not been expelled or debarred from admission in any institution in the country on account of being found guilty of, abetting or being part of a conspiracy to promote, ragging; and further affirm that, in case the declaration is found to be
    untrue, the admission of my ward is liable to be cancelled.
    6) Along with the above mentioned points I do hereby declare that
    a) My ward will obey the code of conduct of the institute and do not indulge in any kind of in-disciplined activity while in and off the institution campus.
    b) My ward will be solely responsible for any kind of accident/mishap caused on account of the above mentioned clause (6.a).
    
    Declared this on @DATE
    
    
                                           VERIFICATION
    
    Verified that the contents of this affidavit are true to the best of my knowledge and no part of the affidavit is false and nothing has been concealed or misstated therein. Verified at _ _ _ _ _ _ _ _ _ _ _  _ _(place) on _ _ _ _ _ _ _ (day) of _ _ _ _ _ _ _ _ _(month) , _ _ _ _ _ _ _(year)
    
    
    
    
    OATH COMMISSIONER
    Note : It is mandatory to submit this affidavit in the above format, if you desire to register for the forthcoming academic session.`,
        form_checklist: [
            {
                form_checklist_name: "Anti-Ragging Affidavit By The Parent's",
                form_checklist_key: "student_anti_ragging_parents",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Anti-Ragging Affidavit By The Parent's",
                form_checklist_lable: "",
                form_checklist_typo: "CHECKBOX",
                form_checklist_sample: "I Agree",
                form_checklist_typo_option_pl: ["I Agree"]
            },
        ]
    },
]

// module.exports.form_params = [
//     {
//         section_name: "Academic Details",
//         section_visibilty: true,
//         section_key: "academic_details",
//         form_checklist: [ 
//             {
//                 form_checklist_name: "Std 10th Details",
//                 form_checklist_key: "std_tenth_details",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter Std 10th Details",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "Std 10th Details",
//                 form_checklist_typo_option_pl: ["Std 10th Details"],
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "HSC (10+2) / Diploma",
//                 form_checklist_key: "hsc_diploma",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter HSC (10+2) / Diploma",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "HSC (10+2) / Diploma",
//                 form_checklist_typo_option_pl: ["HSC (10+2) / Diploma"],
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month",
//                         form_checklist_key: "hsc_month",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month",
//                         form_checklist_lable: "Enter Month",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Year",
//                         form_checklist_key: "hsc_year",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year",
//                         form_checklist_lable: "Enter Year",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "hsc_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "hsc_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Board",
//                         form_checklist_key: "hsc_board",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Board",
//                         form_checklist_lable: "Enter Board",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Board",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Candidate Type",
//                         form_checklist_key: "hsc_candidate_type",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Candidate Type",
//                         form_checklist_lable: "Enter Candidate Type",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Candidate Type",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Vocational Type",
//                         form_checklist_key: "hsc_vocational_type",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Vocational Type",
//                         form_checklist_lable: "Enter Vocational Type",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Vocational Type",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Physics Marks Obtained",
//                         form_checklist_key: "hsc_physics_marks",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Physics Marks Obtained",
//                         form_checklist_lable: "Enter Physics Marks Obtained",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Physics Marks Obtained",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Chemistry Marks Obtained",
//                         form_checklist_key: "hsc_chemistry_marks",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Chemistry Marks Obtained",
//                         form_checklist_lable: "Enter Chemistry Marks Obtained",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Chemistry Marks Obtained",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "Mathematics Marks Obtained",
//                         form_checklist_key: "hsc_mathematics_marks",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Mathematics Marks Obtained",
//                         form_checklist_lable: "Enter Mathematics Marks Obtained",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Mathematics Marks Obtained",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "PCM Total",
//                         form_checklist_key: "hsc_pcm_total",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter PCM Total",
//                         form_checklist_lable: "Enter PCM Total",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "PCM Total",
//                         form_checklist_typo_option_pl: [],
//                     },
//                     {
//                         form_checklist_name: "HSC Grand Total",
//                         form_checklist_key: "hsc_grand_total",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter HSC Grand Total",
//                         form_checklist_lable: "Enter HSC Grand Total",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "HSC Grand Total",
//                         form_checklist_typo_option_pl: [],
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "UG For Engineering",
//                 form_checklist_key: "ug_engineering",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter UG For Engineering",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "UG For Engineering",
//                 form_checklist_typo_option_pl: ["UG For Engineering"],
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Pre-final Sem",
//                         form_checklist_key: "pre_final_sem",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Pre-final Sem",
//                         form_checklist_lable: "",
//                         form_checklist_typo: "CHECKBOX",
//                         form_checklist_sample: "Pre-final Sem",
//                         form_checklist_typo_option_pl: ["Pre-final Sem"],
//                         nested_form_checklist_nested: [
//                             {
//                                 form_checklist_name: "Marks / Credits Obtain",
//                                 form_checklist_key: "pre_marks_credit_obtain",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Marks / Credits Obtain",
//                                 form_checklist_lable: "Enter Marks / Credits Obtain",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Marks / Credits Obtain",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Total Grade Points",
//                                 form_checklist_key: "pre_total_grade_points",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Total Grade Points",
//                                 form_checklist_lable: "Enter Total Grade Points",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Total Grade Points",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                         ]
//                     },
//                     {
//                         form_checklist_name: "Final Sem / Year",
//                         form_checklist_key: "final_sem",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Final Sem / Year",
//                         form_checklist_lable: "",
//                         form_checklist_typo: "CHECKBOX",
//                         form_checklist_sample: "Final Sem / Year",
//                         form_checklist_typo_option_pl: ["Final Sem / Year"],
//                         nested_form_checklist_nested: [
//                             {
//                                 form_checklist_name: "Marks / Credits Obtain",
//                                 form_checklist_key: "final_marks_credit_obtain",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Marks / Credits Obtain",
//                                 form_checklist_lable: "Enter Marks / Credits Obtain",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Marks / Credits Obtain",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Total Grade Points",
//                                 form_checklist_key: "final_total_grade_points",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Total Grade Points",
//                                 form_checklist_lable: "Enter Total Grade Points",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Total Grade Points",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "CPI",
//                                 form_checklist_key: "final_cpi",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter CPI",
//                                 form_checklist_lable: "Enter CPI",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "CPI",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                         ]
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "Entrance Exam",
//                 form_checklist_key: "entrance_exam",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter Entrance Exam",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "Entrance Exam",
//                 form_checklist_typo_option_pl: ["Entrance Exam"],
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "JEE Details",
//                         form_checklist_key: "jee_details",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter JEE Details",
//                         form_checklist_lable: "",
//                         form_checklist_typo: "CHECKBOX",
//                         form_checklist_sample: "JEE Details",
//                         form_checklist_typo_option_pl: ["JEE Details"],
//                         nested_form_checklist_nested: [
//                             {
//                                 form_checklist_name: "ROLL No.",
//                                 form_checklist_key: "jee_rollno",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter ROLL No.",
//                                 form_checklist_lable: "Enter ROLL No.",
//                                 form_checklist_typo: "TEXT",
//                                 form_checklist_sample: "ROLL No.",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Physics Marks Obtained",
//                                 form_checklist_key: "jee_physics_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Physics Marks Obtained",
//                                 form_checklist_lable: "Enter Physics Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Physics Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Chemistry Marks Obtained",
//                                 form_checklist_key: "jee_chemistry_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Chemistry Marks Obtained",
//                                 form_checklist_lable: "Enter Chemistry Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Chemistry Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Mathematics Marks Obtained",
//                                 form_checklist_key: "jee_mathematics_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Mathematics Marks Obtained",
//                                 form_checklist_lable: "Enter Mathematics Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Mathematics Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "JEE Total",
//                                 form_checklist_key: "jee_total",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter JEE Total",
//                                 form_checklist_lable: "Enter JEE Total",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "JEE Total",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "JEE Percentile",
//                                 form_checklist_key: "jee_percentile",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter JEE Percentile",
//                                 form_checklist_lable: "Enter JEE Percentile",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "JEE Percentile",
//                                 form_checklist_typo_option_pl: [],
//                             }
//                         ]
//                     },
//                     {
//                         form_checklist_name: "CET Details",
//                         form_checklist_key: "cet_details",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter CET Details",
//                         form_checklist_lable: "",
//                         form_checklist_typo: "CHECKBOX",
//                         form_checklist_sample: "CET Details",
//                         form_checklist_typo_option_pl: ["CET Details"],
//                         nested_form_checklist_nested: [
//                             {
//                                 form_checklist_name: "ROLL No.",
//                                 form_checklist_key: "cet_rollno",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter ROLL No.",
//                                 form_checklist_lable: "Enter ROLL No.",
//                                 form_checklist_typo: "TEXT",
//                                 form_checklist_sample: "ROLL No.",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Physics Marks Obtained",
//                                 form_checklist_key: "cet_physics_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Physics Marks Obtained",
//                                 form_checklist_lable: "Enter Physics Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Physics Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Chemistry Marks Obtained",
//                                 form_checklist_key: "cet_chemistry_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Chemistry Marks Obtained",
//                                 form_checklist_lable: "Enter Chemistry Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Chemistry Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Mathematics Marks Obtained",
//                                 form_checklist_key: "cet_mathematics_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Mathematics Marks Obtained",
//                                 form_checklist_lable: "Enter Mathematics Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Mathematics Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Biology Marks Obtained",
//                                 form_checklist_key: "cet_biology_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Biology Marks Obtained",
//                                 form_checklist_lable: "Enter Biology Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Biology Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "CET Total",
//                                 form_checklist_key: "cet_total",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter CET Total",
//                                 form_checklist_lable: "Enter CET Total",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "CET Total",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "CET Percentile",
//                                 form_checklist_key: "cet_percentile",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter CET Percentile",
//                                 form_checklist_lable: "Enter CET Percentile",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "CET Percentile",
//                                 form_checklist_typo_option_pl: [],
//                             }
//                         ]
//                     },
//                     {
//                         form_checklist_name: "AIEEE Details",
//                         form_checklist_key: "aieee_details",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter AIEEE Details",
//                         form_checklist_lable: "",
//                         form_checklist_typo: "CHECKBOX",
//                         form_checklist_sample: "AIEEE Details",
//                         form_checklist_typo_option_pl: ["AIEEE Details"],
//                         nested_form_checklist_nested: [
//                             {
//                                 form_checklist_name: "ROLL No.",
//                                 form_checklist_key: "aieee_rollno",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter ROLL No.",
//                                 form_checklist_lable: "Enter ROLL No.",
//                                 form_checklist_typo: "TEXT",
//                                 form_checklist_sample: "ROLL No.",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Physics Marks Obtained",
//                                 form_checklist_key: "aieee_physics_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Physics Marks Obtained",
//                                 form_checklist_lable: "Enter Physics Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Physics Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Chemistry Marks Obtained",
//                                 form_checklist_key: "aieee_chemistry_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Chemistry Marks Obtained",
//                                 form_checklist_lable: "Enter Chemistry Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Chemistry Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Mathematics Marks Obtained",
//                                 form_checklist_key: "aieee_mathematics_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Mathematics Marks Obtained",
//                                 form_checklist_lable: "Enter Mathematics Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Mathematics Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "Biology Marks Obtained",
//                                 form_checklist_key: "aieee_biology_marks",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter Biology Marks Obtained",
//                                 form_checklist_lable: "Enter Biology Marks Obtained",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "Biology Marks Obtained",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "AIEEE Total",
//                                 form_checklist_key: "aieee_total",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter AIEEE Total",
//                                 form_checklist_lable: "Enter AIEEE Total",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "AIEEE Total",
//                                 form_checklist_typo_option_pl: [],
//                             },
//                             {
//                                 form_checklist_name: "AIEEE Percentile",
//                                 form_checklist_key: "aieee_percentile",
//                                 form_checklist_visibility: true,
//                                 form_checklist_placeholder: "Enter AIEEE Percentile",
//                                 form_checklist_lable: "Enter AIEEE Percentile",
//                                 form_checklist_typo: "NUMBER",
//                                 form_checklist_sample: "AIEEE Percentile",
//                                 form_checklist_typo_option_pl: [],
//                             }
//                         ]
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "F.Y.J.C",
//                 form_checklist_key: "fyjc",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter F.Y.J.C",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "F.Y.J.C",
//                 form_checklist_typo_option_pl: ["F.Y.J.C"],
//                 form_checklist_key_status: "DYNAMIC",
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "fyjc_month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "fyjc_year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "fyjc_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "fyjc_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "F.Y. Sem-I",
//                 form_checklist_key: "fy_sem_I",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter F.Y. Sem-I",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "F.Y. Sem-I",
//                 form_checklist_typo_option_pl: ["F.Y. Sem-I"],
//                 form_checklist_key_status: "DYNAMIC",
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "fy_sem_I_month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "fy_sem_I_year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "fy_sem_I_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "fy_sem_I_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "F.Y. Sem-II",
//                 form_checklist_key: "fy_sem_II",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter F.Y. Sem-II",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "F.Y. Sem-II",
//                 form_checklist_typo_option_pl: ["F.Y. Sem-II"],
//                 form_checklist_key_status: "DYNAMIC",
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "fy_sem_II_month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "fy_sem_II_year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "fy_sem_II_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "fy_sem_II_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "S.Y. Sem-III",
//                 form_checklist_key: "sy_sem_III",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter S.Y. Sem-III",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "S.Y. Sem-III",
//                 form_checklist_typo_option_pl: ["S.Y. Sem-III"],
//                 form_checklist_key_status: "DYNAMIC",
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "sy_sem_III_month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "sy_sem_III_year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "sy_sem_III_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "sy_sem_III_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "S.Y. Sem-IV",
//                 form_checklist_key: "sy_sem_IV",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter S.Y. Sem-IV",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "S.Y. Sem-IV",
//                 form_checklist_typo_option_pl: ["S.Y. Sem-IV"],
//                 form_checklist_key_status: "DYNAMIC",
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "sy_sem_IV_month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "sy_sem_IV_year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "sy_sem_IV_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "sy_sem_IV_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "T.Y. Sem-V",
//                 form_checklist_key: "ty_sem_V",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter T.Y. Sem-V",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "T.Y. Sem-V",
//                 form_checklist_typo_option_pl: ["T.Y. Sem-V"],
//                 form_checklist_key_status: "DYNAMIC",
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "ty_sem_V_month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "ty_sem_V_year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "ty_sem_V_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "ty_sem_V_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "T.Y. Sem-VI",
//                 form_checklist_key: "ty_sem_VI",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter T.Y. Sem-VI",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "T.Y. Sem-VI",
//                 form_checklist_typo_option_pl: ["T.Y. Sem-VI"],
//                 form_checklist_key_status: "DYNAMIC",
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "ty_sem_VI_month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "ty_sem_VI_year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "ty_sem_VI_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "ty_sem_VI_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     }
//                 ]
//             },
//             {
//                 form_checklist_name: "M.Sc/M.Com",
//                 form_checklist_key: "msc_mcom",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Enter M.Sc/M.Com",
//                 form_checklist_lable: "",
//                 form_checklist_typo: "CHECKBOX",
//                 form_checklist_sample: "M.Sc/M.Com",
//                 form_checklist_typo_option_pl: ["M.Sc/M.Com"],
//                 form_checklist_key_status: "DYNAMIC",
//                 nested_form_checklist: [
//                     {
//                         form_checklist_name: "Month of Passing",
//                         form_checklist_key: "msc_mcom_month_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Month of Passing",
//                         form_checklist_lable: "Enter Month of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Month of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Year of Passing",
//                         form_checklist_key: "msc_mcom_year_of_passing",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Year of Passing",
//                         form_checklist_lable: "Enter Year of Passing",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Year of Passing",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Percentage",
//                         form_checklist_key: "msc_mcom_percentage",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Percentage",
//                         form_checklist_lable: "Enter Percentage",
//                         form_checklist_typo: "NUMBER",
//                         form_checklist_sample: "Percentage",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     },
//                     {
//                         form_checklist_name: "Name of Institute",
//                         form_checklist_key: "msc_mcom_name_of_institute",
//                         form_checklist_visibility: true,
//                         form_checklist_placeholder: "Enter Name of Institute",
//                         form_checklist_lable: "Enter Name of Institute",
//                         form_checklist_typo: "TEXT",
//                         form_checklist_sample: "Name of Institute",
//                         form_checklist_typo_option_pl: [],
//                         form_checklist_key_status: "DYNAMIC"
//                     }
//                 ]
//             },
//         ]
//     },
//     {
//         section_name: "Social Reservation Information Section",
//         section_visibilty: true,
//         section_key: "social_reservation_information_section",
//         form_checklist: [ 
//             {
//                 form_checklist_name: "Ex-Service man / Ward of Active-Service man",
//                 form_checklist_key: "student_esm_wasm",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Ex-Service man / Ward of Active-Service man Certificate",
//                 form_checklist_lable: "Upload Ex-Service man / Ward of Active-Service man Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Active-Service man / Ward of Active-Service man",
//                 form_checklist_key: "student_asm_wasm",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Active-Service man / Ward of Active-Service man Certificate",
//                 form_checklist_lable: "Upload Active-Service man / Ward of Active-Service man Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Freedom Fighter /Ward of Freedom Fighter",
//                 form_checklist_key: "student_ff_wff",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Freedom Fighter /Ward of Freedom Fighter Certificate",
//                 form_checklist_lable: "Upload Freedom Fighter /Ward of Freedom Fighter Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Ward of Primary Teacher",
//                 form_checklist_key: "student_wpt",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Ward of Primary Teacher Certificate",
//                 form_checklist_lable: "Upload Ward of Primary Teacher Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Ward of Secondary Teacher",
//                 form_checklist_key: "student_wst",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Ward of Secondary Teacher Certificate",
//                 form_checklist_lable: "Upload Ward of Secondary Teacher Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Deserted / Divorced / Widowed Women",
//                 form_checklist_key: "student_ddww",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Deserted / Divorced / Widowed Women Certificate",
//                 form_checklist_lable: "Upload Deserted / Divorced / Widowed Women Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Member of Project Affected Family",
//                 form_checklist_key: "student_mopaf",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Member of Project Affected Family Certificate",
//                 form_checklist_lable: "Upload Member of Project Affected Family Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Member of Earthquake Affected Family",
//                 form_checklist_key: "student_moeaf",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Member of Earthquake Affected Family Certificate",
//                 form_checklist_lable: "Upload Member of Earthquake Affected Family Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Member of Flood / Famine Affected Family",
//                 form_checklist_key: "student_moffaf",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Member of Flood / Famine Affected Family Certificate",
//                 form_checklist_lable: "Upload Member of Flood / Famine Affected Family Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Resident of Tribal Area",
//                 form_checklist_key: "student_rota",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Resident of Tribal Area Certificate",
//                 form_checklist_lable: "Upload Resident of Tribal Area Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//             {
//                 form_checklist_name: "Kashmir Migrant",
//                 form_checklist_key: "student_km",
//                 form_checklist_visibility: true,
//                 form_checklist_placeholder: "Upload Kashmir Migrant Certificate",
//                 form_checklist_lable: "Upload Kashmir Migrant Certificate",
//                 form_checklist_typo: "FILE",
//                 form_checklist_key_status: "DYNAMIC"
//             },
//         ]
//     },
// ]