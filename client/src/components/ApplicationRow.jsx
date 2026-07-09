import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';

// One row per application. On desktop this lays out as a table-like row;
// on mobile the CSS grid collapses to a single column so it reads as a card.
const ApplicationRow = ({ application, onDeleteClick }) => {
  return (
    <div className="app-row">
      <div className="app-row__primary">
        <Link to={`/applications/${application._id}`} className="app-row__company">
          {application.company}
        </Link>
        <span className="app-row__role">{application.role}</span>
      </div>

      <div className="app-row__field">
        <span className="app-row__field-label">Status</span>
        <StatusBadge status={application.status} />
      </div>

      <div className="app-row__field">
        <span className="app-row__field-label">Type</span>
        {application.type}
      </div>

      <div className="app-row__field">
        <span className="app-row__field-label">Work mode</span>
        {application.workMode}
      </div>

      <div className="app-row__field">
        <span className="app-row__field-label">Applied</span>
        {formatDate(application.appliedDate)}
      </div>

      <div className="app-row__actions">
        <Link to={`/applications/${application._id}`} className="btn btn-secondary btn-sm">
          View
        </Link>
        <Link to={`/applications/${application._id}/edit`} className="btn btn-secondary btn-sm">
          Edit
        </Link>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => onDeleteClick(application)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApplicationRow;
