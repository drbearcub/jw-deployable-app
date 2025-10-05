// Auth Types
export interface User {
  id: string
  email: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, accessCode: string) => Promise<void>;
  logout: () => Promise<void>
  isLoading: boolean
}

// Course Types
export interface CourseMetadata {
  term: string
  number: string
  name: string
  organization: string
  start_date: string
  end_date: string
}

export interface PluginConfig {
  type: string
  api_key?: string
  context_id?: string
}

export interface Course {
  _id: string
  name: string
  active: boolean
  status?: 'in_progress' | 'active' | 'inactive'
  config_file: {
    course_name: string
    metadata: CourseMetadata
    plugin: PluginConfig
    documents: Array<{ name: string; address: string }>
    status?: 'in_progress' | 'active' | 'inactive'
  }
  creation_date: Date
}

// Component Props Types
export interface CourseFormProps {
  onCourseCreated: () => void
}

export interface CourseCardProps {
  course: Course
}

export interface AuthFormProps {
  mode: 'login' | 'signup'
}

// API Response Types
export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface CreateCourseResponse {
  config_id: string
  newCourse: {
    id: string
    name: string
    pdfs: string[]
  }
}

export interface CourseConfig {
  course_name: string
  metadata: CourseMetadata
  plugin: PluginConfig
}

export interface UpdateCourseConfig {
  course_name?: string
  metadata?: Partial<CourseMetadata>
  plugin?: Partial<PluginConfig>
  active?: boolean
}
