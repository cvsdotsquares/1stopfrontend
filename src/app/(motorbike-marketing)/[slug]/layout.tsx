// app/(motorbike-marketing)/[area]/motorbike/[course]/layout.tsx
export default function MotorbikeLayout({ children }) {
  return (
    <>
      <div className="bg-blue-600 text-white py-6 px-4 text-center">Test</div>
      <main className="course-content">{children}</main>
      <div className="bg-blue-600 text-white py-6 px-4 text-center">Test</div>
    </>
  )
}
