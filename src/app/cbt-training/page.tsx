import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CBT Training Centers | Motorcycle Training Locations | 1Stop Instruction',
  description: 'Find CBT training centers across London. Professional motorcycle training at convenient locations with experienced DVSA approved instructors.',
  keywords: 'CBT training London, motorcycle CBT centers, compulsory basic training locations, motorcycle training near me',
};

export default function CBTTraining() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <nav className="text-sm text-blue-200 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span>CBT Training</span>
            </nav>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              CBT Training Centers
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Professional Compulsory Basic Training at convenient locations across London
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/bookings"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Book CBT Training
              </Link>
              <Link
                href="/all-locations"
                className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-center"
              >
                View All Locations
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* What is CBT Section */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is CBT Training?</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 mb-4">
                  Compulsory Basic Training (CBT) is the first step to legal motorcycle or scooter riding in the UK. 
                  It's not a test, but a course of instruction that covers the basics of safe motorcycling.
                </p>
                <p className="text-gray-600 mb-6">
                  Upon successful completion, you'll receive a CBT certificate that allows you to ride a motorcycle 
                  up to 125cc (or a scooter) on public roads for up to 2 years.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">CBT Requirements:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                    </svg>
                    Minimum age 16 years (moped) or 17 years (motorcycle)
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                    </svg>
                    Valid provisional driving license with motorcycle entitlement
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                    </svg>
                    No disqualifications or medical restrictions
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included in CBT?</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Introduction & Eyesight Check</h4>
                      <p className="text-sm text-gray-600">Legal requirements, eyesight test, and course overview</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Highway Code & Theory</h4>
                      <p className="text-sm text-gray-600">Road signs, rules, and motorcycle-specific theory</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Off-Road Training</h4>
                      <p className="text-sm text-gray-600">Basic controls, moving off, stopping, and maneuvering</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">On-Road Briefing</h4>
                      <p className="text-sm text-gray-600">Road positioning, hazards, and communication</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">5</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">On-Road Training</h4>
                      <p className="text-sm text-gray-600">Supervised riding on public roads (minimum 2 hours)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Training Locations */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our CBT Training Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* East London */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🏍️</div>
                  <h3 className="text-lg font-bold">East London</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">East London Training Center</h4>
                <p className="text-gray-600 text-sm mb-4">Stratford, London E15</p>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                  Modern facilities with dedicated off-road area
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CBT Course:</span>
                    <span className="font-semibold text-gray-900">£120</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-700">6-8 hours</span>
                  </div>
                </div>
                <Link
                  href="/cbt-training/east-london-training"
                  className="block w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  View Details & Book
                </Link>
              </div>
            </div>

            {/* North London */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🏍️</div>
                  <h3 className="text-lg font-bold">North London</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">North London Training Center</h4>
                <p className="text-gray-600 text-sm mb-4">Tottenham, London N17</p>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                  Excellent transport links and large training yard
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CBT Course:</span>
                    <span className="font-semibold text-gray-900">£120</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-700">6-8 hours</span>
                  </div>
                </div>
                <Link
                  href="/cbt-training/north-london-training"
                  className="block w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  View Details & Book
                </Link>
              </div>
            </div>

            {/* Ilford */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🏍️</div>
                  <h3 className="text-lg font-bold">Ilford</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Ilford Training Center</h4>
                <p className="text-gray-600 text-sm mb-4">Ilford, Essex IG1</p>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                  Specialized CBT center with modern training bikes
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CBT Course:</span>
                    <span className="font-semibold text-gray-900">£120</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-700">6-8 hours</span>
                  </div>
                </div>
                <Link
                  href="/cbt-training/ilford-training"
                  className="block w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-center"
                >
                  View Details & Book
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose 1Stop Instruction for CBT?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1M19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5M19 21H8V7H19V21Z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">DVSA Approved</h3>
                <p className="text-sm text-gray-600">All our instructors are fully qualified and DVSA approved</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">High Success Rate</h3>
                <p className="text-sm text-gray-600">Over 95% of our students successfully complete their CBT</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Multiple Locations</h3>
                <p className="text-sm text-gray-600">Convenient locations across London and Essex</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6L9 17L4 12L5.41 10.59L9 14.17L18.59 4.59L20 6Z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">All Equipment Included</h3>
                <p className="text-sm text-gray-600">Helmets, gloves, jackets, and training bikes provided</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How long does CBT take?</h3>
                  <p className="text-gray-600 text-sm">CBT typically takes 6-8 hours, but there's no time limit. We ensure you're fully competent before issuing your certificate.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do I need my own equipment?</h3>
                  <p className="text-gray-600 text-sm">No, we provide all safety equipment including helmets, gloves, high-vis jackets, and training motorcycles.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I fail CBT?</h3>
                  <p className="text-gray-600 text-sm">CBT is training, not a test. However, if you don't demonstrate safe riding competence, additional training may be required.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How long is CBT valid for?</h3>
                  <p className="text-gray-600 text-sm">CBT certificates are valid for 2 years. You can renew with another CBT course or progress to a full motorcycle license.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What bikes can I ride after CBT?</h3>
                  <p className="text-gray-600 text-sm">With a CBT certificate, you can ride motorcycles up to 125cc with a maximum power of 11kW (about 14.6bhp).</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I carry a passenger?</h3>
                  <p className="text-gray-600 text-sm">No, CBT certificate holders cannot carry passengers. You need a full motorcycle license to carry a passenger.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your CBT?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Book your CBT training today and start riding legally on the roads
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bookings"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Book CBT Now - £120
            </Link>
            <Link
              href="/contactus.php"
              className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}