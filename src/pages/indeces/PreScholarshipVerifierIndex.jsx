import { useState, useEffect } from "react";
import axios from "../../services/Api";
import { Box, Button, Grid, IconButton } from "@mui/material";
import GridIndex from "../../components/GridIndex";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useNavigate } from "react-router-dom";
import useBreadcrumbs from "../../hooks/useBreadcrumbs";
import { Visibility } from "@mui/icons-material";
import useAlert from "../../hooks/useAlert";
import OverlayLoader from "../../components/OverlayLoader";
import { Print } from "@mui/icons-material";
import { GenerateScholarshipApplication } from "../forms/candidateWalkin/GenerateScholarshipApplication";

const breadCrumbsList = [
  { name: "Verify Scholarship" },
  { name: "History", link: "/verify-history" },
];

function PreScholarshipVerifierIndex() {
  const [rows, setRows] = useState([]);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);

  const navigate = useNavigate();
  const setCrumbs = useBreadcrumbs();
  const { setAlertMessage, setAlertOpen } = useAlert();

  useEffect(() => {
    getData();
    setCrumbs(breadCrumbsList);
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get("/api/student/fetchScholarship3", {
        params: { page: 0, page_size: 10000, sort: "created_date" },
      });
      setRows(response.data.data.Paginated_data.content);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: "Failed to fetch the data !!",
      });
      setAlertOpen(true);
    }
  };

  const handleDownload = async (obj) => {
    try {
      setIsDocumentLoading(true);
      const response = await axios.get(
        `/api/ScholarshipAttachmentFileviews?fileName=${obj}`,
        {
          responseType: "blob",
        }
      );
      const url = URL.createObjectURL(response.data);
      window.open(url);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message || "Failed to download the document !!",
      });
      setAlertOpen(true);
    } finally {
      setIsDocumentLoading(false);
    }
  };

  const handleGeneratePrint = async (data) => {
    try {
      const response = await axios.get(
        "/api/student/getStudentDetailsBasedOnAuidAndStrudentId",
        { params: { auid: data.auid } }
      );
      const studentData = response.data.data[0];

      const schResponse = await axios.get(
        `/api/student/fetchScholarship2/${data.id}`
      );
      const schData = schResponse.data.data[0];

      const blobFile = await GenerateScholarshipApplication(
        studentData,
        schData
      );

      if (blobFile) {
        window.open(URL.createObjectURL(blobFile));
      } else {
        setAlertMessage({
          severity: "error",
          message: "Failed to generate scholarship application print !!",
        });
        setAlertOpen(true);
      }
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message ||
          "Failed to generate scholarship application print !!",
      });
      setAlertOpen(true);
    }
  };

  const handleInitiate = () => {
    navigate("/initiate-scholarship");
  };

  const columns = [
    {
      field: "application_no_npf",
      headerName: "Application No",
      flex: 1,
      hideable: false,
    },
    {
      field: "candidate_name",
      headerName: "Student Name",
      flex: 1,
      hideable: false,
    },
    {
      field: "auid",
      headerName: "AUID",
      flex: 1,
      hideable: false,
    },
    {
      field: "program_short_name",
      headerName: "Program",
      flex: 1,
      hideable: false,
      renderCell: (params) =>
        `${params.row.program_short_name} - ${params.row.program_specialization_short_name}`,
    },
    {
      field: "created_username",
      headerName: "Counselor Name",
      flex: 1,
      hideable: false,
    },
    {
      field: "requested_scholarship",
      headerName: "Requested",
      flex: 1,
      hideable: false,
    },
    {
      field: "scholarship_attachment_path",
      headerName: "Document",
      flex: 1,
      hideable: false,
      renderCell: (params) => (
        <IconButton
          title="Download the document"
          onClick={() => handleDownload(params.row.scholarship_attachment_path)}
          sx={{ padding: 0 }}
        >
          <Visibility color="primary" sx={{ fontSize: 20 }} />
        </IconButton>
      ),
    },
    {
      field: "id",
      headerName: "Application Print",
      flex: 1,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleGeneratePrint(params.row)}
          sx={{ padding: 0 }}
        >
          <Print color="primary" />
        </IconButton>
      ),
    },
    {
      field: "is_verified",
      headerName: "Verify",
      flex: 1,
      renderCell: (params) => (
        <IconButton
          title="Verify"
          onClick={() =>
            navigate(
              `/PreScholarshipVerifierForm/${params.row.auid}/${params.row.id}`
            )
          }
          sx={{ padding: 0 }}
        >
          <AddBoxIcon color="primary" sx={{ fontSize: 20 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      {isDocumentLoading && <OverlayLoader />}

      <Box sx={{ marginTop: { md: -6 } }}>
        <Grid container rowSpacing={2}>
          <Grid item xs={12} align="right">
            <Button variant="contained" onClick={handleInitiate}>
              Create Scholarship
            </Button>
          </Grid>

          <Grid item xs={12}>
            <GridIndex rows={rows} columns={columns} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default PreScholarshipVerifierIndex;
