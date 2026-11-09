import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Award,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Flame,
  GraduationCap,
  Smile,
  HelpCircle,
  RefreshCw,
  Play,
  Square,
  Globe,
  Settings,
  Trash2,
  CheckCircle2,
  Download,
  Smartphone,
  Terminal,
  ExternalLink,
  FolderArchive,
  X,
  Laptop,
  Camera,
  User,
  Image as ImageIcon,
  FileCode,
  Key,
  AlertTriangle,
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  audioData?: string | null;
  isLoadingAudio?: boolean;
}

interface JudgeResult {
  winner: 'User' | 'AI' | 'Tie';
  winnerTitle: string;
  userScore: number;
  aiScore: number;
  summary: string;
  userStrengths: string[];
  aiStrengths: string[];
  improvementTip: string;
}

const PRESET_TOPICS = [
  'চা কফির চেয়ে ভালো',
  'AI মানুষের চাকরি কেড়ে নেবে',
  'বই পড়া সিনেমা দেখার চেয়ে ভালো',
  'ক্রিকেট ফুটবলের চেয়ে ভালো খেলা',
  'সকালে ওঠা রাত জাগার চেয়ে ভালো',
  'টাকা দিয়ে সুখ কেনা যায়',
  'Social media মানুষের জন্য ক্ষতিকর',
  'Remote work অফিসে কাজের চেয়ে ভালো',
];

const PRESET_AVATARS = [
  { id: 'student', emoji: '👨‍🎓', label: 'শিক্ষার্থী' },
  { id: 'pro', emoji: '👨‍💼', label: 'পেশাজীবী' },
  { id: 'debater', emoji: '🎙️', label: 'বিতার্কিক' },
  { id: 'lion', emoji: '🦁', label: 'সিংহহৃদয়' },
  { id: 'fire', emoji: '⚡', label: 'তীব্র তারুণ্য' },
  { id: 'thinker', emoji: '👑', label: 'বুদ্ধিজীবী' },
];

