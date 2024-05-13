import React, { useState } from "react";
import NavigationBar from "../Components/NavigationBar";
import "./Profile.css"; // Ensure you have this CSS file for styling

function Profile() {
	const [userProfile, setUserProfile] = useState({
		username: "johndoe",
		email: "john.doe@example.com",
		role: "User",
		profilePic: "https://via.placeholder.com/150", // Placeholder image
	});
	const [editMode, setEditMode] = useState(false);

	// Function to handle changing the profile picture
	const handleImageChange = (event) => {
		if (event.target.files && event.target.files[0]) {
			let img = URL.createObjectURL(event.target.files[0]);
			setUserProfile({ ...userProfile, profilePic: img });
		}
	};

	// Handle changes to user details
	const handleChange = (event) => {
		const { name, value } = event.target;
		setUserProfile({ ...userProfile, [name]: value });
	};

	// Toggle edit mode
	const toggleEdit = () => {
		setEditMode(!editMode);
	};

	return (
		<>
			<NavigationBar />
			<div className="profile-container">
				<h1>User Profile</h1>
				<div className="profile-info">
					<input
						type="file"
						id="file-input"
						style={{ display: "none" }}
						onChange={handleImageChange}
						accept="image/*"
					/>
					<label htmlFor="file-input">
						<img
							src={userProfile.profilePic}
							alt="Profile"
							className="profile-pic"
							style={{ cursor: "pointer" }}
						/>
					</label>
					{editMode ? (
						<>
							<input
								type="text"
								name="username"
								value={userProfile.username}
								onChange={handleChange}
							/>
							<input
								type="email"
								name="email"
								value={userProfile.email}
								onChange={handleChange}
							/>
						</>
					) : (
						<>
							<p>
								<strong>Username:</strong> {userProfile.username}
							</p>
							<p>
								<strong>Email:</strong> {userProfile.email}
							</p>
						</>
					)}
					<p>
						<strong>Role:</strong> {userProfile.role}
					</p>
					<button onClick={toggleEdit}>
						{editMode ? "Save Changes" : "Edit Profile"}
					</button>
				</div>
			</div>
		</>
	);
}

export default Profile;
