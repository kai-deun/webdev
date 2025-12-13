import { useState, useEffect } from "react";
import { getAllUsers, deleteUser, getAllRoles } from "../services/userService";
import UserForm from "../components/UserForm";
import UserList from "../components/UserList";
import "../styles/UserPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(page, 10, search);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles");
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const handleSaveUser = () => {
    setShowForm(false);
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>User Management</h1>
        <button onClick={handleAddUser} className="btn-primary">
          + Add User
        </button>
      </div>

      {showForm && (
        <UserForm
          user={selectedUser}
          roles={roles}
          onSave={handleSaveUser}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="users-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <UserList
              users={users}
              roles={roles}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />

            {pagination && (
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                  disabled={page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
