module.exports.staff_form_params = [
    {
        section_name: "",
        section_visibilty: true,
        section_key: "",
        form_checklist: [
            {
                form_checklist_name: "Profile Photo",
                form_checklist_key: "staffProfilePhoto",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Profile Photo",
                form_checklist_lable: "Upload Profile Photo",
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
                form_checklist_key: "staffFirstName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your First Name",
                form_checklist_lable: "Staff First Name",
                form_checklist_typo: "TEXT",
                form_checklist_required: true,
                width: "32%"
            },
            {
                form_checklist_name: "Middle Name",
                form_checklist_key: "staffMiddleName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your Middle Name",
                form_checklist_lable: "Staff Middle's Name",
                form_checklist_typo: "TEXT",
                form_checklist_required: false,
                width: "32%"
            },
            {
                form_checklist_name: "Surname",
                form_checklist_key: "staffLastName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your Surname",
                form_checklist_lable: "Staff Surname",
                form_checklist_typo: "TEXT",
                form_checklist_required: true,
                width: "32%"
            },
            {
                form_checklist_name: "Date of Birth",
                form_checklist_key: "staffDOB",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Date of Birth",
                form_checklist_lable: "DOB",
                form_checklist_typo: "CALENDAR",
                form_checklist_required: true
            },
            {
                form_checklist_name: "Gender",
                form_checklist_key: "staffGender",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Gender",
                form_checklist_lable: "Select Gender / Sex",
                form_checklist_typo: "SELECT",
                form_checklist_required: true,
                form_checklist_typo_option_pl: ["Male", "Female", "Other"]
            },
            {
                form_checklist_name: "Mother's Name",
                form_checklist_key: "staffMotherName",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Mother's Name",
                form_checklist_lable: "Mother's Name",
                form_checklist_typo: "TEXT",
                form_checklist_required: true
            },
        ]
    },
    {
        section_name: "Identity Details",
        section_visibilty: true,
        section_key: "identity_details",
        form_checklist: [
            {
                form_checklist_name: "Place of Birth",
                form_checklist_key: "staffBirthPlace",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your Place of Birth",
                form_checklist_lable: "Place of Birth",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Religion",
                form_checklist_key: "staffReligion",
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
                form_checklist_key: "staffCast",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Caste",
                form_checklist_lable: "Select Caste",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Caste Category",
                form_checklist_key: "staffCastCategory",
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
                form_checklist_key: "staffNationality",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Nationality",
                form_checklist_lable: "Nationality",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Indian", "Non-Indian"]
            },
            {
                form_checklist_name: "Blood Group",
                form_checklist_key: "staff_blood_group",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Blood Group",
                form_checklist_lable: "Blood Group",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
            },
        ]
    },
    {
        section_name: "Contact Details",
        section_visibilty: true,
        section_key: "contactDetails",
        form_checklist: [
            {
                form_checklist_name: "Staff Contact No.",
                form_checklist_key: "staffPhoneNumber",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Contact No.",
                form_checklist_lable: "Staff Contact No.",
                form_checklist_typo: "NUMBER",
            },
            {
                form_checklist_name: "Staff Email ID",
                form_checklist_key: "staffEmail",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Email ID",
                form_checklist_lable: "Staff Email ID",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Alternate Contact No.",
                form_checklist_key: "staffAlternatePhoneNumber",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Alternate Contact No.",
                form_checklist_lable: "Alternate Contact No.",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Alternate Email ID",
                form_checklist_key: "staffAlternateEmail",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Alternate Email ID",
                form_checklist_lable: "Alternate Email ID",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Staff Current Address",
                form_checklist_key: "staffCurrentAddress",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Current Address",
                form_checklist_lable: "Staff Current Address",
                form_checklist_typo: "TEXTAREA",
                width: "100%"
            },
            {
                form_checklist_name: "Staff Current Pincode",
                form_checklist_key: "staffCurrentPincode",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Current Pincode",
                form_checklist_lable: "Staff Current Pincode",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "Staff Current State",
                form_checklist_key: "staffCurrentState",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Current State",
                form_checklist_lable: "Staff Current State",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "Staff Current District",
                form_checklist_key: "staffCurrentDistrict",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Current District",
                form_checklist_lable: "Staff Current District",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "",
                form_checklist_key: "",
                form_checklist_visibility: false,
                form_checklist_placeholder: "",
                form_checklist_lable: "",
                form_checklist_typo: "Same As",
                form_checklist_required: false,
                value: ""
              },
            {
                form_checklist_name: "Staff Permanent Address",
                form_checklist_key: "staffAddress",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Permanent Address",
                form_checklist_lable: "Staff Permanent Address",
                form_checklist_typo: "TEXTAREA",
                width: "100%"
            },
            {
                form_checklist_name: "Staff Permanent Pincode",
                form_checklist_key: "staffPincode",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Permanent Pincode",
                form_checklist_lable: "Staff Permanent Pincode",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "Staff Permanent State",
                form_checklist_key: "staffState",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Permanent State",
                form_checklist_lable: "Staff Permanent State",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
            {
                form_checklist_name: "Staff Permanent District",
                form_checklist_key: "staffDistrict",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Staff Permanent District",
                form_checklist_lable: "Staff Permanent District",
                form_checklist_typo: "TEXT",
                width: "32%"
            },
        ]
    },
    {
        section_name: "Legal Details",
        section_visibilty: true,
        section_key: "legalDetails",
        form_checklist: [
            {
                form_checklist_name: "Aadhar Number",
                form_checklist_key: "staffAadharNumber",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Aadhar Number",
                form_checklist_lable: "Aadhar Number",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Aadhar Card Front",
                form_checklist_key: "staffAadharFrontCard",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Aadhar Front Card",
                form_checklist_lable: "Upload Aadhar Front Card",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "Aadhar Card Back",
                form_checklist_key: "staffAadharBackCard",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Upload Aadhar Back Card",
                form_checklist_lable: "Upload Aadhar Back Card",
                form_checklist_typo: "FILE",
            },
            {
                form_checklist_name: "PAN Number",
                form_checklist_key: "staffPanNumber",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter PAN Number",
                form_checklist_lable: "PAN Number",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "UAN No. (PF)",
                form_checklist_key: "staff_pf_number",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter UAN No. (PF)",
                form_checklist_lable: "UAN No. (PF)",
                form_checklist_typo: "TEXT",
            },
            {
                form_checklist_name: "Biometric ID",
                form_checklist_key: "staff_biometric_id",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Biometric ID",
                form_checklist_lable: "Biometric ID",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
        ]
    },
    {
        section_name: "Institute Related Details",
        section_visibilty: true,
        section_key: "instituteRelatedDetails",
        form_checklist: [
            {
                form_checklist_name: "Joining Date",
                form_checklist_key: "staffJoinDate",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Joining Date",
                form_checklist_lable: "Joining Date",
                form_checklist_typo: "CALENDAR",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Joining Type",
                form_checklist_key: "staff_grant_status",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Joining Type",
                form_checklist_lable: "Joining Type",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["ON_GRANT", "NON_GRANT"]
            },
            {
                form_checklist_name: "Employment Type",
                form_checklist_key: "staff_position",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Employment Type",
                form_checklist_lable: "Employment Type",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Permanent", "Non-Permanent"]
            },
            {
                form_checklist_name: "Faculty Type",
                form_checklist_key: "staff_technicality",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Faculty Type",
                form_checklist_lable: "Faculty Type",
                form_checklist_typo: "SELECT",
                form_checklist_typo_option_pl: ["Technical", "Non-Technical"]
            },
            {
                form_checklist_name: "Your's Designation",
                form_checklist_key: "current_designation",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Your Designation",
                form_checklist_lable: "Your's Designation",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Employee Code",
                form_checklist_key: "staff_emp_code",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Employee Code",
                form_checklist_lable: "Employee Code",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Joining Letter (Attachment)",
                form_checklist_key: "staff_joining_letter",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Joining Letter (Attachment)",
                form_checklist_lable: "Joining Letter (Attachment)",
                form_checklist_typo: "FILE",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Select Departments",
                form_checklist_key: "staff_department",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Select Departments",
                form_checklist_lable: "Select Departments",
                form_checklist_typo: "SELECT_DEPARTMENT",
                form_checklist_typo_option_pl: []
            },
        ]
    },
    {
        section_name: "Qualification Details",
        section_visibilty: true,
        section_key: "qualification_details",
        form_checklist: [
            {
                form_checklist_name: "",
                form_checklist_key: "staff_qualification_details",
                form_checklist_visibility: true,
                form_checklist_placeholder: "",
                form_checklist_lable: "Add New",
                form_checklist_typo: "BUTTON",
                form_checklist_typo_option_pl: []
            },
        ]
    },
    {
        section_name: "Past Experience Details",
        section_visibilty: true,
        section_key: "past_experience_details",
        form_checklist: [
            {
                form_checklist_name: "",
                form_checklist_key: "staff_past_experience_details",
                form_checklist_visibility: true,
                form_checklist_placeholder: "",
                form_checklist_lable: "Add New",
                form_checklist_typo: "BUTTON",
                form_checklist_typo_option_pl: []
            },
        ]
    },
    {
        section_name: "Reasearch & Publication",
        section_visibilty: true,
        section_key: "research_and_publication",
        form_checklist: [
            {
                form_checklist_name: "",
                form_checklist_key: "staff_research_and_publication",
                form_checklist_visibility: true,
                form_checklist_placeholder: "",
                form_checklist_lable: "Add New",
                form_checklist_typo: "BUTTON",
                form_checklist_typo_option_pl: []
            },
        ]
    },
    {
        section_name: "Self About",
        section_visibilty: true,
        section_key: "self_about",
        form_checklist: [
            {
                form_checklist_name: "Self Intro",
                form_checklist_key: "staff_self_intro",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Self Intro",
                form_checklist_lable: "Self Intro",
                form_checklist_typo: "TEXTAREA",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "You Tube Links",
                form_checklist_key: "yt_links",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Youtube Links",
                form_checklist_lable: "Youtube Links",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Facebook Links",
                form_checklist_key: "fb_links",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Facebook Links",
                form_checklist_lable: "Facebook Links",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Twitter Links",
                form_checklist_key: "tw_links",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Twitter Links",
                form_checklist_lable: "Twitter Links",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Linkedin Links",
                form_checklist_key: "in_links",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Linkedin Links",
                form_checklist_lable: "Linkedin Links",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Instagram Links",
                form_checklist_key: "ig_links",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Instagram Links",
                form_checklist_lable: "Instagram Links",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
            {
                form_checklist_name: "Qviple Auto Generated Links",
                form_checklist_key: "qviple_links",
                form_checklist_visibility: true,
                form_checklist_placeholder: "Enter Qviple Auto Generated Links",
                form_checklist_lable: "Qviple Auto Generated Links",
                form_checklist_typo: "TEXT",
                form_checklist_typo_option_pl: []
            },
        ]
    },
]