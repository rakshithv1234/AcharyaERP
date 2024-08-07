import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Button,
  Typography,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  styled,
  tableCellClasses,
} from "@mui/material";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import axios from "../../../services/Api";
import useAlert from "../../../hooks/useAlert";
import { makeStyles } from "@mui/styles";
import FormPaperWrapper from "../../../components/FormPaperWrapper";
import CustomRadioButtons from "../../../components/Inputs/CustomRadioButtons";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";
import CustomModal from "../../../components/CustomModal";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import CustomSelect from "../../../components/Inputs/CustomSelect";

const label = { inputprops: { "aria-label": "Checkbox demo" } };

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "grey",
    color: theme.palette.headerWhite.main,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const initialValues = {
  auid: "",
  receivedIn: "",
  transactionType: "",
  receivedAmount: "",
  transactionAmount: "",
  narration: "",
  ddChequeNo: "",
  ddAmount: "",
  bankName: "",
  ddDate: null,
  bankImportedId: "",
  transactionDate: null,
  transactionNo: "",
  bankId: null,
  fromName: "",
  checkAuid: "",
};

const initialValuesOne = {
  voucherId: null,
  payingAmount: 0,
};

const requiredFields = ["transactionType", "receivedIn", "receivedAmount"];

const useStyles = makeStyles((theme) => ({
  bg: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.headerWhite.main,
    textAlign: "center",
    padding: "5px",
    borderRadius: "2px",
  },
  yearSem: {
    color: theme.palette.error.main,
    border: "1px solid rgba(0, 0, 0, 1)",
    padding: "2px",
    borderRadius: "2px",
  },

  table: {
    minWidth: 650,
    "& .MuiTableCell-root": {
      border: "1px solid rgba(224, 224, 224, 1)",
    },
  },
}));

