import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProblems, deleteProblem } from '../services/dsaService';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

const DSA_PLATFORMS = ['LeetCode', 'HackerRank', 'GeeksforGeeks', 'Codeforces', 'InterviewBit', 'Other'];
const DSA_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DSA_STATUSES = ['Todo', 'Attempted', 'Solved', 'Needs Review'];

const DIFFICULTY_COLORS = {
  Easy: { color: 'var(--color-success)', bg: 'var(--color-success-soft)' },
  Medium: { color: 'var(--color-warning)', bg: 'var(--color-warning-soft)' },
  Hard: { color: 'var(--color-danger)', bg: 'var(--color-danger-soft)' },
};

const STATUS_COLORS = {
  Todo: { color: 'var(--color-text-muted)', bg: '#efece6' },
  Attempted: { color: 'var(--color-info)', bg: 'var(--color-info-soft)' },
  Solved: { color: 'var(--color-success)', bg: 'var(--color-success-soft)' },
  'Needs Review': { color: '#6a4c93', bg: '#f0eaf7' },
};

const emptyFilters = { search: '', status: '', difficulty: '', platform: '', topic: '' };

const DsaTracker = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({
    totalProblems: 0,
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
  const [problemPendingDelete, setProblemPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasAnyProblems, setHasAnyProblems] = useState(true);

  const loadProblems = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const response = await getProblems(activeFilters);
      setProblems(response.data);
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      setError('Could not load DSA problems. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has any problems logged at all on component mount
  useEffect(() => {
    const checkAny = async () => {
      try {
        const response = await getProblems();
        setHasAnyProblems(response.data.length > 0);
      } catch (err) {
        // Non-fatal
      }
    };
    checkAny();
  }, []);

  // Debounced load when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProblems(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, loadProblems]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleResetFilters = () => setFilters(emptyFilters);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const handleConfirmDelete = async () => {
    if (!problemPendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteProblem(problemPendingDelete._id);
      setProblems((prev) => prev.filter((p) => p._id !== problemPendingDelete._id));
      
      // Reload stats and problem list
      const response = await getProblems(filters);
      if (response.stats) {
        setStats(response.stats);
      }
      setProblemPendingDelete(null);
    } catch (err) {
      setError('Could not delete this problem. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const styling = DIFFICULTY_COLORS[difficulty] || { color: 'var(--color-text)', bg: 'var(--color-bg)' };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: styling.color,
          backgroundColor: styling.bg,
        }}
      >
        {difficulty}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styling = STATUS_COLORS[status] || { color: 'var(--color-text)', bg: 'var(--color-bg)' };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: styling.color,
          backgroundColor: styling.bg,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>DSA Problems Tracker</h1>
          <p>Log, structure, and revise your algorithm solutions.</p>
        </div>
        <Link to="/dsa/new" className="btn btn-primary">
          + Add Problem
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Metrics Section */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 'var(--space-6)' }}>
        <StatCard label="Total Problems" value={stats.totalProblems} />
        <StatCard label="Total Solved" value={stats.totalSolved} accent />
        <StatCard label="Easy" value={stats.easy} />
        <StatCard label="Medium" value={stats.medium} />
        <StatCard label="Hard" value={stats.hard} />
        <StatCard label="Current Streak" value={`${stats.streak} Days 🔥`} />
      </div>

      {hasAnyProblems && (
        <div className="toolbar">
          <input
            type="text"
            className="form-input toolbar__search"
            placeholder="Search by title or topic..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <div className="toolbar__filters">
            <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
              <option value="">All statuses</option>
              {DSA_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select name="difficulty" className="form-select" value={filters.difficulty} onChange={handleFilterChange}>
              <option value="">All difficulties</option>
              {DSA_DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select name="platform" className="form-select" value={filters.platform} onChange={handleFilterChange}>
              <option value="">All platforms</option>
              {DSA_PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              type="text"
              name="topic"
              className="form-input"
              placeholder="Filter by topic (e.g. Arrays)"
              value={filters.topic}
              onChange={handleFilterChange}
              style={{ width: '160px' }}
            />
            {hasActiveFilters && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleResetFilters}>
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading problems..." />
      ) : problems.length === 0 ? (
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
            title="No problems logged yet."
            description="Add your first DSA practice problem to start building your daily solve streak."
            actionLabel="Add Your First Problem"
            onAction={() => navigate('/dsa/new')}
          />
        )
      ) : (
        <div className="applications-list">
          {problems.map((problem) => (
            <div className="app-row" key={problem._id}>
              <div className="app-row__primary" style={{ flex: '2 1 0%' }}>
                {problem.problemUrl ? (
                  <a
                    href={problem.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-row__company"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {problem.title} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-faint)' }}>↗</span>
                  </a>
                ) : (
                  <span className="app-row__company">{problem.title}</span>
                )}
                <span className="app-row__role">{problem.topic}</span>
              </div>

              <div className="app-row__field">
                <span className="app-row__field-label">Platform</span>
                {problem.platform}
              </div>

              <div className="app-row__field">
                <span className="app-row__field-label">Difficulty</span>
                {getDifficultyBadge(problem.difficulty)}
              </div>

              <div className="app-row__field">
                <span className="app-row__field-label">Status</span>
                {getStatusBadge(problem.status)}
              </div>

              <div className="app-row__field">
                <span className="app-row__field-label">Revisions</span>
                {problem.revisionCount} {problem.revisionCount === 1 ? 'time' : 'times'}
              </div>

              <div className="app-row__actions">
                <Link to={`/dsa/${problem._id}/edit`} className="btn btn-secondary btn-sm">
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setProblemPendingDelete(problem)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {problemPendingDelete && (
        <ConfirmDialog
          title="Delete this problem log?"
          message={`This will permanently remove the logged problem "${problemPendingDelete.title}" from your history. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setProblemPendingDelete(null)}
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
};

export default DsaTracker;
