// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.post("/api/submit-client", async (req, res) => {
  const {
    clientName,
    email,
    companyName,
    OnboardingStartDate,
    InitialConsultationDate,
    Needs,
  } = req.body;

  try {
    const airtableResponse = await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`,
      {
        records: [
          {
            fields: {
              "Client Name": clientName,
              Email: email,
              "Company Name": companyName,
              "OnboardingStartDate": OnboardingStartDate,
              "InitialConsultationDate": InitialConsultationDate,
              Needs: Needs,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ message: "Submitted to Airtable!" });
  } catch (error) {
    console.error("Airtable error:", error.response?.data || error.message);
    res.status(500).json({ error: "Airtable submission failed." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
