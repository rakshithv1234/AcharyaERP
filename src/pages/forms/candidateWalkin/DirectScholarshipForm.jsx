import { lazy, useEffect, useState } from "react";
import axios from "../../../services/Api";
import { Box, Button, CircularProgress, Grid } from "@mui/material";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import FormPaperWrapper from "../../../components/FormPaperWrapper";
import moment from "moment";

const StudentDetails = lazy(() => import("../../../components/StudentDetails"));
const DirectScholarshipAmountForm = lazy(() =>
  import("./DirectScholarshipAmountForm")
);

const initialValues = {
  auid: "",
  residency: "rented",
  scholarship: "false",
  scholarshipYes: "",
  reason: "",
  income: "",
  occupation: "",
  scholarshipData: {},
  document: "",
  remarks: "",
  adjStatus: false,
};

const breadCrumbsList = [
  { name: "Verify Scholarship", link: "/scholarship" },
  { name: "Create" },
];

function DirectScholarshipForm() {
  const [values, setValues] = useState(initialValues);
  const [studentData, setStudentData] = useState(null);
  const [feeTemplateData, setFeeTemplateData] = useState(null);
  const [noOfYears, setNoOfYears] = useState([]);
  const [feeTemplateSubAmountData, setFeeTemplateSubAmountData] = useState([]);
  const [yearwiseSubAmount, setYearwiseSubAmount] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feeDueData, setFeeDueData] = useState([]);
  const [checkYearData, setCheckYearData] = useState([]);

  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();

  const checks = {
    auid: [
      values.auid !== "",
      /^[a-zA-Z0-9]*$/.test(values.auid),
      /^[A-Za-z]{3}\d{2}[A-Za-z]{4}\d{3}$/.test(values.auid),
    ],
  };

  const errorMessages = {
    auid: [
      "This field is required",
      "Special characters and space is not allowed",
      "Invalid AUID",
    ],
  };

  useEffect(() => {
    setCrumbs(breadCrumbsList);
  }, []);

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/student/studentDetailsByAuid/${values.auid}`
      );
      if (response.data.data.length === 0) {
        setAlertMessage({
          severity: "error",
          message: "AUID is not present !!",
        });
        setAlertOpen(true);
        return;
      }
      const data = response.data.data[0];
      if (!data.candidate_id) {
        const stdRes = await axios.get(
          `/api/student/Student_Details/${data.student_id}`
        );
        const stdResData = stdRes.data.data;
        const {
          student_name: candidateName,
          dateofbirth: dob,
          candidate_sex: gender,
          father_name: fatherName,
          program_assignment_id: programAssignmentId,
          program_id: programId,
          program_specialization_id: programSplId,
          acharya_email: email,
          mobile: phoneNumber,
          school_id: schoolId,
          ac_year_id: acyearId,
        } = stdResData;

        // Create Candidate
        const postData = {
          active: true,
          candidate_name: candidateName,
          date_of_birth: moment(dob).format("DD-MM-YYYY"),
          candidate_sex: gender,
          father_name: fatherName,
          program_assignment_id: programAssignmentId,
          program_id: programId,
          candidate_email: email,
          mobile_number: phoneNumber,
          school_id: schoolId,
          ac_year_id: acyearId,
          program_specilaization_id: programSplId,
        };

        const candidateRes = await axios.post(
          "/api/student/Candidate_Walkin1",
          postData
        );
        if (!candidateRes.data.success) {
          throw new Error("Candidate ID not found.");
        }
        // Update Candidate ID
        stdResData.candidate_id = candidateRes.data.data.candidate_id;
        const stdUpdateRes = await axios.put(
          `/api/student/Student_Details/${stdResData.student_id}`,
          stdResData
        );
        if (!stdUpdateRes.data.success) {
          throw new Error("Something went wrong.");
        }
        // get updated student data after candidate id updated
        const updatedStdRes = await axios.get(
          `/api/student/studentDetailsByAuid/${values.auid}`
        );
        const updatedStdResData = updatedStdRes.data.data[0];
        await getData(updatedStdResData);
      } else {
        await getData(data);
      }
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to fetch the student details!",
      });
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getData = async (data) => {
    const {
      fee_template_id,
      student_id,
      program_type_name: programType,
      number_of_years,
      number_of_semester,
    } = data;

    try {
      const [
        feeTemplateResponse,
        subAmountResponse,
        reasonResponse,
        scholarshipResponse,
        studentDue,
      ] = await Promise.all([
        axios.get(`/api/finance/FetchAllFeeTemplateDetail/${fee_template_id}`),
        axios.get(
          `/api/finance/FetchFeeTemplateSubAmountDetail/${fee_template_id}`
        ),
        axios.get("/api/categoryTypeDetailsForReasonFeeExcemption"),
        axios.get(`/api/student/getYearWiseDataByStudentId/${student_id}`),
        axios.get(`/api/student/studentWiseDueReportByStudentId/${student_id}`),
      ]);

      const optionData = [];
      reasonResponse.data.data.forEach((obj) => {
        optionData.push({
          value: obj.category_details_id,
          label: obj.category_detail,
        });
      });

      const feeTemplateData = feeTemplateResponse.data.data[0];
      const feeTemplateSubAmtData = subAmountResponse.data.data[0];
      const schData = scholarshipResponse.data.data;
      const dueData = studentDue.data.data;

      if (Object.values(dueData).length > 0) {
        const {
          addOn,
          auid,
          currentSem,
          currentYear,
          hostelFee,
          studentName,
          templateName,
          ...rest
        } = dueData;

        const yearSemesters = [];
        const subAmountMapping = {};
        const scholarshipDataMapping = {};
        const disableYears = [];

        const programAssignmentType = programType.toLowerCase();
        const feeTemplateProgramType =
          feeTemplateData.program_type_name.toLowerCase();
        const totalYearsOrSemesters =
          programAssignmentType === "yearly"
            ? number_of_years * 2
            : number_of_semester;

        let sum = 0;
        for (let i = 1; i <= totalYearsOrSemesters; i++) {
          if (
            feeTemplateProgramType === "semester" ||
            (feeTemplateProgramType === "yearly" && i % 2 !== 0)
          ) {
            yearSemesters.push({ key: i, value: `Sem ${i}` });
            scholarshipDataMapping[`year${i}`] = "";
            subAmountMapping[`year${i}`] = rest[`sem${i}`];
            sum += feeTemplateSubAmtData[`fee_year${i}_amt`];
          }
        }

        schData.forEach((obj) => {
          yearSemesters.forEach((yearSemester) => {
            const yearKey = `year${yearSemester.key}_amount`;
            if (obj[yearKey] !== 0 && obj.is_approved.toLowerCase() === "yes") {
              disableYears.push(yearKey);
            }
          });
        });

        const dueTotal = Object.values(rest).reduce((a, b) => a + b);

        setStudentData(data);
        setFeeTemplateData(feeTemplateData);
        setFeeTemplateSubAmountData(feeTemplateSubAmtData);
        setNoOfYears(yearSemesters);
        setYearwiseSubAmount(subAmountMapping);
        setFeeDueData(dueData);
        setCheckYearData(disableYears);
        setValues((prev) => ({
          ...prev,
          scholarshipData: scholarshipDataMapping,
          total: dueTotal,
          rowTotal: sum,
        }));
        setReasonOptions(optionData);
      } else {
        throw new Error("Failed to load student due data");
      }
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to load fee template details",
      });
      setAlertOpen(true);
    }
  };

  const renderAuidRow = () => {
    return (
      <>
        <Grid item xs={12} md={3}>
          <CustomTextField
            name="auid"
            label="AUID"
            value={values.auid}
            handleChange={handleChange}
            checks={checks.auid}
            errors={errorMessages.auid}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={2}
          sx={{ textAlign: { xs: "right", md: "left" } }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || values.auid === ""}
          >
            {loading ? (
              <CircularProgress
                size={25}
                color="blue"
                style={{ margin: "2px 13px" }}
              />
            ) : (
              "Submit"
            )}
          </Button>
        </Grid>
      </>
    );
  };

  return (
    <Box sx={{ margin: { xs: "20px 0px 0px 0px", md: "15px 15px 0px 15px" } }}>
      <FormPaperWrapper>
        <Grid container columnSpacing={2} rowSpacing={4}>
          {renderAuidRow()}
          {studentData && (
            <>
              <Grid item xs={12}>
                <StudentDetails id={studentData.student_id} />
              </Grid>
              <Grid item xs={12}>
                <DirectScholarshipAmountForm
                  feeTemplateData={feeTemplateData}
                  feeTemplateSubAmountData={feeTemplateSubAmountData}
                  noOfYears={noOfYears}
                  yearwiseSubAmount={yearwiseSubAmount}
                  values={values}
                  setValues={setValues}
                  reasonOptions={reasonOptions}
                  setAlertMessage={setAlertMessage}
                  setAlertOpen={setAlertOpen}
                  studentData={studentData}
                  feeDueData={feeDueData}
                  checkYearData={checkYearData}
                />
              </Grid>
            </>
          )}
        </Grid>
      </FormPaperWrapper>
    </Box>
  );
}

export default DirectScholarshipForm;
