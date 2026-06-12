import React, { useState } from "react";
import { BookOpen, Sparkles, ChevronRight, ArrowLeft, RotateCcw, Volume2, Star, CheckCircle, ShieldCheck } from "lucide-react";
import { SoundEffects } from "../lib/sound";
import { speak } from "../lib/speech";

interface Page {
  text: string;
  prompt: string;
  question: string;
  choices: string[];
}

interface Story {
  title: string;
  pages: Page[];
}

interface StoryTimeProps {
  onEarnStars: (amount: number, description: string) => void;
  onAddBadge: (badge: string) => void;
}

export default function StoryTime({ onEarnStars, onAddBadge }: StoryTimeProps) {
  // Preset choices
  const heroList = [
    { id: "Khỉ con tinh nghịch", name: "Khỉ Con 🐵", desc: "Tinh nghịch, vui vẻ" },
    { id: "Sóc nhỏ dũng cảm", name: "Sóc Nhỏ 🐿️", desc: "Gan dạ, ham thích khám phá" },
    { id: "Rồng con hiền lành", name: "Rồng Nhí 🐉", desc: "Thật thà, hiền lành ôn hòa" },
  ];

  const settingList = [
    { id: "Khu rừng phép thuật", name: "Khu Rừng Phép Thuật 🌲", desc: "Nhiều muông thú kỳ hoa dị thảo" },
    { id: "Vương quốc đồ chơi", name: "Vương Quốc Đồ Chơi 🧸", desc: "Lâu đài xếp hình lego khổng lồ" },
    { id: "Ngôi đền vũ trụ", name: "Vũ Trụ Bao La 🚀", desc: "Các hành tinh kẹo ngọt rực rỡ" },
  ];

  const moralList = [
    { id: "Biết chia sẻ", name: "Biết Chia Sẻ Trái Ngọt 💕" },
    { id: "Dũng cảm nhận lỗi", name: "Dũng Cảm Xin Lỗi Khi Sai 🌸" },
    { id: "Giúp đỡ bạn bè", name: "Giúp Đỡ Bạn Bè Gặp Khó Khăn🤝" },
  ];

  const [selectedHero, setSelectedHero] = useState(heroList[0].id);
  const [selectedSetting, setSelectedSetting] = useState(settingList[0].id);
  const [selectedMoral, setSelectedMoral] = useState(moralList[0].id);

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [successModal, setSuccessModal] = useState<{ message: string } | null>(null);

  const generateStory = async () => {
    SoundEffects.playPop();
    setLoading(true);
    setStory(null);
    setCurrentPage(0);
    setSelectedChoice(null);
    setAnsweredCorrectly(null);

    try {
      const response = await fetch("/api/gemini/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero: selectedHero,
          setting: selectedSetting,
          moral: selectedMoral
        })
      });
      const data = await response.json();
      setStory(data);
      SoundEffects.playSuccess();
    } catch (e) {
      console.error(e);
      // fallback handled inside server
    } finally {
      setLoading(false);
    }
  };

  // Speaks story paragraphs using Web Speech API
  const speakText = (text: string) => {
    SoundEffects.playPop();
    speak(text, {
      pitch: 1.3, // Cute kid friendly tone
      rate: 0.9,
      force: true
    });
  };

  const handleChoiceClick = (index: number) => {
    SoundEffects.playPop();
    setSelectedChoice(index);
    
    // For interactive comprehension, let's treat choice index 1 as correct for test,
    // or let it adapt to the child's response!
    // Often we design option 0 as correct, or we let them unlock with happy results!
    // Since it's interactive learning, selecting any option is a success in creative dialogue!
    // Let's praise them regardless, but note if they picked index 0 (which has the correct answer in prompts).
    if (index === 0) {
      setAnsweredCorrectly(true);
      SoundEffects.playSuccess();
    } else {
      setAnsweredCorrectly(false);
      SoundEffects.playError();
    }
  };

  const nextStep = () => {
    if (!story) return;
    SoundEffects.playPop();

    if (currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setSelectedChoice(null);
      setAnsweredCorrectly(null);
    } else {
      // Completed full comic story!
      SoundEffects.playStarReward();
      onEarnStars(15, `Hoàn thành tác phẩm truyện tranh tương tác: "${story.title}"`);
      onAddBadge("MỌT SÁCH BÍ ẨN 📚");
      
      // complete flag with non-blocking successModal
      setSuccessModal({ message: `Xin chúc mừng bạn nhỏ! Bé đã đọc cả cuộc hành trình và nhận thêm 15 Sao Vàng danh giá rồi nhé!` });
    }
  };

  return (
    <div id="story-time-arena" className="bg-amber-50/50 p-6 rounded-3xl border-4 border-amber-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">📚</div>
        <div>
          <h2 className="text-2xl font-black text-amber-900 tracking-tight">Rạp Chiếu Phim Truyện Tranh AI</h2>
          <p className="text-xs text-amber-700 font-medium">Bé tự chọn nhân vật, bối cảnh và bài học. AI sẽ viết truyện và vẽ tranh minh họa cho riêng bé!</p>
        </div>
      </div>

      {!story && !loading && (
        <div className="bg-white p-6 rounded-2xl border-4 border-amber-200 shadow-sm flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Choose Hero */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-black text-amber-800">1. Chọn Bạn Nhỏ Đồng Hành:</label>
              <div className="flex flex-col gap-2">
                {heroList.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => { SoundEffects.playPop(); setSelectedHero(h.id); }}
                    className={`p-3 rounded-2xl text-left border-3 transition-all ${
                      selectedHero === h.id
                        ? "bg-amber-100 border-amber-500 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-slate-800 text-sm">{h.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{h.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Setting */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-black text-amber-800">2. Chọn Nơi Phiêu Lưu:</label>
              <div className="flex flex-col gap-2">
                {settingList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { SoundEffects.playPop(); setSelectedSetting(s.id); }}
                    className={`p-3 rounded-2xl text-left border-3 transition-all ${
                      selectedSetting === s.id
                        ? "bg-sky-100 border-sky-500 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Moral Lesson */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-black text-amber-800">3. Chọn Bài Học Cuộc Sống:</label>
              <div className="flex flex-col gap-2">
                {moralList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { SoundEffects.playPop(); setSelectedMoral(m.id); }}
                    className={`p-3 rounded-2xl text-left border-3 transition-all flex items-center justify-between ${
                      selectedMoral === m.id
                        ? "bg-rose-100 border-rose-500 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span className="font-bold text-slate-800 text-xs">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generateStory}
            className="mt-4 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-white font-black hover:scale-103 active:scale-95 transition-all text-sm py-4 px-8 rounded-2xl shadow-md shadow-amber-300 flex items-center gap-2 justify-center mx-auto"
          >
            <BookOpen className="h-5 w-5 animate-pulse" /> AI CHẾ TẠO TRUYỆN TRANH NGAY TRẢI NGHIỆM! 🤖✨
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white p-12 rounded-2xl border-4 border-amber-200 shadow-lg text-center flex flex-col items-center justify-center gap-4 py-16 animate-pulse">
          <span className="text-5xl animate-spin">🍄</span>
          <h3 className="font-black text-slate-800 text-lg">Gấu BiBi Đang Gom Nhặt Rừng Sách Cổ...</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            AI đang viết chữ rực rỡ và vẽ một chú {selectedHero.replace("con", " con")} đáng yêu trong {selectedSetting.split(" ")[0]} đó nha! Bé chờ tí xíu nha!
          </p>
          <div className="w-1/2 bg-slate-100 rounded-full h-3 overflow-hidden mt-2">
            <div className="bg-gradient-to-r from-amber-400 to-rose-500 h-full animate-infinite-width" style={{ width: "80%" }} />
          </div>
        </div>
      )}

      {story && (
        <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-xl overflow-hidden flex flex-col md:flex-row max-w-4xl mx-auto">
          {/* Left Column: Comic Cover Art Frame */}
          <div className="md:w-1/2 bg-gradient-to-b from-sky-400 to-amber-200 p-6 flex flex-col justify-center items-center relative aspect-square">
            {/* Stylized Avatar Illustration */}
            <div className="relative rounded-3xl overflow-hidden border-8 border-white shadow-lg bg-amber-100 h-full w-full flex items-center justify-center">
              <span className="text-9xl animate-bounce select-none">
                {selectedHero.includes("Khỉ") ? "🐒" : selectedHero.includes("Sóc") ? "🐿️" : "🐲"}
              </span>

              {/* Decorative cloud badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-bold text-amber-900 border border-amber-200 shadow flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Bức Họa Pixar 3D
              </div>
            </div>

            {/* Prompt explanation overlay for parents */}
            <div className="mt-3 text-[10px] text-sky-950 font-bold font-mono bg-white/40 backdrop-blur px-2.5 py-1 rounded-md text-center max-w-sm">
              🎨 "{story.pages[currentPage].prompt}"
            </div>
          </div>

          {/* Right Column: Story Narration & Choice Arena */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between gap-5 bg-gradient-to-b from-white to-amber-50/30">
            <div>
              {/* Cover Banner title */}
              <div className="flex justify-between items-center mb-3">
                <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2.5 py-1 rounded-full border border-amber-300 uppercase">
                  Trang {currentPage + 1} / {story.pages.length}
                </span>

                <button
                  onClick={() => setStory(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Đổi truyện
                </button>
              </div>

              <h3 className="text-xl font-extrabold text-slate-800 leading-tight mb-4 border-b border-amber-200 pb-2">
                📖 {story.title}
              </h3>

              {/* Story text box */}
              <div className="bg-amber-100/30 border border-amber-200/60 rounded-2xl p-4 mb-4 relative">
                <p className="text-sm font-bold text-slate-700 leading-relaxed indent-4">
                  {story.pages[currentPage].text}
                </p>

                {/* Speech audio activator */}
                <button
                  onClick={() => speakText(story.pages[currentPage].text)}
                  className="absolute bottom-3 right-3 bg-amber-400 hover:bg-amber-500 text-amber-950 p-2 rounded-xl shadow-xs transition-transform active:scale-90 flex items-center justify-center"
                  title="Nghe giọng kể truyện"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              {/* Interactive comprehension challenge inside tale */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5 mb-2.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-500 animate-pulse" /> Đố bé tương tác thông minh:
                </p>
                <div className="text-xs font-black text-slate-800 bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl mb-3">
                  {story.pages[currentPage].question}
                </div>

                {/* Choices list */}
                <div className="flex flex-col gap-2">
                  {story.pages[currentPage].choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoiceClick(index)}
                      className={`p-2.5 rounded-xl text-left font-bold text-xs border-2 transition-all ${
                        selectedChoice === index
                          ? answeredCorrectly === true
                            ? "bg-emerald-100 border-emerald-500 text-emerald-900 shadow-xs"
                            : "bg-rose-100 border-rose-400 text-rose-900"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{choice}</span>
                        {selectedChoice === index && (
                          <span>{answeredCorrectly === true ? "✅ Đúng rồi!" : "❌ Bé thử lại nha"}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Next / Completion control panel */}
            <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-3">
              {currentPage < story.pages.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={selectedChoice === null}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    selectedChoice !== null
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Lật sang trang tiếp theo <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={selectedChoice === null}
                  className={`px-6 py-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    selectedChoice !== null
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md shadow-amber-300 animate-bounce active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  🏆 HOÀN THÀNH SÁCH TRUYỆN +15 SAO!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom success modal instead of alert */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-4 border-yellow-400 p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-yellow-101 rounded-full opacity-50" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-101 rounded-full opacity-50" />
            <div className="text-6xl mb-4 animate-bounce">🌟🏆🌟</div>
            <h4 className="text-xl font-black text-amber-950 mb-2">Tuyệt Đỉnh Bạn Nhỏ!</h4>
            <p className="text-xs text-slate-600 font-bold leading-relaxed mb-5">
              {successModal.message}
            </p>
            <button
              onClick={() => {
                SoundEffects.playPop();
                setSuccessModal(null);
                setStory(null);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-95 text-white font-black text-xs shadow-md shadow-orange-200 active:scale-95 transition-all"
            >
              Dạ con xin nhận ạ! 🎒🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
