import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';

await connectDB();

app.listen(env.port, () => {
  console.log(`MoveMate API running on http://localhost:${env.port}`);
});