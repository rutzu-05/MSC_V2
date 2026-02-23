// MOTOR GROQ (Vía LocalStorage)
async function callGroq(prompt, systemInstruction = "") {
    const apiKey = localStorage.getItem('groqApiKey');

    if (!apiKey) {
        openSettingsModal();
        throw new Error("No has configurado tu API Key de Groq. Haz clic en el engranaje superior para agregarla.");
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";
    const payload = {
        model: "llama-3.1-8b-instant",
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        temperature: 0.3
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Error ${response.status}: ${errData.error?.message || "Rechazo de API"}`);
        }

        const result = await response.json();
        if (result.choices && result.choices.length > 0) {
            return result.choices[0].message.content;
        } else {
            throw new Error("Respuesta de la IA vacía");
        }
    } catch (e) {
        console.error("Groq Fetch Error:", e);
        throw e;
    }
}
