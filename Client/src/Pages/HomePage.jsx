// src/HomePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TodoList from "../Components/TodoList";
import NavigationBar from "../Components/NavigationBar";
import "./HomePage.css";

function HomePage() {
	const navigate = useNavigate();
	const [todos, setTodos] = useState([]);

	useEffect(() => {
		const fetchTodos = async () => {
			// const response = await fetch('https://api.example.com/todos');
			// const data = await response.json();
			// setTodos(data);
			setTodos([
				{
					id: 1,
					title: "Learn React",
					description:
						"Study the basics of React Study the basics of React Study the basics of React Study the basics of React Study the basics of React Study the basics of React Study the basics of React ",
					dueDate: "2024-05-20",
					isDone: false,
				},
				{
					id: 2,
					title: "Grocery Shopping",
					description: "Buy vegetables and fruits",
					dueDate: "2024-05-18",
					isDone: false,
				},
				{
					id: 1,
					title: "Learn React",
					description:
						"Study the basics of React Study the basics of React Study the basics of React Study the basics of React Study the basics of React Study the basics of React Study the basics of React ",
					dueDate: "2024-05-20",
					isDone: false,
				},
			]);
		};
		if (!localStorage.getItem("UserID")) {
			navigate("/login");
		}
		fetchTodos();
	}, []);

	const handleAddItem = () => {
		const newText = prompt("Enter new todo item:");
		if (newText) {
			setTodos([...todos, { text: newText }]);
		}
	};

	const handleEdit = (index) => {
		const newText = prompt("Edit your todo item:", todos[index].description);
		if (newText) {
			const newTodos = [...todos];
			newTodos[index].description = newText;
			setTodos(newTodos);
		}
	};

	const handleMarkAsDone = (index) => {
		const newTodos = todos.map((item, idx) => {
			if (idx === index) {
				const updatedItem = { ...item, isDone: !item.isDone };
				return updatedItem;
			}
			return item;
		});
		setTodos(newTodos);
	};

	const handleDelete = (index) => {
		const newTodos = todos.filter((_, idx) => idx !== index);
		setTodos(newTodos);
	};

	return (
		<>
			<NavigationBar />
			<div className="home-page">
				<div>
					<h1>My Todo List</h1>
					<TodoList
						items={todos}
						onEdit={handleEdit}
						onMarkAsDone={handleMarkAsDone}
						onDelete={handleDelete}
					/>
					<button className="add-item-button" onClick={handleAddItem}>
						Add Item
					</button>
				</div>
			</div>
		</>
	);
}

export default HomePage;
