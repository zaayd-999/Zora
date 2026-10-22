import { graphqlRequest } from "@/graphql/client";

export type Server = {
  id: string;
  name: string;
  host: string;
  port: number | null;
  serviceName: string | null;
  username: string | null;
  status: "CONNECTED" | "NOT_CONNECTED";
};

export type ServerInput = {
  name: string;
  host: string;
  port?: number | null;
  serviceName?: string | null;
  username?: string | null;
  password?: string | null;
};

const SELECT_SERVER_FIELDS = /* GraphQL */ `
  id
  name
  host
  port
  serviceName
  username
  status
`;

const LIST_SERVERS = /* GraphQL */ `
  query Servers {
    servers {
      ${SELECT_SERVER_FIELDS}
    }
  }
`;

const ADD_SERVER = /* GraphQL */ `
  mutation AddServer($input: ServerInput!) {
    addServer(input: $input) {
      id
      name
      status
    }
  }
`;

export async function listServers(): Promise<Server[]> {
  const data = await graphqlRequest<{
    servers: Server[];
  }>(LIST_SERVERS);

  return data.servers ?? [];
}

export async function addServer(
  input: ServerInput,
): Promise<"CONNECTED" | "NOT_CONNECTED"> {
  const data = await graphqlRequest<{
    addServer: { id: string; name: string; status: Server["status"] };
  }>(ADD_SERVER, { input });

  return data.addServer.status;
}
