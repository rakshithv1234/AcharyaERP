import { useEffect, useState } from "react";
import axios from "../../../services/Api";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import moment from "moment";

const initialValues = { lockerNo: "" };

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "rgba(74, 87, 169, 0.1)",
    color: "#46464E",
    textAlign: "center",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const userName = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userName;

function DocumentCollectionForm() {
  const [values, setValues] = useState(initialValues);
  const [studentData, setStudentData] = useState([]);
  const [transcriptCollectedData, setTranscriptCollectedData] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const setCrumbs = useBreadcrumbs();

  useEffect(() => {
    getStudentData();
    getTranscriptData();
    setCrumbs([{ name: "Student Master", link: "/student-master" }]);
  }, []);

  const getStudentData = async () => {
    const studentDetails = await axios
      .get(`/api/student/Student_DetailsAuid/${id}`)
      .then((res) => {
        setStudentData(res.data.data[0]);
        return res.data.data[0];
      })
      .catch((err) => console.error(err));

    const allTranscript = await axios
      .get(
        `/api/academic/fetchProgramTranscriptDetails/${studentDetails.program_id}`
      )
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => console.error(err));

    const studentTranscript = await axios
      .get(`/api/student/StudentTranscriptSubmission1/${id}`)
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => console.error(err));

    const notsubmittedData = studentTranscript.filter(
      (obj) => obj.will_submit_by
    );

    const studentTranscriptIds = new Set(
      studentTranscript.map((item) => item.stu_transcript_id)
    );

    const temp = [];

    const filtered = allTranscript?.filter((item) =>
      notsubmittedData?.some(
        (masterItem) => item.transcript === masterItem.transcript
      )
    );

    filtered.forEach((item) => {
      const getLastDate = studentTranscript.filter(
        (obj) => obj.transcript_id === item.transcript_id
      );

      temp.push({
        transcriptId: item.transcript_id || null,
        // stuTranscriptId: item?.stu_transcript_id || null,
        transcript: item.transcript || "",
        submittedStatus: false,
        lastDate:
          getLastDate.length > 0 ? getLastDate?.[0]?.will_submit_by : null,
        notRequied: false,
        submittedStatusDisabled: false,
        notRequiedDisabled: false,
        lastDateDisabled: false,
      });
    });

    // const submittedData = allTranscript?.filter(
    //   (obj) => !studentTranscriptIds.has(obj?.stu_transcript_id)
    // );

    // const collectedTranscriptIds = studentTranscript
    //   .filter(
    //     (obj) =>
    //       obj.is_collected === "YES" ||
    //       obj.not_applicable === "YES" ||
    //       obj?.submitted_date
    //   )
    //   .map((item) => item.transcript_id);

    setTranscriptCollectedData(
      studentTranscript.filter(
        (obj) =>
          (obj.is_collected === "YES" ||
            obj.not_applicable === "YES" ||
            obj?.submitted_date) &&
          !obj.will_submit_by
      )
    );

    const transcriptObj = [];
    temp.forEach((obj) => {
      const getStuTranscriptId = studentTranscript.filter(
        (value) => value.transcript_id === obj.transcriptId
      );

      transcriptObj.push({
        transcriptId: obj.transcriptId,
        stuTranscriptId:
          getStuTranscriptId.length > 0
            ? getStuTranscriptId[0].stu_transcript_id
            : null,
        transcript: obj.transcript,
        submittedStatus: false,
        lastDate: obj.lastDate,
        notRequied: false,
        submittedStatusDisabled: false,
        notRequiedDisabled: false,
        lastDateDisabled: false,
      });
    });

    setValues((prev) => ({
      ...prev,
      transcript: transcriptObj,
    }));
  };

  const getTranscriptData = async () => {
    await axios
      .get(`/api/student/StudentTranscriptSubmission1/${id}`)
      .then((res) => {})
      .catch((error) => console.error(error));
  };

  const handleChangeTranscript = (e) => {
    const splitName = e.target.name.split("-");

    setValues((prev) => ({
      ...prev,
      transcript: prev.transcript.map((obj, i) => {
        if (obj.transcriptId === Number(splitName[1])) {
          const temp = { ...obj };

          if (splitName[0] === "submittedStatus") {
            temp.lastDate = null;
            temp.notRequied = false;
            temp.submittedStatus = e.target.checked;
            temp.notRequiedDisabled = e.target.checked === true ? true : false;
            temp.lastDateDisabled = e.target.checked === true ? true : false;
          } else if (splitName[0] === "notRequied") {
            temp.lastDate = null;
            temp.notRequied = e.target.checked;
            temp.submittedStatus = false;
            temp.submittedStatusDisabled =
              e.target.checked === true ? true : false;
            temp.lastDateDisabled = e.target.checked === true ? true : false;
          }
          return temp;
        }

        return obj;
      }),
    }));
  };

  const handleChangeLastDate = (name, newValue) => {
    const splitName = name.split("-");
    setValues((prev) => ({
      ...prev,
      transcript: prev.transcript.map((obj, i) => {
        if (obj.transcriptId === Number(splitName[1]))
          return {
            ...obj,
            [splitName[0]]: newValue,
          };
        return obj;
      }),
    }));
  };

  const handleCreate = async () => {
    const putTemp = [];
    const postTemp = [];

    values.transcript.forEach((obj) => {
      if (
        obj.submittedStatus === true ||
        obj.lastDate !== null ||
        obj.notRequied === true
      ) {
        if (obj.stuTranscriptId === null) {
          postTemp.push({
            active: true,
            transcript_id: obj.transcriptId,
            student_id: studentData.student_id,
            is_collected: obj.submittedStatus === true ? "YES" : null,
            submitted_date: obj.lastDate
              ? moment(obj.lastDate).format("YYYY-MM-DD")
              : moment().format("YYYY-MM-DD"),
            not_applicable: obj.notRequied === true ? "YES" : null,
          });
        } else {
          putTemp.push({
            active: true,
            stu_transcript_id: obj.stuTranscriptId,
            transcript_id: obj.transcriptId,
            student_id: studentData.student_id,
            is_collected: obj.submittedStatus === true ? "YES" : null,
            submitted_date: obj.lastDate
              ? moment(obj.lastDate).format("DD-MM-YYYY")
              : moment(new Date()).format("DD-MM-YYYY"),
            not_applicable: obj.notRequied === true ? "YES" : null,
            will_submit_by: obj.lastDate ? obj.lastDate : null,
            created_username: userName,
          });
        }
      }
    });

    if (putTemp.length > 0) {
      await axios
        .put(`/api/student/StudentTranscriptSubmission/${id}`, putTemp)
        .then((res) => {})
        .catch((err) => console.error(err));
    }

    if (postTemp.length > 0) {
      await axios
        .post(`/api/student/StudentTranscriptSubmission`, postTemp)
        .then((res) => {})
        .catch((err) => console.error(err));
    }

    navigate(`/StudentTranscriptApplication/${id}`);
  };

  return (
    <Box m={2}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={10}>
          <Card>
            <CardHeader
              title="Document Collection"
              titleTypographyProps={{ variant: "subtitle2", fontSize: 13 }}
              sx={{
                backgroundColor: "auzColor.main",
                color: "headerWhite.main",
                padding: 1,
              }}
            />
            <CardContent>
              <Grid container columnSpacing={1} rowSpacing={1}>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">Student Name</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {studentData.student_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">AUID</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    {studentData.auid}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">Date of Admission</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    {studentData?.date_of_admission
                      ?.split("-")
                      ?.reverse()
                      ?.join("-")}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">Ac Year</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    {studentData.ac_year}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">School</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    {studentData.school_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">Program</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    {studentData.program_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">Specialization</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    {studentData.program_specialization_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2">
                    Admission Category
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    {studentData.fee_admission_category_type}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12} mt={2}>
                  <TableContainer component={Paper} elevation={2}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Transcript</StyledTableCell>
                          <StyledTableCell>Is Submitted</StyledTableCell>
                          <StyledTableCell>Last Date</StyledTableCell>
                          <StyledTableCell>Not Applicable</StyledTableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {transcriptCollectedData?.map((obj, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell>{obj.transcript}</TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                {obj.is_collected}
                              </TableCell>
                              {obj.is_collected !== "YES" &&
                              obj.not_applicable !== "YES" ? (
                                <TableCell sx={{ textAlign: "center" }}>
                                  {moment(obj.will_submit_by).format(
                                    "DD-MM-YYYY"
                                  )}
                                </TableCell>
                              ) : (
                                <TableCell sx={{ textAlign: "center" }}>
                                  {obj.submitted_date}{" "}
                                </TableCell>
                              )}
                              <TableCell sx={{ textAlign: "center" }}>
                                {obj.not_applicable}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {values?.transcript?.map((obj, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell>{obj.transcript}</TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <Checkbox
                                  name={"submittedStatus-" + obj.transcriptId}
                                  onChange={handleChangeTranscript}
                                  sx={{
                                    color: "auzColor.main",
                                    "&.Mui-checked": {
                                      color: "auzColor.main",
                                    },
                                  }}
                                  disabled={obj.submittedStatusDisabled}
                                />
                              </TableCell>
                              <TableCell>
                                <CustomDatePicker
                                  name={"lastDate-" + obj.transcriptId}
                                  value={obj.lastDate}
                                  handleChangeAdvance={handleChangeLastDate}
                                  disabled={obj.lastDateDisabled}
                                  disablePast
                                />
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <Checkbox
                                  name={"notRequied-" + obj.transcriptId}
                                  onChange={handleChangeTranscript}
                                  sx={{
                                    padding: 0,
                                    color: "auzColor.main",
                                    "&.Mui-checked": {
                                      color: "auzColor.main",
                                    },
                                  }}
                                  disabled={obj.notRequiedDisabled}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* <Grid item xs={12} md={4} mt={2}>
                  <CustomTextField
                    name="lockerNo"
                    label="Locker Number"
                    value={values.lockerNo}
                    handleChange={handleChange}
                  />
                </Grid> */}

                <Grid item xs={12} align="right" mt={2}>
                  <Button
                    variant="contained"
                    onClick={handleCreate}
                    sx={{
                      backgroundColor: "auzColor.main",
                      ":hover": {
                        bgcolor: "auzColor.main",
                      },
                    }}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DocumentCollectionForm;
