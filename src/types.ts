export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  onboardingComplete?: boolean;
  // Patient fields
  age?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  sharingEnabled?: boolean;
  // Doctor fields
  degree?: string;
}

export type RecordType = 'prescription' | 'report';

export interface MedicalRecord {
  id: string;
  patientId: string;
  fileUrl: string;
  fileName: string;
  type: RecordType;
  createdAt: any; // Firestore Timestamp
}
