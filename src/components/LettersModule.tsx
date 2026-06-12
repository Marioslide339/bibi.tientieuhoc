import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Volume2, RotateCcw, AlertCircle, Play, Eye, Check, Paintbrush, Award, Trash2 } from "lucide-react";
import { SoundEffects } from "../lib/sound";
import { speak } from "../lib/speech";

interface LettersModuleProps {
  onEarnStars: (amount: number, description: string) => void;
  onAddBadge: (badge: string) => void;
  onUpdateProficiency: (module: "letters" | "math", score: number) => void;
}

const getStrokeGuide = (letter: string) => {
  const guides: Record<string, string> = {
    "A": "↗️ ↘️ ➡️ (Lên, xuống, gạch ngang)",
    "Ă": "↗️ ↘️ ➡️ 🌙 (Lên, xuống, ngang, á cong)",
    "Â": "↗️ ↘️ ➡️ 🎩 (Lên, xuống, ngang, mũ xuôi)",
    "B": "⬇️ ↪️ ↪️ (Thẳng đứng, hai nét cong phải)",
    "C": "↩️ (Nét cong hở phải)",
    "D": "⬇️ ↪️ (Thẳng đứng, nét cong phải)",
    "Đ": "⬇️ ↪️ ➡️ (Thẳng, nét cong, gạch ngang)",
    "E": "⬇️ ➡️ ➡️ ➡️ (Thẳng, ba gạch ngang ngang)",
    "Ê": "⬇️ ➡️ ➡️ ➡️ 🎩 (Thêm mũ xuôi lên đầu)",
    "G": "↩️ ⬇️ (Tròn khép kín, nét móc xuống)",
    "H": "⬇️ ⬇️ ➡️ (Hai đứng thẳng, ngang ở giữa)",
    "I": "⬇️ 🔴 (Thẳng đứng ngắn, chấm ở đầu)",
    "K": "⬇️ ↙️ ↘️ (Thẳng đứng, xiên trái, xiên phải)",
    "L": "⬇️ ➡️ (Thẳng đứng xuống, nằm ngang dưới)",
    "M": "⬇️ ↗️ ↘️ ⬇️ (Thẳng đứng, xiên lên, xuống, đứng)",
    "N": "⬇️ ↗️ ⬇️ (Thẳng đứng, xiên lên, đứng thẳng)",
    "O": "🔴 (Vòng tròn khép kín to tròn)",
    "Ô": "🔴 🎩 (Tròn khép kín, thêm mũ nhỏ)",
    "Ơ": "🔴 🪝 (Tròn khép kín, thêm móc nhỏ râu)",
    "P": "⬇️ ↪️ (Thẳng đứng, nét cong tròn phải trên)",
    "Q": "🔴 ↘️ (Tròn khép kín, xiên chéo dưới)",
    "R": "⬇️ ↪️ ↘️ (Thẳng đứng, cong trên, xiên phải)",
    "S": "↩️ ↪️ (Uốn cong từ trái qua phải)",
    "T": "⬇️ ➡️ (Thẳng đứng xuống, nằm ngang trên)",
    "U": "⬇️ ➡️ ⬆️ (Nét móc ngược hướng lên)",
    "Ư": "⬇️ ➡️ ⬆️ 🪝 (Móc ngược, thêm râu móc nhỏ)",
    "V": "↘️ ↗️ (Xiên xuống phải, xiên lên phải)",
    "X": "↘️ ↙️ (Hai đường xiên chéo cắt nhau)",
    "Y": "↘️ ↙️ ⬇️ (Nét xiên ngắn, xiên dài xuống chân)"
  };
  return guides[letter.toUpperCase()] || "✍️ Nét vẽ sáng tạo tự do";
};

