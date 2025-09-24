import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [attachment, setAttachment] = useState(null);
  const [exported, setExported] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchExpenses();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchExpenses();
    }
  }, [isAuthenticated, token]);

  const getApiUrl = (endpoint) => {
    const baseUrl = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${endpoint}`;
  };

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(getApiUrl('/api/auth/login'), {
        username,
        password
      });
      const { token: newToken } = response.data;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setExpenses([]);
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(getApiUrl('/api/expenses'), {
        headers: getAuthHeaders()
      });
      setExpenses(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('comment', comment);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('status', status);
    formData.append('attachment', attachment);
    formData.append('exported', exported);

    await axios.post(getApiUrl('/api/expenses'), formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    setTitle('');
    setComment('');
    setStartDate('');
    setEndDate('');
    setStatus('Pending');
    setAttachment(null);
    setExported(false);
    fetchExpenses();
  };

  const viewExpense = (expense) => {
    setSelectedExpense(expense);
    setEditMode(false);
    setShowModal(true);
  };

  const editExpense = () => {
    setEditMode(true);
  };

  const saveExpense = async () => {
    const formData = new FormData();
    formData.append('title', selectedExpense.title);
    formData.append('comment', selectedExpense.comment);
    formData.append('startDate', selectedExpense.startDate);
    formData.append('endDate', selectedExpense.endDate);
    formData.append('status', selectedExpense.status);
    formData.append('exported', selectedExpense.exported);
    if (selectedExpense.newAttachment) {
      formData.append('attachment', selectedExpense.newAttachment);
    }

    await axios.put(getApiUrl(`/api/expenses/${selectedExpense._id}`), formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    setShowModal(false);
    setEditMode(false);
    fetchExpenses();
  };

  const deleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await axios.delete(getApiUrl(`/api/expenses/${id}`), {
        headers: getAuthHeaders()
      });
      fetchExpenses();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedExpense(null);
  };

  const downloadAttachment = () => {
    if (selectedExpense.attachment) {
      const filename = selectedExpense.attachment.split('/').pop();
      window.open(getApiUrl(`/api/download/${filename}`), '_blank');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={login} className="login-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Expenses</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
      <form onSubmit={addExpense}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" placeholder="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
        <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <input type="file" onChange={(e) => setAttachment(e.target.files[0])} />
        <label>
          <input type="checkbox" checked={exported} onChange={(e) => setExported(e.target.checked)} />
          Exported
        </label>
        <button type="submit">Add Expense</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Comment</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Attachment</th>
            <th>Exported</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr key={expense._id}>
              <td>{expense.title}</td>
              <td>{expense.comment}</td>
              <td>{new Date(expense.startDate).toLocaleDateString()}</td>
              <td>{expense.endDate ? new Date(expense.endDate).toLocaleDateString() : ''}</td>
              <td>{expense.status}</td>
              <td>{expense.attachment ? 'Yes' : 'No'}</td>
              <td>{expense.exported ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => viewExpense(expense)}>View</button>
                <button onClick={() => deleteExpense(expense._id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedExpense && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Expense Details</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {editMode ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={selectedExpense.title}
                    onChange={(e) => setSelectedExpense({...selectedExpense, title: e.target.value})}
                  />
                  <textarea
                    value={selectedExpense.comment}
                    onChange={(e) => setSelectedExpense({...selectedExpense, comment: e.target.value})}
                  />
                  <input
                    type="date"
                    value={selectedExpense.startDate?.split('T')[0]}
                    onChange={(e) => setSelectedExpense({...selectedExpense, startDate: e.target.value})}
                  />
                  <input
                    type="date"
                    value={selectedExpense.endDate?.split('T')[0] || ''}
                    onChange={(e) => setSelectedExpense({...selectedExpense, endDate: e.target.value})}
                  />
                  <select
                    value={selectedExpense.status}
                    onChange={(e) => setSelectedExpense({...selectedExpense, status: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedExpense.exported}
                      onChange={(e) => setSelectedExpense({...selectedExpense, exported: e.target.checked})}
                    />
                    Exported
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedExpense({...selectedExpense, newAttachment: e.target.files[0]})}
                  />
                </div>
              ) : (
                <div className="view-details">
                  <p><strong>Title:</strong> {selectedExpense.title}</p>
                  <p><strong>Comment:</strong> {selectedExpense.comment}</p>
                  <p><strong>Start Date:</strong> {new Date(selectedExpense.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {selectedExpense.endDate ? new Date(selectedExpense.endDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedExpense.status}</p>
                  <p><strong>Exported:</strong> {selectedExpense.exported ? 'Yes' : 'No'}</p>
                  <p><strong>Attachment:</strong> {selectedExpense.attachment ? 'Available' : 'None'}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {editMode ? (
                <>
                  <button onClick={saveExpense}>Save</button>
                  <button onClick={() => setEditMode(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={editExpense}>Edit</button>
                  {selectedExpense.attachment && (
                    <button onClick={downloadAttachment}>Download</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;