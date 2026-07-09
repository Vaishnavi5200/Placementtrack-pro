import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getApplicationById, updateApplication } from '../services/applicationService';

const EditApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await getApplicationById(id);
        setApplication(data);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (payload) => {
    await updateApplication(id, payload);
    navigate(`/applications/${id}`);
  };

  if (loading) return <LoadingSpinner fullPage label="Loading application..." />;

  if (notFound) {
    return (
      <div className="page-container">
        <EmptyState
          icon="!"
          title="Application not found"
          description="This application may have been deleted, or the link is incorrect."
          actionLabel="Back to Applications"
          onAction={() => navigate('/applications')}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>Edit Application</h1>
          <p>
            Updating <strong>{application.role}</strong> at <strong>{application.company}</strong>
          </p>
        </div>
        <Link to={`/applications/${id}`} className="btn btn-secondary">
          Back to Details
        </Link>
      </div>

      <div className="card">
        <ApplicationForm
          initialApplication={application}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          onCancel={() => navigate(`/applications/${id}`)}
        />
      </div>
    </div>
  );
};

export default EditApplication;
