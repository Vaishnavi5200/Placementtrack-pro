import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApplications } from '../services/applicationService';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import {
  ACTIVE_STATUSES,
  STALE_APPLIED_THRESHOLD_DAYS,
} from '../utils/constants';
import { formatDate, formatDateTime, getFollowUpStatus, isStaleInStatus } from '../utils/dateUtils';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user } = useAuth();
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
        setError('Could not load your dashboard right now. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const counts = {
      active: 0,
      applied: 0,
      assessment: 0,
      interview: 0,
      offer: 0,
    };
    applications.forEach((app) => {
      if (ACTIVE_STATUSES.includes(app.status)) counts.active += 1;
      if (app.status === 'Applied') counts.applied += 1;
      if (app.status === 'Assessment') counts.assessment += 1;
      if (app.status === 'Interview') counts.interview += 1;
      if (app.status === 'Offer') counts.offer += 1;
    });
    return counts;
  }, [applications]);

  const conversionInsight = useMemo(() => {
    // Only show an insight once there's enough real data to be meaningful.
    const totalSubmitted = applications.filter((a) => a.status !== 'Wishlist').length;
    if (totalSubmitted < 5) return null;

    const interviewOrBetter = applications.filter((a) =>
      ['Interview', 'Offer'].includes(a.status)
    ).length;
    const rate = Math.round((interviewOrBetter / totalSubmitted) * 100);
    return `${rate}% of your submitted applications have reached interview stage or beyond.`;
  }, [applications]);

  const needsAttention = useMemo(() => {
    const items = [];
    applications.forEach((app) => {
      const followUp = getFollowUpStatus(app.nextFollowUpDate);
      if (followUp && (followUp.group === 'overdue' || followUp.group === 'today')) {
        items.push({ app, tag: followUp.group === 'overdue' ? 'overdue' : 'today', label: followUp.label });
      } else if (isStaleInStatus(app, 'Applied', STALE_APPLIED_THRESHOLD_DAYS)) {
        items.push({
          app,
          tag: 'stale',
          label: `In Applied for ${STALE_APPLIED_THRESHOLD_DAYS}+ days`,
        });
      }
    });
    // Overdue first, then due today, then stale.
    const order = { overdue: 0, today: 1, stale: 2 };
    return items.sort((a, b) => order[a.tag] - order[b.tag]).slice(0, 6);
  }, [applications]);

  const recentApplications = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [applications]
  );

  const recentActivity = useMemo(() => {
    const events = [];
    applications.forEach((app) => {
      (app.statusHistory || []).forEach((entry) => {
        events.push({
          id: `${app._id}-${entry.changedAt}-${entry.status}`,
          company: app.company,
          role: app.role,
          status: entry.status,
          changedAt: entry.changedAt,
          appId: app._id,
        });
      });
    });
    return events.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)).slice(0, 6);
  }, [applications]);

  if (loading) {
    return <LoadingSpinner fullPage label="Loading your dashboard..." />;
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>
            {getGreeting()}, {firstName}.
          </h1>
          <p>Here&apos;s where your applications stand.</p>
        </div>
        <Link to="/applications/new" className="btn btn-primary">
          + Add Application
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {applications.length === 0 ? (
        <EmptyState
          icon="＋"
          title="Your search starts here."
          description="Add your first opportunity and start building a clearer picture of your job search."
          actionLabel="Add Your First Application"
          onAction={() => (window.location.href = '/applications/new')}
        />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Active Applications" value={stats.active} accent />
            <StatCard label="Applied" value={stats.applied} />
            <StatCard label="Assessments" value={stats.assessment} />
            <StatCard label="Interviews" value={stats.interview} />
            <StatCard label="Offers" value={stats.offer} />
          </div>

          {conversionInsight && (
            <div className="alert alert-info">{conversionInsight}</div>
          )}

          <div className="dashboard-grid">
            <div className="card">
              <div className="section-title">
                <h2>Needs Your Attention</h2>
                <Link to="/follow-ups">View all follow-ups</Link>
              </div>
              {needsAttention.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  No follow-ups due today. Keep building your pipeline.
                </p>
              ) : (
                needsAttention.map(({ app, tag, label }) => (
                  <div className="attention-item" key={`${app._id}-${tag}`}>
                    <div className="attention-item__main">
                      <Link to={`/applications/${app._id}`} className="attention-item__company">
                        {app.company}
                      </Link>
                      <span className="attention-item__meta">{app.role}</span>
                    </div>
                    <span className={`attention-item__tag attention-item__tag--${tag}`}>{label}</span>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <div className="section-title">
                <h2>Recent Status Activity</h2>
              </div>
              {recentActivity.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  No activity yet.
                </p>
              ) : (
                recentActivity.map((event) => (
                  <div className="activity-item" key={event.id}>
                    <span className="activity-item__dot" />
                    <div>
                      <div className="activity-item__text">
                        <Link to={`/applications/${event.appId}`}>{event.company}</Link> moved to{' '}
                        <strong>{event.status}</strong>
                      </div>
                      <div className="activity-item__time">{formatDateTime(event.changedAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--space-5)' }}>
            <div className="section-title">
              <h2>Recent Applications</h2>
              <Link to="/applications">View all</Link>
            </div>
            <div className="applications-list">
              {recentApplications.map((app) => (
                <div className="attention-item" key={app._id}>
                  <div className="attention-item__main">
                    <Link to={`/applications/${app._id}`} className="attention-item__company">
                      {app.company}
                    </Link>
                    <span className="attention-item__meta">
                      {app.role} · Applied {formatDate(app.appliedDate)}
                    </span>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
