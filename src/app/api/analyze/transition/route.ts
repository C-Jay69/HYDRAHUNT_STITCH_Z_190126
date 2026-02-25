import { NextRequest, NextResponse } from 'next/server';
import { analyzeCareerTransition } from '@/lib/ai';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, resumeId, targetCareer } = body;

    if (!targetCareer) {
      return NextResponse.json(
        { error: 'Target career is required' },
        { status: 400 }
      );
    }

    if (!resume && !resumeId) {
      return NextResponse.json(
        { error: 'Resume data or resumeId is required' },
        { status: 400 }
      );
    }

    // If resumeId provided, fetch from database
    let resumeData = resume;
    if (resumeId && !resume) {
      const dbResume = await db.resume.findUnique({
        where: { id: resumeId }
      });
      
      if (!dbResume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      
      resumeData = {
        ...dbResume,
        experience: JSON.parse(dbResume.experienceJson || '[]'),
        education: JSON.parse(dbResume.educationJson || '[]'),
        skills: JSON.parse(dbResume.skillsJson || '[]'),
      };
    }

    const result = await analyzeCareerTransition(resumeData, targetCareer);

    // Store analysis report
    if (resumeId) {
      await db.analysisReport.create({
        data: {
          resumeId,
          reportType: 'TRANSITION',
          targetJob: targetCareer,
          overallScore: result.feasibilityScore || 0,
          strengths: JSON.stringify(result.transferableSkills || []),
          weaknesses: JSON.stringify(result.skillGaps?.map((g: any) => g.skill) || []),
          improvements: JSON.stringify(result.roadmap || []),
          detailedFeedback: JSON.stringify(result),
        }
      });
    }

    return NextResponse.json({
      success: true,
      targetCareer,
      result,
    });
  } catch (error: any) {
    console.error('Transition analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Career transition analysis failed' },
      { status: 500 }
    );
  }
}
