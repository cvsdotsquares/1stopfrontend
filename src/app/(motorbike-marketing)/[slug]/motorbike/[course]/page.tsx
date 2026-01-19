function formatCourse(course: string) {
  if (!course) return 'Course'
  return course.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatArea(area: string) {
  if (!area) return 'Area'
  return area.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function CoursePage({ params }) {
  const { slug, course } = params
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{formatCourse(course)} in {formatArea(slug)}</h1>
      <div className="prose max-w-none">
        <p>Welcome to our {formatCourse(course)} course in {formatArea(slug)}.</p>
        <p>This page is currently under development.</p>
      </div>
    </div>
  )
}