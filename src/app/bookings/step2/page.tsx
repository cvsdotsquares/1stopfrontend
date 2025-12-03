'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  includes: string[];
}

interface Instructor {
  id: number;
  name: string;
  qualifications: string[];
  rating: number;
  availability: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  instructorId?: number;
}

const locations: Location[] = [
  { id: 1, name: 'East London Training Center', address: 'Stratford, London E15', phone: '020 8123 4567' },
  { id: 2, name: 'North London Training Center', address: 'Tottenham, London N17', phone: '020 8765 4321' },
  { id: 3, name: 'Ilford Training Center', address: 'Ilford, Essex IG1', phone: '020 8111 2233' },
  { id: 4, name: 'Newham Training Center', address: 'Beckton, London E6', phone: '020 8444 5566' },
];

const courses: Record<string, Course> = {
  cbt: {
    id: 'cbt',
    name: 'CBT Training',
    description: 'Compulsory Basic Training - Your first step to motorcycle riding',
    duration: '6-8 hours',
    price: 120,
    includes: ['Theory session', 'Practical training', 'On-road riding', 'CBT certificate', 'All safety equipment']
  },
  das: {
    id: 'das',
    name: 'DAS Course (Complete)',
    description: 'Direct Access Scheme - Full motorcycle license training',
    duration: '5 days',
    price: 899,
    includes: ['Theory test training', 'Module 1 preparation', 'Module 2 preparation', 'Test fees', 'Bike and equipment']
  },
  module1: {
    id: 'module1',
    name: 'Module 1 Training',
    description: 'Off-road maneuvers and vehicle safety checks',
    duration: '2 days',
    price: 299,
    includes: ['Off-road maneuvers', 'Test preparation', 'Practice sessions', 'Bike and equipment']
  },
  module2: {
    id: 'module2',
    name: 'Module 2 Training',
    description: 'On-road practical test preparation',
    duration: '1 day',
    price: 199,
    includes: ['On-road training', 'Test routes', 'Independent riding', 'Final preparation']
  },
  'enhanced-rider': {
    id: 'enhanced-rider',
    name: 'Enhanced Rider Course',
    description: 'Advanced riding skills for experienced riders',
    duration: '1 day',
    price: 149,
    includes: ['Advanced techniques', 'Hazard awareness', 'Defensive riding', 'Certificate of completion']
  }
};

const instructors: Instructor[] = [
  {
    id: 1,
    name: 'Mark Thompson',
    qualifications: ['DVSA Approved', 'CBT Specialist', '15+ Years'],
    rating: 4.9,
    availability: ['weekdays', 'weekends']
  },
  {
    id: 2,
    name: 'Sarah Williams',
    qualifications: ['DVSA Approved', 'DAS Expert', 'Module Specialist'],
    rating: 4.8,
    availability: ['weekdays']
  },
  {
    id: 3,
    name: 'James Parker',
    qualifications: ['DVSA Approved', 'Enhanced Trainer', '10+ Years'],
    rating: 4.9,
    availability: ['weekends']
  }
];

// Generate available dates for the next 30 days
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip Sundays for most courses
    if (date.getDay() !== 0) {
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-GB', { weekday: 'long' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-GB', { month: 'short' }),
        available: Math.random() > 0.3 // Random availability for demo
      });
    }
  }
  
  return dates;
};

const timeSlots: TimeSlot[] = [
  { time: '8:00 AM', available: true, instructorId: 1 },
  { time: '9:00 AM', available: true, instructorId: 2 },
  { time: '10:00 AM', available: false },
  { time: '1:00 PM', available: true, instructorId: 1 },
  { time: '2:00 PM', available: true, instructorId: 3 }
];

