import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  PDFViewer,
  View,
  Font,
  Image,
} from "@react-pdf/renderer";
import RobotoBold from "../../../fonts/Roboto-Bold.ttf";
import RobotoItalic from "../../../fonts/Roboto-Italic.ttf";
import RobotoLight from "../../../fonts/Roboto-Light.ttf";
import RobotoRegular from "../../../fonts/Roboto-Regular.ttf";
import logo from "../../../assets/nini.png"; // Logo import
import { useLocation } from "react-router-dom";
import axios from "../../../services/Api";
import moment from "moment";
import numberToWords from "number-to-words";

// Register the fonts
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoBold, fontStyle: "bold", fontWeight: 700 },
    { src: RobotoItalic, fontStyle: "italic", fontWeight: 200 },
    { src: RobotoLight, fontStyle: "light", fontWeight: 300 },
    { src: RobotoRegular, fontStyle: "normal" },
  ],
});

// Create styles
const styles = StyleSheet.create({
  pageLayout: {
    margin: 20,
  },
  viewer: {
    width: "100%",
    height: "100vh", // Ensure the viewer fills the screen
  },
  page: {
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
    padding: 30,
  },
  logo: {
    position: "absolute",
    top: "60%", // Adjusted to center logo vertically
    left: "50%", // Horizontally center the logo
    transform: "translate(-50%, -50%)", // Centering fix
    width: "20%", // Set width of the logo
    height: "auto", // Keep aspect ratio
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Times-Roman",
  },

  page: {
    padding: 20,
  },
  tableWrapper: {
    margin: "0 auto",
  },
  table: {
    display: "table",
    width: "70%",
    marginTop: 25,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    padding: 5,
    borderWidth: 1,
    borderColor: "black",
    width: "30%",
    textAlign: "center",
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    fontSize: 12,
  },

  tableCell1: {
    padding: 5,
    borderWidth: 1,
    borderColor: "black",
    width: "70%",
    fontFamily: "Times-Roman",
    fontSize: 11,
  },

  label1: {
    width: "50%",
    textAlign: "right",
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    fontSize: 11,
  },
  label2: {
    width: "100%",
    textAlign: "center",
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 10,
  },
  label3: {
    width: "100%",
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    fontSize: 13,
    marginTop: 14,
  },
  label4: {
    width: "100%",
    textAlign: "right",
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 18,
  },
  label: {
    width: "100%",
    textAlign: "center",
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    fontSize: 11,
    marginTop: 4,
  },
});

// Helper Components
const TableHeaders = ({ receiptData }) => (
  <View style={styles.table}>
    {/* Row 1 */}
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text>Receipt No.</Text>
      </View>
      <View style={styles.tableCell1}>
        <Text>{receiptData?.cma_receipt_id}</Text>
      </View>
    </View>

    {/* Row 2 */}
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text>Receipt Date</Text>
      </View>
      <View style={styles.tableCell1}>
        <Text>{moment(receiptData?.created_date).format("DD-MM-YYYY")}</Text>
      </View>
    </View>

    {/* Row 3 */}
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text>AUID</Text>
      </View>
      <View style={styles.tableCell1}>
        <Text>{receiptData?.auid}</Text>
      </View>
    </View>

    {/* Row 4 */}
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text>Student Name</Text>
      </View>
      <View style={styles.tableCell1}>
        <Text>{receiptData?.student_name}</Text>
      </View>
    </View>

    {/* Row 5 */}
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text>College</Text>
      </View>
      <View style={styles.tableCell1}>
        <Text>{receiptData?.school_name}</Text>
      </View>
    </View>

    {/* Row 6 */}
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text>Course</Text>
      </View>
      <View style={styles.tableCell1}>
        <Text>{receiptData?.program_specialization_name}</Text>
      </View>
    </View>
  </View>
);

const NiniskillupPdf = () => {
  const [receiptData, setReceiptData] = useState([]);

  const location = useLocation();
  const state = location?.state?.res;

  useEffect(() => {
    getExamFeeReceipt();
  }, []);

  const getExamFeeReceipt = async () => {
    const response = await axios.get(
      `/api/finance/getCmaFeeReceiptByReceiptId/${state.cma_receipt_id}/${state.financial_year_id}/${state.student_id}`
    );

    setReceiptData(response.data.data[0]);
  };

  function toUpperCamelCaseWithSpaces(str) {
    return str
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }

  const MyDocument = () => (
    <View style={styles.pageLayout}>
      <Image src={logo} style={styles.logo} />
      <Text style={styles.title}>Nini Skill Up Pvt Ltd.</Text>
      <Text style={styles.label}>Achit Nagar,Soldevanahalli</Text>
      <Text style={styles.label}>Bangalore-560090</Text>
      <Text style={styles.label}>GSTIN:29AFNPA5533Q1ZV</Text>

      <Text style={styles.label2}>Fee Receipt</Text>

      {/* Render Table Header and Body */}
      <View style={styles.tableWrapper}>
        <TableHeaders receiptData={receiptData} />
      </View>

      <Text style={styles.label3}>
        Received with thanks Rs. {state?.total_amount} /- ({" "}
        {numberToWords.toWords(state?.total_amount)} ) towards Books & Uniform{" "}
      </Text>
      {/* <Text style={styles.label4}>Maruthi Business Associates</Text> */}
    </View>
  );

  return (
    <PDFViewer style={styles.viewer}>
      <Document title="Nini Skill Up">
        <Page size="A4">
          <MyDocument />
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default NiniskillupPdf;
