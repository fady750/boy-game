export const handleExitSite = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '/';
  }
};

// The static game header is authored in index.html, so expose the same handler
// for its inline button while React controls use the module export directly.
if (typeof window !== 'undefined') {
  window.handleExitSite = handleExitSite;
}
