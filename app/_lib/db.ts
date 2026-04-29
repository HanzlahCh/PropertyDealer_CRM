import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCached | undefined;
}

const cached: MongooseCached =
  global._mongoose || (global._mongoose = { conn: null, promise: null });

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, {
        bufferCommands: false,
      })
      .catch((error: unknown) => {
        cached.promise = null;

        if (error instanceof Error) {
          throw new Error(
            `Unable to connect to MongoDB at ${MONGODB_URI}: ${error.message}`
          );
        }

        throw new Error(`Unable to connect to MongoDB at ${MONGODB_URI}`);
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
