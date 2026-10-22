import { Box, Button, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { Server } from "@/graphql/servers";
import ServerCard from "@/components/ServerCard";

type ServersCardProps = {
  servers: Server[];
  loading: boolean;
  error: string | null;
  onAddServer: () => void;
};

export default function ServersCard({
  servers,
  loading,
  error,
  onAddServer,
}: ServersCardProps) {
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
          alignItems: "center",
          justifyContent: "space-between",
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

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddServer}
          sx={{
            bgcolor: "#ed762f",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 1,
            whiteSpace: "nowrap",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#d96220",
              boxShadow: "none",
            },
          }}
        >
          Add server
        </Button>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}
      >
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading servers…
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        {!loading && !error && servers.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No servers yet — add your first Oracle server.
          </Typography>
        )}

        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </Box>

      <Button href="#/oracle" sx={{ mt: 2, color: '#d96220', textTransform: 'none' }}>Open Oracle workspace</Button>
    </Paper>
  );
}
