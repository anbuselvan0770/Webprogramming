import React, { useState, useEffect } from 'react';
import { X, Link, FileText, Video, Globe, Book } from 'lucide-react';

export default function AddEditResourceModal({
  isOpen,
  onClose,
  onSave,
  subjects = [],
  resourceToEdit = null
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Website',
    url: '',
    subject_id: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (resourceToEdit) {
      setFormData({
        id: resourceToEdit.id,
        title: resourceToEdit.title || '',
        category: resourceToEdit.category || 'Website',
        url: resourceToEdit.url || '',
        subject_id: resourceToEdit.subject_id || '',
        description: resourceToEdit.description || ''
      });
    } else {
      setFormData({
        title: '',
        category: 'Website',
        url: '',
        subject_id: subjects[0]?.id || '',
        description: ''
      });
    }
    setErrors({});
  }, [resourceToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Resource title is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{resourceToEdit ? 'Edit Resource' : 'Save New Study Resource'}</h3>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="res-title">Resource Title *</label>
            <input
              id="res-title"
              type="text"
              placeholder="e.g. React 19 Official Documentation"
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
            {errors.title && <span className="form-error-msg">{errors.title}</span>}
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="res-cat">Category</label>
              <select
                id="res-cat"
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Website">Website</option>
                <option value="PDF Document">PDF Document</option>
                <option value="YouTube Link">YouTube Tutorial</option>
                <option value="Notes">Lecture Notes</option>
                <option value="Reference Book">Reference Book</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="res-sub">Subject</label>
              <select
                id="res-sub"
                className="input-field"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              >
                <option value="">General (No Subject)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code || 'Code'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="res-url">URL / Web Link (Optional)</label>
            <input
              id="res-url"
              type="url"
              placeholder="https://..."
              className="input-field"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="res-desc">Key Notes or Description</label>
            <textarea
              id="res-desc"
              rows="3"
              placeholder="Key concepts, page numbers, or exam tips from this resource..."
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-resource">
              {resourceToEdit ? 'Update Resource' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
