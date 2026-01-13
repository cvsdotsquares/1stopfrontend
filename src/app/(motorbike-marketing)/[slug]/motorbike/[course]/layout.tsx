// Simple placeholder components
function Hero() {
  return (
     <div className="bg-white relative h-[400px] md:h-[548px] flex items-center from-blue-600 to-blue-800 text-white"> 
          <div className="z-0 absolute inset-0 transition-opacity bg-black duration-1000 opacity-50"></div>       
          <div className="z-10 w-11/12 sm:max-w-[562px] ml-auto mb-2 bg-white/70 py-6 px-4  md:px-10 md:py-7 text-center radius20-left radius20-left-bottom text-center">
            <div className="text26 text-xl font-semibold text-red-600">
              Our Next Available CBT Course Is TOMORROW
            </div>            
            <div className="text-center">
              <a 
                href="/bookings"
                className="mt-3 radius20-left radius20-right-bottom inline-block bg-red-600 px-10 py-3 text-base md:text-2xl text-white hover:bg-red-700"
              >
                Book Now!
              </a>             
            </div>
          </div>        
      </div>
  )
}

function USPBar() {
  return (
    <div className="text-center">
      
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
