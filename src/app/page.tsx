'use client';

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TestimonialsCarousel from '@/components/testimonials';
import Link from 'next/link';
import { MapPin, Clock, Users, Star } from 'lucide-react';

export default function Home() {
  // Fetch homepage data
  const { data: featuredCourses } = useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: () => coursesApi.getFeaturedCourses(),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section - Exact XD Design */}
      <section className="relative h-[600px] bg-cover bg-center bg-no-repeat" 
               style={{ 
                 backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')" 
               }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Right side panels */}
        <div className="absolute right-8 top-8 w-80 space-y-4">
          {/* Top panel - CBT Course Available */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg">
            <h3 className="text-red-500 text-lg font-bold mb-4">
              Our Next Available CBT Course Is<br />
              <span className="text-2xl">TOMORROW</span>
            </h3>
            <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-md">
              Book Now!
            </Button>
          </div>
          
          {/* Postcode search */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h4 className="text-gray-700 font-semibold mb-3">Find your training</h4>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter a postcode" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10"
              />
              <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Bottom panel - Summer Special */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Summer Special</h3>
            <p className="text-lg mb-1">Get Your CBT For Only <span className="font-bold">£189</span></p>
            <p className="text-sm mb-4">Use Promo Code <span className="font-bold">SUMMER10</span></p>
            <div className="space-y-2">
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                Book Online Now
              </Button>
              <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-purple-700">
                Find a CBT Training
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-red-500">CBT Test</span> Training In London & All Other <span className="text-red-500">Motorbike</span> Training In London
            </h1>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose 1Stop Instruction?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're London's leading motorcycle training school with over 15 years of experience 
              and thousands of successful students
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Instructors</h3>
              <p className="text-gray-600">DVSA approved instructors with 98% pass rate and years of experience</p>
            </div>
            
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">8 Locations</h3>
              <p className="text-gray-600">Training centers across East & North London for your convenience</p>
            </div>
            
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">7 Days a Week</h3>
              <p className="text-gray-600">Flexible scheduling with courses available every day including weekends</p>
            </div>
            
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Top Rated</h3>
              <p className="text-gray-600">5-star rating from thousands of satisfied students across London</p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Trusted by London Riders</h3>
              <p className="text-gray-600">Join thousands of successful riders who started their journey with us</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">15,000+</div>
                <div className="text-sm text-gray-600">Students Trained</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                <div className="text-sm text-gray-600">Pass Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">5⭐</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Popular Training Courses</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From CBT to full motorcycle licence - we have the perfect course for every rider. 
              All courses include expert instruction and certification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses ? featuredCourses.map((course, index) => (
              <Card key={course.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:transform hover:scale-105 bg-white">
                {/* Course Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    index === 0 ? 'bg-orange-100 text-orange-600' : 
                    index === 1 ? 'bg-blue-100 text-blue-600' : 
                    'bg-green-100 text-green-600'
                  }`}>
                    {index === 0 ? 'Most Popular' : index === 1 ? 'Beginner Friendly' : 'Advanced'}
                  </span>
                </div>
                
                {/* Course Header with Gradient */}
                <div className={`h-32 rounded-t-lg relative overflow-hidden ${
                  index === 0 ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 
                  index === 1 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                  'bg-gradient-to-br from-green-500 to-green-600'
                }`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{course.course_name}</h3>
                    <p className="text-sm opacity-90">{course.course_abb}</p>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {course.description_preview?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                  </p>
                  
                  {/* Course Features */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      DVSA Approved Training
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Max {course.default_booking_limit} Students per Course
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Certificate Included
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-3xl font-bold text-gray-900">£{course.dsa_fees}</span>
                      <span className="text-gray-500 ml-2">per person</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Starting from</div>
                      <div className="text-green-600 font-semibold">Same Day Booking</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button asChild className="w-full group-hover:bg-blue-700 transition-colors">
                      <Link href={`/courses/${course.id}`}>
                        Learn More & Book
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/booking?course=${course.id}`}>Quick Book Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              // Enhanced loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-lg">
                  <div className="h-32 bg-gray-300 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="h-10 bg-gray-300 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {/* View All Courses CTA */}
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-2 hover:bg-blue-600 hover:text-white">
              <Link href="/courses">
                View All Training Courses
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Component */}
      <TestimonialsCarousel limit={13} />

      {/* Enhanced CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/api/placeholder/1200/600')] bg-cover bg-center"></div>
        </div>
        <div className="absolute inset-0 bg-blue-900/80"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Start Your 
              <span className="text-orange-400"> Motorcycle Journey?</span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed">
              Join thousands of satisfied students who've mastered the roads with our expert training. 
              Book today and get on the road sooner with our proven methods.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link href="/booking">
                  Book CBT from £99
                  <span className="ml-2">🏍️</span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 text-lg px-8 py-4 rounded-full transition-all">
                <Link href="/contact">Get Free Advice</Link>
              </Button>
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="font-semibold mb-2">Call Us Now</h3>
                <p className="text-blue-200">020 7946 0758</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-blue-200">info@1stopinstruction.co.uk</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="font-semibold mb-2">Visit Us</h3>
                <p className="text-blue-200">8 Locations across London</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
