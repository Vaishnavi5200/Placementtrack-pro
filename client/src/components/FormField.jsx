// A single reusable field that renders an input, select, or textarea
// depending on `as`, with a consistent label/error/hint layout.
const FormField = ({
  as = 'input',
  label,
  name,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder,
  required = false,
  error,
  hint,
  full = false,
  rows = 4,
  ...rest
}) => {
  const fieldId = `field-${name}`;
  const errorClass = error ? '--error' : '';

  return (
    <div className={`form-field ${full ? 'form-field--full' : ''}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {!required && <span className="form-label__optional">(optional)</span>}
      </label>

      {as === 'select' && (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-select${errorClass}`}
          {...rest}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {as === 'textarea' && (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-textarea${errorClass}`}
          rows={rows}
          {...rest}
        />
      )}

      {as === 'input' && (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input${errorClass}`}
          {...rest}
        />
      )}

      {error && <span className="form-error">{error}</span>}
      {!error && hint && <span className="form-hint">{hint}</span>}
    </div>
  );
};

export default FormField;
