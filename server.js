// This is a wrapper file for Hostinger to find the server entry point
// It simply runs the compiled backend from the server/dist folder.
import('./server/dist/index.js').catch(err => {
    console.error('Failed to start server from wrapper:', err);
    process.exit(1);
});
