// AI Service for HydraHunt
// Uses Abacus.AI API for all AI-powered features

const ABACUS_API_URL = 'https://api.abacus.ai/api/v0/chatLLM';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callAbacusAI(messages: AIMessage[]): Promise<string> {
  const apiKey = process.env.ABACUS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ABACUS_API_KEY not configured');
  }

  const response = await fetch(ABACUS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages,
      deploymentId: 'default'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const result = await response.json();
  return result.response || result.message || '';
}

export function formatResumeForAI(resume: any): string {
  let text = `RESUME\n\n`;
  text += `Name: ${resume.fullName}\n`;
  text += `Email: ${resume.email}\n`;
  text += `Phone: ${resume.phone}\n`;
  text += `Location: ${resume.location}\n`;
  if (resume.website) text += `Website: ${resume.website}\n`;
  text += `\nSUMMARY:\n${resume.summary}\n`;

  if (resume.experience?.length > 0) {
    text += `\nEXPERIENCE:\n`;
    resume.experience.forEach((exp: any) => {
      text += `- ${exp.title} at ${exp.company} (${exp.period})\n`;
      text += `  ${exp.description}\n`;
    });
  }

  if (resume.education?.length > 0) {
    text += `\nEDUCATION:\n`;
    resume.education.forEach((edu: any) => {
      text += `- ${edu.degree} from ${edu.school} (${edu.year})\n`;
    });
  }

  if (resume.skills?.length > 0) {
    text += `\nSKILLS:\n`;
    resume.skills.forEach((skill: any) => {
      text += `- ${skill.category}: ${skill.items?.join(', ') || ''}\n`;
    });
  }

  return text;
}

export async function analyzeResumeATS(resume: any, targetJob?: string): Promise<any> {
  const resumeText = formatResumeForAI(resume);
  
  const systemPrompt = `You are an ATS (Applicant Tracking System) expert. Analyze the resume for ATS compatibility and provide detailed feedback.

Return ONLY valid JSON with this structure:
{
  "atsScore": number (0-100),
  "overallAssessment": "string",
  "keywordAnalysis": {
    "found": ["string"],
    "missing": ["string"],
    "score": number
  },
  "formattingIssues": ["string"],
  "improvements": [
    {
      "category": "string",
      "issue": "string",
      "suggestion": "string",
      "priority": "high" | "medium" | "low"
    }
  ],
  "strengths": ["string"]
}`;

  const userPrompt = targetJob 
    ? `Analyze this resume for ATS compatibility for the role: ${targetJob}\n\n${resumeText}`
    : `Analyze this resume for general ATS compatibility:\n\n${resumeText}`;

  const response = await callAbacusAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch {
    return {
      atsScore: 50,
      overallAssessment: response,
      keywordAnalysis: { found: [], missing: [], score: 50 },
      formattingIssues: [],
      improvements: [],
      strengths: []
    };
  }
}

export async function analyzeResumeGeneral(resume: any): Promise<any> {
  const resumeText = formatResumeForAI(resume);
  
  const systemPrompt = `You are a professional career coach and resume expert. Analyze the resume and provide comprehensive feedback.

Return ONLY valid JSON with this structure:
{
  "overallScore": number (0-100),
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvements": [
    {
      "section": "string",
      "current": "string",
      "suggested": "string",
      "impact": "high" | "medium" | "low"
    }
  ],
  "industryFit": ["string"],
  "suggestedRoles": ["string"]
}`;

  const response = await callAbacusAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Analyze this resume:\n\n${resumeText}` }
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch {
    return {
      overallScore: 50,
      summary: response,
      strengths: [],
      weaknesses: [],
      improvements: [],
      industryFit: [],
      suggestedRoles: []
    };
  }
}

export async function analyzeCareerTransition(resume: any, targetCareer: string): Promise<any> {
  const resumeText = formatResumeForAI(resume);
  
  const systemPrompt = `You are an expert career transition advisor. Analyze how well this person can transition to a new career and provide actionable advice.

Return ONLY valid JSON with this structure:
{
  "feasibilityScore": number (0-100),
  "transitionDifficulty": "easy" | "moderate" | "challenging" | "difficult",
  "timeEstimate": "string",
  "transferableSkills": ["string"],
  "skillGaps": [
    {
      "skill": "string",
      "importance": "critical" | "important" | "nice-to-have",
      "howToAcquire": "string"
    }
  ],
  "recommendedCourses": [
    {
      "name": "string",
      "platform": "string",
      "duration": "string",
      "url": "string"
    }
  ],
  "certifications": ["string"],
  "roadmap": [
    {
      "phase": number,
      "title": "string",
      "duration": "string",
      "actions": ["string"]
    }
  ],
  "adviceText": "string"
}`;

  const response = await callAbacusAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Target Career: ${targetCareer}\n\nCurrent Resume:\n${resumeText}` }
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch {
    return {
      feasibilityScore: 50,
      transitionDifficulty: 'moderate',
      timeEstimate: '6-12 months',
      transferableSkills: [],
      skillGaps: [],
      recommendedCourses: [],
      certifications: [],
      roadmap: [],
      adviceText: response
    };
  }
}

export async function optimizeResume(resume: any, targetJob: string, improvements: any[]): Promise<any> {
  const resumeText = formatResumeForAI(resume);
  
  const systemPrompt = `You are a professional resume writer. Rewrite and optimize the resume for the target job, incorporating the suggested improvements.

Return ONLY valid JSON with the optimized resume data in this structure:
{
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "period": "string",
      "description": "string"
    }
  ],
  "skills": [
    {
      "category": "string",
      "items": ["string"]
    }
  ],
  "keyChanges": ["string"]
}`;

  const improvementsText = improvements.map((imp: any) => 
    `- ${imp.section || imp.category}: ${imp.suggestion || imp.suggested}`
  ).join('\n');

  const response = await callAbacusAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Target Job: ${targetJob}\n\nImprovements to apply:\n${improvementsText}\n\nOriginal Resume:\n${resumeText}` }
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch {
    return {
      summary: resume.summary,
      experience: resume.experience,
      skills: resume.skills,
      keyChanges: ['Unable to parse optimization results']
    };
  }
}

export async function beautifyResume(resume: any): Promise<any> {
  const resumeText = formatResumeForAI(resume);
  
  const systemPrompt = `You are an expert resume writer. Improve the language, formatting, and impact of this resume while keeping the content accurate. Use strong action verbs, quantify achievements where possible, and make it more compelling.

Return ONLY valid JSON with the beautified resume:
{
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "period": "string",
      "description": "string"
    }
  ],
  "improvements": ["string description of changes made"]
}`;

  const response = await callAbacusAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Beautify and improve this resume:\n\n${resumeText}` }
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch {
    return {
      summary: resume.summary,
      experience: resume.experience,
      improvements: ['Unable to parse beautification results']
    };
  }
}
