// Test API integration  
const { coursesApi } = require('./src/services/api.ts');

async function testAPI() {
  try {
    console.log('Testing featured courses API...');
    const featuredCourses = await coursesApi.getFeaturedCourses();
    console.log('Featured courses:', featuredCourses);
    console.log('First course:', featuredCourses[0]);
    
    if (Array.isArray(featuredCourses) && featuredCourses.length > 0) {
      console.log('✅ API integration working correctly!');
      console.log('Sample data:', {
        id: featuredCourses[0].id,
        name: featuredCourses[0].course_name,
        description: featuredCourses[0].description_preview?.substring(0, 100)
      });
    } else {
      console.log('❌ API returning unexpected format');
    }
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI();