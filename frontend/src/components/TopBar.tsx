import {
  Box,
  IconButton,
  InputBase,
  Avatar,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import StorageIcon from "@mui/icons-material/Storage";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";

export default function TopBar() {
  return (
    <Box
      sx={{
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Left side */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <StorageIcon fontSize="small" />

        <Typography sx={{ fontWeight: 600 }}>
          ZOra
        </Typography>
      </Box>

      {/* Right side */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            px: 1,
            width: 220,
          }}
        >
          <SearchIcon fontSize="small" />

          <InputBase
            placeholder="Search For Your Server..."
            sx={{
              ml: 1,
              flex: 1,
              fontSize: 14,
            }}
          />
        </Box>

        <IconButton size="small">
          <HelpOutlineIcon fontSize="small" />
        </IconButton>

        <IconButton size="small">
          <NotificationsNoneIcon fontSize="small" />
        </IconButton>

        <Avatar
          sx={{
            width: 30,
            height: 32,
            fontSize: 13,
          }}
        >
          A
        </Avatar>
      </Box>
    </Box>
  );
}