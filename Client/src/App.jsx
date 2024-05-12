import React from 'react'
import Login from './Pages/Login';
import { Route, Router, Routes } from "react-router-dom";
import "./App.css";

function App() {
	return (
		<>
			<Routes>
        <Route path="/login" element={<Login/>}/>
      </Routes>
		</>
	);
}

export default App;
