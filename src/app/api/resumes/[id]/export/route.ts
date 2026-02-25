import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate HTML template for resume
function generateResumeHTML(resume: any, templateId: string): string {
  const templates: Record<string, (r: any) => string> = {
    cyber: generateCyberTemplate,
    minimal: generateMinimalTemplate,
    professional: generateProfessionalTemplate,
    creative: generateCreativeTemplate,
  };

  const generator = templates[templateId] || templates.cyber;
  return generator(resume);
}

function generateCyberTemplate(resume: any): string {
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; background: #111; border: 2px solid #00ffff; padding: 40px; }
    .header { border-bottom: 2px solid #00ffff; padding-bottom: 20px; margin-bottom: 30px; }
    .name { font-size: 32px; font-weight: bold; color: #00ffff; text-transform: uppercase; letter-spacing: 2px; }
    .contact { margin-top: 10px; font-size: 14px; color: #888; }
    .contact span { margin-right: 20px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; color: #bef754; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 15px; }
    .summary { line-height: 1.6; color: #ccc; }
    .job { margin-bottom: 20px; }
    .job-title { font-size: 16px; font-weight: bold; color: #fff; }
    .job-company { color: #00ffff; font-size: 14px; }
    .job-period { color: #666; font-size: 13px; margin-bottom: 8px; }
    .job-desc { font-size: 14px; line-height: 1.5; color: #bbb; }
    .edu-item { margin-bottom: 12px; }
    .edu-degree { font-weight: bold; color: #fff; }
    .edu-school { color: #888; }
    .skills-category { margin-bottom: 12px; }
    .skills-name { color: #bef754; font-weight: bold; }
    .skills-items { color: #ccc; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="name">${resume.fullName || 'Name'}</div>
      <div class="contact">
        <span>${resume.email || ''}</span>
        <span>${resume.phone || ''}</span>
        <span>${resume.location || ''}</span>
        ${resume.website ? `<span>${resume.website}</span>` : ''}
      </div>
    </div>

    ${resume.summary ? `
    <div class="section">
      <div class="section-title">Mission Statement</div>
      <div class="summary">${resume.summary}</div>
    </div>
    ` : ''}

    ${experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Combat Experience</div>
      ${experience.map((exp: any) => `
        <div class="job">
          <div class="job-title">${exp.title || ''}</div>
          <div class="job-company">${exp.company || ''}</div>
          <div class="job-period">${exp.period || ''}</div>
          <div class="job-desc">${exp.description || ''}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${education.length > 0 ? `
    <div class="section">
      <div class="section-title">Training Academy</div>
      ${education.map((edu: any) => `
        <div class="edu-item">
          <div class="edu-degree">${edu.degree || ''}</div>
          <div class="edu-school">${edu.school || ''} - ${edu.year || ''}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Arsenal</div>
      ${skills.map((skill: any) => `
        <div class="skills-category">
          <span class="skills-name">${skill.category || ''}:</span>
          <span class="skills-items">${(skill.items || []).join(', ')}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

function generateMinimalTemplate(resume: any): string {
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; background: #fff; color: #333; padding: 50px; line-height: 1.6; }
    .container { max-width: 700px; margin: 0 auto; }
    .name { font-size: 28px; font-weight: normal; text-align: center; margin-bottom: 5px; }
    .contact { text-align: center; font-size: 13px; color: #666; margin-bottom: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
    .summary { font-style: italic; color: #555; }
    .job { margin-bottom: 15px; }
    .job-header { display: flex; justify-content: space-between; }
    .job-title { font-weight: bold; }
    .job-period { color: #888; font-size: 13px; }
    .job-company { color: #666; font-style: italic; }
    .job-desc { font-size: 14px; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="name">${resume.fullName || 'Name'}</div>
    <div class="contact">
      ${resume.email || ''} | ${resume.phone || ''} | ${resume.location || ''}
    </div>

    ${resume.summary ? `<div class="section"><div class="summary">${resume.summary}</div></div>` : ''}

    ${experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${experience.map((exp: any) => `
        <div class="job">
          <div class="job-header">
            <span class="job-title">${exp.title || ''}</span>
            <span class="job-period">${exp.period || ''}</span>
          </div>
          <div class="job-company">${exp.company || ''}</div>
          <div class="job-desc">${exp.description || ''}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${education.map((edu: any) => `
        <div class="job">
          <div class="job-header">
            <span class="job-title">${edu.degree || ''}</span>
            <span class="job-period">${edu.year || ''}</span>
          </div>
          <div class="job-company">${edu.school || ''}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      ${skills.map((s: any) => `<strong>${s.category}:</strong> ${(s.items || []).join(', ')}`).join(' | ')}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

function generateProfessionalTemplate(resume: any): string {
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; background: #fff; color: #333; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { background: #1a365d; color: #fff; padding: 30px; margin: -40px -40px 30px -40px; }
    .name { font-size: 32px; font-weight: bold; }
    .contact { margin-top: 10px; font-size: 14px; opacity: 0.9; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; color: #1a365d; font-weight: bold; border-bottom: 2px solid #1a365d; padding-bottom: 5px; margin-bottom: 15px; }
    .job { margin-bottom: 18px; padding-left: 15px; border-left: 3px solid #e2e8f0; }
    .job-title { font-weight: bold; color: #1a365d; }
    .job-meta { color: #666; font-size: 14px; }
    .job-desc { font-size: 14px; margin-top: 5px; line-height: 1.5; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-tag { background: #e2e8f0; padding: 5px 12px; border-radius: 3px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="name">${resume.fullName || 'Name'}</div>
      <div class="contact">${resume.email || ''} | ${resume.phone || ''} | ${resume.location || ''}</div>
    </div>

    ${resume.summary ? `<div class="section"><div class="section-title">Professional Summary</div><p>${resume.summary}</p></div>` : ''}

    ${experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${experience.map((exp: any) => `
        <div class="job">
          <div class="job-title">${exp.title || ''}</div>
          <div class="job-meta">${exp.company || ''} | ${exp.period || ''}</div>
          <div class="job-desc">${exp.description || ''}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${education.map((edu: any) => `
        <div class="job">
          <div class="job-title">${edu.degree || ''}</div>
          <div class="job-meta">${edu.school || ''} | ${edu.year || ''}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-grid">
        ${skills.flatMap((s: any) => (s.items || []).map((item: string) => `<span class="skill-tag">${item}</span>`)).join('')}
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

function generateCreativeTemplate(resume: any): string {
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 40px; text-align: center; }
    .name { font-size: 36px; font-weight: 300; letter-spacing: 3px; }
    .contact { margin-top: 15px; font-size: 14px; opacity: 0.9; }
    .content { padding: 40px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #764ba2; margin-bottom: 15px; }
    .summary { font-size: 16px; line-height: 1.8; color: #555; border-left: 4px solid #667eea; padding-left: 20px; }
    .job { margin-bottom: 20px; }
    .job-title { font-size: 18px; color: #333; }
    .job-meta { color: #764ba2; font-size: 14px; margin: 5px 0; }
    .job-desc { color: #666; line-height: 1.6; }
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-pill { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="name">${resume.fullName || 'Name'}</div>
      <div class="contact">${resume.email || ''} • ${resume.phone || ''} • ${resume.location || ''}</div>
    </div>
    <div class="content">
      ${resume.summary ? `<div class="section"><div class="section-title">About</div><div class="summary">${resume.summary}</div></div>` : ''}

      ${experience.length > 0 ? `
      <div class="section">
        <div class="section-title">Experience</div>
        ${experience.map((exp: any) => `
          <div class="job">
            <div class="job-title">${exp.title || ''}</div>
            <div class="job-meta">${exp.company || ''} | ${exp.period || ''}</div>
            <div class="job-desc">${exp.description || ''}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${education.length > 0 ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${education.map((edu: any) => `
          <div class="job">
            <div class="job-title">${edu.degree || ''}</div>
            <div class="job-meta">${edu.school || ''} | ${edu.year || ''}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${skills.length > 0 ? `
      <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-wrap">
          ${skills.flatMap((s: any) => (s.items || []).map((item: string) => `<span class="skill-pill">${item}</span>`)).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

// GET /api/resumes/[id]/export - Export resume as HTML (can be printed to PDF)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'cyber';
    const format = searchParams.get('format') || 'html';

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

    const html = generateResumeHTML(parsedResume, template);

    if (format === 'html') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="${resume.title || 'resume'}.html"`,
        },
      });
    }

    // For JSON format, return the structured data
    return NextResponse.json({
      resume: parsedResume,
      html,
      templates: ['cyber', 'minimal', 'professional', 'creative'],
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export resume' },
      { status: 500 }
    );
  }
}
