import { useState, useEffect } from "react";
import {
  Grid,
  Button,
  CircularProgress,
  Box,
  Paper,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import axios from "../../../services/Api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import FormWrapper from "../../../components/FormWrapper";
import { makeStyles } from "@mui/styles";
const label = { inputProps: { "aria-label": "Checkbox demo" } };

const initialValues = {
  acYearId: null,
  schoolId: null,
  programIdForUpdate: null,
  programSpeId: null,
  sectionId: null,
  yearsemId: null,
  remarks: "",
  studentId: "",
};

const requiredFields = [];

const useStyles = makeStyles((theme) => ({
  table: {
    "& .MuiTableCell-root": {
      borderLeft: "1px solid rgba(224, 224, 224, 1)",
      fontSize: "15px",
    },
  },
  bg: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.headerWhite.main,
    padding: "6px",
    textAlign: "center",
  },
}));

function SectionAssignmentForm() {
  const [isNew, setIsNew] = useState(true);
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [sectionAssignmentId, setSectionAssignmentId] = useState(null);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);

  const [programSpeOptions, setProgramSpeOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [yearSemOptions, setYearSemOptions] = useState([]);
  const [studentDetailsOptions, setStudentDetailsOptions] = useState([]);
  const [programType, setProgramType] = useState("Sem");
  const [programId, setProgramId] = useState(null);

  const { id } = useParams();
  const { pathname } = useLocation();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const classes = useStyles();

  useEffect(() => {
    getAcademicyear();
    getSchool();
    if (pathname.toLowerCase() === "/sectionmaster/sectionassignmentform/new") {
      setIsNew(true);
      setCrumbs([
        { name: "Section Master", link: "/SectionMaster/Assign" },
        { name: "Section Assignment" },
      ]);
    } else {
      setIsNew(false);
      getSectionAssignmentData();
    }
  }, []);

  useEffect(() => {
    getProgramSpeData();
    getYearSemData();
    getSectionData();
    {
      isNew ? getStudentDetailsData() : getStudentDetailsDataOne();
    }
  }, [
    values.acYearId,
    values.schoolId,
    programId,
    values.programSpeId,
    values.yearsemId,
    programType,
  ]);

  const checks = {};

  const errorMessages = {};

  const getAcademicyear = async () => {
    await axios
      .get(`/api/academic/academic_year`)
      .then((res) => {
        setAcademicYearOptions(
          res.data.data.map((obj) => ({
            value: obj.ac_year_id,
            label: obj.ac_year,
          }))
        );
      })
      .catch((error) => console.error(error));
  };

  const getSchool = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        setSchoolOptions(
          res.data.data.map((obj) => ({
            value: obj.school_id,
            label: obj.school_name_short,
          }))
        );
      })
      .catch((error) => console.error(error));
  };

  const getProgramSpeData = async () => {
    if (values.acYearId && values.schoolId)
      await axios
        .get(
          `/api/academic/fetchProgramWithSpecialization/${values.acYearId}/${values.schoolId}`
        )
        .then((res) => {
          setProgramSpeOptions(
            res.data.data.map((obj) => ({
              value: obj.program_specialization_id,
              label: obj.specialization_with_program,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getYearSemData = async (id) => {
    if (values.acYearId && programId && values.schoolId)
      await axios
        .get(
          `/api/academic/FetchAcademicProgram/${values.acYearId}/${
            isNew ? programId : values.programIdForUpdate
          }/${values.schoolId}`
        )
        .then((res) => {
          const yearsem = [];
          res.data.data.map((obj) => {
            if (obj.program_type_id === 2) {
              setProgramType("Sem");
              for (let i = 1; i <= obj.number_of_semester; i++) {
                yearsem.push({ value: i, label: "Sem" + "-" + i });
              }
            } else if (obj.program_type_id === 1) {
              setProgramType("Year");
              for (let i = 1; i <= obj.number_of_years; i++) {
                yearsem.push({ value: i, label: "Year" + "-" + i });
              }
            }
          });

          setYearSemOptions(
            yearsem.map((obj) => ({
              value: obj.value,
              label: obj.label,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getSectionData = async () => {
    if (values.schoolId)
      await axios
        .get(`/api/academic/fetchSectionBySchool/${values.schoolId}`)
        .then((res) => {
          setSectionOptions(
            res.data.data.map((obj) => ({
              value: obj.section_id,
              label: obj.section_name,
            }))
          );
        })
        .catch((err) => console.error(err));
  };

  const getStudentDetailsData = async () => {
    if (
      values.acYearId &&
      values.schoolId &&
      values.programId &&
      values.programSpeId &&
      values.yearsemId &&
      programType === "Year"
    ) {
      await axios
        .get(
          `/api/student/fetchStudentDetailForSectionAssignment?ac_year_id=${values.acYearId}&school_id=${values.schoolId}&program_id=${programId}&program_specialization_id=${values.programSpeId}&current_year=${values.yearsemId}`
        )
        .then((res) => {
          setStudentDetailsOptions(res.data.data);
        })
        .catch((err) => console.error(err));
    } else if (
      values.acYearId &&
      values.schoolId &&
      values.programId &&
      values.programSpeId &&
      values.yearsemId &&
      programType === "Sem"
    ) {
      await axios
        .get(
          `/api/student/fetchStudentDetailForSectionAssignment?ac_year_id=${values.acYearId}&school_id=${values.schoolId}&program_id=${values.programId}&program_specialization_id=${values.programSpeId}&current_sem=${values.yearsemId}`
        )
        .then((res) => {
          setStudentDetailsOptions(res.data.data);
        })
        .catch((err) => console.error(err));
    }
  };

  const getStudentDetailsDataOne = async () => {
    await axios
      .get(
        `/api/student/fetchAllStudentDetailForSectionAssignmentFromIndex/${values.acYearId}/${values.schoolId}/${values.programId}/${values.programSpeId}/${values.yearsemId}`
      )
      .then((res) => {
        setStudentDetailsOptions(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const getSectionAssignmentData = async () => {
    await axios
      .get(`/api/academic/SectionAssignment/${id}`)
      .then((res) => {
        setValues({
          acYearId: res.data.data.ac_year_id,
          schoolId: res.data.data.school_id,
          programId: res.data.data.program_id,
          programSpeId: res.data.data.program_specialization_id,
          yearsemId: res.data.data.current_year_sem,
          sectionId: res.data.data.section_id,
          remarks: res.data.data.remarks,
          programIdForUpdate: res.data.data.program_id,
        });
        setSectionAssignmentId(res.data.data.section_assignment_id);
        setCrumbs([
          { name: "Section Master", link: "/SectionMaster/Assign" },
          { name: "Section Assignment" },
          { name: "Update" },
        ]);
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;

    if (name === "selectAll" && checked === true) {
      let tempUser = studentDetailsOptions.map((test) => {
        return { ...test, isChecked: checked };
      });
      setStudentDetailsOptions(tempUser);

      setValues({
        ...values,
        studentId: studentDetailsOptions.map((obj) => obj.student_id),
      });
    } else if (name === "selectAll" && checked === false) {
      let tempUser = studentDetailsOptions.map((test) => {
        return { ...test, isChecked: checked };
      });
      setStudentDetailsOptions(tempUser);

      setValues({
        ...values,
        studentId: [],
      });
    } else if (name !== "selectAll" && checked === true) {
      let temp = studentDetailsOptions.map((obj) => {
        return obj.student_id.toString() === name
          ? { ...obj, isChecked: checked }
          : obj;
      });
      setStudentDetailsOptions(temp);
      const newTemp = [];
      temp.map((obj) => {
        if (obj.isChecked === true) {
          newTemp.push(obj.student_id);
        }
      });
      setValues({
        ...values,
        studentId: newTemp,
      });
    } else if (name !== "selectAll" && checked === false) {
      let temp = studentDetailsOptions.map((obj) => {
        return obj.student_id.toString() === name
          ? { ...obj, isChecked: checked }
          : obj;
      });
      setStudentDetailsOptions(temp);

      const existData = [];

      values.studentId.map((obj) => {
        existData.push(obj);
      });

      const index = existData.indexOf(e.target.value);

      if (index === -1) {
        existData.splice(index, 1);
      }

      setValues({
        ...values,
        studentId: existData,
      });
    }
  };

  const handleRemarks = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeAdvance = async (name, newValue) => {
    if (name === "programSpeId") {
      await axios
        .get(
          `/api/academic/fetchProgramWithSpecialization/${values.acYearId}/${values.schoolId}`
        )
        .then((res) => {
          setProgramId(
            res.data.data
              .filter((val) => val.program_specialization_id === newValue)
              .map((obj) => {
                return obj.program_id;
              })
          );
        })
        .catch((err) => console.error(err));
      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };

  const requiredFieldsValid = () => {
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (Object.keys(checks).includes(field)) {
        const ch = checks[field];
        for (let j = 0; j < ch.length; j++) if (!ch[j]) return false;
      } else if (!values[field]) return false;
    }
    return true;
  };

  const handleCreate = async (e) => {
    const temp = {};
    temp.active = true;
    temp.ac_year_id = values.acYearId;
    temp.school_id = values.schoolId;
    temp.program_id = programId.toString();
    temp.program_specialization_id = values.programSpeId;
    temp.current_year_sem = values.yearsemId;
    temp.section_id = values.sectionId;
    temp.remarks = values.remarks;
    temp.student_ids = values.studentId.toString();

    await axios
      .post(`/api/academic/SectionAssignment`, temp)
      .then((res) => {
        setLoading(false);
        if (res.status === 200 || res.status === 201) {
          navigate("/SectionMaster/Assign", { replace: true });
          setAlertMessage({
            severity: "success",
            message: "Section Assignment Created",
          });
        } else {
          setAlertMessage({
            severity: "error",
            message: res.data ? res.data.message : "Error Occured",
          });
        }
        setAlertOpen(true);
      })
      .catch((error) => {
        setLoading(false);
        setAlertMessage({
          severity: "error",
          message: error.response ? error.response.data.message : "Error",
        });
        setAlertOpen(true);
      });
  };

  const handleUpdate = async (e) => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill required fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);
      const temp = {};
      temp.active = true;
      temp.section_assignment_id = sectionAssignmentId;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_id = values.programIdForUpdate;
      temp.program_specialization_id = values.programSpeId;
      temp.current_year_sem = values.yearsemId;
      temp.section_id = values.sectionId;
      temp.remarks = values.remarks;
      temp.student_ids = values.studentId.toString();

      await axios
        .put(`/api/academic/SectionAssignment/${id}`, temp)
        .then((res) => {
          setLoading(false);
          if (res.status === 200 || res.status === 201) {
            setAlertMessage({
              severity: "success",
              message: "Section Assignment Updated",
            });
            navigate("/SectionMaster/Assign", { replace: true });
          } else {
            setAlertMessage({
              severity: "error",
              message: res.data ? res.data.message : "Error Occured",
            });
          }
          setAlertOpen(true);
        })
        .catch((error) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: error.response.data.message,
          });
        });
    }
  };

  return (
    <Box component="form" overflow="hidden" p={1}>
      <FormWrapper>
        <Grid
          container
          alignItems="center"
          justifyContent="flex-start"
          rowSpacing={2}
          columnSpacing={{ xs: 2, md: 4 }}
        >
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="acYearId"
              label="Academic Year"
              value={values.acYearId}
              options={academicYearOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="schoolId"
              label="School"
              value={values.schoolId}
              options={schoolOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="programSpeId"
              label="Program Major"
              value={values.programSpeId}
              options={programSpeOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="yearsemId"
              label="Year/Sem"
              value={values.yearsemId}
              options={yearSemOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="sectionId"
              label="Section"
              value={values.sectionId}
              options={sectionOptions}
              handleChangeAdvance={handleChangeAdvance}
              disabled={!isNew}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomTextField
              multiline
              rows={2}
              name="remarks"
              label="Remarks"
              value={values.remarks}
              handleChange={handleRemarks}
              disabled={!isNew}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table size="small" className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {isNew ? (
                        <Checkbox
                          {...label}
                          name="selectAll"
                          checked={
                            !studentDetailsOptions.some(
                              (user) => user?.isChecked !== true
                            )
                          }
                          onChange={handleChange}
                        />
                      ) : (
                        ""
                      )}
                      {isNew ? "Select All" : ""}
                    </TableCell>
                    <TableCell>SL.No</TableCell>
                    <TableCell>AUID</TableCell>
                    <TableCell>USN</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentDetailsOptions.map((obj, i) => {
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <Checkbox
                            {...label}
                            name={obj.student_id}
                            value={obj.studentId}
                            onChange={handleChange}
                            checked={obj?.isChecked || obj?.section_id}
                          />
                        </TableCell>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{obj.auid}</TableCell>
                        <TableCell>{obj.usn}</TableCell>
                        <TableCell>{obj.student_name}</TableCell>
                        <TableCell>
                          {obj.eligible_reported_status === null
                            ? "No status"
                            : obj.eligible_reported_status}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        <Grid container justifyContent="flex-start" textAlign="left">
          <Grid item xs={12} md={2} mt={2}>
            <Button
              style={{ borderRadius: 7 }}
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={isNew ? handleCreate : handleUpdate}
            >
              {loading ? (
                <CircularProgress
                  size={25}
                  color="blue"
                  style={{ margin: "2px 13px" }}
                />
              ) : (
                <strong>{isNew ? "Create" : "Update"}</strong>
              )}
            </Button>
          </Grid>
        </Grid>
      </FormWrapper>
    </Box>
  );
}

export default SectionAssignmentForm;
