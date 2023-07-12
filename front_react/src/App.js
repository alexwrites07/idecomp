import axios from 'axios';
import './App.css';
// import React, {useState} from "react"
import stubs from "./defaultStubs";
import React, { useState, useEffect } from "react";
// import Editor from './index'
import CodeMirror from '@uiw/react-codemirror';
// import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/lib/codemirror.js'
import { sublime } from '@uiw/codemirror-theme-sublime';
import { cpp } from '@codemirror/lang-cpp';
import moment from 'moment'
//  import { cpp } from '@uiw/react-codemirror/lang-cpp';

function App(){
const [code, setCode]=useState('');
const [output, setOutput]=useState("");
const [language, setLanguage] = useState("cpp");
const [jobId, setJobId] = useState(null);
const [status, setStatus] = useState(null);
const [jobDetails, setJobDetails] = useState(null);
const [input, setInput] = useState("");



// const handleSubmit = async ()=>{
//   const payload = {
//     language,
//     code
// };
// try{
// const {data} = await axios.post("http://localhost:5003/run", payload);
// setOutput(data.jobId);
// }
// catch({response}){
//   if (response){

//      const errMsg = response.data.err.stderr;
//         setOutput(errMsg);}
//     else
//     {
//       setOutput("server issue");
//     }
//   }
// };
useEffect(() => {
  setCode(stubs[language]);
}, [language]);

useEffect(() => {
  const defaultLang = localStorage.getItem("default-language") || "cpp";
  setLanguage(defaultLang);
}, []);
let pollInterval,kll;
const handleSubmit = async () => {
  const payload = {
    language,
    code,
    input,
  };
  try {
    setOutput("");
    setStatus(null);
    setJobId(null);
    setJobDetails(null);
    const { data } = await axios.post("https://react-one.onrender.com/run", payload);
    if (data.jobId) {
      setJobId(data.jobId);
      setStatus("Submitted.");
      
      // poll here
      //  kll=setInterval({df},1000);
      pollInterval = setInterval(async () => {
        const { data: statusRes } = await axios.get(
          `https://react-one.onrender.com/status`,
          {
            params: {
              id: data.jobId,
            },
          }
        );
        const { success, job, error } = statusRes;
         console.log(statusRes);
       
        if (success) {
          const { status: jobStatus, output: jobOutput } = job;
           setStatus(jobStatus); 
          // df(jobstatus);
          setJobDetails(job);
          if (jobStatus === "pending") return;
          setOutput(jobOutput);
          clearInterval(pollInterval);
        } else {
          console.error(error);
          setOutput(error);
          setStatus("Bad request");
          clearInterval(pollInterval);
        }
      }, 1000);
    } else {
      setOutput("Retry again.");
    }
  } catch ({ response }) {
    if (response) {
      const errMsg = response.data.err.stderr;
      setOutput(errMsg);
    } else {
      setOutput("Please retry submitting.");
    }
  }
};
  const renderTimeDetails = () => {
    if (!jobDetails) {
      return "";
    }
    let { submittedAt, startedAt, completedAt } = jobDetails;
    let result = "";
    submittedAt = moment(submittedAt).toString();
    // result += `Job Submitted At: ${submittedAt}  `;
    if (!startedAt || !completedAt) return result;
    const start = moment(startedAt);
    const end = moment(completedAt);
    const diff = end.diff(start, "seconds", true);
    result += `Execution Time: ${diff}s`;
    return result;
  };

// const df =async ({status}) => {
//   if ({status}==="success")
//   alert(<p style={{color:"green"}}>"SUCCESS"</p>);
//    else
//    alert(<p style={{color:"red"}}>{status}
//   </p>);
// };
// var cEditor = CodeMirror.fromTextArea(document.getElementById("kl"), {
//   lineNumbers: true,
//   matchBrackets: true,
//   mode: "text/x-csrc",
//   readOnly: true,
//   styleActiveLine: true,
//   theme: "eclipse"
// })
return (
  <div className ="App">
    <h1>Online Code Editor</h1>
    <span className="po">
        <label>Language:</label>
        <select
        
          value={language}
          onChange={(e) => {
            // const shouldSwitch = window.confirm(
            //   "Are you sure you want to change language? WARNING: Your current code will be lost."
            // );
            // if (shouldSwitch) {
              setLanguage(e.target.value);
              console.log(e.target.value);
            // }
          }}
          >
          <option value="cpp">C++</option>
        <option value="py">Python</option>
        
      
        </select>
        <br></br><br></br>
        
      
      
    {/* <textarea class="kl" rows ="25" cols ="85" value ={code} onChange={(e)=>{
      setCode(e.target.value)
    }}></textarea> */}
    {/* <div className="kl">
    <CodeMirror
value={code}
options={{
  theme: 'dracula',
   keyMap: 'sublime',
 
  mode: 'cpp',
}}
// value="console.log('hello world!');"
//       height="200px"
//       extensions={[cpp({ cpp: true })]}
onChange={(editor, data, value) => {
  setCode(editor);
}}
// className="kl"
className="w-96 h-80"
/>
     
      </div> */}

  {/* <textarea class="kl" rows ="5" cols ="8" value ={input} onChange={(e)=>{
      setInput(e.target.value)
    }}></textarea> */}
    {/* </span> */}

    {/* <textarea class="hj" rows ="10" cols ="20" value ={code} onChange={(e)=>{
      setInput(e.target.value)
    }}></textarea> */}
    {/* <span ClassName="qw"> */}
    <CodeMirror
      value={code}
      height="350px"
      width="650px"
      theme={sublime}
      extensions={[cpp({ cpp: true })]}
      onChange={(value, viewUpdate) => {
        setCode(value);
      }}
    />
    {/* </span> */}
    </span>
    

    
    
    <span className="gh">
     
      <p className="kk">{status==="success" ? <strong>{status}</strong>:"" }</p>
      <p className="jj">{status==="pending" ? <em>{status}</em>:"" }</p>
      <p className="ll">{status==="error" ? <em>{status}</em>:"" }</p>
      <p>{jobId ? `Your Code ID: ${jobId}` : ""}</p>
      <p>{renderTimeDetails()}</p>
      <p>{output}</p>
  </span>
  
  <div><button className="ff" onClick={handleSubmit}>Submit</button></div>
</div>

)};
 
export default App;
// http://localhost:5099/run
// http://localhost:3002/
