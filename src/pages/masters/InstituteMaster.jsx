import { useState, useEffect } from "react";
import { Tabs, Tab } from "@mui/material";
import OrganizationIndex from "../../containers/Organization/OrganizationIndex";
import SchoolIndex from "../../containers/indeces/SchoolIndex";
import JobtypeIndex from "../../containers/JobType/JobtypeIndex";
import EmptypeIndex from "../../containers/EmployeeType/EmptypeIndex";

import useBreadcrumbs from "../../hooks/useBreadcrumbs";

function InstituteMaster() {
  const [tab, setTab] = useState(0);

  const setCrumbs = useBreadcrumbs();

  useEffect(() => setCrumbs([{ name: "InstituteMaster" }]), []);

  const handleChange = (e, newValue) => {
    setTab(newValue);
  };

  return (
    <>
      <Tabs value={tab} onChange={handleChange}>
        <Tab value={0} label="Organization" />
        <Tab value={1} label="School" />
        <Tab value={2} label="Job Type" />
        <Tab value={3} label="EMP Type " />
      </Tabs>

      {tab === 0 && <OrganizationIndex />}
      {tab === 1 && <SchoolIndex />}
      {tab === 2 && <JobtypeIndex />}
      {tab === 3 && <EmptypeIndex />}
    </>
  );
}

export default InstituteMaster;