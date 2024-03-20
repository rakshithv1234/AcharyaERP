import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import moment from "moment";

function ResultReport({ data }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Grid container rowSpacing={3} columnSpacing={3}>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader
              title="RESULT"
              titleTypographyProps={{ variant: "subtitle2" }}
              sx={{
                backgroundColor: "primary.main",
                color: "headerWhite.main",
                padding: 1,
              }}
            />
            <CardContent>
              <Grid container rowSpacing={1}>
                <Grid item xs={12} md={1.5}>
                  <Typography variant="subtitle2">Applicant Name</Typography>
                </Grid>
                <Grid item xs={12} md={10.5}>
                  <Typography variant="body2" color="textSecondary">
                    {data[0].firstname}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={1.5}>
                  <Typography variant="subtitle2">Email</Typography>
                </Grid>
                <Grid item xs={12} md={10.5}>
                  <Typography variant="body2" color="textSecondary">
                    {data[0].email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <Typography variant="subtitle2">Interview Date</Typography>
                </Grid>
                <Grid item xs={12} md={10.5}>
                  <Typography variant="body2" color="textSecondary">
                    {moment(data[0].frontend_use_datetime).format("DD-MM-YYYY")}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={1.5}>
                  <Typography variant="subtitle2">Status</Typography>
                </Grid>
                <Grid item xs={12} md={10.5}>
                  {data[0].approve === true ? (
                    <Typography variant="subtitle2" color="success.main">
                      Selected
                    </Typography>
                  ) : (
                    <Typography variant="subtitle2" color="error.main">
                      Rejected
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {data.map((val, i) => {
          return (
            <Grid item xs={12} md={4} key={i}>
              <Card elevation={3}>
                <CardContent>
                  <Grid container rowSpacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Interviewer</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {val.interviewer_name + " - " + val.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="success">
                        {val.interviewer_comments}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Grid container rowSpacing={1}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">HR</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {data[0].hr_name}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2">{data[0].hr_remarks}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ResultReport;
