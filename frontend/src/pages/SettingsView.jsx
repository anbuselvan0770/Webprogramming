import React, { useState } from 'react';
import { 
  BookOpen,
  Save, 
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export default function SettingsView({
  user,
  onUpdateProfile,
  theme,
  onThemeChange,
  subjects = [],
  onCreateSubject,
  onDeleteSubject
}) {
  const [formData, setFormData] = useState({
    name: user?.name || 'Abinash S',
    email: user?.email || 'abinash@student.sync',
    course: user?.course || 'B.Tech Computer Science & Engineering',
    department: user?.department || 'School of Computing',
    year_of_study: user?.year_of_study || '3rd Year (Sem 6)',
    daily_goal_minutes: user?.daily_goal_minutes || 120
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', color: '#8B5CF6' });
  const [subjectError, setSubjectError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(formData);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateSubject = async (event) => {
    event.preventDefault();
    const name = subjectForm.name.trim();
    if (!name) {
      setSubjectError('Enter a subject name.');
      return;
    }
    if (subjects.some(subject => subject.name.toLowerCase() === name.toLowerCase())) {
      setSubjectError('You already added this subject.');
      return;
    }

    try {
      await onCreateSubject({ ...subjectForm, name });
      setSubjectForm({ name: '', code: '', color: '#8B5CF6' });
      setSubjectError('');
    } catch (error) {
      setSubjectError(error.message || 'Unable to add this subject. Please try again.');
    }
  };

  return (
    <div className="settings-page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Profile & Application Settings</h2>
          <p className="page-subtitle">
            Update your profile, choose an interface theme, and manage your subjects.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left: Student Profile Card */}
        <div className="card settings-profile-card">
          <div className="card-header-clean">
            <div className="header-title-group">
              <span className="card-badge-label">STUDENT IDENTITY</span>
              <h4>Academic Profile</h4>
            </div>
            {savedSuccess && (
              <span className="badge badge-primary">
                <CheckCircle2 size={12} />
                Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Student Email</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                disabled
                title="Email is fixed to student account"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Degree & Major</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Year / Semester</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Department / Faculty</label>
              <input
                type="text"
                className="input-field"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Daily Study Target (minutes)</label>
              <div className="input-with-icon">
                <input
                  type="number"
                  min="30"
                  step="15"
                  className="input-field"
                  value={formData.daily_goal_minutes}
                  onChange={(e) => setFormData({ ...formData, daily_goal_minutes: parseInt(e.target.value, 10) || 120 })}
                />
                <span className="field-suffix">min/day</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" id="btn-save-profile">
              <Save size={15} />
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Appearance and subject management */}
        <div className="settings-right-col">
          {/* Theme card */}
          <div className="card settings-theme-card">
            <div className="card-header-clean">
              <div className="header-title-group">
                <span className="card-badge-label">VISUAL AESTHETICS</span>
                <h4>Interface Theme Accent</h4>
              </div>
            </div>

            <div className="theme-options-grid">
              <button
                type="button"
                className={`theme-pick-card ${theme === 'cosmic-amethyst' ? 'active' : ''}`}
                onClick={() => onThemeChange('cosmic-amethyst')}
                aria-pressed={theme === 'cosmic-amethyst'}
              >
                <div className="theme-color-preview amethyst-preview"></div>
                <div className="theme-info">
                  <strong>Plum & Violet</strong>
                  <span>Dark academic focus</span>
                </div>
              </button>

              <button 
                type="button"
                className={`theme-pick-card ${theme === 'sage-green' ? 'active' : ''}`}
                onClick={() => onThemeChange('sage-green')}
                aria-pressed={theme === 'sage-green'}
              >
                <div className="theme-color-preview sage-preview"></div>
                <div className="theme-info">
                  <strong>Sage Green</strong>
                  <span>Soft natural light theme</span>
                </div>
              </button>

              <button 
                type="button"
                className={`theme-pick-card ${theme === 'calm-blue' ? 'active' : ''}`}
                onClick={() => onThemeChange('calm-blue')}
                aria-pressed={theme === 'calm-blue'}
              >
                <div className="theme-color-preview blue-preview"></div>
                <div className="theme-info">
                  <strong>Calm Ocean Blue</strong>
                  <span>Focus-oriented academic blue</span>
                </div>
              </button>

              <button 
                type="button"
                className={`theme-pick-card ${theme === 'slate-minimal' ? 'active' : ''}`}
                onClick={() => onThemeChange('slate-minimal')}
                aria-pressed={theme === 'slate-minimal'}
              >
                <div className="theme-color-preview slate-preview"></div>
                <div className="theme-info">
                  <strong>Slate Minimal</strong>
                  <span>Monochrome clean interface</span>
                </div>
              </button>
            </div>
          </div>

          <section className="card settings-subjects-card" aria-labelledby="subjects-settings-heading">
            <div className="card-header-clean">
              <div className="header-title-group">
                <span className="card-badge-label">YOUR STUDY PLAN</span>
                <h4 id="subjects-settings-heading">Manage Subjects</h4>
              </div>
            </div>

            <form className="subject-create-form" onSubmit={handleCreateSubject}>
              <div className="form-group">
                <label htmlFor="new-subject-name">Subject name *</label>
                <input
                  id="new-subject-name"
                  className="input-field"
                  value={subjectForm.name}
                  onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })}
                  placeholder="e.g. Biology"
                  maxLength={100}
                  required
                />
              </div>
              <div className="subject-create-fields">
                <div className="form-group">
                  <label htmlFor="new-subject-code">Code (optional)</label>
                  <input
                    id="new-subject-code"
                    className="input-field"
                    value={subjectForm.code}
                    onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value })}
                    placeholder="e.g. BIO101"
                    maxLength={30}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-subject-color">Tag color</label>
                  <input
                    id="new-subject-color"
                    type="color"
                    className="subject-color-input"
                    value={subjectForm.color}
                    onChange={(event) => setSubjectForm({ ...subjectForm, color: event.target.value })}
                  />
                </div>
              </div>
              {subjectError && <p className="form-error-msg" role="alert">{subjectError}</p>}
              <button type="submit" className="btn btn-primary">
                <Plus size={15} />
                <span>Add subject</span>
              </button>
            </form>

            <div className="settings-subject-list" aria-live="polite">
              {subjects.length === 0 ? (
                <div className="subject-empty-state">
                  <BookOpen size={20} />
                  <p>No subjects yet. Add the subjects you study above.</p>
                </div>
              ) : subjects.map((subject) => (
                <div className="settings-subject-row" key={subject.id}>
                  <span className="subject-color-dot" style={{ backgroundColor: subject.color || '#8B5CF6' }} aria-hidden="true" />
                  <div className="settings-subject-info">
                    <strong>{subject.name}</strong>
                    {subject.code && <span>{subject.code}</span>}
                  </div>
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label={`Delete ${subject.name}`}
                    title={`Delete ${subject.name}`}
                    onClick={() => {
                      if (window.confirm(`Delete ${subject.name}?`)) onDeleteSubject(subject.id);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
