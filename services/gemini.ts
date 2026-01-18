
import { GoogleGenAI, Chat } from "@google/genai";
import { ResumeData } from '../types';

const getAiClient = () => {
  try {
    // Priority: Env Var -> Hardcoded fallback (User provided key)
    const apiKey = process.env.API_KEY || 'AIzaSyChwGMOZvW1cLKslxqYJkSo0z7aQxeX67c';
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("process.env not accessible");
    return null;
  }
};

export interface GeneralAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export const analyzeResume = async (resume: ResumeData): Promise<GeneralAnalysis | null> => {
  try {
    const ai = getAiClient();
    if (!ai) return null;

    const prompt = `
      Perform a general audit of this resume data.
      Resume: ${JSON.stringify(resume)}
      
      Return JSON:
      {
        "score": number (0-100),
        "summary": "string (2 sentences)",
        "strengths": ["string", "string"],
        "weaknesses": ["string", "string"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let jsonString = response.text || "{}";
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export interface DetailedAnalysis {
  score: number;
  critique: string;
  improvements: string[];
}

export const analyzeResumeForJob = async (resume: ResumeData, targetJob: string): Promise<DetailedAnalysis | null> => {
  try {
    const ai = getAiClient();
    if (!ai) return null;

    const prompt = `
      Act as a hiring manager for: "${targetJob}". Analyze this resume.
      Resume: ${JSON.stringify(resume)}
      
      Return JSON:
      {
        "score": number (0-100),
        "critique": "string (summary)",
        "improvements": ["string", "string", "string"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let jsonString = response.text || "{}";
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Detailed analysis failed:", error);
    return null;
  }
};

export const suggestBestRoles = async (resume: ResumeData): Promise<string[]> => {
  try {
    const ai = getAiClient();
    if (!ai) return ["Error connecting to AI"];

    const prompt = `
      Suggest top 3 job titles for this resume.
      Resume: ${JSON.stringify(resume)}
      
      Return JSON Array of strings only.
      Example: ["Role A (Reason)", "Role B (Reason)"]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let jsonString = response.text || "[]";
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Role suggestion failed:", error);
    return ["Analysis Failed"];
  }
};

export interface TransitionAnalysis {
  currentRole: string;
  targetRole: string;
  transferableSkills: string[];
  missingSkills: string[];
  resources: {
    name: string;
    provider: string;
    type: string;
    description: string;
  }[];
}

export const analyzeCareerTransition = async (resume: ResumeData, targetCareer: string): Promise<TransitionAnalysis | null> => {
  try {
    const ai = getAiClient();
    if (!ai) return null;

    const prompt = `
      Career transition advice from resume role to "${targetCareer}".
      Resume: ${JSON.stringify(resume)}
      
      Return JSON:
      {
        "currentRole": "string",
        "targetRole": "${targetCareer}",
        "transferableSkills": ["string"],
        "missingSkills": ["string"],
        "resources": [{ "name": "string", "provider": "string", "type": "string", "description": "string" }]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let jsonString = response.text || "{}";
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Transition analysis failed", error);
    return null;
  }
};

export interface JobListing {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  url: string;
}

export const findJobsWithSearch = async (resume: ResumeData, location: string, preferences: string): Promise<JobListing[]> => {
  try {
    const ai = getAiClient();
    if (!ai) return [];

    const prompt = `
      Find 5 real, active job listings relevant to this candidate in ${location || "Remote"}.
      User Preferences: ${preferences}
      
      Resume Summary: ${resume.summary}
      Skills: ${resume.skills.map(s => s.name).join(', ')}
      
      Return a JSON array of objects:
      [
        {
          "title": "Job Title",
          "company": "Company Name",
          "location": "Location",
          "matchScore": 85,
          "url": "URL to job posting"
        }
      ]
    `;

    // Note: responseMimeType is NOT supported with googleSearch tools
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];

  } catch (error) {
    console.error("Job search failed", error);
    return [];
  }
};

export const createChatSession = (resume: ResumeData, additionalContext: string = ''): Chat | null => {
  try {
    const ai = getAiClient();
    if (!ai) return null;

    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a helpful, cyber-punk themed career coach assistant named "VibeBot". 
        RESUME CONTEXT: ${JSON.stringify(resume)}
        ${additionalContext}
        `,
      }
    });
  } catch (error) {
    console.error("Chat creation failed:", error);
    return null;
  }
};

export const optimizeResumeForJob = async (resume: ResumeData, targetJob: string, suggestions: string[]): Promise<ResumeData | null> => {
  try {
    const ai = getAiClient();
    if (!ai) return null;

    const prompt = `
      Rewrite this resume to target: "${targetJob}".
      Apply suggestions: ${suggestions.join('; ')}
      Resume: ${JSON.stringify(resume)}
      
      Return FULL JSON matching ResumeData structure exactly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let jsonString = response.text || "{}";
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Optimization failed:", error);
    return null;
  }
};

export const parseResumeFromText = async (text: string): Promise<Partial<ResumeData> | null> => {
  const ai = getAiClient();
  if (!ai) {
    console.error("API Key missing");
    const basic = basicParse(text);
    return basic;
  }

  // 1. Sanitize text: remove non-printable control characters that break XHR/JSON
  const cleanText = text.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, " ");
  
  // 2. Strict Limit: Reduce context size to ~15k chars to prevent timeouts/payload errors
  const truncatedText = cleanText.substring(0, 15000); 

  const prompt = `
    Extract resume data from the text below into this JSON structure:
    {
      "fullName": "string", "title": "string", "email": "string", "phone": "string", 
      "location": "string", "website": "string", "summary": "string",
      "experience": [{ "company": "string", "role": "string", "startDate": "string", "endDate": "string", "description": "string" }],
      "education": [{ "school": "string", "degree": "string", "year": "string" }],
      "skills": [{ "name": "string", "level": 3 }]
    }
    Rules: Summarize descriptions. Infer skill levels (1-5). Return ONLY JSON.
    
    Text:
    ${truncatedText}
  `;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json', // Enforce JSON
        }
      });

      let jsonString = response.text || "{}";
      // Cleanup just in case
      jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(jsonString);
      if (!parsed || Object.keys(parsed).length === 0) throw new Error("Empty JSON");
      return parsed;

    } catch (error) {
      console.error(`Attempt ${attempt} - Gemini parsing failed:`, error);
      if (attempt === 3) return null;
      // Exponential backoff: 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt - 1))); 
    }
  }
  return basicParse(cleanText);
};

