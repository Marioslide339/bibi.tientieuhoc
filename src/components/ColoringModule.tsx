import React, { useState, useRef, useEffect } from "react";
import { Paintbrush, Eraser, Download, Trash2, Award, Sparkles, Smile, Image as ImageIcon } from "lucide-react";
import { SoundEffects } from "../lib/sound";
import { speak } from "../lib/speech";

interface ColoringModuleProps {
  onEarnStars: (amount: number, description: string) => void;
  onAddBadge: (badge: string) => void;
}

export default function ColoringModule({ onEarnStars, onAddBadge }: ColoringModuleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#f43f5e"); // Rose-500
  const [brushSize, setBrushSize] = useState(8);
  const [stampMode, setStampMode] = useState<string | null>(null); // emoji stamp
  const [template, setTemplate] = useState<"blank" | "doggie" | "house" | "train">("blank");

  // AI evaluation states
  const [loadingAi, setLoadingAi] = useState(false);
  const [artFeedback, setArtFeedback] = useState("");
  const [canvasStars, setCanvasStars] = useState<number | null>(null);

  const colors = [
    "#f43f5e", // pink/rose
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#a855f7", // purple
    "#ffffff", // white (for eraser)
    "#0f172a", // black/slate 900
  ];

  const stamps = [
    "⭐", "🎈", "🧸", "❤️", "🍪", "🍭", "🍀", "🚀"
  ];

  useEffect(() => {
    resetCanvas();
  }, [template]);

  const resetCanvas = () => {
    SoundEffects.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Soft off-white clean sheet
    ctx.fillStyle = "#fafaf9"; // stone 50
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw templates outlines if selected
    ctx.strokeStyle = "rgba(100, 116, 139, 0.25)"; // slate 500 low opacity outline
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    if (template === "doggie") {
      // Draw simple cartoon dog guide silhouette
      ctx.beginPath();
      // head circle
      ctx.arc(180, 100, 45, 0, Math.PI * 2);
      // snout
      ctx.arc(180, 115, 15, 0, Math.PI * 2);
      // floppy ears
      ctx.ellipse(130, 90, 15, 35, Math.PI / 6, 0, Math.PI * 2);
      ctx.ellipse(230, 90, 15, 35, -Math.PI / 6, 0, Math.PI * 2);
      // body
      ctx.ellipse(180, 190, 40, 55, 0, 0, Math.PI * 2);
      // tail
      ctx.quadraticCurveTo(220, 170, 245, 140);
      ctx.stroke();
    } else if (template === "house") {
      // Draw cosy country home outline
      ctx.beginPath();
      // base box
      ctx.rect(100, 120, 160, 110);
      // roof triangle
      ctx.moveTo(80, 120);
      ctx.lineTo(180, 50);
      ctx.lineTo(280, 120);
      ctx.closePath();
      // door
      ctx.rect(160, 170, 40, 60);
      // windows
      ctx.rect(120, 140, 30, 30);
      ctx.rect(210, 140, 30, 30);
      ctx.stroke();
    } else if (template === "train") {
      // Draw a cute steam train engineguide
      ctx.beginPath();
      // flat chassis
      ctx.rect(80, 170, 200, 30);
      // cabin cab
      ctx.rect(200, 90, 80, 80);
      // front boiler box
      ctx.rect(110, 110, 90, 60);
      // funnel chimney
      ctx.rect(130, 75, 20, 35);
      // wheels
      ctx.arc(115, 215, 20, 0, Math.PI * 2);
      ctx.arc(175, 215, 20, 0, Math.PI * 2);
      ctx.arc(245, 215, 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    setArtFeedback("");
    setCanvasStars(null);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    if (stampMode) {
      // Stamp Placement instead of drawing line!
      SoundEffects.playPop();
      ctx.font = "40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stampMode, x, y);
    } else {
      // Drawing line
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const drawLine = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing || stampMode) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
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
      canvas.getContext("2d")?.beginPath();
    }
  };

  // Submit artwork to Gemini Vision evaluator
  const evaluateArtwork = async () => {
    SoundEffects.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoadingAi(true);
    setArtFeedback("");
    setCanvasStars(null);

    const canvasData = canvas.toDataURL("image/png");

    try {
      const response = await fetch("/api/gemini/evaluate-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: canvasData,
          target: template === "blank" ? "Bức vẽ tự do đầy sáng tạo" : `Bức vẽ tô màu đề tài ${template}`,
          type: "draw"
        })
      });
      const data = await response.json();
      
      setLoadingAi(false);
      setArtFeedback(data.feedback);
      setCanvasStars(data.score || 5);

      // Award matching stars
      onEarnStars(data.score, `Xong tác phẩm rèn luyện thẩm mỹ mỹ thuật sáng tạo`);
      onAddBadge("HỌA SĨ TÍ HON 🎨");
      SoundEffects.playStarReward();

      // Voice vocalize the praise
      speak(data.feedback, {
        pitch: 1.35,
        rate: 0.95
      });

    } catch (e) {
      console.error(e);
      setLoadingAi(false);
      setCanvasStars(5);
      setArtFeedback("Tuyệt mĩ rực rỡ! Màu sắc của bé phân bố thật tinh tế và lấp lánh nụ cười hồn nhiên. Cô BiBi tặng bé 5 sao nghệ thuật trọn vẹn!");
      onEarnStars(5, "Tác phẩm vẽ sắc màu sáng tạo tự do");
    }
  };

  return (
    <div id="coloring-studio-arena" className="bg-pink-50/50 rounded-3xl p-6 border-4 border-pink-300">
      
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="text-4xl">🎨</div>
          <div>
            <h2 className="text-2xl font-black text-pink-900 tracking-tight">Xưởng Mỹ Thuật Sáng Tạo</h2>
            <p className="text-xs text-pink-700 font-medium">Thỏa sức tô màu tranh vẽ động vật, dán sticker và nhờ Trợ lý AI biểu dương nghệ thuật!</p>
          </div>
        </div>

        {/* Template Selectors */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => { SoundEffects.playPop(); setTemplate("blank"); setStampMode(null); }}
            className={`px-3 py-1.5 text-[11px] font-black rounded-xl border-2 flex items-center gap-1.5 transition-all ${
              template === "blank" ? "bg-pink-500 text-white border-pink-600" : "bg-white text-pink-700 border-pink-200"
            }`}
          >
            📄 Tờ giấy trống
          </button>
          
          <button
            onClick={() => { SoundEffects.playPop(); setTemplate("doggie"); setStampMode(null); }}
            className={`px-3 py-1.5 text-[11px] font-black rounded-xl border-2 flex items-center gap-1.5 transition-all ${
              template === "doggie" ? "bg-pink-500 text-white border-pink-600" : "bg-white text-pink-700 border-pink-200"
            }`}
          >
            🐶 Tô màu Cún Con
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setTemplate("house"); setStampMode(null); }}
            className={`px-3 py-1.5 text-[11px] font-black rounded-xl border-2 flex items-center gap-1.5 transition-all ${
              template === "house" ? "bg-pink-500 text-white border-pink-600" : "bg-white text-pink-700 border-pink-200"
            }`}
          >
            🏡 Tô màu Ngôi Nhà
          </button>

          <button
            onClick={() => { SoundEffects.playPop(); setTemplate("train"); setStampMode(null); }}
            className={`px-3 py-1.5 text-[11px] font-black rounded-xl border-2 flex items-center gap-1.5 transition-all ${
              template === "train" ? "bg-pink-500 text-white border-pink-600" : "bg-white text-pink-700 border-pink-200"
            }`}
          >
            🚂 Tô màu Xe Lửa
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Toolbar: Colors, Brushes & Stickers */}
        <div className="w-full lg:w-1/4 bg-white p-4 rounded-3xl border-2 border-pink-200 shadow-sm flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-6 shrink-0">
          
          {/* Colors palette */}
          <div className="min-w-[170px] lg:min-w-0 flex-1">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1 whitespace-nowrap">
              <Paintbrush className="h-3.5 w-3.5" /> Bút Sáp Màu:
            </h4>
            <div className="flex lg:grid lg:grid-cols-4 gap-2 overflow-x-auto lg:overflow-x-visible pb-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    SoundEffects.playPop();
                    setColor(c);
                    setStampMode(null);
                  }}
                  className={`h-9 w-9 rounded-full border-3 transition-transform shrink-0 ${
                    color === c && !stampMode
                      ? "border-pink-600 scale-110 shadow"
                      : "border-slate-100"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c === "#ffffff" ? "Cục tẩy" : "Màu sáp"}
                />
              ))}
            </div>
          </div>

          {/* Brush Sizes */}
          <div className="min-w-[130px] lg:min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex justify-between text-xs text-slate-500 mb-1 font-semibold whitespace-nowrap">
              <span>Bút nét:</span>
              <span className="font-mono">{brushSize}px</span>
            </div>
            <input
              type="range"
              min={3}
              max={25}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          {/* Stickers */}
          <div className="min-w-[190px] lg:min-w-0 flex-1">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1 whitespace-nowrap">
              <Smile className="h-3.5 w-3.5" /> Dán Sticker:
            </h4>
            <div className="flex lg:grid lg:grid-cols-4 gap-2 overflow-x-auto lg:overflow-x-visible pb-1">
              {stamps.map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    SoundEffects.playPop();
                    setStampMode(st);
                  }}
                  className={`h-9 w-9 text-lg font-bold bg-pink-50 rounded-xl border-3 flex items-center justify-center shrink-0 transition-all ${
                    stampMode === st
                      ? "border-pink-500 bg-pink-100 scale-105"
                      : "border-transparent"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons list */}
          <div className="min-w-[120px] lg:min-w-0 flex-1 flex items-center justify-center lg:pt-2 lg:border-t lg:border-slate-100">
            <button
              onClick={resetCanvas}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" /> Xóa giấy vẽ
            </button>
          </div>

        </div>

        {/* Right: Interactive Drawing Canvas with AI review frame */}
        <div className="lg:w-3/4 flex flex-col items-center">
          
          <div className="bg-amber-950 p-4 pb-3 pt-6 rounded-3xl shadow-lg w-full max-w-[425px] aspect-[425/300] relative flex items-center justify-center">
            {/* Styled iPad-like drawing borders */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-2.5 w-[50px] bg-slate-800 rounded-full" />
            
            <canvas
              ref={canvasRef}
              width={425}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={drawLine}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={drawLine}
              onTouchEnd={stopDrawing}
              className="w-full h-full rounded-2xl bg-stone-50 cursor-crosshair touch-none border-2 border-slate-900"
            />
          </div>

          {/* Action trigger AI rating */}
          <button
            onClick={evaluateArtwork}
            disabled={loadingAi}
            className="mt-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:opacity-95 text-white active:scale-95 text-xs font-black py-4 px-8 rounded-2xl shadow-lg shadow-purple-200 flex items-center gap-1.5 justify-center transition-all"
          >
            {loadingAi ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Gấu BiBi đang triển lãm mỹ thuật tranh vẽ...
              </>
            ) : (
              <>
                <Award className="h-5 w-5 animate-bounce" /> TRỢ LÝ AI GẤU BIBI ĐÁNH GIÁ TRANH VẼ! 🐻✨
              </>
            )}
          </button>

          {/* Evaluation output feedback */}
          {canvasStars !== null && (
            <div className="mt-5 bg-yellow-50 border-3 border-yellow-300 rounded-3xl p-5 w-full max-w-lg shadow animate-in zoom-in-95 duration-200">
              <div className="flex justify-center mb-1.5 gap-1 select-none">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-3xl ${
                      i < canvasStars ? "text-yellow-400 animate-pulse" : "text-slate-200"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-center font-bold text-amber-950 text-xs whitespace-pre-line leading-relaxed italic">
                🐻 "{artFeedback}"
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
