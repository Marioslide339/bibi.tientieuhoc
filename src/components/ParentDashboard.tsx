import React, { useState } from "react";
import { ParentStats } from "../types";
import { BookOpen, Award, Clock, Star, Sparkles, TrendingUp, CheckCircle, RefreshCw, Smartphone, Volume2, VolumeX } from "lucide-react";
import { SoundEffects } from "../lib/sound";
import { 
  isSpeechSupported, 
  hasVietnameseVoice, 
  isSpeechEnabled, 
  setSpeechEnabled,
  cancelSpeech
} from "../lib/speech";

interface ParentDashboardProps {
  stats: ParentStats;
  onResetStats: () => void;
}

export default function ParentDashboard({ stats, onResetStats }: ParentDashboardProps) {
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState(isSpeechEnabled());
  const [speechSupported] = useState(isSpeechSupported());
  const [hasVi] = useState(hasVietnameseVoice());

  // Custom SVG Radar-style or Bar proficiency chart
  const renderProficiencyChart = () => {
    const modules = [
      { name: "🔤 Chữ cái", val: stats.moduleProficiency.letters, color: "#f43f5e" }, // rose-500
      { name: "🔢 Toán học", val: stats.moduleProficiency.math, color: "#3b82f6" },   // blue-500
      { name: "📚 Ngôn ngữ", val: stats.moduleProficiency.language, color: "#10b981" }, // emerald-500
      { name: "🧠 Tư duy", val: stats.moduleProficiency.logic, color: "#8b5cf6" },     // violet-500
      { name: "🌎 Thế giới", val: stats.moduleProficiency.world, color: "#f59e0b" },   // amber-500
      { name: "🎨 Mỹ thuật", val: stats.moduleProficiency.art, color: "#ec4899" },     // pink-500
      { name: "🎵 Âm nhạc", val: stats.moduleProficiency.music, color: "#06b6d4" },    // cyan-500
    ];

    return (
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" /> Biểu đồ tiến độ môn học (%)
        </h4>
        <div className="bg-slate-50 border-2 border-slate-200/80 p-4 rounded-2xl flex flex-col gap-3.5">
          {modules.map((m, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-24 text-xs font-bold text-slate-600 truncate">{m.name}</span>
              <div className="flex-1 bg-slate-200 rounded-full h-4 overflow-hidden relative shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.max(m.val, 5)}%`,
                    backgroundColor: m.color,
                  }}
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-[9px] font-extrabold text-slate-600">
                  {m.val}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Request parent counseling advice from Gemini based on real scores
  const getParentAdvice = async () => {
    SoundEffects.playPop();
    setLoadingAdvice(true);
    setAiAdvice("");

    const analysisMessage = `Chào Gấu BiBi, phụ huynh đang xem bảng thành tích học tập tiền tiểu học của bé.
Dưới đây là một số chỉ số của bé từ lớp học:
- Bài học đã hoàn thành: ${stats.lessonsCompleted}
- Điểm đếm số/toán thông minh: ${stats.moduleProficiency.math}/100
- Thuộc mặt chữ cái và tập viết: ${stats.moduleProficiency.letters}/100
- Từ vựng & ngôn ngữ tiếng Việt: ${stats.moduleProficiency.language}/100
- Khả năng tư duy logic phản xạ: ${stats.moduleProficiency.logic}/100
- Điểm rèn luyện Mỹ thuật sáng tạo: ${stats.moduleProficiency.art}/100
- Hiểu biết khoa học thế giới xung quanh: ${stats.moduleProficiency.world}/100
- Bé đã tích luỹ được ${stats.totalStars} ngôi sao vàng.

Hãy đóng vai là một Chuyên gia Giáo dục Tiền tiểu học hàng đầu (và là người bạn Gấu BiBi mến khách). Viết một bức thư tư vấn ngắn gọn, tâm lý, mang tính khích lệ cho phụ huynh.
Phân tích điểm mạnh nổi trội của bé dựa trên số liệu thực tế trên, chỉ ra 1 chỉ số cần bồi dưỡng thêm nhiều nhất, và gợi ý 2 trò chơi gia đình không dùng màn hình để rèn luyện thêm cho bé mỗi ngày.
Vui lòng soạn bằng tiếng Việt thật tinh tế, bố cục rõ ràng dưới 4 đoạn nhỏ gọn.`;

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: analysisMessage,
          history: []
        })
      });
      const data = await response.json();
      setAiAdvice(data.text || "Xin lỗi, Gấu BiBi hiện chưa gửi thư tư vấn kịp. Hãy thử tải lại nhé!");
      setIsAdvised(true);
    } catch (e) {
      console.error(e);
      setAiAdvice("Có lỗi kết nối. Hãy xem lời khuyên mặc định của Gấu BiBi: 'Mẹ hãy động viên bé rèn thêm cơ tay bằng cách tô màu vẽ tự do, đếm kẹo dẻo khi ăn và tập phát âm ghép cặp mỗi chiều tối nhé!'");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const [isAdvised, setIsAdvised] = useState(false);

  return (
    <div id="parent-dashboard-canvas" className="bg-white rounded-3xl border-4 border-slate-300 p-6 shadow-xl max-w-4xl mx-auto">
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-200 pb-5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="text-4xl">👨‍👩‍👧</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Góc Đồng Hành Cùng Cha Mẹ</h2>
            <p className="text-xs text-slate-500 font-medium">
              Theo dõi sự tiến bộ hàng ngày để chuẩn bị cho con hành trang tốt nhất vào Lớp 1.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              SoundEffects.playPop();
              setShowResetConfirm(true);
            }}
            className="flex items-center gap-1 bg-rose-100 hover:bg-rose-200 transition-colors text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            <RefreshCw className="h-3 w-3" /> Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Metrics Cards Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl text-center shadow-xs">
          <BookOpen className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-blue-900">{stats.lessonsCompleted}</div>
          <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Bài đã học</div>
        </div>
        
        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl text-center shadow-xs">
          <Star className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-amber-900">{stats.totalStars}</div>
          <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Sao đã đạt</div>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl text-center shadow-xs">
          <Clock className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-emerald-900">{stats.timeSpentMinutes} phút</div>
          <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Thời gian học</div>
        </div>

        <div className="bg-violet-50 border-2 border-violet-200 p-4 rounded-2xl text-center shadow-xs">
          <Award className="h-6 w-6 text-violet-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-violet-900">{stats.badges.length}</div>
          <div className="text-[10px] text-violet-700 font-bold uppercase tracking-wider">Huy hiệu</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Proficiency Chart */}
        <div>
          {renderProficiencyChart()}

          {/* Badges Earned Show */}
          <div className="mt-6">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-violet-500" /> Huy hiệu bé đã rinh được 🏆
            </h4>
            {stats.badges.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs p-4 rounded-2xl text-center italic">
                Chào phụ huynh! Bé chưa có huy hiệu nào vì chưa thi Bé tài năng hoặc tập vẽ. Hãy khích lệ bé tham gia để mở khóa nhé!
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {stats.badges.map((b, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-2.5 rounded-2xl text-center shadow-xs hover:scale-105 transition-all">
                    <span className="text-3xl block mb-1">🏅</span>
                    <span className="text-[10px] font-black text-amber-800 tracking-tight leading-tight block truncate uppercase">
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Counselor and Dynamic Advising */}
        <div className="flex flex-col gap-4">
          <div className="bg-lime-50 rounded-2xl border-2 border-lime-300 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-lime-300 text-lime-900 text-[9px] font-bold uppercase rounded-bl-xl shadow-inner">
              Tích hợp AI 🤖
            </div>

            <div className="flex items-start gap-3 mb-4">
              <span className="text-4xl">🐻</span>
              <div>
                <h4 className="text-sm font-bold text-lime-900">Báo cáo tư vấn Chuyên gia AI</h4>
                <p className="text-[11px] text-lime-700 font-medium">
                  Gấu BiBi và Gemini đánh giá lực học và đưa ra bài tập ngoại khóa khuyến dùng!
                </p>
              </div>
            </div>

            {loadingAdvice ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-lime-500 border-t-transparent" />
                <p className="text-xs text-lime-800 font-bold animate-pulse">
                  Gấu BiBi đang phân tích bảng điểm bé học...
                </p>
              </div>
            ) : aiAdvice ? (
              <div className="bg-white rounded-xl border border-lime-200 p-3.5 max-h-[300px] overflow-y-auto shadow-inner text-xs leading-relaxed text-slate-700 whitespace-pre-line family-serif font-medium">
                {aiAdvice}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-4 px-2">
                  Dựa vào hành trình sao tích lũy và bảng điểm học thử ở các chương học của bé, AI sẽ đề xuất giáo án bồi dưỡng cụ thể.
                </p>
                <button
                  onClick={getParentAdvice}
                  className="bg-lime-600 hover:bg-lime-700 transition-colors text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow shadow-lime-300 flex items-center gap-1.5 mx-auto"
                >
                  <Sparkles className="h-4 w-4 animate-pulse" /> Xem Lời Khuyên Chuyên Gia
                </button>
              </div>
            )}

            {aiAdvice && (
              <button
                onClick={getParentAdvice}
                className="mt-3 text-[10px] font-extrabold text-lime-700 hover:text-lime-900 flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="h-3 w-3" /> Phân tích & Tải lời khuyên mới
              </button>
            )}
          </div>

          {/* Cài đặt Trợ lý Gấu BiBi */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-slate-500" /> Cấu hình giọng đọc Trợ lý AI
            </h5>
            
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-700">Giọng đọc tiếng Việt (TTS)</p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  Tự động phát âm khi Gấu BiBi trả lời chat hoặc AI nhận xét bài làm của bé.
                </p>
              </div>
              
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
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  voiceEnabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    voiceEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Check browser compatibility */}
            {!speechSupported ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[10px] p-2.5 rounded-xl font-medium leading-tight">
                ⚠️ Trình duyệt này không hỗ trợ giọng đọc tiếng nói. Hãy thử đổi sang Google Chrome hoặc Microsoft Edge nhé!
              </div>
            ) : !hasVi ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] p-2.5 rounded-xl font-medium leading-tight">
                ⚠️ Chưa phát hiện giọng đọc Tiếng Việt chuẩn của hệ thống. Bạn vẫn có thể chạm nghe trực tiếp từng từ/chữ cái.
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] p-2.5 rounded-xl font-medium leading-tight flex items-center gap-1">
                ✅ Đã tìm thấy giọng chuẩn tiếng Việt từ trình duyệt!
              </div>
            )}
          </div>

          {/* Activity Log Tracker */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Hành trình học kỳ</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 rounded-full font-sans-serif">
                Thời gian thực
              </span>
            </h5>
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
              {stats.recentActivities.length === 0 ? (
                <p className="text-slate-400 text-xs italic text-center py-4">Bé học thử môn nào, nhật ký sẽ lưu ở đây nha bố mẹ!</p>
              ) : (
                stats.recentActivities.slice().reverse().map((act, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-2 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-700 font-bold leading-tight">{act.description}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{act.timestamp}</p>
                      </div>
                    </div>
                    <span className="flex items-center text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                      +{act.starsEarned}⭐
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-4 border-slate-300 p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-3 animate-pulse">⚠️⚙️</div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Bố Mẹ Muốn Làm Mới?</h4>
            <p className="text-xs text-slate-500 font-bold leading-relaxed mb-5">
              Hành động này sẽ xóa toàn bộ tiến trình học kỳ, số Sao Vàng tích lũy và huy hiệu của bé để bắt đầu lại từ đầu nhé bố mẹ.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  SoundEffects.playPop();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs active:scale-95 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  SoundEffects.playError();
                  onResetStats();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-200 active:scale-95 transition-all"
              >
                Xác nhận Xóa 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
