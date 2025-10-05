'use client'

import { useState, useEffect, useRef, DragEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCourse, deleteCourse, updateCourse, addPdfs, deletePdf } from '@/lib/deployment'
import { PlusCircle, Trash2 } from 'lucide-react'

export default function CoursePage({ params }: { params: { course: string } }) {
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleted, setIsDeleted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedCourse, setEditedCourse] = useState<any>(null)
  const [newPdfFiles, setNewPdfFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
  const fetchCourse = async () => {
    try {
      const fetchedCourse = await getCourse(params.course)

      if (fetchedCourse) {
        // Demo-only: inject fake URL if it doesn't already exist
        const hasFakeUrl = fetchedCourse.config_file.documents?.some((doc: any) =>
          doc.name === 'URL'
        )

        if (!hasFakeUrl) {
          fetchedCourse.config_file.documents = [
            ...(fetchedCourse.config_file.documents || []),
            {
              name: 'URL',
              address: 'https://lucylabs.gatech.edu/kbai/summer-2024/', // change this to whatever you want
            },
          ]
        }

        // Real: update React state with course data
        setCourse(fetchedCourse)
        setEditedCourse(JSON.parse(JSON.stringify(fetchedCourse)))
      } else {
        router.push('/404')
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      router.push('/404')
    } finally {
      setIsLoading(false)
    }
  }

  fetchCourse()
}, [params.course, router])

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(course._id)
      setIsDeleted(true)
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const handleEditCourse = () => setIsEditing(true)

