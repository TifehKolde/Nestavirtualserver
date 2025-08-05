import express from "express";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();

router.post("/submit-client", async (req, res) => {
  try {
    // Debug logging for environment variables
    console.log("=== Environment Variables Check ===");
    console.log("AIRTABLE_API_KEY:", process.env.AIRTABLE_API_KEY ? "✓ Set" : "✗ Missing");
    console.log("AIRTABLE_BASE_ID:", process.env.AIRTABLE_BASE_ID ? "✓ Set" : "✗ Missing");
    console.log("AIRTABLE_TABLE_NAME:", process.env.AIRTABLE_TABLE_NAME ? "✓ Set" : "✗ Missing");
    
    // Check if required environment variables are present
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME) {
      console.error("Missing required environment variables");
      return res.status(500).json({ 
        error: "Server configuration error", 
        details: "Missing Airtable configuration" 
      });
    }

    // Debug logging for request body
    console.log("=== Request Body ===");
    console.log("Received data:", req.body);

    // Extract data from request body
    const {
      clientName,
      email,
      companyName,
      onboardingDate,
      consultationDate,
      needs,
    } = req.body;

    // Validate required fields
    if (!clientName || !email) {
      console.error("Missing required fields");
      return res.status(400).json({ 
        error: "Validation error", 
        details: "Client name and email are required" 
      });
    }

    // Construct Airtable URL
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`;
    console.log("=== Airtable Request ===");
    console.log("URL:", airtableUrl);

    // Prepare data for Airtable
    const fields = {
      "Client Name": clientName,
      "Email": email,
      "Company Name": companyName || "",
      "Needs": needs || "",
    };
    
    if (onboardingStartDate) {
      fields["Onboarding Start Date"] = onboardingStartDate;
    }
    
    if (initialConsultationDate) {
      fields["Initial Consultation Date"] = initialConsultationDate;
    }
    
    const airtableData = { fields };
    

    console.log("Data being sent:", JSON.stringify(airtableData, null, 2));

    // Make request to Airtable
    const response = await axios.post(airtableUrl, airtableData, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    console.log("=== Airtable Response ===");
    console.log("Status:", response.status);
    console.log("Data:", response.data);

    // Send success response
    res.status(200).json({ 
      message: "Submission successful", 
      data: response.data,
      recordId: response.data.id 
    });

  } catch (error) {
    console.error("=== Error Details ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    
    if (error.response) {
      // Airtable API error
      console.error("Airtable API Error:");
      console.error("Status:", error.response.status);
      console.error("Status Text:", error.response.statusText);
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
      console.error("Response Headers:", error.response.headers);
      
      res.status(error.response.status || 500).json({
        error: "Airtable API error",
        details: error.response.data || error.message,
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      console.error("Network Error:");
      console.error("Request:", error.request);
      
      res.status(500).json({
        error: "Network error",
        details: "Unable to reach Airtable API"
      });
    } else {
      // Other error
      console.error("General Error:", error);
      
      res.status(500).json({
        error: "Internal server error",
        details: error.message
      });
    }
  }
});

export default router;