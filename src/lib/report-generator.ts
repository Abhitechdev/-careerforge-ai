import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export interface ResumeAnalysisData {
  resumeTitle: string;
  fileFormat: string;
  fileSize: number;
  uploadDate: number;
  analysisDate?: number;
  overallScore: number;
  atsScore: number;
  skillsScore: number;
  experienceScore: number;
  formattingScore: number;
  skills: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  targetRoles: string[];
  experienceLevel: string;
}

export interface JobMatchData {
  resumeTitle: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  skillsScore: number;
  experienceScore: number;
  keywordScore: number;
  educationScore: number;
  matchSummary: string;
  scoreReasoning: string;
  missingSkills: {
    critical: string[];
    niceToHave: string[];
    optional: string[];
  };
  recommendations: string[];
  learningPath: { skill: string, resource: string }[];
  coverLetter?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND COLORS
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = {
  primary: [79, 70, 229] as const, // #4f46e5 (Indigo)
  primaryDark: [67, 56, 202] as const, // #4338ca
  success: [16, 185, 129] as const, // #10b981 (Emerald)
  warning: [245, 158, 11] as const, // #f59e0b (Amber)
  danger: [239, 68, 68] as const, // #ef4444 (Red)
  slate700: [51, 65, 85] as const,
  slate500: [100, 116, 139] as const,
  slate300: [203, 213, 225] as const,
  slate100: [241, 245, 249] as const,
  slate50: [248, 250, 252] as const,
  white: [255, 255, 255] as const,
};

function getScoreColor(score: number): readonly [number, number, number] {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.danger;
}

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

// ─────────────────────────────────────────────────────────────────────────────
// VECTOR ICONS (Instead of Emojis)
// ─────────────────────────────────────────────────────────────────────────────

function drawCheckIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(...COLORS.success);
  doc.setLineWidth(0.8);
  // Simple checkmark shape
  doc.lines([[1.5, 1.5], [3, -3.5]], x, y, [1, 1], "S", true);
}

function drawWarningIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(...COLORS.danger);
  doc.setFillColor(...COLORS.danger);
  doc.setLineWidth(0.5);
  // Simple X cross
  doc.lines([[3, 3]], x, y - 3, [1, 1], "S", true);
  doc.lines([[-3, 3]], x + 3, y - 3, [1, 1], "S", true);
}

function drawBulletIcon(doc: jsPDF, x: number, y: number, color: readonly [number, number, number] = COLORS.primary) {
  doc.setFillColor(...color);
  doc.circle(x, y, 1, "F");
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function checkPageBreak(doc: jsPDF, currentY: number, neededHeight: number): number {
  if (currentY + neededHeight > 275) {
    doc.addPage();
    return 20; // top margin
  }
  return currentY;
}

function drawSectionHeader(doc: jsPDF, y: number, title: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text(title, 20, y);

  // Decorative underline
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(20, y + 3, 190, y + 3);

  return y + 12;
}

function drawProgressBar(doc: jsPDF, x: number, y: number, width: number, height: number, score: number, color: readonly [number, number, number]) {
  doc.setFillColor(...COLORS.slate100);
  doc.roundedRect(x, y, width, height, height / 2, height / 2, "F");
  
  const progressWidth = Math.max(height, (score / 100) * width);
  doc.setFillColor(...color);
  doc.roundedRect(x, y, progressWidth, height, height / 2, height / 2, "F");
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULAR SECTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function generateCoverPage(doc: jsPDF, data: ResumeAnalysisData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Premium dark banner at the top
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.text("CareerForge AI", 20, 25);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 255);
  doc.text("Resume Intelligence Report", 20, 35);
  
  // Candidate Info Block
  let y = 70;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.slate700);
  doc.text("Executive Summary", 20, y);
  
  y += 15;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.slate500);
  
  const details = [
    `Resume: ${data.resumeTitle}`,
    `Analyzed on: ${format(new Date(data.analysisDate || Date.now()), "MMMM d, yyyy")}`,
    `Experience Level: ${data.experienceLevel}`,
  ];
  
  details.forEach((text, i) => {
    doc.text(text, 20, y + (i * 7));
  });
  
  // Overall Score & Grade Card
  y += 35;
  doc.setFillColor(...COLORS.slate100);
  doc.roundedRect(20, y, pageWidth - 40, 60, 4, 4, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.slate700);
  doc.text("Overall ATS Assessment", 30, y + 15);
  
  const scoreColor = getScoreColor(data.overallScore);
  
  // Big Score
  doc.setFontSize(36);
  doc.setTextColor(...scoreColor);
  doc.text(`${data.overallScore}`, 30, y + 35);
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.slate500);
  doc.text("/ 100", 85, y + 35); // adjusted x manually for formatting
  
  // Grade
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.slate700);
  doc.text("Resume Grade:", 140, y + 25);
  doc.setFontSize(28);
  doc.setTextColor(...scoreColor);
  doc.text(getGrade(data.overallScore), 140, y + 40);

  // Target Roles Summary
  y += 80;
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.slate700);
  doc.text("Target Role Alignment", 20, y);
  
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.slate500);
  doc.text(data.targetRoles.join(" • "), 20, y, { maxWidth: pageWidth - 40 });
}

