'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CourseFormProps, Course, CourseMetadata } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, File as FileIcon, Check, Copy, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { createCourse, addPdfs, getTermYears, getOrganizations, getPluginTypes, getCourses } from '@/lib/deployment'

const SECTIONS = ['general', 'details', 'attachments', 'summary']

export function CourseForm({ onCourseCreated }: CourseFormProps) {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState('start')
  const [courseConfig, setCourseConfig] = useState({
    course_name: '',
    metadata: {
      term: '',
      number: '',
      name: '',
      organization: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0],
    },
    plugin: '',
  })
  const [newPdfFiles, setNewPdfFiles] = useState<File[]>([])
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null)
  const [termYears, setTermYears] = useState<string[]>([])
  const [organizations, setOrganizations] = useState<string[]>([])
  const [pluginTypes, setPluginTypes] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [websiteError, setWebsiteError] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false)
  const [attachmentType, setAttachmentType] = useState<string[]>([])
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([])
  const [donePressed, setDonePressed] = useState(false)
  const [extractedUrls, setExtractedUrls] = useState<string[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [terms, orgs, plugins] = await Promise.all([
          getTermYears(),
          getOrganizations(),
          getPluginTypes(),
        ])
        setTermYears(terms)
        setOrganizations(orgs)
        setPluginTypes(plugins)
      } catch (error) {
        console.error('Error fetching metadata:', error)
        setError('Failed to load form data. Please try again later.')
      }
    }
    fetchMetadata()
  }, [])

  const handleNext = () => {
    const index = SECTIONS.indexOf(currentSection)
    if (index < SECTIONS.length - 1) {
      setCurrentSection(SECTIONS[index + 1])
    }
  }

  const handlePrev = () => {
    const index = SECTIONS.indexOf(currentSection)
    if (index > 0) {
      setCurrentSection(SECTIONS[index - 1])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setNewPdfFiles(prev => [...prev, file])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      setError('Only PDF files are allowed.')
    }
  }

  const handleAddPdf = () => {
    if (newPdfFile) {
      setNewPdfFiles(prev => [...prev, newPdfFile])
      setNewPdfFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setNewPdfFiles(prev => prev.filter((_, i) => i !== index))
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
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0],
      },
      plugin: '',
    })
    setWebsiteUrls([])
    setNewPdfFiles([])
    setWebsiteError(null)
    setSuccessMessage(null)
    setDonePressed(false)
    setCurrentSection('start')  // back to "+" card
  }

  const handleSubmit = async () => {
    try {
      const { config_id, newCourse } = await createCourse({
        ...courseConfig,
        metadata: {
          ...courseConfig.metadata,
          start_date: new Date(courseConfig.metadata.start_date).toISOString(),
          end_date: new Date(courseConfig.metadata.end_date).toISOString(),
        }
      })
      await addPdfs(config_id, newPdfFiles)
      setIsConfirmationVisible(true)
      onCourseCreated()
      clearForm()
    } catch (e) {
      setError('Failed to create course.')
    }
  }

  if (currentSection === 'start') {
    return (
      <Card className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center h-40" onClick={() => setCurrentSection('general')}>
        <CardContent className="flex flex-col items-center justify-center">
          <PlusCircle className="w-12 h-12 mb-2" />
          <span className="text-lg font-semibold">Create Jill Watson Assistant</span>
        </CardContent>
      </Card>
    )
  }

