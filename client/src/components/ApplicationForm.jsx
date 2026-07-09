import { useState } from 'react';
import FormField from './FormField';
import {
  APPLICATION_TYPES,
  APPLICATION_STATUSES,
  WORK_MODES,
  APPLICATION_SOURCES,
} from '../utils/constants';

const emptyForm = {
  company: '',
  role: '',
  type: '',
  status: 'Wishlist',
  workMode: '',
  location: '',
  source: '',
  applicationUrl: '',
  appliedDate: '',
  nextFollowUpDate: '',
  notes: '',
};

// Converts an ISO date string to yyyy-mm-dd for a native date input.
const toDateInputValue = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const buildInitialForm = (application) => {
  if (!application) return emptyForm;
  return {
    company: application.company || '',
    role: application.role || '',
    type: application.type || '',
    status: application.status || 'Wishlist',
    workMode: application.workMode || '',
    location: application.location || '',
    source: application.source || '',
    applicationUrl: application.applicationUrl || '',
    appliedDate: toDateInputValue(application.appliedDate),
    nextFollowUpDate: toDateInputValue(application.nextFollowUpDate),
    notes: application.notes || '',
  };
};

const ApplicationForm = ({ initialApplication = null, onSubmit, submitLabel = 'Save Application', onCancel }) => {
  const [form, setForm] = useState(() => buildInitialForm(initialApplication));
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
    if (!form.company.trim()) nextErrors.company = 'Company is required';
    if (!form.role.trim()) nextErrors.role = 'Role is required';
    if (!form.type) nextErrors.type = 'Select an application type';
    if (!form.workMode) nextErrors.workMode = 'Select a work mode';
    if (!form.source) nextErrors.source = 'Select where you found this opportunity';
    if (
      form.applicationUrl &&
      !/^https?:\/\/.+/i.test(form.applicationUrl.trim())
    ) {
      nextErrors.applicationUrl = 'URL must start with http:// or https://';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;
    if (isSubmitting) return; // guard against duplicate submissions

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        company: form.company.trim(),
        role: form.role.trim(),
        appliedDate: form.appliedDate || null,
        nextFollowUpDate: form.nextFollowUpDate || null,
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
          label="Company"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="e.g. Acme Corp"
          required
          error={errors.company}
        />
        <FormField
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="e.g. Frontend Engineer Intern"
          required
          error={errors.role}
        />
        <FormField
          as="select"
          label="Application Type"
          name="type"
          value={form.type}
          onChange={handleChange}
          options={APPLICATION_TYPES}
          placeholder="Select type"
          required
          error={errors.type}
        />
        <FormField
          as="select"
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={APPLICATION_STATUSES}
          required
        />
        <FormField
          as="select"
          label="Work Mode"
          name="workMode"
          value={form.workMode}
          onChange={handleChange}
          options={WORK_MODES}
          placeholder="Select work mode"
          required
          error={errors.workMode}
        />
        <FormField
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Bengaluru, India"
        />
        <FormField
          as="select"
          label="Source"
          name="source"
          value={form.source}
          onChange={handleChange}
          options={APPLICATION_SOURCES}
          placeholder="Where did you find this?"
          required
          error={errors.source}
        />
        <FormField
          label="Application URL"
          name="applicationUrl"
          value={form.applicationUrl}
          onChange={handleChange}
          placeholder="https://..."
          error={errors.applicationUrl}
        />
        <FormField
          label="Applied Date"
          name="appliedDate"
          type="date"
          value={form.appliedDate}
          onChange={handleChange}
        />
        <FormField
          label="Next Follow-up Date"
          name="nextFollowUpDate"
          type="date"
          value={form.nextFollowUpDate}
          onChange={handleChange}
          hint="Set a reminder date to check back on this application"
        />
        <FormField
          as="textarea"
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Interview prep, contacts, referral details..."
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

export default ApplicationForm;