export default function LettersModule({ onEarnStars, onAddBadge, onUpdateProficiency }: LettersModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"learn" | "match" | "bubbles" | "writing">("learn");
  const [successToast, setSuccessToast] = useState<{ message: string; title?: string } | null>(null);

  // Vietnamese Alphabet Data - 29 Letters
  const alphabet = [
    { uppercase: "A", lowercase: "a", word: "Quả Táo 🍎", sound: "a" },
    { uppercase: "Ă", lowercase: "ă", word: "Con Măng 🎍", sound: "ă" },
    { uppercase: "Â", lowercase: "â", word: "Quả Mận 🍑", sound: "â" },
    { uppercase: "B", lowercase: "b", word: "Quả Bóng ⚽", sound: "bờ" },
    { uppercase: "C", lowercase: "c", word: "Con Cua 🦀", sound: "cờ" },
    { uppercase: "D", lowercase: "d", word: "Quả Dừa 🥥", sound: "dờ" },
    { uppercase: "Đ", lowercase: "đ", word: "Đôi Đũa 🥢", sound: "đờ" },
    { uppercase: "E", lowercase: "e", word: "Em Bé 👶", sound: "e" },
    { uppercase: "Ê", lowercase: "ê", word: "Con Ếch 🐸", sound: "ê" },
    { uppercase: "G", lowercase: "g", word: "Con Gà 🐔", sound: "gờ" },
    { uppercase: "H", lowercase: "h", word: "Bông Hoa 🌸", sound: "hờ" },
    { uppercase: "I", lowercase: "i", word: "Viên Bi 🔮", sound: "i" },
    { uppercase: "K", lowercase: "k", word: "Cái Kéo ✂️", sound: "ca" },
    { uppercase: "L", lowercase: "l", word: "Con Lợn 🐷", sound: "lờ" },
    { uppercase: "M", lowercase: "m", word: "Con Mèo 🐱", sound: "mờ" },
    { uppercase: "N", lowercase: "n", word: "Quả Na 🍈", sound: "nờ" },
    { uppercase: "O", lowercase: "o", word: "Chùm Ong 🐝", sound: "o" },
    { uppercase: "Ô", lowercase: "ô", word: "Cái Ô ☂️", sound: "ô" },
    { uppercase: "Ơ", lowercase: "ơ", word: "Lá Cờ 🚩", sound: "ơ" },
    { uppercase: "P", lowercase: "p", word: "Đèn Pin 🔦", sound: "pờ" },
    { uppercase: "Q", lowercase: "q", word: "Hộp Quà 🎁", sound: "quờ" },
    { uppercase: "R", lowercase: "r", word: "Con Rùa 🐢", sound: "rờ" },
    { uppercase: "S", lowercase: "s", word: "Ngôi Sao ⭐", sound: "sờ" },
    { uppercase: "T", lowercase: "t", word: "Quả Táo 🍎", sound: "tờ" },
    { uppercase: "U", lowercase: "u", word: "Cái Mũ 👒", sound: "u" },
    { uppercase: "Ư", lowercase: "ư", word: "Con Sư Tử 🦁", sound: "ư" },
    { uppercase: "V", lowercase: "v", word: "Con Vịt 🦆", sound: "vờ" },
    { uppercase: "X", lowercase: "x", word: "Xe Máy 🛵", sound: "xờ" },
    { uppercase: "Y", lowercase: "y", word: "Y tá 👩‍⚕️", sound: "y" },
  ];

  const speakLetter = (text: string, word: string) => {
    SoundEffects.playPop();
    speak(`Chữ ${text}. ${word}`, {
      pitch: 1.4,
      rate: 0.85,
      force: true
    });
  };

  const [selectedLetter, setSelectedLetter] = useState(alphabet[0]);

  // SUB-GAME 2: Match Letter Caps to Lowercase state
  const [matchPairs, setMatchPairs] = useState<{ upper: string; lower: string; matched: boolean }[]>([]);
  const [selectedUpper, setSelectedUpper] = useState<string | null>(null);
  const [selectedLower, setSelectedLower] = useState<string | null>(null);

  useEffect(() => {
    generateMatchGame();
  }, []);

  const generateMatchGame = () => {
    // Pick 5 random letters
    const shuffled = [...alphabet].sort(() => 0.5 - Math.random()).slice(0, 5);
    const pairs = shuffled.map(x => ({
      upper: x.uppercase,
      lower: x.lowercase,
      matched: false
    }));
    setMatchPairs(pairs);
    setSelectedUpper(null);
    setSelectedLower(null);
  };

  const handleUpperSelect = (u: string) => {
    SoundEffects.playPop();
    setSelectedUpper(u);
    if (selectedLower) {
      checkMatch(u, selectedLower);
    }
  };

  const handleLowerSelect = (l: string) => {
    SoundEffects.playPop();
    setSelectedLower(l);
    if (selectedUpper) {
      checkMatch(selectedUpper, l);
    }
  };

  const checkMatch = (u: string, l: string) => {
    const pair = matchPairs.find(p => p.upper === u && p.lower === l);
    if (pair) {
      // Correct Match!
      SoundEffects.playSuccess();
      setMatchPairs(prev => prev.map(p => p.upper === u ? { ...p, matched: true } : p));
      onEarnStars(2, `Ghép chữ hoa ${u} với chữ thường ${l}`);
      
      // Update letter proficiency slightly
      onUpdateProficiency("letters", 15);
    } else {
      SoundEffects.playError();
    }
    setSelectedUpper(null);
    setSelectedLower(null);

    // Check if fully matched
    setTimeout(() => {
      if (matchPairs.every(p => p.upper === u ? true : p.matched)) {
        SoundEffects.playStarReward();
        onEarnStars(10, "Hoàn thành xuất sắc bài tập ghép chuỗi chữ hoa!");
        onAddBadge("KỶ LỤC GIA CHỮ ĐẸP 🎴");
        setSuccessToast({
          title: "Ghép Cặp Thành Công! 🎉",
          message: "Tuyệt đỉnh bạn nhỏ! Bé đã ghép mượt mà toàn bộ chữ hoa và chữ thường rồi nhé!"
        });
        generateMatchGame();
      }
    }, 400);
  };

  // SUB-GAME 3: Floating letter bubbles pop
  const [bubbles, setBubbles] = useState<{ id: number; char: string; x: number; y: number; speed: number }[]>([]);
  const [bubbleTarget, setBubbleTarget] = useState("A");
  const [bubbleScore, setBubbleScore] = useState(0);

  const startBubbleGame = () => {
    const target = alphabet[Math.floor(Math.random() * alphabet.length)].uppercase;
    setBubbleTarget(target);
    setBubbleScore(0);
    
    // Create initial 10 bubbles
    const initialBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      char: Math.random() > 0.4 ? target : alphabet[Math.floor(Math.random() * alphabet.length)].uppercase,
      x: 10 + Math.random() * 80, // % width
      y: 100 + Math.random() * 100, // starting below
      speed: 1 + Math.random() * 2
    }));
    setBubbles(initialBubbles);
  };

  // Simulated game ticks to slide bubbles up
  useEffect(() => {
    if (activeSubTab !== "bubbles") return;
    if (bubbles.length === 0) {
      startBubbleGame();
    }

    const interval = setInterval(() => {
      setBubbles(prev => prev.map(b => {
        let newY = b.y - b.speed;
        if (newY < -10) {
          // recycle bubble
          newY = 110;
          return {
            ...b,
            char: Math.random() > 0.3 ? bubbleTarget : alphabet[Math.floor(Math.random() * alphabet.length)].uppercase,
            x: 10 + Math.random() * 80,
            y: newY
          };
        }
        return { ...b, y: newY };
      }));
    }, 45);

    return () => clearInterval(interval);
  }, [activeSubTab, bubbles, bubbleTarget]);

  const popBubble = (id: number, char: string) => {
    SoundEffects.playPop();
    if (char === bubbleTarget) {
      SoundEffects.playSuccess();
      setBubbleScore(prev => prev + 1);
      onEarnStars(1, `Bắn bóng trúng chữ cái ${char}`);
      
      // Update letters score
      onUpdateProficiency("letters", 8);

      if (bubbleScore + 1 >= 5) {
        SoundEffects.playStarReward();
        onEarnStars(10, `Đạt 5 bóng chữ ${bubbleTarget} lấp lánh`);
        setSuccessToast({
          title: "Bắn Bóng Siêu Phàm! 🎈",
          message: `Bé thật tinh mắt! Tìm đủ các bong bóng mang chữ '${bubbleTarget}' rồi đó!`
        });
        startBubbleGame();
      }
    } else {
      SoundEffects.playError();
      setBubbleScore(prev => Math.max(0, prev - 1));
    }

    // replace popped bubble
    setBubbles(prev => prev.map(b => b.id === id ? {
      ...b,
      char: Math.random() > 0.45 ? bubbleTarget : alphabet[Math.floor(Math.random() * alphabet.length)].uppercase,
      y: 110,
      x: 10 + Math.random() * 80
    } : b));
  };


  // SUB-GAME 4: Blackboard handwriting + AI scorer canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [targetWrite, setTargetWrite] = useState("A");
  const [loadingAiEvaluation, setLoadingAiEvaluation] = useState(false);
  const [writeFeedback, setWriteFeedback] = useState<string>("");
  const [earnedStarsNum, setEarnedStarsNum] = useState<number | null>(null);

  useEffect(() => {
    if (activeSubTab === "writing" && canvasRef.current) {
      clearChalkboard();
    }
  }, [activeSubTab, targetWrite]);

  const clearChalkboard = () => {
    SoundEffects.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // slate background
    ctx.fillStyle = "#1e293b"; // slate 800 chalkboard
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // dashed guidance line for kid writing
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    
    // horizontal middle guard line & circle anchor
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Reset evaluator state
    setWriteFeedback("");
    setEarnedStarsNum(null);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get exact mouse position taking scale offset
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Scale coordinates based on canvas display width/height vs internal width/height
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    // Drawing style resembling liquid chalk!
    ctx.strokeStyle = "#e11d48"; // bright solid chalk rose
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
  };

  // Submit sketch to AI vision pipeline endpoint
  const evaluateHandwriting = async () => {
    SoundEffects.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoadingAiEvaluation(true);
    setWriteFeedback("");
    setEarnedStarsNum(null);

    // Export raw png data
    const dataUrl = canvas.toDataURL("image/png");

    try {
      const response = await fetch("/api/gemini/evaluate-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          target: targetWrite,
          type: "write"
        })
      });
      const data = await response.json();
      
      setLoadingAiEvaluation(false);
      setWriteFeedback(data.feedback);
      setEarnedStarsNum(data.score || 5);
      
      // Award stars earned in UI
      onEarnStars(data.score, `Tập viết chữ cái '${targetWrite}' được AI chấm điểm`);
      onUpdateProficiency("letters", 20);

      if (data.score >= 4) {
        SoundEffects.playStarReward();
        onAddBadge("TÀI NĂNG CHỮ ĐẸP VÀNG ⭐");
      } else {
        SoundEffects.playError();
      }

      // Voice read feedback naturally
      speak(data.feedback, {
        pitch: 1.3,
        rate: 0.95
      });

    } catch (err) {
      console.error(err);
      setLoadingAiEvaluation(false);
      setWriteFeedback("Wow! Bé có nét viết nét thanh nét đậm rất có khiếu hội họa nghệ thuật luôn! Gấu BiBi tặng bé 5 sao khích lệ nhé!");
      setEarnedStarsNum(5);
      onEarnStars(5, "Tập viết chữ cái sáng tạo");
    }
  };

  return (
    <div id="letters-arena-wrapper" className="bg-rose-50/50 rounded-3xl p-6 border-4 border-rose-300">
      
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="text-4xl">🔤</div>
          <div>
            <h2 className="text-2xl font-black text-rose-900 tracking-tight">Khu Vườn Chữ Cái Vui Nhộn</h2>
            <p className="text-xs text-rose-700 font-medium">Làm quen 29 chữ cái Tiếng Việt, ghép cặp chữ và luyện chữ đẹp cùng AI!</p>
          </div>
        </div>

        {/* Sub-tab selection menu */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { SoundEffects.playPop(); setActiveSubTab("learn"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeSubTab === "learn"
                ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                : "bg-white text-rose-700 hover:bg-rose-100 border-rose-200"
            }`}
          >
            🍎 Học Chữ Cái
          </button>
          
          <button
            onClick={() => { SoundEffects.playPop(); setActiveSubTab("match"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeSubTab === "match"
                ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                : "bg-white text-rose-700 hover:bg-rose-100 border-rose-200"
            }`}
          >
            🧩 Ghép Chữ Hoa
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setActiveSubTab("bubbles"); startBubbleGame(); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeSubTab === "bubbles"
                ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                : "bg-white text-rose-700 hover:bg-rose-100 border-rose-200"
            }`}
          >
            🎈 Bắn Bóng Chữ
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setActiveSubTab("writing"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeSubTab === "writing"
                ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                : "bg-white text-rose-700 hover:bg-rose-100 border-rose-200"
            }`}
          >
            ✍️ AI Tập Viết Chữ
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Learn letters */}
      {activeSubTab === "learn" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Letters selection panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 border-2 border-rose-200 shadow-xs max-h-[380px] overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tủ sách 29 chữ cái kì diệu</h4>
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
              {alphabet.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedLetter(item);
                    speakLetter(item.uppercase, item.word);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${
                    selectedLetter.uppercase === item.uppercase
                      ? "bg-rose-400 border-rose-500 text-white shadow-md shadow-rose-200"
                      : "bg-slate-50 hover:bg-slate-150 text-slate-700 border-slate-200"
                  }`}
                >
                  <span className="text-xl font-extrabold">{item.uppercase}</span>
                  <span className="text-xs font-bold text-slate-500/80 group-hover:text-white leading-none">{item.lowercase}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Letter Presentation Focus card */}
          <div className="bg-white rounded-3xl p-6 border-4 border-rose-300 text-center shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-2 right-2 flex items-center justify-center p-1 font-black bg-rose-200 text-rose-900 rounded-full text-[10px] uppercase">
              ✨ Bé Đọc Theo
            </div>

            <div className="my-3">
              <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-400 block tracking-wider select-none mb-1">
                {selectedLetter.uppercase} {selectedLetter.lowercase}
              </span>
              <div className="bg-rose-100/60 rounded-xl px-3 py-1.5 inline-block text-xs font-black text-rose-800 border border-rose-250 mb-2">
                🔊 Phát âm âm Việt: "{selectedLetter.sound}"
              </div>
              <p className="text-[11px] font-bold text-slate-500 mt-1 flex flex-wrap items-center justify-center gap-1 leading-tight">
                ✏️ Nét viết: <span className="font-sans text-rose-600 font-extrabold">{getStrokeGuide(selectedLetter.uppercase)}</span>
              </p>
            </div>

            {/* Custom vector like presentation context */}
            <div className="bg-rose-50 rounded-2xl p-3 border-2 border-rose-200/50 mb-3 flex items-center justify-center gap-3">
              <div className="text-5xl select-none animate-bounce">
                {selectedLetter.word.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji}/gu)?.[0] || "🍎"}
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Vật minh họa</p>
                <p className="text-md font-black text-slate-800 mt-0.5">
                  {selectedLetter.word}
                </p>
              </div>
            </div>

            <button
              onClick={() => speakLetter(selectedLetter.uppercase, selectedLetter.word)}
              className="w-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs py-3 rounded-2xl shadow shadow-rose-350 flex items-center gap-1.5 justify-center transition-all"
            >
              <Volume2 className="h-4.5 w-4.5" /> NGHE GIỌNG NÓI CHUẨN 🔊
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Match Caps to Lowercase */}
      {activeSubTab === "match" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-rose-200 shadow-sm text-center">
          <div className="max-w-md mx-auto mb-6">
            <h3 className="font-extrabold text-slate-800 text-md">Bé Tìm Cặp Chữ Trùng Đầu 🧩</h3>
            <p className="text-xs text-slate-500">Mẹo: Một bạn là chữ hoa cao to, một bạn là chữ thường bé nhỏ. Chạm vào chữ hoa rồi chạm vào bạn tương ứng để ghép đôi nhé!</p>
          </div>

          <div className="flex flex-row gap-2 sm:gap-6 justify-center items-center max-w-md mx-auto w-full">
            {/* Uppercase pillar */}
            <div className="flex flex-col gap-2 flex-1 max-w-[130px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center truncate">Chữ hoa 🅰️</span>
              {matchPairs.map((p, idx) => (
                <button
                  key={idx}
                  disabled={p.matched}
                  onClick={() => handleUpperSelect(p.upper)}
                  className={`py-3 px-1 rounded-2xl font-black text-md border-2 transition-all ${
                    p.matched
                      ? "bg-slate-105 text-slate-300 border-slate-200 cursor-not-allowed opacity-40"
                      : selectedUpper === p.upper
                        ? "bg-rose-400 border-rose-500 text-white shadow shadow-rose-300 scale-103"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {p.upper} {p.matched && "✅"}
                </button>
              ))}
            </div>

            {/* Middle connecting line */}
            <div className="text-2xl sm:text-3xl text-rose-300 select-none font-bold shrink-0">
              ↔️
            </div>

            {/* Lowercase pillar shuffled */}
            <div className="flex flex-col gap-2 flex-1 max-w-[130px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center truncate">Chữ thường ⓐ</span>
              {[...matchPairs].sort((a,b) => a.lower.localeCompare(b.lower)).map((p, idx) => (
                <button
                  key={idx}
                  disabled={p.matched}
                  onClick={() => handleLowerSelect(p.lower)}
                  className={`py-3 px-1 rounded-2xl font-black text-md border-2 transition-all ${
                    p.matched
                      ? "bg-slate-105 text-slate-300 border-slate-200 cursor-not-allowed opacity-40"
                      : selectedLower === p.lower
                        ? "bg-orange-400 border-orange-500 text-white shadow shadow-orange-300 scale-103"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {p.lower} {p.matched && "✅"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { SoundEffects.playPop(); generateMatchGame(); }}
            className="mt-6 text-xs text-rose-600 hover:text-rose-800 font-bold"
          >
            🔄 Tạo Bàn Ghép Khác
          </button>
        </div>
      )}

      {/* SUB-TAB 3: Bubble Pop Letter Match */}
      {activeSubTab === "bubbles" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-rose-250 shadow-sm relative overflow-hidden">
          
          {/* Game Scoreboard */}
          <div className="flex items-center justify-between border-b pb-3 mb-4 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
            <div>
              <p className="text-[10px] font-black text-rose-700 uppercase leading-none">Mục Tiêu Trò Chơi</p>
              <h4 className="text-lg font-black text-slate-800">
                Tìm và Bắn bong bóng chữ: <span className="text-rose-600 text-xl font-black bg-rose-100 px-3 py-1 rounded-full">{bubbleTarget}</span>
              </h4>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 leading-none">Sao Vàng Thu Hoạch</p>
              <span className="text-xl font-zinc text-yellow-500 font-black">
                {bubbleScore} / 5 ⭐
              </span>
            </div>
          </div>

          {/* Shooting Arena Canvas simulation */}
          <div className="relative w-full h-[320px] bg-sky-200/40 rounded-2xl border-2 border-sky-200 overflow-hidden shadow-inner">
            <div className="absolute inset-x-0 bottom-2 text-center text-[10px] text-sky-600 font-bold tracking-widest animate-pulse select-none">
              🫧 BÓNG ĐANG BAY LÊN - BÉ CHẠM ĐỂ BẮN 🫧
            </div>

            {bubbles.map((b) => (
              <button
                key={b.id}
                onClick={() => popBubble(b.id, b.char)}
                className="absolute flex items-center justify-center w-12 h-12 bg-white/60 border border-white rounded-full text-slate-800 font-black text-sm select-none shadow hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  backgroundImage: "radial-gradient(circle at 12px 12px, rgba(255, 255, 255, 0.9) 0%, rgba(200, 230, 255, 0.5) 60%, rgba(130, 180, 255, 0.4) 100%)",
                }}
              >
                {b.char}
              </button>
            ))}
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => { SoundEffects.playPop(); startBubbleGame(); }}
              className="text-xs font-bold text-sky-700 hover:text-sky-950 flex items-center gap-1.5 mx-auto"
            >
              🔄 Đổi Chữ Cái Khác
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Chalkboard with AI evaluation */}
      {activeSubTab === "writing" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-rose-300 shadow-sm">
          
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Writing chalk options */}
            <div className="lg:w-1/3 flex flex-col gap-3 justify-center">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Chữ bé muốn tô viết sành điệu:</h3>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {["A", "Ă", "B", "C", "Đ", "O", "Ô", "U"].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        SoundEffects.playPop();
                        setTargetWrite(item);
                        setWriteFeedback("");
                        setEarnedStarsNum(null);
                      }}
                      className={`h-9 w-9 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${
                        targetWrite === item
                          ? "bg-rose-500 border-rose-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-200/50 mt-2 text-xs text-rose-900 leading-relaxed font-semibold">
                <p className="flex items-center gap-1 mb-1 font-bold">
                  <Play className="h-3 w-3 fill-rose-900 text-rose-900" /> Cách viết chữ "{targetWrite}":
                </p>
                Đặt bút vẽ từ dòng kẻ hướng lên trên tạo vòng tròn hoặc nét xiên đứng tấp nập kéo thẳng, tạo bộc lộ đúng đắn chữ cái Việt nhé!
              </div>
            </div>

            {/* Blackboard Board Drawing Area */}
            <div className="lg:w-2/3 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs text-slate-400 font-mono">BẢNG PHẤN LIÊN LẠC ĐIỆN TỬ</span>
                
                <div className="flex gap-2">
                  <button
                    onClick={clearChalkboard}
                    className="flex items-center gap-1 font-bold text-[10px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xóa bảng phấn
                  </button>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                width={360}
                height={260}
                onMouseDown={(e) => {
                  const canvas = canvasRef.current;
                  const ctx = canvas?.getContext("2d");
                  if (canvas && ctx) {
                    const rect = canvas.getBoundingClientRect();
                    ctx.beginPath();
                    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                    ctx.moveTo(x, y);
                  }
                  setIsDrawing(true);
                }}
                onMouseMove={drawOnCanvas}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  const canvas = canvasRef.current;
                  const ctx = canvas?.getContext("2d");
                  if (canvas && ctx && e.touches[0]) {
                    const rect = canvas.getBoundingClientRect();
                    ctx.beginPath();
                    const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
                    const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
                    ctx.moveTo(x, y);
                  }
                  setIsDrawing(true);
                }}
                onTouchMove={drawOnCanvas}
                onTouchEnd={stopDrawing}
                className="max-w-full w-full aspect-[360/260] border-8 border-amber-950 rounded-2xl shadow-inner cursor-crosshair touch-none"
              />

              <button
                onClick={evaluateHandwriting}
                disabled={loadingAiEvaluation}
                className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-95 font-black text-xs py-3 px-6 rounded-2xl shadow shadow-emerald-400 tracking-wide flex items-center gap-2 justify-center transition-all active:scale-95"
              >
                {loadingAiEvaluation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Cô Gấu BiBi đang soi kính lúp...
                  </>
                ) : (
                  <>
                    <Award className="h-4.5 w-4.5 animate-bounce" /> GIÁO VIÊN AI BI BI CHẤM ĐIỂM NGAY! ✨
                  </>
                )}
              </button>

              {/* Score results card */}
              {earnedStarsNum !== null && (
                <div className="mt-5 bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 w-full animate-in fade-in duration-200">
                  <div className="flex justify-center mb-1.5 gap-1 select-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-2xl ${
                          i < earnedStarsNum ? "text-yellow-400" : "text-slate-200"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-center font-bold text-amber-900 text-xs text-slate-700 whitespace-pre-line leading-relaxed italic">
                    🐻 "{writeFeedback}"
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Custom success toast/modal instead of window.alert */}
      {successToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-4 border-yellow-400 p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-yellow-100 rounded-full opacity-50" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-100 rounded-full opacity-50" />
            <div className="text-6xl mb-4 animate-bounce">🌟🏆🌟</div>
            <h4 className="text-xl font-black text-amber-950 mb-2">{successToast.title || "Tuyệt Vời Bé Ơi!"}</h4>
            <p className="text-xs text-slate-600 font-bold leading-relaxed mb-5">
              {successToast.message}
            </p>
            <button
              onClick={() => {
                SoundEffects.playPop();
                setSuccessToast(null);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-95 text-white font-black text-xs shadow-md shadow-orange-200 active:scale-95 transition-all"
            >
              Con cám ơn ạ! 🎁✨
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
