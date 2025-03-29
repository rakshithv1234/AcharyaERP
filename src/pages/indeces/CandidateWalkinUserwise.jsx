import { lazy, useEffect, useState } from "react";
import axios from "../../services/Api";
import domainUrl from "../../services/Constants";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  styled,
  Tooltip,
  tooltipClasses,
  Typography,
} from "@mui/material";
import GridIndex from "../../components/GridIndex";
import { useNavigate } from "react-router-dom";
import useBreadcrumbs from "../../hooks/useBreadcrumbs";
import useAlert from "../../hooks/useAlert";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Visibility } from "@mui/icons-material";
import moment from "moment";
import CustomModal from "../../components/CustomModal";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import VerifiedIcon from "@mui/icons-material/Verified";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AddLinkIcon from "@mui/icons-material/AddLink";
import npfStatusList from "../../utils/npfStatusList";

const ModalWrapper = lazy(() => import("../../components/ModalWrapper"));
const CounselorStatusForm = lazy(() =>
  import("../forms/candidateWalkin/CounselorStatusForm")
);
const ExtendLinkForm = lazy(() =>
  import("../forms/candidateWalkin/ExtendLinkForm")
);
const ApplicantDetails = lazy(() =>
  import("../../components/ApplicantDetails")
);

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white",
    color: "rgba(0, 0, 0, 0.6)",
    maxWidth: 300,
    fontSize: 9,
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;",
    padding: "6px",
  },
}));

const userId = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;

