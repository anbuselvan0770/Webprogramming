import React, { useState } from 'react';
import { X, AlertCircle, GraduationCap, LockKeyhole } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, onRegister, currentUser, canClose = true }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setError('Name, email, and password are required.');
          setLoading(false);
          return;
        }
        await onRegister({ name, email, password, course, department });
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`modal-overlay ${!canClose ? 'auth-page-overlay' : ''}`}
      onClick={canClose ? onClose : undefined}
    >
      <div className={`modal-content ${!canClose ? 'auth-page-card' : ''}`} onClick={(e) => e.stopPropagation()}>
        {!canClose && (
          <div className="auth-page-brand">
            <div className="auth-page-logo"><GraduationCap size={24} /></div>
            <span>StudySync</span>
          </div>
        )}
        <div className="modal-header">
          <div>
            <h3>{isRegister ? 'Create your account' : currentUser ? 'Switch student account' : 'Welcome back'}</h3>
            {!canClose && (
              <p className="auth-page-subtitle">
                {isRegister ? 'Start planning your studies today.' : 'Sign in to continue to your study planner.'}
              </p>
            )}
          </div>
          {canClose && (
            <button className="btn-icon" onClick={onClose} type="button" aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="auth-name">Full name *</label>
                <input
                  id="auth-name"
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="auth-course">Course / degree</label>
                  <input
                    id="auth-course"
                    type="text"
                    className="input-field"
                    placeholder="Enter your course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="auth-department">Department</label>
                  <input
                    id="auth-department"
                    type="text"
                    className="input-field"
                    placeholder="Enter your department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Student Email *</label>
            <input
              id="auth-email"
              type="email"
              className="input-field"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password *</label>
            <input
              id="auth-password"
              type="password"
              className="input-field"
              placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={isRegister ? 8 : undefined}
              required
            />
            {!isRegister && (
              <span className="auth-password-hint">
                <LockKeyhole size={13} />
                Your account is protected with a secure password.
              </span>
            )}
          </div>

          <div className="auth-helper-row">
            <button
              type="button"
              className="btn-link"
              onClick={() => { setIsRegister(!isRegister); setError(''); setPassword(''); }}
            >
              {isRegister ? 'Already have an account? Sign in' : 'New to StudySync? Create account'}
            </button>
          </div>

          <div className="modal-footer">
            {canClose && <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
