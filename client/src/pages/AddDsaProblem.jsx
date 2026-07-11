import { useNavigate } from 'react-router-dom';
import DsaForm from '../components/DsaForm';
import { createProblem } from '../services/dsaService';

const AddDsaProblem = () => {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    await createProblem(payload);
    navigate('/dsa');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header__text">
          <h1>Add DSA Problem</h1>
          <p>Log a new data structures & algorithms practice problem.</p>
        </div>
      </div>

      <div className="card">
        <DsaForm
          onSubmit={handleSubmit}
          submitLabel="Add Problem"
          onCancel={() => navigate('/dsa')}
        />
      </div>
    </div>
  );
};

export default AddDsaProblem;
