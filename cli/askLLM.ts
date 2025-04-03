import axios from 'axios';
import { OPENROUTER_API_KEY, OPENROUTER_MODEL, MODEL } from './common';

export async function askLLM(prompt: string, useRemote: boolean): Promise<string> {
    if (useRemote && OPENROUTER_API_KEY) {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: OPENROUTER_MODEL,
            messages: [{ role: 'user', content: prompt }]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content.trim();
    } else {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: MODEL,
            prompt,
            stream: false
        });
        return response.data.response.trim();
    }
}
