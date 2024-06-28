import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/generate-interview', async (req, res) => {
  const { jobRole, industry, experienceLevel } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert in creating interview questions." },
        { role: "user", content: `Generate interview questions for a ${jobRole} in the ${industry} industry with ${experienceLevel} experience.` },
      ],
    });

    const generatedText = completion.choices[0].message.content;

    const questionsAndAnswers = generatedText.split('\n').map((qna) => {
      const parts = qna.split('Answer:');
      return {
        question: parts[0]?.trim() || 'No question provided',
        answer: parts[1]?.trim() || 'No answer provided'
      };
    });

    res.json({ questions: questionsAndAnswers });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
