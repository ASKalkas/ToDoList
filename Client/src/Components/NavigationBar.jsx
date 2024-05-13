import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./NavBar.css";

function NavigationBar() {
    const navigate = useNavigate();
	const handleLogout = async () => {
		try {
			const response = await axios.delete(
				`http://localhost:3000/api/v1/users/logout?UserID=${localStorage.getItem("UserID")}`,
				{ withCredentials: true }
			);
            console.log(response.message)
            if(response.status === 200){
                localStorage.removeItem("UserID");
                navigate("/login");
            }
		} catch (error) {
			console.error("logout failed:", error);
			alert("Logout failed!");
		}
	};

	return (
		<nav className="navbar">
			<Link to="/" className="nav-logo">
				ToDoList
			</Link>
			<ul className="nav-links">
				{localStorage.getItem("role") == "admin" && (
					<li className="nav-item">
						<Link to="/users" className="nav-link">
							Users
						</Link>
					</li>
				)}
				<li className="nav-item">
					<Link to="/profile" className="nav-link">
						Profile
					</Link>
				</li>

				<li className="nav-item">
					<button className="logout-button" onClick={handleLogout}>
						Logout
					</button>
				</li>
			</ul>
		</nav>
	);
}

export default NavigationBar;
