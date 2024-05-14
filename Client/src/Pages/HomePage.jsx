// src/HomePage.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TodoList from "../Components/TodoList";
import NavigationBar from "../Components/NavigationBar";
import "./HomePage.css";

function HomePage() {
	const navigate = useNavigate();
	const [todos, setTodos] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [newTodo, setNewTodo] = useState({
		title: "",
		description: "",
		dueDate: "",
		isDone: false,
	});

	const convertDate = (date) => {
		let newDate = new Date(date);

		// Extract the day, month, and year from the date object
		const day = newDate.getDate().toString().padStart(2, "0");
		const month = (newDate.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-indexed
		const year = newDate.getFullYear();

		// Format the date as dd/mm/yyyy
		const formattedDate = `${year}-${month}-${day}`;
		return formattedDate;
	};

	const fetchTodos = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_BACKEND_IP}api/v1/list?UserID=${localStorage.getItem(
					"UserID"
				)}`,
				{ withCredentials: true }
			);
			console.log(response.data);
			setTodos(response.data.data);
		} catch (error) {
			console.error("Item wasn't added successfully:", error);
		}
	};

	useEffect(() => {
		if (!localStorage.getItem("UserID")) {
			navigate("/login");
		}
		fetchTodos();
	}, []);

	const handleEdit = (ItemID) => {
		const newTodos = todos.map((item, idx) => {
			if (ItemID === item.ItemID) {
				setShowForm(true);
				setIsEditing(true);
				setNewTodo({
					ItemID: todos[idx].ItemID,
					title: todos[idx].title,
					description: todos[idx].description,
					dueDate: todos[idx].dueDate,
					id: todos[idx].id,
					isDone: todos[idx].isDone,
					UserID: todos[idx].UserID,
				});
				console.log(todos[idx].dueDate);
			}
			return item;
		});
		setTodos(newTodos);
	};

	const handleMarkAsDone = (ItemID) => {
		todos.map(async (item, idx) => {
			if (ItemID === item.ItemID) {
				const updatedItem = { ...item, isDone: !item.isDone };
				try {
					const response = await axios.put(
						`${process.env.REACT_APP_BACKEND_IP}api/v1/list?ItemID=${updatedItem.ItemID}`,
						updatedItem,
						{ withCredentials: true }
					);
					console.log(response.data);
				} catch (error) {
					console.error("Item wasn't updated successfully:", error);
				}
				todos[idx] = updatedItem;
			}
		});
		setTimeout(() => {
			fetchTodos();
		}, 500);
	};

	const handleDelete = async (ItemID) => {
		try {
			const response = await axios.delete(
				`${process.env.REACT_APP_BACKEND_IP}api/v1/list/?ItemID=${ItemID}`,
				{ withCredentials: true }
			);
			console.log(response.data);
			setTimeout(() => {
				fetchTodos();
			}, 500);
		} catch (error) {
			console.error("User wasn't deleted successfully:", error);
		}
	};

	const handleAddItem = () => {
		setIsEditing(false);
		setShowForm(true);
	};

	const handleFormChange = (e) => {
		setNewTodo({ ...newTodo, [e.target.name]: e.target.value });
	};

	const handleSubmit = async () => {
		if (newTodo.title && newTodo.description && newTodo.dueDate) {
			if (!isEditing) {
				setShowForm(false);
				const data = { ...newTodo, isDone: false };
				try {
					const response = await axios.post(
						`${process.env.REACT_APP_BACKEND_IP}api/v1/list?UserID=${localStorage.getItem(
							"UserID"
						)}`,
						data,
						{ withCredentials: true }
					);
					console.log(response.data);
					fetchTodos();
				} catch (error) {
					console.error("Item wasn't added successfully:", error);
				}
				setNewTodo({ title: "", description: "", dueDate: "", isDone: false }); // Reset form
			} else {
				setShowForm(false);
				const data = { ...newTodo };
				try {
					const response = await axios.put(
						`${process.env.REACT_APP_BACKEND_IP}api/v1/list?ItemID=${data.ItemID}`,
						data,
						{ withCredentials: true }
					);
					console.log(response.data);
					fetchTodos();
				} catch (error) {
					console.error("Item wasn't updated successfully:", error);
				}
				setNewTodo({ title: "", description: "", dueDate: "", isDone: false }); // Reset form
			}
		} else {
			alert("Please fill out all fields.");
		}
	};

	const handleCloseForm = () => {
		setShowForm(false);
	};

	return (
		<>
			<NavigationBar />
			<div className="home-page">
				<div>
					<h1>My Todo List</h1>
					{todos && <TodoList
						items={todos}
						onEdit={handleEdit}
						onMarkAsDone={handleMarkAsDone}
						onDelete={handleDelete}
					/>}
					<button className="add-item-button" onClick={handleAddItem}>
						Add Item
					</button>
					{showForm && (
						<div className="modal">
							<div className="modal-content">
								<span className="close" onClick={handleCloseForm}>
									&times;
								</span>
								<h2>Add New Todo</h2>
								<form>
									<label>Title:</label>
									<input
										type="text"
										name="title"
										value={newTodo.title}
										onChange={handleFormChange}
									/>
									<label>Description:</label>
									<textarea
										name="description"
										value={newTodo.description}
										onChange={handleFormChange}
									/>
									<label>Due Date:</label>
									<input
										type="date"
										name="dueDate"
										value={convertDate(newTodo.dueDate) == "NaN-NaN-NaN"? convertDate((new Date()).toISOString()):convertDate(newTodo.dueDate)}
										onChange={handleFormChange}
										min={new Date().toISOString().split('T')[0]}
									/>
									<button type="button" onClick={handleSubmit}>
										Submit
									</button>
								</form>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default HomePage;
