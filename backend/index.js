require("dotenv").config(); // Add this at the very top
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Job = require("./models/Job");

var compiler = require('compilex');
var options = { stats: true };
compiler.init(options);

main().catch(err => console.log(err));

async function main() {
  // MongoDB Atlas connection using environment variable
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("You are connected to MongoDB Atlas");
}

const { generateFile } = require("./generateFile");
const { addJobToQueue } = require("./jobQueue");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/run", async (req, res) => {
  const { language = "cpp", code, input } = req.body;

  if (!code) return res.status(400).json({ success: false, error: "Empty code body!" });

  const filepath = await generateFile(language, code);

  // Save job in the database
  const job = await new Job({ language, filepath, status: "pending" }).save();
  const jobId = job["_id"];
  addJobToQueue(jobId);
  res.status(201).json({ jobId });

  // JDoodle API
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  const langMap = {
    cpp: { language: "cpp17", versionIndex: "0" },
    python: { language: "python3", versionIndex: "3" },
  };
  const jdoodleLang = langMap[language] || langMap["cpp"];

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId,
      clientSecret,
      script: code,
      stdin: input || "",
      language: jdoodleLang.language,
      versionIndex: jdoodleLang.versionIndex,
    });
    await Job.findByIdAndUpdate(jobId, {
      status: "success",
      output: response.data.output,
      completedAt: new Date(),
    });
  } catch (err) {
    await Job.findByIdAndUpdate(jobId, {
      status: "error",
      output: err.message,
      completedAt: new Date(),
    });
  }
});

app.get("/status", async (req, res) => {
  const jobId = req.query.id;

  if (!jobId) return res.status(400).json({ success: false, error: "Missing id query param" });

  const job = await Job.findById(jobId);
  if (!job) return res.status(400).json({ success: false, error: "Couldn't find job" });

  return res.status(200).json({ success: true, job });
});

app.listen(process.env.PORT || 5006, () => {
  console.log(`Listening on port ${process.env.PORT || 5006}!`);
});
