import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

export default function AddEditClassModal({
  isOpen,
  onClose,
  onSave,
  subjects = [],
  classToEdit = null,
  defaultDay = 'Monday'
}) {
  const [formData, setFormData] = useState({
    subject_id: '',
    day_of_week: defaultDay,
    start_time: '09:00:00',
    end_time: '10:00:00',
    room: '',
    type: 'Lecture'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classToEdit) {
      setFormData({
        id: classToEdit.id,
        subject_id: classToEdit.subject_id || '',
        day_of_week: classToEdit.day_of_week || 'Monday',
        start_time: classToEdit.start_time || '09:00:00',
        end_time: classToEdit.end_time || '10:00:00',
        room: classToEdit.room || '',
        type: classToEdit.type || 'Lecture'
      });
    } else {
      setFormData({
        subject_id: subjects[0]?.id || '',
        day_of_week: defaultDay || 'Monday',
        start_time: '09:00:00',
        end_time: '10:00:00',
        room: '',
        type: 'Lecture'
      });
    }
    setErrors({});
  }, [classToEdit, isOpen, subjects, defaultDay]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.subject_id) errs.subject_id = 'Please select a subject.';
    if (!formData.room.trim()) errs.room = 'Classroom or lab location is required.';
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
          <h3>{classToEdit ? 'Edit Class Schedule' : 'Add Class to Timetable'}</h3>
          <button className="btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="class-sub">Subject *</label>
            <select
              id="class-sub"
              className={`input-field ${errors.subject_id ? 'input-error' : ''}`}
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
            >
              <option value="">Select a Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || 'Code'})
                </option>
              ))}
            </select>
            {errors.subject_id && <span className="form-error-msg">{errors.subject_id}</span>}
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="class-day">Day of Week</label>
              <select
                id="class-day"
                className="input-field"
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="class-type">Session Type</label>
              <select
                id="class-type"
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab / Practical</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="class-start">Start Time</label>
              <input
                id="class-start"
                type="time"
                className="input-field"
                value={formData.start_time.substring(0, 5)}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value + ':00' })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="class-end">End Time</label>
              <input
                id="class-end"
                type="time"
                className="input-field"
                value={formData.end_time.substring(0, 5)}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value + ':00' })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="class-room">Room / Location *</label>
            <input
              id="class-room"
              type="text"
              placeholder="e.g. LH-301, Web Lab 2"
              className={`input-field ${errors.room ? 'input-error' : ''}`}
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
            {errors.room && <span className="form-error-msg">{errors.room}</span>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-class">
              {classToEdit ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
