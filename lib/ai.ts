export const OPENAI_MODEL_NAME = "gpt-4o-mini";
// Fallback model name for Gemini
export const GEMINI_MODEL_NAME = "gemini-2.0-flash-exp"; // Known existing model (even if rate limited)
export const AI_MODEL_NAME = OPENAI_MODEL_NAME; // Default export for components

export const AI_GENERATION_CONFIG = {
    responseMimeType: "application/json"
};

export const SchemaType = {
    STRING: "STRING",
    NUMBER: "NUMBER",
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    ARRAY: "ARRAY",
    OBJECT: "OBJECT"
};

// --- HELPER: Convert Gemini-style "history" to OpenAI Messages ---
const convertToOpenAIMessages = (promptOrContent: any, history: any[] = []) => {
    let messages: any[] = [];

    // 1. Add History (converted)
    if (history.length > 0) {
        messages = history.map(item => {
            const role = item.role === 'model' ? 'assistant' : 'user';
            const content = item.parts ? item.parts.map((p: any) => p.text).join('\n') : (item.text || '');
            return { role, content };
        });
    }

    // 2. Add Current Prompt
    let currentContent: any = promptOrContent;

    // Handle { contents: ... } wrapper
    if (promptOrContent && promptOrContent.contents) {
        currentContent = promptOrContent.contents;
    }

    if (typeof currentContent === 'string') {
        messages.push({ role: 'user', content: currentContent });
    } else if (Array.isArray(currentContent)) {
        currentContent.forEach((item: any) => {
            const role = item.role === 'model' ? 'assistant' : 'user';
            let text = "";
            if (item.parts) {
                text = item.parts.map((p: any) => p.text || "").join('\n');
            } else if (item.text) {
                text = item.text;
            }
            if (text) messages.push({ role, content: text });
        });
    }

    return messages;
};

// --- HELPER: Prepare Gemini Body (for fallback) ---
const prepareGeminiBody = (promptOrContent: any, history: any[] = []) => {
    let contents = [...history]; // Start with history

    let currentContent: any = promptOrContent;
    if (promptOrContent && promptOrContent.contents) {
        currentContent = promptOrContent.contents;
    }

    // Normalize current prompt to Gemini object structure
    if (typeof currentContent === 'string') {
        contents.push({ role: 'user', parts: [{ text: currentContent }] });
    } else if (Array.isArray(currentContent)) {
        contents = currentContent; // Already array? assume full history or mixed
        // Ideally we append to history, but if currentContent IS the history, we use it. 
        // Our components send [ { role: user, parts... } ] usually.
    }

    return {
        contents: contents,
        generationConfig: promptOrContent.generationConfig || undefined
    };
};


class SimpleChatSession {
    private model: SimpleGenerativeModel;
    private history: any[];

    constructor(model: SimpleGenerativeModel, history: any[]) {
        this.model = model;
        this.history = history;
    }

    async *sendMessageStream(promptOrParts: any) {
        // Logic: 
        // 1. Try OpenAI.
        // 2. If fail, Try Gemini Fallback.
        // 3. Update history with result.

        let parts = promptOrParts;
        if (promptOrParts && promptOrParts.message) {
            parts = promptOrParts.message;
        }

        // This is what we add to history (Gemini style)
        const userSide = { role: 'user', parts: Array.isArray(parts) ? parts : [{ text: parts }] };
        const tempHistory = [...this.history, userSide];

        try {
            // -- PRIMARY: OPENAI --
            const messages = convertToOpenAIMessages(null, tempHistory);
            const text = await this.model.callOpenAI(messages);

            this.history.push(userSide);
            this.history.push({ role: 'model', parts: [{ text }] });
            yield { text: () => text };

        } catch (error: any) {
            console.warn("OpenAI Failed, switching to Fallback:", error.message);
            // -- FALLBACK: GEMINI --
            try {
                // If the error was 429/404/5xx, try Gemini
                // Note: prepareGeminiBody might need adjustment for chat context
                // Simplest: just pass full history to generateContent (Gemini is stateless via REST unless using specific endpoint, but here we use single-turn rest for simplicity or standard stateless chat)

                // Construct full content array for Gemini
                const fullHistoryForGemini = [...tempHistory];
                const text = await this.model.callGemini(fullHistoryForGemini);

                this.history.push(userSide);
                this.history.push({ role: 'model', parts: [{ text }] });
                yield { text: () => text };

            } catch (fallbackError: any) {
                console.error("Fallback Model also failed:", fallbackError);
                // Throw the original error or a composite one? Let's throw fallback error or generic
                throw new Error(`AI Generation Failed. Primary: ${error.message}. Fallback: ${fallbackError.message}`);
            }
        }
    }

    async sendMessage(promptOrParts: any) {
        let parts = promptOrParts;
        if (promptOrParts && promptOrParts.message) parts = promptOrParts.message;

        const userSide = { role: 'user', parts: Array.isArray(parts) ? parts : [{ text: parts }] };
        const tempHistory = [...this.history, userSide];

        try {
            const messages = convertToOpenAIMessages(null, tempHistory);
            const text = await this.model.callOpenAI(messages);

            this.history.push(userSide);
            this.history.push({ role: 'model', parts: [{ text }] });

            return { response: { text: () => text }, text: text };
        } catch (error: any) {
            console.warn("OpenAI Failed, switching to Fallback:", error.message);
            // Fallback
            const fullHistoryForGemini = [...tempHistory];
            const text = await this.model.callGemini(fullHistoryForGemini);

            this.history.push(userSide);
            this.history.push({ role: 'model', parts: [{ text }] });
            return { response: { text: () => text }, text: text };
        }
    }
}

