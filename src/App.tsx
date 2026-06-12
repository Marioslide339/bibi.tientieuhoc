/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActiveModule, ParentStats, CharacterItem } from "./types";
import { SoundEffects } from "./lib/sound";

// Component imports
import MascotGuide from "./components/MascotGuide";
import ParentDashboard from "./components/ParentDashboard";
import StoryTime from "./components/StoryTime";
import LettersModule from "./components/LettersModule";
import MathModule from "./components/MathModule";
import WorldModule from "./components/WorldModule";
import ColoringModule from "./components/ColoringModule";
import MusicModule from "./components/MusicModule";
import TriviaExamModule from "./components/TriviaExamModule";

// Lucide icons
import { BookOpen, Sparkles, Award, Star, ArrowLeft, Trophy, Compass, Music, Palette, HelpCircle, Heart, Flame } from "lucide-react";

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>("home");
  const [totalStars, setTotalStars] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentCelebration, setRecentCelebration] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Default Parent Stats database structures
  const [parentStats, setParentStats] = useState<ParentStats>({
    lessonsCompleted: 0,
    totalSpokenCorrect: 0,
    totalFightsWon: 0,
    totalStars: 0,
    timeSpentMinutes: 0,
    badges: [],
    moduleProficiency: {
      letters: 10,
      math: 10,
      language: 10,
      logic: 10,
      world: 10,
      art: 10,
      music: 10,
    },
    recentActivities: [],
  });

  // Character unlockables database list
  const characterMilestones: CharacterItem[] = [
    { id: "c1", name: "Bạn Sóc Phi Hành Gia 🐿️🚀", emoji: "🚀", description: "Bé gặt hái lộc sao đầu tiên!", unlockedAtStars: 15 },
    { id: "c2", name: "Cô Tiên Táo Đỏ Dễ Thương 🍎🧚‍♀️", emoji: "🧚‍♀️", description: "Yêu thích sách truyện đọc chữ cái", unlockedAtStars: 35 },
    { id: "c3", name: "Sư Tử Lớp Một Dũng Mãnh 🦁🎒", emoji: "🎒", description: "Ông vua đếm số toán học thông minh", unlockedAtStars: 60 },
    { id: "c4", name: "Trạng Nguyên Gấu Trúc Vàng 🐼🎓", emoji: "🎓", description: "Tổng tiến công khảo hạch đỗ đạt thủ khoa!", unlockedAtStars: 95 },
  ];

  // Load persistent storage progress on mount
  useEffect(() => {
    const savedStars = localStorage.getItem("kid_stars");
    const savedBadges = localStorage.getItem("kid_badges");
    const savedStats = localStorage.getItem("kid_parent_stats");
    const savedName = localStorage.getItem("kid_user_name");

    if (savedStars) setTotalStars(Number(savedStars));
    if (savedBadges) setBadges(JSON.parse(savedBadges));
    if (savedStats) setParentStats(JSON.parse(savedStats));
    if (savedName) {
      setUserName(savedName);
      setIsLoggedIn(true);
    }
  }, []);

  // Save changes to local storage
  const saveProgressData = (newStars: number, newBadges: string[], newStats: ParentStats) => {
    localStorage.setItem("kid_stars", String(newStars));
    localStorage.setItem("kid_badges", JSON.stringify(newBadges));
    localStorage.setItem("kid_parent_stats", JSON.stringify(newStats));
  };

  // Safe reset routine
  const handleResetProgress = () => {
    const freshStats: ParentStats = {
      lessonsCompleted: 0,
      totalSpokenCorrect: 0,
      totalFightsWon: 0,
      totalStars: 0,
      timeSpentMinutes: 0,
      badges: [],
      moduleProficiency: {
        letters: 10,
        math: 10,
        language: 10,
        logic: 10,
        world: 10,
        art: 10,
        music: 10,
      },
      recentActivities: [],
    };
    setTotalStars(0);
    setBadges([]);
    setParentStats(freshStats);
    localStorage.clear();
    setActiveModule("home");
    setIsLoggedIn(false);
    setUserName("");
    setNameInput("");
  };

  // Handle login submission
  const handleLogin = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      setUserName(trimmed);
      setIsLoggedIn(true);
      localStorage.setItem("kid_user_name", trimmed);
    }
  };

  // Add stars earned and log to historical activity feed
  const earnStars = (amount: number, description: string) => {
    const updatedStars = totalStars + amount;
    setTotalStars(updatedStars);
    
    // Trigger sparkle anim overlay
    setRecentCelebration(`+${amount} ⭐ ${description}`);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3500);

    // Append history
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const logItem = {
      timestamp: formattedTime,
      description: description,
      starsEarned: amount
    };

    const nextStats = {
      ...parentStats,
      lessonsCompleted: parentStats.lessonsCompleted + 1,
      totalStars: updatedStars,
      timeSpentMinutes: parentStats.timeSpentMinutes + 4, // simulate incremental training blocks of 4 mins
      recentActivities: [...parentStats.recentActivities, logItem]
    };
    
    setParentStats(nextStats);
    saveProgressData(updatedStars, badges, nextStats);
  };

  // Add badge and sync with stats
  const addBadge = (newBadgeName: string) => {
    if (badges.includes(newBadgeName)) return; // prevent duplicate credentials
    const nextBadges = [...badges, newBadgeName];
    setBadges(nextBadges);

    const nextStats = {
      ...parentStats,
      badges: nextBadges
    };
    setParentStats(nextStats);
    saveProgressData(totalStars, nextBadges, nextStats);
  };

  // Specific proficiency updates
  const updateMainProficiency = (module: "letters" | "math", deltaScore: number) => {
    const nextStats = { ...parentStats };
    if (module === "letters") {
      nextStats.moduleProficiency.letters = Math.min(nextStats.moduleProficiency.letters + deltaScore, 100);
    } else if (module === "math") {
      nextStats.moduleProficiency.math = Math.min(nextStats.moduleProficiency.math + deltaScore, 100);
    }
    setParentStats(nextStats);
    saveProgressData(totalStars, badges, nextStats);
  };

  // Mixed cumulative score boost
  const updateMixedFullProficiencies = (deltaPercentage: number) => {
    const nextStats = { ...parentStats };
    nextStats.moduleProficiency.language = Math.min(nextStats.moduleProficiency.language + deltaPercentage, 100);
    nextStats.moduleProficiency.logic = Math.min(nextStats.moduleProficiency.logic + deltaPercentage, 100);
    nextStats.moduleProficiency.world = Math.min(nextStats.moduleProficiency.world + deltaPercentage, 100);
    nextStats.moduleProficiency.art = Math.min(nextStats.moduleProficiency.art + deltaPercentage, 100);
    nextStats.moduleProficiency.music = Math.min(nextStats.moduleProficiency.music + deltaPercentage, 100);
    setParentStats(nextStats);
    saveProgressData(totalStars, badges, nextStats);
  };

  // Main navigation cards definitions: Icon-focused, minimal text for young children
  const categoriesList = [
    {
      id: "letters" as ActiveModule,
      emoji: "🔤",
      title: "Chữ cái",
      bgStyle: "from-rose-400 to-pink-500",
    },
    {
      id: "math" as ActiveModule,
      emoji: "🔢",
      title: "Toán học",
      bgStyle: "from-blue-400 to-sky-500",
    },
    {
      id: "language" as ActiveModule,
      emoji: "📚",
      title: "Truyện tranh",
      bgStyle: "from-amber-400 to-orange-500",
    },
    {
      id: "logic" as ActiveModule,
      emoji: "🧠",
      title: "Tư duy",
      bgStyle: "from-violet-400 to-purple-500",
    },
    {
      id: "world" as ActiveModule,
      emoji: "🌎",
      title: "Khám phá",
      bgStyle: "from-emerald-400 to-teal-500",
    },
    {
      id: "coloring" as ActiveModule,
      emoji: "🎨",
      title: "Tô màu",
      bgStyle: "from-pink-400 to-rose-500",
    },
    {
      id: "music" as ActiveModule,
      emoji: "🎵",
      title: "Âm nhạc",
      bgStyle: "from-cyan-400 to-blue-500",
    },
    {
      id: "exam" as ActiveModule,
      emoji: "🏆",
      title: "Thi đố",
      bgStyle: "from-indigo-400 to-violet-500",
    },
    {
      id: "achievements" as ActiveModule,
      emoji: "⭐",
      title: "Thành tích",
      bgStyle: "from-yellow-400 to-amber-500",
    },
    {
      id: "parents" as ActiveModule,
      emoji: "👨\u200D👩\u200D👧",
      title: "Cha mẹ",
      bgStyle: "from-slate-600 to-slate-800",
    }
  ];

  // ===================== LOGIN SCREEN =====================
  if (!isLoggedIn) {
    return (
      <div id="login-screen" className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-100 to-lime-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border-4 border-yellow-400 shadow-2xl p-8 max-w-md w-full text-center">
          {/* Mascot */}
          <div className="text-8xl mb-4 animate-bounce select-none">🐻</div>
          
          <h1 className="text-2xl md:text-3xl font-black text-amber-900 mb-2">
            Xin chào bé yêu! 👋
          </h1>
          <p className="text-sm text-amber-700 font-semibold mb-6">
            Gấu BiBi muốn biết tên bé nè!
          </p>

          {/* Name input */}
          <div className="relative mb-6">
            <input
              id="name-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Nhập tên bé..."
              className="w-full px-6 py-4 text-lg font-bold text-center text-amber-900 bg-amber-50 border-3 border-amber-300 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200 placeholder:text-amber-300 transition-all"
              autoFocus
              maxLength={30}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl select-none">✏️</span>
          </div>

          {/* Enter button */}
          <button
            id="login-button"
            onClick={handleLogin}
            disabled={nameInput.trim().length === 0}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white text-lg font-black rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 border-3 border-white flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🚀</span>
            Vào học nào!
          </button>

          <p className="text-[10px] text-amber-400 font-bold mt-4 select-none">
            🎒 Bé Học Vui • Tiền Lớp 1
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="full-app-root-container" className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-lime-50 text-slate-800 p-4 md:p-6 pb-24 font-sans antialiased relative selection:bg-amber-200">
      
      {/* Sparkles celebration indicator floating badge */}
      {showConfetti && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-500 text-white font-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border-3 border-white">
          <Sparkles className="h-5 w-5 animate-spin text-yellow-200" />
          <span className="text-sm font-sans tracking-tight">{recentCelebration}</span>
        </div>
      )}

      {/* Global Header Banner */}
      <header className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md rounded-3xl p-5 border-4 border-yellow-400 shadow-lg mb-8">
        <div className="flex items-center gap-3">
          <div className="text-4xl select-none animate-pulse">🎒</div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-amber-900 tracking-tight flex items-center gap-1.5 leading-none">
              Bé Học Vui <span className="text-xs bg-yellow-400 text-amber-950 font-black px-2.5 py-1 rounded-full uppercase scale-90 tracking-widest border border-amber-500">TIỀN LỚP 1</span>
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed font-semibold mt-1">
              Chào <span className="text-amber-600 font-black">{userName}</span>! Gấu BiBi sẵn sàng cùng bé học vui rồi nè! 🐻
            </p>
          </div>
        </div>

        {/* Dynamic score header metrics wrapper */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Stars Scoreboard */}
          <div className="bg-amber-100 border-2 border-amber-400 text-amber-950 rounded-2xl px-4 py-2 flex items-center gap-2 shadow shadow-amber-200 hover:scale-103 transition-transform cursor-pointer">
            <Star className="h-5.5 w-5.5 text-yellow-500 fill-yellow-500 animate-spin" style={{ animationDuration: "6s" }} />
            <div className="text-left leading-tight">
              <span className="text-xs font-black block text-amber-900 font-mono">SAO CỦA BÉ</span>
              <span className="text-md font-black text-amber-950 leading-none">{totalStars} 🌟</span>
            </div>
          </div>

          {/* Badges Count */}
          <div className="bg-purple-100 border-2 border-purple-400 text-purple-950 rounded-2xl px-4 py-2 flex items-center gap-2 shadow shadow-purple-200">
            <Award className="h-5.5 w-5.5 text-purple-600" />
            <div className="text-left leading-tight">
              <span className="text-xs font-black block text-purple-900">DANH HIỆU</span>
              <span className="text-sm font-black text-purple-950">{badges.length} cái</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Core Router Viewports */}
      <main className="max-w-4xl mx-auto relative z-10">
        
        {/* VIEW 1: Categories Selector Sheet */}
        {activeModule === "home" && (
          <div className="animate-in fade-in duration-300">
            
            {/* Mascot welcoming card banner - simplified */}
            <div className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 p-5 rounded-3xl border-4 border-white shadow-xl flex items-center gap-4 mb-8 relative overflow-hidden">
              <span className="text-6xl md:text-7xl animate-bounce select-none">🐻</span>
              <div className="text-slate-800 flex-1">
                <h3 className="text-lg font-extrabold text-amber-950 mb-0.5">
                  Chào {userName}! 👋
                </h3>
                <p className="text-xs text-amber-900 font-semibold">
                  Hôm nay bé muốn học gì nào? 🚀
                </p>
              </div>
            </div>

            {/* Grid of modules - ICON FOCUSED, big touch targets */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mb-10">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    SoundEffects.playPop();
                    setActiveModule(cat.id);
                  }}
                  className={`group rounded-3xl p-4 md:p-5 border-4 border-white shadow-lg bg-gradient-to-br ${cat.bgStyle} hover:scale-[1.04] active:scale-95 transition-all hover:shadow-2xl relative overflow-hidden flex flex-col items-center justify-center aspect-square`}
                >
                  {/* Large central emoji */}
                  <span className="text-5xl md:text-6xl select-none mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                    {cat.emoji}
                  </span>

                  {/* Minimal title only */}
                  <span className="text-sm md:text-base font-black text-white drop-shadow tracking-tight text-center leading-tight">
                    {cat.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: Letters Module */}
        {activeModule === "letters" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-rose-300 text-rose-800 font-black hover:bg-rose-100 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            <LettersModule 
              onEarnStars={earnStars} 
              onAddBadge={addBadge} 
              onUpdateProficiency={updateMainProficiency} 
            />
          </div>
        )}

        {/* VIEW 3: Math Module */}
        {activeModule === "math" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-blue-300 text-blue-800 font-black hover:bg-blue-100 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            <MathModule 
              onEarnStars={earnStars} 
              onAddBadge={addBadge} 
              onUpdateProficiency={updateMainProficiency} 
            />
          </div>
        )}

        {/* VIEW 4: Language interactive story */}
        {activeModule === "language" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-amber-300 text-amber-800 font-black hover:bg-amber-100 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            <StoryTime onEarnStars={earnStars} onAddBadge={addBadge} />
          </div>
        )}

        {/* VIEW 5: Logic sequencers (Renders Math with Tab Selected Sequence) */}
        {activeModule === "logic" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-purple-300 text-purple-850 font-black hover:bg-purple-150 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            {/* Logic shares layout inside the flexible Math sequencing model */}
            <MathModule 
              onEarnStars={earnStars} 
              onAddBadge={addBadge} 
              onUpdateProficiency={updateMainProficiency} 
            />
          </div>
        )}

        {/* VIEW 6: World science module */}
        {activeModule === "world" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-emerald-300 text-emerald-800 font-black hover:bg-emerald-100 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            <WorldModule onEarnStars={earnStars} onAddBadge={addBadge} />
          </div>
        )}

        {/* VIEW 7: Coloring painting canvas */}
        {activeModule === "coloring" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-pink-300 text-pink-800 font-black hover:bg-pink-100 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            <ColoringModule onEarnStars={earnStars} onAddBadge={addBadge} />
          </div>
        )}

        {/* VIEW 8: Karaoke dance and rhythm tapping */}
        {activeModule === "music" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-cyan-300 text-cyan-800 font-black hover:bg-cyan-100 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            <MusicModule onEarnStars={earnStars} onAddBadge={addBadge} />
          </div>
        )}

        {/* VIEW 9: mixed challenge quiz Trivia exam */}
        {activeModule === "exam" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-indigo-300 text-indigo-800 font-black hover:bg-indigo-100 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            <TriviaExamModule 
              onEarnStars={earnStars} 
              onAddBadge={addBadge} 
              onUpdateFullProficiencies={updateMixedFullProficiencies} 
            />
          </div>
        )}

        {/* VIEW 10: Parent counseling dashboards */}
        {activeModule === "parents" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-slate-350 text-slate-800 font-black hover:bg-slate-100 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>
            <ParentDashboard stats={parentStats} onResetStats={handleResetProgress} />
          </div>
        )}

        {/* VIEW 11: Unlocked characters achievements */}
        {activeModule === "achievements" && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { SoundEffects.playPop(); setActiveModule("home"); }}
              className="px-4 py-2.5 rounded-xl border-3 border-yellow-400 text-yellow-905 font-black hover:bg-yellow-50 flex items-center gap-1.5 self-start text-xs bg-white mb-4 shadow"
            >
              <ArrowLeft className="h-4 w-4" /> Quay Lại Trang Chủ
            </button>

            {/* Achievements Page Layout */}
            <div className="bg-white rounded-3xl p-6 border-4 border-yellow-300 shadow-xl max-w-2xl mx-auto">
              <div className="text-center mb-6 border-b pb-4">
                <span className="text-5xl animate-bounce">🏆</span>
                <h3 className="text-xl font-extrabold text-slate-800 mt-2 uppercase tracking-wide">
                  Đại Lộ Danh Vọng Của Bé
                </h3>
                <p className="text-xs text-slate-500">
                  Tích cực gặt hái sao vàng lấp lánh để đỗ đạt thủ khoa và mở khóa toàn bộ muông thú phi hành gia dễ thương dưới đây nhé!
                </p>
              </div>

              {/* Grid of milestons characters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {characterMilestones.map((char) => {
                  const unlocked = totalStars >= char.unlockedAtStars;
                  return (
                    <div
                      key={char.id}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                        unlocked
                          ? "bg-yellow-50 border-yellow-400 shadow shadow-yellow-100 scale-102"
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="text-4xl h-14 w-14 bg-white rounded-2xl border flex items-center justify-center shadow-inner select-none">
                        {unlocked ? char.emoji : "🔒"}
                      </div>
                      
                      <div className="text-left">
                        <span className={`text-xs font-black block ${unlocked ? "text-yellow-905" : "text-slate-400"}`}>
                          {unlocked ? char.name : "Nhân vật Bí ẩn... 🔒"}
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight font-medium mt-0.5">
                          {char.description}
                        </span>
                        <span className="text-[9px] bg-amber-200 text-amber-950 font-extrabold px-1.5 py-0.5 rounded-full mt-1.5 inline-block font-mono leading-none">
                          Chỉ số mở khóa: {char.unlockedAtStars} ⭐
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Persistent floating guide Mascot Gấu BiBi AI */}
      <MascotGuide onEarnStars={earnStars} currentModuleProficiency={parentStats.moduleProficiency} />

      {/* Footer copyright indicators */}
      <footer className="max-w-xl mx-auto text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-12 mb-6 select-none relative z-10">
        <div>Bé Học Vui • Kiến tạo tương lai rực rỡ</div>
        <div className="text-[9px] text-slate-300 mt-1">Trợ lý học hỏi Gấu BiBi thiết kế dưới dáng 3D Pixar</div>
      </footer>

    </div>
  );
}
