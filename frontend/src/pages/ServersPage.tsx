import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";

import AddServerDialog from "../components/AddServerDialog";
import ServersCard from "../components/ServersCard";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function ServersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);

  function toggleSidebar() {
    setIsSidebarOpen((open) => !open);
  }

  function openAddServer() {
    setIsAddServerOpen(true);
  }

  function closeAddServer() {
    setIsAddServerOpen(false);
  }

  return (
    <Box>
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <Box sx={{ display: "flex" }}>
        {isSidebarOpen && <Sidebar />}

        <Box
          component="main"
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
            onClick={openAddServer}
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
              "&:hover": {
                bgcolor: "#d96220",
                boxShadow: "none",
              },
            }}
          >
            Add server
          </Button>
        </Box>
      </Box>

      <AddServerDialog
        open={isAddServerOpen}
        onClose={closeAddServer}
      />
    </Box>
  );
}