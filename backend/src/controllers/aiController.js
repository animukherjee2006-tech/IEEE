const Booking = require("../models/Booking");
const Service = require("../models/Service");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ ONLY THIS
const MODEL_NAME = "gemini-2.0-flash";

exports.getAIResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        reply: "Bhai question toh daal 😑"
      });
    }

    const providerId = req.user.id;
    const providerName = req.user.name || "Provider";

    const [services, bookings] = await Promise.all([
      Service.find({ provider: providerId }),
      Booking.find({ provider: providerId })
    ]);

    const totalEarnings = bookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const activeJobs = bookings.filter(b => b.status === "accepted").length;
    const pendingJobs = bookings.filter(b => b.status === "pending").length;

    const systemContext = `
You are an AI Business Consultant for ${providerName}.
Earnings: ₹${totalEarnings}, Active: ${activeJobs}, Pending: ${pendingJobs}.
Services: ${services.map(s => s.name).join(", ") || "None"}.
Give short business advice.
`;

    const fullPrompt = `${systemContext}\nUser: ${prompt}`;

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME
    });

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    res.json({
      success: true,
      reply: text
    });

  } catch (error) {
    console.error("🔥 AI Error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        reply: "Limit hit ho gaya 😅 thoda wait kar"
      });
    }

    res.status(500).json({
      success: false,
      reply: "AI error aa gaya bhai 💥"
    });
  }
};