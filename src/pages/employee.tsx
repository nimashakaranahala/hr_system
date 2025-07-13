import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";

type Employee = {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  photo?: string;
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "EMPLOYEE") {
      router.replace("/login");
      return;
    }

    fetchEmployee(token);
  }, []);

  async function fetchEmployee(token: string) {
    try {
      const res = await fetch("/api/employees/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load employee profile");
      }
      const data = await res.json();
      setEmployee(data.employee);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  }
  async function handlePhotoUpload(e: FormEvent) {
    e.preventDefault();
    if (!photoFile || !employee) return;

    const formData = new FormData();
    formData.append("photo", photoFile);

    const token = localStorage.getItem("token")!;
    const res = await fetch("/api/employees/update-photo", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      setSuccessMsg("Photo updated successfully.");
      setError("");
      fetchEmployee(token);
    } else {
      setError("Failed to update photo.");
      setSuccessMsg("");
    }
  }
  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    if (!newPassword) return;

    const token = localStorage.getItem("token")!;
    const res = await fetch("/api/employees/update-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    if (res.ok) {
      setSuccessMsg("Password updated successfully.");
      setError("");
      setNewPassword("");
    } else {
      setError("Failed to update password.");
      setSuccessMsg("");
    }
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
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : employee ? (
        <>
          <div
            className="card p-4 mb-4 shadow-sm"
            style={{ maxWidth: "800px" }}
          >
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
                  <td>£{Number(employee.salary).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            {employee.photo && (
              <img
                src={employee.photo}
                alt="Profile"
                width={100}
                className="rounded-circle mt-3"
              />
            )}
          </div>
          <form
            onSubmit={handlePhotoUpload}
            className="mb-5"
            encType="multipart/form-data"
          >
            <h5>Update Photo</h5>
            <input
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0])
                  setPhotoFile(e.target.files[0]);
              }}
              className="form-control mb-2"
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "auto", padding: "8px 60px" }}
            >
              Upload
            </button>
          </form>
          <form onSubmit={handlePasswordChange} className="mb-5">
            <h5>Change Password</h5>
            <input
              type="password"
              className="form-control mb-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={6}
            />
            <button
              type="submit"
              className="btn btn-warning"
              style={{ width: "auto", padding: "8px 30px" }}
            >
              Update Password
            </button>
          </form>
        </>
      ) : (
        <p>No employee data found.</p>
      )}
    </div>
  );
}
