import { STATUS_COLOR_MAP } from '../utils/constants';

const StatusBadge = ({ status }) => {
  const colorKey = STATUS_COLOR_MAP[status] || 'wishlist';

  return (
    <span
      className="status-badge"
      style={{
        color: `var(--status-${colorKey})`,
        background: `var(--status-${colorKey}-bg)`,
      }}
    >
      <span className="status-badge__dot" />
      {status}
    </span>
  );
};

export default StatusBadge;
