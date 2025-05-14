/*
  Personal AI Assistant Backend Server
  ------------------------------------
  Features:
  - Express.js server listening on PORT (default 3000).
  - POST /api/chat endpoint accepts JSON body with 'messages' array.
  - Forwards conversation to OpenAI Chat Completion API (gpt-3.5-turbo).
  - Returns assistant's reply as JSON.
  - Uses OPENAI_API_KEY from environment variables.
  - CORS enabled for frontend communication.
  
  Usage:
  1. Install dependencies: npm install express cors node-fetch dotenv
  2. Set environment variable OPENAI_API_KEY with your OpenAI API key.
  3. Run with: node server.js
*/

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable not set.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '\'messages\' field is required and must be an array.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error || 'OpenAI API error' });
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0].message) {
      return res.status(500).json({ error: 'Invalid response from OpenAI API' });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Make sure to set OPENAI_API_KEY in your environment variables.`);
});

