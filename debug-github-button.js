// Debug script to test GitHub save button
// Open browser console and paste this script

console.log('🔍 GitHub Button Debug Test');
console.log('============================');

// Find the GitHub button
const githubButton = document.querySelector('button[title*="GitHub"], button[title*="Save to GitHub"]');

if (githubButton) {
    console.log('✅ GitHub button found:', githubButton);
    console.log('🎯 Button classes:', githubButton.className);
    console.log('🚫 Button disabled:', githubButton.disabled);
    console.log('📝 Button title:', githubButton.title);
    console.log('📍 Button position:', githubButton.getBoundingClientRect());
    
    // Test if button is clickable
    console.log('🖱️ Testing button click...');
    githubButton.click();
    
    // Add a test click listener
    githubButton.addEventListener('click', (e) => {
        console.log('🎉 Button click detected!', e);
    });
    
} else {
    console.log('❌ GitHub button not found in DOM');
    console.log('🔍 Looking for buttons with GitHub icon...');
    
    const allButtons = document.querySelectorAll('button');
    console.log('📋 All buttons found:', allButtons.length);
    
    allButtons.forEach((btn, index) => {
        if (btn.innerHTML.includes('FaGithub') || btn.title.toLowerCase().includes('github')) {
            console.log(`🎯 Potential GitHub button ${index}:`, btn);
        }
    });
}

// Check if React components are loaded
if (window.React) {
    console.log('⚛️ React is loaded');
} else {
    console.log('❌ React not found');
}

console.log('🏁 Debug test complete');
