import { formatDate } from '../utils/dateUtils';

const StatusTimeline = ({ statusHistory = [] }) => {
  if (!statusHistory.length) {
    return <p className="form-hint">No status history yet.</p>;
  }

  return (
    <div className="timeline">
      {statusHistory.map((entry, index) => (
        <div className="timeline-item" key={`${entry.status}-${entry.changedAt}-${index}`}>
          <div className="timeline-item__marker">
            <span className="timeline-item__dot" />
            {index < statusHistory.length - 1 && <span className="timeline-item__line" />}
          </div>
          <div className="timeline-item__content">
            <div className="timeline-item__status">{entry.status}</div>
            <div className="timeline-item__date">{formatDate(entry.changedAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusTimeline;
