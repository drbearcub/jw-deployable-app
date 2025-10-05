import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { CourseCardProps } from '@/lib/types'

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/dashboard/${course._id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold mb-1">
            {course.config_file.course_name}
          </CardTitle>
          <div className="text-sm text-gray-600">
            {course.config_file.metadata.term}
          </div>
          <div className="text-sm text-gray-600">
            {course.config_file.metadata.number}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mt-2">
            <span className="text-sm mr-2">Status:</span>
            {course.active ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Active</span>
              </div>
            ) : (
              <span className="text-gray-500">Inactive</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}