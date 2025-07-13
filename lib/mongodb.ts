import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the client is not re-instantiated on every hot-reload
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options)
    ;(global as any)._mongoClientPromise = client.connect()
  }
  clientPromise = (global as any)._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Test the connection and create indexes
clientPromise
  .then(async (client) => {
    console.log("✅ MongoDB connected successfully")

    const db = client.db("feedbackpro")

    // Test ping
    await db.admin().ping()
    console.log("✅ MongoDB ping successful")

    // Create indexes for better performance
    try {
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      await db.collection("accounts").createIndex({ provider: 1, providerAccountId: 1 }, { unique: true })
      await db.collection("sessions").createIndex({ sessionToken: 1 }, { unique: true })
      await db.collection("sessions").createIndex({ expires: 1 }, { expireAfterSeconds: 0 })
      console.log("✅ Database indexes created")
    } catch (error) {
      console.log("ℹ️ Database indexes already exist or error creating them:", error.message)
    }
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error)
  })

export default clientPromise
