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

type LeaveApplication = {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveApps, setLeaveApps] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'EMPLOYEE') {
      router.replace('/login');
      return;
    }

    fetchEmployeeData(token);
  }, []);

  async function fetchEmployeeData(token: string) {
    try {
      const res = await fetch('/api/employee/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load employee profile');

      const data = await res.json();
      setEmployee(data.employee);
      setLeaveApps(data.leaveApplications || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employee Dashboard</h2>
        <button onClick={handleLogout} className="btn btn-outline-danger">
          Logout
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : employee ? (
        <>
          <div className="card p-4 mb-5 shadow-sm" style={{ maxWidth: '800px' }}>
            <h4>Your Profile</h4>
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>{employee.name}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{employee.email}</td>
                </tr>
                <tr>
                  <th>Position</th>
                  <td>{employee.position}</td>
                </tr>
                <tr>
                  <th>Department</th>
                  <td>{employee.department}</td>
                </tr>
                <tr>
                  <th>Salary</th>
                  <td>£{employee.salary.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            {employee.photo && (
              <img src={employee.photo} alt="Profile" width={100} className="rounded-circle mt-3" />
            )}
          </div>

          <div className="card p-4 shadow-sm">
            <h4>Leave Applications</h4>
            {leaveApps.length === 0 ? (
              <p>No leave applications submitted yet.</p>
            ) : (
              <table className="table table-bordered table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveApps.map(app => (
                    <tr key={app.id}>
                      <td>{app.start_date}</td>
                      <td>{app.end_date}</td>
                      <td>{app.reason}</td>
                      <td>{app.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <p>No employee data found.</p>
      )}
    </div>
  );
}
