
import { Answer, UserInfo, Category, SurveySubmission } from "../types";

// IMPORTANT: Replace this with your deployed Google Apps Script Web App URL
const YOUR_GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyw.../exec"; 

interface SheetPayload extends UserInfo {
  answers: Record<string, { rating: number; details?: Record<number, string[]> }>;
  totalScore: {
    [key in keyof typeof Category]: number;
  };
}

export const submitToGoogleSheet = async (
  userInfo: UserInfo,
  answers: Answer[]
): Promise<boolean> => {
  // Calculate totals
  const totalScore = { E: 0, S: 0, G: 0 };
  const answerMap: Record<string, { rating: number; details?: Record<number, string[]> }> = {};

  answers.forEach(a => {
    // Store full answer object (rating + details)
    answerMap[a.questionId] = {
      rating: a.rating,
      details: a.details
    };

    if (a.questionId.startsWith('E')) totalScore.E += a.rating;
    else if (a.questionId.startsWith('S')) totalScore.S += a.rating;
    else if (a.questionId.startsWith('G')) totalScore.G += a.rating;
  });

  const payload: SheetPayload = {
    ...userInfo,
    answers: answerMap,
    totalScore
  };

  // Mock submission if URL is placeholder
  if (YOUR_GOOGLE_SCRIPT_URL.includes("...")) {
    console.log("Mock submission successful:", payload);
    // Store in local storage for demo admin view
    const existing = JSON.parse(localStorage.getItem('mock_esg_data') || '[]');
    existing.push({ ...payload, timestamp: new Date().toISOString() });
    localStorage.setItem('mock_esg_data', JSON.stringify(existing));
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }

  try {
    await fetch(YOUR_GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
    });
    return true; 
  } catch (error) {
    console.error("Error submitting to Google Sheet", error);
    return false;
  }
};

export const fetchSurveyResults = async (): Promise<SurveySubmission[]> => {
  // Mock data fetching if URL is placeholder
  if (YOUR_GOOGLE_SCRIPT_URL.includes("...")) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const localData = JSON.parse(localStorage.getItem('mock_esg_data') || '[]');
    return localData;
  }

  try {
    const response = await fetch(YOUR_GOOGLE_SCRIPT_URL);
    const data = await response.json();
    
    return data.map((row: any) => {
      let parsedAnswers = row.answers;
      const rawJson = row.JSON_Data || row.answers;

      if (typeof rawJson === 'string') {
         try { 
           parsedAnswers = JSON.parse(rawJson); 
         } catch (e) {
           console.warn("Failed to parse answers JSON for row", row);
           parsedAnswers = {};
         }
      }

      return {
        ...row,
        answers: parsedAnswers || {}
      };
    });
  } catch (error) {
    console.error("Error fetching results", error);
    return [];
  }
};
