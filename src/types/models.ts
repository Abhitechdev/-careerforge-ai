export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  originalFileName: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionNumber: number;
  content: string; // The parsed/modified content
  changesSummary?: string;
  createdAt: Date;
}

export interface ATSAnalysis {
  id: string;
  resumeVersionId: string;
  score: number;
  missingSkills: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface JobMatch {
  id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  createdAt: Date;
}

export interface Application {
  id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  appliedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoverLetter {
  id: string;
  userId: string;
  applicationId?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillRoadmap {
  id: string;
  userId: string;
  targetRole: string;
  skillsToLearn: {
    skillName: string;
    status: 'pending' | 'in-progress' | 'completed';
    estimatedWeeks: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
}

export interface BillingRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  date: Date;
}

export interface CareerInsight {
  id: string;
  userId: string;
  missingSkills: string[];
  recommendedRoles: string[];
  recommendedLearning: string[];
  generatedAt: Date;
}
