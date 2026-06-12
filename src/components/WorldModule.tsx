import React, { useState } from "react";
import { Globe, Volume2, Shield, Heart, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { SoundEffects } from "../lib/sound";
import { speak } from "../lib/speech";

interface WorldModuleProps {
  onEarnStars: (amount: number, description: string) => void;
  onAddBadge: (badge: string) => void;
}

export default function WorldModule({ onEarnStars, onAddBadge }: WorldModuleProps) {
  const [activeTab, setActiveTab] = useState<"sounds" | "habitat" | "professions" | "body">("sounds");
  const [successToast, setSuccessToast] = useState<{ title?: string; message: string } | null>(null);

  // Game 1: Sounds state
  const animals = [
    { name: "Cún Con 🐶", soundText: "gâu gâu", soundClue: "con chó", emoji: "🐶" },
    { name: "Mèo Lười 🐱", soundText: "meo meo", soundClue: "con mèo", emoji: "🐱" },
    { name: "Gà Trống Gáy 🐔", soundText: "ò ó o o", soundClue: "con gà", emoji: "🐔" },
    { name: "Chú Vịt 🦆", soundText: "quáp quáp", soundClue: "con vịt", emoji: "🦆" },
    { name: "Bò Sữa 🐄", soundText: "ụm bòooo", soundClue: "con bò", emoji: "🐄" },
  ];
  const [targetAnimal, setTargetAnimal] = useState(animals[0]);
  const [soundGuessed, setSoundGuessed] = useState<boolean | null>(null);

  const speakAnimalClue = () => {
    SoundEffects.playPop();
    speak(`Loài vật này kêu: ${targetAnimal.soundText}! Đố bé là con gì nhỉ?`, {
      pitch: 1.35,
      rate: 0.9,
      force: true
    });
  };

  const checkAnimalGuess = (name: string) => {
    SoundEffects.playPop();
    if (name === targetAnimal.name) {
      setSoundGuessed(true);
      SoundEffects.playSuccess();
      onEarnStars(3, `Nghe âm thanh và tìm trúng bạn ${targetAnimal.name}`);
      
      // select new target
      setTimeout(() => {
        const next = animals[Math.floor(Math.random() * animals.length)];
        setTargetAnimal(next);
        setSoundGuessed(null);
      }, 1500);
    } else {
      setSoundGuessed(false);
      SoundEffects.playError();
    }
  };


  // Game 2: Habitat State
  const habitatAnimals = [
    { emoji: "🦈", name: "Cá mập", location: "ocean" },
    { emoji: "🐄", name: "Bò sữa", location: "farm" },
    { emoji: "🐿️", name: "Sóc đỏ", location: "forest" },
    { emoji: "🐠", name: "Cá hề", location: "ocean" },
    { emoji: "🐷", name: "Heo mập", location: "farm" },
    { emoji: "🐻", name: "Gấu rừng", location: "forest" },
  ];
  const [placedAnimals, setPlacedAnimals] = useState<Record<string, string>>({}); // emoji -> location name

  const handlePlaceAnimal = (emoji: string, location: string, correctLocation: string) => {
    SoundEffects.playPop();
    if (location === correctLocation) {
      SoundEffects.playSuccess();
      setPlacedAnimals(prev => ({ ...prev, [emoji]: location }));
      onEarnStars(2, `Đưa con vật ${emoji} về nhà thích hợp`);
      
      // Check if all placed
      const allDone = habitatAnimals.every((anim) => {
        return location === anim.location ? true : placedAnimals[anim.emoji] !== undefined;
      });
      if (allDone) {
        setTimeout(() => {
          SoundEffects.playStarReward();
          onAddBadge("HẢO THỦ KHÁM PHÁ 🌍");
          setSuccessToast({
            title: "Khám Phá Thế Giới! 🌎",
            message: "Một ngày hội rừng thật khăng khít! Bé xuất sắc đưa toàn bộ các bạn thú tìm về nhà rồi nhé!"
          });
        }, 300);
      }
    } else {
      SoundEffects.playError();
    }
  };


  // Game 3: Professions State
  const professions = [
    { title: "Bác Sĩ 👩‍⚕️", tool: "Ống Nghe Y Tế 🩺", desc: "Chăm chữa khỏi bệnh" },
    { title: "Lính Cứu Hỏa 👨‍🚒", tool: "Vòi Rút Khí Nước 🚒", desc: "Dập cháy cứu nạn" },
    { title: "Kỹ Sư Xây Dựng 👷‍♂️", tool: "Mũ Bảo Hộ & Bản Vẽ 📐", desc: "Xây cao ốc" },
    { title: "Thầy Giáo 👨‍🏫", tool: "Phấn Trắng Bảng Đen 📝", desc: "Dạy học trò ngoan" },
  ];
  const [selectedProf, setSelectedProf] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [profAnswers, setProfAnswers] = useState<string[]>([]); // list of matched jobs

  const handleProfMatch = (pTitle: string, tTool: string, realTool: string) => {
    SoundEffects.playPop();
    if (tTool === realTool) {
      SoundEffects.playSuccess();
      setProfAnswers(prev => [...prev, pTitle]);
      onEarnStars(4, `Ghép công cụ ${tTool} cho nghề nghiệp ${pTitle}`);
    } else {
      SoundEffects.playError();
    }
    setSelectedProf(null);
    setSelectedTool(null);
  };


  // Game 4: Human Body state
  const bodyParts = [
    { label: "Mắt 👀", function: "Dùng để nhìn và quan sát mọi thứ xung quanh", sense: "👁️ Thị giác 🌈", x: 48, y: 18 },
    { label: "Mũi 👃", function: "Dùng để hít thở và ngửi các mùi hương khác nhau", sense: "👃 Khứu giác 🌸", x: 48, y: 34 },
    { label: "Miệng 👄", function: "Dùng để ăn, nếm thức ăn và nói lời hay lễ phép", sense: "👅 Vị giác 🍎", x: 48, y: 50 },
    { label: "Tai 👂", function: "Dùng để nghe tiếng nói, tiếng nhạc và âm thanh", sense: "👂 Thính giác 🎵", x: 26, y: 28 },
    { label: "Bàn Tay 🤚", function: "Dùng để cầm nắm, sờ và cảm nhận đồ vật", sense: "🧸 Xúc giác 🤝", x: 12, y: 72 },
    { label: "Bàn Chân 🦶", function: "Dùng để đi lại, chạy nhảy và giữ thăng bằng", sense: "🏃 Vận động 👟", x: 48, y: 92 },
  ];
  const [activePart, setActivePart] = useState<any>(null);

  const speakBodyPart = (p: any) => {
    SoundEffects.playPop();
    setActivePart(p);
    speak(`Đây là cái ${p.label}. ${p.function}`, {
      pitch: 1.35,
      rate: 0.9,
      force: true
    });
  };

  return (
    <div id="world-arena-wrapper" className="bg-amber-50/50 rounded-3xl p-6 border-4 border-amber-300">
      
      {/* Category Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="text-4xl">🌍</div>
          <div>
            <h2 className="text-2xl font-black text-amber-900 tracking-tight">Thế Giới Quanh Em Bé</h2>
            <p className="text-xs text-amber-700 font-medium">Tìm nhà muông thú, phân biệt âm thanh, dụng cụ ngành nghề và nhận biết cơ thể người hữu dụng!</p>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("sounds"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "sounds"
                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                : "bg-white text-amber-700 hover:bg-amber-100 border-amber-200"
            }`}
          >
            🔊 Tiếng Kêu Loài Vật
          </button>
          
          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("habitat"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "habitat"
                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                : "bg-white text-amber-700 hover:bg-amber-100 border-amber-200"
            }`}
          >
            🏡 Nhà Của Bạn Thú
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("professions"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "professions"
                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                : "bg-white text-amber-700 hover:bg-amber-100 border-amber-200"
            }`}
          >
            👷‍♂️ Bé Học Nghề Nghiệp
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("body"); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "body"
                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                : "bg-white text-amber-700 hover:bg-amber-100 border-amber-200"
            }`}
          >
            👀 Cơ Thể Bé Yêu
          </button>
        </div>
      </div>

      {/* TAB 1: Animal sound guesser */}
      {activeTab === "sounds" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-200 shadow-sm text-center">
          <div className="max-w-md mx-auto mb-6">
            <h3 className="font-extrabold text-slate-800 text-sm">Đoán Xem Tiếng Bạn Thú Nào Nhé!</h3>
            <p className="text-xs text-slate-400">Hãy nhấn nút phát thanh để thưởng thức tiếng kêu ngộ nghĩnh rồi lựa chọn bạn thú phát ra âm thanh đó nhé.</p>
          </div>

          <button
            onClick={speakAnimalClue}
            className="h-28 w-28 bg-gradient-to-tr from-amber-400 to-orange-500 hover:scale-105 active:scale-95 text-white rounded-full flex flex-col items-center justify-center gap-1.5 mx-auto shadow-lg shadow-amber-200 mb-6 border-4 border-white transition-all text-xs font-black animate-pulse"
          >
            <Volume2 className="h-8 w-8 animate-bounce" /> 🔊 PHÁT TIẾNG 🎶
          </button>

          {soundGuessed !== null && (
            <div className={`text-sm font-bold mb-4 ${soundGuessed ? "text-emerald-600" : "text-rose-500"}`}>
              {soundGuessed ? "🎉 Chính xác luôn! Bạn siêu thế nhỉ!" : "❌ Bé đoán gần đúng rồi, thử bạn khác đi nào!"}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 max-w-2xl mx-auto">
            {animals.map((anim, i) => (
              <button
                key={i}
                onClick={() => checkAnimalGuess(anim.name)}
                className="bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-400 p-4 rounded-2xl flex flex-col items-center shadow-xs transition-all scale-100 hover:scale-104 active:scale-95"
              >
                <span className="text-4xl mb-1 select-none">{anim.emoji}</span>
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">{anim.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Matching habitats */}
      {activeTab === "habitat" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-250 shadow-sm">
          <div className="mb-6 text-center">
            <h3 className="font-extrabold text-slate-800 text-sm">Đưa Các Bạn Thú Trở Về Nhà</h3>
            <p className="text-xs text-slate-400">Tìm tổ ấm tương ứng: Đại dương bao la 🌊, Nông trại trù phú 🏡, hay Khu rừng đại ngàn 🌳</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
            {/* Ocean */}
            <div className="bg-blue-100 rounded-3xl p-4 border-2 border-blue-300 min-h-[160px] shadow-inner flex flex-col justify-between">
              <div>
                <span className="text-3xl">🌊</span>
                <h4 className="text-xs font-black text-blue-900 uppercase">Đại Dương Xanh</h4>
              </div>
              <div className="flex flex-wrap gap-2 justify-center py-4">
                {habitatAnimals.filter(a => placedAnimals[a.emoji] === "ocean").map((v, i) => (
                  <span key={i} className="text-4xl animate-pulse select-none">{v.emoji}</span>
                ))}
              </div>
            </div>

            {/* Farm */}
            <div className="bg-amber-100 rounded-3xl p-4 border-2 border-amber-300 min-h-[160px] shadow-inner flex flex-col justify-between">
              <div>
                <span className="text-3xl">🏡</span>
                <h4 className="text-xs font-black text-amber-900 uppercase">Nông Trại Trù Phú</h4>
              </div>
              <div className="flex flex-wrap gap-2 justify-center py-4">
                {habitatAnimals.filter(a => placedAnimals[a.emoji] === "farm").map((v, i) => (
                  <span key={i} className="text-4xl animate-pulse select-none">{v.emoji}</span>
                ))}
              </div>
            </div>

            {/* Forest */}
            <div className="bg-emerald-100 rounded-3xl p-4 border-2 border-emerald-300 min-h-[160px] shadow-inner flex flex-col justify-between">
              <div>
                <span className="text-3xl">🌳</span>
                <h4 className="text-xs font-black text-emerald-900 uppercase">Rừng Xanh Đại Ngàn</h4>
              </div>
              <div className="flex flex-wrap gap-2 justify-center py-4">
                {habitatAnimals.filter(a => placedAnimals[a.emoji] === "forest").map((v, i) => (
                  <span key={i} className="text-4xl animate-pulse select-none">{v.emoji}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Draggable/Touch Animal selectors to complete placement */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-3.5 justify-center">
            {habitatAnimals.map((anim, i) => {
              const placed = placedAnimals[anim.emoji] !== undefined;
              return (
                <div key={i} className={`relative p-3.5 bg-white rounded-2xl border-2 flex flex-col items-center shadow-xs transition-transform ${placed ? "opacity-30 line-through" : ""}`}>
                  <span className="text-3xl mb-1 select-none">{anim.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-500 mb-2">{anim.name}</span>
                  
                  {!placed && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePlaceAnimal(anim.emoji, "ocean", anim.location)}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-0.5 text-[9px] font-bold"
                      >
                        🌊
                      </button>
                      <button
                        onClick={() => handlePlaceAnimal(anim.emoji, "farm", anim.location)}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded px-2 py-0.5 text-[9px] font-bold"
                      >
                        🏡
                      </button>
                      <button
                        onClick={() => handlePlaceAnimal(anim.emoji, "forest", anim.location)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded px-2 py-0.5 text-[9px] font-bold"
                      >
                        🌳
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Professions Guessing */}
      {activeTab === "professions" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-200 shadow-sm">
          <div className="text-center mb-6">
            <h3 className="font-extrabold text-slate-800 text-sm">Tìm Công Cụ Thích Hợp Cho Nghề Nghiệp</h3>
            <p className="text-xs text-slate-500">Chạm vào bạn nghề nghiệp rồi lựa chọn công cụ tương xứng giúp cô bác làm việc hiệu quả nhất!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Jobs list */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black text-slate-400 capitalize block border-b pb-1">1. Cô bác Nghề Nghiệp</span>
              {professions.map((prof, idx) => {
                const complete = profAnswers.includes(prof.title);
                return (
                  <button
                    key={idx}
                    disabled={complete}
                    onClick={() => { setSelectedProf(prof.title); }}
                    className={`p-3 rounded-2xl flex items-center justify-between border-2 text-left transition-all ${
                      complete
                        ? "bg-emerald-100 border-emerald-300 text-emerald-900 opacity-60"
                        : selectedProf === prof.title
                          ? "bg-amber-400 border-amber-500 text-white"
                          : "bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-sm block">{prof.title}</span>
                      <span className="text-[10px] font-bold opacity-80">{prof.desc}</span>
                    </div>
                    <span>{complete ? "✅ Đã xong" : "🔍 Chọn"}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Tools List */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black text-slate-400 capitalize block border-b pb-1">2. Dụng cụ lao động</span>
              {professions.map((prof, idx) => {
                // Find matching profile job reference
                const realJob = professions.find(p => p.tool === prof.tool)?.title || "";
                const complete = profAnswers.includes(realJob);
                return (
                  <button
                    key={idx}
                    disabled={complete || !selectedProf}
                    onClick={() => {
                      if (selectedProf) {
                        handleProfMatch(selectedProf, prof.tool, professions.find(x => x.title === selectedProf)?.tool || "");
                      }
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between border-2 text-left transition-all ${
                      complete
                        ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed opacity-40"
                        : !selectedProf
                          ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200/50"
                          : "bg-white hover:bg-blue-50 border-blue-200 text-slate-700 scale-100 hover:scale-102"
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-sm block">{prof.tool}</span>
                    </div>
                    <span>⚡ Khớp</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Human body parts mapping */}
      {activeTab === "body" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-amber-200 shadow-sm relative overflow-hidden text-center">
          <div className="mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Lớp Học Nhận Biết Cơ Thể</h3>
            <p className="text-xs text-slate-400">Ấn chạm vào từng bộ phận trên phác thảo bé yêu tinh nghịch để nghe Gấu BiBi hướng dẫn ý nghĩa của bộ phận đó nhé!</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
            
            {/* Visual Sketchboard Map */}
            <div className="relative w-[280px] h-[280px] bg-gradient-to-b from-teal-50 to-amber-50 rounded-full border-4 border-dashed border-amber-300 p-2.5 flex items-center justify-center overflow-hidden">
              <span className="text-9xl relative select-none z-10 animate-pulse">👶</span>

              {/* Pulsing Target nodes mapping to body positions */}
              {bodyParts.map((part, index) => (
                <button
                  key={index}
                  onClick={() => speakBodyPart(part)}
                  className={`absolute z-20 h-8 w-8 rounded-full border-2 border-white flex items-center justify-center animate-bounce text-sm shadow-md transition-transform active:scale-95 ${
                    activePart?.label === part.label
                      ? "bg-rose-500 scale-110 border-rose-300"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                  style={{
                    left: `${part.x}%`,
                    top: `${part.y}%`,
                    animationDelay: `${index * 0.25}s`
                  }}
                  title={part.label}
                >
                  {part.label.split(" ")[1] || "📍"}
                </button>
              ))}
            </div>

            {/* Pronunciation speech details frame */}
            <div className="w-64">
              {activePart ? (
                <div className="bg-amber-100 border-2 border-amber-300 p-4 rounded-2xl shadow-sm text-left animate-in zoom-in-95 duration-200">
                  <span className="text-xs bg-amber-300 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase mb-1.5 inline-block">
                    {activePart.label}
                  </span>
                  {activePart.sense && (
                    <div className="text-[11px] font-black text-amber-900 mb-2 bg-amber-200/50 px-2 py-1 rounded-lg">
                      Giác quan: {activePart.sense}
                    </div>
                  )}
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">
                    {activePart.function}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-xs text-slate-400 italic">
                  Chạm chạm vào các bộ phận trên bức tranh em bé để bắt đầu bài học cơ thể hữu ích nha!
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
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-yellow-101 rounded-full opacity-50" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-101 rounded-full opacity-50" />
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