const handleSaveCourse = async () => {
  try {
    const updatedCourse = await updateCourse(course._id, editedCourse.config_file)

    // DEMO-ONLY: Inject fake URL if it doesn't already exist after saving
    const hasFakeUrl = updatedCourse.config_file.documents?.some((doc: any) =>
      doc.name === 'URL'
    )

    if (!hasFakeUrl) {
      updatedCourse.config_file.documents = [
        ...(updatedCourse.config_file.documents || []),
        {
          name: 'URL',
          address: 'https://lucylabs.gatech.edu/kbai/summer-2024/', // update if needed
        },
      ]
    }

    // Real: update component state
    setCourse(updatedCourse)
    setEditedCourse(JSON.parse(JSON.stringify(updatedCourse)))
    setIsEditing(false)
  } catch (error) {
    console.error('Error updating course:', error)
  }
}

  const handleCancelEdit = () => {
    setEditedCourse(JSON.parse(JSON.stringify(course)))
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setEditedCourse({
      ...editedCourse,
      config_file: {
        ...editedCourse.config_file,
        [field]: e.target.value
      }
    })
  }

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setEditedCourse({
      ...editedCourse,
      config_file: {
        ...editedCourse.config_file,
        metadata: {
          ...editedCourse.config_file.metadata,
          [field]: e.target.value
        }
      }
    })
  }

  const handleAddPdf = async () => {
    if (newPdfFiles.length > 0) {
      try {
        await addPdfs(course._id, newPdfFiles)
        const updatedCourse = await getCourse(course._id)
        setCourse(updatedCourse)
        setEditedCourse(JSON.parse(JSON.stringify(updatedCourse)))
        setNewPdfFiles([])
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (error) {
        console.error('Error adding PDFs:', error)
      }
    }
  }

  const handleDeletePdf = async (documentName: string) => {
    try {
      await deletePdf(course._id, documentName)
      const updatedCourse = await getCourse(course._id)
      setCourse(updatedCourse)
      setEditedCourse(JSON.parse(JSON.stringify(updatedCourse)))
    } catch (error) {
      console.error('Error deleting PDF:', error)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf')
      setNewPdfFiles(prev => [...prev, ...filesArray])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setNewPdfFiles(prev => [...prev, ...Array.from(files)])
  }

  const [newUrl, setNewUrl] = useState('')

  const handleAddUrl = () => {
    if (!newUrl) return
    const fakeUrlDoc = {
      name: 'URL',
      address: newUrl
    }
    const updatedDocs = [...(editedCourse.config_file.documents || []), fakeUrlDoc]
    setEditedCourse({
      ...editedCourse,
      config_file: {
        ...editedCourse.config_file,
        documents: updatedDocs
      }
    })
    setNewUrl('')
  }

  if (isLoading) return <div>Loading...</div>
  if (!course) return null

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button className="mb-4">&larr; Back to Dashboard</Button>
      </Link>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{isEditing ? editedCourse.config_file.course_name : course.config_file.course_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-4">Course Information</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Name</span>
              {isEditing ? (
                <Input value={editedCourse.config_file.course_name} onChange={(e) => handleInputChange(e, 'course_name')} />
              ) : (
                <span className="font-medium">{course.config_file.course_name}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">CRN</span>
              {isEditing ? (
                <Input value={editedCourse.config_file.metadata.number} onChange={(e) => handleMetadataChange(e, 'number')} />
              ) : (
                <span className="font-medium">{course.config_file.metadata.number}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Full Name</span>
              {isEditing ? (
                <Input value={editedCourse.config_file.metadata.name} onChange={(e) => handleMetadataChange(e, 'name')} />
              ) : (
                <span className="font-medium">{course.config_file.metadata.name}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Organization</span>
              {isEditing ? (
                <Input value={editedCourse.config_file.metadata.organization} onChange={(e) => handleMetadataChange(e, 'organization')} />
              ) : (
                <span className="font-medium">{course.config_file.metadata.organization}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Term</span>
              {isEditing ? (
                <Input value={editedCourse.config_file.metadata.term} onChange={(e) => handleMetadataChange(e, 'term')} />
              ) : (
                <span className="font-medium">{course.config_file.metadata.term}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Platform</span>
              {isEditing ? (
                <Input
                  value={editedCourse.config_file.plugin.type}
                  onChange={(e) =>
                    setEditedCourse({
                      ...editedCourse,
                      config_file: {
                        ...editedCourse.config_file,
                        plugin: {
                          ...editedCourse.config_file.plugin,
                          type: e.target.value,
                        },
                      },
                    })
                  }
                />
              ) : (
                <span className="font-medium">{course.config_file.plugin.type}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Start Date</span>
              {isEditing ? (
                <Input type="date" value={editedCourse.config_file.metadata.start_date} onChange={(e) => handleMetadataChange(e, 'start_date')} />
              ) : (
                <span className="font-medium">{course.config_file.metadata.start_date}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">End Date</span>
              {isEditing ? (
                <Input type="date" value={editedCourse.config_file.metadata.end_date} onChange={(e) => handleMetadataChange(e, 'end_date')} />
              ) : (
                <span className="font-medium">{course.config_file.metadata.end_date}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Status</span>
              <span className="font-medium">{course.active ? 'Active' : 'Inactive'}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Created</span>
              <span className="font-medium">{new Date(course.creation_date).toLocaleDateString()}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Course Materials</h3>

          {/* Section: Website URLs */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Website URLs</h4>
            {((isEditing ? editedCourse : course).config_file.documents || []).filter((doc: any) => !doc.name.endsWith('.pdf')).length === 0 ? (
              <p className="text-sm italic text-gray-500">No URLs provided.</p>
            ) : (
              <ul className="list-none pl-0 mb-4">
                {(isEditing ? editedCourse : course).config_file.documents
                  .filter((doc: any) => !doc.name.endsWith('.pdf'))
                  .map((doc: any, index: number) => (
                    <li key={index} className="mb-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.name}</span>
                        <a href={doc.address} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                          {doc.address}
                        </a>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePdf(doc.name)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </li>
                  ))}
              </ul>
            )}

            {isEditing && (
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  type="text"
                  placeholder="Enter website URL"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                <Button onClick={handleAddUrl} disabled={!newUrl.trim()}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add URL
                </Button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-2">PDFs</h4>
            {(course.config_file.documents || []).filter((doc: any) => doc.name.endsWith('.pdf')).length === 0 ? (
              <p className="text-sm italic text-gray-500">No PDFs provided.</p>
            ) : (
              <ul className="list-none pl-0 mb-4">
                {(course.config_file.documents || [])
                  .filter((doc: any) => doc.name.endsWith('.pdf'))
                  .map((doc: any, index: number) => (
                    <li key={index} className="mb-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.name}</span>
                        <a href={doc.address} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                          {doc.address}
                        </a>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePdf(doc.name)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </li>
                  ))}
              </ul>
            )}

            {isEditing && (
              <div>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-dashed border-2 border-gray-300 p-4 rounded-lg text-center mb-4"
                >
                  Drag and drop PDFs here or use the file picker below
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileChange}
                  />
                  <Button onClick={handleAddPdf} disabled={newPdfFiles.length === 0}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {newPdfFiles.length > 0 && (
                  <ul className="text-sm text-gray-700 mb-2">
                    {newPdfFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveCourse}>Save Changes</Button>
                  <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                </>
              ) : (
                <Button onClick={handleEditCourse}>Edit Course</Button>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleted || isEditing}
            >
              {isDeleted ? 'Course Deleted' : 'Delete Course'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Are you sure you want to delete this course?</h2>
            <p className="text-sm text-gray-700 mb-4">
              This will permanently delete the course and all related data from the system.
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteCourse()
                  setShowDeleteConfirm(false)
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}