export function generateScoreSection(doc: jsPDF, data: ResumeAnalysisData, chartImageBase64?: string) {
  let y = 20;
  y = drawSectionHeader(doc, y, "Score Breakdown & Analysis");

  // Progress Bars
  const scores = [
    { label: "ATS Compatibility", score: data.atsScore },
    { label: "Skills Alignment", score: data.skillsScore },
    { label: "Experience Match", score: data.experienceScore },
    { label: "Formatting & Structure", score: data.formattingScore },
  ];

  scores.forEach((item, index) => {
    const currentY = y + (index * 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.slate700);
    doc.text(item.label, 20, currentY);
    
    doc.text(`${item.score}%`, 185, currentY, { align: "right" });
    drawProgressBar(doc, 70, currentY - 3, 100, 6, item.score, getScoreColor(item.score));
  });

  y += (scores.length * 15) + 10;

  // Insert Chart Image
  if (chartImageBase64) {
    y = checkPageBreak(doc, y, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.slate700);
    doc.text("Category Radar", 20, y);
    
    // The chart image aspect ratio is usually around 2:1 or 1:1, we center it
    doc.addImage(chartImageBase64, 'PNG', 40, y + 5, 130, 90);
    y += 105;
  }
}

export function generateKeywordSection(doc: jsPDF, data: ResumeAnalysisData) {
  let y = 20;
  y = drawSectionHeader(doc, y, "Keyword Gap Analysis");

  // Included Keywords
  if (data.skills.length > 0) {
    y = checkPageBreak(doc, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.success);
    drawCheckIcon(doc, 20, y);
    doc.text("Successfully Included Keywords", 28, y);
    
    y += 5;
    autoTable(doc, {
      startY: y,
      body: data.skills.map((k) => [k]),
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 2, bottom: 2, left: 4, right: 4 },
        textColor: COLORS.slate700 as any,
        fontStyle: "bold",
      },
      margin: { left: 24, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Missing Keywords
  if (data.missingKeywords.length > 0) {
    y = checkPageBreak(doc, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.danger);
    drawWarningIcon(doc, 20, y);
    doc.text("Missing Critical Keywords", 28, y);

    y += 5;
    autoTable(doc, {
      startY: y,
      body: data.missingKeywords.map((k) => [k]),
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 2, bottom: 2, left: 4, right: 4 },
        textColor: COLORS.slate700 as any,
      },
      margin: { left: 24, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }
}

export function generateRecommendationsSection(doc: jsPDF, data: ResumeAnalysisData) {
  let y = 20;
  y = drawSectionHeader(doc, y, "Recruiter Recommendations");

  // Strengths
  if (data.strengths.length > 0) {
    y = checkPageBreak(doc, y, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.slate700);
    doc.text("Key Strengths", 20, y);
    
    y += 5;
    autoTable(doc, {
      startY: y,
      body: data.strengths.map((s) => [s]),
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 2, bottom: 2, left: 4, right: 4 },
        textColor: COLORS.slate500 as any,
      },
      didDrawCell: (data) => {
        drawBulletIcon(doc, data.cell.x - 3, data.cell.y + 4, COLORS.success);
      },
      margin: { left: 25, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Areas for Improvement
  if (data.weaknesses.length > 0) {
    y = checkPageBreak(doc, y, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.slate700);
    doc.text("Areas for Improvement", 20, y);
    
    y += 5;
    autoTable(doc, {
      startY: y,
      body: data.weaknesses.map((w) => [w]),
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 2, bottom: 2, left: 4, right: 4 },
        textColor: COLORS.slate500 as any,
      },
      didDrawCell: (data) => {
        drawBulletIcon(doc, data.cell.x - 3, data.cell.y + 4, COLORS.warning);
      },
      margin: { left: 25, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }
}

export function generateRoadmapSection(doc: jsPDF, data: ResumeAnalysisData) {
  let y = 20;
  y = drawSectionHeader(doc, y, "Actionable Career Roadmap");

  if (data.recommendations.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.slate700);
    doc.text("Priority Fixes & Next Steps", 20, y);
    
    y += 5;
    autoTable(doc, {
      startY: y,
      body: data.recommendations.map((r, i) => [`${i + 1}.`, r]),
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        textColor: COLORS.slate700 as any,
      },
      columnStyles: {
        0: { cellWidth: 10, fontStyle: "bold", textColor: COLORS.primary as any },
      },
      margin: { left: 20, right: 20 },
    });
  }
}

function addFooter(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(...COLORS.slate300);
    doc.setLineWidth(0.3);
    doc.line(20, pageH - 15, pageWidth - 20, pageH - 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate500);
    
    doc.text("Generated by CareerForge AI • Confidential Career Assessment", 20, pageH - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageH - 10, { align: "right" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export function downloadResumeReport(data: ResumeAnalysisData, chartImageBase64?: string): void {
  const doc = new jsPDF("p", "mm", "a4");

  // Page 1
  generateCoverPage(doc, data);
  
  // Page 2
  doc.addPage();
  generateScoreSection(doc, data, chartImageBase64);
  
  // Page 3
  doc.addPage();
  generateKeywordSection(doc, data);
  
  // Page 4
  doc.addPage();
  generateRecommendationsSection(doc, data);
  
  // Page 5
  doc.addPage();
  generateRoadmapSection(doc, data);

  // Footers
  addFooter(doc);

  // Safe filename
  const safeName = data.resumeTitle
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 30);
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const filename = `CareerForge_Resume_Assessment_${safeName}_${dateStr}.pdf`;

  doc.save(filename);
}

export function downloadJobMatchReport(data: JobMatchData): void {
  const doc = new jsPDF("p", "mm", "a4");

  // Cover
  doc.setFillColor(...COLORS.slate50);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("CareerForge AI", 20, 20);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Job Match Assessment Report", 20, 30);

  // Overview
  doc.setTextColor(...COLORS.slate700);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Opportunity Overview", 20, 60);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Candidate Profile: ${data.resumeTitle}`, 20, 75);
  doc.text(`Target Role: ${data.jobTitle}`, 20, 85);
  doc.text(`Company: ${data.companyName}`, 20, 95);
  doc.text(`Date Assessed: ${format(new Date(), "MMMM do, yyyy")}`, 20, 105);

  // Score
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.primary);
  doc.text(`Overall Match: ${data.matchScore}%`, 130, 85);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.slate500);
  doc.text(`Skills: ${data.skillsScore}% | Exp: ${data.experienceScore}% | Edu: ${data.educationScore}%`, 130, 95);

  // Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.slate700);
  doc.text("Recruiter Insights", 20, 130);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(data.matchSummary, 170);
  doc.text(summaryLines, 20, 140);

  // Reasoning
  let currentY = 140 + (summaryLines.length * 6) + 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.slate500);
  const reasoningLines = doc.splitTextToSize("Score Reasoning: " + data.scoreReasoning, 170);
  doc.text(reasoningLines, 20, currentY);

  // Missing Skills
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text("Missing Job Requirements", 20, 30);
  
  currentY = 45;
  doc.setFontSize(12);

  if (data.missingSkills.critical.length > 0) {
    doc.setTextColor(...COLORS.danger);
    doc.text("Critical Requirements", 20, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.slate700);
    data.missingSkills.critical.forEach(s => {
      drawWarningIcon(doc, 20, currentY);
      doc.text(s, 25, currentY + 1);
      currentY += 8;
    });
    currentY += 5;
  }

  if (data.missingSkills.niceToHave.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.warning);
    doc.text("Nice to Have", 20, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.slate700);
    data.missingSkills.niceToHave.forEach(s => {
      drawBulletIcon(doc, 20, currentY - 1, COLORS.warning);
      doc.text(s, 25, currentY);
      currentY += 8;
    });
    currentY += 5;
  }

  // Recommendations
  currentY = checkPageBreak(doc, currentY, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text("Recommended Actions", 20, currentY);
  currentY += 15;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.slate700);
  data.recommendations.forEach(r => {
    drawCheckIcon(doc, 20, currentY - 1);
    const lines = doc.splitTextToSize(r, 160);
    doc.text(lines, 25, currentY);
    currentY += (lines.length * 6) + 4;
  });

  // Learning Path
  if (data.learningPath.length > 0) {
    currentY = checkPageBreak(doc, currentY, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.primaryDark);
    doc.text("Recommended Learning Path", 20, currentY);
    currentY += 15;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.slate700);
    data.learningPath.forEach(lp => {
      doc.text(`• ${lp.skill}  =>  ${lp.resource}`, 20, currentY);
      currentY += 8;
    });
  }

  // Cover Letter
  if (data.coverLetter) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.primaryDark);
    doc.text("AI Drafted Cover Letter", 20, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.slate700);
    const letterLines = doc.splitTextToSize(data.coverLetter, 170);
    doc.text(letterLines, 20, 45);
  }

  addFooter(doc);

  const safeCompany = data.companyName.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const filename = `CareerForge_JobMatch_Report_${safeCompany}_${dateStr}.pdf`;

  doc.save(filename);
}

