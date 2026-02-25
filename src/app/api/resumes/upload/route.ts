import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Extract text from uploaded file
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    try {
      // Dynamic import for pdf-parse
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      // Fallback: return empty string if PDF parsing fails
      return '';
    }
  } else if (fileName.endsWith('.docx')) {
    try {
      // Dynamic import for mammoth
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('DOCX parsing error:', error);
      // Fallback: return empty string if DOCX parsing fails
      return '';
    }
  } else if (fileName.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT');
}

// Parse resume text into structured data using AI
async function parseResumeText(text: string): Promise<any> {
  try {
    // Use Abacus AI for parsing
    const response = await fetch('https://api.abacus.ai/api/v0/chatLLM', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUS_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a resume parser. Extract structured data from the resume text and return ONLY valid JSON with this exact structure:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "website": "string or null",
  "summary": "string",
  "experience": [{"title": "string", "company": "string", "period": "string", "description": "string"}],
  "education": [{"degree": "string", "school": "string", "year": "string"}],
  "skills": [{"category": "string", "items": ["string"]}]
}
Return ONLY the JSON, no explanation.`
          },
          {
            role: 'user',
            content: `Parse this resume:\n\n${text.substring(0, 8000)}`
          }
        ],
        deploymentId: 'default'
      })
    });

    if (!response.ok) {
      throw new Error('AI parsing failed');
    }

    const result = await response.json();
    const content = result.response || result.message || '';
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('AI parsing error:', error);
    // Fallback: basic parsing
    return basicParse(text);
  }
}

// Fallback basic parsing
function basicParse(text: string): any {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Simple extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/);
  
  return {
    fullName: lines[0] || 'Unknown',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    location: '',
    website: null,
    summary: lines.slice(1, 4).join(' ').substring(0, 500),
    experience: [],
    education: [],
    skills: [],
  };
}

// POST /api/resumes/upload - Upload and parse resume
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow demo mode without authentication
    const userId = (session?.user as any)?.id || 'demo-user';

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOCX, or TXT' },
        { status: 400 }
      );
    }

    // Extract text from file
    const text = await extractText(file);

    // Parse resume text using AI
    const parsedData = await parseResumeText(text);

    // Create or get user if not exists
    let user = await db.user.findUnique({ where: { id: userId } });
    if (!user && userId !== 'demo-user') {
      // User should exist from auth, but create if missing
      user = await db.user.create({
        data: {
          id: userId,
          email: session?.user?.email || `${userId}@hydrahunt.ai`,
          name: session?.user?.name,
        }
      });
    }

    // For demo mode, create a demo user if needed
    if (userId === 'demo-user') {
      user = await db.user.upsert({
        where: { id: 'demo-user' },
        update: {},
        create: {
          id: 'demo-user',
          email: 'demo@hydrahunt.ai',
          name: 'Demo User',
        }
      });
    }

    // Create resume in database
    const resume = await db.resume.create({
      data: {
        userId: user!.id,
        title: file.name.replace(/\.(pdf|docx|txt)$/i, '') || 'Uploaded Resume',
        folder: 'Uploaded',
        fullName: parsedData.fullName || 'Unknown',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        location: parsedData.location || '',
        website: parsedData.website || null,
        summary: parsedData.summary || '',
        templateId: 'cyber',
        experienceJson: JSON.stringify(parsedData.experience || []),
        educationJson: JSON.stringify(parsedData.education || []),
        skillsJson: JSON.stringify(parsedData.skills || []),
        lethalityScore: 0,
      },
    });

    // Return parsed resume
    const result = {
      ...resume,
      experience: parsedData.experience || [],
      education: parsedData.education || [],
      skills: parsedData.skills || [],
      rawText: text.substring(0, 2000), // Include first 2000 chars of raw text
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload and parse resume' },
      { status: 500 }
    );
  }
}
