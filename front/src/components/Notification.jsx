export default function Notification({ notification, onClose }) {
  if (!notification) return null;
  return (
    <div className={`app-notification app-notification--${notification.type}`} role="status" aria-live="polite">
      <span className="app-notification__icon" aria-hidden="true">{notification.type === 'success' ? '✓' : '!'}</span>
      <div><strong>{notification.title}</strong><p>{notification.message}</p></div>
      <button type="button" onClick={onClose} aria-label="Cerrar notificación">×</button>
    </div>
  );
}
