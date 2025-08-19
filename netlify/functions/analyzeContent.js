// File: netlify/functions/analyzeContent.js

// Per usare 'fetch' in un ambiente Node.js come le Netlify Functions,
// devi prima installare la dipendenza eseguendo: npm install node-fetch
const fetch = require('node-fetch');

/**
 * Questa è la funzione serverless che viene eseguita da Netlify.
 * Funge da intermediario sicuro per chiamare l'API di Gemini.
 *
 * @param {object} event - Contiene i dati della richiesta in arrivo (es. corpo, header).
 * @param {object} context - Contiene informazioni sul contesto di esecuzione.
 */
exports.handler = async function(event, context) {
  // --- 1. Sicurezza: Controlla la chiave API ---
  // La chiave API di Gemini viene letta in modo sicuro dalle variabili d'ambiente di Netlify.
  // NON deve mai essere scritta direttamente nel codice.
  const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

  // Se la chiave API non è configurata in Netlify, restituisce un errore.
  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'La chiave API di Gemini non è configurata sul server.' })
    };
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  // --- 2. Validazione: Controlla il Metodo della Richiesta ---
  // Accetta solo richieste di tipo POST per evitare accessi indesiderati.
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // 405 Method Not Allowed
      body: 'Metodo non consentito. Si prega di utilizzare POST.'
    };
  }

  try {
    // --- 3. Esecuzione: Chiama l'API di Gemini ---
    // Il corpo della richiesta (contenente il prompt) inviato dal frontend
    // viene inoltrato direttamente all'API di Gemini.
    const requestBody = event.body;

    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    // Se Gemini restituisce un errore, lo catturiamo e lo inoltriamo al frontend.
    if (!geminiResponse.ok) {
      const errorDetails = await geminiResponse.text();
      console.error('Errore dalla API di Gemini:', errorDetails);
      return {
        statusCode: geminiResponse.status,
        body: JSON.stringify({ error: 'Errore durante la comunicazione con l-API di Gemini.', details: errorDetails })
      };
    }

    const responseData = await geminiResponse.json();

    // --- 4. Risposta: Invia il risultato al Frontend ---
    // Invia la risposta di Gemini al componente React che ha effettuato la chiamata.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    // Gestisce eventuali errori di rete o di parsing.
    console.error('Errore imprevisto nella funzione serverless:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Si è verificato un errore interno del server.' }),
    };
  }
};
