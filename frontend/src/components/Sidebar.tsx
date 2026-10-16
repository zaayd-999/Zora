import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Server, Settings } from "lucide-react";

function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        width: 224,
        flexShrink: 0,
        minHeight: "calc(100vh - 48px)",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        py: 2,
      }}
    >
      <Box component="nav" aria-label="Main navigation">
        <List disablePadding sx={{ px: 1.5, display: "grid", gap: 0.5 }}>
          <ListItemButton
            selected
            aria-current="page"
            sx={{
              minHeight: 42,
              borderRadius: 1,
              color: "#d96220",
              "&.Mui-selected": { bgcolor: "#fff1e8" },
              "&.Mui-selected:hover": { bgcolor: "#ffeadc" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <Server size={18} strokeWidth={1.8} />
            </ListItemIcon>
            <ListItemText
              primary="Servers"
              slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}
            />
          </ListItemButton>
          <ListItemButton
            sx={{
              minHeight: 42,
              borderRadius: 1,
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover", color: "text.primary" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <Settings size={18} strokeWidth={1.8} />
            </ListItemIcon>
            <ListItemText
              primary="Server settings"
              slotProps={{ primary: { sx: { fontSize: 14 } } }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
}

export default Sidebar;