class SimpleGenerativeModel {
    private openAIKey: string;
    private geminiKey: string;
    private primaryModel: string;

    constructor(openAIKey: string, geminiKey: string, options: { model: string }) {
        this.openAIKey = openAIKey;
        this.geminiKey = geminiKey;
        this.primaryModel = options.model || OPENAI_MODEL_NAME;

        // Normalize
        if (this.primaryModel.includes('gemini') && this.openAIKey) {
            // If user asks for gemini but we have openAI key, prefer openai? 
            // Or maybe user really wants gemini? 
            // Given the migration, we default to OpenAI logic unless specific overrides.
            // But let's respect the "hybrid" nature.
            this.primaryModel = OPENAI_MODEL_NAME;
        }
    }

    startChat(config: any) {
        return new SimpleChatSession(this, config?.history || []);
    }

    // --- CALLERS ---

    async callOpenAI(messages: any[]) {
        if (!this.openAIKey) throw new Error("OpenAI API Key missing");

        const url = "https://api.openai.com/v1/chat/completions";
        console.log(`[AI] Primary Fetch: OpenAI (${this.primaryModel})`);

        const body = {
            model: this.primaryModel,
            messages: messages,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openAIKey}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || await response.text();
            throw new Error(`OpenAI ${response.status}: ${errorMsg}`);
        }

        return data.choices?.[0]?.message?.content || "";
    }

    async callGemini(contents: any[]) {
        if (!this.geminiKey) throw new Error("Gemini API Key missing for fallback");

        const modelName = GEMINI_MODEL_NAME;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.geminiKey}`;
        console.log(`[AI] Fallback Fetch: Gemini (${modelName})`);

        // Ensure contents is array and properly shaped
        // If contents is just one item, wrap it
        const bodyContents = Array.isArray(contents) ? contents : [contents];

        // Safety: ensure parts wrapper
        bodyContents.forEach((c: any) => {
            if (!c.parts && c.text) {
                c.parts = [{ text: c.text }];
                delete c.text;
            }
        });

        const body = {
            contents: bodyContents
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini Fallback ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return text;
    }

    async generateContent(promptOrContent: any) {
        try {
            // 1. Try OpenAI
            const messages = convertToOpenAIMessages(promptOrContent);
            const text = await this.callOpenAI(messages);
            return this.mockResponse(text);
        } catch (error: any) {
            console.warn("Primary AI failed, attempting fallback...", error.message);
            // 2. Fallback Gemini
            try {
                // Convert prompt to Gemini format
                // If promptOrContent is string -> { parts: [{text}] }
                // If object -> extract contents

                let contents: any[] = [];
                if (typeof promptOrContent === 'string') {
                    contents = [{ role: 'user', parts: [{ text: promptOrContent }] }];
                } else if (promptOrContent.contents) {
                    contents = promptOrContent.contents;
                } else if (Array.isArray(promptOrContent)) {
                    contents = promptOrContent;
                }

                const text = await this.callGemini(contents);
                return this.mockResponse(text);

            } catch (fallbackError: any) {
                throw new Error(`AI Generation Failed. Primary: ${error.message}. Fallback: ${fallbackError.message}`);
            }
        }
    }

    mockResponse(text: string) {
        return {
            response: {
                text: () => text,
                candidates: [{ content: { parts: [{ text }] } }]
            },
            text: text,
            candidates: [{ content: { parts: [{ text }] } }]
        };
    }
}

class SimpleGenAIClient {
    private openAIKey: string;
    private geminiKey: string;

    constructor(openAIKey: string, geminiKey: string) {
        this.openAIKey = openAIKey;
        this.geminiKey = geminiKey;
    }

    getGenerativeModel(options: { model: string }) {
        return new SimpleGenerativeModel(this.openAIKey, this.geminiKey, options);
    }

    get models() {
        return {
            generateContent: (args: any) => {
                const modelName = args.model || AI_MODEL_NAME;
                return this.getGenerativeModel({ model: modelName }).generateContent(args);
            }
        };
    }

    get chats() {
        return {
            create: (args: any) => {
                const modelName = args.model || AI_MODEL_NAME;
                return this.getGenerativeModel({ model: modelName }).startChat(args);
            }
        };
    }
}

export const getAIClient = (apiKey?: string) => {
    // We now manage two keys. 
    // We ignore the passed 'apiKey' argument effectively, or treat it as the "primary".
    // But since components might pass the OLD Gemini key as the first arg, we need to be careful.

    const envOpenAI = import.meta.env.VITE_OPENAI_API_KEY || '';
    const envGemini = import.meta.env.VITE_GEMINI_API_KEY || '';

    // Components currently pass: getAIClient(import.meta.env.VITE_OPENAI_API_KEY) (because of my regex replace)
    // So 'apiKey' is likely the OpenAI key. 

    const primaryKey = envOpenAI || apiKey || '';
    // If no OpenAI key, we might have major issues unless we fallback entirely to Gemini as primary.
    // For now, assume OpenAI is primary.

    if (!primaryKey && !envGemini) throw new Error("No API Keys found (OpenAI or Gemini)");

    return new SimpleGenAIClient(primaryKey, envGemini);
};
