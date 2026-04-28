const fetch = require('node-fetch');
async function test() {
  try {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer agrega_tu_api_key_aqui',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            messages: [{ role: 'user', content: 'hola' }]
        }),
    });
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    console.log("Exito!");
  } catch(e) {
    console.error("[LLM ERROR]", e.message);
  }
}
test();
