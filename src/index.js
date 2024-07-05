import "dotenv/config"
import connectDB from "./db/index.js"
import app from "./app.js";

const port = process.env.PORT || 3000;

connectDB()
.then(() => {
  app.on("error", (error) => {
    console.log("Error after DB connection and before listening: ", error);
    throw error;
  });

  app.listen(port, () => {
    console.log("Server running at port ", port);
  });
})
.catch((err) => {
  console.log("MongoDB Connection Failed: ", err);
})