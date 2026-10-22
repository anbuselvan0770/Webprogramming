import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  FileText, 
  Video, 
  Globe, 
  Book, 
  Trash2, 
  Edit2, 
  FolderGit2,
  Tag
} from 'lucide-react';

export default function ResourcesView({
  resources = [],
  subjects = [],
  onAddResourceClick,
  onEditResource,
  onDeleteResource
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Notes', 'PDF Document', 'YouTube Link', 'Website', 'Reference Book'];

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'YouTube Link':
        return <Video size={16} color="#EF4444" />;
      case 'PDF Document':
        return <FileText size={16} color="#DC2626" />;
      case 'Website':
        return <Globe size={16} color="#2563EB" />;
      case 'Reference Book':
        return <Book size={16} color="#D97706" />;
      case 'Notes':
      default:
        return <FileText size={16} color="#4A7C59" />;
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (selectedCategory !== 'All' && res.category !== selectedCategory) return false;
      if (selectedSubject !== 'All' && String(res.subject_id) !== String(selectedSubject)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = res.title?.toLowerCase().includes(q);
        const descMatch = res.description?.toLowerCase().includes(q);
        const subMatch = res.subject_name?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !subMatch) return false;
      }
      return true;
    });
  }, [resources, selectedCategory, selectedSubject, searchQuery]);

  return (
    <div className="resources-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Academic Resource Vault</h2>
          <p className="page-subtitle">
            Central repository for lecture slides, PDF textbooks, tutorials, and revision notes.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={onAddResourceClick}
          id="btn-add-resource"
        >
          <Plus size={16} />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="card resources-filter-card">
        {/* Category Pills */}
        <div className="resource-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="resource-search-row">
          <div className="filter-search-box flex-grow">
            <Search size={15} />
            <input 
              type="text" 
              placeholder="Search resource title or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="resources-grid">
        {filteredResources.length === 0 ? (
          <div className="empty-state card full-width">
            <FolderGit2 size={40} className="empty-icon-large" />
            <h3>No resources found</h3>
            <p>Save textbooks, documentation links, or revision notes for your courses.</p>
            <button className="btn btn-outline" onClick={onAddResourceClick}>
              <Plus size={15} />
              <span>Add First Resource</span>
            </button>
          </div>
        ) : (
          filteredResources.map((res) => (
            <div key={res.id} className="resource-card card">
              <div className="resource-card-top">
                <div className="resource-cat-badge">
                  {getCategoryIcon(res.category)}
                  <span>{res.category}</span>
                </div>

                {res.subject_name && (
                  <span 
                    className="subject-pill"
                    style={{
                      backgroundColor: `${res.subject_color || '#52796F'}18`,
                      color: res.subject_color || '#52796F',
                      borderColor: `${res.subject_color || '#52796F'}40`
                    }}
                  >
                    {res.subject_name}
                  </span>
                )}
              </div>

              <div className="resource-card-content">
                <h3 className="resource-title">{res.title}</h3>
                {res.description && (
                  <p className="resource-description">{res.description}</p>
                )}
              </div>

              <div className="resource-card-footer">
                {res.url ? (
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resource-link-btn"
                  >
                    <span>Open Link</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="resource-note-only">Local Notes</span>
                )}

                <div className="resource-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => onEditResource(res)}
                    title="Edit resource"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    className="btn-icon btn-icon-danger" 
                    onClick={() => onDeleteResource(res.id)}
                    title="Delete resource"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
