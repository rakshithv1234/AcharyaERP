import { lazy, useEffect, useState } from "react";
import axios from "../../../services/Api";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import HomeIcon from "@mui/icons-material/Home";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SchoolIcon from "@mui/icons-material/School";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import useAlert from "../../../hooks/useAlert";
import { useNavigate, useParams } from "react-router-dom";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CustomModal from "../../../components/CustomModal";
import moment from "moment";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { GenerateProvisionalCertificate } from "../studentDetailMaster/GenerateProvisionalCertificate";
import { GenerateBonafide } from "../studentBonafide/GenerateBonafide";

const PersonalDetailsForm = lazy(() => import("./PersonalDetailsForm"));
const AdditionalDetailsForm = lazy(() => import("./AdditionalDetailsForm"));
const AddressDetailsForm = lazy(() => import("./AddressDetailsForm"));
const BankDetailsForm = lazy(() => import("./BankDetailsForm"));
const ProgramDetailsForm = lazy(() => import("./ProgramDetailsForm"));
const TranscriptDetailsForm = lazy(() => import("./TranscriptDetailsForm"));
const AcademicDetailsForm = lazy(() => import("./AcademicDetailsForm"));

const initialValues = {
  studentName: "",
  dob: null,
  gender: "",
  mobileNo: "",
  alternateMobile: "",
  whatsAppNo: "",
  email: "",
  religion: "",
  casteCategory: "",
  bloodGroup: "",
  nationality: null,
  maritalStatus: "",
  aadharNo: "",
};

const additionalInitialValues = {
  fatherName: "",
  fatherMobile: "",
  fatherEmail: "",
  fatherOccupation: "",
  fatherQualification: "",
  fatherIncome: "",
  motherName: "",
  motherMobile: "",
  motherEmail: "",
  motherOccupation: "",
  motherQualification: "",
  motherIncome: "",
  guardianName: "",
  guardianMobile: "",
  guardianEmail: "",
  guardianOccupation: "",
  guardianRelationship: "",
};

const addressInitialValues = {
  permanentAddress: "",
  permanentAddressTwo: "",
  permanentCountry: "",
  permanantState: "",
  permanantCity: "",
  permanentPincode: "",
  currentAddress: "",
  currentAddressTwo: "",
  currentCountry: "",
  currentState: "",
  currentCity: "",
  currentPincode: "",
  localAddress: "",
  localAddressTwo: "",
  localCountry: "",
  localState: "",
  localCity: "",
  localPincode: "",
};

const bankInitialValues = {
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  bankBranch: "",
  ifscCode: "",
};

const programInitialValues = {
  currentYearSem: "",
  preferredName: "",
  acYearId: null,
  schoolId: null,
  programId: null,
  programAssignmentId: null,
  prgId: null,
  admissionCategory: null,
  admissionSubCategory: null,
  feeTemplateId: null,
  isNri: false,
};

const academicInitialValues = [
  {
    qualification: "SSLC",
    university: "",
    collegeName: "",
    passingYear: "",
    maxMarks: "",
    scoredMarks: "",
    percentage: "",
    disabled: true,
  },
  {
    qualification: "PUC",
    university: "",
    collegeName: "",
    passingYear: "",
    maxMarks: "",
    scoredMarks: "",
    percentage: "",
    disabled: true,
  },
  {
    qualification: "UG",
    university: "",
    collegeName: "",
    passingYear: "",
    maxMarks: "",
    scoredMarks: "",
    percentage: "",
    disabled: true,
  },
  {
    qualification: "PG",
    university: "",
    collegeName: "",
    passingYear: "",
    maxMarks: "",
    scoredMarks: "",
    percentage: "",
    disabled: true,
  },
];

const optionalInitialValues = {
  optionalSubject: null,
  optionalMaxMarks: "",
  optionalScoredMarks: "",
  optionalPercentage: "",
  isEntranceExam: "",
  entranceExamName: "",
  rank: "",
  area: "",
};

const requiredFields = [
  "studentName",
  "dob",
  "gender",
  "mobileNo",
  "email",
  "religion",
  "nationality",
  "aadharNo",
];

const additionalRequired = [
  "fatherName",
  "fatherMobile",
  "motherName",
  "motherMobile",
];

const addressRequired = [
  "permanentAddress",
  "permanentAddressTwo",
  "permanentCountry",
  "permanantState",
  "permanantCity",
  "permanentPincode",
  "currentAddress",
  "currentAddressTwo",
  "currentCountry",
  "currentState",
  "currentCity",
  "currentPincode",
];

