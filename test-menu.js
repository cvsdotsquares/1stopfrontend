// Simple test to verify menu API is working
import { cmsApi } from '../src/services/api';

async function testMenuAPI() {
  try {
    console.log('Testing menu API...');
    
    const completeMenu = await cmsApi.getCompleteMenu();
    console.log('✅ API Response received');
    
    console.log('Menu Structure:');
    console.log('- Main pages:', completeMenu.menuData.pages.length);
    console.log('- Footer pages:', completeMenu.menuData.footer_pages.length);  
    console.log('- Featured services:', completeMenu.menuData.featured_services.length);
    console.log('- CMS pages:', completeMenu.allPages.length);
    
    console.log('\nSample main pages:');
    completeMenu.menuData.pages.slice(0, 3).forEach(page => {
      console.log(`- ${page.link_title} (ID: ${page.id}, Weight: ${page.weight})`);
    });
    
    console.log('\n✅ Menu API working correctly!');
    
  } catch (error) {
    console.error('❌ Menu API test failed:', error);
  }
}

// Only run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testMenuAPI();
}

export { testMenuAPI };