export interface InterviewReportData {
  candidateName: string;
  role: string;
  overallScore: number;
  technicalScore: number;
  behavioralScore: number;
  communicationScore: number;
  projectScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
  questions: {
    question: string;
    category: string;
    score: number;
    feedback: string;
    sampleAnswer: string;
  }[];
}

export function downloadInterviewReport(data: InterviewReportData): void {
  const doc = new jsPDF("p", "mm", "a4");

  // Cover
  doc.setFillColor(...COLORS.slate50);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("CareerForge AI", 20, 20);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Interview Readiness Report", 20, 30);

  // Overview
  doc.setTextColor(...COLORS.slate700);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Candidate Overview", 20, 60);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Candidate Name: ${data.candidateName}`, 20, 75);
  doc.text(`Target Role: ${data.role}`, 20, 85);
  doc.text(`Date Assessed: ${format(new Date(), "MMMM do, yyyy")}`, 20, 95);

  // Score
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.primary);
  doc.text(`Overall Readiness: ${Math.round(data.overallScore)}%`, 130, 85);

  // Sub Scores
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.slate500);
  doc.text(`Tech: ${Math.round(data.technicalScore)}% | Behav: ${Math.round(data.behavioralScore)}% | Comm: ${Math.round(data.communicationScore)}%`, 130, 95);
  
  // Strengths & Weaknesses
  let currentY = 130;
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.success);
  doc.text("Core Strengths", 20, currentY);
  
  doc.setTextColor(...COLORS.danger);
  doc.text("Areas for Improvement", 110, currentY);

  currentY += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  let leftY = currentY;
  doc.setTextColor(...COLORS.slate700);
  data.strengths.forEach(s => {
    drawCheckIcon(doc, 20, leftY - 1);
    const lines = doc.splitTextToSize(s, 80);
    doc.text(lines, 25, leftY);
    leftY += (lines.length * 5) + 3;
  });

  let rightY = currentY;
  data.weaknesses.forEach(w => {
    drawWarningIcon(doc, 110, rightY);
    const lines = doc.splitTextToSize(w, 80);
    doc.text(lines, 115, rightY + 1);
    rightY += (lines.length * 5) + 3;
  });

  currentY = Math.max(leftY, rightY) + 15;

  // Improvement Plan
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primaryDark);
  doc.text("Interview Action Plan", 20, currentY);
  currentY += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.slate700);
  data.improvementPlan.forEach((plan, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}.`, 20, currentY);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(plan, 170);
    doc.text(lines, 25, currentY);
    currentY += (lines.length * 6) + 4;
  });

  // Questions Review
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text("Detailed Question Evaluation", 20, 30);
  
  currentY = 45;

  data.questions.forEach((q, i) => {
    currentY = checkPageBreak(doc, currentY, 60);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.slate700);
    const qLines = doc.splitTextToSize(`Q${i + 1}. ${q.question}`, 170);
    doc.text(qLines, 20, currentY);
    currentY += (qLines.length * 6) + 2;

    doc.setFontSize(10);
    doc.setTextColor(...COLORS.primary);
    doc.text(`Category: ${q.category}  |  Score: ${q.score}/100`, 20, currentY);
    currentY += 8;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.slate500);
    const fLines = doc.splitTextToSize(`Feedback: ${q.feedback}`, 170);
    doc.text(fLines, 20, currentY);
    currentY += (fLines.length * 5) + 10;
  });

  addFooter(doc);

  const safeName = data.candidateName.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const filename = `CareerForge_Interview_Report_${safeName}_${dateStr}.pdf`;

  doc.save(filename);
}
