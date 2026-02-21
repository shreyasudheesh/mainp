import Groq from 'groq-sdk';

// Lazy-init: only create the client when actually needed, not at import time
let groq = null;

function getGroqClient() {
    if (!groq) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            throw new Error('GROQ_API_KEY is not configured. Please set it in your .env file.');
        }
        groq = new Groq({ apiKey });
    }
    return groq;
}

/**
 * Analyze a medicine image using Groq's vision-capable LLM
 * @param {string} base64Image - Base64-encoded image data
 * @param {string} mimeType - MIME type of the image
 * @returns {object} Analysis result
 */
export async function recognizeMedicine(base64Image, mimeType) {
    const prompt = `You are a pharmaceutical expert assistant. Analyze this medicine image carefully and provide the following information in a structured JSON format:

{
  "medicine_name": "Name of the medicine (brand name and generic name if visible)",
  "manufacturer": "Manufacturer name if visible",
  "dosage": "Dosage information (e.g., 500mg, 10mg/5ml)",
  "form": "Form of medicine (tablet, capsule, syrup, cream, etc.)",
  "purpose": "What this medicine is commonly used for (brief description)",
  "active_ingredients": "List of active ingredients if visible",
  "usage_instructions": "How to take/use this medicine",
  "side_effects": "Common side effects to be aware of",
  "warnings": "Important warnings or precautions",
  "expiry_date": "Expiry date if visible on the package (format: YYYY-MM-DD or 'not visible')",
  "is_expired": "true/false/unknown - based on expiry date compared to current date",
  "extracted_text": "All readable text from the medicine packaging",
  "confidence": "high/medium/low - your confidence in the analysis"
}

IMPORTANT: 
- If you cannot determine certain fields, use "not visible" or "unknown"
- Always provide the purpose/usage even if you need to infer from the medicine name
- Check expiry date against today's date (${new Date().toISOString().split('T')[0]})
- Extract ALL visible text from the packaging
- Return ONLY valid JSON, no markdown formatting`;

    try {
        const client = getGroqClient();
        const response = await client.chat.completions.create({
            model: 'llama-3.2-90b-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            temperature: 0.3,
            max_tokens: 2000,
        });

        const content = response.choices[0]?.message?.content || '';

        // Try to parse as JSON
        try {
            // Remove any markdown code fences if present
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleaned);
        } catch {
            // If JSON parsing fails, return structured response
            return {
                medicine_name: 'Unable to parse',
                raw_response: content,
                extracted_text: content,
                confidence: 'low'
            };
        }
    } catch (err) {
        console.error('Groq API error:', err);
        throw new Error('Failed to analyze medicine image with Groq: ' + err.message);
    }
}
