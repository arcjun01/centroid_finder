import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const paths = [
  process.env.VIDEOS_DIR,
  process.env.THUMBNAILS_DIR,
  process.env.RESULTS_DIR,
  process.env.JAR_PATH,
  process.env.JOBS_FILE
];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`${p} exists ✅`);
  } else {
    console.log(`${p} NOT found ❌`);
  }
});
