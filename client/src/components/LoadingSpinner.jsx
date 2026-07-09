const LoadingSpinner = ({ label = 'Loading...', fullPage = false }) => {
  return (
    <div className={`loading-state ${fullPage ? 'page-loading' : ''}`}>
      <span className="spinner" role="status" aria-label="Loading" />
      <span>{label}</span>
    </div>
  );
};

export default LoadingSpinner;
