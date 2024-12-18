import app from "./src/app";
import { config } from "./src/config/config";
import connectDb from "./src/config/db";

const startServer = async () => {
  const port = config.port || 3000;
  //Connect database
  await connectDb();

  app.listen(port, () => {
    console.log(`Server runining on Port : ${port}..`);
  });
};

startServer();
