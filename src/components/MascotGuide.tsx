import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Volume2, VolumeX, Sparkles, Send, Mic, HelpCircle } from "lucide-react";
import { SoundEffects } from "../lib/sound";
import { speak, cancelSpeech, isSpeechEnabled, setSpeechEnabled } from "../lib/speech";

interface Message {
  id: string;
  role: "user" | "bibi";
  text: string;
}

interface MascotGuideProps {
  onEarnStars: (amount: number, description: string) => void;
  currentModuleProficiency?: any;
}

export default function MascotGuide({ onEarnStars, currentModuleProficiency }: MascotGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bibi",
      text: "Xin chào bạn nhỏ yêu quý! Tớ là Gấu BiBi đây! Hôm nay chúng mình cùng học chữ cái và làm toán thật vui nhé! Bé muốn hỏi gì BiBi nào?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(isSpeechEnabled());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Greet on mount with tiny wobble sound
    SoundEffects.playHoverWobble();
  }, []);

  useEffect(() => {
    // Auto-scroll chat
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync voice settings state when chat panel is opened
  useEffect(() => {
    if (isOpen) {
      setVoiceEnabled(isSpeechEnabled());
    }
  }, [isOpen]);

  // Voice synthesis text-to-speech for Vietnamese
  const speakText = (text: string, force?: boolean) => {
    speak(text, {
      pitch: 1.35,
      rate: 0.95,
      force,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };


  // Quick preset bubble choices for 5-6 year old child
  const presetPrompts = [
    { title: "🎨 Khám phá tô màu?", action: "Bày tớ cách tô mầu sáng tạo sao cho đẹp với BiBi ơi!" },
    { title: "🔢 Đố vui phép đếm", action: "Đố tớ đếm xem 3 chú voi thêm 2 chú voi là mấy?" },
    { title: "🔤 Bí kíp chữ A", action: "Kể tớ nghe chữ A có hình gì và cách nhớ chữ A đi!" },
    { title: "🐻 Kể chuyện cười", action: "BiBi kể tớ nghe một câu chuyện cười vui nhộn nho nhỏ đi!" },
  ];

  const handleSendMessage = async (typedText?: string) => {
    const textToSend = typedText || chatText;
    if (!textToSend.trim()) return;

    SoundEffects.playPop();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setChatText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            text: m.text
          }))
        })
      });
      
      const data = await response.json();
      const bibiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bibi",
        text: data.text || "BiBi đang suy nghĩ điều tuyệt vời rực rỡ..."
      };

      setMessages(prev => [...prev, bibiMsg]);
      setIsLoading(false);
      
      // Auto read response
      setTimeout(() => {
        speakText(bibiMsg.text);
      }, 100);

      // Child gets a star if they talk 3 times!
      if (messages.filter(m => m.role === "user").length === 2 && typedText) {
        onEarnStars(5, "Trò chuyện tương tác hăng say với Gấu BiBi");
      }

    } catch (e) {
      console.error(e);
      setIsLoading(false);
      const errReply: Message = {
        id: (Date.now() + 1).toString(),
        role: "bibi",
        text: "Ôi bão giông ngoài kia làm gián đoạn liên lạc rồi! Bé đừng buồn, chúng mình tập trung múa hát và tô vẽ tiếp nhé!"
      };
      setMessages(prev => [...prev, errReply]);
    }
  };

  // Simple HTML5 speech input emulator for voice interaction practice
  const handleVoiceListen = () => {
    SoundEffects.playPop();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      // Speak visual message
      const alertBubble: Message = {
        id: Date.now().toString(),
        role: "bibi",
        text: "Hệ thống duyệt web của bé chưa mở tính năng thu âm trực tiếp đâu nè. Nhưng bé có thể chọn các câu hỏi vui có sẵn bên dưới nha!"
      };
      setMessages(prev => [...prev, alertBubble]);
      speakText(alertBubble.text, true);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const resultsText = event.results[0][0].transcript;
      if (resultsText) {
        setChatText(resultsText);
        handleSendMessage(resultsText);
      }
      setIsListening(false);
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech API error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {/* Floating Animated Mascot Avatar */}
      <div 
        id="mascot-reactor-anchor" 
        className="fixed bottom-6 right-6 z-50 flex flex-col items-center"
      >
        <button
          onClick={() => {
            SoundEffects.playPop();
            setIsOpen(!isOpen);
          }}
          className={`group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-xl border-4 border-white transition-all duration-300 hover:scale-115 active:scale-95 ${
            isOpen ? "ring-4 ring-orange-300" : "animate-bounce"
          }`}
          style={{ animationDuration: "3s" }}
          title="Trò chuyện với Gấu BiBi"
        >
          {/* Animated cute bear snout & sparkles */}
          <div className="absolute inset-0 flex items-center justify-center text-4xl select-none">
            🐻
          </div>
          
          <span className="absolute -top-3 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-pulse">
            !
          </span>

          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-orange-500 border border-orange-200 shadow shadow-amber-300 transition-colors group-hover:bg-amber-100">
            <MessageCircle className="h-4 w-4" />
          </div>
        </button>
        <span className="mt-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-amber-300 shadow border border-amber-300/30">
          Gấu BiBi AI 🤖
        </span>
      </div>

      {/* Expandable Chat Dialogue Canvas */}
      {isOpen && (
        <div 
          id="mascot-chat-panel" 
          className="fixed bottom-28 right-6 z-50 w-[350px] max-w-[calc(100vw-32px)] flex flex-col rounded-3xl bg-lime-50/95 border-4 border-yellow-400 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
        >
          {/* Header Panel */}
          <div className="flex items-center justify-between bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 border border-yellow-300 text-3xl">
                🐻
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Bạn Gấu BiBi AI</h3>
                <p className="text-[11px] text-amber-100 flex items-center gap-1 font-medium">
                  <Sparkles className="h-3 w-3 text-yellow-200 animate-spin" /> Đang sột soạt giúp bé học tập
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick TTS Speech Toggle */}
              <button
                onClick={() => {
                  SoundEffects.playPop();
                  const nextVal = !voiceEnabled;
                  setVoiceEnabled(nextVal);
                  setSpeechEnabled(nextVal);
                  if (!nextVal) {
                    cancelSpeech();
                  }
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                  voiceEnabled
                    ? "bg-amber-100 text-orange-600 border-amber-300 shadow shadow-amber-200"
                    : "bg-black/15 text-white/90 border-transparent hover:bg-black/25"
                }`}
                title={voiceEnabled ? "Tắt giọng đọc" : "Bật giọng đọc chuẩn tiếng Việt"}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => {
                  SoundEffects.playPop();
                  setIsOpen(false);
                  cancelSpeech();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-white hover:bg-black/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats Banner inside Guide */}
          <div className="bg-amber-100/60 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-medium font-mono">
            <span>✨ Năng lực vũ trụ của bé</span>
            <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[10px]">
              Gấp bội 🌟
            </span>
          </div>

          {/* Messages Scrolling Arena */}
          <div className="flex-1 max-h-[260px] min-h-[160px] overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.role === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div
                  className={`relative p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-br-none"
                      : "bg-white text-slate-800 border-2 border-amber-200 rounded-bl-none font-medium"
                  }`}
                >
                  {m.text}
                  {m.role === "bibi" && (
                    <button
                      onClick={() => {
                        SoundEffects.playPop();
                        speakText(m.text, true);
                      }}
                      className="absolute -bottom-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-400 text-white shadow hover:bg-orange-500 transition-transform active:scale-90"
                      title="Nghe BiBi đọc"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                  {m.role === "user" ? "Bạn nhỏ" : "Gấu BiBi"}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="self-start flex items-center gap-2 bg-white/70 border border-slate-200 p-2.5 rounded-2xl shadow-sm text-xs text-slate-500">
                <span className="flex h-2 w-2 animate-bounce rounded-full bg-amber-500"></span>
                <span className="flex h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:0.2s]"></span>
                <span className="flex h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:0.4s]"></span>
                <span>BiBi đang lục lọi ba lô trí tuệ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Choice Prompts Bubbles */}
          <div className="px-4 py-2 border-t border-yellow-200/50 bg-yellow-50 flex flex-wrap gap-1.5 justify-center">
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.action)}
                className="text-[11px] font-semibold bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-2.5 py-1.5 rounded-xl shadow-xs transition-all"
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Text Input Sandbox */}
          <div className="p-3 bg-white border-t border-yellow-200/80 flex gap-2 items-center">
            <button
              onClick={handleVoiceListen}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-orange-100 text-orange-600 hover:bg-orange-200"
              }`}
              title="Đọc giọng nói trực tiếp cho BiBi nghe"
            >
              <Mic className="h-4 w-4" />
            </button>
            
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Bé muốn tâm sự gì nè..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            
            <button
              onClick={() => handleSendMessage()}
              className="p-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:opacity-90 active:scale-95 rounded-xl shadow shadow-amber-300 flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
