import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApplicationById, deleteApplication } from '../services/applicationService';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, getFollowUpStatus } from '../utils/dateUtils';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteApplication(id);
      navigate('/applications');
    } catch (err) {
      setError('Could not delete this application. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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

  const followUp = getFollowUpStatus(application.nextFollowUpDate);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>{application.role}</h1>
          <p>{application.company}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to={`/applications/${id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button type="button" className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="details-grid">
        <div className="card">
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <StatusBadge status={application.status} />
          </div>

          <div className="form-grid">
            <div className="detail-field">
              <span className="detail-field__label">Company</span>
              <span className="detail-field__value">{application.company}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field__label">Role</span>
              <span className="detail-field__value">{application.role}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field__label">Type</span>
              <span className="detail-field__value">{application.type}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field__label">Work Mode</span>
              <span className="detail-field__value">{application.workMode}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field__label">Location</span>
              <span className="detail-field__value">{application.location || 'Not specified'}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field__label">Source</span>
              <span className="detail-field__value">{application.source}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field__label">Applied Date</span>
              <span className="detail-field__value">{formatDate(application.appliedDate)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field__label">Next Follow-up</span>
              <span className="detail-field__value">
                {application.nextFollowUpDate ? (
                  <>
                    {formatDate(application.nextFollowUpDate)}
                    {followUp && (
                      <span
                        className={`attention-item__tag attention-item__tag--${
                          followUp.group === 'overdue' ? 'overdue' : followUp.group === 'today' ? 'today' : 'stale'
                        }`}
                        style={{ marginLeft: 'var(--space-2)' }}
                      >
                        {followUp.label}
                      </span>
                    )}
                  </>
                ) : (
                  'Not set'
                )}
              </span>
            </div>
            {application.applicationUrl && (
              <div className="detail-field form-field--full">
                <span className="detail-field__label">Original Application Link</span>
                <a href={application.applicationUrl} target="_blank" rel="noopener noreferrer">
                  {application.applicationUrl}
                </a>
              </div>
            )}
          </div>

          {application.notes && (
            <div className="detail-field" style={{ marginTop: 'var(--space-2)' }}>
              <span className="detail-field__label">Notes</span>
              <p className="detail-notes">{application.notes}</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Status Timeline</h2>
          </div>
          <StatusTimeline statusHistory={application.statusHistory} />
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete this application?"
          message={`This will permanently remove your ${application.role} application at ${application.company}. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
};

export default ApplicationDetails;
