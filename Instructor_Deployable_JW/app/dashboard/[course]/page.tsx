'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const fetchedCourse = await getCourse(params.course)
        if (fetchedCourse) {
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

  const handleEditCourse = () => {
    setIsEditing(true)
  }

  const handleSaveCourse = async () => {
    try {
      const updatedCourse = await updateCourse(course._id, editedCourse.config_file)
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
    if (newPdfFile) {
      try {
        await addPdfs(course._id, [newPdfFile])
        const updatedCourse = await getCourse(course._id)
        setCourse(updatedCourse)
        setEditedCourse(JSON.parse(JSON.stringify(updatedCourse)))
        setNewPdfFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error adding PDF:', error)
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

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!course) {
    return null  // This should never render as we redirect to 404 if course is not found
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button className="mb-4">
          &larr; Back to Dashboard
        </Button>
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
                <Input
                  value={editedCourse.config_file.course_name}
                  onChange={(e) => handleInputChange(e, 'course_name')}
                />
              ) : (
                <span className="font-medium">{course.config_file.course_name}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Number</span>
              {isEditing ? (
                <Input
                  value={editedCourse.config_file.metadata.number}
                  onChange={(e) => handleMetadataChange(e, 'number')}
                />
              ) : (
                <span className="font-medium">{course.config_file.metadata.number}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Term</span>
              {isEditing ? (
                <Input
                  value={editedCourse.config_file.metadata.term}
                  onChange={(e) => handleMetadataChange(e, 'term')}
                />
              ) : (
                <span className="font-medium">{course.config_file.metadata.term}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Organization</span>
              {isEditing ? (
                <Input
                  value={editedCourse.config_file.metadata.organization}
                  onChange={(e) => handleMetadataChange(e, 'organization')}
                />
              ) : (
                <span className="font-medium">{course.config_file.metadata.organization}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Start Date</span>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedCourse.config_file.metadata.start_date}
                  onChange={(e) => handleMetadataChange(e, 'start_date')}
                />
              ) : (
                <span className="font-medium">{course.config_file.metadata.start_date}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">End Date</span>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedCourse.config_file.metadata.end_date}
                  onChange={(e) => handleMetadataChange(e, 'end_date')}
                />
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
          <h3 className="text-xl font-semibold mb-4">Documents</h3>
          <ul className="list-none pl-0 mb-6">
            {(isEditing ? editedCourse : course).config_file.documents.map((doc: any, index: number) => (
              <li key={index} className="mb-2 flex items-center justify-between">
                <span>{doc.name}</span>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePdf(doc.name)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {isEditing && (
            <div className="mb-4 flex items-center space-x-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setNewPdfFile(e.target.files?.[0] || null)}
                className="flex-grow"
              />
              <Button onClick={handleAddPdf} disabled={!newPdfFile}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add PDF
              </Button>
            </div>
          )}
          <div className='flex flex-row space-x-5'>
            {isEditing ? (
              <>
                <Button onClick={handleSaveCourse}>Save Changes</Button>
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              </>
            ) : (
              <Button onClick={handleEditCourse}>Edit Course</Button>
            )}
            <Button 
              variant="destructive" 
              onClick={handleDeleteCourse} 
              disabled={isDeleted || isEditing}
            >
              {isDeleted ? 'Course Deleted' : 'Delete Course'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}