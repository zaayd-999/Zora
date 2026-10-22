import { Box, Chip, Paper, Typography } from "@mui/material";
import type { Server } from "@/graphql/servers";

type ServerCardProps = {
  server: Server;
};

export default function ServerCard({ server }: ServerCardProps) {
  const isConnected = server.status === "CONNECTED";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: "#e4e7eb",
        borderRadius: 1,
        bgcolor: "background.paper",
        display: "grid",
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {server.name}
        </Typography>

        <Chip
          size="small"
          label={isConnected ? "Connected" : "Not connected"}
          color={isConnected ? "success" : "error"}
          variant="filled"
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        {server.host}
        {server.port ? `:${server.port}` : ""}
      </Typography>

      {server.serviceName && (
        <Typography variant="caption" color="text.secondary">
          Service: {server.serviceName}
        </Typography>
      )}
    </Paper>
  );
}
