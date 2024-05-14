import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavigationBar from "../Components/NavigationBar";
import "./UserManagement.css"; // Ensure you create this CSS file for styling

function UserManagement() {
	const [users, setUsers] = useState([
		{ id: 1, username: "alice", email: "alice@example.com", role: "admin" },
		{ id: 2, username: "bob", email: "bob@example.com", role: "user" },
		{ id: 3, username: "charlie", email: "charlie@example.com", role: "user" },
	]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_BACKEND_IP}api/v1/users/`,
					{ withCredentials: true }
				);
				console.log(response.data);
				setUsers(response.data.data);
			} catch (error) {
				console.error("Getting Users Failed", error);
			}
		};
		if (!localStorage.getItem("UserID")) {
			navigate("/login");
		}
		fetchUsers();
	}, []);

	const deleteUser = async (userId) => {
		try{
			const response = await axios.delete(
				`${process.env.REACT_APP_BACKEND_IP}api/v1/users/?UserID=${userId}`,
				{ withCredentials: true }
			);
			console.log(response.data);
			setUsers(users.filter((user) => user.UserID !== userId));
		}catch (error) {
			console.error("User wasn't deleted successfully:", error);
		}
	};

	const editRole = async (userId, newRole) => {
		try {
			const response = await axios.put(
				`${process.env.REACT_APP_BACKEND_IP}api/v1/users/profile?UserID=${userId}`,
				{ role: newRole },
				{ withCredentials: true }
			);

			const { role } = response.data.profile;
			console.log(response.data);
			setUsers(
				users.map((user) => {
					if (user.UserID === userId) {
						return { ...user, role: role };
					}
					return user;
				})
			);
		} catch (error) {
			console.error("profile wasn't updated successfully:", error);
		}
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
							<tr key={user.UserID}>
								<td>{user.username}</td>
								<td>{user.email}</td>
								<td>{user.role}</td>
								<td>
									<button onClick={() => deleteUser(user.UserID)}>
										Delete
									</button>
									<button
										onClick={() =>
											editRole(
												user.UserID,
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
