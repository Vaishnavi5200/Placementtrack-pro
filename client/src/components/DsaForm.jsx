import { useState } from 'react';
import FormField from './FormField';

const DSA_PLATFORMS = ['LeetCode', 'HackerRank', 'GeeksforGeeks', 'Codeforces', 'InterviewBit', 'Other'];
const DSA_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DSA_STATUSES = ['Todo', 'Attempted', 'Solved', 'Needs Review'];

const emptyForm = {
  title: '',
  platform: '',
  problemUrl: '',
  difficulty: '',
  topic: '',
  status: 'Todo',
  revisionCount: 0,
  notes: '',
};

const buildInitialForm = (problem) => {
  if (!problem) return emptyForm;
  return {
    title: problem.title || '',
    platform: problem.platform || '',
    problemUrl: problem.problemUrl || '',
    difficulty: problem.difficulty || '',
    topic: problem.topic || '',
    status: problem.status || 'Todo',
    revisionCount: problem.revisionCount !== undefined ? problem.revisionCount : 0,
    notes: problem.notes || '',
  };
};

const DsaForm = ({ initialProblem = null, onSubmit, submitLabel = 'Save Problem', onCancel }) => {
  const [form, setForm] = useState(() => buildInitialForm(initialProblem));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Problem title is required';
    if (!form.platform) nextErrors.platform = 'Select a platform';
    if (!form.difficulty) nextErrors.difficulty = 'Select a difficulty';
    if (!form.topic.trim()) nextErrors.topic = 'Topic is required';
    if (
      form.problemUrl &&
      !/^https?:\/\/.+/i.test(form.problemUrl.trim())
    ) {
      nextErrors.problemUrl = 'URL must start with http:// or https://';
    }
    if (form.revisionCount < 0) {
      nextErrors.revisionCount = 'Revision count cannot be negative';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        topic: form.topic.trim(),
        problemUrl: form.problemUrl.trim(),
        revisionCount: Number(form.revisionCount),
      });
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {submitError && <div className="alert alert-danger">{submitError}</div>}

      <div className="form-grid">
        <FormField
          label="Problem Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Two Sum"
          required
          error={errors.title}
        />
        <FormField
          as="select"
          label="Platform"
          name="platform"
          value={form.platform}
          onChange={handleChange}
          options={DSA_PLATFORMS}
          placeholder="Select platform"
          required
          error={errors.platform}
        />
        <FormField
          label="Problem URL"
          name="problemUrl"
          value={form.problemUrl}
          onChange={handleChange}
          placeholder="https://..."
          error={errors.problemUrl}
        />
        <FormField
          as="select"
          label="Difficulty"
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          options={DSA_DIFFICULTIES}
          placeholder="Select difficulty"
          required
          error={errors.difficulty}
        />
        <FormField
          label="Topic"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          placeholder="e.g. Arrays, Trees, Dynamic Programming"
          required
          error={errors.topic}
        />
        <FormField
          as="select"
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={DSA_STATUSES}
          required
        />
        <FormField
          label="Revision Count"
          name="revisionCount"
          type="number"
          value={form.revisionCount}
          onChange={handleChange}
          min="0"
          error={errors.revisionCount}
        />
        <FormField
          as="textarea"
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Key concepts, time/space complexity, optimal approach details..."
          full
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default DsaForm;
