import React from "react";
import Login from "./Pages/Login";
import HomePage from "./Pages/HomePage";
import UserManagement from "./Pages/UserManagement";
import Profile from "./Pages/Profile";
import { Route, Router, Routes } from "react-router-dom";
import "./App.css";

function App() {
	return (
		<>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/" element={<HomePage />} />
				<Route path="/users" element={<UserManagement />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</>
	);
}

export default App;
