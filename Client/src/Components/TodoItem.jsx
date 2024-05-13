// src/components/TodoItem.js
import React, { useState } from "react";
import "./TodoList.css";

function TodoItem({ item, onEdit, onMarkAsDone, onDelete }) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleDescription = () => {
		setIsExpanded(!isExpanded);
	};
	return (
		<div className="todo-item">
			<h3>{item.title}</h3>
			<p
				className={`todo-item-description ${isExpanded ? "expanded" : ""}`}
				onClick={toggleDescription}
			>
				{item.description}
			</p>
			<p>Due by: {item.dueDate}</p>
			<p>Status: {item.isDone ? "Done" : "Pending"}</p>
			<div>
				<button onClick={() => onEdit(item.id)}>Edit</button>
				<button onClick={() => onMarkAsDone(item.id)}>
					{item.isDone ? "Undo" : "Mark as Done"}
				</button>
				<button onClick={() => onDelete(item.id)}>Delete</button>
			</div>
		</div>
	);
}

export default TodoItem;
