import { createApp } from "./src/app.ts";
import cors from "cors";
const app = createApp();
app.use(cors({ origin: "http://localhost:5173" }));
const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Broadcast API listening on port ${port}`);
});
