import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavigationBar from "../Components/NavigationBar";
import "./Profile.css"; // Ensure you have this CSS file for styling

function Profile() {
	const [userProfile, setUserProfile] = useState({
		username: "johndoe",
		email: "john.doe@example.com",
		role: "User",
		profilePic: "data:image/png;base64,", // Placeholder image
	});
	const [editMode, setEditMode] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_BACKEND_IP}api/v1/users/profile?UserID=${localStorage.getItem(
						"UserID"
					)}`,
					{ withCredentials: true }
				);

				console.log(response.data);
				const { username, email, role, profilePic } = response.data.profile;
				setUserProfile({
					username: username,
					email: email,
					role: role,
					profilePic: `data:image/png;base64,${profilePic}`,
				});
			} catch (error) {
				console.error("profile wasn't obtained successfully:", error);
			}
		};
		if (!localStorage.getItem("UserID")) {
			navigate("/login");
		}
		fetchProfile();
	}, []);

	// Function to handle changing the profile picture
	const handleImageChange = async (event) => {
		if (event.target.files && event.target.files[0]) {
			let img = URL.createObjectURL(event.target.files[0]);
			setUserProfile({ ...userProfile, profilePic: img });

			const data = new FormData();
			data.append("photo", event.target.files[0]);

			try {
				const response = await axios.put(
					`${process.env.REACT_APP_BACKEND_IP}api/v1/users/profilePicture?UserID=${localStorage.getItem(
						"UserID"
					)}`,
					data,
					{withCredentials: true},
				);
				console.log(response.data);
			} catch (error) {
				console.error("update failed", error);
			}
		}
	};

	// Handle changes to user details
	const handleChange = (event) => {
		const { name, value } = event.target;
		setUserProfile({ ...userProfile, [name]: value });
	};

	// Toggle edit mode
	const toggleEdit = async () => {
		if (editMode) {
			try {
				const response = await axios.put(
					`${process.env.REACT_APP_BACKEND_IP}api/v1/users/profile?UserID=${localStorage.getItem(
						"UserID"
					)}`,
					{
						email: userProfile.email,
						username: userProfile.username,
						role: userProfile.role,
					},
					{ withCredentials: true }
				);
				console.log(response.data);
			} catch (error) {
				console.error("profile wasn't obtained successfully:", error);
			}
		}
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
