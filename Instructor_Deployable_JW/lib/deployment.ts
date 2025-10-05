import type { 
  Course, 
  CourseConfig, 
  UpdateCourseConfig, 
  CreateCourseResponse,
  APIResponse 
} from './types'


// Helper function for API errors
const handleApiError = (status: number, defaultMessage: string): never => {
  if (status === 401) {
    throw new Error('Unauthorized: Please log in again')
  }
  if (status === 404) {
    throw new Error('Resource not found')
  }
  throw new Error(defaultMessage)
}

// Helper function to get token
const getToken = (): string => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('No access token found')
  }
  return token
}

export async function getCourses(active?: boolean): Promise<Course[]> {
  const token = getToken()
  let url = '/api/user-configs'
  if (active !== undefined) {
    url += `?active=${active.toString()}`
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    handleApiError(response.status, 'Failed to fetch courses')
  }

  return response.json()
}

export async function getCourse(id: string): Promise<Course> {
  const token = getToken()

  const response = await fetch(`/api/config/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    handleApiError(response.status, 'Failed to fetch course')
  }

  return response.json()
}

export async function createCourse(courseConfig: any): Promise<CreateCourseResponse> {
  const token = getToken()

  const response = await fetch('/api/create-config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(courseConfig),
  })

  if (!response.ok) {
    handleApiError(response.status, 'Failed to create course')
  }

  return response.json()
}

export async function addPdfs(configId: string, files: File[]): Promise<APIResponse<{ message: string }>> {
  const token = getToken()
  const formData = new FormData()
  
  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await fetch(`/api/add-documents/${configId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    handleApiError(response.status, 'Failed to add PDFs')
  }

  return response.json()
}

export async function deletePdf(
  configId: string, 
  documentName: string
): Promise<APIResponse<{ message: string }>> {
  const token = getToken()

  const response = await fetch(`/api/delete-document/${configId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document_name: documentName }),
  })

  if (!response.ok) {
    handleApiError(response.status, 'Failed to delete PDF')
  }

  return response.json()
}

export async function updateCourse(
  configId: string, 
  updatedConfig: UpdateCourseConfig
): Promise<Course> {
  const token = getToken()

  const response = await fetch(`/api/config/${configId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedConfig),
  })

  if (!response.ok) {
    handleApiError(response.status, 'Failed to update course')
  }

  return response.json()
}

export async function deleteCourse(configId: string): Promise<string> {
  const token = getToken()

  const response = await fetch(`/api/deactivate-config/${configId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    handleApiError(response.status, 'Failed to delete course')
  }

  const result = await response.json()
  return result.message
}

export async function getTermYears(): Promise<string[]> {
  const response = await fetch('/api/term-years')
  if (!response.ok) {
    throw new Error('Failed to fetch term years')
  }
  return response.json()
}

export async function getOrganizations(): Promise<string[]> {
  const response = await fetch('/api/organizations')
  if (!response.ok) {
    throw new Error('Failed to fetch organizations')
  }
  return response.json()
}

export async function getPluginTypes(): Promise<string[]> {
  const response = await fetch('/api/plugin-types')
  if (!response.ok) {
    throw new Error('Failed to fetch plugin types')
  }
  return response.json()
}
