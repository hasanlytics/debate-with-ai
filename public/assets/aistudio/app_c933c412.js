import { GoogleGenAI } from "@google/genai";

// আপনার Gemini API Key এখানে দিন
const apiKey = "YOUR_GEMINI_API_KEY"; 
const ai = new GoogleGenAI({ apiKey: apiKey });

// চ্যাট বা ডিবেটের জন্য জেমিনাই এপিআই কল করার ফাংশন
async function callGeminiAPI(userMessage) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // দ্রুতগতির মডেল
            contents: userMessage,
            config: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            }
        });

        console.log("Gemini Response:", response.text);
        return response.text;
        
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "দুঃখিত, এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে।";
    }
}

// ওয়েবপেজ লোড হওয়ার পর ইভেন্ট লিসেনার সেটআপ
document.addEventListener("DOMContentLoaded", () => {
    // আপনার প্রজেক্টের UI এলিমেন্ট অনুযায়ী আইডিগুলো এখানে যুক্ত করতে পারেন
    const sendButton = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    if (sendButton && userInput) {
        sendButton.addEventListener("click", async () => {
            const messageText = userInput.value.trim();
            if (!messageText) return;

            // ইউজারের মেসেজ স্ক্রিনে দেখানোর ফাংশন (যদি আপনার প্রজেক্টে থাকে)
            appendMessage("User", messageText);
            userInput.value = "";

            // জেমিনাই থেকে উত্তর আনুন
            const aiReply = await callGeminiAPI(messageText);

            // এআই-এর উত্তর স্ক্রিনে দেখান
            appendMessage("AI", aiReply);
        });
    }
});

// চ্যাটবক্সে মেসেজ দেখানোর জন্য হেল্পার ফাংশন
function appendMessage(sender, message) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "User" ? "user-message" : "ai-message";
    messageDiv.innerText = `${sender}: ${message}`;
    chatBox.appendChild(messageDiv);
    
    // অটো স্ক্রল নিচে নামানোর জন্য
    chatBox.scrollTop = chatBox.scrollHeight;
}