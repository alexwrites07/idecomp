const express = require("express");

const cors = require("cors");
const mongoose = require("mongoose");
const Job = require("./models/Job");
// main().catch(err => console.log(err));

var compiler = require('compilex');
var options = {stats : true}; //prints stats on console 
compiler.init(options);

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1/test');
  (err) => {
    if (err){
    console.error(err);
    process.exit(1);
    // err && console.error(err);
    // console.log("Successfully connected to MongoDB: compilerdb");
  }
  console.log("You are connected to MongoDB");
}
};
// getting-started.js
// const mongoose = require('mongoose');

// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/test');

//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }

const { generateFile } = require("./generateFile");

const { addJobToQueue } = require("./jobQueue");
// const Job = require("./models/Job");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/run", async (req, res) => {
  const { language = "cpp", code,input } = req.body;

  console.log(language, "Length:", code.length);

  // var envData = { OS : "windows" , cmd : "g++"};
  // compiler.compileCPPWithInput( envData, code , input , function (data) {
  //  console.log(data.output);
  // });



  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }
  // need to generate a c++ file with content from the request
  const filepath = await generateFile(language, code);
  // const acc = await ac(input);
  // write into DB
  const job = await new Job({ language, filepath }).save();
  const jobId = job["_id"];
  addJobToQueue(jobId);
  res.status(201).json({ jobId });
});

app.get("/status", async (req, res) => {
  const jobId = req.query.id;

  if (jobId === undefined) {
    return res
      .status(400)
      .json({ success: false, error: "missing id query param" });
  }

  const job = await Job.findById(jobId);

  if (job === undefined) {
    return res.status(400).json({ success: false, error: "couldn't find job" });
  }

  return res.status(200).json({ success: true, job });
});
// return res.json({hello : "world"});});
//   const jobId = req.query.id;

//   if (jobId === undefined) {
//     return res
//       .status(400)
//       .json({ success: false, error: "missing id query param" });
//   }

//   const job = await Job.findById(jobId);

//   if (job === undefined) {
//     return res.status(400).json({ success: false, error: "couldn't find job" });
//   }

//   return res.status(200).json({ success: true, job });

// });

app.listen(5006, () => {
  console.log(`Listening on port 5000!`);
});