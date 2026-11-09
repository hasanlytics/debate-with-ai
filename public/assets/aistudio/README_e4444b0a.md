# Voice Debate

AI-র সাথে ভয়েসে তর্ক করার একটা ছোট ওয়েবসাইট। Gemini API ব্যবহার করে, সম্পূর্ণ ফ্রি।

## কীভাবে চালাবে (নিজের কম্পিউটারে টেস্ট)

ব্রাউজারের মাইক্রোফোন পারমিশন (Speech Recognition) সরাসরি ফাইল খুললে (`file://`) কাজ নাও করতে পারে।
তাই একটা ছোট লোকাল সার্ভার দিয়ে চালাও:

### উপায় ১: Python দিয়ে (কম্পিউটারে Python থাকলে)
```
cd voice-debate
python -m http.server 8000
```
তারপর ব্রাউজারে যাও: `http://localhost:8000`

### উপায় ২: VS Code "Live Server" এক্সটেনশন
VS Code-এ `voice-debate` ফোল্ডার খোলো, `index.html` এ রাইট-ক্লিক করে **"Open with Live Server"** চাপো।

## ব্যবহার করার আগে
1. প্রথমবার খুললে একটা Gemini API Key চাইবে।
2. **aistudio.google.com/apikey** থেকে ফ্রি key নাও (কোনো billing লাগবে না)।
3. Key বসালে সেটা তোমার ব্রাউজারে (localStorage-এ) সেভ থাকবে, পরেরবার আর চাইবে না।

## বন্ধুদের সাথে শেয়ার করতে (ইন্টারনেটে পাবলিশ)

লোকাল সার্ভার শুধু তোমার কম্পিউটারে চলবে, বন্ধুরা অ্যাক্সেস করতে পারবে না। ইন্টারনেটে একটা লিংক বানাতে **Firebase Hosting** ব্যবহার করো (ফ্রি):

```
npm install -g firebase-tools
firebase login
cd voice-debate
firebase init hosting
firebase deploy
```

`firebase init hosting` করার সময়:
- "What do you want to use as your public directory?" → **বর্তমান ফোল্ডার** (`.` লেখো, অথবা `public` বানিয়ে ফাইলগুলো সেখানে নাও)
- "Configure as a single-page app?" → **No**

ডিপ্লয় শেষে একটা `https://your-project.web.app` লিংক পাবে, সেটা বন্ধুদের পাঠিয়ে দাও।

## গুরুত্বপূর্ণ
- Chrome ব্রাউজার ব্যবহার করো (Speech Recognition Chrome/Edge-এ সবচেয়ে ভালো কাজ করে)।
- মাইক্রোফোন পারমিশন চাইলে **Allow** করো।
- এই লিংক শুধু বন্ধুদের মধ্যে শেয়ার করো, পাবলিকলি না — কারণ API key ব্রাউজারের কোডে visible থাকে।
