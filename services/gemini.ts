import { GoogleGenAI, Type } from "@google/genai";
import { Answer, AnalysisResult } from "../types";
import { ESG_QUESTIONS } from "../constants";

// WARNING: In a production static site, this key is exposed. 
// For this specific internal tool, we assume the environment is secure or the key is restricted.
// The prompt requires not to build UI for key input.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeESGResults = async (answers: Answer[]): Promise<AnalysisResult> => {
  // 1. Prepare Data Summary for Prompt
  const lowScores = answers.filter(a => a.rating <= 2).map(a => {
    const q = ESG_QUESTIONS.find(q => q.id === a.questionId);
    return `${a.questionId} (${q?.subCategory} - ${q?.indicator}): ${a.rating}점`;
  }).join("\n");

  const highScores = answers.filter(a => a.rating === 4).map(a => {
    const q = ESG_QUESTIONS.find(q => q.id === a.questionId);
    return `${a.questionId}: ${q?.indicator}`;
  }).join("\n");

  const prompt = `
    당신은 사회복지관의 ESG 경영 컨설턴트입니다.
    '강동어울림복지관' 직원이 작성한 ESG 자체진단 결과를 바탕으로 분석 리포트를 작성해주세요.

    [진단 개요]
    - 4점 만점 기준
    - 낮은 점수(취약점):
    ${lowScores}

    - 높은 점수(강점):
    ${highScores}

    위 데이터를 분석하여 다음 7가지 항목에 대해 구체적인 제언을 해주세요.
    말투는 전문적이고 정중하게(해요체) 작성해주세요.
    복지관의 특성을 고려하여 실현 가능한 조언을 해주세요.
  `;

  // 2. Define Schema
  const schema = {
    type: Type.OBJECT,
    properties: {
      focusAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1. 집중할 분야 (3가지)" },
      improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2. 향후 개선할 분야 (3가지)" },
      collaborationWithResidents: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3. 지역주민과 같이할 분야" },
      communitySolidarity: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4. 사회복지 유관기관, 지역사회와 연대할 분야" },
      corporatePartnership: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5. 기업과 함께할 분야" },
      otherMeaningfulAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "6. 그 외 의미 있는 분야" },
      summary: { type: Type.STRING, description: "종합 분석 코멘트" }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = JSON.parse(response.text);
    return result as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if API fails or key is missing
    return {
      focusAreas: ["데이터 분석 중 오류가 발생했습니다.", "네트워크 상태를 확인해주세요."],
      improvementAreas: [],
      collaborationWithResidents: [],
      communitySolidarity: [],
      corporatePartnership: [],
      otherMeaningfulAreas: [],
      summary: "AI 분석 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요."
    };
  }
};