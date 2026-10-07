import { Box, Paper, Typography } from "@mui/material";

export default function ServersCard() {
  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        width: "100%",
        p: 3,
        borderColor: "#e4e7eb",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Servers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your server connections
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}