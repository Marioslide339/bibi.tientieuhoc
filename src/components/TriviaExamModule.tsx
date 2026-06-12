import React, { useState } from "react";
import { Award, Star, Compass, Play, Trophy, Sparkles, ChevronRight, HelpCircle, CheckCircle, RotateCcw } from "lucide-react";
import { SoundEffects } from "../lib/sound";
import { QuizQuestion } from "../types";

interface TriviaExamProps {
  onEarnStars: (amount: number, description: string) => void;
  onAddBadge: (badge: string) => void;
  onUpdateFullProficiencies: (score: number) => void;
}

export default function TriviaExamModule({ onEarnStars, onAddBadge, onUpdateFullProficiencies }: TriviaExamProps) {
  const [level, setLevel] = useState<"easy" | "medium" | "hard" | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [answeredState, setAnsweredState] = useState<boolean | null>(null); // null, true: correct, false: wrong
  const [examScore, setExamScore] = useState(0);
  const [examFinished, setExamFinished] = useState(false);

  // Exquisite bank of quizzes adapted to Pre-school 5-6 year olds
  const questionsBank: Record<"easy" | "medium" | "hard", QuizQuestion[]> = {
    easy: [
      {
        id: "e1",
        module: "letters",
        type: "multiple-choice",
        question: "Chữ cái nào đứng đầu tiên trong bảng chữ cái tiếng Việt nhỉ? 🔤",
        options: ["Chữ B", "Chữ A", "Chữ C", "Chữ D"],
        correctAnswer: "Chữ A"
      },
      {
        id: "e2",
        module: "math",
        type: "count",
        question: "1 chú mèo 🐱 thêm 2 chú mèo 🐱🐱 là mấy chú mèo?",
        options: ["2 chú", "3 chú", "4 chú", "5 chú"],
        correctAnswer: "3 chú"
      },
      {
        id: "e3",
        module: "world",
        type: "multiple-choice",
        question: "Bạn nào kêu 'Ò ó o o' đánh thức mọi người ngủ dậy? 🐔",
        options: ["Chú Vịt", "Chú Gà Trống", "Bạn Trâu", "Bạn Cún"],
        correctAnswer: "Chú Gà Trống"
      },
      {
        id: "e4",
        module: "language",
        type: "multiple-choice",
        question: "Quả gì màu đỏ 🍎 có chữ cái đầu là chữ T (Tờ)?",
        options: ["Quả Cam", "Quả Táo", "Củ Cải", "Cây Chuối"],
        correctAnswer: "Quả Táo"
      },
      {
        id: "e5",
        module: "logic",
        type: "multiple-choice",
        question: "Hình nào tròn xoe lăn lông lốc được trên sàn nhà? 🔴",
        options: ["Hình Tam Giác", "Hình Vuông", "Hình Tròn", "Hình Chữ Nhật"],
        correctAnswer: "Hình Tròn"
      }
    ],
    medium: [
      {
        id: "m1",
        module: "math",
        type: "multiple-choice",
        question: "Bé điền dấu thích hợp: 9 🌟 ..... 5 🌟",
        options: ["Dấu bé hơn (<)", "Dấu lớn hơn (>)", "Dấu bằng nhau (=)"],
        correctAnswer: "Dấu lớn hơn (>)"
      },
      {
        id: "m2",
        module: "letters",
        type: "multiple-choice",
        question: "Cặp chữ hoa và chữ thường nào ghép đúng với nhau? 🅰️ - ⓐ",
        options: ["Chữ M và chữ n", "Chữ A và chữ a", "Chữ O và chữ e"],
        correctAnswer: "Chữ A và chữ a"
      },
      {
        id: "m3",
        module: "world",
        type: "multiple-choice",
        question: "Xe chữa cháy 🚒 và vòi xịt nước 💦 là của ai nhỉ?",
        options: ["Bác Sĩ", "Chú Lính Cứu Hỏa", "Thầy Giáo", "Bác Nông Dân"],
        correctAnswer: "Chú Lính Cứu Hỏa"
      },
      {
        id: "m4",
        module: "logic",
        type: "multiple-choice",
        question: "Số nào còn thiếu ở dấu [?]: 4, 5, 6, [ ? ], 8, 9",
        options: ["Số 6", "Số 7", "Số 8", "Số 10"],
        correctAnswer: "Số 7"
      },
      {
        id: "m5",
        module: "language",
        type: "multiple-choice",
        question: "Từ nào viết đúng tên của quả bóng tròn này: ⚽?",
        options: ["Quả bống", "Quả Bóng", "Khoả xóng", "Phả bóng"],
        correctAnswer: "Quả Bóng"
      }
    ],
    hard: [
      {
        id: "h1",
        module: "logic",
        type: "multiple-choice",
        question: "Hôm qua là Thứ Ba, vậy hôm nay là Thứ mấy? 📆",
        options: ["Thứ Tư", "Thứ Năm", "Chủ Nhật", "Thứ Hai"],
        correctAnswer: "Thứ Tư"
      },
      {
        id: "h2",
        module: "math",
        type: "multiple-choice",
        question: "Bé có 15 cái kẹo 🍬, bé ăn mất 5 cái. Bé còn mấy cái?",
        options: ["5 cái", "10 cái", "12 cái", "15 cái"],
        correctAnswer: "10 cái"
      },
      {
        id: "h3",
        module: "letters",
        type: "multiple-choice",
        question: "Từ nào có chứa cả chữ cái Ô và chữ cái A? 🌸",
        options: ["Bông hoa", "Quả bom", "Cá hề", "Ếch ngồi"],
        correctAnswer: "Bông hoa"
      },
      {
        id: "h4",
        module: "world",
        type: "multiple-choice",
        question: "Trái tim ❤️ giúp làm gì cho cơ thể chúng ta?",
        options: ["Dùng để suy nghĩ đếm số", "Bơm và đẩy máu đi nuôi khắp cơ thể", "Dùng để hít thở khí oxy"],
        correctAnswer: "Bơm và đẩy máu đi nuôi khắp cơ thể"
      },
      {
        id: "h5",
        module: "logic",
        type: "multiple-choice",
        question: "Quy luật: 🔴 🟡 🔴 🟡. Hình tiếp theo sẽ là màu gì?",
        options: ["Màu Đen", "Màu Đỏ", "Màu Xanh", "Màu Trắng"],
        correctAnswer: "Màu Đỏ"
      }
    ]
  };

  const startExam = (chosenLevel: "easy" | "medium" | "hard") => {
    SoundEffects.playPop();
    setLevel(chosenLevel);
    setCurrentIdx(0);
    setSelectedAns(null);
    setAnsweredState(null);
    setExamScore(0);
    setExamFinished(false);
  };

  const handleAnswerSelect = (option: string) => {
    if (answeredState !== null) return; // locked
    SoundEffects.playPop();
    setSelectedAns(option);
  };

  const verifyAnswer = () => {
    if (!level || selectedAns === null) return;
    const currentQ = questionsBank[level][currentIdx];
    
    const isCorrect = selectedAns === currentQ.correctAnswer;
    setAnsweredState(isCorrect);
    
    if (isCorrect) {
      SoundEffects.playSuccess();
      setExamScore(prev => prev + 1);
      onEarnStars(3, `Thi Bé Tài Năng: Đúng câu hỏi số ${currentIdx + 1}`);
    } else {
      SoundEffects.playError();
    }
  };

  const nextQuestion = () => {
    if (!level) return;
    SoundEffects.playPop();

    if (currentIdx < questionsBank[level].length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAns(null);
      setAnsweredState(null);
    } else {
      // Completed Full quiz!
      setExamFinished(true);
      SoundEffects.playStarReward();
      
      // update parental scores
      onUpdateFullProficiencies(examScore * 20); // updates percentage based on correct answers (e.g. 5/5 = 100%)

      // bonus awards
      if (examScore === 5) {
        onEarnStars(20, `Đạt điểm tối đa tuyệt đối kì thi Bé Tài Năng cấp độ ${level.toUpperCase()}`);
        onAddBadge(`TRẠNG NGUYÊN KHÔI NGUYÊN 🎓`);
      } else {
        onEarnStars(10, `Bé hoàn thành kì thi Bé Tài Năng cấp độ ${level.toUpperCase()}`);
        onAddBadge(`DŨNG SĨ SÁNG TẠO 🏅`);
      }
    }
  };

  const currentQ = level ? questionsBank[level][currentIdx] : null;

  return (
    <div id="trivia-exam-wrapper" className="bg-violet-50/50 rounded-3xl p-6 border-4 border-violet-300">
      
      {/* Category Banner Header */}
      <div className="flex items-center gap-3.5 border-b pb-4 mb-6">
        <div className="text-4xl filter drop-shadow animate-pulse select-none">👑🏆🏅</div>
        <div>
          <h2 className="text-2xl font-black text-violet-950 tracking-tight">Trường Thi Trạng Nguyên Nhỏ</h2>
          <p className="text-xs text-violet-850 font-medium">Trắc nghiệm vui về chữ cái, toán học và thế giới xung quanh!</p>
        </div>
      </div>

      {!level && (
        <div className="bg-white p-6 rounded-2xl border-4 border-violet-200 text-center shadow-xs">
          <h3 className="font-extrabold text-slate-800 text-sm mb-2">Bé Hãy Chọn Màn Khảo Hạch Thử Tài:</h3>
          <p className="text-xs text-slate-500 mb-6">Mẹo học tập: Tập nâng cao điểm bằng cách làm từ màn Dễ lên màn Nâng Cao nhé!</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            {/* Easy */}
            <button
              onClick={() => startExam("easy")}
              className="bg-emerald-50 hover:bg-emerald-100 border-3 border-emerald-300 p-5 rounded-2xl flex flex-col items-center gap-1.5 hover:scale-103 transition-transform shadow-xs"
            >
              <span className="text-4xl select-none">🔰</span>
              <span className="font-extrabold text-emerald-800 text-sm">Cấp Độ Dễ</span>
              <span className="text-[10px] text-emerald-600 font-medium font-serif">Chữ cái & đếm đồ vật đơn giản</span>
            </button>

            {/* Medium */}
            <button
              onClick={() => startExam("medium")}
              className="bg-amber-50 hover:bg-amber-100 border-3 border-amber-300 p-5 rounded-2xl flex flex-col items-center gap-1.5 hover:scale-103 transition-transform shadow-xs"
            >
              <span className="text-4xl select-none">🎖️</span>
              <span className="font-extrabold text-amber-800 text-sm">Cấp Trung Bình</span>
              <span className="text-[10px] text-amber-600 font-medium font-serif">So sánh dấu cá sấu, điền số khuyết</span>
            </button>

            {/* Hard */}
            <button
              onClick={() => startExam("hard")}
              className="bg-rose-50 hover:bg-rose-105 border-3 border-rose-300 p-5 rounded-2xl flex flex-col items-center gap-1.5 hover:scale-103 transition-transform shadow-xs"
            >
              <span className="text-4xl select-none">👑</span>
              <span className="font-extrabold text-rose-800 text-sm">Cấp Nâng Cao</span>
              <span className="text-[10px] text-rose-600 font-medium font-serif">Logic thứ ngày, giải câu đố mẹo</span>
            </button>
          </div>
        </div>
      )}

      {level && !examFinished && currentQ && (
        <div className="bg-white rounded-3xl border-4 border-violet-200 p-6 shadow-sm max-w-2xl mx-auto flex flex-col gap-5 justify-between">
          
          {/* Header Track Bar progress */}
          <div className="flex items-center justify-between border-b pb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-[9px] bg-violet-200 text-violet-900 border border-violet-300 rounded-full px-2 py-0.5 font-bold uppercase">
                Khảo hạch: Cấp {level === "easy" ? "DỄ" : level === "medium" ? "TRUNG BÌNH" : "NÂNG CAO"}
              </span>
              <h4 className="text-xs font-black text-slate-500 mt-1">Câu hỏi {currentIdx + 1} / 5</h4>
            </div>

            {/* Simulated cute green tracker bar */}
            <div className="w-1/3 bg-slate-200 rounded-full h-3 overflow-hidden relative">
              <div 
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${(currentIdx / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text frame */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 font-mono flex items-center gap-1">
              🎯 ĐỀ KHẢO HẠCH MÔN: <span className="uppercase text-violet-600 font-black">{currentQ.module}</span>
            </span>

            <h3 className="text-sm font-extrabold text-slate-800 leading-relaxed mt-1 mb-5">
              {currentQ.question}
            </h3>

            {/* Answer Options selectors */}
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedAns === opt;
                const isCorrectAns = opt === currentQ.correctAnswer;
                
                let btnStyle = "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200";
                if (isSelected) {
                  btnStyle = "bg-violet-100 border-violet-500 text-violet-950";
                }
                if (answeredState !== null) {
                  if (isSelected) {
                    btnStyle = answeredState ? "bg-emerald-500 border-emerald-600 text-white shadow-md" : "bg-rose-400 border-rose-500 text-white shadow-md";
                  } else if (isCorrectAns) {
                    btnStyle = "bg-emerald-200 border-emerald-400 text-emerald-950 opacity-90";
                  } else {
                    btnStyle = "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={answeredState !== null}
                    onClick={() => handleAnswerSelect(opt)}
                    className={`p-3 rounded-2xl text-left text-xs font-black border-2 transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification & Control buttons panel */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            {answeredState === null ? (
              <button
                onClick={verifyAnswer}
                disabled={selectedAns === null}
                className={`py-2 px-5 text-xs font-black rounded-xl transition-all ${
                  selectedAns !== null
                    ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                CỘP DẤU TRẢ LỜI ✍️
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="py-2.5 px-6 font-black text-xs text-white bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-95 active:scale-95 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                {currentIdx < 4 ? (
                  <>
                    Tiếp theo câu khuyết <ChevronRight className="h-4.5 w-4.5" />
                  </>
                ) : (
                  <>
                    🏆 XEM BẢNG PHONG TRẠNG NGUYÊN!
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      )}

      {/* Graduation results report card */}
      {examFinished && (
        <div className="bg-white rounded-3xl border-8 border-yellow-400 p-6 shadow-2xl overflow-hidden max-w-lg mx-auto text-center relative">
          
          {/* Confetti simulator visuals */}
          <div className="absolute inset-0 pointer-events-none text-2xl select-none overflow-hidden h-full w-full">
            <span className="absolute animate-bounce opacity-80 left-4 top-5">🎉</span>
            <span className="absolute animate-bounce opacity-85 right-8 top-12">🎊</span>
            <span className="absolute animate-bounce opacity-90 left-12 bottom-6">🌟</span>
            <span className="absolute animate-bounce opacity-80 right-4 bottom-20">🧁</span>
          </div>

          <div className="mb-4">
            <div className="flex justify-center items-center gap-3 mb-3">
              <span className="text-4xl animate-bounce" style={{ animationDelay: "0.1s" }}>👑</span>
              <span className="text-6xl animate-pulse filter drop-shadow-lg">🏆</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: "0.3s" }}>🎓</span>
            </div>
            <h3 className="font-black text-xl text-yellow-600 uppercase tracking-widest">
              BẢNG PHONG TRẠNG NGUYÊN
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Khóa thi Tuổi Thần Tiên chuẩn bị sang Lớp 1
            </p>
          </div>

          {/* Certificate middle panel */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border-2 border-dashed border-yellow-300 p-6 mb-6">
            <h4 className="text-sm font-black text-amber-900 border-b border-yellow-200 pb-2 mb-3">
              Chứng thực Trí Tuệ Khải Hoàn
            </h4>
            
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-serif">
              Bạn nhỏ đáng yêu xuất sắc vượt qua các môn khảo hạch thi trạng nguyên mầm non cấp độ <span className="font-extrabold text-yellow-600 uppercase">{level}</span> với số điểm vinh hiển:
            </p>

            <div className="my-4">
              <span className="text-5xl font-black text-yellow-500 block font-mono">
                {examScore} / 5
              </span>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">CÂU TRẢ LỜI CHÍNH XÁC</p>
            </div>

            <p className="text-[11px] text-slate-500 italic mt-2 font-medium">
              Vinh phong học vị: <span className="font-bold text-amber-800 uppercase">"{examScore === 5 ? "Trạng Nguyên Hoạt Bát" : "Bảng Nhãn Tự Tin"}"</span>
            </p>
          </div>

          {/* Navigation reset */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setLevel(null)}
              className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" /> Thi lại màn khác
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
