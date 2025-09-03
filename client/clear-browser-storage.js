
// Browser storage clearing script - run this in browser console
console.log('Clearing browser storage...');

// Clear localStorage
localStorage.clear();
console.log('✅ Cleared localStorage');

// Clear sessionStorage
sessionStorage.clear();
console.log('✅ Cleared sessionStorage');

// Clear cookies
document.cookie.split(";").forEach(function(c) {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log('✅ Cleared cookies');

// Clear IndexedDB
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      indexedDB.deleteDatabase(db.name);
    });
  });
  console.log('✅ Cleared IndexedDB');
}

console.log('🎉 All browser storage cleared! Please refresh the page.');
