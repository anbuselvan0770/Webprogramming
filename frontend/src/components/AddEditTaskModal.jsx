import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddEditTaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  subjects = [], 
  taskToEdit = null 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_name: '',
    priority: 'Medium',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '23:59:00',
    estimated_minutes: 30,
    status: 'Pending'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        id: taskToEdit.id,
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        subject_name: taskToEdit.subject_name || subjects.find(subject => String(subject.id) === String(taskToEdit.subject_id))?.name || '',
        priority: taskToEdit.priority || 'Medium',
        due_date: taskToEdit.due_date || new Date().toISOString().split('T')[0],
        due_time: taskToEdit.due_time || '23:59:00',
        estimated_minutes: taskToEdit.estimated_minutes || 30,
        status: taskToEdit.status || 'Pending'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        subject_name: '',
        priority: 'Medium',
        due_date: new Date().toISOString().split('T')[0],
        due_time: '23:59:00',
        estimated_minutes: 30,
        status: 'Pending'
      });
    }
    setErrors({});
  }, [taskToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required.';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Unable to save this task. Please try again.' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{taskToEdit ? 'Edit Academic Task' : 'Create New Study Task'}</h3>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="task-title">Task Title *</label>
            <input
              id="task-title"
              type="text"
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Complete React Assignment"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
            {errors.title && <span className="form-error-msg">{errors.title}</span>}
          </div>

          {/* Subject & Priority */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="task-subject">Subject</label>
              <input
                id="task-subject"
                type="text"
                className="input-field"
                placeholder="Type a subject (optional)"
                value={formData.subject_name}
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="input-field"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="task-due-date">Due Date *</label>
              <input
                id="task-due-date"
                type="date"
                className="input-field"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-due-time">Due Time</label>
              <input
                id="task-due-time"
                type="time"
                className="input-field"
                value={formData.due_time ? formData.due_time.substring(0, 5) : '23:59'}
                onChange={(e) => setFormData({ ...formData, due_time: e.target.value + ':00' })}
              />
            </div>
          </div>

          {/* Estimated minutes */}
          <div className="form-group">
            <label htmlFor="task-est">Estimated Study Duration (minutes)</label>
            <input
              id="task-est"
              type="number"
              min="5"
              step="5"
              className="input-field"
              value={formData.estimated_minutes}
              onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value, 10) || 30 })}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="task-desc">Description / Instructions</label>
            <textarea
              id="task-desc"
              rows="3"
              className="input-field"
              placeholder="Add assignment details, rubric points, or notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Footer actions */}
          {errors.submit && <span className="form-error-msg" role="alert">{errors.submit}</span>}
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-task">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