function CandidateWalkinUserwise() {
  const [rows, setRows] = useState([]);
  const [confirmContent, setConfirmContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const navigate = useNavigate();
  const setCrumbs = useBreadcrumbs();
  const { setAlertMessage, setAlertOpen } = useAlert();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get("/api/student/EditCandidateDetails", {
        params: {
          page: 0,
          page_size: 10000,
          sort: "created_date",
          user_id: userId,
        },
      });

      setRows(response.data.data.Paginated_data.content);
      setCrumbs([{ name: "Candidate Walkin" }]);
    } catch (err) {
      console.error(err);

      setAlertMessage({
        severity: "error",
        message: "Failed to fetch the data !!",
      });
      setAlertOpen(true);
    }
  };

  const handleOffer = (params) => {
    const {
      npf_status,
      is_verified,
      is_scholarship,
      id,
      application_status: status,
    } = params;

    if (status?.toLowerCase() === "paid") {
      return (
        <>
          <Typography variant="subtitle2">Basic Info</Typography>
        </>
      );
    } else if (npf_status === null && status === "Submitted") {
      return (
        <IconButton
          title="Create Offer"
          onClick={() => navigate(`/admissions/offer-create/${id}/user`)}
        >
          <AddBoxIcon color="primary" sx={{ fontSize: 22 }} />
        </IconButton>
      );
    } else if (
      npf_status === 1 &&
      (is_verified === "yes" || is_verified === "no" || !is_scholarship)
    ) {
      return (
        <IconButton
          title="View Offer"
          onClick={() => navigate(`/admissions/offer-view/${id}/user`)}
        >
          <Visibility color="primary" sx={{ fontSize: 22 }} />
        </IconButton>
      );
    } else if (npf_status === 1 && is_scholarship) {
      return (
        <IconButton
          title="Sch Pending"
          onClick={() => navigate(`/admissions/offer-create/${id}/user`)}
        >
          <PauseCircleFilledIcon color="primary" sx={{ fontSize: 22 }} />
        </IconButton>
      );
    } else if (npf_status === 2) {
      return (
        <IconButton
          title="Offer Sent"
          onClick={() => navigate(`/admissions/offer-view/${id}/user`)}
        >
          <MarkEmailReadIcon color="primary" sx={{ fontSize: 22 }} />
        </IconButton>
      );
    } else if (npf_status === 3 || npf_status === 4) {
      return (
        <IconButton
          title={
            npf_status === 3
              ? "Offer Accepted"
              : npf_status === 4
              ? "Registration Fee Paid"
              : ""
          }
          onClick={() => navigate(`/admissions/offer-view/${id}/user`)}
        >
          <VerifiedIcon color="success" sx={{ fontSize: 22 }} />
        </IconButton>
      );
    }
  };

  const handleDelete = async (rowData) => {
    const { id, is_scholarship: scholarship } = rowData;

    setConfirmContent({
      title: "",
      message: "Are you sure you want to delete the offer?",
      buttons: [
        {
          name: "Yes",
          color: "primary",
          func: () => handleDeleteOffer(id, scholarship),
        },
        { name: "No", color: "primary", func: () => {} },
      ],
    });
    setConfirmOpen(true);
  };

  const handleDeleteOffer = async (id, scholarship) => {
    try {
      setBackDropOpen(true);
      const { data: response } = await axios.get(
        `/api/student/Candidate_Walkin/${id}`
      );
      const candidateData = response.data;
      candidateData.npf_status = null;
      await axios.delete(`/api/student/deactivatePreAdmissionProcess/${id}`);
      if (scholarship) {
        await Promise.all([
          axios.delete(`/api/student/deactivateScholarship/${id}`),
          axios.delete(
            `/api/student/deactivateScholarshipapprovalstatus/${id}`
          ),
          axios.delete(`/api/student/deactivateScholarshipAttachment/${id}`),
        ]);
      }
      const { data: updateStatus } = await axios.put(
        `/api/student/Candidate_Walkin/${id}`,
        candidateData
      );
      if (updateStatus.success) {
        setAlertMessage({
          severity: "success",
          message: "Offer has been deleted successfully",
        });
        setAlertOpen(true);
        setConfirmOpen(false);
        getData();
      }
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to load fee template details!",
      });
      setAlertOpen(true);
    } finally {
      setBackDropOpen(false);
    }
  };

  const handleCounselorStatus = (data) => {
    setRowData(data);
    setModalOpen(true);
  };

  const handleCopyToClipboard = (id) => {
    setCopied(true);
    navigator.clipboard.writeText(`${domainUrl}registration-payment/${id}`);
  };
  const handleExtendLink = (data) => {
    setRowData(data);
    setLinkOpen(true);
  };

  const handleApplicantDetails = (data) => {
    setRowData(data);
    setDetailsOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "application_no_npf", headerName: "Application No", width: 150 },
    {
      field: "candidate_name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        <StyledTooltip
          title={<Typography variant="subtitle2">{params.value}</Typography>}
        >
          <Typography
            variant="subtitle2"
            onClick={() => handleApplicantDetails(params.row)}
            sx={{
              color: "primary.main",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {params.value?.toLowerCase()}
          </Typography>
        </StyledTooltip>
      ),
    },
    { field: "school_name_short", headerName: "School ", flex: 1 },
    {
      field: "program_short_name",
      headerName: "Program",
      flex: 1,
      valueGetter: (value, row) =>
        `${row.program_short_name} - ${row.program_specialization_short_name}`,
    },
    {
      field: "is_approved",
      headerName: "Offer Letter",
      flex: 1,
      renderCell: (params) => handleOffer(params.row),
    },
    {
      field: "counselor_name",
      headerName: "Counselor",
      flex: 1,
      renderCell: (params) =>
        params.row.offerCreatedDate ? (
          <StyledTooltip
            title={
              <>
                <Typography variant="body2">{params.value}</Typography>
                <Typography variant="body2">
                  {moment(params.row.offerCreatedDate).format("DD-MM-YYYY LT")}
                </Typography>
              </>
            }
          >
            <span>{params.value?.toLowerCase()}</span>
          </StyledTooltip>
        ) : (
          <span>{params.value?.toLowerCase()}</span>
        ),
    },
    {
      field: "offerCreatedDate",
      headerName: "Offer Created Date",
      flex: 1,
      hide: true,
      valueGetter: (value, row) =>
        value ? moment(value).format("DD-MM-YYYY LT") : "",
    },
    {
      field: "lead_status",
      headerName: "Status",
      flex: 1,
      valueGetter: (value, row) => npfStatusList[row.npf_status],
    },
    // {
    //   field: "mail_sent_date",
    //   headerName: "Delete Offer",
    //   flex: 1,
    //   renderCell: (params) => {
    //     const { npf_status, is_scholarship, is_verified } = params.row;
    //     const isStatusValid = npf_status !== null && npf_status !== 2;
    //     const isEligibleForDeletion =
    //       is_scholarship === "true" && is_verified !== "yes";
    //     if (isStatusValid || isEligibleForDeletion) {
    //       return (
    //         <IconButton
    //           title="Delete Offer"
    //           onClick={() => handleDelete(params.row)}
    //         >
    //           <HighlightOffIcon color="error" sx={{ fontSize: 22 }} />
    //         </IconButton>
    //       );
    //     }
    //     return null;
    //   },
    // },
    // {
    //   field: "npf_status",
    //   headerName: "Counselor Status",
    //   flex: 1,
    //   renderCell: (params) =>
    //     params.row.npf_status >= 1 ? (
    //       <IconButton
    //         title="Update Status"
    //         onClick={() => handleCounselorStatus(params.row)}
    //       >
    //         <AddBoxIcon color="primary" sx={{ fontSize: 22 }} />
    //       </IconButton>
    //     ) : params.row.counselor_status === 1 ? (
    //       <IconButton title="Offer Accepted">
    //         <CheckCircleOutlineRoundedIcon color="success" />
    //       </IconButton>
    //     ) : (
    //       <></>
    //     ),
    // },
    // {
    //   field: "extendLink",
    //   headerName: "Extend Link",
    //   renderCell: (params) =>
    //     params.row.npf_status >= 2 && (
    //       <IconButton
    //         title="Extend Pay Link"
    //         onClick={() => handleExtendLink(params.row)}
    //       >
    //         <AddBoxIcon color="primary" sx={{ fontSize: 24 }} />
    //       </IconButton>
    //     ),
    // },
    {
      field: "link_exp",
      headerName: "Payment Link",
      renderCell: (params) =>
        params.row.npf_status >= 3 &&
        params.row.npf_status !== 4 && (
          <IconButton
            title="Copy Link"
            onClick={() => handleCopyToClipboard(params.row.id)}
          >
            <AddLinkIcon color="primary" sx={{ fontSize: 24 }} />
          </IconButton>
        ),
    },
    {
      field: "auid",
      headerName: "AUID",
      flex: 1,
      renderCell: (params) =>
        ((params.row.fee_admission_category_id === 2 &&
          params.row.npf_status >= 3) ||
          params.row.npf_status === 4 ||
          params.row.counselor_status === 1) && (
          <IconButton
            title="Create AUID"
            onClick={() =>
              navigate(`/admissions/auid-creation/${params.row.id}/user`)
            }
          >
            <AddBoxIcon color="primary" sx={{ fontSize: 22 }} />
          </IconButton>
        ),
    },
  ];

  return (
    <>
      <CustomModal
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={confirmContent.title}
        message={confirmContent.message}
        buttons={confirmContent.buttons}
      />

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box sx={{ top: 40 }}>
          <Alert
            severity="success"
            variant="filled"
            sx={{
              position: "fixed",
              top: 61,
              left: "50%",
              transform: "translate(-50%, 0)",
              width: "90%",
              maxWidth: 500,
              zIndex: 9999,
            }}
          >
            Payment link has been copied succesfully
          </Alert>
        </Box>
      </Snackbar>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <ModalWrapper
        open={modalOpen}
        setOpen={setModalOpen}
        maxWidth={700}
        title={`Offer Status - ${rowData.application_no_npf}`}
      >
        <CounselorStatusForm
          rowData={rowData}
          setModalOpen={setModalOpen}
          getData={getData}
          setAlertMessage={setAlertMessage}
          setAlertOpen={setAlertOpen}
        />
      </ModalWrapper>

      <ModalWrapper
        open={linkOpen}
        setOpen={setLinkOpen}
        maxWidth={500}
        title={`Extend Payment Link - ${rowData.application_no_npf}`}
      >
        <ExtendLinkForm
          rowData={rowData}
          setLinkOpen={setLinkOpen}
          getData={getData}
          setAlertMessage={setAlertMessage}
          setAlertOpen={setAlertOpen}
        />
      </ModalWrapper>

      <ModalWrapper
        open={detailsOpen}
        setOpen={setDetailsOpen}
        maxWidth={1100}
        title={rowData.candidate_name}
      >
        <ApplicantDetails id={rowData?.id} />
      </ModalWrapper>

      <Box sx={{ position: "relative", mt: 3 }}>
        <GridIndex rows={rows} columns={columns} />
      </Box>
    </>
  );
}

export default CandidateWalkinUserwise;
