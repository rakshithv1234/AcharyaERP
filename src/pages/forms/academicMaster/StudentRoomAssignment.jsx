import { useEffect, useState } from "react";
import axios from "../../../services/Api";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.headerWhite.main,
    border: "1px solid rgba(224, 224, 224, 1)",
    textAlign: "center",
  },
}));

const StyledTableCellBody = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.body}`]: {
    border: "1px solid rgba(224, 224, 224, 1)",
  },
}));

function StudentRoomAssignment({
  rowData,
  getData,
  setAlertMessage,
  setAlertOpen,
  setWrapperOpen,
}) {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [updateData, setUpdateData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const {
      ac_year_id: acyearId,
      program_specialization_id: splId,
      current_sem: sem,
      current_year: year,
      course_assignment_id: courseId,
      internal_student_assignment_id: studentAssignmentId,
      date_of_exam: date,
      time_slots_id: timeSlotId,
      internal_session_id: internalId,
    } = rowData;
    try {
      setApiLoading(true);
      const [response, assignedResponse, stdResponse] = await Promise.all([
        axios.get(
          `/api/academic/getStudentDataByCourseAssignmentId/${acyearId}/${splId}/${sem}/${year}/${courseId}`
        ),
        axios.get(
          `/api/academic/internalStudentIdsBasedOnDateAndTimeSlots/${date}/${timeSlotId}`
        ),
        studentAssignmentId !== null
          ? axios.get(
              `/api/academic/internalStudentAssignment/${studentAssignmentId}`
            )
          : null,
      ]);

      const responseData = response.data.data;
      const stdResponseData = stdResponse?.data?.data;
      const stdAssignedData = assignedResponse?.data?.data;

      const assignedStdList = {};
      stdAssignedData.forEach((obj) => {
        const stdList = obj.student_ids
          ?.split(",")
          .filter((item) => item.trim() !== "");
        if (stdList) {
          stdList.forEach((item) => {
            assignedStdList[item] = obj.internal_session_id;
          });
        }
      });

      const data = [];
      responseData.forEach((obj) => {
        const { student_id: studentId, student_name: studentName, auid } = obj;
        if (
          Object.keys(assignedStdList).includes(studentId.toString()) ===
            false ||
          assignedStdList[studentId] === internalId
        )
          data.push({
            studentId,
            studentName,
            auid,
            status: assignedStdList[studentId] === internalId,
          });
      });

      setValues(data);
      setUpdateData(stdResponseData);
    } catch (err) {
      console.error(err);
      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Failed to load data !!",
      });
      setAlertOpen(true);
    } finally {
      setApiLoading(false);
      setWrapperOpen(false);
    }
  };

  const handleChangeStatus = (e) => {
    const { name, checked } = e.target;
    const [field, index] = name.split("-");
    const studentId = Number(index);
    setValues((prev) =>
      prev.map((obj) =>
        obj.studentId === studentId ? { ...obj, [field]: checked } : obj
      )
    );
  };

  const validate = () => {
    const filter = values?.filter((obj) => obj.status === true);
    if (filter.length === 0) return false;
    return true;
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const {
        id,
        internal_session_id: sessionId,
        internal_student_assignment_id: studentAssignmentId,
      } = rowData;

      const studentIds = [];

      values.forEach((obj) => {
        if (obj.status === true) {
          studentIds.push(obj.studentId);
        }
      });

      let response;
      if (studentAssignmentId) {
        const putData = {
          ...updateData,
          student_ids: studentIds.join(","),
        };
        response = await axios.put(
          `/api/academic/internalStudentAssignment/${studentAssignmentId}`,
          putData
        );
      } else {
        const postData = {
          active: true,
          student_ids: studentIds.join(","),
          internal_room_assignment_id: id,
          internal_session_id: sessionId,
        };

        response = await axios.post(
          "/api/academic/internalStudentAssignment",
          postData
        );
      }

      if (response.data.success) {
        setAlertMessage({
          severity: "success",
          message: "Students have been assigned to the room successfully!",
        });
        setAlertOpen(true);
        getData();
      }
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Something went wrong!",
      });
      setAlertOpen(true);
    } finally {
      setLoading(false);
      setWrapperOpen(false);
    }
  };

  if (apiLoading) {
    return (
      <Typography
        variant="subtitle2"
        color="error"
        sx={{ textAlign: "center" }}
      >
        Please wait ....
      </Typography>
    );
  }

  const DisplayTableCell = ({ label, align = "left" }) => (
    <StyledTableCellBody sx={{ textAlign: align }}>
      <Typography variant="subtitle2" color="textSecondary">
        {label}
      </Typography>
    </StyledTableCellBody>
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container rowSpacing={3}>
        <Grid item xs={12}>
          {values.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell />
                    <StyledTableHeadCell>Student Name</StyledTableHeadCell>
                    <StyledTableHeadCell>AUID</StyledTableHeadCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {values.map((obj, i) => (
                    <TableRow key={i}>
                      <StyledTableCellBody sx={{ width: "3%" }}>
                        <Checkbox
                          name={`status-${obj.studentId}`}
                          onChange={handleChangeStatus}
                          checked={obj.status}
                          sx={{
                            padding: 0,
                          }}
                        />
                      </StyledTableCellBody>
                      <DisplayTableCell label={obj.studentName} />
                      <DisplayTableCell label={obj.auid} />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography
              variant="subtitle2"
              color="error"
              sx={{ textAlign: "center" }}
            >
              No Students.
            </Typography>
          )}
        </Grid>

        {values.length > 0 && (
          <Grid item xs={12} align="right">
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={
                loading ||
                (rowData.internal_student_assignment_id === null && !validate())
              }
            >
              {loading ? (
                <CircularProgress
                  size={25}
                  color="blue"
                  style={{ margin: "2px 13px" }}
                />
              ) : (
                <Typography variant="subtitle2">Assign</Typography>
              )}
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default StudentRoomAssignment;
