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
        { role: "user", content: `Generate interview questions and their answers for a ${jobRole} in the ${industry} industry with ${experienceLevel} experience. Format each pair as "Question: [question here] Answer: [answer here]" separated by a newline for each pair.` },
      ],
    });

    const generatedText = completion.choices[0].message.content;

    // Split the generatedText into individual question-answer pairs
    const questionsAndAnswers = generatedText.split('\n').reduce((acc, line) => {
      const questionMatch = line.match(/Question:\s*(.*)/);
      const answerMatch = line.match(/Answer:\s*(.*)/);

      if (questionMatch) {
        acc.push({ question: questionMatch[1], answer: '' });
      } else if (answerMatch && acc.length > 0) {
        acc[acc.length - 1].answer = answerMatch[1];
      }

      return acc;
    }, []);

    res.json({ questions: questionsAndAnswers });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
