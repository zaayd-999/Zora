import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import type { ServerInput } from "@/graphql/servers";
import { addServer } from "@/graphql/servers";

type AddServerDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdded: (state: "CONNECTED" | "NOT_CONNECTED") => void;
};

export default function AddServerDialog({
  open,
  onClose,
  onAdded,
}: AddServerDialogProps) {
  const [values, setValues] = useState({
    name: "",
    host: "",
    port: "1521",
    serviceName: "",
    username: "",
    password: "",
  });
  const [ submitting, setSubmitting ] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleConnect() {
    if (!values.name.trim() || !values.host.trim()) {
      setError("Server name and host are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const state = await addServer({
        name: values.name.trim(),
        host: values.host.trim(),
        port: values.port ? Number(values.port) : null,
        serviceName: values.serviceName.trim() || null,
        username: values.username.trim() || null,
        password: values.password || null,
      } satisfies ServerInput);

      setValues({
        name: "",
        host: "",
        port: "1521",
        serviceName: "",
        username: "",
        password: "",
      });
      onClose();
      onAdded(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add server.");
    } finally {
      setSubmitting(false);
    }
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
            value={values.name}
            onChange={(event) => setValue("name", event.target.value)}
          />

          <TextField
            label="IP address or hostname"
            placeholder="192.168.1.20"
            fullWidth
            value={values.host}
            onChange={(event) => setValue("host", event.target.value)}
          />

          <TextField
            label="Port"
            type="number"
            placeholder="1521"
            fullWidth
            value={values.port}
            onChange={(event) => setValue("port", event.target.value)}
          />

          <TextField
            label="Oracle service name"
            placeholder="FREEPDB1"
            fullWidth
            value={values.serviceName}
            onChange={(event) => setValue("serviceName", event.target.value)}
          />

          <TextField
            label="Username"
            fullWidth
            value={values.username}
            onChange={(event) => setValue("username", event.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={values.password}
            onChange={(event) => setValue("password", event.target.value)}
          />

          {error && (
            <Box sx={{ color: "error.main" }}>{error}</Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant="contained" onClick={handleConnect} disabled={submitting}>
          {submitting ? "Connecting…" : "Connect"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
