import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type Employee = {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  photo?: string;
};

export default function Admin() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    id: 0,
    name: '',
    email: '',
    position: '',
    department: '',
    salary: '',
    photo: '',
  });

  // Auth check on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'ADMIN') {
      router.replace('/login');
      return;
    }
    fetchEmployees(token);
  }, []);

  async function fetchEmployees(token: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Error loading employees');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ id: 0, name: '', email: '', position: '', department: '', salary: '', photo: '' });
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return router.replace('/login');

    const payload = {
      name: form.name,
      email: form.email,
      position: form.position,
      department: form.department,
      salary: parseFloat(form.salary),
      photo: form.photo,
    };

    try {
      let res;
      if (form.id) {
        res = await fetch(`/api/employees/${form.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error('Failed to save employee');
      resetForm();
      fetchEmployees(token);
    } catch (err: any) {
      setError(err.message || 'Error saving employee');
    }
  }

  function handleEdit(emp: Employee) {
    setForm({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      position: emp.position,
      department: emp.department,
      salary: emp.salary.toString(),
      photo: emp.photo || '',
    });
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    const token = localStorage.getItem('token');
    if (!token) return router.replace('/login');

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete employee');
      fetchEmployees(token);
    } catch (err: any) {
      setError(err.message || 'Error deleting employee');
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData, 
      });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, photo: data.url }));
      } else {
        alert('Upload failed: no URL returned');
      }
    } catch {
      alert('Failed to upload image');
    }
  }

  return (
    <div className="container-fluid vh-100 bg-light p-4">
      {/* Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="btn btn-outline-danger">
          Logout
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Form */}
      <div className="card p-4 mb-5 shadow-sm" style={{ maxWidth: '900px' }}>
        <h4>{form.id ? 'Edit Employee' : 'Add New Employee'}</h4>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Position"
                value={form.position}
                onChange={e => setForm({ ...form, position: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Department"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                type="number"
                placeholder="Salary"
                value={form.salary}
                onChange={e => setForm({ ...form, salary: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <input type="file" name="file" className="form-control" onChange={handleFileChange} accept="image/*" />
            </div>

            {form.photo && (
              <div className="col-12">
                <img src={form.photo} alt="Preview" width={100} className="rounded-circle" />
              </div>
            )}
          </div>

          <div className="d-grid gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              {form.id ? 'Update Employee' : 'Add Employee'}
            </button>
            {form.id !== 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <h4 className="mb-3">Employees List</h4>
      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <p>Loading...</p>
        ) : employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark sticky-top">
              <tr>
                <th>Emp_Id</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>
                    {emp.photo ? (
                      <img
                        src={emp.photo}
                        alt={emp.name}
                        width={50}
                        height={50}
                        className="rounded-circle"
                      />
                    ) : (
                      'No photo'
                    )}
                  </td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.position}</td>
                  <td>{emp.department}</td>
                  <td>£{Number(emp.salary).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(emp)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(emp.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
