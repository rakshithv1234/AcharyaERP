import { useState, useEffect } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";
import axios from "../services/Api";
import { useParams } from "react-router-dom";
import acharyaLogo from "../assets/acharyaLogo.png";
import studentLogo from "../assets/studentLogo.png";
import { convertToDMY } from "../utils/DateTimeUtils";
import moment from "moment";
import useBreadcrumbs from "../hooks/useBreadcrumbs";

function StudentDocumentCollectionPdf() {
  const [studentDetails, setStudentDetails] = useState({});
  const [transcriptData, setTranscriptData] = useState([]);

  const [photo, setPhoto] = useState(null);
  const { id } = useParams();
  const setCrumbs = useBreadcrumbs();

  useEffect(() => {
    getData();
    setCrumbs([
      { name: "Student Master", link: "/student-master" },
      { name: "Transcript" },
    ]);
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get(
        `/api/student/getDataForTestimonials/${id}`
      );

      setStudentDetails(response.data.data.Student_details);

      setTranscriptData(
        response.data.data.Student_Transcript_Details.filter(
          (obj) => obj.not_applicable !== "YES"
        )
      );

      const studentImageResponse = await axios.get(
        `/api/student/studentImageDownload?student_image_attachment_path=${response.data.data.Student_details.student_image_path}`,
        { responseType: "blob" }
      );

      if (
        studentImageResponse.status === 200 ||
        studentImageResponse.status === 201
      ) {
        setPhoto(URL.createObjectURL(studentImageResponse.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const styles = StyleSheet.create({
    viewer: {
      width: window.innerWidth - 100,
      height: window.innerHeight,
    },
    pageLayout: { margin: 25 },

    header: {
      fontSize: "10px",
      fontWeight: "bold",
      padding: "3px",
      textAlign: "center",
      marginBottom: "10px",
      fontFamily: "Times-Roman",
      borderBottom: "1px solid black",
    },

    logoHeaderStyle: {
      flexDirection: "row",
      backgroundColor: "#182778",
      color: "white",
      padding: "5px",
      marginBottom: "10px",
    },

    img: {
      width: "50px",
      marginVertical: 0,
      marginHorizontal: 0,
    },

    tableRowStyle: {
      flexDirection: "row",
    },

    thStyle: {
      fontSize: "10px",
      fontWeight: "bold",
      width: "15%",
      fontFamily: "Times-Roman",
      color: "#000000",
      padding: "2px",
    },

    tdStyle: {
      fontSize: "10px",
      width: "35%",
      fontWeight: "600",
      textTransform: "capitalize",
      padding: "4px",
      fontFamily: "Times-Roman",
    },

    studentTableStyle: { marginBottom: "10px" },

    transcripttableStyle: {
      display: "table",
      width: "auto",
      marginBottom: "75px",
    },

    transcriptThHeaderStyle: {
      width: "25%",
      backgroundColor: "#182778",
      color: "white",
    },

    transcriptThStyle: {
      textAlign: "center",
      padding: "5px",
      fontFamily: "Times-Roman",
      fontSize: "10px",
      fontWeight: "bold",
    },

    transcriptTdHeaderStyle1: {
      width: "25%",
      borderWidth: 1,
      borderTopWidth: 0,
    },

    transcriptTdHeaderStyle: {
      width: "25%",
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
    },

    transcriptTdStyle: {
      textAlign: "center",
      padding: "5px",
      fontFamily: "Times-Roman",
      fontSize: "10px",
      fontWeight: "bold",
    },

    studentSignatureStyle: {
      fontSize: "10px",
      fontFamily: "Times-Roman",
      width: "50%",
      marginBottom: "10px",
    },

    collectorSignatureStyle: {
      fontSize: "10px",
      fontFamily: "Times-Roman",
      width: "50%",
      textAlign: "right",
    },

    studentTableSection: {
      marginTop: "20px",
      marginBottom: "20px",
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    studentDetailTableSection: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    table: {
      display: "table",
      width: "100%",
      // borderWidth: 1,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableColLabel: {
      display: "flex",
      flex: 3,
      padding: "8px",
      // borderWidth: 1,
    },
    tableCol: {
      display: "flex",
      flex: 4,
      padding: "8px",
      wordWrap: "break-all",
      // borderWidth: 1,
    },
    tableCellLabel: {
      fontSize: 10,
      textAlign: "left",
      fontFamily: "Times-Roman",
    },
    tableCell: {
      fontSize: 10,
      fontFamily: "Times-Roman",
      wordWrap: "break-word",
      textAlign: "left",
      paddingLeft: "6px",
    },

    noDataContainer: {
      border: "1px solid #dddddd",
      justifyContent: "center",
      alignItems: "center",
      height: 60, // Adjust height as needed for vertical centering
      width: "100%",
    },
    noDataText: {
      fontSize: 14,
      color: "grey",
      textAlign: "center",
    },
  });

  const logoHeader = () => {
    return (
      <>
        <View style={{ width: "10%" }}>
          <Image src={acharyaLogo} style={styles.img} />
        </View>
        <View
          style={{
            width: "80%",
            textAlign: "center",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              lineHeight: "1.5",
              fontFamily: "Times-Roman",
            }}
          >
            ACHARYA INSTITUTES
          </Text>
          <Text
            style={{
              fontSize: "10px",
              lineHeight: "1.5",
              fontFamily: "Times-Roman",
            }}
          >
            Acharya Dr.Sarvepalli Radha krishna road, Bangalore - 560107,India.
          </Text>
          <Text
            style={{
              fontSize: "10px",
              lineHeight: "1.5",
              fontFamily: "Times-Roman",
            }}
          >
            Document Collection
          </Text>
        </View>
        <View
          style={{
            width: "10%",
            textAlign: "right",
          }}
        >
          <Image
            src={photo ? photo : studentLogo}
            style={{ width: "50px", borderRadius: "60%" }}
          />
        </View>
      </>
    );
  };

  const studentTable = () => {
    return (
      <>
        <View style={styles.tableRowStyle}>
          <Text style={styles.thStyle}>Name</Text>
          <Text style={styles.tdStyle}>{studentDetails.candidate_name} </Text>

          <Text style={styles.thStyle}>Visitor Id</Text>
          <Text style={styles.tdStyle}>{studentDetails.visitor_id}</Text>
        </View>

        <View style={styles.tableRowStyle}>
          <Text style={styles.thStyle}>Date of visit</Text>
          <Text style={styles.tdStyle}>{studentDetails.date_of_visit}</Text>

          <Text style={styles.thStyle}>Mobile</Text>
          <Text style={styles.tdStyle}>{studentDetails.mobile}</Text>
        </View>

        <View style={styles.tableRowStyle}>
          <Text style={styles.thStyle}>AUID</Text>
          <Text style={styles.tdStyle}>{studentDetails.auid}</Text>

          <Text style={styles.thStyle}>USN</Text>
          <Text style={styles.tdStyle}>{studentDetails.usn}</Text>
        </View>

        <View style={styles.tableRowStyle}>
          <Text style={styles.thStyle}>AC Year</Text>
          <Text style={styles.tdStyle}>{studentDetails.ac_year} </Text>

          <Text style={styles.thStyle}>School</Text>
          <Text style={styles.tdStyle}>{studentDetails.school_name_short}</Text>
        </View>

        <View style={styles.tableRowStyle}>
          <Text style={styles.thStyle}>Program</Text>
          <Text style={styles.tdStyle}>
            {studentDetails.program_short_name}
          </Text>

          <Text style={styles.thStyle}>Specilization</Text>
          <Text style={styles.tdStyle}>
            {studentDetails.program_specialization_short_name}
          </Text>
        </View>

        <View style={styles.tableRowStyle}>
          <Text style={styles.thStyle}>Category</Text>
          <Text style={styles.tdStyle}>
            {studentDetails.fee_admission_category_type}
          </Text>

          <Text style={styles.thStyle}>Fee Template</Text>
          <Text style={styles.tdStyle}>{studentDetails.fee_template_name}</Text>
        </View>
      </>
    );
  };

  const transcriptTableHeader = () => {
    return (
      <>
        <View style={styles.tableRowStyle} fixed>
          <View style={styles.transcriptThHeaderStyle}>
            <Text style={styles.transcriptThStyle}>Transcript</Text>
          </View>

          <View style={styles.transcriptThHeaderStyle}>
            <Text style={styles.transcriptThStyle}> Submit By</Text>
          </View>
          <View style={styles.transcriptThHeaderStyle}>
            <Text style={styles.transcriptThStyle}>Collected</Text>
          </View>

          <View style={styles.transcriptThHeaderStyle}>
            <Text style={styles.transcriptThStyle}>User</Text>
          </View>
          <View style={styles.transcriptThHeaderStyle}>
            <Text style={styles.transcriptThStyle}>Collected Date</Text>
          </View>
          {/* <View style={styles.transcriptThHeaderStyle}>
            <Text style={styles.transcriptThStyle}>Collected By Institute</Text>
          </View> */}
        </View>
      </>
    );
  };

  const transcriptTableBody = () => {
    return (
      <>
        {transcriptData.length > 0 ? (
          transcriptData.map((obj, i) => (
            <View key={i} style={styles.tableRowStyle}>
              <View style={styles.transcriptTdHeaderStyle1}>
                <Text style={styles.transcriptTdStyle}>{obj.transcript}</Text>
              </View>
              <View style={styles.transcriptTdHeaderStyle}>
                <Text style={styles.transcriptTdStyle}>
                  {obj.will_submit_by
                    ? `${convertToDMY(obj.will_submit_by.slice(0, 10))}`
                    : ""}
                </Text>
              </View>
              <View style={styles.transcriptTdHeaderStyle}>
                <Text style={styles.transcriptTdStyle}>
                  {obj.will_submit_by ? "No" : "Yes"}
                </Text>
              </View>

              <View style={styles.transcriptTdHeaderStyle}>
                <Text style={styles.transcriptTdStyle}>
                  {obj.created_username}
                </Text>
              </View>
              <View style={styles.transcriptTdHeaderStyle}>
                <Text style={styles.transcriptTdStyle}>
                  {obj.submitted_date}
                </Text>
              </View>
            </View>
          ))
        ) : (
          // Centered "No data found" message
          <View style={[styles.tableRowStyle, styles.noDataContainer]}>
            <Text style={styles.noDataText}>No Transcript Data!! </Text>
          </View>
        )}
      </>
    );
  };

  const handleSignature = () => {
    return (
      <>
        <View style={styles.tableRowStyle}>
          <Text style={styles.studentSignatureStyle}>
            Signature of the student
          </Text>
          <Text style={styles.collectorSignatureStyle}>
            Signature of the document collector
          </Text>
        </View>

        <View style={styles.tableRowStyle}>
          <Text style={styles.studentSignatureStyle}>Date : </Text>
          <Text style={styles.collectorSignatureStyle}>Place : Bangalore</Text>
        </View>
      </>
    );
  };
  return (
    <>
      <PDFViewer style={styles.viewer}>
        <Document title="Document Collection">
          <Page size="A4">
            <View style={styles.pageLayout}>
              <View style={styles.logoHeaderStyle}>{logoHeader()}</View>
              {/* <View style={styles.studentTableStyle}>{studentTable()}</View> */}
              <View style={styles.studentTableSection}>
                <View
                  style={{
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: "10px",
                      fontFamily: "Times-Roman",
                      padding: "8px",
                      backgroundColor: "#182778",
                    }}
                  >
                    <Text style={{ color: "white" }}>Student Details</Text>
                  </Text>
                  <View style={styles.studentDetailTableSection}>
                    <View style={styles.table}>
                      <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}>
                          <Text style={styles.tableCellLabel}>AUID</Text>
                        </View>

                        <View style={styles.tableCol}>
                          <Text
                            style={{
                              ...styles.tableCell,
                            }}
                          >
                            {studentDetails?.auid || "-"}
                          </Text>
                        </View>
                        <View style={styles.tableColLabel}>
                          <Text style={styles.tableCellLabel}>
                            Student Name
                          </Text>
                        </View>

                        <View style={styles.tableCol}>
                          <Text
                            style={{
                              ...styles.tableCell,
                            }}
                          >
                            {studentDetails?.student_name?.toUpperCase() || "-"}
                          </Text>
                        </View>
                      </View>

                      {/* new */}

                      <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}>
                          <Text style={styles.tableCellLabel}>Gender</Text>
                        </View>

                        <View style={styles.tableCol}>
                          <Text
                            style={{
                              ...styles.tableCell,
                            }}
                          >
                            {studentDetails?.candidate_sex || "-"}
                          </Text>
                        </View>
                        <View style={styles.tableColLabel}>
                          <Text style={styles.tableCellLabel}>Father Name</Text>
                        </View>

                        <View style={styles.tableCol}>
                          <Text
                            style={{
                              ...styles.tableCell,
                            }}
                          >
                            {studentDetails?.father_name?.toUpperCase() || "-"}
                          </Text>
                        </View>
                      </View>

                      {/* new */}

                      <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}>
                          <Text style={styles.tableCellLabel}>DOA</Text>
                        </View>

                        <View style={styles.tableCol}>
                          <Text
                            style={{
                              ...styles.tableCell,
                            }}
                          >
                            {moment(studentDetails?.date_of_admission).format(
                              "DD-MM-YYYY"
                            ) || "-"}
                          </Text>
                        </View>
                        <View style={styles.tableColLabel}>
                          <Text style={styles.tableCellLabel}>Program</Text>
                        </View>

                        <View style={styles.tableCol}>
                          <Text
                            style={{
                              ...styles.tableCell,
                            }}
                          >{`${studentDetails?.program_short_name?.toUpperCase()} - ${studentDetails?.program_specialization_short_name?.toUpperCase()}`}</Text>
                        </View>
                      </View>

                      {/* new */}

                      <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}>
                          <Text style={styles.tableCellLabel}>Ac Year</Text>
                        </View>

                        <View style={styles.tableCol}>
                          <Text
                            style={{
                              ...styles.tableCell,
                            }}
                          >
                            {studentDetails?.ac_year}
                          </Text>
                        </View>
                        <View style={styles.tableColLabel}>
                          <Text style={styles.tableCellLabel}>
                            Admission Category
                          </Text>
                        </View>

                        <View style={styles.tableCol}>
                          <Text
                            style={{
                              ...styles.tableCell,
                            }}
                          >{`${studentDetails?.fee_admission_category_type}`}</Text>
                        </View>
                      </View>

                      {/* new */}
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.transcripttableStyle}>
                {transcriptTableHeader()}
                {transcriptTableBody()}
              </View>
              <View>{handleSignature()}</View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </>
  );
}

export default StudentDocumentCollectionPdf;
