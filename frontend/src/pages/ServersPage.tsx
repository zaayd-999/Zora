import { useCallback, useEffect, useState } from "react";
import { Box, Snackbar } from "@mui/material";

import AddServerDialog from "../components/AddServerDialog";
import ServersCard from "../components/ServersCard";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import type { Server } from "@/graphql/servers";
import { listServers } from "@/graphql/servers";

export default function ServersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshServers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setServers(await listServers());
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load servers",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshServers();
  }, [refreshServers]);

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
          }}
        >
          <ServersCard
            servers={servers}
            loading={isLoading}
            error={loadError}
            onAddServer={openAddServer}
          />
        </Box>
      </Box>

      <AddServerDialog
        open={isAddServerOpen}
        onClose={closeAddServer}
        onAdded={(state) => {
          setToastMessage(
            state === "CONNECTED"
              ? "Server added and connected successfully."
              : "Server added, but it could not be connected.",
          );
          void refreshServers();
        }}
      />

      <Snackbar
        open={toastMessage !== null}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
}
