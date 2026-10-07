import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import ServersCard from "./components/ServersCard";

function App() {
  return (
    <Box>
      <TopBar />

      <Box sx={{ display: "flex" }}>
        <Sidebar />

        <Box
          sx={{
            flex: 1,
            p: 3,
            minWidth: 0,
            minHeight: "calc(100vh - 48px)",
            position: "relative",
          }}
        >
          <ServersCard />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "#ed762f",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 1,
              px: 2,
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": { bgcolor: "#d96220", boxShadow: "none" },
            }}
          >
            ADD SERVER
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default App;