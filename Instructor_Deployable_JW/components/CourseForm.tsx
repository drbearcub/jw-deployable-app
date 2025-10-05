'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CourseFormProps, Course, CourseMetadata } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, File, Check, Copy, Trash2 } from 'lucide-react'
import { createCourse, addPdfs, getTermYears, getOrganizations, getPluginTypes, getCourses } from '@/lib/deployment'

type Template = {
  course_name: string
  metadata: CourseMetadata
  plugin: string
}

export function CourseForm({ onCourseCreated }: CourseFormProps) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false)
  const [courseConfig, setCourseConfig] = useState<Template>({
    course_name: '',
    metadata: {
      term: '',
      number: '',
      name: '',
      organization: '',
      start_date: new Date().toISOString().split('T')[0], // Set to today's date
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0] // Set to 4 months from today
    },
    plugin: ''
  })
  const [newPdfFiles, setNewPdfFiles] = useState<File[]>([])
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null)
  const [termYears, setTermYears] = useState<string[]>([])
  const [organizations, setOrganizations] = useState<string[]>([])
  const [pluginTypes, setPluginTypes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [terms, orgs, plugins, inactiveCourses] = await Promise.all([
          getTermYears(),
          getOrganizations(),
          getPluginTypes(),
          getCourses(false)  // Fetch inactive courses
        ])
        setTermYears(terms)
        setOrganizations(orgs)
        setPluginTypes(plugins)
        
        // Filter inactive courses and format them as templates
        const inactiveTemplates = (inactiveCourses as Course[])
          .filter(course => !course.active)
          .map(course => ({
            course_name: course.name,
            metadata: {
              term: course.config_file.metadata.term,
              number: course.config_file.metadata.number,
              name: course.config_file.metadata.name,
              organization: course.config_file.metadata.organization,
              start_date: course.config_file.metadata.start_date,
              end_date: course.config_file.metadata.end_date
            },
            plugin: course.config_file.plugin.type
          }))
        setTemplates(inactiveTemplates)
      } catch (error) {
        console.error('Error fetching metadata:', error)
        setError('Failed to load form data. Please try again later.')
      }
    }
    fetchMetadata()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPdfFiles.length === 0) {
      setError('Please add at least one PDF before submitting.')
      return
    }
    try {
      // Ensure all required fields are filled
      if (!courseConfig.course_name || 
          !courseConfig.metadata.term || !courseConfig.metadata.number || 
          !courseConfig.metadata.name || !courseConfig.metadata.organization || 
          !courseConfig.metadata.start_date || !courseConfig.metadata.end_date || 
          !courseConfig.plugin) {
        setError('Please fill in all required fields.')
        return
      }

      // Format dates to ISO string
      const formattedConfig = {
        ...courseConfig,
        metadata: {
          ...courseConfig.metadata,
          start_date: new Date(courseConfig.metadata.start_date).toISOString(),
          end_date: new Date(courseConfig.metadata.end_date).toISOString()
        }
      }

      // First, create the course
      const { config_id, newCourse } = await createCourse(formattedConfig)
      
      // Then, add the PDFs to the course
      await addPdfs(config_id, newPdfFiles)

      console.log('Course created:', newCourse)
      setIsConfirmationVisible(true)
      onCourseCreated()
      setTimeout(() => {
        setIsFormOpen(false)
        setIsConfirmationVisible(false)
        clearForm()
      }, 3000)
    } catch (error) {
      console.error('Error creating course:', error)
      setError('Failed to create course. Please try again.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed.')
        return
      }
      setNewPdfFile(file)
      setError(null)
    }
  }

  const handleAddPdf = () => {
    if (newPdfFile) {
      setNewPdfFiles(prevFiles => [...prevFiles, newPdfFile])
      setNewPdfFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = (index: number) => {
    setNewPdfFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const handleTemplateSelect = (template: Template) => {
    setCourseConfig({
      ...template,
      metadata: {
        ...template.metadata,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0]
      }
    })
    setIsTemplateModalOpen(false)
  }

  const clearForm = () => {
    setCourseConfig({
      course_name: '',
      metadata: {
        term: '',
        number: '',
        name: '',
        organization: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0]
      },
      plugin: ''
    })
    setNewPdfFiles([])
    setError(null)
  }

  if (isConfirmationVisible) {
    return (
      <Card className="bg-green-100 border-green-500">
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Check className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-green-700 mb-2">Course Created Successfully!</h3>
          <p className="text-green-600">Your new Jill Watson instance has been set up.</p>
        </CardContent>
      </Card>
    )
  }

  if (!isFormOpen) {
    return (
      <Card 
        className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center h-40"
        onClick={() => setIsFormOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center">
          <PlusCircle className="w-12 h-12 mb-2" />
          <span className="text-lg font-semibold">Create Jill Watson Instance</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center"
            >
              <Copy className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          </div>
          <Input 
            placeholder="Course Name"
            value={courseConfig.course_name}
            onChange={(e) => setCourseConfig({...courseConfig, course_name: e.target.value})}
            required
          />
          <Input 
            placeholder="Course Number"
            value={courseConfig.metadata.number}
            onChange={(e) => setCourseConfig({...courseConfig, metadata: {...courseConfig.metadata, number: e.target.value}})}
            required
          />
          <Input 
            placeholder="Course Full Name"
            value={courseConfig.metadata.name}
            onChange={(e) => setCourseConfig({...courseConfig, metadata: {...courseConfig.metadata, name: e.target.value}})}
            required
          />
          <Select onValueChange={(value) => setCourseConfig({...courseConfig, metadata: {...courseConfig.metadata, term: value}})} value={courseConfig.metadata.term} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              {termYears.map((term) => (
                <SelectItem key={term} value={term}>{term}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setCourseConfig({...courseConfig, metadata: {...courseConfig.metadata, organization: value}})} value={courseConfig.metadata.organization} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org} value={org}>{org}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input 
            type="date"
            value={courseConfig.metadata.start_date}
            onChange={(e) => setCourseConfig({...courseConfig, metadata: {...courseConfig.metadata, start_date: e.target.value}})}
            required
          />
          <Input 
            type="date"
            value={courseConfig.metadata.end_date}
            onChange={(e) => setCourseConfig({...courseConfig, metadata: {...courseConfig.metadata, end_date: e.target.value}})}
            required
          />
          <Select onValueChange={(value) => setCourseConfig({...courseConfig, plugin: value})} value={courseConfig.plugin} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Plugin" />
            </SelectTrigger>
            <SelectContent>
              {pluginTypes.map((plugin) => (
                <SelectItem key={plugin} value={plugin}>{plugin}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange}
                accept=".pdf"
                className="flex-grow"
              />
              <Button 
                type="button"
                onClick={handleAddPdf}
                disabled={!newPdfFile}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add PDF
              </Button>
            </div>
            {newPdfFiles.length > 0 && (
              <ul className="mt-2">
                {newPdfFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <File className="mr-2" size={16} />
                      {file.name}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button type="submit" disabled={newPdfFiles.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Jill Watson Instance
              </Button>
              <Button type="button" variant="outline" onClick={clearForm}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Form
              </Button>
            </div>
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Select a Template</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {templates.map((template) => (
                  <li 
                    key={template.course_name}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {template.course_name} - {template.metadata.term}
                  </li>
                ))}
              </ul>
              <Button 
                className="mt-4" 
                onClick={() => setIsTemplateModalOpen(false)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}