const STYLES = [
  {
    id: 'friendly',
    label: 'Friendly',
    bengaliLabel: 'বন্ধুত্বপূর্ণ',
    desc: 'হালকা, মজার ও চটপটে টোন',
    icon: Smile,
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'serious',
    label: 'Serious',
    bengaliLabel: 'তথ্যবহুল',
    desc: 'যুক্তি, প্রমাণ ও তথ্যনির্ভর',
    icon: GraduationCap,
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'savage',
    label: 'Savage',
    bengaliLabel: 'খোঁচাময়',
    desc: 'তীব্র পাল্টা যুক্তি ও খোঁচা',
    icon: Flame,
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  {
    id: 'socratic',
    label: 'Socratic',
    bengaliLabel: 'সক্রেটিসীয়',
    desc: 'পাল্টা প্রশ্ন তুলে যুক্তি খণ্ডন',
    icon: HelpCircle,
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
] as const;

type StyleType = (typeof STYLES)[number]['id'];

const GEMINI_VOICES = [
  {
    id: 'Kore',
    name: 'কোরি (Kore)',
    gender: 'নারী কণ্ঠ',
    desc: 'স্বাভাবিক, মিষ্টি ও অত্যন্ত স্পষ্ট বাংলা উচ্চারণ (সেরা ও প্রস্তাবিত)',
    sampleText: 'নমস্কার! আমি কোরি। আপনার সাথে যুক্তিতর্কে অংশ নিতে আমি প্রস্তুত।',
  },
  {
    id: 'Puck',
    name: 'পাক (Puck)',
    gender: 'পুরুষ কণ্ঠ',
    desc: 'প্রাণবন্ত, চটপটে ও আক্রমণাত্মক বিতার্কিক ব্যক্তিত্ব',
    sampleText: 'হ্যালো! আমার যুক্তি এত সহজে কিন্তু আপনি খণ্ডন করতে পারবেন না!',
  },
  {
    id: 'Zephyr',
    name: 'জেফির (Zephyr)',
    gender: 'শান্ত কণ্ঠ',
    desc: 'ধীরস্থির, গভীর ও বিশ্লেষণধর্মী যুক্তিপূর্ণ ব্যক্তিত্ব',
    sampleText: 'আসুন তর্কের গভীরে গিয়ে বাস্তব সত্যকে বিচার করি।',
  },
  {
    id: 'Fenrir',
    name: 'ফেনরির (Fenrir)',
    gender: 'ভারী কণ্ঠ',
    desc: 'বলিষ্ঠ, আত্মবিশ্বাসী ও রাশভারী বিতার্কিক কণ্ঠস্বর',
    sampleText: 'বিতর্কের ময়দানে কোনো আপস নয়, সরাসরি শক্তিশালী যুক্তি দিন!',
  },
] as const;

const CLAUDE_PROMPT_TEMPLATE = `Create a complete full-stack Voice Debate AI web application in React (Vite + TypeScript + Tailwind CSS) with a Node.js Express backend using the Google Gemini API (@google/genai).

Key Features:
1. Flow & Screens:
   - Screen 1: Topic & Persona Setup with preset Bengali debate topics ("চা কফির চেয়ে ভালো", "AI মানুষের চাকরি কেড়ে নেবে", etc.), custom topic input, and random topic suggestions.
   - User Side Selection: For vs Against.
   - Debate Personas: Friendly, Serious, Savage, Socratic.
   - User Profile Customization: Upload custom profile photo/avatar, select debater name.
   - Screen 2: Live Debate Arena with interactive message transcript, user vs AI bubbles, and audio playback.
   - Screen 3 / Modal: Chief Adjudicator evaluation with scores (out of 100), strengths breakdown, and constructive debate tips.
2. Voice & Microphone:
   - Web Speech API continuous speech recognition that does NOT cut off when the user pauses for breath.
   - Live speech transcript preview, "কথা শেষ, যুক্তি পাঠান" button, and text input fallback.
3. Natural Bengali Speech (TTS):
   - Clear Bengali speech output with voice persona switching, playback rate controls (0.9x, 1x, 1.15x), and audio waveform animations.
4. PWA & Offline:
   - Web App Manifest and Service Worker for 1-click installation on mobile and desktop.
   - Ready-to-deploy configuration for Netlify, Vercel, and local Node.js environments.`;

export default function App() {
  // Screens: 'setup' | 'debate'
  const [screen, setScreen] = useState<'setup' | 'debate'>('setup');

  // User Profile / Photo State
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('voice_debate_username') || 'বক্তা ১ (আপনি)';
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('voice_debate_avatar') || '';
  });
  const [selectedEmojiAvatar, setSelectedEmojiAvatar] = useState<string>(() => {
    return localStorage.getItem('voice_debate_emoji_avatar') || '🎙️';
  });

  // Debate Settings
  const [topic, setTopic] = useState<string>('চা কফির চেয়ে ভালো');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [style, setStyle] = useState<StyleType>('friendly');
  const [userSide, setUserSide] = useState<'for' | 'against'>('for');
  const [language, setLanguage] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSuggestingTopics, setIsSuggestingTopics] = useState(false);
  const [dynamicTopics, setDynamicTopics] = useState<string[]>(PRESET_TOPICS);
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);

  // Debate Arena State
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [speechInterim, setSpeechInterim] = useState<string>('');
  const [isSpeakingTTS, setIsSpeakingTTS] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);

  // Adjudication / Judge State
  const [isJudging, setIsJudging] = useState<boolean>(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [showJudgeModal, setShowJudgeModal] = useState<boolean>(false);

  // PWA & Download State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [isCopiedClaudePrompt, setIsCopiedClaudePrompt] = useState<boolean>(false);

  // Gemini API Key Management (Pre-configured with user-provided verified key)
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('voice_debate_gemini_key') || 'AQ.Ab8RN6IKp6YW-Xah5x4M83LQlTBLwke91e7yFs2JZ_7PZxcKag';
  });
  const [apiKeyInput, setApiKeyInput] = useState<string>('AQ.Ab8RN6IKp6YW-Xah5x4M83LQlTBLwke91e7yFs2JZ_7PZxcKag');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [quotaExceededNotice, setQuotaExceededNotice] = useState<boolean>(false);
  const [isTestingApiKey, setIsTestingApiKey] = useState<boolean>(false);
  const [apiKeyTestMessage, setApiKeyTestMessage] = useState<string | null>(null);

  // Debate Phase: 'intro' (AI introduces and asks who will start) | 'debating' (active debate)
  const [debatePhase, setDebatePhase] = useState<'intro' | 'debating'>('intro');

  // Status message
  const [statusText, setStatusText] = useState<string>('মাইকে চাপুন আর আপনার যুক্তি বলুন');

  // Refs
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const isRecordingActiveRef = useRef<boolean>(false);
  const accumulatedSpeechRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const speechQueueTimeoutRef = useRef<any>(null);
  const speechIsCancelledRef = useRef<boolean>(false);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('ছবির আকার ৩ MB-র কম রাখুন!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUserAvatar(result);
      localStorage.setItem('voice_debate_avatar', result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setUserAvatar('');
    localStorage.removeItem('voice_debate_avatar');
  };

  // Detect PWA Installability & Standalone Mode
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger PWA Installation
  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowDownloadModal(true);
    }
  };

  // Continuous Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        isRecordingActiveRef.current = true;
        setStatusText(language === 'bn-BD' ? '🎙️ শুনছি... সময় নিয়ে আপনার সম্পূর্ণ যুক্তি বলুন...' : '🎙️ Listening... Take your time to speak...');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let newlyFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newlyFinal += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (newlyFinal) {
          accumulatedSpeechRef.current = (accumulatedSpeechRef.current + ' ' + newlyFinal).trim();
          setLiveTranscript(accumulatedSpeechRef.current);
        }

        setSpeechInterim(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          isRecordingActiveRef.current = false;
          setStatusText('মাইক্রোফোন পারমিশন ব্লক করা। ব্রাউজার সেটিংসে পারমিশন দিন বা টাইপ করুন।');
        } else if (event.error === 'no-speech') {
          if (isRecordingActiveRef.current) {
            setStatusText('আপনি বিরতি নিয়েছেন। আরও বলতে পারেন অথবা "যুক্তি পাঠান" চাপুন।');
          }
        }
      };

      recognition.onend = () => {
        if (isRecordingActiveRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setTimeout(() => {
              if (isRecordingActiveRef.current) {
                try {
                  recognition.start();
                } catch (err) {}
              }
            }, 200);
          }
        } else {
          setIsListening(false);
          setSpeechInterim('');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      isRecordingActiveRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      stopSpeech();
    };
  }, [language]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript, speechInterim, isAiReplying]);

  // Start Voice Recording
  const startRecording = () => {
    if (!recognitionRef.current) {
      setStatusText('আপনার ব্রাউজারে স্পিচ রিকগনিশন নেই। নিচে টেক্সট বক্সে যুক্তি লিখুন।');
      return;
    }

    stopSpeech();
    accumulatedSpeechRef.current = '';
    setLiveTranscript('');
    setSpeechInterim('');
    isRecordingActiveRef.current = true;

    try {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
    } catch (err) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          if (isRecordingActiveRef.current) {
            recognitionRef.current.start();
          }
        }, 150);
      } catch (e) {}
    }
  };

  // Stop Recording and Send Argument
  const finishRecordingAndSend = () => {
    isRecordingActiveRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);

    const fullText = (accumulatedSpeechRef.current + ' ' + speechInterim).trim();
    setLiveTranscript('');
    setSpeechInterim('');
    accumulatedSpeechRef.current = '';

    if (fullText) {
      handleUserSubmission(fullText);
    } else {
      setStatusText('কোনো কথা রেকর্ড করা হয়নি। মাইকে চাপুন অথবা লিখে পাঠান।');
    }
  };

  // Cancel / Clear recorded speech
  const cancelRecording = () => {
    isRecordingActiveRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setLiveTranscript('');
    setSpeechInterim('');
    accumulatedSpeechRef.current = '';
    setStatusText('রেকর্ডিং বাতিল করা হয়েছে। আবার মাইকে চাপুন বা লিখুন।');
  };

  // Play Gemini Studio Audio (24kHz WAV)
  const playGeminiAudio = (base64Audio: string, index?: number) => {
    if (!ttsEnabled) return;
    stopSpeech();

    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.playbackRate = speechRate;
      audioPlayerRef.current = audio;
      setIsSpeakingTTS(true);
      if (typeof index === 'number') setCurrentPlayingIndex(index);
      setStatusText('🔊 Gemini AI স্পষ্ট ও প্রাঞ্জল বাংলায় বক্তব্য দিচ্ছে...');

      audio.onplay = () => {
        setIsSpeakingTTS(true);
      };

      audio.onended = () => {
        setIsSpeakingTTS(false);
        setCurrentPlayingIndex(null);
        setStatusText('এবার আপনার পালা। সময় নিয়ে আপনার যুক্তি বলুন।');
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        setIsSpeakingTTS(false);
        setCurrentPlayingIndex(null);
      };

      audio.play().catch((err) => {
        console.warn('Audio autoplay blocked:', err);
        setIsSpeakingTTS(false);
        setCurrentPlayingIndex(null);
      });
    } catch (err) {
      console.error('Audio creation error:', err);
      setIsSpeakingTTS(false);
    }
  };

  // Speak AI Text
  const speakText = async (text: string, existingAudioData?: string | null, index?: number) => {
    if (!ttsEnabled) return;

    if (existingAudioData) {
      playGeminiAudio(existingAudioData, index);
      return;
    }

    stopSpeech();
    setStatusText('Gemini HD বাংলা ভয়েস তৈরি হচ্ছে...');

    if (typeof index === 'number') {
      setMessages((prev) =>
        prev.map((m, i) => (i === index ? { ...m, isLoadingAudio: true } : m))
      );
    }

    try {
      const res = await fetch('/api/debate/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey.trim() ? { 'x-gemini-api-key': userApiKey.trim() } : {}),
        },
        body: JSON.stringify({
          text,
          voiceName: selectedVoice,
          style,
        }),
      });

      const data = await res.json();
      if (res.status === 429 || data.error === 'DAILY_QUOTA_EXHAUSTED') {
        setQuotaExceededNotice(true);
        setStatusText('⚠️ Gemini Free Tier দৈনিক লিমিট শেষ। Settings থেকে API Key দিয়ে আনলিমিটেড চালান।');
      }

      if (data.audioData) {
        if (typeof index === 'number') {
          setMessages((prev) =>
            prev.map((m, i) =>
              i === index ? { ...m, audioData: data.audioData, isLoadingAudio: false } : m
            )
          );
        }
        playGeminiAudio(data.audioData, index);
      } else {
        speakWithNaturalVoice(text);
        if (typeof index === 'number') {
          setMessages((prev) =>
            prev.map((m, i) => (i === index ? { ...m, isLoadingAudio: false } : m))
          );
        }
      }
    } catch (err) {
      console.warn('Gemini TTS error:', err);
      speakWithNaturalVoice(text);
      if (typeof index === 'number') {
        setMessages((prev) =>
          prev.map((m, i) => (i === index ? { ...m, isLoadingAudio: false } : m))
        );
      }
    }
  };

  // Natural voice speaker with sequential sentence queue to prevent browser audio cutting off mid-speech
  const speakWithNaturalVoice = (text: string) => {
    if (!window.speechSynthesis || !ttsEnabled) return;
    stopSpeech();

    speechIsCancelledRef.current = false;
    const cleanText = text
      .replace(/[*#_~`>]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();

    if (!cleanText) return;

    // Split into sentences using Bengali and standard punctuation
    const rawSentences = cleanText.split(/(?<=[।?!;\n])\s+/);
    const sentences = rawSentences.map((s) => s.trim()).filter(Boolean);
    if (sentences.length === 0) return;

    const voices = window.speechSynthesis.getVoices();
    let bnVoice = voices.find(
      (v) =>
        v.lang === 'bn-BD' ||
        v.lang === 'bn-IN' ||
        v.lang.toLowerCase().startsWith('bn') ||
        v.name.toLowerCase().includes('bangla') ||
        v.name.toLowerCase().includes('bengali')
    );
    if (!bnVoice) {
      bnVoice = voices.find((v) => v.lang.startsWith('hi-') || v.lang.startsWith('en-IN'));
    }

    setIsSpeakingTTS(true);
    setStatusText('🔊 AI বক্তব্য উপস্থাপন করছে (সম্পূর্ণ শুনুন)...');

    let currentSentenceIndex = 0;

    const speakNextSentence = () => {
      if (speechIsCancelledRef.current) return;

      if (currentSentenceIndex >= sentences.length) {
        setIsSpeakingTTS(false);
        setCurrentPlayingIndex(null);
        setStatusText('এবার আপনার পালা। সময় নিয়ে আপনার যুক্তি বলুন।');
        return;
      }

      const sentence = sentences[currentSentenceIndex++];
      const utterance = new SpeechSynthesisUtterance(sentence);
      if (bnVoice) {
        utterance.voice = bnVoice;
        utterance.lang = bnVoice.lang;
      } else {
        utterance.lang = language;
      }

      utterance.rate = speechRate * 0.92;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        if (!speechIsCancelledRef.current) {
          speechQueueTimeoutRef.current = setTimeout(speakNextSentence, 80);
        }
      };

      utterance.onerror = (e) => {
        console.warn('Utterance notice:', e);
        if (!speechIsCancelledRef.current) {
          speechQueueTimeoutRef.current = setTimeout(speakNextSentence, 50);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  };

  // Stop currently playing audio
  const stopSpeech = () => {
    speechIsCancelledRef.current = true;
    if (speechQueueTimeoutRef.current) {
      clearTimeout(speechQueueTimeoutRef.current);
      speechQueueTimeoutRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingTTS(false);
    setCurrentPlayingIndex(null);
  };

  // Test voice sample in setup screen
  const testVoiceSample = async (voiceId: string, sampleText: string) => {
    stopSpeech();
    setTestingVoiceId(voiceId);

    try {
      const res = await fetch('/api/debate/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey.trim() ? { 'x-gemini-api-key': userApiKey.trim() } : {}),
        },
        body: JSON.stringify({
          text: sampleText,
          voiceName: voiceId,
          style,
        }),
      });
      const data = await res.json();
      if (data.audioData) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioData}`);
        audioPlayerRef.current = audio;
        audio.onended = () => setTestingVoiceId(null);
        audio.onerror = () => setTestingVoiceId(null);
        audio.play();
      } else {
        if (data.error === 'DAILY_QUOTA_EXHAUSTED' || res.status === 429) {
          setQuotaExceededNotice(true);
        }
        setTestingVoiceId(null);
      }
    } catch {
      setTestingVoiceId(null);
    }
  };

  // Start Debate Session with AI Persona Introduction
  const startDebate = async (chosenTopic?: string) => {
    const finalTopic = (chosenTopic || customTopic.trim() || topic).trim();
    if (!finalTopic) return;

    setTopic(finalTopic);
    setScreen('debate');
    setMessages([]);
    setJudgeResult(null);
    setDebatePhase('intro');
    stopSpeech();

    const voiceObj = GEMINI_VOICES.find((v) => v.id === selectedVoice) || GEMINI_VOICES[0];
    const userStance = userSide === 'for' ? 'পক্ষে (For)' : 'বিপক্ষে (Against)';
    const aiStance = userSide === 'for' ? 'বিপক্ষে (Against)' : 'পক্ষে (For)';

    // Step 1: Formal AI introduction & polite invitation
    const introText = `আসসালামু আলাইকুম ও আদাব! আমি আপনার AI বিতর্ক প্রতিপক্ষ ${voiceObj.name}। আজকের বিতর্কের বিষয়: "${finalTopic}"। আপনি বলছেন ${userStance} হিসেবে এবং আমি অবস্থান নিয়েছি ${aiStance} হিসেবে। বিতর্কের সূচনা যুক্তি কি আপনি উপস্থাপন করবেন, নাকি আমি শুরু করব?`;

    const introMsg: Message = {
      sender: 'ai',
      text: introText,
      audioData: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([introMsg]);
    setStatusText('শুরুতে কে বক্তব্য রাখবেন? নিচের বোতামে চাপুন অথবা সরাসরি মাইকে বলুন।');

    // Generate speech for the introduction
    speakText(introText, null, 0);
  };

  // User chooses to start the debate first
  const handleUserStartsDebate = () => {
    setDebatePhase('debating');
    stopSpeech();
    const userChoiceMsg: Message = {
      sender: 'user',
      text: 'আমি প্রথমে শুরু করছি।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userChoiceMsg]);
    setStatusText('মঞ্চ আপনার! মাইকে চাপুন আর আপনার প্রথম সূচনা যুক্তিটি বলুন।');
    setTimeout(() => {
      startRecording();
    }, 350);
  };

  // User asks AI to start the debate first
  const handleAiStartsDebate = async () => {
    setDebatePhase('debating');
    stopSpeech();
    setIsAiReplying(true);
    setStatusText('Gemini AI প্রথম সূচনা যুক্তি প্রস্তুত করছে...');

    const userChoiceMsg: Message = {
      sender: 'user',
      text: 'আপনি আগে শুরু করুন। আপনার সূচনা বক্তব্য শুনতে চাই।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userChoiceMsg]);

    try {
      const payload = {
        topic,
        style,
        userSide,
        voiceName: selectedVoice,
        isOpening: true,
        messages: [userChoiceMsg],
      };

      const res = await fetch('/api/debate/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey.trim() ? { 'x-gemini-api-key': userApiKey.trim() } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.quotaExceeded) {
        setQuotaExceededNotice(true);
      }

      if (data.reply) {
        const aiMsg: Message = {
          sender: 'ai',
          text: data.reply,
          audioData: data.audioData || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          const newIndex = updated.length - 1;
          if (data.audioData && ttsEnabled) {
            playGeminiAudio(data.audioData, newIndex);
          } else if (ttsEnabled) {
            speakText(data.reply, null, newIndex);
          }
          return updated;
        });

        setStatusText('AI সূচনা বক্তব্য দিয়েছে। এবার মাইকে আপনার পাল্টা যুক্তি বলুন!');
      } else {
        throw new Error(data.error || 'Opening statement failed');
      }
    } catch (err: any) {
      console.error(err);
      setStatusText('নেটওয়ার্কে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsAiReplying(false);
    }
  };

  // Submit User Argument
  const handleUserSubmission = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isAiReplying) return;

    // If still in 'intro' phase, inspect if user is telling who should start
    if (debatePhase === 'intro') {
      const lower = trimmed.toLowerCase();
      if (
        lower.includes('আমি শুরু') ||
        lower.includes('আমি বলব') ||
        lower.includes('আমি বলি') ||
        lower.includes('আমার পালা') ||
        lower.includes('i will start') ||
        lower.includes('me')
      ) {
        handleUserStartsDebate();
        return;
      }
      if (
        lower.includes('আপনি শুরু') ||
        lower.includes('তুমি শুরু') ||
        lower.includes('এআই শুরু') ||
        lower.includes('ai start') ||
        lower.includes('you start')
      ) {
        handleAiStartsDebate();
        return;
      }
      // If user directly spoke an argument, proceed into debate mode
      setDebatePhase('debating');
    }

    const newMsg: Message = {
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setTextInput('');
    setIsAiReplying(true);
    setStatusText('Gemini AI আপনার যুক্তির খণ্ডন প্রস্তুত করছে...');

    try {
      const payload = {
        topic,
        style,
        userSide,
        voiceName: selectedVoice,
        messages: updatedMessages.map((m) => ({ sender: m.sender, text: m.text })),
      };

      const res = await fetch('/api/debate/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey.trim() ? { 'x-gemini-api-key': userApiKey.trim() } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.quotaExceeded) {
        setQuotaExceededNotice(true);
      }

      if (data.reply) {
        const aiMsg: Message = {
          sender: 'ai',
          text: data.reply,
          audioData: data.audioData || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const allMessages = [...updatedMessages, aiMsg];
        setMessages(allMessages);

        if (data.audioData && ttsEnabled) {
          playGeminiAudio(data.audioData, allMessages.length - 1);
        } else if (ttsEnabled) {
          speakText(data.reply, null, allMessages.length - 1);
        }
      } else {
        throw new Error(data.error || 'Failed to get reply');
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        sender: 'ai',
        text: 'আপনার যুক্তিটি ভাবার মতো, তবে সার্ভার থেকে উত্তর দিতে সাময়িক বিলম্ব হচ্ছে। অনুগ্রহ করে আরেকবার চেষ্টা করুন।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...updatedMessages, errorMsg]);
      setStatusText('নেটওয়ার্কে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsAiReplying(false);
    }
  };

  // Fetch AI Judge Evaluation
  const requestJudgement = async () => {
    if (messages.length < 2) {
      alert('রায় পাওয়ার জন্য অন্তত একটি রাউন্ড তর্ক সম্পন্ন করুন!');
      return;
    }

    setIsJudging(true);
    setShowJudgeModal(true);

    try {
      const res = await fetch('/api/debate/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey.trim() ? { 'x-gemini-api-key': userApiKey.trim() } : {}),
        },
        body: JSON.stringify({
          topic,
          userSide,
          messages: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      setJudgeResult(data);
    } catch (err) {
      console.error('Judge error:', err);
    } finally {
      setIsJudging(false);
    }
  };

  // Suggest more trendy topics
  const fetchRandomTopics = async () => {
    setIsSuggestingTopics(true);
    try {
      const res = await fetch('/api/debate/random-topics');
      const data = await res.json();
      if (data.topics && Array.isArray(data.topics)) {
        setDynamicTopics(data.topics);
        setTopic(data.topics[0]);
      }
    } catch (err) {
      console.error('Topics error:', err);
    } finally {
      setIsSuggestingTopics(false);
    }
  };

  const copyClaudePrompt = () => {
    navigator.clipboard.writeText(CLAUDE_PROMPT_TEMPLATE);
    setIsCopiedClaudePrompt(true);
    setTimeout(() => setIsCopiedClaudePrompt(false), 2500);
  };

  const copyMessageText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const testAndSaveApiKey = async (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    if (!trimmed) {
      setUserApiKey('');
      localStorage.removeItem('voice_debate_gemini_key');
      setApiKeyTestMessage('API Key মুছে ফেলা হয়েছে।');
      setQuotaExceededNotice(false);
      return;
    }

    setIsTestingApiKey(true);
    setApiKeyTestMessage('যাচাই করা হচ্ছে...');

    try {
      const res = await fetch('/api/debate/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': trimmed,
        },
        body: JSON.stringify({
          text: 'অভিনন্দন! আপনার নিজস্ব Gemini API Key সফলভাবে সক্রিয় হয়েছে।',
          voiceName: selectedVoice,
          style: 'friendly',
        }),
      });

      const data = await res.json();
      if (data.audioData) {
        setUserApiKey(trimmed);
        localStorage.setItem('voice_debate_gemini_key', trimmed);
        setQuotaExceededNotice(false);
        setApiKeyTestMessage('✅ API Key সফলভাবে যাচাই ও সংরক্ষিত হয়েছে! (HD অডিও চলছে)');
        playGeminiAudio(data.audioData);
        setTimeout(() => {
          setShowApiKeyModal(false);
          setApiKeyTestMessage(null);
        }, 1800);
      } else {
        setApiKeyTestMessage('❌ কী যাচাই ব্যর্থ: ' + (data.message || data.error || 'ভুল কী'));
      }
    } catch (e: any) {
      setApiKeyTestMessage('❌ সংযোগ সমস্যা: ' + e.message);
    } finally {
      setIsTestingApiKey(false);
    }
  };

  const currentStyleObj = STYLES.find((s) => s.id === style) || STYLES[0];
  const currentVoiceObj = GEMINI_VOICES.find((v) => v.id === selectedVoice) || GEMINI_VOICES[0];
  const combinedUserTranscript = (liveTranscript + ' ' + speechInterim).trim();

  return (
    <div className="min-h-screen text-[#f1f2f8] flex flex-col items-center justify-start antialiased selection:bg-[#7c5cff] selection:text-white bg-[#0a0d1d] w-full">
      {/* GLOBAL PERSISTENT HEADER (VISIBLE ON ALL SCREENS) */}
      <header className="w-full border-b border-[#2a2f4d]/80 bg-[#0d1021]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <div
            onClick={() => setScreen('setup')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="সেটআপ স্ক্রিনে ফিরুন"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c5cff] to-[#ff5c8a] flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              🎙️
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight block">
                Voice Debate AI
              </span>
              <span className="text-[10px] text-[#a38bff] hidden sm:block">বাংলা ভয়েস বিতর্ক</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* API Key Modal Button - ULTRA PROMINENT & FLASHING */}
            <button
              type="button"
              onClick={() => {
                setApiKeyInput(userApiKey);
                setApiKeyTestMessage(null);
                setShowApiKeyModal(true);
              }}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 ${
                userApiKey
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500/30 via-purple-600/30 to-pink-500/30 border-amber-400 text-amber-300 hover:border-amber-300 animate-pulse'
              }`}
              title="Gemini API Key দিয়ে আনলিমিটেড HD ভয়েস চালান"
            >
              <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{userApiKey ? '🔑 HD Key সক্রিয়' : '🔑 API Key (আনলিমিটেড HD)'}</span>
            </button>

            {/* Direct 1-Click ZIP Download button */}
            <a
              href="/voice-debate-ai.zip"
              download="voice-debate-ai.zip"
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
              title="সরাসরি সম্পূর্ণ ZIP প্রজেক্ট ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ZIP</span>
            </a>

            {/* Offline & Netlify Guide Modal */}
            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#171b30] hover:bg-[#202542] border border-[#2a2f4d] text-xs font-medium text-[#c8cbdf] hover:text-white transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Netlify ডিপ্লয় ও অফলাইন গাইড"
            >
              <FileCode className="w-3.5 h-3.5 text-[#a38bff]" />
              <span className="hidden md:inline">Netlify গাইড</span>
            </button>

            {/* PWA Install */}
            {isInstallable && !isInstalled && (
              <button
                type="button"
                onClick={handlePWAInstall}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white text-xs font-semibold shadow-md flex items-center gap-1 hover:opacity-95 cursor-pointer shrink-0"
                title="অ্যাপ ইনস্টল করুন"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">ইনস্টল</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SCREEN 1: TOPIC & PERSONA SETUP */}
      {screen === 'setup' && (
        <div className="w-full max-w-xl my-auto px-4 py-6">
          <div className="bg-[#171b30] border border-[#2a2f4d] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            {/* Header Badge & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7c5cff]/15 border border-[#7c5cff]/30 text-xs font-semibold text-[#a38bff] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Gemini 3.8 Flash & AI Judge</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#7c5cff] via-[#d06bff] to-[#ff5c8a] bg-clip-text text-transparent pb-1">
                🎙️ Voice Debate AI
              </h1>
              <p className="text-sm sm:text-base text-[#9a9db5] mt-1">
                উচ্চমানের স্পষ্ট বাংলা কণ্ঠস্বরে AI-র সাথে লাইভ বিতর্ক প্রতিযোগিতা
              </p>
            </div>

            {/* User Profile / Photo Setup Card */}
            <div className="mb-6 p-4 rounded-2xl bg-[#11142a] border border-[#2a2f4d]">
              <label className="text-sm font-semibold text-[#c8cbdf] flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#a38bff]" />
                  <span>আপনার ছবি ও প্রোফাইল (Avatar & Name)</span>
                </span>
                <span className="text-[11px] text-[#43d17a] font-medium">বিতর্কে দৃশ্যমান</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Photo Display & Upload Trigger */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#7c5cff] bg-[#171b30] flex items-center justify-center shadow-[0_0_20px_rgba(124,92,255,0.3)] transition-transform group-hover:scale-105">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl select-none">{selectedEmojiAvatar}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Profile Controls */}
                <div className="flex-1 w-full space-y-2.5">
                  {/* Name Input */}
                  <div>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        localStorage.setItem('voice_debate_username', e.target.value);
                      }}
                      placeholder="আপনার নাম বা পরিচয় লিখুন..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#171b30] border border-[#2a2f4d] text-sm text-white placeholder-[#666a85] focus:outline-none focus:border-[#7c5cff]"
                    />
                  </div>

                  {/* Upload and Remove Photo Buttons */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#7c5cff]/20 hover:bg-[#7c5cff]/30 border border-[#7c5cff]/40 text-[#a38bff] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{userAvatar ? 'ছবি পরিবর্তন' : 'গ্যালারি থেকে ছবি দিন'}</span>
                    </button>

                    {userAvatar && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>

                  {/* Preset Avatars */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#9a9db5]">অথবা অবতার বাছুন:</span>
                    <div className="flex items-center gap-1">
                      {PRESET_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => {
                            setSelectedEmojiAvatar(av.emoji);
                            localStorage.setItem('voice_debate_emoji_avatar', av.emoji);
                            if (userAvatar) removePhoto();
                          }}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                            selectedEmojiAvatar === av.emoji && !userAvatar
                              ? 'bg-[#7c5cff] shadow-sm'
                              : 'bg-[#171b30] hover:bg-[#202542]'
                          }`}
                          title={av.label}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Persona Selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-[#c8cbdf] flex items-center justify-between mb-2.5">
                <span>AI প্রতিপক্ষের কণ্ঠস্বর বাছুন (Voice Persona)</span>
                <span className="text-xs text-[#a38bff]">Gemini Studio Voices</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                {GEMINI_VOICES.map((v) => {
                  const isSelected = selectedVoice === v.id;
                  const isTesting = testingVoiceId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#7c5cff]/20 border-[#7c5cff] text-white shadow-[0_0_15px_rgba(124,92,255,0.25)]'
                          : 'bg-[#11142a] border-[#2a2f4d] text-[#c1c4dc] hover:border-[#7c5cff]/50 hover:bg-[#1a1f3c]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <span className="text-xs sm:text-sm font-bold block text-white">{v.name}</span>
                          <span className="text-[10px] text-[#a38bff] font-medium">{v.gender}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            testVoiceSample(v.id, v.sampleText);
                          }}
                          className={`text-[10px] px-2 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                            isTesting
                              ? 'bg-emerald-500 border-emerald-500 text-white animate-pulse'
                              : 'bg-[#171b30] border-[#2a2f4d] text-[#c8cbdf] hover:border-emerald-500 hover:text-white'
                          }`}
                          title="কণ্ঠ শুনুন"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{isTesting ? 'বাজছে...' : 'নমুনা শুনুন'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[#9a9db5] leading-tight line-clamp-2">{v.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dedicated API Key Card inside Setup Form */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#7c5cff]/15 via-[#171b30] to-[#ff5c8a]/15 border border-[#7c5cff]/40 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7c5cff]/20 border border-[#7c5cff]/40 flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Gemini API Key (আনলিমিটেড HD ভয়েস)</span>
                      {userApiKey ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                          সক্রিয়
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                          ফ্রি কোটা মোড
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-[#c8cbdf] mt-0.5">
                      {userApiKey
                        ? 'আপনার নিজস্ব API Key যুক্ত রয়েছে। প্রতিটি রাউন্ডেই আনলিমিটেড স্পষ্ট HD ভয়েস চালু থাকবে।'
                        : 'গুগল ফ্রি অ্যাকাউন্টে দিনে ১০টি HD ভয়েস দেয়। কোনো দৈনিক লিমিট ছাড়াই আনলিমিটেড চালাতে নিজের Key যোগ করুন।'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput(userApiKey);
                    setApiKeyTestMessage(null);
                    setShowApiKeyModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white font-bold text-xs hover:opacity-95 shadow-md shrink-0 cursor-pointer text-center"
                >
                  {userApiKey ? 'কী পরিবর্তন করুন' : '🔑 কী যোগ করুন'}
                </button>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-sm font-semibold text-[#c8cbdf] flex items-center gap-1.5">
                  <span>তর্কের বিষয় বাছুন</span>
                </label>
                <button
                  type="button"
                  onClick={fetchRandomTopics}
                  disabled={isSuggestingTopics}
                  className="text-xs text-[#a38bff] hover:text-[#d06bff] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSuggestingTopics ? 'animate-spin' : ''}`} />
                  <span>নতুন টপিক আনুন</span>
                </button>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {dynamicTopics.map((item) => {
                  const isSelected = topic === item && !customTopic.trim();
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setTopic(item);
                        setCustomTopic('');
                      }}
                      className={`text-xs sm:text-sm px-3.5 py-2 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#7c5cff]/20 border-[#7c5cff] text-white font-medium shadow-[0_0_15px_rgba(124,92,255,0.25)]'
                          : 'bg-[#11142a] border-[#2a2f4d] text-[#c1c4dc] hover:border-[#7c5cff]/50 hover:bg-[#1a1f3c]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Custom Topic Input */}
              <div className="relative">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="অথবা নিজের কোনো পছন্দের বিষয় লিখুন..."
                  className="w-full px-4 py-3 rounded-xl bg-[#11142a] border border-[#2a2f4d] text-white placeholder-[#666a85] focus:outline-none focus:border-[#7c5cff] focus:ring-1 focus:ring-[#7c5cff] text-sm sm:text-base transition-all"
                />
                {customTopic && (
                  <button
                    type="button"
                    onClick={() => setCustomTopic('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666a85] hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    মুছুন
                  </button>
                )}
              </div>
            </div>

            {/* Side Selection: For vs Against */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-[#c8cbdf] block mb-2.5">
                আপনার অবস্থান (Side)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserSide('for')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    userSide === 'for'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-[#11142a] border-[#2a2f4d] text-[#9a9db5] hover:border-emerald-500/50'
                  }`}
                >
                  <span className="text-base font-bold text-emerald-400">👍 আমি পক্ষে (For)</span>
                  <span className="text-xs text-[#9a9db5]">AI বলবে বিপক্ষে (Against)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserSide('against')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    userSide === 'against'
                      ? 'bg-rose-500/15 border-rose-500 text-white font-semibold shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-[#11142a] border-[#2a2f4d] text-[#9a9db5] hover:border-rose-500/50'
                  }`}
                >
                  <span className="text-base font-bold text-rose-400">👎 আমি বিপক্ষে (Against)</span>
                  <span className="text-xs text-[#9a9db5]">AI বলবে পক্ষে (For)</span>
                </button>
              </div>
            </div>

            {/* Debate Style / Persona */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-[#c8cbdf] block mb-2.5">
                AI প্রতিপক্ষের স্টাইল (Debate Persona)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {STYLES.map((st) => {
                  const Icon = st.icon;
                  const active = style === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStyle(st.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#7c5cff]/20 border-[#7c5cff] text-white shadow-[0_0_15px_rgba(124,92,255,0.25)]'
                          : 'bg-[#11142a] border-[#2a2f4d] text-[#9a9db5] hover:border-[#7c5cff]/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${active ? 'text-[#ff5c8a]' : 'text-[#7c5cff]'}`} />
                      <span className="text-xs font-bold text-white">{st.label}</span>
                      <span className="text-[11px] text-[#9a9db5] line-clamp-1 mt-0.5">{st.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={() => startDebate()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white font-bold text-base sm:text-lg shadow-[0_8px_25px_rgba(124,92,255,0.4)] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>তর্ক শুরু করো</span>
              <span className="text-xl">→</span>
            </button>

            <p className="text-center text-xs text-[#9a9db5] mt-4">
              💡 কথা বলার সময় থামলে ইনপুট কেটে যাবে না। নিজের গতিতে গুছিয়ে সম্পূর্ণ যুক্তি বলুন।
            </p>
          </div>
        </div>
      )}

      {/* SCREEN 2: LIVE DEBATE ARENA */}
      {screen === 'debate' && (
        <div className="w-full h-screen flex flex-col max-w-3xl bg-[#0f1221] shadow-2xl relative">
          {/* Header Bar */}
          <header className="px-4 py-3 bg-[#11142a]/90 backdrop-blur-md border-b border-[#2a2f4d] flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (messages.length > 2) {
                    if (confirm('বিতর্ক ত্যাগ করে প্রধান স্ক্রিনে ফিরে যাবেন?')) {
                      stopSpeech();
                      if (isListening) cancelRecording();
                      setScreen('setup');
                    }
                  } else {
                    stopSpeech();
                    if (isListening) cancelRecording();
                    setScreen('setup');
                  }
                }}
                className="p-2 rounded-xl bg-[#171b30] hover:bg-[#202542] border border-[#2a2f4d] text-white transition-colors cursor-pointer"
                title="ফিরে যান"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* User Avatar Badge in Arena */}
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#7c5cff] bg-[#171b30] flex items-center justify-center shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base select-none">{selectedEmojiAvatar}</span>
                )}
              </div>

              <div>
                <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1 max-w-[140px] sm:max-w-xs">
                  {topic}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${currentStyleObj.badgeColor}`}>
                    {currentStyleObj.label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                    🎙️ {currentVoiceObj.name}
                  </span>
                  <span className="text-[11px] text-[#9a9db5] hidden sm:inline">
                    {userName}: <strong className={userSide === 'for' ? 'text-emerald-400' : 'text-rose-400'}>
                      {userSide === 'for' ? 'পক্ষে' : 'বিপক্ষে'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Direct 1-Click ZIP Download link */}
              <a
                href="/voice-debate-ai.zip"
                download="voice-debate-ai.zip"
                className="p-2 rounded-xl bg-[#171b30] hover:bg-emerald-500/20 border border-[#2a2f4d] hover:border-emerald-500/40 text-emerald-400 transition-all cursor-pointer"
                title="সরাসরি ZIP ডাউনলোড করুন"
              >
                <Download className="w-4 h-4" />
              </a>

              {/* Download / Offline Modal Info Button */}
              <button
                type="button"
                onClick={() => setShowDownloadModal(true)}
                className="p-2 rounded-xl bg-[#171b30] border border-[#2a2f4d] text-[#9a9db5] hover:text-white transition-all cursor-pointer"
                title="ডাউনলোড ও Netlify গাইড"
              >
                <FileCode className="w-4 h-4 text-[#a38bff]" />
              </button>

              {/* API Key Modal Button in Arena */}
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput(userApiKey);
                  setApiKeyTestMessage(null);
                  setShowApiKeyModal(true);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  userApiKey
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-gradient-to-r from-amber-500/30 to-purple-600/30 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-pulse'
                }`}
                title="Gemini API Key দিয়ে আনলিমিটেড HD ভয়েস চালান"
              >
                <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold">{userApiKey ? '🔑 HD সক্রিয়' : '🔑 API Key (আনলিমিটেড HD)'}</span>
              </button>

              {/* Voice Settings Dropdown */}
              <button
                type="button"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  showVoiceSettings
                    ? 'bg-[#7c5cff] border-[#7c5cff] text-white'
                    : 'bg-[#171b30] border-[#2a2f4d] text-[#9a9db5] hover:text-white'
                }`}
                title="ভয়েস সেটিংস"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* TTS Voice Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (ttsEnabled && isSpeakingTTS) stopSpeech();
                  setTtsEnabled(!ttsEnabled);
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  ttsEnabled
                    ? 'bg-[#7c5cff]/20 border-[#7c5cff] text-[#a38bff]'
                    : 'bg-[#171b30] border-[#2a2f4d] text-[#666a85]'
                }`}
                title={ttsEnabled ? 'AI ভয়েস চালু আছে' : 'AI ভয়েস বন্ধ'}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Judge / Evaluate Debate */}
              <button
                type="button"
                onClick={requestJudgement}
                disabled={messages.length < 2 || isJudging}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                title="বিতর্কের ফলাফল ও রায় জানুন"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">রায় ঘোষণা</span>
              </button>

              {/* Reset Session */}
              <button
                type="button"
                onClick={() => startDebate(topic)}
                className="p-2 rounded-xl bg-[#171b30] hover:bg-[#202542] border border-[#2a2f4d] text-[#9a9db5] hover:text-white transition-colors cursor-pointer"
                title="নতুন করে শুরু করুন"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Voice Settings Popover */}
              {showVoiceSettings && (
                <div className="absolute right-0 top-12 w-64 bg-[#171b30] border border-[#2a2f4d] rounded-2xl p-4 shadow-2xl z-30 animate-fadeIn">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                    <span>ভয়েস পরিবর্তন করুন</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Gemini HD</span>
                  </h4>
                  <div className="space-y-1.5 mb-3">
                    {GEMINI_VOICES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVoice(v.id);
                          setShowVoiceSettings(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedVoice === v.id
                            ? 'bg-[#7c5cff]/30 text-white font-semibold border border-[#7c5cff]/50'
                            : 'text-[#c8cbdf] hover:bg-[#11142a]'
                        }`}
                      >
                        <span>{v.name}</span>
                        <span className="text-[10px] text-[#9a9db5]">{v.gender}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#2a2f4d]">
                    <div className="flex items-center justify-between text-xs text-[#9a9db5] mb-1">
                      <span>কথা বলার গতি:</span>
                      <span className="text-white font-bold">{speechRate}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[0.9, 1.0, 1.15].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setSpeechRate(rate)}
                          className={`flex-1 py-1 rounded-md text-xs border transition-all cursor-pointer ${
                            speechRate === rate
                              ? 'bg-[#7c5cff] border-[#7c5cff] text-white font-bold'
                              : 'border-[#2a2f4d] text-[#9a9db5] hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Quota limit notice */}
          {quotaExceededNotice && !userApiKey && (
            <div className="mx-4 mt-2.5 mb-1 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>ফ্রি HD ভয়েস দৈনিক কোটা (১০টি) পূর্ণ হয়েছে</strong> (এটি কোনো নেটওয়ার্ক সমস্যা নয়)। আনলিমিটেড স্পষ্ট HD ভয়েস চালাতে নিজের API Key যোগ করুন।
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput('');
                    setApiKeyTestMessage(null);
                    setShowApiKeyModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 cursor-pointer"
                >
                  Key যোগ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setQuotaExceededNotice(false)}
                  className="text-amber-400 hover:text-white px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Transcript Scroll Area */}
          <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !isAiReplying && (
              <div className="text-center py-16 text-[#666a85]">
                <p>বিতর্ক শুরু হচ্ছে...</p>
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const isPlayingThis = isSpeakingTTS && currentPlayingIndex === index;

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full animate-fadeIn`}
                >
                  {/* Speaker Label with Avatar / Photo */}
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {isUser ? (
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-[#ff5c8a] bg-[#171b30] flex items-center justify-center shrink-0">
                        {userAvatar ? (
                          <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] select-none">{selectedEmojiAvatar}</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7c5cff] to-cyan-400 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                        🤖
                      </div>
                    )}
                    <span className="text-[11px] font-medium text-[#c8cbdf]">
                      {isUser ? `${userName} (${userSide === 'for' ? 'পক্ষে' : 'বিপক্ষে'})` : `Gemini AI (${userSide === 'for' ? 'বিপক্ষে' : 'পক্ষে'})`}
                    </span>
                    <span className="text-[10px] text-[#666a85]">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`relative group rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed max-w-[85%] sm:max-w-[78%] shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white rounded-tr-sm'
                        : `bg-[#171b30] border ${
                            isPlayingThis ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-[#2a2f4d]'
                          } text-[#f1f2f8] rounded-tl-sm`
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Quick action bar */}
                    <div
                      className={`flex items-center gap-2 mt-2 pt-1.5 border-t ${
                        isUser ? 'border-white/15' : 'border-[#2a2f4d]'
                      }`}
                    >
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => {
                            if (isPlayingThis) {
                              stopSpeech();
                            } else {
                              speakText(msg.text, msg.audioData, index);
                            }
                          }}
                          disabled={msg.isLoadingAudio}
                          className={`text-xs flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-lg cursor-pointer font-medium ${
                            isPlayingThis
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : msg.isLoadingAudio
                              ? 'bg-[#11142a] text-[#a38bff] border border-[#7c5cff]/40 animate-pulse'
                              : 'bg-[#11142a] text-[#43d17a] hover:bg-emerald-500/20 border border-emerald-500/30'
                          }`}
                          title={isPlayingThis ? 'ভয়েস থামান' : 'স্পষ্ট HD ভয়েসে শুনুন'}
                        >
                          {isPlayingThis ? (
                            <>
                              <Square className="w-2.5 h-2.5 fill-white" />
                              <span className="text-[10px]">থামান</span>
                            </>
                          ) : msg.isLoadingAudio ? (
                            <>
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              <span className="text-[10px]">HD ভয়েস প্রস্তুত হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span className="text-[10px]">HD ভয়েস শুনুন</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => copyMessageText(msg.text, index)}
                        className={`text-xs flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded cursor-pointer ${
                          isUser ? 'text-white/80 hover:text-white' : 'text-[#9a9db5] hover:text-white'
                        }`}
                        title="কপি করুন"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-300" />
                            <span className="text-[10px]">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">কপি</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* INTRO SELECTION CARD: WHO WILL START? */}
            {debatePhase === 'intro' && !isAiReplying && (
              <div className="bg-gradient-to-b from-[#1c2242] to-[#151930] border-2 border-[#7c5cff]/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(124,92,255,0.3)] text-center animate-fadeIn my-3 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c5cff]/20 border border-[#7c5cff]/40 text-xs font-bold text-[#a38bff] mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>বিতর্কের সূচনা পর্ব</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                  বিতর্কটি কে শুরু করবেন?
                </h3>
                <p className="text-xs text-[#c8cbdf] mb-4">
                  আপনি কি প্রথম যুক্তি দিয়ে শুরু করতে চান, নাকি AI-কে প্রথম সূচনা যুক্তি দেওয়ার সুযোগ দেবেন?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleUserStartsDebate}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <Mic className="w-4 h-4" />
                    <span>🎙️ আমি শুরু করব (You First)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAiStartsDebate}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>🤖 আপনি শুরু করুন (AI First)</span>
                  </button>
                </div>

                <div className="mt-3 text-[11px] text-[#9a9db5] flex items-center justify-center gap-1.5 flex-wrap">
                  <span>অথবা সরাসরি মুখে বলুন:</span>
                  <span className="text-[#43d17a] font-medium">"আমি শুরু করব"</span>
                  <span>বা</span>
                  <span className="text-[#a38bff] font-medium">"আপনি শুরু করুন"</span>
                </div>
              </div>
            )}

            {/* LIVE CONTINUOUS SPEECH PANEL */}
            {isListening && (
              <div className="bg-[#171b30] border-2 border-[#ff5c8a] rounded-2xl p-4 shadow-[0_0_25px_rgba(255,92,138,0.25)] animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold text-rose-400">
                      🎙️ শুনছি... সময় নিয়ে সম্পূর্ণ কথা বলুন (থামলে কাটবে না)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="text-xs text-[#9a9db5] hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="বাতিল করুন"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>বাতিল</span>
                  </button>
                </div>

                <div className="min-h-[48px] bg-[#11142a] p-3 rounded-xl border border-[#2a2f4d] text-sm leading-relaxed text-white">
                  {combinedUserTranscript ? (
                    <p>
                      <span>{liveTranscript}</span>{' '}
                      <span className="text-[#ff5c8a] italic font-medium">{speechInterim}</span>
                    </p>
                  ) : (
                    <p className="text-[#666a85] italic text-xs">
                      কথা বলুন... আপনার বক্তব্য এখানে লেখা হবে। থামলে বা চিন্তা করলেও ইনপুট কাটবে না।
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#2a2f4d]">
                  <span className="text-[11px] text-[#9a9db5]">
                    বক্তব্য শেষ হলে পাশের বাটনে চাপুন →
                  </span>
                  <button
                    type="button"
                    onClick={finishRecordingAndSend}
                    disabled={!combinedUserTranscript}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>কথা শেষ, যুক্তি পাঠান</span>
                  </button>
                </div>
              </div>
            )}

            {/* AI Thinking Animation */}
            {isAiReplying && (
              <div className="flex flex-col items-start max-w-full">
                <span className="text-[10px] text-[#a38bff] mb-1 font-medium">Gemini AI ভাবছে...</span>
                <div className="bg-[#171b30] border border-[#2a2f4d] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#7c5cff] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#d06bff] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#ff5c8a] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-[#9a9db5] ml-1">যুক্তি খণ্ডন ও HD বাংলা ভয়েস তৈরি হচ্ছে...</span>
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </main>

          {/* Quick Argument Assistance Chips (Only active during debating phase) */}
          {debatePhase === 'debating' && (
            <div className="px-4 py-1.5 bg-[#11142a]/60 border-t border-[#2a2f4d]/50 flex items-center gap-2 overflow-x-auto text-[11px] text-[#9a9db5]">
              <span className="text-[#a38bff] font-semibold whitespace-nowrap">দ্রুত যুক্তি:</span>
              <button
                type="button"
                onClick={() => handleUserSubmission('আপনার যুক্তির সবচেয়ে বড় সীমাবদ্ধতা হলো বাস্তবতার সাথে এর মিল নেই।')}
                className="px-2.5 py-1 rounded-full bg-[#171b30] hover:bg-[#252b48] border border-[#2a2f4d] whitespace-nowrap cursor-pointer"
              >
                বাস্তবতার অমিল দেখান
              </button>
              <button
                type="button"
                onClick={() => handleUserSubmission('কিন্তু বাস্তব পরিসংখ্যান ও বৈজ্ঞানিক গবেষণা সম্পূর্ণ উল্টো কথা বলছে।')}
                className="px-2.5 py-1 rounded-full bg-[#171b30] hover:bg-[#252b48] border border-[#2a2f4d] whitespace-nowrap cursor-pointer"
              >
                গবেষণার তথ্য টানুন
              </button>
              <button
                type="button"
                onClick={() => handleUserSubmission('আপনি কি অস্বীকার করতে পারেন যে দীর্ঘমেয়াদে এর ক্ষতিকর প্রভাব মারাত্মক?')}
                className="px-2.5 py-1 rounded-full bg-[#171b30] hover:bg-[#252b48] border border-[#2a2f4d] whitespace-nowrap cursor-pointer"
              >
                পাল্টা প্রশ্ন করুন
              </button>
            </div>
          )}

          {/* Action Area Deck */}
          <footer className="bg-[#11142a] border-t border-[#2a2f4d] p-4 flex flex-col items-center gap-3">
            {debatePhase === 'intro' ? (
              /* DEDICATED INTRO PHASE CONTROLS */
              <div className="w-full flex flex-col items-center gap-3 py-1">
                <div className="text-xs text-center text-[#c8cbdf] flex items-center justify-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>বিতর্কের সূচনা কে করবেন? নিচের যেকোনো একটি বাটন বেছে নিন:</span>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={handleUserStartsDebate}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <Mic className="w-4 h-4" />
                    <span>🎙️ আমি শুরু করব</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAiStartsDebate}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-[0_0_25px_rgba(124,92,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>🤖 আপনি শুরু করুন</span>
                  </button>
                </div>

                <div className="text-[11px] text-[#9a9db5] flex items-center justify-center gap-1.5 flex-wrap mt-0.5">
                  <span>অথবা সরাসরি মুখে বলুন:</span>
                  <button
                    type="button"
                    onClick={() => handleUserStartsDebate()}
                    className="text-[#43d17a] font-semibold hover:underline cursor-pointer"
                  >
                    "আমি শুরু করব"
                  </button>
                  <span>বা</span>
                  <button
                    type="button"
                    onClick={() => handleAiStartsDebate()}
                    className="text-[#ff5c8a] font-semibold hover:underline cursor-pointer"
                  >
                    "আপনি শুরু করুন"
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE DEBATING PHASE CONTROLS (MIC & INPUT) */
              <>
                {/* Status text */}
                <div className="text-xs text-center text-[#9a9db5] flex items-center justify-center gap-1.5 min-h-[20px]">
                  {isSpeakingTTS && (
                    <div className="flex items-center gap-0.5 h-3">
                      <span className="w-1 bg-[#43d17a] animate-wave-1 rounded-full inline-block" />
                      <span className="w-1 bg-[#43d17a] animate-wave-2 rounded-full inline-block" />
                      <span className="w-1 bg-[#43d17a] animate-wave-3 rounded-full inline-block" />
                      <span className="w-1 bg-[#43d17a] animate-wave-4 rounded-full inline-block" />
                      <span className="w-1 bg-[#43d17a] animate-wave-5 rounded-full inline-block" />
                    </div>
                  )}
                  <span className={isListening ? 'text-[#ff5c8a] font-semibold animate-pulse' : ''}>
                    {statusText}
                  </span>
                </div>

                {/* Floating Mic Control Center */}
                <div className="relative flex items-center justify-center my-1 gap-4">
                  {/* Outer pulse rings */}
                  <div
                    className={`absolute w-20 h-20 rounded-full border-2 border-[#ff5c8a] ${
                      isListening ? 'pulse-ring-active' : 'opacity-0'
                    }`}
                  />
                  <div
                    className={`absolute w-24 h-24 rounded-full border border-[#7c5cff] ${
                      isListening ? 'pulse-ring-active' : 'opacity-0'
                    }`}
                    style={{ animationDelay: '0.4s' }}
                  />

                  {/* Main Mic Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        finishRecordingAndSend();
                      } else {
                        startRecording();
                      }
                    }}
                    className={`w-18 h-18 rounded-full flex items-center justify-center z-10 transition-all duration-200 shadow-xl cursor-pointer ${
                      isListening
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                        : isSpeakingTTS
                        ? 'bg-gradient-to-r from-[#43d17a] to-[#2ea8ff] shadow-[0_0_25px_rgba(67,209,122,0.5)]'
                        : 'bg-gradient-to-br from-[#7c5cff] to-[#ff5c8a] hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(124,92,255,0.45)]'
                    }`}
                    title={isListening ? 'কথা শেষ, পাঠাতে চাপুন' : 'মাইকে কথা বলা শুরু করুন'}
                  >
                    {isListening ? (
                      <CheckCircle2 className="w-8 h-8 text-white animate-pulse" />
                    ) : isSpeakingTTS ? (
                      <Volume2 className="w-8 h-8 text-white" />
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
                    )}
                  </button>

                  {/* Stop audio button if AI is speaking */}
                  {isSpeakingTTS && (
                    <button
                      type="button"
                      onClick={stopSpeech}
                      className="p-3 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30 transition-all cursor-pointer"
                      title="ভয়েস বন্ধ করুন"
                    >
                      <Square className="w-4 h-4 fill-rose-400" />
                    </button>
                  )}
                </div>

                {/* Fallback Text Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUserSubmission(textInput);
                  }}
                  className="w-full flex items-center gap-2 mt-1"
                >
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="অথবা এখানে টাইপ করে আপনার যুক্তি পাঠান..."
                    disabled={isAiReplying || isListening}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#171b30] border border-[#2a2f4d] text-sm text-white placeholder-[#666a85] focus:outline-none focus:border-[#7c5cff] transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!textInput.trim() || isAiReplying || isListening}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white disabled:opacity-40 hover:opacity-95 transition-all cursor-pointer"
                    title="পাঠান"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </footer>
        </div>
      )}

      {/* MODAL 1: DOWNLOAD & NETLIFY GUIDE MODAL */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#171b30] border border-[#2a2f4d] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative animate-fadeIn">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#11142a] text-[#9a9db5] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#ff5c8a] flex items-center justify-center shadow-[0_0_25px_rgba(124,92,255,0.4)]">
                <FolderArchive className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">ডাউনলোড ও Netlify ডিপ্লয়</h3>
              <p className="text-xs sm:text-sm text-[#9a9db5] mt-1">
                সম্পূর্ণ কোড ZIP আকারে ডাউনলোড করুন অথবা Claude.ai দিয়ে নিজে বানান
              </p>
            </div>

            {/* Direct 1-Click ZIP Download Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#7c5cff]/15 to-[#ff5c8a]/15 border border-emerald-500/40 mb-5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>সরাসরি প্রজেক্ট ZIP ডাউনলোড করুন</span>
              </h4>
              <p className="text-xs text-[#c8cbdf] mb-3 leading-relaxed">
                এই প্রজেক্টের সমস্ত কোড, স্টাইল ও কনফিগারেশন একটি পূর্ণাঙ্গ জিপ ফাইলে প্রস্তুত রয়েছে।
              </p>
              <a
                href="/voice-debate-ai.zip"
                download="voice-debate-ai.zip"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>📥 voice-debate-ai.zip ডাউনলোড করুন</span>
              </a>
            </div>

            {/* Option 2: Copy Prompt for Claude.ai */}
            <div className="p-4 rounded-2xl bg-[#11142a] border border-[#2a2f4d] mb-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <FileCode className="w-3.5 h-3.5 text-[#a38bff]" />
                  <span>Claude.ai-র জন্য মাস্টার প্রম্পট:</span>
                </h4>
                <button
                  type="button"
                  onClick={copyClaudePrompt}
                  className="text-xs text-[#a38bff] hover:text-white flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg border border-[#7c5cff]/30 bg-[#7c5cff]/15 cursor-pointer"
                >
                  {isCopiedClaudePrompt ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>প্রম্পট কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#9a9db5] leading-relaxed mb-2">
                আপনি যদি Claude.ai দিয়ে নিজে এই সেম প্রজেক্ট বানিয়ে নিতে চান, উপরের বাটনে ক্লিক করে প্রম্পটটি কপি করে Claude-কে পেস্ট করে দিন!
              </p>
              <pre className="bg-black/50 p-2.5 rounded-xl border border-[#2a2f4d]/50 font-mono text-[10px] text-[#a38bff] overflow-x-auto max-h-24 whitespace-pre-wrap">
                {CLAUDE_PROMPT_TEMPLATE.slice(0, 240)}...
              </pre>
            </div>

            {/* Netlify Deployment Steps */}
            <div className="space-y-3 bg-[#11142a] p-4 rounded-2xl border border-[#2a2f4d] mb-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Netlify-তে ফ্রিতে হোস্ট করার নিয়ম:</span>
              </h4>

              <div className="space-y-2 text-xs text-[#c8cbdf]">
                <div className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">১</span>
                  <p>জিপ ফাইলটি ডাউনলোড করে আনজিপ করুন অথবা GitHub-এ আপলোড করুন।</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">২</span>
                  <p>Netlify ড্যাশবোর্ডে গিয়ে <strong>"Add new site" &gt; "Import from Git"</strong> নির্বাচন করুন। (প্রজেক্টে <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">netlify.toml</code> ফাইল রেডি আছে)।</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">৩</span>
                  <p>Site Settings &gt; Environment Variables-এ গিয়ে আপনার <code className="text-white bg-black/40 px-1 py-0.5 rounded">GEMINI_API_KEY</code> যুক্ত করে Deploy বাটনে চাপুন।</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#202542] text-[#c8cbdf] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUDICATOR'S VERDICT (প্রধান বিচারকের রায়) */}
      {showJudgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171b30] border border-[#2a2f4d] rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fadeIn">
            {/* Modal Title */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                <Award className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">প্রধান বিচারকের রায়</h3>
              <p className="text-xs sm:text-sm text-[#9a9db5] mt-1">বিষয়: {topic}</p>
            </div>

            {isJudging ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-[#7c5cff] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#c8cbdf] font-medium">উভয় পক্ষের যুক্তিতর্ক নিরপেক্ষভাবে বিশ্লেষণ করা হচ্ছে...</p>
                <p className="text-xs text-[#666a85]">লজিক, প্রামাণিকতা ও উপস্থাপনা শৈলী বিবেচনাধীন</p>
              </div>
            ) : judgeResult ? (
              <div className="space-y-5">
                {/* Winner Callout */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7c5cff]/20 to-[#ff5c8a]/20 border border-[#7c5cff]/40 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {judgeResult.winnerTitle || 'বিজয়ী ঘোষণা'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {judgeResult.winner === 'User'
                      ? `🏆 ${userName} বিজয়ী হয়েছেন!`
                      : judgeResult.winner === 'AI'
                      ? '🤖 Gemini AI বিজয়ী হয়েছে!'
                      : '🤝 লড়াই সমানে সমান (Tie)!'}
                  </div>
                </div>

                {/* Score Comparison Bars with Avatars */}
                <div className="space-y-3 bg-[#11142a] p-4 rounded-2xl border border-[#2a2f4d]">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full overflow-hidden border border-emerald-400 flex items-center justify-center">
                          {userAvatar ? (
                            <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px]">{selectedEmojiAvatar}</span>
                          )}
                        </div>
                        <span className="text-emerald-400">{userName}</span>
                      </div>
                      <span className="text-white font-bold">{judgeResult.userScore} / ১০০</span>
                    </div>
                    <div className="w-full bg-[#1e233f] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(0, judgeResult.userScore))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🤖</span>
                        <span className="text-[#a38bff]">Gemini AI</span>
                      </div>
                      <span className="text-white font-bold">{judgeResult.aiScore} / ১০০</span>
                    </div>
                    <div className="w-full bg-[#1e233f] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(0, judgeResult.aiScore))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Judge's Observation Summary */}
                <div className="bg-[#11142a] p-4 rounded-2xl border border-[#2a2f4d]">
                  <h4 className="text-xs font-bold text-[#c8cbdf] uppercase tracking-wider mb-2">
                    বিচারকের পর্যবেক্ষণ:
                  </h4>
                  <p className="text-xs sm:text-sm text-[#f1f2f8] leading-relaxed">{judgeResult.summary}</p>
                </div>

                {/* Strengths Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-bold text-emerald-400 block mb-1">আপনার শক্তিশালী দিক:</span>
                    <ul className="list-disc list-inside space-y-1 text-[#c8cbdf]">
                      {judgeResult.userStrengths?.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-[#7c5cff]/10 border border-[#7c5cff]/20">
                    <span className="font-bold text-[#a38bff] block mb-1">AI-র শক্তিশালী দিক:</span>
                    <ul className="list-disc list-inside space-y-1 text-[#c8cbdf]">
                      {judgeResult.aiStrengths?.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Constructive Tip */}
                {judgeResult.improvementTip && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#e2e8f0]">
                    <span className="font-bold text-amber-400 block mb-0.5">💡 গঠনমূলক পরামর্শ:</span>
                    {judgeResult.improvementTip}
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowJudgeModal(false);
                  startDebate(topic);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white font-bold text-sm hover:opacity-95 transition-all cursor-pointer text-center"
              >
                পুনরায় বিতর্ক করুন
              </button>
              <button
                type="button"
                onClick={() => setShowJudgeModal(false)}
                className="px-5 py-3 rounded-xl bg-[#11142a] border border-[#2a2f4d] text-[#c8cbdf] hover:text-white text-sm font-semibold transition-all cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GEMINI API KEY MODAL (UNLIMITED HD VOICE) */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#171b30] border border-[#2a2f4d] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setShowApiKeyModal(false);
                setApiKeyTestMessage(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-[#9a9db5] hover:text-white hover:bg-[#202542] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7c5cff] to-cyan-400 flex items-center justify-center text-white shadow-lg">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gemini API Key সেটিংস</h3>
                <span className="text-[11px] text-[#43d17a] font-semibold">আনলিমিটেড ক্রিস্টাল-ক্লিয়ার HD ভয়েস</span>
              </div>
            </div>

            <div className="text-xs text-[#c8cbdf] leading-relaxed mb-4 bg-[#11142a] p-3 rounded-xl border border-[#2a2f4d] space-y-1.5">
              <p>
                💡 <strong className="text-amber-300">গুরুত্বপূর্ণ তথ্য:</strong> HD ভয়েস স্টার্ট না হওয়া আপনার ইন্টারনেট বা নেটওয়ার্কের সমস্যা নয়!
              </p>
              <p>
                Google Gemini Free Tier-এ দিনে মাত্র <strong>১০টি HD অডিও রিকোয়েস্টের কোটা</strong> থাকে। কোটা শেষ হলে গুগল সার্ভার আর অডিও তৈরি করে না। আপনার নিজস্ব ফ্রি Gemini API Key ব্যবহার করলে কোনো লিমিট থাকবে না এবং প্রতিটি রাউন্ডেই ১০০% স্পষ্ট HD কোরি/পাক ভয়েস শুনতে পারবেন।
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#c8cbdf]">আপনার Gemini API Key:</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#a38bff] hover:text-[#d06bff] flex items-center gap-1 transition-colors"
                >
                  <span>ফ্রি Key নিন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11142a] border border-[#2a2f4d] text-white text-xs sm:text-sm font-mono placeholder-[#666a85] focus:outline-none focus:border-[#7c5cff]"
              />
              <span className="text-[10px] text-[#9a9db5] block mt-1">
                আপনার ব্রাউজারের লোকাল স্টোরেজে নিরাপদে সংরক্ষিত থাকবে।
              </span>
            </div>

            {apiKeyTestMessage && (
              <div className={`p-3 rounded-xl text-xs mb-4 ${
                apiKeyTestMessage.includes('✅')
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : apiKeyTestMessage.includes('মুছে')
                  ? 'bg-blue-500/15 border border-blue-500/30 text-blue-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}>
                {apiKeyTestMessage}
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => testAndSaveApiKey(apiKeyInput)}
                disabled={isTestingApiKey}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#ff5c8a] text-white font-bold text-xs sm:text-sm hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isTestingApiKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>যাচাই ও সক্রিয় হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>যাচাই ও সক্রিয় করুন</span>
                  </>
                )}
              </button>

              {userApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput('');
                    testAndSaveApiKey('');
                  }}
                  className="px-3 py-2.5 rounded-xl bg-[#11142a] border border-[#2a2f4d] text-[#ff5c8a] hover:bg-rose-500/10 text-xs font-semibold transition-all cursor-pointer"
                  title="Key মুছে ফেলুন"
                >
                  মুছুন
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowApiKeyModal(false);
                  setApiKeyTestMessage(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#11142a] border border-[#2a2f4d] text-[#c8cbdf] hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
      {/* FLOATING PERSISTENT QUICK-ACCESS BUTTON (VISIBLE ANYWHERE ON MOBILE & DESKTOP) */}
      {!userApiKey && (
        <button
          type="button"
          onClick={() => {
            setApiKeyInput(userApiKey);
            setApiKeyTestMessage(null);
            setShowApiKeyModal(true);
          }}
          className="fixed bottom-5 right-4 z-50 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-[#7c5cff] text-white text-xs font-bold shadow-[0_6px_25px_rgba(245,158,11,0.45)] border border-amber-300/60 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
          title="আনলিমিটেড স্পষ্ট HD ভয়েস পেতে নিজের Gemini API Key যুক্ত করুন"
        >
          <Key className="w-4 h-4 text-amber-200 shrink-0" />
          <span>🔑 API Key (আনলিমিটেড HD)</span>
        </button>
      )}
    </div>
  );
}
