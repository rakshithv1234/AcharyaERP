import { useState, useEffect, lazy } from "react";
import axios from "../../../services/Api";
import {
  Box,
  CircularProgress,
  Checkbox,
  Grid,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  Paper,
  tableCellClasses,
  styled,
  TableCell,
  TableBody,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAlert from "../../../hooks/useAlert";
import moment from "moment";

const CustomAutocomplete = lazy(() =>
  import("../../../components/Inputs/CustomAutocomplete")
);

const CustomDatePicker = lazy(() =>
  import("../../../components/Inputs/CustomDatePicker")
);
const FormWrapper = lazy(() => import("../../../components/FormWrapper"));
const CustomTextField = lazy(() =>
  import("../../../components/Inputs/CustomTextField")
);

const initialValues = {
  collectionDate: "",
  closingCash: "",
  balance: "",
  depositedDate: "",
  schoolId: "",
  depositToId: "",
  remarks: "",
  schoolData: [],
};
const requiredFields = [
  "collectionDate",
  "closingCash",
  "balance",
  "depositedDate",
  "schoolId",
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.tableBg.main,
    textAlign: "center",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    textAlign: "center",
  },
}));

function ContraVoucher() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [totalPayingNow, setTotalPayingNow] = useState(0);

  const navigate = useNavigate();
  const { setAlertMessage, setAlertOpen } = useAlert();

  const checks = {};

  const errorMessages = {};

  useEffect(() => {
    getSchoolData();
  }, []);

  useEffect(() => {
    getBankData();
    gsetCollectionData();
  }, [values.schoolId, values.collectionDate]);

  useEffect(() => {
    setSelectAll(values?.schoolData?.every((obj) => obj.checked));
    const total = values?.schoolData?.reduce(
      (row, value) => Number(row) + Number(value.payingNow),
      0
    );

    setTotalPayingNow(total);
  }, [values.schoolData]);

  const getSchoolData = async () => {
    await axios
      .get(`/api/institute/school`)
      .then((res) => {
        setSchoolOptions(
          res.data.data.map((obj) => ({
            value: obj.school_id,
            label: obj.school_name,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getBankData = async () => {
    const { schoolId } = values;
    if (!schoolId) return;

    try {
      const [bankResponse] = await Promise.all([
        axios.get(`/api/finance/bankDetailsBasedOnSchoolId/${schoolId}`),
      ]);

      const bankOptionData = [];

      bankResponse?.data?.data.forEach((obj) => {
        bankOptionData.push({
          value: obj.id,
          label: obj.bank_name,
        });

        setBankOptions(bankOptionData);
      });
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Failed to load the data",
      });
      setAlertOpen(true);
    }
  };

  const gsetCollectionData = async () => {
    const { collectionDate } = values;
    const alteredData = moment(collectionDate).format("YYYY-MM-DD");
    if (!collectionDate) return;

    try {
      const [collectionResponse, interSchoolResponse] = await Promise.all([
        axios.get(`/api/finance/getBalanceAmountAndClosingCase/${alteredData}`),
        axios.get(`/api/finance/getInsData/${alteredData}`),
      ]);

      const addSchoolData = interSchoolResponse?.data?.data
        ?.filter((obj) => obj.balance > 0)
        ?.map((ele) => ({ ...ele, payingNow: 0, checked: false }));

      setValues((prev) => ({
        ...prev,
        ["closingCash"]: collectionResponse?.data?.closing_cash,
        ["balance"]: collectionResponse?.data?.balance,
        ["schoolData"]: addSchoolData,
        ["cashSummary"]: collectionResponse?.data?.cash_summary,
        ["netAmount"]: collectionResponse?.data?.net_amount,
      }));
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Failed to load the data",
      });
      setAlertOpen(true);
    }
  };

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangeAdvance = (name, newValue) => {
    setValues((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleCheckboxChange = (e) => {
    if (e.target.checked === true) {
      const allSelected = values.schoolData.map((obj) => ({
        ...obj,
        checked: e.target.checked,
        payingNow: obj.balance,
      }));

      setValues((prev) => ({
        ...prev,
        ["schoolData"]: allSelected,
      }));
    } else {
      const allSelected = values.schoolData.map((obj) => ({
        ...obj,
        checked: e.target.checked,
        payingNow: 0,
      }));

      setValues((prev) => ({
        ...prev,
        ["schoolData"]: allSelected,
      }));
    }
  };

  const handleChangeCheckbox = (e, schoolId) => {
    setValues((prev) => ({
      ...prev,
      schoolData: prev.schoolData.map((obj) => {
        if (obj.school_id === schoolId)
          return {
            ...obj,
            ["checked"]: e.target.checked,
            ["payingNow"]: e.target.checked ? obj.balance : 0,
          };
        return obj;
      }),
    }));
  };

  const handleChangePay = (e, index) => {
    const { name, value } = e.target;
    const parseIntValue = parseInt(value);
    setValues((prev) => ({
      ...prev,
      schoolData: prev.schoolData.map((obj, i) => {
        if (index === i)
          return {
            ...obj,
            [name]: parseIntValue > obj.balance ? 0 : parseIntValue,
            ["checked"]: parseIntValue > obj.balance ? false : true,
          };
        return obj;
      }),
    }));
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
    setLoading(true);
    const postData = [];

    values?.schoolData?.map((obj) => {
      if (obj.checked)
        postData.push({
          school_id: values.schoolId,
          bank_id: values.depositToId,
          date_of_deposit: moment(values.depositedDate).format("YYYY-MM-DD"),
          selected_date: moment(values.collectionDate).format("YYYY-MM-DD"),
          net_amount: values.netAmount,
          deposited_amount: obj.payingNow,
          row_created_date: "2025-04-24",
          balance: obj.balance - obj.payingNow,
          closing_cash: values.closingCash,
          cash_received: values.cash_received,
          cash_payment: null,
          cash_summary: values.cashSummary,
          remarks: "",
          cancel_voucher: 0,
          voucher_remarks: "",
          cancelled_by: null,
          cancelled_date: null,
          inter_school_id: obj.school_id,
          total_amount: totalPayingNow,
          active: true,
        });
    });

    await axios
      .post(`/api/finance/saveContraVoucher`, postData)
      .then((res) => {
        setLoading(false);
        if (res.status === 200 || res.status === 201) {
          setAlertMessage({
            severity: "success",
            message: "Group Created",
          });
          navigate("/VoucherMaster/Contra", { replace: true });
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

  return (
    <Box m={1}>
      <FormWrapper>
        <Grid
          container
          rowSpacing={{ xs: 2, md: 4 }}
          columnSpacing={{ xs: 2, md: 4 }}
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={12} md={4} mt={2}>
            <CustomDatePicker
              name="collectionDate"
              label="Collection Date"
              value={values.collectionDate}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.collectionDate}
              errors={errorMessages.collectionDate}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomTextField
              name="closingCash"
              label="Closing cash"
              value={values.closingCash}
              handleChange={handleChange}
              errors={errorMessages.closingCash}
              checks={checks.closingCash}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomTextField
              name="balance"
              label="Balance"
              value={values.balance}
              handleChange={handleChange}
              errors={errorMessages.balance}
              checks={checks.balance}
              required
            />
          </Grid>

          <Grid item xs={12} md={4} mt={2}>
            <CustomDatePicker
              name="depositedDate"
              label="deposited Date"
              value={values.depositedDate}
              handleChangeAdvance={handleChangeAdvance}
              checks={checks.depositedDate}
              errors={errorMessages.depositedDate}
              minDate={values.collectionDate}
              disableFuture
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
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CustomAutocomplete
              name="depositToId"
              label="Deposit To"
              value={values.depositToId}
              options={bankOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>

          <Grid item xs={12} md={7} align="center">
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell sx={{ width: "10%" }}>
                      <Checkbox
                        sx={{ padding: 0 }}
                        checked={selectAll}
                        onChange={handleCheckboxChange}
                      />
                    </StyledTableCell>

                    <StyledTableCell sx={{ width: "25%" }}>
                      School
                    </StyledTableCell>
                    <StyledTableCell sx={{ width: "25%" }}>
                      Amount
                    </StyledTableCell>

                    <StyledTableCell sx={{ width: "25%" }}>
                      Paying Now
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {values?.schoolData?.map((obj, i) => {
                    return (
                      <TableRow key={i}>
                        <StyledTableCell>
                          <Checkbox
                            sx={{ padding: 0 }}
                            checked={obj.checked}
                            onChange={(e) =>
                              handleChangeCheckbox(e, obj.school_id)
                            }
                          />
                        </StyledTableCell>

                        <StyledTableCell>
                          {obj.school_name_short}
                        </StyledTableCell>
                        <StyledTableCell>{obj.balance}</StyledTableCell>
                        <StyledTableCell>
                          <CustomTextField
                            name="payingNow"
                            label=""
                            value={obj.payingNow}
                            handleChange={(e) => handleChangePay(e, i)}
                            checks={checks[obj.quantity]}
                            errors={errorMessages[obj.quantity]}
                          />
                        </StyledTableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} align="right">
            <Button
              style={{ borderRadius: 7 }}
              variant="contained"
              color="primary"
              disabled={loading || !requiredFieldsValid()}
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
          </Grid>
        </Grid>
      </FormWrapper>
    </Box>
  );
}
export default ContraVoucher;
