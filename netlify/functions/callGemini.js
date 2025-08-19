exports.handler = async function(event, context) {
  const { prompt } = JSON.parse(event.body);
  const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API Key non configurata.' }) };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
       const errorData = await response.json();
       return { statusCode: response.status, body: JSON.stringify(errorData) };
    }

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Errore interno.' }) };
  }
};