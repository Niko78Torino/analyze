// File: netlify/functions/getAISuggestion.js

// Usiamo 'node-fetch' perché le funzioni Netlify girano in ambiente Node.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Controlla che la richiesta sia di tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    // Prende la chiave API segreta dalle variabili d'ambiente di Netlify
    const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: { message: 'La chiave API di Gemini non è configurata sul server.' } }),
      };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    // Chiama l'API di Gemini dal server
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
       console.error('Errore API Gemini:', data);
       return { statusCode: response.status, body: JSON.stringify(data) };
    }

    // Restituisce la risposta di Gemini al front-end
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Errore nella funzione Netlify:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: 'Impossibile elaborare la richiesta.' } }),
    };
  }
};