import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, Shuffle, ChevronRight, HelpCircle } from "lucide-react";
import { SoundEffects } from "../lib/sound";

interface MathModuleProps {
  onEarnStars: (amount: number, description: string) => void;
  onAddBadge: (badge: string) => void;
  onUpdateProficiency: (module: "letters" | "math", score: number) => void;
}

export default function MathModule({ onEarnStars, onAddBadge, onUpdateProficiency }: MathModuleProps) {
  const [activeTab, setActiveTab] = useState<"count" | "compare" | "sequence" | "split_combine" | "arithmetic">("count");

  // Tab 1 state: Count objects
  const [countRange, setCountRange] = useState<10 | 20>(10);
  const [countItems, setCountItems] = useState<{ id: number; icon: string }[]>([]);
  const [countOptions, setCountOptions] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number | null>(null);

  // Tab 2 state: Greater/Less comparison
  const [numLeft, setNumLeft] = useState(0);
  const [numRight, setNumRight] = useState(0);
  const [compareAnswer, setCompareAnswer] = useState<">" | "<" | "=" | null>(null);
  const [compareCorrect, setCompareCorrect] = useState<boolean | null>(null);

  // Tab 3 state: Sequence number
  const [sequence, setSequence] = useState<(number | string)[]>([]);
  const [missingIndex, setMissingIndex] = useState(0);
  const [correctSeqNum, setCorrectSeqNum] = useState<number>(0);
  const [sequenceOptions, setSequenceOptions] = useState<number[]>([]);
  const [selectedSeqNum, setSelectedSeqNum] = useState<number | null>(null);

  // Tab 4 state: Split / Combine
  const [splitCombineMode, setSplitCombineMode] = useState<"split" | "combine">("split");
  const [scTotal, setScTotal] = useState<10 | 20>(10);
  const [scPartA, setScPartA] = useState<number>(0);
  const [scPartB, setScPartB] = useState<number>(0);
  const [scEmoji, setScEmoji] = useState<string>("🍎");
  const [scOptions, setScOptions] = useState<number[]>([]);
  const [selectedScAnswer, setSelectedScAnswer] = useState<number | null>(null);
  const [scCorrect, setScCorrect] = useState<boolean | null>(null);

  // Tab 5 state: Arithmetic (Thêm bớt, cộng trừ)
  const [arithType, setArithType] = useState<"visual-add" | "visual-sub" | "eq-add" | "eq-sub">("visual-add");
  const [arithValA, setArithValA] = useState<number>(0);
  const [arithValB, setArithValB] = useState<number>(0);
  const [arithEmoji, setArithEmoji] = useState<string>("🍎");
  const [arithOptions, setArithOptions] = useState<number[]>([]);
  const [selectedArithAns, setSelectedArithAns] = useState<number | null>(null);
  const [arithCorrect, setArithCorrect] = useState<boolean | null>(null);
  const [arithRange, setArithRange] = useState<10 | 20>(10);

  useEffect(() => {
    generateCountGame(countRange);
    generateCompareGame();
    generateSequenceGame();
    generateSplitCombineGame();
    generateArithmeticGame(arithRange);
  }, []);

  // 1. Generate counting game
  const generateCountGame = (range: 10 | 20 = countRange) => {
    SoundEffects.playPop();
    const target = Math.floor(Math.random() * range) + 1;
    const emojis = ["🍎", "🦆", "🌸", "⭐", "⚽", "🐱", "🚗"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const items = Array.from({ length: target }, (_, i) => ({ id: i, icon: emoji }));
    
    // Generate 4 selection options
    const options = new Set<number>();
    options.add(target);
    while (options.size < 4) {
      options.add(Math.floor(Math.random() * range) + 1);
    }

    setCorrectCount(target);
    setCountItems(items);
    setCountOptions(Array.from(options).sort((a, b) => a - b));
    setAnsweredCount(null);
  };

  const handleCountOptionClick = (num: number) => {
    SoundEffects.playPop();
    setAnsweredCount(num);
    if (num === correctCount) {
      SoundEffects.playSuccess();
      onEarnStars(3, `Đếm chính xác ${correctCount} cái kẹo`);
      onUpdateProficiency("math", 15);
    } else {
      SoundEffects.playError();
    }
  };

  // 2. Generate comparison game
  const generateCompareGame = () => {
    SoundEffects.playPop();
    const left = Math.floor(Math.random() * 20) + 1;
    const right = Math.floor(Math.random() * 20) + 1;
    setNumLeft(left);
    setNumRight(right);
    setCompareAnswer(null);
    setCompareCorrect(null);
  };

  const handleCompareClick = (op: ">" | "<" | "=") => {
    SoundEffects.playPop();
    setCompareAnswer(op);
    let isCorrect = false;
    if (op === ">" && numLeft > numRight) isCorrect = true;
    if (op === "<" && numLeft < numRight) isCorrect = true;
    if (op === "=" && numLeft === numRight) isCorrect = true;

    setCompareCorrect(isCorrect);
    if (isCorrect) {
      SoundEffects.playSuccess();
      onEarnStars(3, `So sánh toán học: ${numLeft} ${op} ${numRight}`);
      onUpdateProficiency("math", 20);
    } else {
      SoundEffects.playError();
    }
  };

  // 3. Generate Sequence game
  const generateSequenceGame = () => {
    SoundEffects.playPop();
    const start = Math.floor(Math.random() * 17) + 1; // start up to 17, so max value is 20
    const seq = [start, start + 1, start + 2, start + 3];
    const missingIdx = Math.floor(Math.random() * 4);
    const correctVal = seq[missingIdx];
    
    const displaySeq: (number | string)[] = [...seq];
    displaySeq[missingIdx] = "?";

    const options = new Set<number>();
    options.add(correctVal);
    while (options.size < 4) {
      options.add(Math.floor(Math.random() * 20) + 1);
    }

    setSequence(displaySeq);
    setMissingIndex(missingIdx);
    setCorrectSeqNum(correctVal);
    setSequenceOptions(Array.from(options).sort((a, b) => a - b));
    setSelectedSeqNum(null);
  };

  const handleSeqOptionClick = (num: number) => {
    SoundEffects.playPop();
    setSelectedSeqNum(num);
    
    if (num === correctSeqNum) {
      SoundEffects.playSuccess();
      onEarnStars(4, "Tìm số bí ẩn còn thiếu trong dãy số");
      onUpdateProficiency("math", 25);
      
      // award badge on streak
      setTimeout(() => {
        SoundEffects.playStarReward();
        onAddBadge("THẦN ĐỒNG TOÁN HỌC 🔢");
      }, 500);
    } else {
      SoundEffects.playError();
    }
  };

  // 4. Generate Split/Combine game
  const generateSplitCombineGame = () => {
    SoundEffects.playPop();
    const mode = Math.random() > 0.5 ? "split" : "combine";
    const total = Math.random() > 0.5 ? 10 : 20;
    const partA = Math.floor(Math.random() * (total - 2)) + 1;
    const partB = total - partA;
    const emojis = ["🍎", "⚽", "⭐", "🐱", "🚗", "🧸", "🍪"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    setSplitCombineMode(mode);
    setScTotal(total);
    setScPartA(partA);
    setScPartB(partB);
    setScEmoji(emoji);
    setSelectedScAnswer(null);
    setScCorrect(null);

    const options = new Set<number>();
    const correctAnswer = mode === "split" ? partB : total;
    options.add(correctAnswer);
    while (options.size < 4) {
      options.add(Math.floor(Math.random() * total) + 1);
    }
    setScOptions(Array.from(options).sort((a, b) => a - b));
  };

  const handleScOptionClick = (num: number) => {
    SoundEffects.playPop();
    setSelectedScAnswer(num);
    const correctAnswer = splitCombineMode === "split" ? scPartB : scTotal;
    const isCorrect = num === correctAnswer;
    setScCorrect(isCorrect);
    if (isCorrect) {
      SoundEffects.playSuccess();
      onEarnStars(3, `Tách gộp nhóm toán học: ${splitCombineMode === "split" ? "Tách" : "Gộp"} ${scTotal} đối tượng`);
      onUpdateProficiency("math", 20);
    } else {
      SoundEffects.playError();
    }
  };

  // 5. Generate Arithmetic game
  const generateArithmeticGame = (range: 10 | 20 = arithRange) => {
    SoundEffects.playPop();
    const types: ("visual-add" | "visual-sub" | "eq-add" | "eq-sub")[] = ["visual-add", "visual-sub", "eq-add", "eq-sub"];
    const type = types[Math.floor(Math.random() * types.length)];
    const emojis = ["🍎", "🦆", "🌸", "⚽", "⭐", "🍪", "🍭"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    let valA = 0;
    let valB = 0;
    let ans = 0;

    if (type === "visual-add" || type === "eq-add") {
      valA = Math.floor(Math.random() * (range - 2)) + 1;
      valB = Math.floor(Math.random() * (range - valA - 1)) + 1;
      ans = valA + valB;
    } else {
      valA = Math.floor(Math.random() * (range - 2)) + 3;
      valB = Math.floor(Math.random() * (valA - 1)) + 1;
      ans = valA - valB;
    }

    setArithType(type);
    setArithValA(valA);
    setArithValB(valB);
    setArithEmoji(emoji);
    setSelectedArithAns(null);
    setArithCorrect(null);

    const options = new Set<number>();
    options.add(ans);
    while (options.size < 4) {
      options.add(Math.floor(Math.random() * range) + 1);
    }
    setArithOptions(Array.from(options).sort((a, b) => a - b));
  };

  const handleArithOptionClick = (num: number) => {
    SoundEffects.playPop();
    setSelectedArithAns(num);
    const correctAnswer = (arithType === "visual-add" || arithType === "eq-add") ? (arithValA + arithValB) : (arithValA - arithValB);
    const isCorrect = num === correctAnswer;
    setArithCorrect(isCorrect);
    if (isCorrect) {
      SoundEffects.playSuccess();
      onEarnStars(3, `Làm phép tính: ${arithValA} ${ (arithType === "visual-add" || arithType === "eq-add") ? "+" : "-" } ${arithValB}`);
      onUpdateProficiency("math", 20);
    } else {
      SoundEffects.playError();
    }
  };

  return (
    <div id="math-arena" className="bg-blue-50/50 rounded-3xl p-6 border-4 border-blue-300">
      
      {/* Subject Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="text-4xl">🔢</div>
          <div>
            <h2 className="text-2xl font-black text-blue-900 tracking-tight">Khu Vực Phép Thuật Toán Học</h2>
            <p className="text-xs text-blue-700 font-medium">Làm quen con số 0-20, tập đếm số lượng, điền số khuyết và so sánh lớn bé cực hay!</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("count"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "count"
                ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                : "bg-white text-blue-700 hover:bg-blue-100 border-blue-200"
            }`}
          >
            🍎 Tập Đếm Vật Thể
          </button>
          
          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("compare"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "compare"
                ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                : "bg-white text-blue-700 hover:bg-blue-100 border-blue-200"
            }`}
          >
            🐊 Cá Sấu Ăn Số
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("sequence"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "sequence"
                ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                : "bg-white text-blue-700 hover:bg-blue-100 border-blue-200"
            }`}
          >
            🔀 Tìm Số Điền Khuyết
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("split_combine"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "split_combine"
                ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                : "bg-white text-blue-700 hover:bg-blue-100 border-blue-200"
            }`}
          >
            🍎 Tách Gộp Nhóm
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("arithmetic"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "arithmetic"
                ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                : "bg-white text-blue-700 hover:bg-blue-100 border-blue-200"
            }`}
          >
            ➕ Phép Tính Cộng Trừ
          </button>
        </div>
      </div>

      {/* GAME 1: Count Objects */}
      {activeTab === "count" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-blue-200 shadow-sm text-center">
          <div className="mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Bé Học Tập Phép Đếm</h3>
            <p className="text-xs text-slate-400">Hãy đếm xem có bao nhiêu bạn nhỏ đáng yêu dưới đây nha!</p>
          </div>

          {/* Range selectors */}
          <div className="flex gap-2 justify-center mb-5">
            <button
              onClick={() => {
                setCountRange(10);
                generateCountGame(10);
              }}
              className={`px-3 py-1.5 text-[11px] font-black rounded-xl border-2 transition-all ${
                countRange === 10
                  ? "bg-blue-500 text-white border-blue-600 shadow-xs"
                  : "bg-white text-blue-700 border-blue-200"
              }`}
            >
              🍎 Đếm đến 10
            </button>
            <button
              onClick={() => {
                setCountRange(20);
                generateCountGame(20);
              }}
              className={`px-3 py-1.5 text-[11px] font-black rounded-xl border-2 transition-all ${
                countRange === 20
                  ? "bg-blue-500 text-white border-blue-600 shadow-xs"
                  : "bg-white text-blue-700 border-blue-200"
              }`}
            >
              🌟 Đếm đến 20
            </button>
          </div>

          {/* Grid of cute items */}
          <div className="bg-blue-100/40 rounded-2xl p-6 border-2 border-dashed border-blue-300 min-h-[140px] flex flex-wrap gap-4 justify-center items-center shadow-inner max-w-xl mx-auto mb-6">
            {countItems.map((item) => (
              <span
                key={item.id}
                className="text-3xl sm:text-4xl animate-bounce select-none transition-transform hover:scale-120 duration-300"
                style={{ animationDelay: `${item.id * 0.05}s` }}
              >
                {item.icon}
              </span>
            ))}
          </div>

          {/* Option selectors */}
          <div className="flex gap-3 sm:gap-4 justify-center">
            {countOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleCountOptionClick(opt)}
                className={`h-14 w-14 sm:h-16 sm:w-16 text-lg sm:text-xl font-black rounded-2xl border-3 transition-transform hover:scale-105 active:scale-90 flex items-center justify-center ${
                  answeredCount === opt
                    ? opt === correctCount
                      ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-rose-400 border-rose-500 text-white shadow-md"
                    : answeredCount !== null && opt === correctCount
                      ? "bg-emerald-250 border-emerald-400 text-slate-805"
                      : "bg-slate-50 border-slate-305 text-slate-700 hover:bg-slate-100 shadow-sm"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => generateCountGame(countRange)}
              className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow shadow-blue-300 flex items-center gap-1 transition-all"
            >
              <Shuffle className="h-4 w-4" /> Bàn Số Khác
            </button>
          </div>
        </div>
      )}

      {/* GAME 2: Alligator mouths compare */}
      {activeTab === "compare" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-blue-200 shadow-sm text-center">
          <div className="mb-6">
            <h3 className="font-extrabold text-slate-800 text-sm">Cá Sấu Ăn Số Nào Lớn Hơn?</h3>
            <p className="text-xs text-slate-450">Nhắc nhở: Bạn Cá Sấu tham ăn luôn mở ngoác mồm thật to về hướng số lượng nào NHIỀU hơn đó nha bé!</p>
          </div>

          <div className="flex flex-row justify-around items-center max-w-xl mx-auto mb-6 bg-blue-50 p-4 sm:p-6 rounded-2xl border-3 border-blue-200 shadow-inner w-full gap-2">
            {/* Left Box */}
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <span className="text-4xl sm:text-5xl font-black text-blue-900 mb-1 select-none">{numLeft}</span>
              <div className="flex flex-wrap gap-0.5 justify-center">
                {Array.from({ length: numLeft }).slice(0, 6).map((_, i) => (
                  <span key={i} className="text-md sm:text-xl select-none">🐳</span>
                ))}
                {numLeft > 6 && <span className="text-[10px] font-bold text-slate-500">+{numLeft - 6}</span>}
              </div>
            </div>

            {/* Operator Target frame box */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-4 border-dashed border-blue-300 flex items-center justify-center text-3xl sm:text-4xl bg-white select-none shadow shrink-0">
              {compareAnswer ? (
                <span className={`font-black ${compareCorrect ? "text-emerald-500 animate-pulse" : "text-rose-500"}`}>
                  {compareAnswer}
                </span>
              ) : "❓"}
            </div>

            {/* Right Box */}
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <span className="text-4xl sm:text-5xl font-black text-blue-900 mb-1 select-none">{numRight}</span>
              <div className="flex flex-wrap gap-0.5 justify-center">
                {Array.from({ length: numRight }).slice(0, 6).map((_, i) => (
                  <span key={i} className="text-md sm:text-xl select-none">🐳</span>
                ))}
                {numRight > 6 && <span className="text-[10px] font-bold text-slate-500">+{numRight - 6}</span>}
              </div>
            </div>
          </div>

          {/* Action options */}
          <div className="flex flex-wrap gap-2.5 sm:gap-4 justify-center w-full">
            {/* Lesser < */}
            <button
              onClick={() => handleCompareClick("<")}
              className={`p-3 sm:p-4 rounded-2xl border-3 transition-all flex flex-col items-center flex-1 max-w-[110px] sm:max-w-[140px] ${
                compareAnswer === "<"
                  ? compareCorrect
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-250 scale-103"
                    : "bg-rose-500 text-white border-rose-600 scale-103"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
            >
              <span className="text-3xl font-black leading-none">&lt;</span>
              <span className="text-[12px] mt-1 select-none">🐊 👉</span>
              <span className="text-[9px] font-extrabold mt-1 select-none leading-none">Cá sấu ăn số phải</span>
            </button>

            {/* Equal = */}
            <button
              onClick={() => handleCompareClick("=")}
              className={`p-3 sm:p-4 rounded-2xl border-3 transition-all flex flex-col items-center flex-1 max-w-[110px] sm:max-w-[140px] ${
                compareAnswer === "="
                  ? compareCorrect
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-250 scale-103"
                    : "bg-rose-500 text-white border-rose-600 scale-103"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
            >
              <span className="text-3xl font-black leading-none">=</span>
              <span className="text-[12px] mt-1 select-none">⚖️ ❤️</span>
              <span className="text-[9px] font-extrabold mt-1 select-none leading-none">Bằng khít khịt</span>
            </button>

            {/* Greater > */}
            <button
              onClick={() => handleCompareClick(">")}
              className={`p-3 sm:p-4 rounded-2xl border-3 transition-all flex flex-col items-center flex-1 max-w-[110px] sm:max-w-[140px] ${
                compareAnswer === ">"
                  ? compareCorrect
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-250 scale-103"
                    : "bg-rose-500 text-white border-rose-600 scale-103"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
            >
              <span className="text-3xl font-black leading-none">&gt;</span>
              <span className="text-[12px] mt-1 select-none">👈 🐊</span>
              <span className="text-[9px] font-extrabold mt-1 select-none leading-none">Cá sấu ăn số trái</span>
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={generateCompareGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded-xl shadow shadow-blue-200 flex items-center gap-1 mx-auto"
            >
              <Shuffle className="h-4 w-4" /> Bàn Số Khác
            </button>
          </div>
        </div>
      )}

      {/* GAME 3: Find sequence blanks */}
      {activeTab === "sequence" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-blue-200 shadow-sm text-center">
          <div className="mb-6 animate-pulse">
            <h3 className="font-extrabold text-slate-800 text-sm">Điền Con Số Bí Mật 🚂</h3>
            <p className="text-xs text-slate-500">Tìm số chính xác lấp đầy khoảng chấm hỏi "?" trên toa tàu theo thứ tự từ bé đến lớn nhé!</p>
          </div>

          {/* Train container */}
          <div className="flex flex-row flex-wrap gap-y-4 gap-x-1 sm:gap-x-2 justify-center items-center mb-6 max-w-xl mx-auto bg-slate-50 p-4 rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
            {/* Locomotive */}
            <div className="flex flex-col items-center shrink-0">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-md border-2 border-blue-600">
                🚂
              </div>
              <div className="flex gap-2.5 mt-1.5 select-none">
                <span className="text-[10px] sm:text-xs">⚫</span>
                <span className="text-[10px] sm:text-xs">⚫</span>
              </div>
            </div>

            {/* Coupling */}
            <div className="text-slate-400 font-black select-none text-md sm:text-lg shrink-0">🔗</div>

            {sequence.map((num, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <div className="text-slate-400 font-black select-none text-md sm:text-lg shrink-0">🔗</div>}
                <div className="flex flex-col items-center">
                  <div
                    className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center font-black text-md sm:text-xl shadow-md border-2 transition-all ${
                      num === "?"
                        ? selectedSeqNum !== null
                          ? selectedSeqNum === correctSeqNum
                            ? "bg-emerald-100 border-emerald-400 text-emerald-750 scale-105"
                            : "bg-rose-100 border-rose-400 text-rose-700 scale-105"
                          : "bg-amber-100 border-amber-450 text-amber-950 scale-105 animate-bounce"
                        : "bg-blue-100 border-blue-300 text-blue-900"
                    }`}
                  >
                    {num === "?" && selectedSeqNum !== null ? selectedSeqNum : num}
                  </div>
                  <div className="flex gap-2.5 mt-1.5 select-none">
                    <span className="text-[10px] sm:text-xs text-slate-700">⚫</span>
                    <span className="text-[10px] sm:text-xs text-slate-700">⚫</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Option select list */}
          <div className="flex gap-3 justify-center">
            {sequenceOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSeqOptionClick(opt)}
                className={`h-12 w-12 sm:h-14 sm:w-14 text-sm sm:text-lg font-black rounded-xl border-3 transition-transform hover:scale-105 active:scale-90 flex items-center justify-center ${
                  selectedSeqNum === opt
                    ? opt === correctSeqNum
                      ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-rose-400 border-rose-500 text-white shadow-md shadow-rose-200"
                    : selectedSeqNum !== null && opt === correctSeqNum
                      ? "bg-emerald-250 border-emerald-450 text-slate-800"
                      : "bg-slate-50 border-slate-355 text-slate-700 hover:bg-slate-100 shadow-sm"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={generateSequenceGame}
              className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow shadow-blue-300 flex items-center gap-1 mx-auto transition-all"
            >
              <Shuffle className="h-4 w-4" /> Đổi Trò Số Điền Khuyết
            </button>
          </div>
        </div>
      )}

      {/* GAME 4: Split / Combine Groups */}
      {activeTab === "split_combine" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-blue-200 shadow-sm text-center animate-in fade-in duration-200">
          <div className="mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm">
              {splitCombineMode === "split" ? "Tách Nhóm Vật Thể 🍎" : "Gộp Nhóm Vật Thể 🌟"}
            </h3>
            <p className="text-xs text-slate-500">
              {splitCombineMode === "split"
                ? "Bé hãy chia đều/tách số lượng bạn đồ vật thành hai nhóm dưới đây nhé!"
                : "Bé hãy gộp hai nhóm bạn đồ vật nhỏ lại xem tất cả có bao nhiêu nhé!"}
            </p>
          </div>

          {splitCombineMode === "split" ? (
            /* Visual illustration of separation */
            <div className="flex flex-col md:flex-row items-center gap-6 justify-center max-w-xl mx-auto mb-6 bg-blue-50/50 p-4 rounded-3xl border border-blue-150 shadow-inner">
              {/* Top/Total box */}
              <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-blue-200 w-full max-w-[150px]">
                <span className="text-[9px] font-black text-slate-400">NHÓM BAN ĐẦU</span>
                <span className="text-2xl font-black text-blue-900 mb-1">{scTotal}</span>
                <div className="flex flex-wrap gap-0.5 justify-center max-h-[60px] overflow-y-auto w-full">
                  {Array.from({ length: scTotal }).map((_, i) => (
                    <span key={i} className="text-sm select-none">{scEmoji}</span>
                  ))}
                </div>
              </div>

              {/* Separator arrow/indicator */}
              <div className="text-xl font-bold text-blue-400 select-none rotate-90 md:rotate-0">
                ➡️
              </div>

              {/* Split boxes (Part A & Part B) */}
              <div className="flex flex-row gap-4 w-full justify-center">
                {/* Part A */}
                <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-emerald-200 w-full max-w-[110px]">
                  <span className="text-[9px] font-black text-emerald-600">PHẦN THỨ NHẤT</span>
                  <span className="text-xl font-black text-emerald-950 mb-1">{scPartA}</span>
                  <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full">
                    {Array.from({ length: scPartA }).map((_, i) => (
                      <span key={i} className="text-xs select-none">{scEmoji}</span>
                    ))}
                  </div>
                </div>

                <div className="text-slate-450 font-bold self-center text-sm">+</div>

                {/* Part B (Question mark) */}
                <div className={`flex flex-col items-center p-3 rounded-2xl border-2 w-full max-w-[110px] transition-all ${
                  selectedScAnswer !== null
                    ? scCorrect
                      ? "bg-emerald-50 border-emerald-450"
                      : "bg-rose-50 border-rose-455"
                    : "bg-amber-50 border-amber-355 border-dashed animate-pulse"
                }`}>
                  <span className="text-[9px] font-black text-amber-600">PHẦN CÒN LẠI</span>
                  <span className="text-xl font-black text-amber-955 mb-1">
                    {selectedScAnswer !== null ? selectedScAnswer : "?"}
                  </span>
                  <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full min-h-[16px]">
                    {selectedScAnswer !== null && scCorrect ? (
                      Array.from({ length: scPartB }).map((_, i) => (
                        <span key={i} className="text-xs select-none">{scEmoji}</span>
                      ))
                    ) : (
                      <span className="text-sm">❓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Visual illustration of combining */
            <div className="flex flex-col md:flex-row items-center gap-6 justify-center max-w-xl mx-auto mb-6 bg-blue-50/50 p-4 rounded-3xl border border-blue-150 shadow-inner">
              {/* Parts boxes A & B */}
              <div className="flex flex-row gap-4 w-full justify-center">
                {/* Part A */}
                <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-blue-200 w-full max-w-[110px]">
                  <span className="text-[9px] font-black text-blue-600">PHẦN THỨ NHẤT</span>
                  <span className="text-xl font-black text-blue-900 mb-1">{scPartA}</span>
                  <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full">
                    {Array.from({ length: scPartA }).map((_, i) => (
                      <span key={i} className="text-xs select-none">{scEmoji}</span>
                    ))}
                  </div>
                </div>

                <div className="text-slate-450 font-bold self-center text-sm">+</div>

                {/* Part B */}
                <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-blue-200 w-full max-w-[110px]">
                  <span className="text-[9px] font-black text-blue-600">PHẦN THỨ HAI</span>
                  <span className="text-xl font-black text-blue-900 mb-1">{scPartB}</span>
                  <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full">
                    {Array.from({ length: scPartB }).map((_, i) => (
                      <span key={i} className="text-xs select-none">{scEmoji}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Separator arrow */}
              <div className="text-xl font-bold text-blue-400 select-none rotate-90 md:rotate-0">
                ➡️
              </div>

              {/* Combined box */}
              <div className={`flex flex-col items-center p-3 rounded-2xl border-2 w-full max-w-[150px] transition-all ${
                selectedScAnswer !== null
                  ? scCorrect
                    ? "bg-emerald-50 border-emerald-450"
                    : "bg-rose-50 border-rose-455"
                  : "bg-amber-50 border-amber-350 border-dashed animate-pulse"
              }`}>
                <span className="text-[9px] font-black text-amber-600">GỘP LẠI TẤT CẢ</span>
                <span className="text-2xl font-black text-amber-955 mb-1">
                  {selectedScAnswer !== null ? selectedScAnswer : "?"}
                </span>
                <div className="flex flex-wrap gap-0.5 justify-center max-h-[60px] overflow-y-auto w-full min-h-[16px]">
                  {selectedScAnswer !== null && scCorrect ? (
                    Array.from({ length: scTotal }).map((_, i) => (
                      <span key={i} className="text-xs select-none">{scEmoji}</span>
                    ))
                  ) : (
                    <span className="text-sm">❓</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex gap-3 sm:gap-4 justify-center">
            {scOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleScOptionClick(opt)}
                className={`h-14 w-14 sm:h-16 sm:w-16 text-lg sm:text-xl font-black rounded-2xl border-3 transition-transform hover:scale-105 active:scale-90 flex items-center justify-center ${
                  selectedScAnswer === opt
                    ? opt === (splitCombineMode === "split" ? scPartB : scTotal)
                      ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-205"
                      : "bg-rose-400 border-rose-500 text-white shadow-md"
                    : selectedScAnswer !== null && opt === (splitCombineMode === "split" ? scPartB : scTotal)
                      ? "bg-emerald-250 border-emerald-400 text-slate-800"
                      : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={generateSplitCombineGame}
              className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow shadow-blue-300 flex items-center gap-1 mx-auto transition-all"
            >
              <Shuffle className="h-4 w-4" /> Bàn Tách/Gộp Khác
            </button>
          </div>
        </div>
      )}

      {/* GAME 5: Arithmetic Operations */}
      {activeTab === "arithmetic" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-blue-200 shadow-sm text-center animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm">
              {arithType.startsWith("visual") ? "Trò Chơi Thêm Bớt Đối Tượng ➕➖" : "Phép Tính Thử Thách Trí Tuệ 🧠"}
            </h3>
            <p className="text-xs text-slate-500">
              {arithType.startsWith("visual")
                ? arithType === "visual-add"
                  ? "Bé hãy tính xem sau khi thêm các bạn đồ vật thì có tất cả bao nhiêu nhé!"
                  : "Bé hãy tính xem sau khi bớt (gạch đỏ ❌) các bạn đồ vật thì còn lại bao nhiêu nhé!"
                : "Bé giỏi quá! Hãy điền đáp án chính xác cho phép tính dưới đây nhé!"}
            </p>
          </div>

          {/* Range selectors */}
          <div className="flex gap-2 justify-center mb-5">
            <button
              onClick={() => {
                setArithRange(10);
                generateArithmeticGame(10);
              }}
              className={`px-3 py-1.5 text-[11px] font-black rounded-xl border-2 transition-all ${
                arithRange === 10
                  ? "bg-blue-500 text-white border-blue-600 shadow-xs"
                  : "bg-white text-blue-700 border-blue-200"
              }`}
            >
              ➕ Phạm vi 10 🍎
            </button>
            <button
              onClick={() => {
                setArithRange(20);
                generateArithmeticGame(20);
              }}
              className={`px-3 py-1.5 text-[11px] font-black rounded-xl border-2 transition-all ${
                arithRange === 20
                  ? "bg-blue-500 text-white border-blue-600 shadow-xs"
                  : "bg-white text-blue-700 border-blue-200"
              }`}
            >
              🌟 Phạm vi 20 🌟
            </button>
          </div>

          {/* Game body */}
          {arithType === "visual-add" && (
            <div className="flex items-center gap-4 justify-center max-w-xl mx-auto mb-6 bg-blue-50/50 p-4 rounded-3xl border border-blue-150 shadow-inner">
              {/* Part A */}
              <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-blue-200 w-full max-w-[120px]">
                <span className="text-[10px] font-black text-blue-600">ĐANG CÓ</span>
                <span className="text-xl font-black text-blue-900 mb-1">{arithValA}</span>
                <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full">
                  {Array.from({ length: arithValA }).map((_, i) => (
                    <span key={i} className="text-xs select-none">{arithEmoji}</span>
                  ))}
                </div>
              </div>

              <div className="text-emerald-500 font-extrabold text-2xl select-none">➕</div>

              {/* Part B */}
              <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-blue-200 w-full max-w-[120px]">
                <span className="text-[10px] font-black text-emerald-600">THÊM VÀO</span>
                <span className="text-xl font-black text-emerald-955 mb-1">{arithValB}</span>
                <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full">
                  {Array.from({ length: arithValB }).map((_, i) => (
                    <span key={i} className="text-xs select-none">{arithEmoji}</span>
                  ))}
                </div>
              </div>

              <div className="text-slate-400 font-extrabold text-xl select-none">＝</div>

              {/* Answer Box */}
              <div className={`flex flex-col items-center p-3 rounded-2xl border-2 w-full max-w-[120px] transition-all ${
                selectedArithAns !== null
                  ? arithCorrect
                    ? "bg-emerald-50 border-emerald-450"
                    : "bg-rose-50 border-rose-455"
                  : "bg-amber-50 border-amber-350 border-dashed animate-pulse"
              }`}>
                <span className="text-[10px] font-black text-amber-600">CÓ TẤT CẢ</span>
                <span className="text-xl font-black text-amber-955 mb-1">
                  {selectedArithAns !== null ? selectedArithAns : "?"}
                </span>
                <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full min-h-[16px]">
                  {selectedArithAns !== null && arithCorrect ? (
                    Array.from({ length: arithValA + arithValB }).map((_, i) => (
                      <span key={i} className="text-xs select-none">{arithEmoji}</span>
                    ))
                  ) : (
                    <span className="text-sm">❓</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {arithType === "visual-sub" && (
            <div className="flex items-center gap-4 justify-center max-w-xl mx-auto mb-6 bg-blue-50/50 p-4 rounded-3xl border border-blue-150 shadow-inner">
              {/* Part A with B items crossed out */}
              <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-blue-200 w-full max-w-[150px]">
                <span className="text-[10px] font-black text-blue-600">BAN ĐẦU CÓ</span>
                <span className="text-xl font-black text-blue-900 mb-1">{arithValA}</span>
                <div className="flex flex-wrap gap-1.5 justify-center max-h-[70px] overflow-y-auto w-full">
                  {Array.from({ length: arithValA }).map((_, i) => {
                    const isCrossed = i >= arithValA - arithValB;
                    return (
                      <span key={i} className="relative text-xs select-none">
                        {arithEmoji}
                        {isCrossed && <span className="absolute inset-0 flex items-center justify-center text-red-500 font-extrabold text-xs select-none">❌</span>}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="text-rose-500 font-extrabold text-2xl select-none">➖</div>

              {/* Part B */}
              <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-blue-200 w-full max-w-[100px]">
                <span className="text-[10px] font-black text-rose-600">BỚT ĐI</span>
                <span className="text-xl font-black text-rose-955 mb-1">{arithValB}</span>
                <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full">
                  {Array.from({ length: arithValB }).map((_, i) => (
                    <span key={i} className="text-xs select-none relative">
                      {arithEmoji}
                      <span className="absolute inset-0 flex items-center justify-center text-red-500 font-extrabold text-[10px] select-none">❌</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-slate-400 font-extrabold text-xl select-none">＝</div>

              {/* Answer Box */}
              <div className={`flex flex-col items-center p-3 rounded-2xl border-2 w-full max-w-[120px] transition-all ${
                selectedArithAns !== null
                  ? arithCorrect
                    ? "bg-emerald-50 border-emerald-450"
                    : "bg-rose-50 border-rose-455"
                  : "bg-amber-50 border-amber-350 border-dashed animate-pulse"
              }`}>
                <span className="text-[10px] font-black text-amber-600">CÒN LẠI</span>
                <span className="text-xl font-black text-amber-955 mb-1">
                  {selectedArithAns !== null ? selectedArithAns : "?"}
                </span>
                <div className="flex flex-wrap gap-0.5 justify-center max-h-[50px] overflow-y-auto w-full min-h-[16px]">
                  {selectedArithAns !== null && arithCorrect ? (
                    Array.from({ length: arithValA - arithValB }).map((_, i) => (
                      <span key={i} className="text-xs select-none">{arithEmoji}</span>
                    ))
                  ) : (
                    <span className="text-sm">❓</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {arithType.startsWith("eq") && (
            <div className="flex flex-col items-center justify-center max-w-xl mx-auto mb-6 bg-blue-50/50 p-6 rounded-3xl border border-blue-150 shadow-inner gap-4">
              <div className="flex items-center gap-4 justify-center text-3xl sm:text-4xl font-black text-blue-900 select-none">
                <span>{arithValA}</span>
                <span className={arithType === "eq-add" ? "text-emerald-500" : "text-rose-500"}>
                  {arithType === "eq-add" ? "+" : "-"}
                </span>
                <span>{arithValB}</span>
                <span className="text-slate-400">＝</span>
                <span className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border-3 flex items-center justify-center ${
                  selectedArithAns !== null
                    ? arithCorrect
                      ? "bg-emerald-500 text-white border-emerald-600 shadow"
                      : "bg-rose-400 text-white border-rose-500 shadow"
                    : "bg-white border-amber-300 border-dashed animate-pulse text-slate-400"
                }`}>
                  {selectedArithAns !== null ? selectedArithAns : "?"}
                </span>
              </div>

              {/* Visual helpers */}
              <div className="flex gap-4 items-start justify-center mt-2 w-full text-center">
                {/* Items A */}
                <div className="flex flex-wrap gap-0.5 justify-center flex-1 max-w-[120px]">
                  {Array.from({ length: arithValA }).map((_, i) => (
                    <span key={i} className="text-md select-none">{arithEmoji}</span>
                  ))}
                </div>

                <div className="w-6 shrink-0" />

                {/* Items B */}
                <div className="flex flex-wrap gap-0.5 justify-center flex-1 max-w-[120px]">
                  {Array.from({ length: arithValB }).map((_, i) => (
                    <span key={i} className="text-md select-none relative">
                      {arithEmoji}
                      {arithType === "eq-sub" && <span className="absolute inset-0 flex items-center justify-center text-red-500 font-extrabold text-[10px] select-none">❌</span>}
                    </span>
                  ))}
                </div>

                <div className="w-12 shrink-0" />
              </div>
            </div>
          )}

          {/* Option select list */}
          <div className="flex gap-3 sm:gap-4 justify-center">
            {arithOptions.map((opt) => {
              const correctAnswer = (arithType === "visual-add" || arithType === "eq-add") ? (arithValA + arithValB) : (arithValA - arithValB);
              return (
                <button
                  key={opt}
                  onClick={() => handleArithOptionClick(opt)}
                  className={`h-14 w-14 sm:h-16 sm:w-16 text-lg sm:text-xl font-black rounded-2xl border-3 transition-transform hover:scale-105 active:scale-90 flex items-center justify-center ${
                    selectedArithAns === opt
                      ? opt === correctAnswer
                        ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-205"
                        : "bg-rose-400 border-rose-500 text-white shadow-md shadow-rose-205"
                      : selectedArithAns !== null && opt === correctAnswer
                        ? "bg-emerald-250 border-emerald-400 text-slate-800"
                        : "bg-slate-50 border-slate-355 text-slate-700 hover:bg-slate-100 shadow-sm"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <button
              onClick={() => generateArithmeticGame(arithRange)}
              className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow shadow-blue-300 flex items-center gap-1 mx-auto transition-all"
            >
              <Shuffle className="h-4 w-4" /> Bàn Phép Tính Khác
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
