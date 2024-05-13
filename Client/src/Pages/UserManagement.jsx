import React, { useState } from "react";
import NavigationBar from '../Components/NavigationBar';
import "./UserManagement.css"; // Ensure you create this CSS file for styling

function UserManagement() {
	const [users, setUsers] = useState([
		{ id: 1, username: "alice", email: "alice@example.com", role: "admin" },
		{ id: 2, username: "bob", email: "bob@example.com", role: "user" },
		{ id: 3, username: "charlie", email: "charlie@example.com", role: "user" },
	]);

	const deleteUser = (userId) => {
		setUsers(users.filter((user) => user.id !== userId));
	};

	const editRole = (userId, newRole) => {
		setUsers(
			users.map((user) => {
				if (user.id === userId) {
					return { ...user, role: newRole };
				}
				return user;
			})
		);
	};

	return (
		<>
			<NavigationBar />
			<div className="user-management">
				<h1>User Management</h1>
				<table>
					<thead>
						<tr>
							<th>Username</th>
							<th>Email</th>
							<th>Role</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr key={user.id}>
								<td>{user.username}</td>
								<td>{user.email}</td>
								<td>{user.role}</td>
								<td>
									<button onClick={() => deleteUser(user.id)}>Delete</button>
									<button
										onClick={() =>
											editRole(
												user.id,
												user.role === "admin" ? "user" : "admin"
											)
										}
									>
										Toggle Role
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}

export default UserManagement;
