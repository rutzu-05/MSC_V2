// MOTOR GROQ BLINDADO (Vía Backend)
async function callGroq(prompt, systemInstruction = "") {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, systemInstruction })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Error ${response.status}: ${errData.error?.message || errData.error || errData.details || "Rechazo del backend"}`);
        }

        const result = await response.json();
        return result.content;
    } catch (e) {
        console.error("Backend Fetch Error:", e);
        throw e; // Pasa el error a la función que lo llama
    }
}
