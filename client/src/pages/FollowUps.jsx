import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApplications } from '../services/applicationService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate, getFollowUpStatus } from '../utils/dateUtils';

const GROUP_CONFIG = {
  overdue: { title: 'Overdue', tagClass: 'overdue' },
  today: { title: 'Due Today', tagClass: 'today' },
  upcoming: { title: 'Upcoming', tagClass: 'stale' },
};

const FollowUps = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (err) {
        setError('Could not load your follow-ups. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const groups = useMemo(() => {
    const result = { overdue: [], today: [], upcoming: [] };
    applications.forEach((app) => {
      const followUp = getFollowUpStatus(app.nextFollowUpDate);
      if (!followUp) return;
      result[followUp.group].push({ app, label: followUp.label });
    });
    // Within "upcoming", soonest first.
    result.upcoming.sort(
      (a, b) => new Date(a.app.nextFollowUpDate) - new Date(b.app.nextFollowUpDate)
    );
    result.overdue.sort(
      (a, b) => new Date(a.app.nextFollowUpDate) - new Date(b.app.nextFollowUpDate)
    );
    return result;
  }, [applications]);

  const totalWithFollowUps = groups.overdue.length + groups.today.length + groups.upcoming.length;

  if (loading) return <LoadingSpinner fullPage label="Loading follow-ups..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>Follow-ups</h1>
          <p>Stay on top of applications that need a check-in.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {totalWithFollowUps === 0 ? (
        <EmptyState
          icon="✓"
          title="No follow-ups due today. Keep building your pipeline."
          description="Set a next follow-up date on any application to see it appear here."
          actionLabel="Go to Applications"
          onAction={() => (window.location.href = '/applications')}
        />
      ) : (
        ['overdue', 'today', 'upcoming'].map((groupKey) => {
          const items = groups[groupKey];
          if (items.length === 0) return null;
          const { title, tagClass } = GROUP_CONFIG[groupKey];

          return (
            <div className="card" key={groupKey} style={{ marginBottom: 'var(--space-5)' }}>
              <div className="section-title">
                <h2>
                  {title} ({items.length})
                </h2>
              </div>
              {items.map(({ app, label }) => (
                <div className="attention-item" key={app._id}>
                  <div className="attention-item__main">
                    <Link to={`/applications/${app._id}`} className="attention-item__company">
                      {app.company}
                    </Link>
                    <span className="attention-item__meta">
                      {app.role} · Follow-up: {formatDate(app.nextFollowUpDate)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <StatusBadge status={app.status} />
                    <span className={`attention-item__tag attention-item__tag--${tagClass}`}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
};

export default FollowUps;