const handleExtractWebsite = async (index: number) => {
  setIsExtracting(true)
  setWebsiteError(null)
  setSuccessMessage(null)

  try {
    const response = await fetch('http://cristina.cjdns.pkt.wiki:8000/api/scrape-and-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: websiteUrls[index] }),
    })
    if (!response.ok) throw new Error('Scraping failed.')

    const blob = await response.blob()
    const file = new File([blob], `scraped-content-${index + 1}.pdf`, { type: 'application/pdf' })
    setNewPdfFiles(prev => [...prev, file])

    // ✅ Add the successfully extracted URL
    setExtractedUrls(prev => [...prev, websiteUrls[index]])
    setSuccessMessage('The website was extracted successfully.')
  } catch (err) {
    setWebsiteError(
      'Failed to extract website content. Please check that the website is functioning and the input URL is correct. If the problem still persists, please contact support at email@gatech.edu.'
    )
  } finally {
    setIsExtracting(false)
  }
}

  return (
<Card className="p-4 space-y-6">
  {currentSection === 'general' && (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">1. General Information</h3>
        <Button
          variant="outline"
          onClick={() => setShowClearConfirm(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Clear Form
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Course Name"
          value={courseConfig.course_name}
          onChange={(e) =>
            setCourseConfig({
              ...courseConfig,
              course_name: e.target.value,
            })
          }
        />
        <Input
          placeholder="Course CRN"
          value={courseConfig.metadata.number}
          onChange={(e) =>
            setCourseConfig({
              ...courseConfig,
              metadata: { ...courseConfig.metadata, number: e.target.value },
            })
          }
        />
        <Input
          placeholder="Course Full Name"
          value={courseConfig.metadata.name}
          onChange={(e) =>
            setCourseConfig({
              ...courseConfig,
              metadata: { ...courseConfig.metadata, name: e.target.value },
            })
          }
        />
        <Select
          onValueChange={(value) =>
            setCourseConfig({
              ...courseConfig,
              metadata: { ...courseConfig.metadata, organization: value },
            })
          }
          value={courseConfig.metadata.organization}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org} value={org}>
                {org}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )}

      {currentSection === 'details' && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">2. Course Details</h3>
    <div className="space-y-4">
      <Select onValueChange={(value) => setCourseConfig({ ...courseConfig, metadata: { ...courseConfig.metadata, term: value } })} value={courseConfig.metadata.term}>
        <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
        <SelectContent>{termYears.map((term) => <SelectItem key={term} value={term}>{term}</SelectItem>)}</SelectContent>
      </Select>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Semester Start Date
          </label>
          <Input
            type="date"
            value={courseConfig.metadata.start_date}
            onChange={(e) =>
              setCourseConfig({
                ...courseConfig,
                metadata: {
                  ...courseConfig.metadata,
                  start_date: e.target.value,
                },
              })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Semester End Date
          </label>
          <Input
            type="date"
            value={courseConfig.metadata.end_date}
            onChange={(e) =>
              setCourseConfig({
                ...courseConfig,
                metadata: {
                  ...courseConfig.metadata,
                  end_date: e.target.value,
                },
              })
            }
          />
        </div>
      <Select onValueChange={(value) => setCourseConfig({ ...courseConfig, plugin: value })} value={courseConfig.plugin}>
        <SelectTrigger><SelectValue placeholder="Select Platform" /></SelectTrigger>
        <SelectContent>{pluginTypes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  </div>
)}

{currentSection === 'attachments' && (
  <div className="space-y-6">
    {/* Section 3: Website URLs */}
    <div className="space-y-4 border border-gray-200 p-4 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold">3. Course Materials: Website URLs</h3>
      {!donePressed && (
        <p className="text-sm text-gray-600">
          Please add the website URL for the course.
        </p>
      )}


      {donePressed ? (
        extractedUrls.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No URL provided.</p>
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
            {extractedUrls.map((url, index) => (
              <li key={index}>{url}</li>
            ))}
          </ul>
        )
      ) : (
        <>
          {websiteUrls.map((url, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => {
                  const newUrls = [...websiteUrls]
                  newUrls[index] = e.target.value
                  setWebsiteUrls(newUrls)
                  setWebsiteError(null)
                  setSuccessMessage(null)
                }}
              />
              <Button
                type="button"
                onClick={() => handleExtractWebsite(index)}
                disabled={!url || isExtracting}
              >
                {isExtracting ? 'Extracting...' : 'Extract'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newUrls = [...websiteUrls]
                  newUrls.splice(index, 1)
                  setWebsiteUrls(newUrls)
                  setWebsiteError(null)
                  setSuccessMessage(null)
                }}
              >
                <Trash2 className="text-red-500 w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setWebsiteUrls(prev => [...prev, ''])}
          >
            Add URL
          </Button>

          {/* Success and Error Messages */}
          {successMessage && <p className="text-green-600">{successMessage}</p>}
          {websiteError && (
            <p className="text-sm text-red-500 mt-2">
              Failed to extract website content. Please check that the website is functioning and the input URL is correct.
              If the problem still persists, please contact support at <a href="mailto:email@gatech.edu" className="underline">email@gatech.edu</a>.
            </p>
          )}
        </>
      )}
    </div>

    {/* Section 4: PDFs */}
    <div className="space-y-4 border border-gray-200 p-4 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold">4. Course Materials: PDFs</h3>
      {!donePressed && (
        <p className="text-sm text-gray-600">
          Please add the documents for the course in a PDF format.
        </p>
      )}

      {donePressed ? (
        newPdfFiles.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No PDF provided.</p>
        ) : (
          <ul className="space-y-1 text-sm text-gray-800">
            {newPdfFiles.map((file, index) => (
              <li key={index} className="flex items-center">
                <FileIcon className="mr-2" size={16} />
                {file.name}
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            hidden
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click()
            }}
          >
            Add PDF
          </Button>

          <ul className="space-y-1">
            {newPdfFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <FileIcon className="mr-2" size={16} />
                  {file.name}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="text-red-500 w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>

    {/* Done / Add More Materials Buttons */}
    <div className="pt-4 flex justify-between">
      {!donePressed ? (
        <Button onClick={() => setDonePressed(true)}>Done</Button>
      ) : (
        <Button onClick={() => setDonePressed(false)}>Edit Materials</Button>
      )}
    </div>
  </div>
)}


{currentSection === 'summary' && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">5. Review</h3>
    <ul className="text-sm space-y-2">
      <li><strong>Name:</strong> {courseConfig.course_name}</li>
      <li><strong>Course CRN:</strong> {courseConfig.metadata.number}</li>
      <li><strong>Full Name:</strong> {courseConfig.metadata.name}</li>
      <li><strong>Organization:</strong> {courseConfig.metadata.organization}</li>
      <li><strong>Term:</strong> {courseConfig.metadata.term}</li>
      <li><strong>Semester Start Date:</strong> {courseConfig.metadata.start_date}</li>
      <li><strong>Semester End Date:</strong> {courseConfig.metadata.end_date}</li>
      <li><strong>Platform:</strong> {courseConfig.plugin}</li>
      <li><strong>Course Materials: Website URLs:</strong> {
        extractedUrls.length === 0 ? 'No URL provided' :
        extractedUrls.length === 1 ? '1 URL added' :
        `${extractedUrls.length} URLs added`
      }</li>
      <li><strong>Course Materials: PDFs:</strong> {
        newPdfFiles.length === 0 ? 'No PDF added' :
        newPdfFiles.length === 1 ? '1 PDF added' :
        `${newPdfFiles.length} PDFs added`
      }</li>
    </ul>

    <div className="flex justify-between items-center pt-4">
      <div className="flex space-x-2">
        <Button onClick={() => setShowSubmitConfirm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Submit Course Information
        </Button>

        <Button variant="outline" onClick={() => setCurrentSection('attachments')}>
          Edit
        </Button>
      </div>
      <Button
        variant="outline"
        onClick={() => setShowClearConfirm(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" /> Clear Form
      </Button>

    </div>

    {showSubmitConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md max-w-sm space-y-4">
          <h4 className="text-lg font-semibold">Submit Course Information?</h4>
          <p className="text-sm text-gray-600">
            Are you sure you want to submit the course materials? Once submitted, the information will be sent to Jill Watson and cannot be edited.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowSubmitConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleSubmit()
                setShowSubmitConfirm(false)
              }}
            >
              Yes, Submit
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>

)}


      {/* {websiteError && <p className="text-red-500">{websiteError}</p>} */}
      {/* Navigation Buttons */}
      {SECTIONS.includes(currentSection) && currentSection !== 'summary' && (
        // Hide bottom nav during attachments step until "Done" is pressed
        (currentSection !== 'attachments' || donePressed) && (
          <div className="flex justify-between pt-4">
            {currentSection !== 'general' && (
              <Button variant="outline" onClick={handlePrev}>
                <ArrowUpCircle className="mr-2 h-4 w-4" /> Previous
              </Button>
            )}

            <Button onClick={handleNext}>
              {currentSection === 'attachments' ? 'Go to Review' : (
                <>
                  <ArrowDownCircle className="mr-2 h-4 w-4" /> Next
                </>
              )}
            </Button>
          </div>
        )
      )}

      {showClearConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded shadow-md max-w-sm space-y-4">
      <h4 className="text-lg font-semibold">Clear Form?</h4>
      <p className="text-sm text-gray-600">
        Are you sure you want to clear the form? This will erase all content and reset the assistant setup.
      </p>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setShowClearConfirm(false)}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            clearForm()
            setShowClearConfirm(false)
          }}
        >
          Yes, Clear Form
        </Button>
      </div>
    </div>
  </div>
)}

    </Card>
  )
}
