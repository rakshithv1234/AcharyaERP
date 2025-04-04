import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Box, Grid, Button, CircularProgress } from "@mui/material";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import CustomSelect from "../../../components/Inputs/CustomSelect";
import FormWrapper from "../../../components/FormWrapper";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import axios from "../../../services/Api";
import CustomRadioButtons from "../../../components/Inputs/CustomRadioButtons";

const initialValues = {
  submenuName: "",
  description: "",
  menuId: "",
  status: "",
  submenuUrl: "",
  mask: false,
};

const requiredFields = [
  "submenuName",
  "description",
  "menuId",
  "status",
  "submenuUrl",
];

const maskList = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

function SubmenuForm() {
  const [isNew, setIsNew] = useState(true);
  const [menuOptions, setMenuOptions] = useState([]);
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const { pathname } = useLocation();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const { id } = useParams();
  const { setAlertMessage, setAlertOpen } = useAlert();

  const checks = {
    submenuName: [values.submenuName !== ""],
    submenuUrl: [values.submenuUrl !== ""],
    description: [values.description.length !== 0],
  };

  const errorMessages = {
    submenuName: ["This field required"],
    submenuUrl: ["This field required"],
    description: ["This field is required"],
  };

  useEffect(() => {
    getMenuOptions();

    if (pathname.toLowerCase() === "/navigationmaster/submenu/new") {
      setIsNew(true);
      setCrumbs([
        { name: "Navigation Master", link: "/NavigationMaster/Submenu" },
        { name: "Submenu" },
        { name: "Create" },
      ]);
    } else {
      setIsNew(false);
      getSubmenuData();
    }
  }, []);

  function getMenuOptions() {
    axios
      .get(`/api/MenuForSubmenu`)
      .then((res) => {
        setMenuOptions(
          res.data.data.map((obj) => ({
            value: obj.menu_id,
            label: obj.menu_module_name,
          }))
        );
      })
      .catch((err) => console.error(err));
  }

  const getSubmenuData = async () => {
    axios
      .get(`/api/SubMenu/${id}`)
      .then((res) => {
        setValues({
          submenuName: res.data.data.submenu_name,
          description: res.data.data.submenu_desc,
          menuId: res.data.data.menu_id,
          status: res.data.data.status,
          submenuUrl: res.data.data.submenu_url,
          mask: res.data.data.mask,
        });
        setData(res.data.data);
        setCrumbs([
          { name: "Navigation Master", link: "/NavigationMaster/Submenu" },
          { name: "Submenu" },
          { name: "Update" },
          { name: res.data.data.submenu_name },
        ]);
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleChangeAdvance = (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
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

  const handleCreate = async () => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill all required fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);
      const temp = {};
      temp.active = true;
      temp.submenu_name = values.submenuName;
      temp.submenu_desc = values.description;
      temp.menu_id = values.menuId;
      temp.status = values.status;
      temp.submenu_url = values.submenuUrl;
      temp.mask = values.mask;
      await axios
        .post(`/api/SubMenu`, temp)
        .then((res) => {
          setLoading(false);
          if (res.status === 200 || res.status === 201) {
            navigate("/NavigationMaster/Submenu", { replace: true });
            setAlertMessage({
              severity: "success",
              message: "Submenu created",
            });
          } else {
            setAlertMessage({
              severity: "error",
              message: res.data ? res.data.message : "An error occured",
            });
          }
          setAlertOpen(true);
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
    }
  };

  const handleUpdate = async () => {
    if (!requiredFieldsValid()) {
      setAlertMessage({
        severity: "error",
        message: "Please fill required fields",
      });
      setAlertOpen(true);
    } else {
      setLoading(true);
      const temp = { ...data };
      temp.submenu_name = values.submenuName;
      temp.submenu_desc = values.description;
      temp.menu_id = values.menuId;
      temp.status = values.status;
      temp.submenu_url = values.submenuUrl;
      temp.mask = values.mask;
      await axios
        .put(`/api/SubMenu/${id}`, temp)
        .then((res) => {
          setLoading(false);
          if (res.status === 200 || res.status === 201) {
            navigate("/NavigationMaster/Submenu", { replace: true });
            setAlertMessage({
              severity: "success",
              message: "Submenu updated",
            });
          } else {
            setAlertMessage({
              severity: "error",
              message: res.data ? res.data.message : "An error occured",
            });
          }
          setAlertOpen(true);
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
    }
  };

  const handleChangeOptional = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Box component="form" overflow="hidden" p={1}>
      <FormWrapper>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          rowSpacing={2}
          columnSpacing={{ xs: 2, md: 4 }}
        >
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="submenuName"
              label="Submenu"
              value={values.submenuName}
              handleChange={handleChange}
              checks={checks.submenuName}
              errors={errorMessages.submenuName}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              name="menuId"
              label="Menu"
              value={values.menuId}
              options={menuOptions}
              handleChangeAdvance={handleChangeAdvance}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="submenuUrl"
              label="New Url"
              value={values.submenuUrl}
              handleChange={handleChange}
              checks={checks.submenuUrl}
              errors={errorMessages.submenuUrl}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Status"
              name="status"
              value={values.status}
              handleChange={handleChange}
              items={[
                {
                  value: "Under Maintainence",
                  label: "Under Maintainence",
                },
                { value: "Blocked", label: "Blocked" },
                { value: "Access Denied", label: "Access Denied" },
                { value: "Working", label: "Working" },
              ]}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              multiline
              rows={4}
              name="description"
              label="Description"
              value={values.description}
              handleChange={handleChange}
              checks={checks.description}
              errors={errorMessages.description}
              required
            />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <CustomRadioButtons
              name="mask"
              label="Mask Submenu"
              value={values.mask}
              items={maskList}
              handleChange={handleChangeOptional}
              required
            />
          </Grid>

          <Grid item xs={12} textAlign="right">
            <Button
              style={{ borderRadius: 7 }}
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={isNew ? handleCreate : handleUpdate}
            >
              {loading ? (
                <CircularProgress
                  size={25}
                  color="blue"
                  style={{ margin: "2px 13px" }}
                />
              ) : (
                <strong>{isNew ? "Create" : "Update"}</strong>
              )}
            </Button>
          </Grid>
        </Grid>
      </FormWrapper>
    </Box>
  );
}

export default SubmenuForm;
