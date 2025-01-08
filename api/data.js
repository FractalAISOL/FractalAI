import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGODB_URI || "";
const DB_NAME = "Fractal-ai";
const COLLECTION_NAME = "tsx";

function filterPostsByDate(posts, date) {
  const filterDate = new Date(date * 1000);
  return posts.filter((post) => new Date(post.timestamp * 1000) > filterDate);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "GET") {
    try {
      const client = new MongoClient(MONGO_URI);

      await client.connect();
      const database = client.db(DB_NAME);
      const collection = database.collection(COLLECTION_NAME);

      const messages = await collection.find().toArray();

      await client.close();

      const { date } = req.query;

      if (!date) {
        return res.status(200).json({
          data: messages,
        });
      } else {
        const filteredPosts = filterPostsByDate(messages, date);
        return res.status(200).json({
          data: filteredPosts,
        });
      }
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
}
