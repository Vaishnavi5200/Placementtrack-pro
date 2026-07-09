import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApplications, deleteApplication } from '../services/applicationService';
import ApplicationRow from '../components/ApplicationRow';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  APPLICATION_TYPES,
  APPLICATION_STATUSES,
  WORK_MODES,
  APPLICATION_SOURCES,
} from '../utils/constants';

const emptyFilters = { search: '', status: '', type: '', workMode: '', source: '' };

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
  const [applicationPendingDelete, setApplicationPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasAnyApplications, setHasAnyApplications] = useState(true);

  const loadApplications = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await getApplications(activeFilters);
      setApplications(data);
    } catch (err) {
      setError('Could not load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load once, unfiltered, to know whether the user has any applications at all
  // (so we can tell "no applications yet" apart from "no results match your filters").
  useEffect(() => {
    const checkAny = async () => {
      try {
        const all = await getApplications();
        setHasAnyApplications(all.length > 0);
      } catch (err) {
        // non-fatal; the main load below will surface any real error
      }
    };
    checkAny();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApplications(filters);
    }, 300); // debounce search input
    return () => clearTimeout(timer);
  }, [filters, loadApplications]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleResetFilters = () => setFilters(emptyFilters);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const handleConfirmDelete = async () => {
    if (!applicationPendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteApplication(applicationPendingDelete._id);
      setApplications((prev) => prev.filter((a) => a._id !== applicationPendingDelete._id));
      setApplicationPendingDelete(null);
    } catch (err) {
      setError('Could not delete this application. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>Applications</h1>
          <p>Every opportunity you&apos;re tracking, in one place.</p>
        </div>
        <Link to="/applications/new" className="btn btn-primary">
          + Add Application
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {hasAnyApplications && (
        <div className="toolbar">
          <input
            type="text"
            className="form-input toolbar__search"
            placeholder="Search by company or role..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <div className="toolbar__filters">
            <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
              <option value="">All statuses</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select name="type" className="form-select" value={filters.type} onChange={handleFilterChange}>
              <option value="">All types</option>
              {APPLICATION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select name="workMode" className="form-select" value={filters.workMode} onChange={handleFilterChange}>
              <option value="">All work modes</option>
              {WORK_MODES.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <select name="source" className="form-select" value={filters.source} onChange={handleFilterChange}>
              <option value="">All sources</option>
              {APPLICATION_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleResetFilters}>
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading applications..." />
      ) : applications.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon="🔍"
            title="No matches found"
            description="Try adjusting your search or filters to see more results."
            actionLabel="Reset filters"
            onAction={handleResetFilters}
          />
        ) : (
          <EmptyState
            icon="＋"
            title="Your search starts here."
            description="Add your first opportunity and start building a clearer picture of your job search."
            actionLabel="Add Your First Application"
            onAction={() => (window.location.href = '/applications/new')}
          />
        )
      ) : (
        <div className="applications-list">
          {applications.map((app) => (
            <ApplicationRow key={app._id} application={app} onDeleteClick={setApplicationPendingDelete} />
          ))}
        </div>
      )}

      {applicationPendingDelete && (
        <ConfirmDialog
          title="Delete this application?"
          message={`This will permanently remove your ${applicationPendingDelete.role} application at ${applicationPendingDelete.company}. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setApplicationPendingDelete(null)}
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
};

export default Applications;
