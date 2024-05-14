import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Make sure to create this CSS file

const Login = () => {
	const navigate = useNavigate();
	const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
	const [profileImg, setProfileImg] = useState(null); // State for storing profile image
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		role: "user",
	});

	const toggleForm = () => {
		setIsLogin(!isLogin);
		if (isLogin) {
			// Reset profile image when switching back to the login form
			setProfileImg(null);
		}
	};

	const handleImageChange = (event) => {
		setProfileImg(URL.createObjectURL(event.target.files[0]));
		formData.photo = event.target.files[0]; // Capture file for upload
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!isLogin) {
			const data = new FormData();
			data.append("username", formData.username);
			data.append("email", formData.email);
			data.append("password", formData.password);
			data.append("role", formData.role);
			data.append("photo", formData.photo);

			try {
				const response = await axios.post(
					`${process.env.REACT_APP_BACKEND_IP}api/v1/register`,
					data,
					{ withCredentials: true }
				);
				console.log(response.data);
				if (response.status == 200) {
					alert("Registration successful!");
					toggleForm();
				} else throw new Error(response.message);
			} catch (error) {
				console.error("Registration failed:", error);
				alert("Registration failed!");
			}
		} else {
			try {
				console.log(process.env.REACT_APP_BACKEND_IP);
				const response = await axios.post(
					`${process.env.REACT_APP_BACKEND_IP}api/v1/login`,
					{
						email: formData.email,
						password: formData.password,
					},
					{ withCredentials: true }
				);
				console.log(response.data); // Handle success based on the response
				if (response.status == 200) {
					alert("Login successful!");
					localStorage.setItem("UserID", response.data.user.UserID);
					localStorage.setItem("role", response.data.user.role);
					setTimeout(() => {
						navigate("/");
					}, 1000);
				} else {
					throw new Error(response.message);
				}
			} catch (error) {
				console.error("Login failed:", error);
				alert("Login failed!");
			}
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-form-container">
				{!isLogin && (
					<div className="profile-image-container">
						{profileImg ? (
							<img src={profileImg} alt="Profile" className="profile-image" />
						) : (
							<div className="profile-placeholder">Click to upload</div>
						)}
						<input
							type="file"
							className="image-upload"
							onChange={handleImageChange}
							accept="image/*"
						/>
					</div>
				)}
				<form className="auth-form" onSubmit={handleSubmit}>
					{!isLogin && (
						<input
							type="text"
							placeholder="Username"
							name="username"
							required
							onChange={handleChange}
						/>
					)}
					<input
						type="email"
						placeholder="Email"
						name="email"
						required
						onChange={handleChange}
					/>
					<input
						type="password"
						placeholder="Password"
						name="password"
						required
						onChange={handleChange}
					/>
					<button type="submit">{isLogin ? "Login" : "Register"}</button>
				</form>
			</div>
			<button onClick={toggleForm} className="toggle-form">
				{isLogin
					? "Need an account? Register"
					: "Already have an account? Login"}
			</button>
		</div>
	);
};

export default Login;
