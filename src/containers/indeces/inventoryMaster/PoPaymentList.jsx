import { useState, useEffect } from "react";
import { Box, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import GridIndex from "../../../components/GridIndex";
import { useNavigate } from "react-router-dom";
import axios from "../../../services/Api";
import moment from "moment";
import CustomModal from "../../../components/CustomModal";
import useAlert from "../../../hooks/useAlert";
import ModalWrapper from "../../../components/ModalWrapper";
import FormWrapper from "../../../components/FormWrapper";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
const { userId, roleShortName } = JSON.parse(sessionStorage.getItem("AcharyaErpUser"));

const modalPrintContents = {
  title: "",
  message: "",
  buttons: [],
};

const initialState = {
  printModalOpen: false,
  modalPrintContent: modalPrintContents,
};

const filterLists = [
  { label: "Today", value: "TODAY" },
  { label: "1 Week", value: "WEEK" },
  { label: "1 Month", value: "MONTH" },
  { label: "6 Months", value: "6MONTHS"},
  { label: "Current Year", value: "1YEAR"},
  { label: "Custom Date", value: "custom" },
];

const initialValues = {
  paymentType: null,
  filterList: filterLists,
  filter: filterLists[3].value,
  startDate: "",
  endDate: "",
  school_Id: "",
  cancelRemarks: ""
};



function PoPaymentList() {
  const [rows, setRows] = useState([]);
  const [rowData, setRowData] = useState({});
  const [poData, setPoRows] = useState([]);
  const [poAmount, setAmout] = useState();
  const [srnPoData, setSrnPoRows] = useState([]);
  const [{ printModalOpen, modalPrintContent }, setState] = useState([initialState]);
  const [modalPreview, setModalPreview] = useState(false);
  const [modalSRNPreview, setModalSRNPreview] = useState(false);

  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  const { setAlertMessage, setAlertOpen } = useAlert();
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [values, setValues] = useState(initialValues);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const setCrumbs = useBreadcrumbs();

  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    created_date: false,
    createdUsername: false,
  });

  const onPrint = (rowValue) => {
    setPrintModalOpen();
    setModalContentPrint("", "Do you want to print on physical letter head?", [
      { name: "Yes", color: "primary", func: () => printPo(rowValue, true) },
      { name: "No", color: "primary", func: () => printPo(rowValue, false) },
    ]);
  };

  const printPo = async (rowValue) => {
    navigate(`/PoPdf/${rowValue.purchaseOrderId}`, { state: { letterHeadStatus: true } })
  };

  const setPrintModalOpen = () => {
    setState((prevState) => ({
      ...prevState,
      printModalOpen: !printModalOpen,
    }));
  };

  const setModalContentPrint = (title, message, buttons) => {
    setState((prevState) => ({
      ...prevState,
      modalPrintContent: {
        ...prevState.modalPrintContent,
        title: title,
        message: message,
        buttons: buttons,
      },
    }));
  };

  const handlePreview = (id, type, amount) => {
    if (type === "SRN") {
      setModalSRNPreview(true)
      setAmout(amount)
    } else {
      setModalPreview(true);
      setAmout(amount)
    }
    getPoData(id, type)
  };

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

  const columns = [
    { field: "institute", headerName: "Institute" },
    { field: "vendorName", headerName: "Vendor", flex: 1 },
    { field: "poNo", headerName: "Po No", flex: 1 },
    {
      field: "poDate",
      headerName: "Po Date",
      flex: 1,
      valueGetter: (value, row) =>
        moment(row.poDate).format("DD-MM-YYYY"),
    },
    {
      field: "poAmount",
      headerName: "Po Amount",
      headerAlign: "right",
      align: "right",
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="subtitle2"
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate(`/PoPdf/${params.row.purchaseOrderId}`, { state: { letterHeadStatus: false, path: "po-payment-history" } })
          }

        >
          {params.row.poAmount}
        </Typography>
      )
    },
    { field: "type", headerName: "Po Type", flex: 1, hide: true },
    { field: "paymentType", headerName: "Payment Type", flex: 1, hide: true },
    {
      field: "grnStatus",
      headerName: "GRN",
      headerAlign: "right",
      align: "right",
      flex: 1,
      renderCell: (params) => {
        const roundedValue = Math.round(params.row.grnStatus);
        return (
          <Typography
            variant="subtitle2"
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() =>
              handlePreview(params.row.purchaseOrderId, params.row?.type, params.row?.poAmount)
            }
          >
            {roundedValue}
          </Typography>
        );
      }
    },
    {
      field: "jvStatus",
      headerName: "Journal",
      flex: 1,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => {
        const rawValue = params.row.jvStatus;
        const numericValue = Number(rawValue);

        // If the value is 0 (or 0.00, "0", etc.), show nothing
        if (!numericValue) return null;

        const roundedValue = Math.round(numericValue);

        return (
          <Typography
            variant="subtitle2"
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() =>
              handleGeneratePdf(
                params.row.journalVoucherNumber,
                params.row.school_id,
                params.row.fcYearId
              )
            }
          >
            {roundedValue}
          </Typography>
        );
      }
    },


    {
      field: "paymentStatus",
      headerName: "Payment",
      flex: 1,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (

        <Typography
          variant="subtitle2"
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() =>
            navigate(
              `/payment-voucher-pdf/${params.row.paymentVoucherId}`,
              {
                state: { advancePdfStatus: true, path: "po-payment-history" },
              }
            )
          }
        >
          {params.row.paymentStatus}
        </Typography>
      )
    },
    // {
    //   field: "Print",
    //   headerName: "Print PO",
    //   flex: 1,
    //   renderCell: (params) => {
    //     return (
    //       <IconButton
    //         // onClick={() => navigate(`/PoPdf/${params.row.purchaseOrderId}`)}
    //         onClick={() => onPrint(params.row)}
    //       >
    //         <PrintIcon fontSize="small" color="primary" />
    //       </IconButton>
    //     );
    //   },
    // },

    // {
    //   field: "Amend",
    //   type: "actions",
    //   flex: 1,
    //   headerName: "Amend Po",
    //   getActions: (params) => [
    //     params.row.grnCreationStatus ? (
    //       <IconButton>
    //         <BeenhereIcon fontSize="small" color="success" />
    //       </IconButton>
    //     ) : (
    //       <IconButton
    //         onClick={() => navigate(`/Poupdate/${params.row.purchaseOrderId}`)}
    //       >
    //         <EditIcon fontSize="small" color="primary" />
    //       </IconButton>
    //     ),
    //   ],
    // },

    // {
    //   field: "GRN",
    //   headerName: "Create GRN",
    //   flex: 1,
    //   renderCell: (params) => {
    //     const { grnCreationStatus, status, purchaseOrderId, paymentType, amount } = params.row;
    //     console.log();

    //     if (grnCreationStatus !== null && status === "COMPLETED") {
    //       return (
    //         <IconButton onClick={() => handlePreview(purchaseOrderId, paymentType, amount)}>
    //           <Visibility fontSize="small" color="primary" />
    //         </IconButton>
    //       );
    //     }

    //     const iconColor = (status === "PENDING" && grnCreationStatus !== null) ? "#fbc02d" : "#43a047";

    //     return (
    //       <IconButton onClick={() => navigate(`/CreateGrn/${purchaseOrderId}`)}>
    //         <AddCircleOutlineRoundedIcon fontSize="small" sx={{ color: iconColor }} />
    //       </IconButton>
    //     );
    //   },
    // },


    // {
    //   field: "cancel",
    //   headerName: "Cancel",
    //   flex: 1,
    //   renderCell: (params) => {
    //     if (params.row.grnCreationStatus) {
    //       return <IconButton>
    //         <BeenhereIcon fontSize="small" color="success" />
    //       </IconButton>
    //     } else {
    //       return (
    //         <IconButton onClick={() => handleCancelPo(params)}>
    //           <HighlightOff fontSize="small" color="error" />
    //         </IconButton>
    //       );
    //     }
    //   },
    // },
    {
      field: "created_date",
      headerName: "Created Date",
      flex: 1,
      valueGetter: (value, row) =>
        moment(row.created_date).format("DD-MM-YYYY"),
    },
    {
      field: "createdUsername",
      headerName: "Created By",
      flex: 1,
    },
  ];

  useEffect(() => {
    setCrumbs([{}]);
    getData(values.filterList[3].value);
    getSchoolData()
  }, []);

  useEffect(() => {
    getData();
  }, [values.school_Id, values?.grnDate, values?.paymentType, values?.filter, values.startDate, values.endDate]);

  const getPoData = async (id, type) => {
    try {
      const endpoint =
        type === "SRN"
          ? `/api/purchase/getGRNByPOId/${id}`
          : `/api/purchase/getGRNByPOId/${id}`;

      const res = await axios.get(endpoint);
      const purchaseOrder = res?.data?.data?.purchaseOrder;
      const purchaseItems = purchaseOrder?.purchaseItems || [];
      if (type === "SRN") {
        setSrnPoRows(res?.data?.data);
      } else {
        setPoRows(res?.data?.data);
      }
    } catch (error) {
      console.error("Failed to fetch PO data:", error);
    }
  };



  const handleCancelPo = (params) => {

    setFeedbackOpen((state) => !state)
    setRowData(params)
    // setModalOpen(true);
    // const handleToggle = async () => {
    //   await axios
    //     .delete(
    //       `/api/purchase/rejectPurchaseOrder?purchaseOrderId=${params.row.purchaseOrderId}&cancelById=${userId}`
    //     )
    //     .then((res) => {
    //       if (res.status === 200 || res.status === 210) {
    //         setAlertMessage({
    //           severity: "success",
    //           message: "Cancelled Successfully",
    //         });
    //         setAlertOpen(true);
    //         setModalOpen(false);
    //         getData();
    //       } else {
    //         setAlertMessage({
    //           severity: "error",
    //           message: "Error Occured",
    //         });
    //         setAlertOpen(true);
    //       }
    //     })
    //     .catch((err) => console.error(err));
    // };
    // setModalContent({
    //   title: "",
    //   message: "Are you sure you want to cancel this po ?",
    //   buttons: [
    //     { name: "Yes", color: "primary", func: handleToggle },
    //     { name: "No", color: "primary", func: () => { } },
    //   ],
    // });
  };
  const getData = async () => {
    const queryParams = {
      ...(values.startDate && {
        fromDate: moment(values.startDate).format("YYYY-MM-DD"),
      }),
      ...(values.endDate && {
        toDate: moment(values.endDate).format("YYYY-MM-DD"),
      }),
      ...(values.school_Id && { schoolId: values.school_Id }),
      ...(values.paymentType && { paymentType: values.paymentType }),
      ...(values.filter && values.filter !== "custom" && {
        poFilter: values.filter,
      }),
    };

    const queryString = new URLSearchParams(queryParams).toString();

    const url = `/api/purchase/poReport?${queryString}`;

    const requestBody = {
      pageNo: 0,
      pageSize: 100000,
      createdDate: null,
      institute: null,
      vendor: null,
    };

    try {
      const res = await axios.post(url, requestBody);
      const rowId = res.data.data.map((obj, index) => ({
        ...obj,
        id: index + 1,
      }));
      setRows(rowId?.reverse());
    } catch (err) {
      console.error(err);
    }
  };
  const handleChangeAdvance = async (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "filter" && { startDate: "", endDate: "" })
    }));
  };
  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleCancel = async () => {
    if (!values?.cancelRemarks) {
      setAlertMessage({
        severity: "error",
        message: "Please fill all required fields",
      });
      setAlertOpen(true);
      return
    }

    await axios
      .delete(
        `/api/purchase/rejectPurchaseOrder?purchaseOrderId=${rowData.row.purchaseOrderId}&cancelById=${userId}&cancelComments=${values?.cancelRemarks} `
      )
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          setAlertMessage({ severity: "success", message: "Updated" });
          setAlertOpen(true);
          setFeedbackOpen(false);
          getData()
        }
      })
      .catch((err) => {
        setAlertMessage({
          severity: "error",
          message: err.response
            ? err.response.data.message
            : "An error occured",
        });
        setAlertOpen(true);
      });
  };
  const handleGeneratePdf = async (
    journalVoucherNumber,
    schoolId,
    fcYearId
  ) => {
    navigate(`/generate-journalvoucher-pdf/${journalVoucherNumber}`, {
      state: { grnIndexStatus: true, schoolId, fcYearId, path: "po-payment-history" },
    });
  };
  return (
    <>
      {!!printModalOpen && (
        <CustomModal
          open={printModalOpen}
          setOpen={setPrintModalOpen}
          title={modalPrintContent.title}
          message={modalPrintContent.message}
          buttons={modalPrintContent.buttons}
        />
      )}
      <Box>
        <FormWrapper>
          <Grid
            container
            justifyContent="flex-start"
            rowSpacing={2}
            columnSpacing={4}
          >
            <Grid item xs={12} md={3}>
              <CustomAutocomplete
                name="school_Id"
                label="School"
                value={values.school_Id}
                options={schoolOptions}
                handleChangeAdvance={handleChangeAdvance}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="filter"
                label="Filter"
                value={values.filter}
                options={values.filterList || []}
                handleChangeAdvance={handleChangeAdvance}
              />
            </Grid>

            {values.filter === "custom" && (
              <>
                <Grid item xs={12} md={2}>
                  <CustomDatePicker
                    name="startDate"
                    label="From Date"
                    value={values.startDate}
                    handleChangeAdvance={handleChangeAdvance}
                    required
                    minDate={roleShortName !== "SAA" ? new Date(new Date().getFullYear(), 3, 1) : undefined}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <CustomDatePicker
                    name="endDate"
                    label="To Date"
                    value={values.endDate}
                    handleChangeAdvance={handleChangeAdvance}
                    disabled={!values.startDate}
                    required
                    minDate={
                      roleShortName !== "SAA"
                        ? values.startDate || new Date(new Date().getFullYear(), 3, 1)
                        : undefined
                    }
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={2}>
              <CustomAutocomplete
                name="paymentType"
                label="Type"
                value={values.paymentType}
                options={[
                  { value: "Advance", label: "Advance" },
                  { value: "After GRN/SRN", label: "After GRN/SRN" },
                ]}
                handleChangeAdvance={handleChangeAdvance}
              />
            </Grid>
          </Grid>
        </FormWrapper>
      </Box>

      <Box sx={{ position: "relative", mt: 2 }}>
        <CustomModal
          open={modalOpen}
          setOpen={setModalOpen}
          title={modalContent.title}
          message={modalContent.message}
          buttons={modalContent.buttons}
        />
        <GridIndex rows={rows} columns={columns} columnVisibilityModel={columnVisibilityModel}
          setColumnVisibilityModel={setColumnVisibilityModel} />
      </Box>
      <ModalWrapper
        title="Cancel Summary"
        maxWidth={600}
        open={feedbackOpen}
        setOpen={setFeedbackOpen}
      >
        <Grid
          container
          justifyContent="flex-start"
          alignItems="center"
          rowSpacing={2}
          columnSpacing={2}
          marginTop={2}
        >
          <Grid item xs={12} md={8}>
            <CustomTextField
              multiline
              rows={2}
              name="cancelRemarks"
              label="Summary"
              value={values.cancelRemarks}
              handleChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} align="right">
            <Button
              variant="contained"
              onClick={handleCancel}
              sx={{ borderRadius: 2 }}
              disabled={!values.cancelRemarks}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </ModalWrapper>
      <ModalWrapper title="GRN Details" open={modalPreview} setOpen={setModalPreview}>
        <Grid container justifyContent="center" alignItems="center" marginTop={2}>
          <TableContainer component={Paper} sx={{ maxHeight: 500, borderRadius: 2, boxShadow: 3 }}>
            <Table stickyHeader size="small" aria-label="modern styled table">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {[
                    'Item Name',
                    'PO No',
                    'PO Amount',
                    'GRN No',
                    'Quantity',
                    'Rate',
                    'Discount (%)',
                    'Discount Total',
                    'GST (%)',
                    'GST Total',
                    'Total Amount',
                    'Unit',
                    'Description',
                    'Created Name',
                    'Created Date',
                  ].map((header, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: 'primary.main',
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {poData?.map((item, index) => {
                  const rate = item.enterQty ? item.costTotal / item.enterQty : 0;

                  return (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f0f8ff',
                          transition: '0.3s',
                        },
                        borderRadius: 2,
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{item.itemName}</TableCell>
                      <TableCell>{item.purchaseRefNo}</TableCell>
                      <TableCell align="right">₹{Number(poAmount).toFixed(2)}</TableCell>
                      <TableCell align="right">{item.grnNo ?? ''}</TableCell>
                      <TableCell align="right">{item.enterQty ?? item.quantity ?? 0}</TableCell>
                      <TableCell align="right">₹{rate.toFixed(2)}</TableCell>

                      <TableCell align="right">{item.discount ? `${item.discount}%` : '0%'}</TableCell>
                      <TableCell align="right">₹{Number(item.discountTotal || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">{item.gst ? `${item.gst}%` : '0%'}</TableCell>
                      <TableCell align="right">₹{Number(item.gstTotal || 0).toFixed(2)}</TableCell>

                      <TableCell align="right">₹{Number(item.totalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>{item.uomShortName ?? ''}</TableCell>
                      <TableCell>{item.invoiceDescription ?? 'N/A'}</TableCell>
                      <TableCell>{item.createdUserName ?? ''}</TableCell>
                      <TableCell>{moment(item.createdDate).format("DD-MM-YYYY")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </ModalWrapper>

      <ModalWrapper title={`SRN Details`} maxWidth={1200} open={modalSRNPreview} setOpen={setModalSRNPreview}>
        <Grid container justifyContent="center" alignItems="center" marginTop={2}>
          <TableContainer component={Paper} sx={{ maxHeight: 500, borderRadius: 2, boxShadow: 3 }}>
            <Table stickyHeader size="small" aria-label="modern styled table">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {[
                    'Item',
                    'PO No',
                    'Po Amount',
                    'SRN No',
                    'SRN Date',
                    'SRN Amount',
                    'Description',
                    'Created Name',
                  ].map((header, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: 'primary.main',
                        color: '#ffffff',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {srnPoData?.map((item, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f0f8ff',
                        transition: '0.3s',
                      },
                      borderRadius: 2,
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{item.itemName}</TableCell>
                    <TableCell>{item.purchaseRefNo}</TableCell>
                    <TableCell align="right">₹{poAmount}</TableCell>
                    <TableCell>{item.grnNo}</TableCell>
                    <TableCell> {moment(item.createdDate).format("DD-MM-YYYY")}</TableCell>
                    <TableCell align="right">₹{item.enterQty ?? 0}</TableCell>
                    <TableCell>{item.remarks}</TableCell>
                    <TableCell>{item.createdUserName}</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </ModalWrapper>
    </>
  );
}

export default PoPaymentList;