function AdmissionForm() {
  const [values, setValues] = useState(initialValues);
  const [additionalValues, setAdditionalValues] = useState(
    additionalInitialValues
  );
  const [addressValues, setAddressValues] = useState(addressInitialValues);
  const [bankValues, setBankValues] = useState(bankInitialValues);
  const [programValues, setProgramValues] = useState(programInitialValues);
  const [academicValues, setAcademicValues] = useState(academicInitialValues);
  const [optionalValues, setOptionalValues] = useState(optionalInitialValues);
  const [transcriptValues, setTranscriptValues] = useState([]);
  const [noStatuData, setNoStatusData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmContent, setConfirmContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [prefferedCheck, setPrefferedCheck] = useState(false);
  const [nameExist, setNameExist] = useState(true);

  const [data, setData] = useState([]);
  const [noOfYears, setNoOfYears] = useState([]);

  const { id, type } = useParams();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const navigate = useNavigate();
  const setCrumbs = useBreadcrumbs();

  const maxLength = 100;

  const checks = {
    studentName: [values.studentName !== ""],
    // mobileNo: [
    //   programValues.admissionCategory !== 2 && values.mobileNo
    //     ? /^[0-9]{10}$/.test(values.mobileNo)
    //     : true,
    // ],
    alternateMobile: [
      // programValues.admissionCategory !== 2 && values.alternateMobile
      //   ? /^[0-9]{10}$/.test(values.alternateMobile)
      //   : true,
      values.alternateMobile && values.alternateMobile != values.mobileNo,
    ],
    // whatsAppNo: [
    //   programValues.admissionCategory !== 2 && values.whatsAppNo
    //     ? /^[0-9]{10}$/.test(values.whatsAppNo)
    //     : true,
    // ],
    email: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        values.email
      ),
    ],
    aadharNo: [/^[0-9]{12}$/.test(values.aadharNo)],
  };

  const errorMessages = {
    studentName: ["This field is required"],
    // mobileNo: ["Invalid Mobile No."],
    alternateMobile: [
      // "Invalid Mobile No.",
      "This number is already given as phone number",
    ],
    // whatsAppNo: ["Invalid Mobile No."],
    email: ["Invalid email"],
    aadharNo: ["Invalid Aadhar"],
  };

  const additonalChecks = {
    // fatherMobile: [
    //   additionalValues.fatherMobile && programValues.admissionCategory !== 2
    //     ? /^[0-9]{10}$/.test(additionalValues.fatherMobile)
    //     : true,
    // ],
    fatherEmail: [
      additionalValues.fatherEmail
        ? /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            additionalValues.fatherEmail
          )
        : true,
    ],
    // motherMobile: [
    //   additionalValues.motherMobile && programValues.admissionCategory !== 2
    //     ? /^[0-9]{10}$/.test(additionalValues.motherMobile)
    //     : true,
    // ],
    motherEmail: [
      additionalValues.motherEmail
        ? /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            additionalValues.motherEmail
          )
        : true,
    ],
    // guardianMobile: [
    //   additionalValues.guardianMobile && programValues.admissionCategory !== 2
    //     ? /^[0-9]{10}$/.test(additionalValues.guardianMobile)
    //     : true,
    // ],
    guardianEmail: [
      additionalValues.guardianEmail
        ? /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            additionalValues.guardianEmail
          )
        : true,
    ],
  };

  const additionalErrorMessages = {
    fatherMobile: ["Invalid Mobile No."],
    fatherEmail: ["Invalid email"],
    motherMobile: ["Invalid Mobile No."],
    motherEmail: ["Invalid email"],
    guardianMobile: ["Invalid Mobile No."],
    guardianEmail: ["Invalid email"],
  };

  const addressChecks = {
    permanentAddress: [addressValues.permanentAddress !== ""],
    permanentAddressTwo: [addressValues.permanentAddressTwo !== ""],
    permanentPincode: [addressValues.permanentPincode !== ""],
    currentAddress: [addressValues.currentAddress !== ""],
    currentAddressTwo: [addressValues.currentAddressTwo !== ""],
    currentPincode: [addressValues.currentPincode !== ""],
  };

  const addressErrorMessages = {
    permanentAddress: ["This field is required"],
    permanentAddressTwo: ["This field is required"],
    permanentPincode: ["This field is required"],
    currentAddress: ["This field is required"],
    currentAddressTwo: ["This field is required"],
    currentPincode: ["This field is required"],
  };

  useEffect(() => {
    getData();
    setCrumbs([]);
  }, []);

  useEffect(() => {
    updatePreferredName();
  }, [values.studentName, additionalValues.fatherName]);

  const updatePreferredName = () => {
    const { studentName } = values;
    const { fatherName } = additionalValues;
    if (studentName && fatherName) {
      const firstName = studentName.split(" ");
      const firstFatherLetter = fatherName?.slice(0, 1);
      const generateName = `${firstName[0]}${firstFatherLetter}`.toLowerCase();
      setProgramValues((prev) => ({
        ...prev,
        ["preferredName"]: generateName,
      }));
    }
  };

  useEffect(() => {
    checkPrefferedName();
  }, [programValues.preferredName]);

  const checkPrefferedName = async () => {
    const { preferredName } = programValues;
    if (!preferredName) return null;
    try {
      const response = await axios.get(
        `/api/student/checkPreferredNameForEmail/${preferredName}`
      );
      setPrefferedCheck(false);
    } catch (err) {
      setPrefferedCheck(true);
      setNameExist(false);
    }
  };

  const getData = async () => {
    try {
      const { data: response } = await axios.get(
        `/api/student/findAllDetailsPreAdmission/${id}`
      );
      const responseData = response.data[0];
      const { data: transcriptRes } = await axios.get(
        `/api/academic/fetchProgramTranscriptDetails/${responseData.program_id}`
      );
      const transcriptData = transcriptRes.data;
      const status = transcriptData.filter((fil) => fil.show_status === true);
      const noStatus = transcriptData.filter((fil) => !fil.show_status);
      const transcriptObj = [];

      status.forEach((obj, i) => {
        transcriptObj.push({
          transcriptId: obj.transcript_id,
          transcript: obj.transcript,
          lastDate: null,
          submittedStatus: false,
          notRequied: false,
          submittedStatusDisabled: false,
          notRequiedDisabled: false,
          lastDateDisabled: false,
          showStatus: obj.show_status,
        });
      });

      const {
        program_type: programType,
        candidateName: studentName,
        dateOfBirth: dob,
        candidateSex: gender,
        mobileNumber: mobileNo,
        alternate_number: alternateMobile,
        whatsapp_number: whatsAppNo,
        candidateEmail: email,
        religion,
        caste: casteCategory,
        bloodGroup,
        marital_status: maritalStatus,
        aadhar: aadharNo,
        nationality,
        lat_year_sem: latYear,
        fatherName,
        fatherMobile,
        fatherEmail,
        fatherOccupation,
        father_annual_income: fatherIncome,
        father_qualification: fatherQualification,
        motherName,
        motherMobile,
        mother_email: motherEmail,
        mother_occupation: motherOccupation,
        mother_qualification: motherQualification,
        mother_annual_income: motherIncome,
        guardianName,
        guardianMobile,
        guardian_email: guardianEmail,
        guardian_occupation: guardianOccupation,
        ac_year_id: acYearId,
        school_id: schoolId,
        program_specialization_id: programId,
        program_assignment_id: programAssignmentId,
        program_id: prgId,
        fee_template_id: feeTemplateId,
        fee_admission_category_id: admissionCategory,
        fee_admission_sub_category_id: admissionSubCategory,
        is_regular: isRegular,
        permanentAddress,
        permanant_adress1: permanentAddressTwo,
        permanentCountry,
        permanentCity,
        permanentPincode,
        permanentState,
        presentAddress,
        present_address1: currentAddressTwo,
        presentPincode,
        presentCountry,
        presentState,
        presentCity,
        sslc_board: sslcUniversity,
        sslc_school_name: sslcCollegeName,
        sslc_year_of_passing: sslcYear,
        sslc_subject_max_marks: sslcMax,
        sslc_subject_marks_obtain: sslcScored,
        sslc_percentage_grade: sslcPercentage,
        puc_board: pucUniversity,
        puc_school_name: pucCollegeName,
        puc_year_of_passing: pucYear,
        puc_subject_max_marks: pucMax,
        puc_subject_marks_obtain: pucScored,
        puc_percentage_obtain: pucPercentage,
        ug_board: ugUniversity,
        ug_school_name: ugCollegeName,
        ug_year_of_passing: ugYear,
        ug_subject_max_marks: ugMax,
        ug_subject_marks_obtain: ugScored,
        ug_percentage_grade: ugPercentage,
        optional_max_mark: optionalMaxMarks,
        optional_percentage: optionalPercentage,
        optional_min_mark: optionalScoredMarks,
        optional_subject: optionalSubject,
        entrance_exam_name: entranceExamName,
        entrance_score: rank,
        rural_urban: area,
      } = responseData;

      const getAcademicValues = {
        SSLC: {
          university: sslcUniversity,
          collegeName: sslcCollegeName,
          passingYear: sslcYear,
          maxMarks: sslcMax,
          scoredMarks: sslcScored,
          percentage: sslcPercentage,
        },
        PUC: {
          university: pucUniversity,
          collegeName: pucCollegeName,
          passingYear: pucYear,
          maxMarks: pucMax,
          scoredMarks: pucScored,
          percentage: pucPercentage,
        },
        UG: {
          university: ugUniversity,
          collegeName: ugCollegeName,
          passingYear: ugYear,
          maxMarks: ugMax,
          scoredMarks: ugScored,
          percentage: ugPercentage,
        },
      };

      const academicTempValues = [];
      academicValues.forEach((obj) => {
        const objectValues = obj;
        const key = getAcademicValues[obj.qualification];
        objectValues.university = key?.university || "";
        objectValues.collegeName = key?.collegeName || "";
        objectValues.passingYear = key?.passingYear || "";
        objectValues.maxMarks = key?.maxMarks || "";
        objectValues.scoredMarks = key?.scoredMarks || "";
        objectValues.percentage = key?.percentage || "";
        academicTempValues.push(objectValues);
      });

      const count =
        programType === "Yearly"
          ? responseData.number_of_years
          : responseData.number_of_semester;
      const yearSem = [];

      for (let i = 1; i <= count; i++) {
        yearSem.push({
          value: i,
          label: programType === "Yearly" ? `Year ${i}` : `Sem ${i}`,
        });
      }

      setValues((prev) => ({
        ...prev,
        studentName,
        dob: moment(dob, "DD-MM-YYYY"),
        gender,
        mobileNo,
        alternateMobile,
        email,
        religion: religion ?? "",
        casteCategory: casteCategory ?? "",
        bloodGroup: bloodGroup ?? "",
        maritalStatus,
        nationality,
        whatsAppNo,
        aadharNo,
      }));

      setAdditionalValues((prev) => ({
        ...prev,
        fatherName,
        fatherMobile: fatherMobile ?? "",
        fatherEmail: fatherEmail ?? "",
        fatherOccupation: fatherOccupation ?? "",
        fatherIncome: fatherIncome ?? "",
        fatherQualification,
        motherName: motherName ?? "",
        motherMobile: motherMobile ?? "",
        motherEmail,
        motherOccupation,
        motherQualification,
        motherIncome: motherIncome ?? "",
        guardianName: guardianName ?? "",
        guardianMobile: guardianMobile ?? "",
        guardianEmail,
        guardianOccupation,
      }));

      setAddressValues((prev) => ({
        ...prev,
        permanentAddressTwo: permanentAddress ?? "",
        permanentAddress: permanentAddressTwo ?? "",
        permanentCountry: permanentCountry,
        permanantState: permanentState,
        permanantCity: permanentCity,
        permanentPincode: permanentPincode ?? "",
        currentAddress: currentAddressTwo ?? "",
        currentAddressTwo: presentAddress ?? "",
        currentCountry: presentCountry,
        currentState: presentState,
        currentPincode: presentPincode ?? "",
        currentCity: presentCity,
      }));

      setProgramValues((prev) => ({
        ...prev,
        acYearId,
        schoolId,
        programId,
        programAssignmentId,
        prgId,
        feeTemplateId,
        admissionCategory,
        admissionSubCategory,
        isRegular,
        latYear,
        currentYearSem: latYear,
      }));

      setOptionalValues((prev) => ({
        ...prev,
        optionalMaxMarks,
        optionalPercentage,
        optionalScoredMarks,
        optionalSubject,
        isEntranceExam: entranceExamName ? "Yes" : "No",
        entrance_exam_name: entranceExamName,
        entrance_score: rank,
        area,
      }));

      setData(responseData);
      setNoOfYears(yearSem);
      setTranscriptValues(transcriptObj);
      setNoStatusData(noStatus);
      setAcademicValues(academicTempValues);
    } catch (err) {
      console.error(err);

      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Failed to fetch the data",
      });
      setAlertOpen(true);
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    if (value.length > maxLength) return;
    setNotes(value);
  };

  const getRemainingCharacters = () => maxLength - notes.length;

  const requiredFieldsValid = (array, value, checksList) => {
    for (let i = 0; i < array.length; i++) {
      const field = array[i];
      if (Object.keys(checksList).includes(field)) {
        const ch = checksList[field];
        for (let j = 0; j < ch.length; j++) if (!ch[j]) return false;
      } else if (!value[field]) return false;
    }
    return true;
  };

  const validateAllFields = () => {
    const isPersonalValid = requiredFieldsValid(requiredFields, values, checks);
    const isAdditionalValid = requiredFieldsValid(
      additionalRequired,
      additionalValues,
      additonalChecks
    );
    const isAddressRequired = requiredFieldsValid(
      addressRequired,
      addressValues,
      addressChecks
    );

    return !isPersonalValid || !isAdditionalValid || !isAddressRequired;
  };

  const validateChecks = () =>
    Object.values({
      ...checks,
      ...additonalChecks,
      ...addressChecks,
    })
      .flat()
      .includes(false);

  const academicMandatory = () => {
    const universities = [];
    academicValues.forEach((obj) => {
      universities.push(obj.university);
    });
    const hasValue = universities.some((item) => item !== "" && item !== null);
    return hasValue;
  };

  const academicValidation = () => {
    if (optionalValues.area === "") {
      return false;
    }
    return academicValues.every((obj) => {
      const isFilled = obj.university?.trim() || obj.collegeName?.trim();
      if (isFilled) {
        return obj.university && obj.collegeName && obj.passingYear;
      }
      return true;
    });
  };

  const validateTranscript = () => {
    return transcriptValues
      .filter((fil) => fil.transcriptId !== null)
      .every((obj) => {
        return (
          obj.submittedStatus === true ||
          obj.lastDate !== null ||
          obj.notRequied === true
        );
      });
  };

  const CustomAccordianSummary = ({ Icon, title, isCompleted }) => (
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton sx={{ padding: 0 }}>
            <Icon color="primary" sx={{ fontSize: 30 }} />
          </IconButton>
          <Typography variant="subtitle2" color="primary" sx={{ fontSize: 14 }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          title={
            isCompleted ? "Completed" : "Please fill all the mandatory fields"
          }
          sx={{ padding: 0 }}
        >
          {isCompleted ? (
            <CheckCircleIcon color="success" />
          ) : (
            <ErrorIcon color="error" />
          )}
        </IconButton>
      </Box>
    </AccordionSummary>
  );

  const handleCreate = async () => {
    if (!academicValidation()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill all the qualification details !!",
      });
      setAlertOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      const {
        studentName,
        dob,
        gender,
        mobileNo,
        alternateMobile,
        email,
        religion,
        casteCategory,
        bloodGroup,
        nationality,
        whatsAppNo,
        maritalStatus,
        aadharNo,
      } = values;

      const {
        fatherName,
        fatherMobile,
        fatherEmail,
        fatherOccupation,
        fatherQualification,
        fatherIncome,
        motherName,
        motherMobile,
        motherEmail,
        motherOccupation,
        motherQualification,
        motherIncome,
        guardianName,
        guardianMobile,
        guardianEmail,
        guardianOccupation,
        guardianRelationship,
      } = additionalValues;

      const {
        permanentAddress,
        permanentAddressTwo,
        permanentCountry,
        permanantState,
        permanantCity,
        permanentPincode,
        currentAddress,
        currentAddressTwo,
        currentCountry,
        currentState,
        currentCity,
        currentPincode,
        localAddress,
        localAddressTwo,
        localCountry,
        localState,
        localCity,
        localPincode,
      } = addressValues;

      const {
        bankName,
        accountHolderName,
        accountNumber,
        bankBranch,
        ifscCode,
      } = bankValues;

      const {
        acYearId,
        schoolId,
        programId,
        programAssignmentId,
        prgId,
        feeTemplateId,
        admissionCategory,
        isRegular,
        latYear,
      } = programValues;

      const {
        optionalSubject,
        optionalMaxMarks,
        optionalScoredMarks,
        optionalPercentage,
        entranceExamName,
        rank,
        area,
      } = optionalValues;

      const std = {};

      std.active = true;
      std.student_name = studentName;
      std.dateofbirth = dob;
      std.candidate_sex = gender;
      std.mobile = mobileNo;
      std.alternate_number = alternateMobile;
      std.student_email = email;
      std.religion = religion;
      std.caste_category = casteCategory;
      std.blood_group = bloodGroup;
      std.nationality = nationality;
      std.whatsapp_number = whatsAppNo;
      std.marital_status = maritalStatus;
      std.rural_urban = area;

      std.father_name = fatherName;
      std.father_mobile = fatherMobile;
      std.father_email = fatherEmail;
      std.father_occupation = fatherOccupation;
      std.father_qualification = fatherQualification;
      std.father_income = fatherIncome;

      std.mother_name = motherName;
      std.mother_mobile = motherMobile;
      std.mother_email = motherEmail;
      std.mother_occupation = motherOccupation;
      std.mother_qualification = motherQualification;
      std.mother_income = motherIncome;

      std.guardian_name = guardianName;
      std.guardian_phone = guardianMobile;
      std.guardian_email = guardianEmail;
      std.guardian_occupation = guardianOccupation;
      std.guardian_relation_to_student = guardianRelationship;

      std.permanent_address = permanentAddress;
      std.permanant_adress1 = permanentAddressTwo;
      std.permanant_country = permanentCountry;
      std.permanant_state = permanantState;
      std.permanant_city = permanantCity;
      std.permanant_pincode = permanentPincode;

      std.current_address = currentAddress;
      std.current_adress1 = currentAddressTwo;
      std.current_country = currentCountry;
      std.current_state = currentState;
      std.current_city = currentCity;
      std.current_pincode = currentPincode;

      std.local_adress1 = localAddress;
      std.local_adress1 = localAddressTwo;
      std.local_country = localCountry;
      std.local_state = localState;
      std.local_city = localCity;
      std.local_pincode = localPincode;

      std.bank_name = bankName;
      std.account_holder_name = accountHolderName;
      std.account_number = accountNumber;
      std.bank_branch = bankBranch;
      std.ifsc_code = ifscCode;
      std.adhar_number = aadharNo;

      std.ac_year_id = acYearId;
      std.school_id = schoolId;
      std.program_id = prgId;
      std.program_assignment_id = programAssignmentId;
      std.program_specialization_id = programId;
      std.fee_template_id = feeTemplateId;
      std.fee_admission_category_id = admissionCategory;
      std.email_preferred_name = programValues.preferredName.trim();
      std.candidate_id = id;
      std.notes = notes;

      const reporting = {};
      reporting.current_year = Math.ceil(latYear / 2);
      reporting.current_sem = latYear;
      reporting.distinct_status = true;
      reporting.eligible_reported_status = 1;
      reporting.active = true;

      const education = [];
      academicValues.forEach((obj) => {
        if (obj.university !== "" || obj.collegeName !== "") {
          const createObj = {
            applicant_id: id,
            board_university: obj.university,
            college_name: obj.collegeName,
            subjects_studied: obj.subject,
            marks_total: obj.maxMarks,
            course: obj.qualification,
            total_obtained: obj.scoredMarks,
            percentage_scored: obj.percentage,
            passed_year: obj.passingYear,
          };
          if (obj.qualification === "PUC") {
            createObj.optional_subject = optionalSubject;
            createObj.optional_max_mark = optionalMaxMarks;
            createObj.optional_min_mark = optionalScoredMarks;
            createObj.optional_percentage = optionalPercentage;
          }
          education.push(createObj);
        }
      });
      const transcript = {};
      const submitted = [];
      const pending = {};
      const notApplicable = [];

      transcript.active = true;
      transcriptValues.forEach((obj) => {
        if (obj.submittedStatus === true) {
          submitted.push(obj.transcriptId);
        }
        if (obj.lastDate !== null) {
          pending[obj.transcriptId] = obj.lastDate;
        }
        if (obj.notRequied === true) {
          notApplicable.push(obj.transcriptId);
        }
      });
      transcript.transcript_id = submitted;
      transcript.submitted_date = pending;
      transcript.not_applicable = notApplicable;

      const temp = {};
      temp.sd = std;
      temp.ap = education;
      temp.streq = transcript;
      temp.pgapp = {};
      temp.see = { entrance_exam_name: entranceExamName, score: rank };
      temp.srsh = {};
      temp.rs = reporting;

      const response = await axios.post("/api/student/Student_Details", temp);
      if (!response.data.success)
        throw new Error("Failed to create student AUID.");
      const { auid: studentAuid, student_id: studentId } = response.data.data;
      const bonofideType = "Provisional Bonafide";
      // Create Bonafide
      const postData = {
        active: true,
        auid: studentAuid,
        bonafide_type: bonofideType,
      };
      const bonafideResponse = await axios.post(
        "/api/student/studentBonafide",
        postData
      );
      if (!bonafideResponse.data.success)
        throw new Error("Failed to create bonafide entry.");
      const [bonafideRes, addOnRes, studentRes] = await Promise.all([
        axios.get(
          `/api/student/studentBonafideDetails?auid=${studentAuid}&bonafide_type=${bonofideType}`
        ),
        axios.get(
          `/api/student/studentBonafideAddOnDetails?auid=${studentAuid}&bonafide_type=${bonofideType}`
        ),
        axios.get(
          `/api/student/getStudentDetailsBasedOnAuidAndStrudentId?auid=${studentAuid}`
        ),
      ]);
      const bonafideData = bonafideRes.data.data;
      const { AddOn, uniformAndStationaryData } = addOnRes.data.data;
      const finalData = [...AddOn, ...uniformAndStationaryData];
      const lists = finalData.filter((el) => !!el.feeType);

      let filterSemesterHeader = [];
      const semesterHeaderLists = Array.from(
        { length: bonafideData[0]?.number_of_semester },
        (_, i) => ({
          value: `sem${i + 1}`,
          label: `Sem ${i + 1}`,
        })
      );
      filterSemesterHeader = semesterHeaderLists;
      let amountLists = [];
      for (let j = 0; j < bonafideData.length; j++) {
        let list = {};
        for (let i = 1; i <= bonafideData[0]?.number_of_semester; i++) {
          list[`sem${i}`] = bonafideData[j][`year${i}_amt`] || 0;
          list["particular"] = bonafideData[j]["voucher_head"] || "";
        }
        amountLists.push(list);
      }
      let addOnAmountLists = [];
      for (let j = 0; j < lists.length; j++) {
        let list = {};
        for (let i = 1; i <= lists[0]?.number_of_semester; i++) {
          list[`sem${i}`] = lists[j][`sem${i}`] || 0;
          list["particular"] = lists[j]["feeType"] || "";
        }
        addOnAmountLists.push(list);
      }
      const studentBonafideDetail = bonafideData.map((ele) => ({
        ...ele,
        acerpAmount: amountLists,
      }));
      const studentDetail = studentRes.data.data[0];
      const semesterHeaderList = filterSemesterHeader?.filter((key) =>
        amountLists.some((row) => row[key["value"]] !== 0)
      );
      const bonafideAddOnDetail = lists.map((el) => ({
        ...el,
        addOnAmountList: addOnAmountLists,
      }));
      const addOnSemesterHeaderList = filterSemesterHeader?.filter((key) =>
        addOnAmountLists.some((row) => row[key["value"]] !== 0)
      );
      const status = false;
      const provisionCertificate = await GenerateProvisionalCertificate(
        studentDetail
      );
      const provisionBlob = new Blob([provisionCertificate], {
        type: "application/pdf",
      });
      const formData = new FormData();
      formData.append(
        "files",
        provisionBlob,
        "provision-admission-certificate.pdf"
      );
      formData.append("student_id", studentId);
      if (programValues.admissionCategory !== 2) {
        const bonafidePrintResponse = await GenerateBonafide(
          studentBonafideDetail,
          studentDetail,
          semesterHeaderList,
          bonafideAddOnDetail,
          addOnSemesterHeaderList,
          status
        );
        const bonafideBlob = new Blob([bonafidePrintResponse], {
          type: "application/pdf",
        });
        formData.append("files", bonafideBlob, "bonafide-certificate.pdf");
      }
      const mailResponse = await axios.post(
        "/api/student/sendEmailForStudentOnboardingWithProvisionalAndBonafide",
        formData
      );
      if (mailResponse.data.success) {
        setAlertMessage({
          severity: "success",
          message: "AUID has been created successfully",
        });
        setAlertOpen(true);

        navigate(
          type === "user"
            ? "/admissions-userwise"
            : type === "admin"
            ? "/admissions"
            : "/admissions-intl",
          { replace: true }
        );
      } else {
        throw new Error("Failed to send onboarding email.");
      }
    } catch (err) {
      console.error(err);
      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Failed to create AUID !!",
      });
      setAlertOpen(true);
      navigate(
        type === "user"
          ? "/admissions-userwise"
          : type === "admin"
          ? "/admissions"
          : "/admissions-intl",
        { replace: true }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setConfirmContent({
      title: "",
      message: "Would you like to confirm?",
      buttons: [
        { name: "Yes", color: "primary", func: handleCreate },
        { name: "No", color: "primary", func: () => {} },
      ],
    });
    setConfirmOpen(true);
  };

  const handleBack = () => {
    navigate(
      type === "user"
        ? "/admissions-userwise"
        : type === "admin"
        ? "/admissions"
        : "/admissions-intl"
    );
  };

  const handlePersonalStatus = () =>
    requiredFieldsValid(requiredFields, values, checks) &&
    !Object.values({ ...checks })
      .flat()
      .includes(false);

  const handleAdditionalStatus = () =>
    requiredFieldsValid(
      additionalRequired,
      additionalValues,
      additonalChecks
    ) &&
    !Object.values({ ...additonalChecks })
      .flat()
      .includes(false);

  const handleAddressStatus = () =>
    requiredFieldsValid(addressRequired, addressValues, addressChecks) &&
    !Object.values({ ...addressChecks })
      .flat()
      .includes(false);

  return (
    <>
      <CustomModal
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={confirmContent.title}
        message={confirmContent.message}
        buttons={confirmContent.buttons}
      />

      <Box
        sx={{
          margin: { xs: "20px 0px 0px 0px", md: "15px 15px 0px 15px" },
        }}
      >
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10}>
            <Paper
              elevation={4}
              sx={{
                padding: 4,
                borderRadius: 4,
                backgroundColor: "#f7f7f7",
              }}
            >
              <Grid container rowSpacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Divider sx={{ color: "primary.main" }}>
                      <Chip
                        label={
                          <Typography variant="subtitle2" sx={{ fontSize: 12 }}>
                            ADMISSION
                          </Typography>
                        }
                        size="small"
                        color="primary"
                      />
                    </Divider>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  {/* Personal */}
                  <Accordion
                    sx={{ borderLeft: 4, borderColor: "primary.main" }}
                  >
                    <CustomAccordianSummary
                      Icon={ContactPageIcon}
                      title="Personal Details"
                      isCompleted={handlePersonalStatus()}
                    />
                    <AccordionDetails>
                      <Box sx={{ padding: 2 }}>
                        <PersonalDetailsForm
                          values={values}
                          setValues={setValues}
                          checks={checks}
                          errorMessages={errorMessages}
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Additional  */}
                  <Accordion
                    sx={{ borderLeft: 4, borderColor: "primary.main" }}
                  >
                    <CustomAccordianSummary
                      Icon={PersonAddAlt1Icon}
                      title="Additional Information"
                      isCompleted={handleAdditionalStatus()}
                    />
                    <AccordionDetails>
                      <Box sx={{ padding: 2 }}>
                        <AdditionalDetailsForm
                          additionalValues={additionalValues}
                          setAdditionalValues={setAdditionalValues}
                          additonalChecks={additonalChecks}
                          additionalErrorMessages={additionalErrorMessages}
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  {/* Address  */}
                  <Accordion
                    sx={{ borderLeft: 4, borderColor: "primary.main" }}
                  >
                    <CustomAccordianSummary
                      Icon={HomeIcon}
                      title="Address"
                      isCompleted={handleAddressStatus()}
                    />
                    <AccordionDetails>
                      <Box sx={{ padding: 2 }}>
                        <AddressDetailsForm
                          addressValues={addressValues}
                          setAddressValues={setAddressValues}
                          addressChecks={addressChecks}
                          addressErrorMessages={addressErrorMessages}
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  {/* Bank  */}
                  <Accordion
                    sx={{ borderLeft: 4, borderColor: "primary.main" }}
                  >
                    <CustomAccordianSummary
                      Icon={AccountBalanceIcon}
                      title="Bank Details"
                      isCompleted={true}
                    />
                    <AccordionDetails>
                      <Box sx={{ padding: 2 }}>
                        <BankDetailsForm
                          bankValues={bankValues}
                          setBankValues={setBankValues}
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  {/* Academic  */}
                  <Accordion
                    sx={{ borderLeft: 4, borderColor: "primary.main" }}
                  >
                    <CustomAccordianSummary
                      Icon={SchoolIcon}
                      title="Academic Background"
                      isCompleted={academicValidation() && academicMandatory()}
                    />
                    <AccordionDetails>
                      <Box sx={{ padding: 2 }}>
                        <AcademicDetailsForm
                          academicValues={academicValues}
                          setAcademicValues={setAcademicValues}
                          optionalValues={optionalValues}
                          setOptionalValues={setOptionalValues}
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  {/* Program  */}
                  <Accordion
                    sx={{ borderLeft: 4, borderColor: "primary.main" }}
                  >
                    <CustomAccordianSummary
                      Icon={MenuBookIcon}
                      title="Program Details"
                      isCompleted={!prefferedCheck}
                    />
                    <AccordionDetails>
                      <Box sx={{ padding: 2 }}>
                        <ProgramDetailsForm
                          programValues={programValues}
                          setProgramValues={setProgramValues}
                          data={data}
                          noOfYears={noOfYears}
                          prefferedCheck={prefferedCheck}
                          nameExist={nameExist}
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  {/* Transcript  */}
                  <Accordion
                    sx={{ borderLeft: 4, borderColor: "primary.main" }}
                    defaultExpanded
                  >
                    <CustomAccordianSummary
                      Icon={FolderCopyIcon}
                      title="Document Collection"
                      isCompleted={validateTranscript()}
                    />
                    <AccordionDetails>
                      <Box sx={{ padding: 2 }}>
                        <TranscriptDetailsForm
                          transcriptValues={transcriptValues}
                          setTranscriptValues={setTranscriptValues}
                          noStatuData={noStatuData}
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                <Grid item xs={12} md={6}>
                  <CustomTextField
                    name="note"
                    label="Note"
                    value={notes}
                    handleChange={handleChange}
                    helperText={`Remaining characters : ${getRemainingCharacters(
                      "note"
                    )}`}
                    multiline
                  />
                </Grid>

                <Grid item xs={12} align="right" mt={2}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: "right",
                      justifyContent: "right",
                    }}
                  >
                    <Button variant="contained" onClick={() => handleBack()}>
                      GO BACK
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={
                        isLoading ||
                        validateAllFields() ||
                        validateChecks() ||
                        !academicMandatory() ||
                        !validateTranscript()
                      }
                    >
                      {isLoading ? (
                        <CircularProgress
                          size={25}
                          color="blue"
                          style={{ margin: "2px 13px" }}
                        />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default AdmissionForm;
