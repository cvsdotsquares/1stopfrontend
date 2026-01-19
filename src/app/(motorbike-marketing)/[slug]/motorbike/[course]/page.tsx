function formatCourse(course: string) {
  if (!course) return 'Course'
  return course.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatArea(area: string) {
  if (!area) return 'Area'
  return area.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function CoursePage({ params }: { params: { slug: string; course: string } }) {
  const { slug, course } = params
  return  (
    <>

   <div className="py-8 md:py-16">
            <div className="max-w-[1400px] mx-auto">
                        <div className="[&_h2]:text-black [&_h2]:mb-5 [&_h2]:text-3xl text-gray-500 [&_a]:underline [&_a:hover]:text-red-500 [&_div]:p-5 [&_div]:bg-blue-100  [&_div]:text-blue-600 [&_div]:border-l-2 [&_div]:border-blue-600">
                          <h2>What is Category B+E? </h2>
                          <p>Category B+E is for car drivers who would like to be able to tow a trailer with their car. With a Category B+E driving licence (car & trailer combination), you will be able to drive your car and tow a trailer with a maximum combined weight of up to 7 tonnes.</p>
                          <p>The B+E driving licence will allow you to drive up to a combined towing weight of 7 tonnes. Remember, the MAM of your trailer cannot exceed the MAM of the towing vehicle. In other words, the approved loaded weight of the trailer cannot exceed the approved loaded weight for the vehicle/car which is going to be towing the trailer.</p>
                          <div>
                            The maximum combined weight of 7 tonnes is on the assumption that you are driving a 3.5 tonne vehicle/car, with a 3.5 tonne trailer.
                          </div>
                        </div>
            </div>
   </div>
   <div className="bg-gray-100 py-8 md:py-16">
            <div className="max-w-[1400px] mx-auto">
                        <div className="[&_h2]:text-black [&_h2]:mb-5 [&_h2]:text-3xl text-gray-500 [&_a]:underline [&_a:hover]:text-red-500">
                          <h2>Who needs a B+E Licence? </h2>
                          <p>All drivers who passed their driving test <strong>on or after 1 January 1997 </strong>are required to pass an additional driving test in order to tow car and trailer combinations in excess of a certain weight.</p>
                          <p>The law currently allows drivers with Category B (car licence) to drive vehicles up to 3.5 tonnes MAM (maximum authorised mass) with up to 8 passenger seats.</p>
                          <p>However, drivers who passed their driving test before 1 January 1997, will have automatically been granted a B+E licence through grandfathering rights, and will therefore be able to continue to tow trailers until their current B+E licence expires.</p>
                        </div>
            </div>
   </div>
   <div className=" py-8 md:py-16">
      <div className="max-w-[1400px] mx-auto [&_h2]:text-black [&_h2]:mb-5 [&_h2]:text-3xl text-gray-500 [&_a]:underline [&_a:hover]:text-red-500">
        <h2>Course Options</h2>
        <div className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-6 [&_h4]:text-black [&_h4]:font-bold">
                  <h4>24 Hours - £1,150</h4>
                  <p>Aimed at people who have no previous experience towing trailers. Complete beginner course.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6 [&_h4]:text-black [&_h4]:font-bold">
                  <h4>20 Hours - £999</h4>
                  <p>For drivers with minimal towing experience. Comprehensive training package.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6 [&_h4]:text-black [&_h4]:font-bold">
                  <h4>16 Hours - £825</h4>
                  <p>Suitable for those with some informal towing experience.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6 [&_h4]:text-black [&_h4]:font-bold">
                  <h4>12 Hours - £650</h4>
                  <p>Ideal for those with regular towing experience.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6 [&_h4]:text-black [&_h4]:font-bold">
                  <h4>10 Hours - £595</h4>
                  <p>Perfect for experienced towers needing formal qualification. Only recommended for those with very good towing experience and exceptional reversing skills.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6 [&_h4]:text-black [&_h4]:font-bold">
                  <h4>Hourly Rate - £50 Per Hour</h4>
                  <p>Flexible pay-as-you-go option for custom training needs.</p>
              </div>
            </div>
        </div>
        <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-star w-5 h-5 text-amber-500 mr-2" aria-hidden="true">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
              </svg>
              Additional Fees &amp; Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">Hourly Rate</span>
                <span className="font-bold text-blue-900">£50 Per Hour</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">Module 3 Practical Re-sit</span>
                <span className="font-bold text-blue-900">£310</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">Weekends / Bank Holidays</span>
                <span className="font-bold text-blue-900">£10 Per Day Extra</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">Out of Hours Test Fee</span>
                <span className="font-bold text-blue-900">£30 Extra</span>
              </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 italic">* All courses INCLUDE training and practical test fees.</p>
        </div>
    </div>
  </div>
   </>
  )
}