function BulkFeeReceipt() {
  const [values, setValues] = useState(initialValues);
  const [studentData, setStudentData] = useState([]);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([
    initialValuesOne,
    initialValuesOne,
    initialValuesOne,
    initialValuesOne,
  ]);
  const [total, setTotal] = useState();

  const [bankImportedData, setBankImportedData] = useState([]);
  const [bankImportedDataById, setBankImportedDataById] = useState();
  const [openBankImportedData, setOpenBankImportedData] = useState(false);
  const [openBankImportedDataById, setOpenBankImportedDataById] =
    useState(false);
  const [bankName, setBankName] = useState("");
  const [receiptDetails, setReceiptDetails] = useState([]);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [unAssigned, setUnAssigned] = useState([]);

  const [openSavedData, setOpenSavedData] = useState(false);
  const [checked, setChecked] = useState(false);
  const [auidOpen, setAuidOpen] = useState(false);
  const [voucherHeadOptions, setVoucherHeadOptions] = useState([]);

  const navigate = useNavigate();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const classes = useStyles();

  useEffect(() => {
    getVoucherHeadData();
    let count = 0;
    const val = data.reduce((a, b) => {
      return Number(a) + Number(b.payingAmount);
    }, 0);
    count = count + Number(val);
    setTotal(count);
  }, [data]);

  useEffect(() => {
    if (total > values.receivedAmount) {
      setAlertMessage({
        severity: "error",
        message: "Total amount cannot be greater than received amount",
      });
      setAlertOpen(true);
    } else {
      setAlertOpen(false);
    }
  }, [total, values.receivedAmount]);

  useEffect(() => {
    handleViewBankImportDataById();
    getDetailsofReceipt();
  }, [values.bankImportedId]);

  const checks = {};

  const getVoucherHeadData = async () => {
    await axios
      .get(`/api/finance/fetchInFlowVoucherHeadIds/${1}`)
      .then((res) => {
        setVoucherHeadOptions(
          res.data.data.map((obj) => ({
            value: obj.voucher_head_new_id,
            label: obj.voucher_head,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const handleViewBankImportData = async () => {
    await axios
      .get(
        `/api/student/bankImportTransactionDetailsOnAmount/${values.transactionAmount}`
      )
      .then((res) => {
        if (res.data.data.length > 0) {
          setOpenBankImportedData(true);
          setBankImportedData(res.data.data);
        } else {
          setAlertMessage({
            severity: "error",
            message: "No records found for this amount...!",
          });
          setAlertOpen(true);
          setOpenBankImportedData(false);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleViewBankImportDataById = async () => {
    if (values.bankImportedId)
      await axios
        .get(`/api/student/bankImportTransaction/${values.bankImportedId}`)
        .then((resOne) => {
          if (resOne.data.data) {
            setBankImportedDataById(resOne.data.data);
            setOpenBankImportedData(false);
            setOpenBankImportedDataById(true);
            axios
              .get(`/api/finance/Bank`)
              .then((res) => {
                res.data.data.filter((obj) => {
                  if (obj.bank_id === resOne.data.data.deposited_bank_id) {
                    setBankName(obj.bank_name);
                  }
                });
              })
              .catch((err) => console.error(err));
          }
        })
        .catch((err) => console.error(err));
  };

  const getDetailsofReceipt = async () => {
    if (values.bankImportedId)
      await axios
        .get(`/api/finance/allRTGSFeeHistoryDetails/${values.bankImportedId}`)
        .then((res) => {
          setReceiptDetails(res.data.data);
        })
        .catch((err) => console.error(err));
  };

  const handleChange = async (e) => {
    if (e.target.name === "auid") {
      setValues({
        ...values,
        [e.target.name]: e.target.value,
      });
      await axios
        .get(`/api/student/studentDetailsByAuid/${e.target.value}`)
        .then((res) => {
          if (res.data.data.length > 0) {
            const years = [];
            const yearsValue = {};
            const showTable = {};
            setStudentData(res.data.data[0]);
            if (res.data.data[0].program_type_name.toLowerCase() === "yearly") {
              for (let i = 1; i <= res.data.data[0].number_of_years; i++) {
                years.push({ key: i, label: "Year" + i });
                yearsValue["year" + i] = 0;
                showTable[i] = true;
              }
            } else if (
              res.data.data[0].program_type_name.toLowerCase() === "semester"
            ) {
              for (let i = 1; i <= res.data.data[0].number_of_semester; i++) {
                years.push({ key: i, label: "Sem" + i });
                yearsValue["year" + i] = 0;
                showTable[i] = true;
              }
            }
          } else {
            setOpen(false);
          }
        })
        .catch((err) => console.error(err));
    } else if (
      e.target.name === "transactionType" &&
      values.receivedIn === ""
    ) {
      setAlertMessage({
        severity: "error",
        message: "Please Select Received In",
      });
      setAlertOpen(true);
    } else if (e.target.name === "check") {
      setChecked(e.target.checked);
    } else {
      setValues({
        ...values,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSave = async () => {
    if (Number(values.payingAmount) > Number(values.transactionAmount)) {
      setAlertMessage({
        severity: "error",
        message: "Paying Amount cannot be greater than transaction amount..!",
      });
      setAlertOpen(true);
    } else if (
      bankImportedDataById.balance === null ||
      values.payingAmount <= bankImportedDataById.balance
    ) {
      setModalOpen(true);
      const handleToggle = () => {
        setOpenSavedData(true);
        setOpenBankImportedDataById(false);
        setValues((prev) => ({
          ...prev,
          ["receivedAmount"]: values.payingAmount,
        }));
      };
      setModalContent({
        title: "",
        message: "Do you really want to save",
        buttons: [
          { name: "Yes", color: "primary", func: handleToggle },
          { name: "No", color: "primary", func: () => {} },
        ],
      });
    } else if (
      bankImportedDataById.balance !== null &&
      values.payingAmount > bankImportedDataById.balance
    ) {
      setAlertMessage({
        severity: "error",
        message: "Paying Amount cannot be greater than balance amount..!",
      });
      setAlertOpen(true);
    }
  };

  const handleChangeCheckbox = (e) => {
    const { name, checked } = e.target;

    if (name === "selectAll" && checked === true) {
      let tempUser = bankImportedData.map((test) => {
        return { ...test, isChecked: checked };
      });
      setBankImportedData(tempUser);

      setValues({
        ...values,
        bankImportedId: bankImportedData
          .map((obj) => obj.bank_import_transaction_id)
          .toString(),
      });
    } else if (name === "selectAll" && checked === false) {
      let tempUser = bankImportedData.map((test) => {
        return { ...test, isChecked: checked };
      });
      setBankImportedData(tempUser);

      setValues({
        ...values,
        bankImportedId: [],
      });
    } else if (name !== "selectAll" && checked === true) {
      const uncheckTemp = unAssigned;
      if (
        uncheckTemp.includes(e.target.value) === true &&
        uncheckTemp.indexOf(e.target.value) > -1
      ) {
        uncheckTemp.splice(uncheckTemp.indexOf(e.target.value), 1);
      }

      setUnAssigned(uncheckTemp);

      let temp = bankImportedData.map((obj) => {
        return obj.bank_import_transaction_id.toString() === name
          ? { ...obj, isChecked: checked }
          : obj;
      });
      setBankImportedData(temp);
      const newTemp = [];
      temp.forEach((obj) => {
        if (obj.isChecked === true) {
          newTemp.push(obj.bank_import_transaction_id);
        }
      });
      setValues({
        ...values,
        bankImportedId: newTemp.toString(),
      });
    } else if (name !== "selectAll" && checked === false) {
      const uncheckTemp = unAssigned;
      if (uncheckTemp.includes(e.target.value) === false) {
        uncheckTemp.push(e.target.value);
      }

      setUnAssigned(uncheckTemp);

      let temp = bankImportedData.map((obj) => {
        return obj.bank_import_transaction_id.toString() === name
          ? { ...obj, isChecked: checked }
          : obj;
      });

      setBankImportedData(temp);

      const existData = [];

      values.bankImportedId.split(",").forEach((obj) => {
        existData.push(obj);
      });

      const index = existData.indexOf(e.target.value);

      if (index > -1) {
        existData.splice(index, 1);
      }

      setValues({
        ...values,
        bankImportedId: existData.toString(),
      });
    }
  };

  const handleSelectAuid = (e) => {
    setChecked(e.target.checked);
  };

  const handleChangeAdvance = (name, newValue) => {
    const splitName = name.split("-");
    const index = parseInt(splitName[1]);
    const keyName = splitName[0];

    setData((prev) =>
      prev.map((obj, i) => {
        if (index === i) return { ...obj, [keyName]: newValue };
        return obj;
      })
    );
  };

  const handleClick = () => {
    if (checked === true) {
      setAuidOpen(true);
    } else if (checked === false) {
      setAuidOpen(false);
    }

    if (values.auid !== "") {
      setOpen(true);
    } else if (values.auid === "") {
      setOpen(false);
    }
  };

  const handleChangeOne = (e, index) => {
    setData((prev) =>
      prev.map((obj, i) => {
        if (index === i) return { ...obj, [e.target.name]: e.target.value };
        return obj;
      })
    );
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

  const handleCreate = async () => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill all required fields",
      });
      setAlertOpen(true);
    } else if (Number(values.receivedAmount) === total) {
      setLoading(true);
      const mainData = {};
      const tempOne = {};
      const tempTwo = {};
      const temp = {};
      const bit = {};

      mainData.active = true;
      mainData.student_id = studentData.student_id;
      mainData.transaction_type = values.transactionType;
      mainData.school_id = 1;
      mainData.receipt_id = studentData.student_id;
      mainData.received_in = values.receivedIn;
      mainData.from_name = values.fromName;
      mainData.amount = values.receivedAmount;
      mainData.remarks = values.narration;
      data.forEach((obj) => {
        if (obj.voucherId !== null) {
          temp[obj.voucherId] = obj.payingAmount;
        }
      });
      mainData.bank_transaction_history_id = values.bankImportedId;
      mainData.voucher_head_new_id = temp;
      tempOne.active = true;
      tempOne.auid = studentData.auid;
      tempOne.received_in = values.receivedIn;
      tempOne.received_type = "Bulk";
      tempOne.remarks = values.narration;
      tempOne.total_amount = total;
      tempOne.total_amount_som = total;
      tempOne.total_som = total;
      tempOne.total = total;
      tempOne.transaction_date = bankImportedDataById.transaction_date;
      tempOne.transaction_no = bankImportedDataById.transaction_no;
      tempOne.transaction_type = values.transactionType;
      tempOne.deposited_bank = bankName;
      tempTwo.bank_transaction_history_id = null;
      tempTwo.bulk_id = null;
      tempTwo.bus_fee_receipt_id = null;
      tempTwo.cancel_by = null;
      tempTwo.cancel_date = null;
      tempTwo.cancel_remarks = null;
      tempTwo.change_course_id = null;
      tempTwo.exam_id = null;
      tempTwo.fee_payment_id = null;
      tempTwo.fee_receipt = null;
      tempTwo.hostel_bulk_id = null;
      tempTwo.hostel_fee_payment_id = null;
      tempTwo.hostel_status = null;
      tempTwo.inr_value = null;
      tempTwo.student_id = studentData.student_id;
      tempTwo.paid_amount = null;
      tempTwo.print_status = null;
      tempTwo.receipt_type = "Bulk";
      tempTwo.received_in = values.receivedIn;
      tempTwo.remarks = values.narration;
      tempTwo.school_id = 1;
      tempTwo.transaction_type = values.transactionType;
      tempTwo.vendor_id = null;
      tempTwo.bank_transaction_history_id = values.bankImportedId;

      mainData.tr = tempOne;
      mainData.fr = tempTwo;

      if (values.transactionType.toLowerCase() === "rtgs") {
        bit.active = true;
        bit.amount = bankImportedDataById.amount;
        if (bankImportedDataById.balance === null) {
          bit.balance = bankImportedDataById.amount - values.receivedAmount;
        } else {
          bit.balance = bankImportedDataById.balance - values.receivedAmount;
        }
        bit.bank_import_transaction_id = values.bankImportedId;
        bit.cheque_dd_no = bankImportedDataById.cheque_dd_no;
        bit.deposited_bank_id = bankImportedDataById.deposited_bank_id;

        bit.end_row = bankImportedDataById.end_row;
        bit.paid = values.receivedAmount;
        bit.start_row = bankImportedDataById.start_row;
        bit.school_id = studentData.school_id;
        bit.transaction_date = bankImportedDataById.transaction_date;
        bit.transaction_no = bankImportedDataById.transaction_no;
        bit.transaction_remarks = bankImportedDataById.transaction_remarks;
        mainData.bit = bit;
      }

      await axios
        .post(`/api/finance/bulkFeeReceipt`, mainData)
        .then((res) => {
          if (values.auid !== "") {
            setAlertMessage({
              severity: "success",
              message: "Created Successfully",
            });
            setAlertOpen(true);
            navigate(
              `/BulkFeeReceiptView/${studentData.student_id}/${res.data.data[0].fee_receipt_id}/${values.transactionType}/${res.data.data[0].financial_year_id}`
            );
          } else {
            setAlertMessage({
              severity: "success",
              message: "Created Successfully",
            });
            setAlertOpen(true);
            navigate(
              `/BulkFeeReceiptView/${res.data.data[0].fee_receipt_id}/${values.transactionType}/${res.data.data[0].financial_year_id}`
            );
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: err.response
              ? err.response.data.message
              : "An error occured",
          });
          setAlertOpen(true);
        });
    } else {
      setAlertMessage({
        severity: "error",
        message: "Received amount is not equal to total amount..!",
      });
      setAlertOpen(true);
    }
  };

  return (
    <Box component="form" overflow="hidden" p={1}>
      <FormPaperWrapper>
        <Grid
          container
          alignItems="center"
          justifyContent="flex-start"
          rowSpacing={0}
          columnSpacing={{ xs: 2, md: 4 }}
        >
          <CustomModal
            open={modalOpen}
            setOpen={setModalOpen}
            title={modalContent.title}
            message={modalContent.message}
            buttons={modalContent.buttons}
          />
          <Grid item xs={12} md={4}>
            <CustomTextField
              name="auid"
              label="AUID"
              value={values.auid}
              handleChange={handleChange}
            />
          </Grid>
          {values.auid === "" ? (
            <Grid item xs={12} md={2}>
              <FormControlLabel
                name="check"
                checked={checked}
                onChange={handleSelectAuid}
                control={<Checkbox />}
                label="NO AUID"
              />
            </Grid>
          ) : (
            <></>
          )}

          <Grid item xs={12} md={1}>
            <Button
              variant="contained"
              sx={{ borderRadius: 2 }}
              onClick={() => handleClick()}
            >
              Submit
            </Button>
          </Grid>
          <Grid item xs={12}>
            {open ? (
              <Grid
                container
                alignItems="center"
                justifyContent="flex-start"
                rowSpacing={1}
                columnSpacing={{ xs: 2, md: 4 }}
              >
                <Grid item xs={12} md={12} mt={2}>
                  <Typography className={classes.bg}>
                    Student Details
                  </Typography>
                </Grid>
                <Grid item xs={12} md={12}>
                  <Paper elevation={2}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="center"
                      rowSpacing={1}
                      pl={2}
                      pr={2}
                      pb={1}
                      pt={1}
                    >
                      <Grid item xs={12} md={2}>
                        <Typography variant="subtitle2">AUID</Typography>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Typography variant="body2" color="textSecondary">
                          {studentData.auid}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="subtitle2">School</Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          {studentData.school_name_short}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="subtitle2">Name</Typography>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Typography variant="body2" color="textSecondary">
                          {studentData.student_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="subtitle2">Program</Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          {studentData.program_short_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="subtitle2">USN</Typography>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Typography variant="body2" color="textSecondary">
                          {studentData.usn}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="subtitle2">
                          Admission Category
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          {studentData.fee_admission_category_type}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="subtitle2">Year/Sem</Typography>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Typography variant="body2" color="textSecondary">
                          {studentData.number_of_years}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="subtitle2">
                          Template ID No.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          {studentData.fee_template_name}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <></>
            )}

            <Grid
              container
              justifyContent="flex-start"
              alignItems="center"
              rowSpacing={2}
              columnSpacing={4}
            >
              {auidOpen ? (
                <Grid item xs={12} md={2.4} mt={4}>
                  <CustomTextField
                    name="fromName"
                    label="From"
                    value={values.fromName}
                    handleChange={handleChange}
                    required
                  />
                </Grid>
              ) : (
                <></>
              )}
              {auidOpen || open ? (
                <>
                  <Grid item xs={12} md={2.4} mt={4}>
                    <CustomRadioButtons
                      name="receivedIn"
                      label="Received In"
                      value={values.receivedIn}
                      items={[
                        { value: "DOLLAR", label: "DOLLAR" },
                        { value: "UZS", label: "UZS" },
                      ]}
                      handleChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={2.4} mt={4}>
                    <CustomSelect
                      name="transactionType"
                      label="Transaction Type"
                      value={values.transactionType}
                      items={[
                        { value: "CASH", label: "CASH" },
                        { value: "RTGS", label: "RTGS" },
                      ]}
                      handleChange={handleChange}
                      required
                    />
                  </Grid>
                  {values.transactionType.toLowerCase() === "cash" ? (
                    <>
                      <Grid item xs={12} md={2.4} mt={4}>
                        <CustomTextField
                          name="receivedAmount"
                          label="Received Amount"
                          value={values.receivedAmount}
                          handleChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={2.4} mt={4}>
                        <CustomTextField
                          rows={2}
                          multiline
                          name="narration"
                          label="Narration"
                          value={values.narration}
                          handleChange={handleChange}
                        />
                      </Grid>
                    </>
                  ) : (
                    <></>
                  )}

                  {values.transactionType.toLowerCase() === "rtgs" ? (
                    <>
                      <Grid item xs={12} md={2.4} mt={4}>
                        <CustomTextField
                          name="transactionAmount"
                          label="Transaction Amount"
                          value={values.transactionAmount}
                          handleChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={2.4} mt={4}>
                        <Button
                          variant="contained"
                          onClick={handleViewBankImportData}
                        >
                          View
                        </Button>
                      </Grid>
                    </>
                  ) : (
                    <></>
                  )}
                  {values.transactionType.toLowerCase() === "bank" ? (
                    <>
                      <Grid item xs={12} md={3} mt={2}>
                        <CustomTextField
                          name="ddChequeNo"
                          label="Payment reference No."
                          value={values.ddChequeNo}
                          handleChange={handleChange}
                        />
                      </Grid>

                      <Grid item xs={12} md={3} mt={2}>
                        <CustomTextField
                          name="bankName"
                          label="Bank"
                          value={values.bankName}
                          handleChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} md={3} mt={4}>
                        <CustomDatePicker
                          name="ddDate"
                          label="Payment Date"
                          value={values.ddDate}
                          handleChangeAdvance={handleChangeAdvance}
                          required
                        />
                      </Grid>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
              {openBankImportedData &&
              values.transactionType.toLowerCase() === "rtgs" ? (
                <Grid item xs={12} md={12}>
                  <TableContainer
                    component={Paper}
                    sx={{ position: "relative", height: "20%", width: "100%" }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell sx={{ width: "5%" }}>
                            SL No.
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: "5%" }}>
                            Select
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: "5%" }}>
                            Import Date
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: "5%" }}>
                            CHQ/DD No.
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: "5%" }}>
                            Transaction No.
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: "5%" }}>
                            Transaction Date
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: "5%" }}>
                            Deposited In
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: "5%" }}>
                            Amount
                          </StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bankImportedData.length > 0 ? (
                          bankImportedData.map((obj, i) => {
                            return (
                              <TableRow key={i}>
                                <StyledTableCell>{i + 1}</StyledTableCell>
                                <StyledTableCell>
                                  <Checkbox
                                    {...label}
                                    sx={{
                                      "& .MuiSvgIcon-root": {
                                        fontSize: 12,
                                      },
                                    }}
                                    name={obj.bank_import_transaction_id}
                                    value={obj.bank_import_transaction_id}
                                    onChange={handleChangeCheckbox}
                                    checked={obj?.isChecked || false}
                                  />
                                </StyledTableCell>
                                <StyledTableCell>
                                  {obj.created_Date
                                    ? obj.created_Date
                                        .slice(0, 10)
                                        .split("-")
                                        .reverse()
                                        .join("-")
                                    : ""}
                                </StyledTableCell>
                                <StyledTableCell
                                  style={{
                                    whiteSpace: "normal",
                                    wordWrap: "break-word",
                                  }}
                                >
                                  {obj.cheque_dd_no}
                                </StyledTableCell>
                                <StyledTableCell>
                                  {obj.transaction_no}
                                </StyledTableCell>
                                <StyledTableCell>
                                  {obj.transaction_date}
                                </StyledTableCell>
                                <StyledTableCell>YES BANK</StyledTableCell>
                                <StyledTableCell>{obj.amount}</StyledTableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              ) : (
                <></>
              )}

              {openBankImportedDataById &&
              values.transactionType.toLowerCase() === "rtgs" ? (
                <>
                  <Grid item xs={12} md={12}>
                    <TableContainer
                      component={Paper}
                      sx={{ position: "relative" }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell sx={{ width: "5%" }}>
                              Receipt No.
                            </StyledTableCell>

                            <StyledTableCell sx={{ width: "5%" }}>
                              Import Date
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: "5%" }}>
                              CHQ/DD No.
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: "5%" }}>
                              Transaction No.
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: "5%" }}>
                              Transaction Date
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: "5%" }}>
                              Deposited In
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: "5%" }}>
                              Amount
                            </StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <StyledTableCell>
                              {bankImportedDataById.receipt_no}
                            </StyledTableCell>

                            <StyledTableCell>
                              {bankImportedDataById.transaction_date}
                            </StyledTableCell>
                            <StyledTableCell
                              style={{
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                              }}
                            >
                              {bankImportedDataById.cheque_dd_no}
                            </StyledTableCell>
                            <StyledTableCell>
                              {bankImportedDataById.transaction_no}
                            </StyledTableCell>
                            <StyledTableCell>
                              {bankImportedDataById.transaction_date}
                            </StyledTableCell>
                            <StyledTableCell>YES BANK</StyledTableCell>
                            <StyledTableCell>
                              {bankImportedDataById.amount}
                            </StyledTableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell>Receipt No.</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Auid</StyledTableCell>
                            <StyledTableCell>Amount</StyledTableCell>
                            <StyledTableCell>Paid</StyledTableCell>
                            <StyledTableCell>Balance</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {receiptDetails.map((obj, i) => {
                            return (
                              <TableRow key={i}>
                                <StyledTableCell>
                                  {obj.receipt_no}
                                </StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell>
                                  {obj.auid ? obj.auid : "NA"}
                                </StyledTableCell>
                                <StyledTableCell>
                                  {obj.rtgs_net_amount}
                                </StyledTableCell>
                                <StyledTableCell>{obj.paid}</StyledTableCell>
                                <StyledTableCell>
                                  {obj.rtgs_balance_amount}
                                </StyledTableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CustomTextField
                      name="payingAmount"
                      label="Paying Now"
                      value={values.payingAmount}
                      handleChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                  </Grid>
                </>
              ) : (
                <></>
              )}

              {openSavedData &&
              values.transactionType.toLowerCase() === "rtgs" ? (
                <>
                  <Grid item xs={12} md={3} mt={2}>
                    <CustomTextField
                      name="receivedAmount"
                      label="Received Amount"
                      value={values.receivedAmount}
                      handleChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={3} mt={2}>
                    <CustomTextField
                      name="transactionNo"
                      label="Transaction No"
                      value={bankImportedDataById.transaction_no}
                      handleChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3} mt={2}>
                    <CustomTextField
                      name="transactionDate"
                      label="Transaction Date"
                      value={bankImportedDataById.transaction_date}
                      handleChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3} mt={2}>
                    <CustomTextField
                      multiline
                      rows={2}
                      name="narration"
                      label="Narration"
                      value={values.narration}
                      handleChange={handleChange}
                    />
                  </Grid>
                </>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          rowSpacing={2}
          columnSpacing={4}
        >
          {auidOpen || open ? (
            <Grid item xs={12} md={5} mt={2}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell sx={{ width: 100, textAlign: "center" }}>
                        Fee Heads
                      </StyledTableCell>
                      <StyledTableCell sx={{ width: 100, textAlign: "center" }}>
                        Paying Now
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((obj, i) => {
                      return (
                        <TableRow key={i}>
                          <StyledTableCell sx={{ height: "50px" }}>
                            <CustomAutocomplete
                              name={"voucherId" + "-" + i}
                              label="Select One"
                              value={obj.voucherId}
                              options={voucherHeadOptions}
                              handleChangeAdvance={handleChangeAdvance}
                              size="small"
                              required
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            <CustomTextField
                              name="payingAmount"
                              inputProps={{
                                style: { textAlign: "right" },
                              }}
                              label=""
                              value={obj.payingAmount}
                              handleChange={(e) => handleChangeOne(e, i)}
                            />
                          </StyledTableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell>Total</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography variant="subtitle2"> {total}</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
        <Grid item xs={12} align="right">
          {auidOpen || open ? (
            <Button
              style={{ borderRadius: 7 }}
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={handleCreate}
            >
              {loading ? (
                <CircularProgress
                  size={25}
                  color="blue"
                  style={{ margin: "2px 13px" }}
                />
              ) : (
                <strong>{"Create"}</strong>
              )}
            </Button>
          ) : (
            <></>
          )}
        </Grid>
      </FormPaperWrapper>
    </Box>
  );
}

export default BulkFeeReceipt;
