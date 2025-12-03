'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingData {
  location: number;
  course: string;
  date: string;
  time: string;
  instructor?: number;
}

interface PersonalDetails {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  
  // License Information
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseCountry: string;
  
  // Emergency Contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  
  // Medical Information
  medicalConditions: string;
  medications: string;
  disabilities: string;
  
  // Additional Information
  previousExperience: string;
  hearAboutUs: string;
  additionalRequests: string;
  
  // Agreements
  termsAccepted: boolean;
  marketingConsent: boolean;
}

const initialFormData: PersonalDetails = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postcode: '',
  licenseNumber: '',
  licenseIssueDate: '',
  licenseExpiryDate: '',
  licenseCountry: 'UK',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  medicalConditions: '',
  medications: '',
  disabilities: '',
  previousExperience: '',
  hearAboutUs: '',
  additionalRequests: '',
  termsAccepted: false,
  marketingConsent: false
};

const locations = [
  { id: 1, name: 'East London Training Center' },
  { id: 2, name: 'North London Training Center' },
  { id: 3, name: 'Ilford Training Center' },
  { id: 4, name: 'Newham Training Center' },
];

const courses: Record<string, { name: string; price: number }> = {
  cbt: { name: 'CBT Training', price: 120 },
  das: { name: 'DAS Course (Complete)', price: 899 },
  module1: { name: 'Module 1 Training', price: 299 },
  module2: { name: 'Module 2 Training', price: 199 },
  'enhanced-rider': { name: 'Enhanced Rider Course', price: 149 }
};

export default function BookingStep3() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [formData, setFormData] = useState<PersonalDetails>(initialFormData);
  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedBookingData = sessionStorage.getItem('bookingData');
    if (storedBookingData) {
      setBookingData(JSON.parse(storedBookingData));
    } else {
      router.push('/bookings/step2');
    }
  }, [router]);

  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (section) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.postcode.trim()) newErrors.postcode = 'Postcode is required';
        break;

      case 2: // License Information
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.licenseIssueDate) newErrors.licenseIssueDate = 'License issue date is required';
        if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';
        break;

      case 3: // Emergency Contact
        if (!formData.emergencyName.trim()) newErrors.emergencyName = 'Emergency contact name is required';
        if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency contact phone is required';
        if (!formData.emergencyRelation.trim()) newErrors.emergencyRelation = 'Relationship is required';
        break;

      case 5: // Final validation
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PersonalDetails, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNextSection = () => {
    if (validateSection(currentSection)) {
      if (currentSection < 5) {
        setCurrentSection(prev => prev + 1);
      }
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleContinue = () => {
    if (validateSection(currentSection) && validateSection(5)) {
      // Store all booking and personal data
      const completeBookingData = {
        ...bookingData,
        personalDetails: formData
      };
      
      sessionStorage.setItem('completeBookingData', JSON.stringify(completeBookingData));
      router.push('/bookings/step4');
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const selectedLocation = locations.find(loc => loc.id === bookingData.location);
  const selectedCourse = courses[bookingData.course];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Choose Course</span>
              </div>
              <div className="w-16 h-1 bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Select Date & Location</span>
              </div>
              <div className="w-16 h-1 bg-blue-600"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Personal Details</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Personal Details</h1>
            <p className="text-gray-600 mt-1">Please provide your information for the booking</p>
          </div>

          <div className="p-6">
            {/* Section Navigation */}
            <div className="mb-8">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { num: 1, label: 'Personal' },
                  { num: 2, label: 'License' },
                  { num: 3, label: 'Emergency' },
                  { num: 4, label: 'Medical' },
                  { num: 5, label: 'Review' }
                ].map((section) => (
                  <button
                    key={section.num}
                    onClick={() => setCurrentSection(section.num)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentSection === section.num
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Personal Information */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.postcode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.postcode && <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: License Information */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">License Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country of Issue *
                    </label>
                    <select
                      value={formData.licenseCountry}
                      onChange={(e) => handleInputChange('licenseCountry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UK">United Kingdom</option>
                      <option value="EU">European Union</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={formData.licenseIssueDate}
                      onChange={(e) => handleInputChange('licenseIssueDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.licenseIssueDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.licenseIssueDate && <p className="text-red-500 text-sm mt-1">{errors.licenseIssueDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.licenseExpiryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.licenseExpiryDate && <p className="text-red-500 text-sm mt-1">{errors.licenseExpiryDate}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Emergency Contact */}
            {currentSection === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyName}
                      onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emergencyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.emergencyName && <p className="text-red-500 text-sm mt-1">{errors.emergencyName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.emergencyPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <select
                      value={formData.emergencyRelation}
                      onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emergencyRelation ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select relationship</option>
                      <option value="Parent">Parent</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Partner">Partner</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.emergencyRelation && <p className="text-red-500 text-sm mt-1">{errors.emergencyRelation}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Medical Information */}
            {currentSection === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Medical Information</h2>
                <p className="text-sm text-gray-600">
                  Please provide any relevant medical information that may affect your training.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions
                    </label>
                    <textarea
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      placeholder="Please list any medical conditions that may affect your ability to ride safely..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Medications
                    </label>
                    <textarea
                      value={formData.medications}
                      onChange={(e) => handleInputChange('medications', e.target.value)}
                      placeholder="Please list any medications you are currently taking..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disabilities or Special Requirements
                    </label>
                    <textarea
                      value={formData.disabilities}
                      onChange={(e) => handleInputChange('disabilities', e.target.value)}
                      placeholder="Please describe any disabilities or special requirements we should be aware of..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Riding Experience
                    </label>
                    <select
                      value={formData.previousExperience}
                      onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select your experience level</option>
                      <option value="none">No experience</option>
                      <option value="some">Some experience (casual riding)</option>
                      <option value="moderate">Moderate experience (regular riding)</option>
                      <option value="extensive">Extensive experience</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about us?
                    </label>
                    <select
                      value={formData.hearAboutUs}
                      onChange={(e) => handleInputChange('hearAboutUs', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Please select</option>
                      <option value="google">Google Search</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="friend">Friend/Family Recommendation</option>
                      <option value="online-review">Online Review</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Requests or Comments
                    </label>
                    <textarea
                      value={formData.additionalRequests}
                      onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
                      placeholder="Any additional requests or information we should know..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Review and Agreements */}
            {currentSection === 5 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Review Your Information</h2>
                
                {/* Booking Summary */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Course:</span>
                      <span className="ml-2 font-medium">{selectedCourse?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{selectedLocation?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">
                        {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">{bookingData.time}</span>
                    </div>
                  </div>
                  <div className="border-t border-blue-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">£{selectedCourse?.price}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Information Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2">{formData.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Emergency Contact:</span>
                      <span className="ml-2">{formData.emergencyName} ({formData.emergencyPhone})</span>
                    </div>
                  </div>
                </div>

                {/* Agreements */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <label className="text-sm text-gray-700">
                      I accept the{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                      . I understand the booking terms and cancellation policy. *
                    </label>
                  </div>
                  {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted}</p>}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <label className="text-sm text-gray-700">
                      I would like to receive marketing communications about offers, news and updates from 1Stop Instruction.
                      You can unsubscribe at any time.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Section Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {currentSection > 1 && (
                  <button
                    onClick={handlePreviousSection}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                <Link
                  href="/bookings/step2"
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Booking
                </Link>
              </div>

              <div>
                {currentSection < 5 ? (
                  <button
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next Section
                  </button>
                ) : (
                  <button
                    onClick={handleContinue}
                    disabled={!formData.termsAccepted}
                    className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                      formData.termsAccepted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}