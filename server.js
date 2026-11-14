const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/report', async (req, res) => {
  const { username, email, category, description } = req.body;

  if (!username || !description) {
    return res.status(400).json({ error: 'Username and description are required.' });
  }

  const discordPayload = {
    embeds: [
      {
        title: `New Support Report: ${category || 'General'}`,
        color: 15158332,
        fields: [
          { name: 'User', value: username, inline: true },
          { name: 'Email', value: email || 'Not provided', inline: true },
          { name: 'Description', value: description }
        ],
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    if (!response.ok) {
      throw new Error('Failed to send webhook to Discord');
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'errors', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Support server running at http://localhost:${PORT}`);
});
