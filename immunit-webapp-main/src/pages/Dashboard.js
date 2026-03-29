import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import axios from 'axios';
import '../styles/Dashboard.css';

function Dashboard({ setIsAuthenticated }) {
  const [activeTab, setActiveTab] = useState('allergens');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url';

  const endpoints = {
    allergens: '/allergens',
    antibodyTrends: '/antibody-trends',
    autoimmune: '/autoimmune-markers',
    vaccinations: '/vaccinations',
    immunity: '/immunity-passports'
  };

  const tabConfig = {
    allergens: {
      label: 'Allergens',
      fields: ['allergen_type', 'allergen_name', 'sensitivity_level', 'recorded_at', 'symptoms_flagged']
    },
    antibodyTrends: {
      label: 'Antibody Trends',
      fields: ['antibody_name', 'titer_value', 'unit', 'recorded_at']
    },
    autoimmune: {
      label: 'Autoimmune Markers',
      fields: ['marker_name', 'value', 'unit', 'date_recorded', 'clinical_flag', 'reference_range']
    },
    vaccinations: {
      label: 'Vaccinations',
      fields: ['vaccine_name', 'date_administered', 'dose_number', 'manufacturer', 'status']
    },
    immunity: {
      label: 'Immunity Passport',
      fields: ['snapshot_date', 'pdf_url', 'includes_sections', 'shared_with_email']
    }
  };

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          currentUser.getSession((err, session) => {
            if (!err) {
              const idToken = session.getIdToken();
              setUser({
                email: idToken.payload.email,
                name: idToken.payload.name
              });
            }
          });
        }
        fetchData();
      } catch (err) {
        setError('Failed to load user data');
      }
    };
    fetchUserAndData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const idToken = await authService.getIdToken();
      const endpoint = endpoints[activeTab];
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEditClick = (record) => {
    setEditingId(record.id);
    setFormData(record);
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const idToken = await authService.getIdToken();
      const endpoint = endpoints[activeTab];
      const url = editingId ? `${API_BASE_URL}${endpoint}/${editingId}` : `${API_BASE_URL}${endpoint}`;
      const method = editingId ? 'PUT' : 'POST';

      await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      setShowForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to save data');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const idToken = await authService.getIdToken();
      const endpoint = endpoints[activeTab];
      await axios.delete(`${API_BASE_URL}${endpoint}/${id}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      fetchData();
    } catch (err) {
      setError('Failed to delete record');
      console.error(err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const getFieldType = (fieldName) => {
    if (fieldName.includes('date') || fieldName.includes('recorded_at')) return 'date';
    if (fieldName.includes('level') || fieldName.includes('dose') || fieldName.includes('value') || fieldName.includes('titer')) return 'number';
    if (fieldName.includes('symptoms') || fieldName.includes('includes')) return 'textarea';
    return 'text';
  };

  const getFieldLabel = (fieldName) => {
    return fieldName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Immunity Passport</h1>
        <div className="user-info">
          {user && <span>Welcome, {user.name || user.email}</span>}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="tabs">
        {Object.entries(tabConfig).map(([key, config]) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {config.label}
          </button>
        ))}
      </div>

      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        <div className="section-header">
          <h2>{tabConfig[activeTab]?.label}</h2>
          <button onClick={handleAddClick} className="add-btn">+ Add New</button>
        </div>

        {showForm && (
          <div className="form-modal">
            <div className="form-modal-content">
              <div className="form-header">
                <h3>{editingId ? 'Edit Record' : 'New Record'}</h3>
                <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
              </div>

              <div className="form-fields">
                {tabConfig[activeTab]?.fields.map(field => (
                  <div key={field} className="form-group">
                    <label>{getFieldLabel(field)}</label>
                    {getFieldType(field) === 'textarea' ? (
                      <textarea
                        name={field}
                        value={formData[field] || ''}
                        onChange={handleFormChange}
                        placeholder={getFieldLabel(field)}
                      />
                    ) : (
                      <input
                        type={getFieldType(field)}
                        name={field}
                        value={formData[field] || ''}
                        onChange={handleFormChange}
                        placeholder={getFieldLabel(field)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button onClick={handleSave} className="save-btn">Save</button>
                <button onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading">Loading...</div>}

        {!loading && data.length === 0 && (
          <div className="empty-state">
            <p>No records yet. Click "Add New" to create one.</p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  {tabConfig[activeTab]?.fields.map(field => (
                    <th key={field}>{getFieldLabel(field)}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(record => (
                  <tr key={record.id}>
                    {tabConfig[activeTab]?.fields.map(field => (
                      <td key={field}>{String(record[field] || '-')}</td>
                    ))}
                    <td className="actions">
                      <button
                        onClick={() => handleEditClick(record)}
                        className="edit-btn"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
