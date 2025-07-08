import axios from 'axios';
import {
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
    MODEL,
    OPENROUTER_URL,
    LOCAL_LLM_URL
} from './common';

export async function askLLM(prompt: string, useRemote: boolean): Promise<string> {
    try {
        console.log(OPENROUTER_API_KEY ? 'Using remote LLM...' : 'Using local LLM...');
        if (useRemote && OPENROUTER_API_KEY) {
            console.log('Using OpenRouter API...');
            const response = await axios.post(OPENROUTER_URL, {
                model: OPENROUTER_MODEL,
                messages: [{ role: 'user', content: prompt }]
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }, method: 'POST'
            });
            return response.data.choices[0].message.content.trim();
        } else {
            console.log('Using Local LLM...');
            const response = await axios.post(LOCAL_LLM_URL, {
                model: MODEL,
                prompt,
                stream: false
            });
            return response.data.response.trim();
        }
    } catch (error) {
        console.error('Error in askLLM:', error);
        return 'Error: Unable to get a response from the LLM.';
    }
}