const basicParse = (text: string): Partial<ResumeData> => {
  const t = (text || "").replace(/\s+/g, " ").trim();
  const firstLine = t.split(".")[0] || "";
  const emailMatch = t.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const phoneMatch = t.match(/(\+?\d[\d\-\s().]{7,}\d)/);
  const skills: { name: string; level: number; id: string }[] = [];
  const common = ["JavaScript","TypeScript","React","Node","Python","AWS","Docker","Kubernetes","SQL","NoSQL"];
  common.forEach((s) => {
    if (new RegExp(`\\b${s}\\b`, "i").test(t)) {
      skills.push({ name: s, level: 3, id: crypto.randomUUID() });
    }
  });
  return {
    fullName: firstLine.slice(0, 80),
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
    summary: t.slice(0, 1500),
    location: "",
    website: "",
    experience: [],
    education: [],
    skills
  };
};
// ATS Analysis Interface
export interface ATSAnalysis {
  score: number;
  missingKeywords: string[];
  formattingIssues: string[];
  sectionHeadersCheck: boolean;
  contactInfoCheck: boolean;
  summary: string;
}

// ATS Check Function
export const analyzeATS = async (resume: ResumeData, jobDescription: string): Promise<ATSAnalysis | null> => {
    try {
        const ai = getAiClient();
        if (!ai) return null;

        const prompt = `
            Act as a strict Applicant Tracking System (ATS) algorithm. 
            Analyze this resume content for the target role/description: "${jobDescription || resume.title}".
            
            Resume Data: ${JSON.stringify(resume)}
            
            Evaluate based on:
            1. Keyword matching (Hard skills relevant to the role).
            2. Standard section headers (Experience, Education, Skills).
            3. Contact info presence.
            4. Cliché or fluff removal.
            
            Return JSON:
            {
                "score": number (0-100),
                "missingKeywords": ["keyword1", "keyword2", "keyword3"],
                "formattingIssues": ["issue1", "issue2"],
                "sectionHeadersCheck": boolean,
                "contactInfoCheck": boolean,
                "summary": "Brief technical feedback string"
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        let jsonString = response.text || "{}";
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("ATS Analysis failed", e);
        return null;
    }
};
