import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Plus, UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createOracleTable, createOracleUser } from "@/graphql/administration";
import { listServers, type Server } from "@/graphql/servers";

type Tab = "table" | "user";
type Column = { name: string; dataType: string };

const tableTypes = ["NUMBER", "VARCHAR2(255)", "DATE", "TIMESTAMP", "CLOB"];
const isOracleIdentifier = (value: string) => /^[A-Za-z][A-Za-z0-9_]{0,29}$/.test(value);

export default function AdministrationPage({ initialTab = "table" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [servers, setServers] = useState<Server[]>([]);
  const [serverId, setServerId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loadingServers, setLoadingServers] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    listServers()
      .then((items) => {
        if (!current) return;
        setServers(items);
        setServerId((selected) =>
          items.some((server) => server.id === selected) ? selected : items[0]?.id ?? "",
        );
      })
      .catch((error: unknown) => {
        if (current) {
          setServerError(error instanceof Error ? error.message : "Could not load Oracle servers.");
        }
      })
      .finally(() => {
        if (current) setLoadingServers(false);
      });
    return () => {
      current = false;
    };
  }, []);

  const selectedServer = servers.find((server) => server.id === serverId);

  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 3, lg: 6 }, color: "#202124" }}>
      <Typography color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>
        Oracle workspace / Administration
      </Typography>
      <Typography component="h1" sx={{ fontSize: 30, fontWeight: 600, mb: 1 }}>
        Administration
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Create schema tables and database users on a connected Oracle service.
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        <TextField
          select
          fullWidth
          label="Oracle server"
          value={serverId}
          onChange={(event) => {
            setServerId(event.target.value);
            setAdminPassword("");
          }}
          disabled={loadingServers || servers.length === 0}
          sx={{ mb: 3 }}
        >
          {servers.map((server) => (
            <MenuItem key={server.id} value={server.id}>
              {server.name} — {server.host}:{server.port ?? 1521}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          type="password"
          label="Re-enter Oracle administrator password"
          value={adminPassword}
          onChange={(event) => setAdminPassword(event.target.value)}
          autoComplete="current-password"
          helperText="Used only to authorize this operation and is not saved by the page."
          sx={{ mb: 3 }}
        />

        {!loadingServers && servers.length === 0 && !serverError && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Add an Oracle server before creating tables or users.
          </Alert>
        )}

        <Box role="tablist" aria-label="Administration actions" sx={{ display: "flex", gap: 1, mb: 3 }}>
          <Button
            role="tab"
            aria-selected={tab === "table"}
            onClick={() => setTab("table")}
            startIcon={<Plus size={16} />}
            sx={{ textTransform: "none", color: tab === "table" ? "#bd4937" : "#62656c", bgcolor: tab === "table" ? "#fff0eb" : "transparent" }}
          >
            Create table
          </Button>
          <Button
            role="tab"
            aria-selected={tab === "user"}
            onClick={() => setTab("user")}
            startIcon={<UserPlus size={16} />}
            sx={{ textTransform: "none", color: tab === "user" ? "#bd4937" : "#62656c", bgcolor: tab === "user" ? "#fff0eb" : "transparent" }}
          >
            Create user
          </Button>
        </Box>

        {tab === "table" ? (
          <CreateTableForm
            serverId={serverId}
            adminPassword={adminPassword}
            serverName={selectedServer?.name ?? ""}
          />
        ) : (
          <CreateUserForm
            serverId={serverId}
            adminPassword={adminPassword}
            serverName={selectedServer?.name ?? ""}
          />
        )}
      </Paper>
    </Box>
  );
}

