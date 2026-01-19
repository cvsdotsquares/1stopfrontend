// Simple placeholder components
function Hero() {
  return (
    <div className="bg-blue-600 text-white py-16 text-center">
      <h1 className="text-4xl font-bold">Motorbike Training</h1>
    </div>
  )
}

function USPBar() {
  return (
    <div className="bg-gray-100 py-8 text-center">
      <p>Professional • Qualified • Trusted</p>
    </div>
  )
}

function FAQ() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <p className="text-center">FAQ content coming soon...</p>
      </div>
    </div>
  )
}

function CTA() {
  return (
    <div className="bg-red-600 text-white py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
      <button className="bg-white text-red-600 px-8 py-3 rounded font-semibold">
        Book Now
      </button>
    </div>
  )
}

export default function MotorbikeLayout({ children }) {
  return (
    <>
      <Hero />
      <USPBar />
      <main className="course-content">{children}</main>
      <FAQ />
      <CTA />
    </>
  )
}
