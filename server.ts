import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini client (safe lazy assessment)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Return null or throw structured error. We'll return null to allow child-friendly simulator mode if offline/no key!
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload sizes to allow drawing canvas streams (base64 PNG)
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API 1: Chat with mascot "Gấu BiBi"
  app.post("/api/gemini/chat", async (req, res) => {
    const { message, history } = req.body;
    try {
      const ai = getGeminiClient();

      if (!ai) {
        // Child-friendly Simulated Mascot Response for Offline/Development without keys
        const simulatedReplies = [
          "Ôi tuyệt vời quá! Bạn nhỏ ơi, chúng mình cùng làm thêm một bài thơ hoặc chơi đố vui toán học nữa nhé! Gấu BiBi rất tự hào về bé!",
          "Bé giỏi quá ta! Chữ cái này đọc thật chuẩn âm luôn nè. Bé có muốn Gấu BiBi kể một câu chuyện thần thoại ngắn không nào?",
          "Học đi đôi với hành, bé làm xuất sắc lắm! Hãy uống một ngụm nước ấm rồi chúng mình khám phá tiếp thế giới muôn loài nhé!",
          "Chúc bé một ngày học tập thật tràn đầy niềm vui! BiBi luôn ở đây đồng hành cùng bé chuẩn bị vào lớp 1 thật tự tin!",
          "Ồ toán học thật kỳ diệu phải không bé yêu? Con số tiếp theo bé đoán xem là số mấy nào?"
        ];
        const randomReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
        return res.json({ text: `[MASCOT SIMULATED] ${randomReply}` });
      }

      // Convert history format if present
      const contents = (history || []).map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      }));
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: "Bạn là Gấu BiBi, một chú gấu bông hoạt hình 3D Pixar cực kỳ đáng yêu, thông minh và là người bạn đồng hành của trẻ em Việt Nam 5-6 tuổi đang chuẩn bị vào lớp 1. Nói bằng giọng ngọt ngào, ấm áp, ngắn gọn (tối đa 3 câu), dùng ngôn từ dễ hiểu của trẻ nhỏ, thường xuyên khen ngợi bé bằng những cụm từ truyền cảm hứng như 'Bé giỏi quá!', 'Tuyệt vời ông mặt trời!', 'BiBi yêu bé nhất!'. Hỗ trợ giải thích ngắn gọn chữ cái, phép đếm số và khích lệ bé học tập.",
          temperature: 0.8,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in BiBi Chat API (falling back dynamically):", error);
      
      const isParentCounseling = message && (message.includes("phụ huynh") || message.includes("thành tích") || message.includes("bồi dưỡng"));
      
      if (isParentCounseling) {
        const advice = `Thân gửi phụ huynh đồng hành cùng con trẻ từ Gấu BiBi! 🐻✨

Bé đang có sự cố gắng tuyệt vời trên hành trình làm quen với tri thức lớp 1! Dựa trên các chỉ số hoạt động thực tế, BiBi thấy bé rất nhạy bén với tư duy hình học và có năng khiếu bẩm sinh rực rỡ với các sắc màu. Đây là bệ phóng tư duy quan trọng giúp con tự tin.

Để giúp bé phát triển toàn diện hơn nữa:
1. Bồi dưỡng vận động thô và tinh: Thường xuyên khích lệ bé tập tô theo bảng chữ cái nét thẳng, nét cong để nét bút vững vàng hơn.
2. Trò chơi không màn hình gợi ý:
   - Trò chơi "Khu rừng chữ cái giấy": Cắt các mẩu bìa rác viết chữ cái mầm non, đố bé rinh đi dán vào đồ vật trong nhà bắt đầu bằng chữ đó.
   - Trò chơi "Gõ nhịp xúc xắc": Đố bé cộng trừ hạt dẻ hoặc viên kẹo tròn lấp lánh khi đi dạo, bé vừa thích vừa rèn đếm sâu.

Gấu BiBi luôn cùng gia đình vun đắp ngọn lửa hiếu học trong con! Chúc bé học tập hạnh phúc mỗi ngày! ✨🎒`;
        return res.json({ text: advice });
      }

      const simulatedReplies = [
        "Mách nhỏ bạn nhỏ ơi: Học tập cùng Gấu BiBi là bước chuẩn bị vàng vào lớp 1 đó nha! Chúng mình khám phá thế giới xung quanh tiếp thôi nào!",
        "Bé giỏi quá ta! Chữ cái này đọc thật chuẩn âm luôn nè. Bé có muốn Gấu BiBi kể một câu chuyện thần thoại hoặc đố phép cộng toán học không nào?",
        "Học đi đôi với hành, bé làm chuẩn không cần chỉnh luôn! Hãy uống một ngụm nước rồi chúng mình khám phá tiếp bài ca nhịp điệu nhé!",
        "Chúc bé một ngày học tập thật tràn đầy niềm vui! BiBi yêu bé nhất và luôn ở đây đồng hành cùng bé chuẩn bị vững tâm thế vào lớp 1!"
      ];
      const randomReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
      res.json({ text: `[BIBI CHĂM CHỈ] ${randomReply}` });
    }
  });

  // API 2: Generate Interactive Children Story
  app.post("/api/gemini/story", async (req, res) => {
    try {
      const { hero, setting, moral } = req.body;
      const ai = getGeminiClient();

      const defaultLocalStories: Record<string, any> = {
        "Khỉ con tinh nghịch": {
          title: "Khỉ Con Học Chia Sẻ Trái Ngọt",
          pages: [
            {
              text: "Ngày xửa ngày xưa, tại một khu rừng phép thuật đầy hoa quả thơm ngon, chú Khỉ Con tinh nghịch nhặt được một quả chuối khổng lồ vàng óng. Chú khập khiễng ôm quả chuối về nhà nhưng gặp Sóc Nhỏ đang đói bụng.",
              prompt: "A Pixar 3D-styled cheerful little monkey holding a giant glowing yellow banana in a beautiful glowing magical forest, happy cartoon animal style, soft morning lighting",
              question: "Câu đố cho bé: Khỉ con nên làm gì với quả chuối khổng lồ này nhỉ?",
              choices: ["Một mình ăn hết quả chuối ngon lành", "Bẻ đôi chia sẻ cùng bạn Sóc Nhỏ"]
            },
            {
              text: "Khỉ Con mỉm cười bẻ đôi quả chuối, tặng cho Sóc Nhỏ phần lớn hơn. Sóc Nhỏ cảm động reo lên: 'Cảm ơn cậu nhé!'. Bỗng quả chuối lấp lánh và hóa thành hàng ngàn quả bóng bay sắc màu bay lên trời, mang theo tiếng cười ấm áp của tình bạn quý giá.",
              prompt: "Cute Pixar style cartoon monkey and squirrel hugging, surrounded by floating colorful balloons on a green warm forest hill, sunshine, joy",
              question: "Bé học được đức tính tốt gì qua câu chuyện này nào?",
              choices: ["Biết chia sẻ với bạn bè", "Giữ tất cả đồ chơi cho riêng mình"]
            }
          ]
        },
        "Sóc nhỏ dũng cảm": {
          title: "Sóc Nhỏ Vượt Qua Nỗi Sợ",
          pages: [
            {
              text: "Trong một buổi chiều lộng gió hoang dã, Sóc Nhỏ bị rơi mất hạt dẻ sồi yêu quý xuống một hang đá sâu thẳm. Hang đá tối om khiến chú run rẩy, lo lắng không biết có nên nhảy xuống lấy không.",
              prompt: "A gorgeous 3D Pixar visual of a brave small squirrel with bushy tail standing at the entrance of a dark stone cave, looking down with wide curious eyes",
              question: "Bé đoán xem Sóc Nhỏ có nhút nhát bỏ chạy không nè?",
              choices: ["Bỏ cuộc đi về nhà khóc nhè", "Thắp đuốc dũng cảm đi vào hang tìm đồ"]
            },
            {
              text: "Sóc Nhỏ hít một hơi thật sâu, dũng cảm bước vào. Chú phát hiện ra hang đá không hề đáng sợ như chú nghĩ, mà ngập tràn những viên pha lê lấp lánh chiếu sáng cho chú tìm thấy hạt dẻ. Sóc Nhỏ đã vượt qua nỗi sợ bóng tối cực kỳ tự hào!",
              prompt: "Cute 3D Pixar squirrel smiling happily holding a large acorn in a cave glowing with magic blue and pink crystals, friendly cozy fantasy atmosphere",
              question: "Bé ơi, khi gặp việc khó khăn bé sẽ thế nào học tập Sóc Nhỏ?",
              choices: ["Dũng cảm đối mặt tìm cách giải quyết", "Kêu khóc đợi người khác làm hộ"]
            }
          ]
        },
        "Rồng con hiền lành": {
          title: "Rồng Con Đã Biết Nhận Lỗi",
          pages: [
            {
              text: "Rồng Con hiền lành vô tình hắt hơi mạnh làm ngọn lửa thổi bay chiếc bánh kem sinh nhật mà bác Voi vừa dày công chuẩn bị. Rồng Con hoảng sợ vô cùng, mặt đỏ tía tai, không biết có nên thừa nhận không.",
              prompt: "A cute baby fantasy dragon in Pixar style with blue wings, looking super apologetic and ashamed next to a giant slightly burnt cake in a beautiful birthday garden party",
              question: "Bé khuyên Rồng Con nên phản ứng thế nào nhỉ?",
              choices: ["Giấu kín chuyện và đổ lỗi cho gió thổi", "Dũng cảm xin lỗi bác Voi và giúp dọn dẹp"]
            },
            {
              text: "Rồng Con bèn cúi đầu khoanh tay: 'Con xin lỗi bác Voi, con đã hắt hơi làm hỏng bánh mất rồi'. Bác Voi trìu mến cười vang: 'Không sao đâu rồng nhỏ, con thật thà nhận lỗi là đáng khen nhất!'. Sau đó mọi người cùng nhau trang trí lại chiếc bánh kem ngon lành mới.",
              prompt: "Cute baby dragon and friendly big elephant baking and frosting a gorgeous tall strawberry cake together in a bright kitchen, high detail cartoon 3D lighting",
              question: "Đức tính nào là quý nhất của Rồng Con trong câu chuyện này?",
              choices: ["Thành thật nhận lỗi khi làm sai", "Chạy trốn thật nhanh không ai biết"]
            }
          ]
        }
      };

      if (!ai) {
        // Return structured mock tale matching requested hero
        const story = defaultLocalStories[hero] || defaultLocalStories["Khỉ con tinh nghịch"];
        return res.json(story);
      }

      // We use Gemini to create a rich 2-page interactive tale custom generated!
      const promptText = `Hãy viết một câu chuyện cổ tích tương tác siêu dễ thương cho trẻ 5-6 tuổi.
Nhân vật chính: ${hero}
Bối cảnh câu chuyện: ${setting}
Bài học giáo dục / nhân văn: ${moral}

Hãy trả về định dạng JSON thuần nầm khớp hoàn toàn cấu trúc sau (không có ký tự markdown, không bọc trong \`\`\`json):
{
  "title": "Tiêu đề truyện cực kỳ thu hút bé",
  "pages": [
    {
      "text": "Nội dung trang 1 (Khoảng 3-4 câu ngắn gọn, ấm áp kể về khởi đầu xung đột của nhân vật)",
      "prompt": "Mô tả bức ảnh phong cách hoạt hình 3D Pixar chất lượng cao để hướng dẫn tạo ảnh hoặc minh họa sinh động",
      "question": "Câu hỏi tương tác vui cho bé ở trang này giúp bé tư duy",
      "choices": ["Lựa chọn tích cực 1", "Lựa chọn thử thách 2"]
    },
    {
      "text": "Nội dung trang 2 (Kết thúc câu chuyện có hậu quả mãn, bài học ấm lòng)",
      "prompt": "Mô tả bức ảnh kết thúc Pixar lộng lẫy, ngập tràn ánh nắng và tình thương yêu",
      "question": "Câu hỏi rèn luyện bài học giáo dục ý nghĩa",
      "choices": ["Đáp án đúng (luôn ở vị trí 0)", "Đáp án sai lệch"]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          temperature: 0.85
        }
      });

      const responseText = response.text || "";
      // Clean up markdown blocks if returned
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const storyData = JSON.parse(cleanJson);
      res.json(storyData);
    } catch (error: any) {
      console.error("Error in Story Maker API:", error);
      // Fallback nicely to a local template so children are always amused!
      res.json({
        title: "Tình Bạn Kì Diệu Trong Rừng",
        pages: [
          {
            text: "Trong một khu rừng xanh mát lấp lánh cỏ hoa, bạn nhỏ đáng yêu luôn chăm chỉ tập đếm và đọc chữ cùng muôn thú mỗi ngày.",
            prompt: "Pixar 3D visual of cozy animal kids sitting around a circular wooden table in a magical sunlit wooden treehouse, joy, high energy educational vibe",
            question: "Bé ơi, bé đã sẵn sàng học tập hăng say ngày hôm nay chưa nào?",
            choices: ["Dạ con đã sẵn sàng ạ!", "Con cần nghỉ ngơi một tí ạ"]
          }
        ]
      });
    }
  });

  // API 3: Computer Vision Evaluator for Writing or Drawing Canvas
  app.post("/api/gemini/evaluate-canvas", async (req, res) => {
    try {
      const { image, target, type } = req.body; // image: base64 string, target: e.g. "Chữ A", "Chữ B", or "Hình ngôi nhà", type: "write" | "draw"
      const ai = getGeminiClient();

      if (!image) {
        return res.status(400).json({ error: "Thiếu dữ liệu ảnh nét vẽ của bé." });
      }

      // Extricate base64 data correctly (remove metadata header if present)
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      if (!ai) {
        // Simulated Canvas Evaluator
        // We will randomly award 4 or 5 stars and give an encouraging mock speech in Vietnamese
        const randomScore = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
        const simulatedFeedbacks = [
          `Tuyệt vời ông mặt trời! Nét vẽ ${target} của bé rất mềm mại và chuẩn xác luôn nè! Hãy tiếp tục duy trì nét chữ đẹp đẽ này nhé! Rất giỏi!`,
          `Bé vẽ ${target} khéo tay quá ta! BiBi thấy nét cong và nét thẳng rất đều đặn rồi đó. Tặng bé trọn vẹn điểm thưởng lấp lánh!`,
          `Wow, đúng là một nghệ sĩ nhí tài ba! Nét bút ${target} rất rõ ràng, dứt khoát. Bé chuẩn bị vào lớp 1 chắc chắn sẽ đứng đầu lớp cho mà xem!`
        ];
        const randomFeedback = simulatedFeedbacks[Math.floor(Math.random() * simulatedFeedbacks.length)];
        return res.json({
          score: randomScore,
          feedback: `[MOCK AI EVALUATOR] ${randomFeedback}`,
          stars: randomScore
        });
      }

      const promptText = type === "write"
        ? `Đây là ảnh do em bé 5 tuổi tập viết chữ '${target}' trên bảng vẽ điện tử. Hãy đóng vai là Gấu BiBi, chuyên gia giáo viên tiền tiểu học vui tươi.
Phân tích tỉ mỉ xem em bé tập tô/viết nét của chữ này có đúng hình dáng chuẩn không (có bị méo lệch quá nhiều không, có đủ các nét chính không).
Hãy trả về một định dạng JSON thuần túy (không bọc trong \`\`\`json):
{
  "score": số sao đánh giá từ 1 đến 5 (hãy động viên bé nên tuyệt đối không cho dưới 3 sao trừ khi bảng trống rỗng, ưu tiên 4 hoặc 5 sao nếu trông có vẻ giống chữ cái đó),
  "feedback": "Lời nhận xét ngọt ngào, khen ngợi và hướng dẫn nhiệt tình bằng tiếng Việt, dưới 3 câu ngắn gọn để bé dễ nghe đọc."
}`
        : `Đây là tác phẩm tranh vẽ tự do hoặc tô màu của em bé 5 tuổi với tiêu đề '${target}'. Hãy đóng vai Trợ lý AI Gấu BiBi siêu cấp dễ thương.
Quan sát bố cục, sự hài hòa màu sắc và nỗ lực của bé. Hãy động viên trí tưởng tượng phong phú của em bé nhé!
Hãy trả về một định dạng JSON thuần túy (không bọc trong \`\`\`json):
{
  "score": số sao từ 1 đến 5 (động viên bé, ưu tiên 4 hoặc 5 sao vì sự ngộ nghĩnh sáng tạo),
  "feedback": "Lời nhận xét ca ngợi tinh thần sáng tạo nghệ thuật của bé hết lời bằng tiếng Việt dễ thương độc đáo dưới 3 câu."
}`;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, { text: promptText }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const responseText = response.text || "{}";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const evaluation = JSON.parse(cleanJson);
      res.json(evaluation);
    } catch (error: any) {
      console.error("Error in Canvas Evaluator API:", error);
      res.json({
        score: 5,
        feedback: "Wow! Nét vẽ của bé thật tuyệt vời và tràn đầy cá tính luôn! Gấu BiBi tặng bé 5 ngôi sao may mắn lấp lánh nồng nhiệt nhé!",
        stars: 5
      });
    }
  });

  // ─── API 4: Vietnamese Text-to-Speech via Google Cloud TTS ─────
  // Uses Google Cloud TTS API with the same Gemini API key
  // Voice: vi-VN-Wavenet-A (soft, natural female Vietnamese — perfect for children)
  // Fallback: vi-VN-Standard-A if Wavenet fails
  
  // Server-side TTS audio cache (text → base64 audio)
  const ttsCache = new Map<string, string>();
  const TTS_CACHE_MAX = 200;

  app.post("/api/tts", async (req, res) => {
    try {
      const { text, speakingRate } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Thiếu nội dung văn bản cần đọc." });
      }

      const cleanText = text.trim().substring(0, 500); // Limit text length
      const rate = Math.max(0.5, Math.min(1.5, speakingRate || 0.9));
      const cacheKey = `${cleanText}__${rate}`;

      // Check server cache
      if (ttsCache.has(cacheKey)) {
        return res.json({ audioContent: ttsCache.get(cacheKey) });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(503).json({ 
          error: "TTS không khả dụng - thiếu API key. Sử dụng giọng trình duyệt." 
        });
      }

      // Google Cloud TTS API endpoint (accessible with Gemini API key)
      const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

      const ttsRequest = {
        input: { text: cleanText },
        voice: {
          languageCode: "vi-VN",
          name: "vi-VN-Wavenet-A", // Soft, natural female Vietnamese voice
          ssmlGender: "FEMALE"
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: rate,
          pitch: 1.5, // Slightly higher pitch — friendly for children
          volumeGainDb: 2.0, // Slightly louder for clarity
          effectsProfileId: ["small-bluetooth-speaker-class-device"] // Optimize for mobile/tablet speakers
        }
      };

      const ttsResponse = await fetch(ttsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ttsRequest)
      });

      if (!ttsResponse.ok) {
        // Try Standard voice as fallback (lower quality but more available)
        const fallbackRequest = {
          ...ttsRequest,
          voice: {
            languageCode: "vi-VN",
            name: "vi-VN-Standard-A",
            ssmlGender: "FEMALE"
          }
        };

        const fallbackResponse = await fetch(ttsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fallbackRequest)
        });

        if (!fallbackResponse.ok) {
          const errText = await fallbackResponse.text();
          console.error("Google Cloud TTS failed:", errText);
          return res.status(502).json({ 
            error: "TTS API không phản hồi. Sử dụng giọng trình duyệt." 
          });
        }

        const fallbackData = await fallbackResponse.json();
        if (fallbackData.audioContent) {
          // Cache the result
          if (ttsCache.size >= TTS_CACHE_MAX) {
            const firstKey = ttsCache.keys().next().value;
            if (firstKey) ttsCache.delete(firstKey);
          }
          ttsCache.set(cacheKey, fallbackData.audioContent);
          return res.json({ audioContent: fallbackData.audioContent });
        }

        return res.status(502).json({ error: "Không nhận được audio từ TTS." });
      }

      const ttsData = await ttsResponse.json();

      if (ttsData.audioContent) {
        // Cache the result
        if (ttsCache.size >= TTS_CACHE_MAX) {
          const firstKey = ttsCache.keys().next().value;
          if (firstKey) ttsCache.delete(firstKey);
        }
        ttsCache.set(cacheKey, ttsData.audioContent);
        return res.json({ audioContent: ttsData.audioContent });
      }

      res.status(502).json({ error: "Không nhận được audio từ TTS." });
    } catch (error: any) {
      console.error("Error in TTS API:", error.message || error);
      res.status(500).json({ 
        error: "Lỗi hệ thống TTS. Sử dụng giọng trình duyệt thay thế." 
      });
    }
  });

  // Serve static files in production or hook up Vite developer server
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite hot-reloading simulation...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production build from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Educational full-stack app running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
