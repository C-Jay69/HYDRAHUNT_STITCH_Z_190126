import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/resumes/[id] - Get a single resume
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resume = await db.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedResume = {
      ...resume,
      experience: JSON.parse(resume.experienceJson || '[]'),
      education: JSON.parse(resume.educationJson || '[]'),
      skills: JSON.parse(resume.skillsJson || '[]'),
    };

    return NextResponse.json(parsedResume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

// PUT /api/resumes/[id] - Update a resume
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      folder,
      fullName,
      email,
      phone,
      location,
      website,
      summary,
      templateId,
      experience,
      education,
      skills,
      lethalityScore,
      atsScore,
    } = body;

    const resume = await db.resume.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(folder !== undefined && { folder }),
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(summary !== undefined && { summary }),
        ...(templateId !== undefined && { templateId }),
        ...(experience !== undefined && { experienceJson: JSON.stringify(experience) }),
        ...(education !== undefined && { educationJson: JSON.stringify(education) }),
        ...(skills !== undefined && { skillsJson: JSON.stringify(skills) }),
        ...(lethalityScore !== undefined && { lethalityScore }),
        ...(atsScore !== undefined && { atsScore }),
      },
    });

    // Return parsed resume
    const parsedResume = {
      ...resume,
      experience: JSON.parse(resume.experienceJson),
      education: JSON.parse(resume.educationJson),
      skills: JSON.parse(resume.skillsJson),
    };

    return NextResponse.json(parsedResume);
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] - Delete a resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
