export default function StateBox({ icon: Icon, title, children, action, error = false }) {
  return (
    <div className={`state-box ${error ? "is-error" : ""}`} role={error ? "alert" : undefined}>
      {Icon && <Icon aria-hidden="true" />}
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
