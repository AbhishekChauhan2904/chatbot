const http = require('http');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const PORT = 5001;

dotenv.config();

const requestListener = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end(); // Preflight check
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(data);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [{ role: 'user', content: message }],
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error?.message || 'GROQ API Error');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: responseData.choices[0].message.content.trim() }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
};

http.createServer(requestListener).listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);
