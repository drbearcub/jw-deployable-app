'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/lib/types'
import { CourseCard } from '@/components/CourseCard'
import { CourseForm } from '@/components/CourseForm'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getCourses } from '@/lib/deployment'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([])

  const fetchCourses = async () => {
    const fetchedCourses = await getCourses(true)

    // DEMO-ONLY: Inject fake status, URL, and PDF into all courses
    const demoInjectedCourses = fetchedCourses.map(course => {
      // Inject fake "in_progress" status if none exists (for demo consistency)
      if (!course.status && !course.config_file?.status) {
        course.status = 'in_progress'
      }

      // Inject demo URL and PDF if not present
      const existingDocs = course.config_file?.documents || []
      const hasFakeUrl = existingDocs.some(doc => doc.name === 'URL')
      const hasDemoPdf = existingDocs.some(doc => doc.name === 'Demo PDF.pdf')

      course.config_file.documents = [
        ...existingDocs,
        ...(!hasFakeUrl
          ? [{
              name: 'URL',
              address: 'https://lucylabs.gatech.edu/kbai/summer-2024/',
            }]
          : []),
        ...(!hasDemoPdf
          ? [{
              name: 'Demo PDF.pdf',
              address: 'https://demo-bucket.s3.amazonaws.com/documents/demo.pdf',
            }]
          : [])
      ]

      return course
    })

    setCourses(demoInjectedCourses)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="p-4 max-w-[85%] mx-auto flex-grow">
          <div className="flex flex-col space-y-8">
            <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-2">How This App Works</h2>
              <p className="text-gray-700 text-base leading-relaxed">
                This app helps you create and manage a <strong>Jill Watson Agent</strong> for your course.
                <br /><br />
                To get started, click the <strong>“Create Jill Watson Assistant”</strong> button and follow the steps to set up a new assistant for one of your courses.
                <br /><br />
                You will also find a list of your <strong>Previously Created Assistants</strong> below. 
                These are Jill Watson assistants that you’ve already set up for your courses. You can update or delete them as needed.
              </p>
            </div>

            <CourseForm onCourseCreated={fetchCourses} />

            <Card className="bg-gradient-to-br from-gray-100 via-gray-50 to-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Previously Created Assistants</CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <>
                    {/* Informational banner for in-progress status */}
                    {courses.some(course => course.status === 'in_progress') && (
                      <div className="mb-4 p-4 border-l-4 border-yellow-500 bg-yellow-50 text-yellow-800 text-sm rounded">
                        Creating a Jill Watson assistant can take a few minutes to several hours. Please check the status below later.
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {[...courses]
                        .sort((a, b) => {
                          const priority = { in_progress: 0, active: 1, inactive: 2 }
                          const getStatus = (course: Course) =>
                            course.status ||
                            course.config_file?.status ||
                            (course.active ? 'active' : 'inactive')

                          return priority[getStatus(a)] - priority[getStatus(b)]
                        })
                        .map(course => (
                          <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No deployments yet. Once created, they will appear here.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}