import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import cookieParser from 'cookie-parser';
import userRouter from "./routes/user.js"
import connection from './config/db.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET, POST",
    credentials: true, // This is needed for accessing the API key from environment variables.
  }));

app.use(cookieParser());

app.use("/", userRouter);



const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  });
  
  const generationConfig = {
    temperature: 0.5,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  
  app.post("/generate-app", async (req, res) => {
    try {
      const {prompt} = req.body;
      console.log("prompt", prompt);
  
  
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });
  
  
      const result = await chatSession.sendMessage(prompt);
      const generatedText = result.response.text();
  
      console.log(generatedText);
        res.status(200).json({
        appStructure: generatedText,
     
      });
  
    } catch (error) {
      console.error("Error generating app structure:", error);
      res.status(500).json({ error: "Failed to generate app structure. Please try again later." });
    }
  });


app.listen(3032,async()=>{
  await connection
    console.log('Server running on port 3032')
 
})