function CreateTableForm({
  serverId,
  adminPassword,
  serverName,
}: {
  serverId: string;
  adminPassword: string;
  serverName: string;
}) {
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<Column[]>([{ name: "id", dataType: "NUMBER" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const columnsValid =
    columns.length > 0 &&
    columns.length <= 50 &&
    columns.every((column) => isOracleIdentifier(column.name) && tableTypes.includes(column.dataType)) &&
    new Set(columns.map((column) => column.name.toUpperCase())).size === columns.length;
  const valid = Boolean(serverId && adminPassword) && isOracleIdentifier(tableName) && columnsValid;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createOracleTable(serverId, tableName, columns, adminPassword);
      setSuccess(`Table ${result.tableName} was created on ${serverName}.`);
      setTableName("");
      setColumns([{ name: "id", dataType: "NUMBER" }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Table creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
        Create schema table
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        The selected Oracle account must have CREATE TABLE privilege. Tables are created in that account&apos;s current schema.
      </Alert>
      <TextField
        fullWidth
        label="Table name"
        value={tableName}
        onChange={(event) => setTableName(event.target.value)}
        error={tableName.length > 0 && !isOracleIdentifier(tableName)}
        helperText="Start with a letter; use letters, numbers or underscores (up to 30 characters)."
        sx={{ mb: 3 }}
      />
      <Typography sx={{ fontWeight: 600, mb: 1.5 }}>Columns</Typography>
      {columns.map((column, index) => (
        <Box key={index} sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
          <TextField
            label="Column name"
            value={column.name}
            error={column.name.length > 0 && !isOracleIdentifier(column.name)}
            onChange={(event) => {
              const name = event.target.value;
              setColumns((current) => current.map((item, columnIndex) =>
                columnIndex === index ? { ...item, name } : item,
              ));
            }}
            sx={{ flex: 1, minWidth: 160 }}
          />
          <TextField
            select
            label="Data type"
            value={column.dataType}
            onChange={(event) => {
              const dataType = event.target.value;
              setColumns((current) => current.map((item, columnIndex) =>
                columnIndex === index ? { ...item, dataType } : item,
              ));
            }}
            sx={{ minWidth: 180 }}
          >
            {tableTypes.map((dataType) => (
              <MenuItem key={dataType} value={dataType}>{dataType}</MenuItem>
            ))}
          </TextField>
          <Button
            type="button"
            disabled={columns.length === 1}
            onClick={() => setColumns((current) => current.filter((_, columnIndex) => columnIndex !== index))}
          >
            Remove
          </Button>
        </Box>
      ))}
      <Button
        type="button"
        startIcon={<Plus size={16} />}
        disabled={columns.length >= 50}
        onClick={() => setColumns((current) => [...current, { name: "", dataType: "VARCHAR2(255)" }])}
        sx={{ mb: 2, textTransform: "none" }}
      >
        Add column
      </Button>
      {!columnsValid && columns.length > 1 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Column names must be valid and unique. A table can have at most 50 columns.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Button type="submit" variant="contained" disabled={!valid || submitting} sx={{ textTransform: "none" }}>
        {submitting ? "Creating table…" : "Create table"}
      </Button>
    </Box>
  );
}

function CreateUserForm({
  serverId,
  adminPassword,
  serverName,
}: {
  serverId: string;
  adminPassword: string;
  serverName: string;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [successSeverity, setSuccessSeverity] = useState<"success" | "warning">("success");
  const usernameValid = isOracleIdentifier(username);
  const passwordValid = password.length >= 12 && !/[\u0000-\u001f\u007f]/.test(password);
  const valid = Boolean(serverId && adminPassword) && usernameValid && passwordValid && password === confirmPassword;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createOracleUser(serverId, username, password, adminPassword);
      setSuccess(`${result.message} ${result.sessionAccessGranted ? `Created on ${serverName}.` : ""}`);
      setSuccessSeverity(result.sessionAccessGranted ? "success" : "warning");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "User creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
        Create database user
      </Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>
        The selected Oracle account must have CREATE USER privilege. New accounts receive CREATE SESSION only; no elevated roles are granted.
      </Alert>
      <Box sx={{ display: "grid", gap: 2, maxWidth: 560 }}>
        <TextField
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={username.length > 0 && !usernameValid}
          helperText="Start with a letter; use letters, numbers or underscores (up to 30 characters)."
          autoComplete="off"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={password.length > 0 && !passwordValid}
          helperText="Use at least 12 characters and avoid control characters."
          autoComplete="new-password"
        />
        <TextField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={confirmPassword.length > 0 && password !== confirmPassword}
          helperText={confirmPassword.length > 0 && password !== confirmPassword ? "Passwords do not match." : ""}
          autoComplete="new-password"
        />
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity={successSeverity} sx={{ mt: 2 }}>{success}</Alert>}
      <Button
        type="submit"
        variant="contained"
        disabled={!valid || submitting}
        startIcon={<UserPlus size={16} />}
        sx={{ mt: 2, textTransform: "none" }}
      >
        {submitting ? "Creating user…" : "Create user"}
      </Button>
    </Box>
  );
}
