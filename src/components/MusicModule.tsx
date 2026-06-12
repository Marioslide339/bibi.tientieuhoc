import React, { useState, useEffect } from "react";
import { Music, Play, Square, Volume2, Sparkles, Star, Award } from "lucide-react";
import { SoundEffects } from "../lib/sound";

interface MusicModuleProps {
  onEarnStars: (amount: number, description: string) => void;
  onAddBadge: (badge: string) => void;
}

export default function MusicModule({ onEarnStars, onAddBadge }: MusicModuleProps) {
  const [activeTab, setActiveTab] = useState<"karaoke" | "rhythm">("karaoke");
  const [successToast, setSuccessToast] = useState<{ title?: string; message: string } | null>(null);

  // Song data
  const songs = [
    {
      title: "Cả Nhà Thương Nhau 👪",
      lyrics: "[0:05] Ba thương con vì con giống mẹ...\n[0:10] Mẹ thương con vì con giống ba...\n[0:15] Cả nhà ta cùng thương yêu nhau...\n[0:20] Xa là nhớ, gặp nhau là cười! 🎉"
    },
    {
      title: "Bé Lên Ba 🎒",
      lyrics: "[0:03] Cháu lên ba cháu đi mẫu giáo...\n[0:08] Cô thương cháu vì không khóc nhè...\n[0:13] Không khóc nhè để mẹ trồng cây trái...\n[0:18] Ba vào nhà máy ông bà vui cấy cày!"
    },
    {
      title: "Rửa Mặt Như Mèo 🐱",
      lyrics: "[0:02] Meo meo meo rửa mặt như mèo...\n[0:06] Xấu xấu làm sao chẳng được mẹ yêu...\n[0:10] Khăn mặt đâu mà ngồi liếm láp...\n[0:14] Đau mắt rồi lại khóc meo meo!"
    }
  ];

  const [activeSong, setActiveSong] = useState(songs[0]);
  const [playingSong, setPlayingSong] = useState<boolean>(false);
  const [lyricsScroller, setLyricsScroller] = useState<string>("Bấm PHÁT NHẠC để múa hát karaoke nha bé!");

  // Rhythm Game state
  const [stars, setStars] = useState<{ id: number; col: number; y: number }[]>([]);
  const [score, setScore] = useState(0);

  // Karaoke simulated lyric ticker
  useEffect(() => {
    if (!playingSong) {
      setLyricsScroller("Bấm PHÁT NHẠC để múa hát karaoke nha bé!");
      return;
    }

    let tick = 0;
    const lines = activeSong.lyrics.split("\n");
    setLyricsScroller(lines[0]);

    const interval = setInterval(() => {
      tick += 1;
      // scroll through mock lines
      const lineIdx = Math.min(Math.floor(tick / 5), lines.length - 1);
      setLyricsScroller(lines[lineIdx]);

      // play random chime
      SoundEffects.playHoverWobble();

      if (tick > 25) {
        setPlayingSong(false);
        SoundEffects.playStarReward();
        onEarnStars(10, `Hát Karaoke rực rỡ bài hát: ${activeSong.title}`);
        setSuccessToast({
          title: "Giọng Ca Vàng Anh! 🎤🌟",
          message: `Bé hát bài '${activeSong.title}' hay quá xá luôn! Gấu BiBi tặng bé 10 sao vàng ấm áp nhé!`
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playingSong, activeSong]);


  // Rhythm Game dynamic ticks
  useEffect(() => {
    if (activeTab !== "rhythm") return;

    // spawn initial notes
    const handleInterval = setInterval(() => {
      // spawn notes randomly
      if (Math.random() > 0.4 && stars.length < 5) {
        setStars(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            col: Math.floor(Math.random() * 4), // 4 columns
            y: 0
          }
        ]);
      }

      // move notes down
      setStars(prev => prev.map(s => ({ ...s, y: s.y + 10 })).filter(s => {
        if (s.y > 280) {
          // note missed
          return false;
        }
        return true;
      }));
    }, 150);

    return () => clearInterval(handleInterval);
  }, [activeTab, stars]);

  const tapKey = (col: number) => {
    // Synth custom tone chime based on column tap
    SoundEffects.playDrumTap();

    // Check hit star in column
    // The target hit zone is y between 210 and 260
    const hitIndex = stars.findIndex(s => s.col === col && s.y >= 215 && s.y <= 275);
    
    if (hitIndex !== -1) {
      SoundEffects.playSuccess();
      setScore(prev => prev + 1);
      onEarnStars(1, "Gõ đúng nhịp điệu ngôi sao");
      
      // Clear star
      setStars(prev => prev.filter((_, i) => i !== hitIndex));

      if (score + 1 >= 10) {
        SoundEffects.playStarReward();
        onEarnStars(10, "Bé múa dẻo - Chạm nhịp siêu cấp rực sặc!");
        onAddBadge("NHẠC SĨ THIÊN TÀI 🎵");
        setSuccessToast({
          title: "Thiên Tài Gõ Nhịp! 🥁",
          message: "Tuyệt đỉnh âm nhạc bé yêu ơi! Bé đã đạt kỷ lục 10 nhịp gõ chính xác liên tiếp rồi nha!"
        });
        setScore(0);
      }
    } else {
      // blank miss
      SoundEffects.playError();
    }
  };

  return (
    <div id="music-arena" className="bg-cyan-50/50 rounded-3xl p-6 border-4 border-cyan-300">
      
      {/* Category Heading Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="text-4xl">🎵</div>
          <div>
            <h2 className="text-2xl font-black text-cyan-900 tracking-tight">Vương Quốc Âm Nhạc Bé Hát</h2>
            <p className="text-xs text-cyan-700 font-medium">Hát karaoke giải trí rực rỡ, luyện tai lắng nghe đòn gõ nhịp điệu cùng Gấu BiBi!</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("karaoke"); setPlayingSong(false); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "karaoke"
                ? "bg-cyan-500 text-white border-cyan-600 shadow-sm"
                : "bg-white text-cyan-700 hover:bg-cyan-100 border-cyan-200"
            }`}
          >
            🎤 Karaoke Mầm Non
          </button>
          
          <button
            onClick={() => { SoundEffects.playPop(); setActiveTab("rhythm"); setPlayingSong(false); }}
            className={`px-4 py-2 text-xs font-black rounded-xl border-2 transition-all ${
              activeTab === "rhythm"
                ? "bg-cyan-500 text-white border-cyan-600 shadow-sm"
                : "bg-white text-cyan-700 hover:bg-cyan-100 border-cyan-200"
            }`}
          >
            🎹 Đàn Gõ Nhịp Điệu
          </button>
        </div>
      </div>

      {/* GAME 1: Karaoke Box */}
      {activeTab === "karaoke" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-cyan-200 shadow-sm flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
          
          {/* Left panel: Song Selector */}
          <div className="md:w-1/3 flex flex-col gap-2.5">
            <span className="text-xs font-black text-slate-400 block border-b pb-1">DANH SÁCH BÀI HÁT</span>
            {songs.map((song, i) => (
              <button
                key={i}
                onClick={() => {
                  SoundEffects.playPop();
                  setActiveSong(song);
                  setPlayingSong(false);
                }}
                className={`p-3 text-left font-black text-xs rounded-xl border-2 transition-all ${
                  activeSong.title === song.title
                    ? "bg-cyan-100 border-cyan-400 text-cyan-900"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {song.title}
              </button>
            ))}
          </div>

          {/* Right panel: Player Interface screen */}
          <div className="md:w-2/3 bg-slate-900 text-cyan-300 rounded-2xl p-6 text-center flex flex-col justify-between min-h-[220px] shadow-inner relative overflow-hidden">
            <div className="absolute top-2 right-2 flex gap-1 items-center bg-cyan-950 px-2 py-0.5 rounded text-[9px] font-mono border border-cyan-700 text-cyan-400">
              <Sparkles className="h-2.5 w-2.5 text-yellow-300 animate-spin" /> LIVE KARAOKE
            </div>

            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase">Đang phát múa hát:</h4>
              <p className="text-sm font-black text-white mt-1 uppercase tracking-wider">{activeSong.title}</p>
            </div>

            {/* Lyric display lines */}
            <div className="my-6 min-h-[45px] flex items-center justify-center">
              <p className="text-md md:text-lg font-black tracking-wide text-yellow-300 animate-pulse text-center">
                {lyricsScroller}
              </p>
            </div>

            {/* Player controller */}
            <div className="flex gap-3 justify-center items-center">
              {!playingSong ? (
                <button
                  onClick={() => { SoundEffects.playPop(); setPlayingSong(true); }}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow shadow-emerald-400 flex items-center gap-1.5 transition-all"
                >
                  <Play className="h-4 w-4 fill-white" /> PHÁT NHẠC KARAOKE 🎵
                </button>
              ) : (
                <button
                  onClick={() => { SoundEffects.playPop(); setPlayingSong(false); }}
                  className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow shadow-rose-450 flex items-center gap-1.5 transition-all"
                >
                  <Square className="h-4 w-4 fill-white" /> DỪNG HÁT
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* GAME 2: Rhythm Star Game */}
      {activeTab === "rhythm" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-cyan-200 shadow-sm max-w-xl mx-auto">
          
          <div className="flex justify-between items-center bg-cyan-50 px-4 py-2.5 rounded-2xl border mb-4">
            <div>
              <p className="text-[10px] font-black text-cyan-700 leading-none">THỬ THÁCH NHỊP</p>
              <h4 className="text-sm font-black text-slate-800 mt-1">Gõ Phím Nhịp Điệu</h4>
            </div>

            <span className="text-sm font-black bg-white px-3 py-1 rounded-full border border-cyan-200 text-cyan-800">
              Nhịp đúng: <span className="text-yellow-500 font-extrabold">{score} / 10 ⭐</span>
            </span>
          </div>

          {/* Fall board frame */}
          <div className="relative w-full h-[280px] bg-slate-900 rounded-2xl border-4 border-slate-950 overflow-hidden shadow-inner">
            
            {/* Draw 4 columns vertical borders */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 border-r border-dashed border-slate-700/50" />
              <div className="flex-1 border-r border-dashed border-slate-700/50" />
              <div className="flex-1 border-r border-dashed border-slate-700/50" />
              <div className="flex-1" />
            </div>

            {/* Target Hit zone Line indicator */}
            <div className="absolute inset-x-0 bottom-12 h-6 bg-cyan-500/15 border-y-2 border-cyan-500 flex items-center justify-center">
              <span className="text-[9px] font-bold tracking-widest text-cyan-300 animate-pulse uppercase">
                GÕ NGAY KHI SAO ĐẠT VÙNG NÀY! ⭐
              </span>
            </div>

            {/* Fall stars list */}
            {stars.map((star) => (
              <span
                key={star.id}
                className="absolute text-3xl animate-bounce select-none pointer-events-none"
                style={{
                  left: `${star.col * 25 + 7}%`,
                  top: `${star.y}px`,
                  transition: "top 0.1s linear"
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Colorful Xylophone Buttons keys */}
          <div className="flex gap-2 sm:gap-3.5 mt-4 items-start justify-center h-28 sm:h-36">
            <button
              onClick={() => tapKey(0)}
              className="flex-1 rounded-2xl bg-gradient-to-t from-red-600 to-red-400 hover:opacity-90 active:scale-95 border-b-6 border-red-700 text-white font-black text-[10px] sm:text-xs shadow shadow-red-250 flex flex-col items-center justify-between py-3 transition-transform"
              style={{ height: "100%" }}
            >
              <span className="text-sm sm:text-lg select-none">❤️</span>
              <span className="truncate">ĐỎ</span>
            </button>
            <button
              onClick={() => tapKey(1)}
              className="flex-1 rounded-2xl bg-gradient-to-t from-blue-600 to-blue-400 hover:opacity-90 active:scale-95 border-b-6 border-blue-700 text-white font-black text-[10px] sm:text-xs shadow shadow-blue-250 flex flex-col items-center justify-between py-3 transition-transform"
              style={{ height: "90%" }}
            >
              <span className="text-sm sm:text-lg select-none">💙</span>
              <span className="truncate">LAM</span>
            </button>
            <button
              onClick={() => tapKey(2)}
              className="flex-1 rounded-2xl bg-gradient-to-t from-green-600 to-green-400 hover:opacity-90 active:scale-95 border-b-6 border-green-700 text-white font-black text-[10px] sm:text-xs shadow shadow-green-250 flex flex-col items-center justify-between py-3 transition-transform"
              style={{ height: "80%" }}
            >
              <span className="text-sm sm:text-lg select-none">💚</span>
              <span className="truncate">LỤC</span>
            </button>
            <button
              onClick={() => tapKey(3)}
              className="flex-1 rounded-2xl bg-gradient-to-t from-yellow-500 to-yellow-300 hover:opacity-90 active:scale-95 border-b-6 border-yellow-600 text-amber-950 font-black text-[10px] sm:text-xs shadow shadow-yellow-250 flex flex-col items-center justify-between py-3 transition-transform"
              style={{ height: "70%" }}
            >
              <span className="text-sm sm:text-lg select-none">💛</span>
              <span className="truncate">VÀNG</span>
            </button>
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
