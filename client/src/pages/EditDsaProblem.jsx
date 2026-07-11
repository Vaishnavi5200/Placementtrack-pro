import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import DsaForm from '../components/DsaForm';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getProblemById, updateProblem } from '../services/dsaService';

const EditDsaProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await getProblemById(id);
        setProblem(data);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (payload) => {
    await updateProblem(id, payload);
    navigate('/dsa');
  };

  if (loading) return <LoadingSpinner fullPage label="Loading problem..." />;

  if (notFound) {
    return (
      <div className="page-container">
        <EmptyState
          icon="!"
          title="Problem not found"
          description="This DSA problem record may have been deleted, or the link is incorrect."
          actionLabel="Back to DSA Tracker"
          onAction={() => navigate('/dsa')}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>Edit DSA Problem</h1>
          <p>
            Updating <strong>{problem.title}</strong>
          </p>
        </div>
        <Link to="/dsa" className="btn btn-secondary">
          Back to List
        </Link>
      </div>

      <div className="card">
        <DsaForm
          initialProblem={problem}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          onCancel={() => navigate('/dsa')}
        />
      </div>
    </div>
  );
};

export default EditDsaProblem;
