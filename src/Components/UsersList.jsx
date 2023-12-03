import React, { useEffect, useState } from "react";
import "./UsersList.css";
import "antd/dist/antd.css";
import ReactPaginate from "react-paginate";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editedFields, setEditedFields] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [pageCount, setPageCount] = useState(0);

  const itemPerPage = 10;
  const pageVisited = pageCount * itemPerPage;

  const filteredUsers = users.filter((user) => {
    if (searchUser === "") return true;
    return (
      user.name.includes(searchUser) ||
      user.email.includes(searchUser) ||
      user.role.includes(searchUser)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemPerPage);

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index);

 
  useEffect(() => {
    getUsersDetails();

 
    return () => {
     
    };
  }, []);

  const getUsersDetails = () => {
    fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    )
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        console.error("Error fetching user details:", err);
      });
  };

  const deleteUser = (selectedUserId) => {
    const userAfterDeletion = users.filter((user) => user.id !== selectedUserId);
    setUsers(userAfterDeletion);
  };

  const editUserDetails = (selectedUser) => {
    setEditingUser(selectedUser);
    setEditedFields({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
    });
  };

  const handleEditChange = (e, field) => {
    setEditedFields((prevEditedFields) => ({
      ...prevEditedFields,
      [field]: e.target.value,
    }));
  };

  const saveUserDetails = () => {
    const updatedUsers = users.map((user) =>
      user.id === editingUser.id ? { ...user, ...editedFields } : user
    );

    setUsers(updatedUsers);
    setEditingUser(null);
    setEditedFields({
      name: "",
      email: "",
      role: "",
    });
  };

  const handleRowSelect = (userId) => {
    const selectedRowIndex = selectedRows.indexOf(userId);
    if (selectedRowIndex === -1) {
      setSelectedRows([...selectedRows, userId]);
    } else {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows.splice(selectedRowIndex, 1);
      setSelectedRows(updatedSelectedRows);
    }
  };

  const handleDeleteSelected = () => {
    const updatedUsers = users.filter((user) => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setSelectedRows([]);
  };

  const handleSelectAll = () => {
    const allRowsSelected = selectedRows.length === itemPerPage;

    if (allRowsSelected) {
      const newSelectedRows = selectedRows.filter(
        (id) => id < pageVisited || id >= pageVisited + itemPerPage
      );
      setSelectedRows(newSelectedRows);
    } else {
      const newSelectedRows = filteredUsers
        .slice(pageVisited, pageVisited + itemPerPage)
        .map((user) => user.id);
      setSelectedRows([...selectedRows, ...newSelectedRows]);
    }
  };

  const handlePageChange = ({ selected }) => {
    setPageCount(selected);
  };

  return (
    <div className="container">
      <div className="top-right">
        <button className="delete-selected" onClick={handleDeleteSelected}>
          Delete Selected
        </button>
      </div>
      <br />
      <input
        type="text"
        name="name"
        placeholder="Search by any field"
        onChange={(e) => setSearchUser(e.target.value)}
      />

      <table className="table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === itemPerPage && selectedRows.length !== 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.slice(pageVisited, pageVisited + itemPerPage).map((user) => (
            <tr key={user.id} className={selectedRows.includes(user.id) ? "selected-row" : ""}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(user.id)}
                  onChange={() => handleRowSelect(user.id)}
                />
              </td>
              <td>
                {editingUser === user ? (
                  <input
                    type="text"
                    value={editedFields.name}
                    onChange={(e) => handleEditChange(e, "name")}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editingUser === user ? (
                  <input
                    type="text"
                    value={editedFields.email}
                    onChange={(e) => handleEditChange(e, "email")}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUser === user ? (
                  <input
                    type="text"
                    value={editedFields.role}
                    onChange={(e) => handleEditChange(e, "role")}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td className="btn">
                {editingUser === user ? (
                  <>
                    <button onClick={saveUserDetails}>Save</button>
                    <button onClick={() => setEditingUser(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => editUserDetails(user)}>Edit</button>
                    <button onClick={() => deleteUser(user.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <br />

      <ReactPaginate
        className="pagination"
        previousLabel={"Prev"}
        nextLabel={"Next"}
        pageCount={totalPages}
        onPageChange={handlePageChange}
        containerClassName={"pagination"}
        pageRangeDisplayed={visiblePages.length} 
        marginPagesDisplayed={2} 
        initialPage={pageCount} 
      />
    </div>
  );
}

export default UsersList;
