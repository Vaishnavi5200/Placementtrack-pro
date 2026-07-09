import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { formatDate } from '../utils/dateUtils';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>Profile</h1>
          <p>Your account details.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Logo />
        </div>

        <div className="detail-field">
          <span className="detail-field__label">Name</span>
          <span className="detail-field__value">{user?.name}</span>
        </div>
        <div className="detail-field">
          <span className="detail-field__label">Email</span>
          <span className="detail-field__value">{user?.email}</span>
        </div>
        {user?.createdAt && (
          <div className="detail-field">
            <span className="detail-field__label">Member Since</span>
            <span className="detail-field__value">{formatDate(user.createdAt)}</span>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
