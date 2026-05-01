const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const SYSTEM_MSG = `Tu es Alex, conseiller commercial de WebPro. Tu aides les PME françaises à obtenir un site web professionnel + chatbot IA. Sois chaleureux, direct, vendeur. Réponds en 2-3 phrases max. Si intéressé, demande leur secteur et email. Ne mentionne jamais de technologie. Si la personne montre de l'intérêt, propose immédiatement une démo ou un devis.`;

app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages manquants' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_MSG }, ...messages],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(response.status).json({ error: 'Erreur API Groq', details: data });
    }

    res.json(data);

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ WebPro server running on port ${PORT}`));
