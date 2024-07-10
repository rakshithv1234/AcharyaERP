import React, { useEffect, useState } from "react";
import { Button, Box, CircularProgress } from "@mui/material";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import { useLocation } from "react-router-dom";
import { Grid, Typography } from "@mui/material";
import ModalWrapper from "../../../components/ModalWrapper";
import { StudentIdCardPrint } from "./StudentIdCardPrint";
import { GenerateIdCard } from "./GenerateIdCard";
import { makeStyles } from "@mui/styles";
import JsBarcode from "jsbarcode";
import axios from "../../../services/Api";
import useAlert from "../../../hooks/useAlert";
import PrintIcon from "@mui/icons-material/Print";
import templateList from "./SchoolImages";

const idCardImageStyles = makeStyles((theme) => ({
  idCardimage: {
    height: "370px",
    width: "220px",
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
  },
  userImage: {
    top: "37px",
    left: "20px",
    width: "80px",
    height: "95px",
    position: "absolute",
  },
  userName: {
    top: "135px",
    position: "absolute",
    width: "200px",
    marginHorizontal: "auto",
    left: "8px",
    color: "#000",
    fontFamily: "Roboto",
    fontSize: "12px !important",
    fontWeight: "600 !important",
    textTransform: "uppercase",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  studentDetail: {
    position: "absolute",
    width: "200px",
    marginHorizontal: "auto",
    left: "5px",
    fontSize: "10px !important",
    fontWeight: "500 !important",
    color: "#000",
    fontFamily: "Roboto",
    textTransform: "uppercase",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  studentUsn: {
    position: "absolute",
    width: "200px",
    marginHorizontal: "auto",
    left: "5px",
    fontSize: "11px !important",
    fontWeight: "600 !important",
    color: "#000",
    fontFamily: "Roboto",
    textTransform: "uppercase",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  studentValidTillDateMain: {
    position: "absolute",
    width: "200px",
    marginHorizontal: "auto",
    left: "12px",
    fontSize: "11px !important",
    fontWeight: "600 !important",
    color: "#000",
    fontFamily: "Roboto",
    textTransform: "uppercase",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  studentValidTillDate: {
    left: "10px",
    fontSize: "10px !important",
    fontWeight: "500 !important",
    color: "#000",
    fontFamily: "Roboto",
    textTransform: "uppercase",
  },
}));

const initialState = {
  studentList: [],
  schoolId: null,
  loading: false,
  isIdCardModalOpen: false,
  IdCardPdfPath: null,
};

const getTemplate = (schoolId) => {
  return templateList.find((obj) => obj.schoolId === schoolId)?.src;
};

const ViewStaffIdCard = () => {
  const [state, setState] = useState(initialState);
  const setCrumbs = useBreadcrumbs();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const IdCard = idCardImageStyles();
  const { setAlertMessage, setAlertOpen } = useAlert();

  useEffect(() => {
    setCrumbs([
      { name: "Student ID Card", link: "/StudentIdCard" },
      { name: "View" },
    ]);
    setState((prevState) => ({
      ...prevState,
      studentList: location?.state,
    }));
  }, []);

  const generateBarcodeDataUrl = (value) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, {
      format: "CODE128",
      width: 0.9,
      height: 30,
      displayValue: false,
    });
    return canvas.toDataURL("image/png");
  };

  const setLoading = (val) => {
    setState((prevState) => ({
      ...prevState,
      loading: val,
    }));
  };

  const handlePrintModal = () => {
    setState((prevState) => ({
      ...prevState,
      isIdCardModalOpen: !state.isIdCardModalOpen,
      IdCardPdfPath: "",
    }));
  };

  const printIdCard = async () => {
    setLoading(true);
    let updatedStudentList = [];
    for (const student of state.studentList) {
      try {
        if (!!student?.studentImagePath) {
          const studentImageResponse = await axios.get(
            `/api/student/studentImageDownload?student_image_attachment_path=${student.studentImagePath}`,
            { responseType: "blob" }
          );
          if (!!studentImageResponse) {
            updatedStudentList.push({
              ...student,
              studentImagePath: URL.createObjectURL(studentImageResponse?.data),
            });
          }
          if (!!updatedStudentList.length) {
            generateStudentIdCard(updatedStudentList);
          }
        }
        setLoading(false);
      } catch (error) {
        setAlertMessage({
          severity: "error",
          message: error.response ? error.response.data.message : "Error",
        });
        setAlertOpen(true);
        setLoading(false);
      }
    }
  };

  const chunkArrayInGroups = (arr, size) => {
    var myArray = [];
    for (var i = 0; i < arr.length; i += size) {
      myArray.push(arr.slice(i, i + size));
    }
    return myArray;
  };

  const generateStudentIdCard = async (updatedStudentList) => {
    const chunksArr = chunkArrayInGroups(updatedStudentList, 9);
    const idCardResponse = await GenerateIdCard(chunksArr);
    if (!!idCardResponse) {
      setState((prevState) => ({
        ...prevState,
        IdCardPdfPath: URL.createObjectURL(idCardResponse),
        isIdCardModalOpen: !state.isIdCardModalOpen,
      }));
      if (searchParams.get("tabId") == 1) removeStudentAfterPrintIDCard();
    }
  };

  const removeStudentAfterPrintIDCard = async () => {
    let empForRemove = state.studentList.map((el) => ({
      studentId: el.studentId,
      validTill: el.validTillDate,
      currentYear: el.currentSem,
      active: true,
    }));
    try {
      await axios.post(
        `/api/student/studentIdCardCreationWithHistory`,
        empForRemove
      );
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: error.response ? error.response.data.message : "Error",
      });
      setAlertOpen(true);
    }
  };

  return (
    <>
      <Box component="form" overflow="hidden" p={1}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <Button
            variant="contained"
            disableElevation
            disabled={!state.studentList.length}
            onClick={printIdCard}
          >
            {!!state.loading ? (
              <CircularProgress
                size={15}
                color="inherit"
                style={{ margin: "5px" }}
              />
            ) : (
              <PrintIcon />
            )}
            &nbsp;&nbsp; Print
          </Button>
        </div>
        {!!state.studentList.length && (
          <Grid container rowSpacing={4} columnSpacing={{ xs: 2, md: 3 }}>
            {state.studentList?.map((obj, i) => {
              return (
                <Grid item sm={12} md={3} key={i}>
                  <div style={{ position: "relative" }}>
                    {!!obj.schoolId && (
                      <img
                        src={getTemplate(obj.schoolId)}
                        className={IdCard.idCardimage}
                      />
                    )}
                    <img
                      src={obj.studentBlobImagePath}
                      className={IdCard.userImage}
                    />
                    <Typography className={IdCard.userName}>
                      {obj.studentName}
                    </Typography>

                    <Typography
                      className={IdCard.studentDetail}
                      style={
                        obj.studentName?.length > 25
                          ? { marginTop: "17px", top: "152px" }
                          : { marginTop: "0x", top: "152px" }
                      }
                    >
                      {obj.currentYear === 1
                        ? "I YEAR"
                        : obj.currentYear === 2
                        ? "II YEAR"
                        : obj.currentYear === 3
                        ? "III YEAR"
                        : obj.currentYear === 4
                        ? "IV YEAR"
                        : ""}
                    </Typography>
                    <Typography
                      className={IdCard.studentDetail}
                      style={
                        obj.studentName?.length > 25
                          ? { marginTop: "15px", top: "168px" }
                          : { marginTop: "0px", top: "168px" }
                      }
                    >
                      {obj.programWithSpecialization}
                    </Typography>
                    <Typography
                      className={IdCard.studentDetail}
                      style={
                        obj.studentName?.length > 25
                          ? { marginTop: "15px", top: "184px" }
                          : { marginTop: "0px", top: "184px" }
                      }
                    >
                      {obj.auid}
                    </Typography>
                    <Typography
                      className={IdCard.studentUsn}
                      style={
                        obj.studentName?.length > 25
                          ? { marginTop: "15px", top: "200px" }
                          : { marginTop: "0px", top: "200px" }
                      }
                    >
                      {obj.auid}
                    </Typography>
                    <div
                      style={{
                        position: "absolute",
                        top: "212px",
                        left: "30px",
                      }}
                    >
                      <img src={generateBarcodeDataUrl(obj.auid)} />
                    </div>
                    <div
                      className={IdCard.studentValidTillDateMain}
                      style={
                        obj.studentName?.length > 25
                          ? { marginTop: "15px", top: "258px" }
                          : { marginTop: "0px", top: "258px" }
                      }
                    >
                      <Typography className={IdCard.studentValidTillDate}>
                        Valid Till :
                      </Typography>
                      &nbsp; &nbsp;
                      <Typography className={IdCard.studentValidTillDate}>
                        {obj.validTillDate}
                      </Typography>
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        )}

        {!!state.isIdCardModalOpen && (
          <ModalWrapper
            title="Student ID Card"
            maxWidth={800}
            open={state.isIdCardModalOpen}
            setOpen={() => handlePrintModal()}
          >
            <StudentIdCardPrint
              state={state}
              handlePrintModal={handlePrintModal}
            />
          </ModalWrapper>
        )}
      </Box>
    </>
  );
};

export default ViewStaffIdCard;