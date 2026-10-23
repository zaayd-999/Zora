import { graphqlRequest } from "@/graphql/client";
import type { Server } from "@/graphql/servers";

export type DashboardOverview = {
  server: Server;
  databaseStatus: string | null;
  instanceStatus: string | null;
  databaseName: string | null;
  containerDatabase: boolean | null;
  pluggableDatabases: number | null;
  activeSessions: number | null;
  tablespaceAllocatedMb: number | null;
  tablespaceUsedMb: number | null;
  cpuPercent: number | null;
  sgaAllocatedMb: number | null;
  tablespaces: Array<{
    name: string;
    allocatedMb: number | null;
    usedMb: number | null;
    usagePercent: number | null;
  }>;
  cpuSamples: Array<{ capturedAt: string; cpuPercent: number }>;
  metricErrors: Array<{ metric: string; message: string }>;
};

const GET_DASHBOARD = /* GraphQL */ `
  query Dashboard($serverId: ID!, $range: String!) {
    dashboard(serverId: $serverId, range: $range) {
      server {
        id
        name
        host
        port
        serviceName
        username
        status
      }
      databaseStatus
      instanceStatus
      databaseName
      containerDatabase
      pluggableDatabases
      activeSessions
      tablespaceAllocatedMb
      tablespaceUsedMb
      cpuPercent
      sgaAllocatedMb
      tablespaces {
        name
        allocatedMb
        usedMb
        usagePercent
      }
      cpuSamples {
        capturedAt
        cpuPercent
      }
      metricErrors {
        metric
        message
      }
    }
  }
`;

export async function getDashboard(
  serverId: string,
  range: string,
): Promise<DashboardOverview> {
  const data = await graphqlRequest<{ dashboard: DashboardOverview }>(
    GET_DASHBOARD,
    { serverId, range },
  );

  return data.dashboard;
}
