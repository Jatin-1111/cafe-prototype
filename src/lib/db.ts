import "server-only";

import { MongoClient, type Db } from "mongodb";

/* ============================================================
   MongoDB connection.

   One client per process, cached on globalThis so Turbopack's hot
   reload in development does not open a new connection pool on every
   edit — Atlas will start refusing connections if it does.
   ============================================================ */

const DB_NAME = process.env.MONGODB_DB ?? "refections";

type Cache = { client?: Promise<MongoClient> };
const cache = globalThis as unknown as { __refectionsMongo?: Cache };

function connection(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and fill in the Atlas connection string.",
    );
  }

  const store = (cache.__refectionsMongo ??= {});

  store.client ??= new MongoClient(uri, {
    appName: "Cognify",
    // A cafe counter should fail fast and show it, not hang on a spinner.
    serverSelectionTimeoutMS: 8000,
    retryWrites: true,
  })
    .connect()
    .catch((error: unknown) => {
      // Never cache a failed connection. Without this, one bad password or a
      // momentary Atlas blip poisons the cache and every later request reuses
      // the rejected promise until the process restarts.
      if (store.client) delete store.client;
      throw error;
    });

  return store.client;
}

export async function getDb(): Promise<Db> {
  const client = await connection();
  return client.db(DB_NAME);
}

/** True when the connection string is present. Used to give a useful error, not to gate writes. */
export function isConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}
