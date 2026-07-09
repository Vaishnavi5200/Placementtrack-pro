import { useNavigate } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import { createApplication } from '../services/applicationService';

const AddApplication = () => {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    const created = await createApplication(payload);
    navigate(`/applications/${created._id}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>Add Application</h1>
          <p>Track a new opportunity you&apos;re pursuing.</p>
        </div>
      </div>

      <div className="card">
        <ApplicationForm
          onSubmit={handleSubmit}
          submitLabel="Add Application"
          onCancel={() => navigate('/applications')}
        />
      </div>
    </div>
  );
};

export default AddApplication;
