import { useState, useEffect, lazy } from "react";
import GridIndex from "../../../components/GridIndex";
import {
  Box,
  IconButton,
  Typography,
  Grid,
  styled,
  Tooltip,
  tooltipClasses,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import axios from "../../../services/Api";
import PrintIcon from "@mui/icons-material/Print";
import moment from "moment";

const CustomAutocomplete = lazy(() =>
  import("../../../components/Inputs/CustomAutocomplete.jsx")
);
const CustomDatePicker = lazy(() =>
  import("../../../components/Inputs/CustomDatePicker.jsx")
);

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white",
    color: "#5A5A5A",
    maxWidth: 270,
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
  },
}));

const useStyles = makeStyles({
  redRow: {
    backgroundColor: "#FFD6D7 !important",
  },
});

const filterLists = [
  { label: "Today", value: "today" },
  { label: "1 Week", value: "week" },
  { label: "1 Month", value: "month" },
  { label: "Custom Date", value: "custom" },
];

const initialValues = {
  filterList: filterLists,
  filter: filterLists[0].value,
  startDate: "",
  endDate: "",
  schoolList:[],
  schoolId:""
};

function StudentFeereceiptIndex() {
  const [values, setValues] = useState(initialValues);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const classes = useStyles();

  useEffect(() => {
    getSchoolDetails();
    getData(values.filterList[0].value);
  }, []);

  const getSchoolDetails = async () => {
    try {
      const res = await axios
      .get(`/api/institute/school`)
      if(res.status == 200 || res.status == 201){
        const list = res.data.data.map((obj) => ({
          value: obj.school_id,
          label: obj.school_name,
        }));
        setSchoolList(list);
      }
    } catch (error) {
      console.error(error)
    }
  };

  const setSchoolList = (lists) => {
    setValues((prevState)=>({
      ...prevState,
      schoolList:lists
    }))
  }

  const getData = async (filterKey, value) => {
    setLoading(true);
    let params = null;
    if (filterKey == "custom" && !!value && !!values.startDate && !values.schoolId) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&date_range=custom&start_date=${moment(
        values.startDate
      ).format("YYYY-MM-DD")}&end_date=${moment(value).format("YYYY-MM-DD")}`;
    } else if(filterKey == "custom" && !!value && !!values.startDate && !!values.schoolId) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&school_id=${values.schoolId}&date_range=custom&start_date=${moment(
        values.startDate
      ).format("YYYY-MM-DD")}&end_date=${moment(value).format("YYYY-MM-DD")}`;
    } else if(filterKey == "schoolId" && !!values.endDate && !!values.startDate) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&school_id=${value}&date_range=custom&start_date=${moment(
        values.startDate
      ).format("YYYY-MM-DD")}&end_date=${moment(values.endDate).format("YYYY-MM-DD")}`;
    }
     else if(filterKey == "schoolId" && !!values.filter && !values.endDate && !values.startDate) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&school_id=${value}&date_range=${values.filter}`;
    }else if(filterKey !== "custom" && !!values.schoolId) {
      params = `page=${0}&page_size=${1000000}&sort=created_date&date_range=${filterKey}&school_id=${values.schoolId}`;
    }else {
      params = `page=${0}&page_size=${1000000}&sort=created_date&date_range=${filterKey}`;
    }

    if(params){
      await axios
        .get(`/api/finance/fetchAllFeeReceipt?${params}`)
        .then((res) => {
          setLoading(false);
          setRows(res.data.data);
        })
        .catch((err) =>{
        setLoading(false);
        console.error(err)
      });
    }
  };

  const columns = [
    { field: "receipt_type", headerName: "Type", flex: 1,renderCell:(params)=> (params.row.receipt_type == "HOS" ? "HOST" :
       params.row.receipt_type == "General" ? "GEN": params.row.receipt_type == "Registration Fee" ?
      "REGT": (params.row.receipt_type).toUpperCase())},
    {
      field: "fee_receipt",
      headerName: "Receipt No",
      flex: 1,
      align:"right"
    },
    {
      field: "created_date",
      headerName: "Date",
      flex: 1,
      type: "date",
      valueGetter: (params) =>
        params.row.created_date
          ? moment(params.row.created_date).format("DD-MM-YYYY")
          : "",
    },
    {
      field: "school_name_short",
      headerName: "School",
      flex: .2,
      hide:true,
      valueGetter: (params) => (params.row.school_name_short ? params.row.school_name_short : ""),
    },
    {
      field: "auid",
      headerName: "AUID",
      flex: 1.5,
      valueGetter: (params) => (params.row.auid ? params.row.auid : ""),
    },
    {
      field: "student_name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => {
        return params.row.student_name &&
          params.row.student_name.length > 15 ? (
          <HtmlTooltip title={params.row.student_name}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ fontSize: 13, cursor: "pointer" }}
            >
              {params.row.student_name.substr(0, 13) + "..."}
            </Typography>
          </HtmlTooltip>
        ) : params.row.student_name ? (
          <HtmlTooltip title={params.row.student_name}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ fontSize: 13, cursor: "pointer" }}
            >
              {params.row.student_name}
            </Typography>
          </HtmlTooltip>
        ) : (
          "NA"
        );
      },
    },
    {
      field: "fee_template_name",
      headerName: "Template",
      flex: 1,
      hide:true,
      valueGetter: (params) => (params.row.fee_template_name ? params.row.fee_template_name : "NA"),
    },
    {
      field: "transaction_type",
      headerName: "Cash",
      flex: .8,
      align:"right",
      valueGetter: (params) =>
        (params.row.transaction_type)?.toLowerCase() == "cash" ? params.row.paid_amount : "",
    },
    {
      field: "dd",
      headerName: "DD/Cheque",
      flex: .8,
      align:"right",
      valueGetter: (params) =>
        (params.row.transaction_type)?.toLowerCase() == "dd" ? params.row.paid_amount : "",
    },
    {
      field: "paid_amount",
      headerName: "Online",
      flex: .8,
      align:"right",
      valueGetter: (params) =>
        (params.row.transaction_type)?.toLowerCase() == "rtgs" || (params.row.transaction_type)?.toLowerCase() == "p_gateway" ? params.row.paid_amount : "",
    },

    {
      field: "cheque_dd_no",
      headerName: "Transaction Ref",
      flex: 2,
      hide:true,
      renderCell: (params) => {
        return params?.row?.cheque_dd_no?.length > 15 ? (
          <HtmlTooltip title={params.row.cheque_dd_no}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ fontSize: 13, cursor: "pointer" }}
            >
              {params.row.cheque_dd_no.substr(0, 30) + "..."}
            </Typography>
          </HtmlTooltip>
        ) : (
          <HtmlTooltip title={params.row.cheque_dd_no}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ fontSize: 13, cursor: "pointer" }}
            >
              {params.row.cheque_dd_no}
            </Typography>
          </HtmlTooltip>
        );
      },
    },
    { field: "transaction_no", headerName: "Trn No", flex: 1},
    { field: "transaction_date", headerName: "Trn Date", flex: 1},
    { field: "bank_name", headerName: "Bank", flex: 1},
    { field: "created_username", headerName: "Created By", flex: 1,hide:true },
    { field: "paid_year", headerName: "Paid Year", flex: .5,align:"right",hide:true },
    {
      field: "Print",
      type: "actions",
      flex: .5,
      headerName: "Print",
      getActions: (params) => [
        params.row.receipt_type.toLowerCase() === "bulk" &&
        params.row.student_id !== null ? (
          <IconButton
              onClick={() =>
              navigate(`/BulkFeeReceiptPdfV1`, {
                state: {
                  studentId: params.row.student_id,
                  feeReceiptId: params.row.id,
                  transactionType: params.row.transaction_type,
                  financialYearId: params.row.financial_year_id,
                  linkStatus: true,
                },
              })
            }
            sx={{ cursor: "pointer" }}
            color="primary"
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        ) : params.row.receipt_type.toLowerCase() === "bulk" &&
          params.row.student_id === null ? (
          <IconButton
             onClick={() =>
              navigate(`/BulkFeeReceiptPdfV1`, {
                state: {
                  studentId: params.row.student_id,
                  feeReceiptId: params.row.id,
                  transactionType: params.row.transaction_type,
                  financialYearId: params.row.financial_year_id,
                  linkStatus: true,
                },
              })
            }
            sx={{ cursor: "pointer" }}
            color="primary"
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        ) : params.row.receipt_type.toLowerCase() === "hos" ? (
          <IconButton
            onClick={() =>
              navigate(`/HostelFeePdfV1`, {
                state: { feeReceiptId: params.row.id, linkStatus: true },
              })
            }
            color="primary"
            sx={{ cursor: "pointer" }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        ) : params.row.receipt_type.toLowerCase() === "exam" ? (
          <IconButton
            onClick={() =>
              navigate(`/ExamReceiptPdfV1`, {
                state: { feeReceiptId: params.row.id, linkStatus: true },
              })
            }
            color="primary"
            sx={{ cursor: "pointer" }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        ) : (
          <IconButton
             onClick={() =>
                navigate(`/FeeReceiptDetailsPDFV1`, {
                  state: {
                    auid: params.row.auid,
                    studentId: params.row.student_id,
                    feeReceipt: params.row.fee_receipt,
                    transactionType: params.row.transaction_type,
                    feeReceiptId: params.row.id,
                    financialYearId: params.row.financial_year_id,
                    linkStatus: true,
                  },
                })
              }
            color="primary"
            sx={{ cursor: "pointer" }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        ),
      ],
    },
  ];

  const setNullField = () => {
    setValues((prevState)=>({
      ...prevState,
      startDate:"",
      endDate:""
    }))
  };

  const handleChangeAdvance = (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    if(name == "endDate"){
      getData("custom", newValue);
    }else if(name == "startDate" || newValue=="custom") {
    }else if(name == "schoolId"){
      getData("schoolId", newValue);
    }else {
      getData(newValue, "");
      setNullField()
    }
  };

  const getRowClassName = (params) => {
    return !params.row?.active ? classes.redRow : "" ;
  };

  return (
    <Box>
        <Grid
          container
          sx={{ display: "flex", justifyContent: "flex-end", gap: "10px",marginTop: { xs:2, md: -5 }}}
        >
          <Grid xs={12} md={3}>
            <CustomAutocomplete
              name="schoolId"
              label="School"
              value={values.schoolId}
              options={values.schoolList || []}
              handleChangeAdvance={handleChangeAdvance}
            />
          </Grid>
          <Grid xs={12} md={2}>
            <CustomAutocomplete
              name="filter"
              label="filter"
              value={values.filter}
              options={values.filterList || []}
              handleChangeAdvance={handleChangeAdvance}
            />
          </Grid>
          {values.filter == "custom" && (
            <Grid item xs={12} md={2}>
              <CustomDatePicker
                name="startDate"
                label="From Date"
                value={values.startDate}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
          )}
          {values.filter == "custom" && (
            <Grid item xs={12} md={2}>
              <CustomDatePicker
                name="endDate"
                label="To Date"
                value={values.endDate}
                handleChangeAdvance={handleChangeAdvance}
                disabled={!values.startDate}
                required
              />
            </Grid>
          )}
        </Grid>
      <Box sx={{ position: "relative", marginTop: rows.length > 0 ? "10px": "20px"}}>
        <GridIndex
          getRowClassName={getRowClassName}
          rows={rows} columns={columns} loading={loading} />
      </Box>
    </Box>
  );
}

export default StudentFeereceiptIndex;
