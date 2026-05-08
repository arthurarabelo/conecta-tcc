export type UserRole = 'professor' | 'student'

export type ProposalStatus = 'open' | 'closed'

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface Department {
  id: number
  name: string
  code: string
}

export interface KnowledgeArea {
  id: number
  name: string
  code: string
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  department_id: number | null
  profile_link: string | null
  department?: Department
}

export interface Proposal {
  id: number
  professor_id: number
  title: string
  description: string
  prerequisites: string | null
  max_slots: number
  department_id: number
  area_id: number
  status: ProposalStatus
  professor?: User
  department?: Department
  area?: KnowledgeArea
  applications_count?: number
  approved_applications_count?: number
}

export interface Application {
  id: number
  student_id: number
  proposal_id: number
  status: ApplicationStatus
  feedback: string | null
  applied_at: string
  reviewed_at: string | null
  student?: User
  proposal?: Proposal
}
