import "../styles/UserList.css";

const UserList = ({ users, roles, onEdit, onDelete }) => {
  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.role_id === roleId);
    return role ? role.role_name : "unknown";
  };

  return (
    <div className="user-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Phone Number</th>
            <th>Account Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>
                {user.first_name} {user.last_name}
              </td>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.role_name}</td>
              <td>{user.phone_number || "-"}</td>
              <td>
                <span className={`status ${user.status}`}>{user.status}</span>
              </td>
              <td className="actions">
                <button className="btn-edit" onClick={() => onEdit(user)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(user.user_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
