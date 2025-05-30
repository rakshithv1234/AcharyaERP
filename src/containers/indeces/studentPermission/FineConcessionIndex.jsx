import { useState, useEffect, lazy } from "react";
import {
  IconButton,
  Tooltip,
  styled,
  tooltipClasses,
  Grid,
} from "@mui/material";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import { useNavigate } from "react-router-dom";
import useAlert from "../../../hooks/useAlert";
import AddIcon from "@mui/icons-material/Add";
import { Button, Box } from "@mui/material";
import CustomModal from "../../../components/CustomModal";
import axios from "../../../services/Api";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
import ModalWrapper from "../../../components/ModalWrapper";
const GridIndex = lazy(() => import("../../../components/GridIndex"));

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white",
    color: "rgba(0, 0, 0, 0.6)",
    maxWidth: 300,
    fontSize: 12,
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;",
    padding: "10px",
    textAlign: "justify",
  },
}));

const modalContents = {
  title: "",
  message: "",
  buttons: [],
};

const initialState = {
  studentPermissionList: [],
  modalOpen: false,
  modalContent: modalContents,
  attachmentModal: false,
  fileUrl: null,
};

const PermissionIndex = () => {
  const [
    {
      studentPermissionList,
      modalOpen,
      modalContent,
      fileUrl,
      attachmentModal,
    },
    setState,
  ] = useState(initialState);
  const [tab, setTab] = useState("Permission");
  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    modifiedDate:false
  });

  useEffect(() => {
    setCrumbs([]);
    getStudentPermissionData();
  }, []);

  const columns = [
    { field: "auid", headerName: "Auid", flex: 1 },
    { field: "student_name", headerName: "Student Name", flex: 1 },
    {
      field: "tillDate",
      headerName: "Till Date",
      flex: 1,
      renderCell: (params) => (
        <>
          {!!params.row.tillDate
            ? moment(params.row.tillDate).format("DD-MM-YYYY")
            : "-"}
        </>
      ),
    },
    {
      field: "currentSem",
      headerName: "Allow Sem",
      flex: 1,
      renderCell: (params) => (
        <>{!!params.row?.currentSem ? params.row.currentSem : "-"}</>
      ),
    },
    {
      field: "totalDue",
      headerName: "Total Due",
      flex: 1
    },
    {
      field: "concessionAmount",
      headerName: "Concession Amount",
      flex: 1
    },
    { field: "remarks", headerName: "Remarks", flex: 1 },
    {
      field: "file",
      headerName: "Attachment",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        <HtmlTooltip title="View Attachment">
          <IconButton
            onClick={() => getUploadData(params.row?.file)}
            disabled={!params.row.file}
          >
            <VisibilityIcon fontSize="small" color={!params.row.file ? "secondary" : "primary"} />
          </IconButton>
        </HtmlTooltip>,
      ],
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 1,
      valueGetter: (value, row) =>
        row.createdDate
          ? moment(row.createdDate).format("DD-MM-YYYY")
          : "",
    },
    {
      field: "modifiedDate",
      headerName: "Modified Date",
      flex: 1,
      valueGetter: (value, row) =>
        row.modifiedDate !== row.createdDate
          ? moment(row.modifiedDate).format("DD-MM-YYYY")
          : "",
    },
    {
      field: "id",
      headerName: "Edit",
      type: "actions",
      flex: 1,
      getActions: (params) => [
        <HtmlTooltip title="Edit">
          <IconButton
            onClick={() =>
              navigate(`/permission-form`, {
                state: { ...params.row, permissionType: "Fine Waiver" },
              })
            }
          >
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
        </HtmlTooltip>,
      ],
    }
  ];

  const getStudentPermissionData = async () => {
    try {
      const res = await axios.get(
        `/api/student/getFineConcession`
      );
      if (res.status == 200 || res.status == 201) {
        const list = res?.data?.data?.map((el, index) => ({
          ...el,
          id: index + 1,
        }));
        setState((prevState) => ({
          ...prevState,
          studentPermissionList: list,
        }));
      }
    } catch (error) {
      setAlertMessage({
        severity: "error",
        message: "An error occured",
      });
      setAlertOpen(true);
    }
  };

  const setModalOpen = (val) => {
    setState((prevState) => ({
      ...prevState,
      modalOpen: val,
    }));
  };

  const setLoadingAndGetData = () => {
    getStudentPermissionData();
    setModalOpen(false);
  };

  const setModalContent = (title, message, buttons) => {
    setState((prevState) => ({
      ...prevState,
      modalContent: {
        ...prevState.modalContent,
        title: title,
        message: message,
        buttons: buttons,
      },
    }));
  };

  const getUploadData = async (permissionAttachment) => {
    await axios(
      `/api/student/studentPermissionFileDownload?pathName=${permissionAttachment}`,
      {
        method: "GET",
        responseType: "blob",
      }
    )
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(file);
        setState((prevState) => ({
          ...prevState,
          attachmentModal: !attachmentModal,
          fileUrl: url,
        }));
      })
      .catch((error) => console.error(error));
  };

  const handleViewAttachmentModal = () => {
    setState((prevState) => ({
      ...prevState,
      attachmentModal: !attachmentModal,
    }));
  };

  return (
    <Box sx={{ position: "relative" }}>
      {!!modalOpen && (
        <CustomModal
          open={modalOpen}
          setOpen={setModalOpen}
          title={modalContent.title}
          message={modalContent.message}
          buttons={modalContent.buttons}
        />
      )}

      {!!attachmentModal && (
        <ModalWrapper
          title="Fine Concesssion Attachment"
          maxWidth={1000}
          open={attachmentModal}
          setOpen={() => handleViewAttachmentModal()}
        >
          <Grid container>
            <Grid item xs={12} md={12}>
              {!!fileUrl ? (
                <iframe
                  width="100%"
                  style={{ height: "100vh" }}
                  src={fileUrl}
                ></iframe>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </ModalWrapper>
      )}
      <Box
        mb={2}
        sx={{
          position:"absolute",
          right:0,
          marginTop: { xs: 1, md: -6 },
        }}
      >
        <Grid container>
          <Grid xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate("/permission-form")}
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ position: "absolute", width: "100%", marginTop: { xs: 10, md:1 },  }}>
        <GridIndex rows={studentPermissionList} columns={columns}   
        columnVisibilityModel={columnVisibilityModel}
        setColumnVisibilityModel={setColumnVisibilityModel}/>
      </Box>
    </Box>
  );
};

export default PermissionIndex;
