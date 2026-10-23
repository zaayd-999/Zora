import { graphqlRequest } from "@/graphql/client";

export type TableColumnInput = {
  name: string;
  dataType: string;
};

export type UserCreationResult = {
  username: string;
  created: boolean;
  sessionAccessGranted: boolean;
  message: string;
};

const CREATE_ORACLE_TABLE = /* GraphQL */ `
  mutation CreateOracleTable(
    $serverId: ID!
    $tableName: String!
    $columns: [TableColumnInput!]!
    $adminPassword: String!
  ) {
    createOracleTable(
      serverId: $serverId
      tableName: $tableName
      columns: $columns
      adminPassword: $adminPassword
    ) {
      tableName
      created
    }
  }
`;

const CREATE_ORACLE_USER = /* GraphQL */ `
  mutation CreateOracleUser(
    $serverId: ID!
    $username: String!
    $password: String!
    $adminPassword: String!
  ) {
    createOracleUser(
      serverId: $serverId
      username: $username
      password: $password
      adminPassword: $adminPassword
    ) {
      username
      created
      sessionAccessGranted
      message
    }
  }
`;

export async function createOracleTable(
  serverId: string,
  tableName: string,
  columns: TableColumnInput[],
  adminPassword: string,
): Promise<{ tableName: string; created: boolean }> {
  const data = await graphqlRequest<{
    createOracleTable: { tableName: string; created: boolean };
  }>(CREATE_ORACLE_TABLE, { serverId, tableName, columns, adminPassword });

  return data.createOracleTable;
}

export async function createOracleUser(
  serverId: string,
  username: string,
  password: string,
  adminPassword: string,
): Promise<UserCreationResult> {
  const data = await graphqlRequest<{ createOracleUser: UserCreationResult }>(
    CREATE_ORACLE_USER,
    { serverId, username, password, adminPassword },
  );

  return data.createOracleUser;
}
