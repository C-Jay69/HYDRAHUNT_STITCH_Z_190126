import { NextRequest, NextResponse } from 'next/server';
import { analyzeResumeATS, analyzeResumeGeneral, beautifyResume, optimizeResume } from '@/lib/ai';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, resumeId, targetJob, analysisType } = body;

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

    let result;
    
    switch (analysisType) {
      case 'ats':
        result = await analyzeResumeATS(resumeData, targetJob);
        // Update resume ATS score if we have resumeId
        if (resumeId && result.atsScore) {
          await db.resume.update({
            where: { id: resumeId },
            data: { 
              atsScore: result.atsScore,
              lastAnalysisDate: new Date()
            }
          });
        }
        break;
        
      case 'general':
        result = await analyzeResumeGeneral(resumeData);
        // Update lethality score
        if (resumeId && result.overallScore) {
          await db.resume.update({
            where: { id: resumeId },
            data: { 
              lethalityScore: result.overallScore,
              lastAnalysisDate: new Date()
            }
          });
        }
        break;
        
      case 'beautify':
        result = await beautifyResume(resumeData);
        break;
        
      case 'optimize':
        if (!targetJob) {
          return NextResponse.json(
            { error: 'Target job is required for optimization' },
            { status: 400 }
          );
        }
        const improvements = body.improvements || [];
        result = await optimizeResume(resumeData, targetJob, improvements);
        break;
        
      default:
        // Default to general analysis
        result = await analyzeResumeGeneral(resumeData);
    }

    // Store analysis report
    if (resumeId && (analysisType === 'ats' || analysisType === 'general')) {
      await db.analysisReport.create({
        data: {
          resumeId,
          reportType: analysisType?.toUpperCase() || 'GENERAL',
          targetJob: targetJob || null,
          overallScore: result.atsScore || result.overallScore || 0,
          strengths: JSON.stringify(result.strengths || []),
          weaknesses: JSON.stringify(result.weaknesses || result.formattingIssues || []),
          improvements: JSON.stringify(result.improvements || []),
          detailedFeedback: JSON.stringify(result),
        }
      });
    }

    return NextResponse.json({
      success: true,
      analysisType,
      result,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
