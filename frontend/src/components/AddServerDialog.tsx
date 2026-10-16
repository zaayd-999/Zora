import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

type AddServerDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function AddServerDialog({
  open,
  onClose,
}: AddServerDialogProps) {
  function handleConnect() {
    // Next step: validate the form and send your GraphQL mutation.
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="add-server-title"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="add-server-title">
        Add your Oracle server
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            label="Server name"
            placeholder="Development server"
            fullWidth
          />

          <TextField
            label="IP address or hostname"
            placeholder="192.168.1.20"
            fullWidth
          />

          <TextField
            label="Port"
            type="number"
            defaultValue={1521}
            fullWidth
          />

          <TextField
            label="Oracle service name"
            placeholder="FREEPDB1"
            fullWidth
          />

          <TextField label="Username" fullWidth />

          <TextField
            label="Password"
            type="password"
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant="contained" onClick={handleConnect}>
          Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
}