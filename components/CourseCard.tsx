import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, PauseCircle } from 'lucide-react'
import { CourseCardProps } from '@/lib/types'

export function CourseCard({ course }: CourseCardProps) {
  const status =
    course.status ||                       // NEW top-level status
    course.config_file?.status ||          // fallback: nested status
    (course.active ? 'active' : 'inactive') || // fallback: legacy boolean
    'in_progress'                          // default fallback

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

            {status === 'in_progress' && (
              <div className="flex items-center text-yellow-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>In Progress</span>
              </div>
            )}

            {status === 'active' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Active</span>
              </div>
            )}

            {status === 'inactive' && (
              <div className="flex items-center text-gray-500">
                <PauseCircle className="w-4 h-4 mr-1" />
                <span>Inactive</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
