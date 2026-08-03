import { createApp } from "./src/app.ts";
import { env } from "./src/config/env.ts";
import { getAggregationStatus } from "./src/services/favorites.ts";


const app = createApp();
const port = env.port;

app.listen(port, () => {
  console.log(`Broadcast API listening on port ${port}`);
});

const aggregationStatusTimer = setInterval(() => {
  const status = getAggregationStatus();
  console.log(
    `[server] aggregation ${status.processing ? "processing" : "idle"}; pending=${status.pendingEvents}; progress=${status.currentBatchProgress}/${status.currentBatchSize}`,
  );
}, 30_000);
aggregationStatusTimer.unref?.();
