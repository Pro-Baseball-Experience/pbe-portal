import { Client, QueryConfig, QueryResult } from "pg";
import { DatabaseQueryResult } from ".";

const initializeDB = (database: string | undefined): Client =>
  new Client({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database,
  });

const cardsDatabase: Client = initializeDB(
  process.env.NODE_ENV === "production" ? "cards_prod" : "cards_dev"
);

const usersDatabase: Client = initializeDB(
  process.env.NODE_ENV === "production" ? "users_prod" : "users_dev"
);

const getQueryFn =
  (db: Client) =>
  async <T>(query: QueryConfig): Promise<DatabaseQueryResult<T>> => {
    try {
      const queryResult: QueryResult = await db.query(query);
      await db.end();
      return { rows: queryResult.rows, total: queryResult.rowCount };
    } catch (error) {
      return { error };
    }
  };

export const cardsQuery = getQueryFn(cardsDatabase);
export const usersQuery = getQueryFn(usersDatabase);
