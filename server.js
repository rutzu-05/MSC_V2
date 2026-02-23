const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Groq } = require('groq-sdk');

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configurar middlewares
app.use(cors());
app.use(express.json());

// Servir los archivos estáticos del frontend (index.html, JS, etc.)
app.use(express.static(__dirname));

// Inicializar cliente de Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Endpoint principal
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'El campo prompt es requerido' });
        }

        const messages = [];
        if (systemInstruction) {
            messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
        });

        const responseContent = chatCompletion.choices[0]?.message?.content;
        
        if (!responseContent) {
            throw new Error('Respuesta de la IA vacía');
        }

        res.json({ content: responseContent });
    } catch (error) {
        console.error('Error consultando Groq API:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al consultar Groq API',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor iniciado. Abre tu navegador en http://localhost:${port}`);
});
