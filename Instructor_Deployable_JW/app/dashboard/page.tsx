'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/lib/types'
import { CourseCard } from '@/components/CourseCard'
import { CourseForm } from '@/components/CourseForm'
import { Header } from '@/components/Header'
import { getCourses } from '@/lib/deployment'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
    const fetchedCourses = await getCourses(true)
    setCourses(fetchedCourses)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="p-4 max-w-[85%] mx-auto flex-grow">
          <div className="flex justify-center items-center mb-6">
            <h1 className="text-3xl font-bold">Course Management</h1>
          </div>
          <div className='flex flex-col space-y-8'>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
            <CourseForm onCourseCreated={fetchCourses} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