export default function BookingStep2() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
  const [availableDates] = useState(generateAvailableDates());
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const courseParam = searchParams.get('course');
    const locationParam = searchParams.get('location');
    
    if (courseParam && courses[courseParam]) {
      setSelectedCourse(courseParam);
    }
    
    if (locationParam) {
      setSelectedLocation(parseInt(locationParam));
    }
  }, [searchParams]);

  const handleContinue = () => {
    if (!selectedLocation || !selectedCourse || !selectedDate || !selectedTime) {
      alert('Please complete all selections before continuing.');
      return;
    }

    const bookingData = {
      location: selectedLocation,
      course: selectedCourse,
      date: selectedDate,
      time: selectedTime,
      instructor: selectedInstructor
    };

    // Store booking data in sessionStorage for step 3
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    router.push('/bookings/step3');
  };

  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);
  const selectedCourseData = selectedCourse ? courses[selectedCourse] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Choose Course</span>
              </div>
              <div className="w-16 h-1 bg-blue-600"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Select Date & Location</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Personal Details</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Select Your Training Details</h1>
            <p className="text-gray-600 mt-1">Choose your course, location, date and time</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Course Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Choose Your Course</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(courses).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCourse === course.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <span className="text-lg font-bold text-blue-600">£{course.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Duration: {course.duration}</span>
                      {selectedCourse === course.id && (
                        <span className="text-sm text-blue-600 font-medium">✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            {selectedCourse && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Choose Training Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedLocation === location.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{location.name}</h3>
                        {selectedLocation === location.id && (
                          <span className="text-sm text-blue-600 font-medium">✓ Selected</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                      <p className="text-sm text-gray-500">{location.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date Selection */}
            {selectedLocation && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Choose Date</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {availableDates.slice(0, 14).map((dateObj) => (
                    <div
                      key={dateObj.date}
                      onClick={() => dateObj.available && setSelectedDate(dateObj.date)}
                      className={`p-3 text-center border rounded-lg cursor-pointer transition-all ${
                        !dateObj.available
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedDate === dateObj.date
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900'
                      }`}
                    >
                      <div className="text-sm font-medium">{dateObj.dayName}</div>
                      <div className="text-lg font-bold">{dateObj.dayNumber}</div>
                      <div className="text-xs text-gray-500">{dateObj.month}</div>
                      {!dateObj.available && (
                        <div className="text-xs text-red-500 mt-1">Unavailable</div>
                      )}
                    </div>
                  ))}
                </div>
                {availableDates.length > 14 && (
                  <button className="mt-4 text-blue-600 text-sm font-medium hover:underline">
                    Show more dates →
                  </button>
                )}
              </div>
            )}

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Choose Time</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      className={`p-3 text-center border rounded-lg cursor-pointer transition-all ${
                        !slot.available
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedTime === slot.time
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-900'
                      }`}
                    >
                      <div className="font-semibold">{slot.time}</div>
                      {slot.available && slot.instructorId && (
                        <div className="text-xs text-gray-500 mt-1">
                          {instructors.find(i => i.id === slot.instructorId)?.name}
                        </div>
                      )}
                      {!slot.available && (
                        <div className="text-xs text-red-500 mt-1">Booked</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor Selection (if time is selected) */}
            {selectedTime && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">5. Your Instructor</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(() => {
                    const timeSlot = timeSlots.find(slot => slot.time === selectedTime);
                    const instructor = instructors.find(i => i.id === timeSlot?.instructorId);
                    
                    if (instructor) {
                      setSelectedInstructor(instructor.id);
                      return (
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {instructor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>★ {instructor.rating}</span>
                              <span>•</span>
                              <span>{instructor.qualifications.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <p className="text-gray-600">Instructor will be assigned based on your selection.</p>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Booking Summary */}
            {selectedLocation && selectedCourse && selectedDate && selectedTime && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-medium">{selectedCourseData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{selectedLocationData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">£{selectedCourseData?.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <Link
              href="/bookings"
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Courses
            </Link>
            
            <button
              onClick={handleContinue}
              disabled={!selectedLocation || !selectedCourse || !selectedDate || !selectedTime}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                selectedLocation && selectedCourse && selectedDate && selectedTime
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Personal Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}