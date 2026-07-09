import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <h1>Page not found</h1>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: 360 }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
