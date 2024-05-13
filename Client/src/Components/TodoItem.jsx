// src/components/TodoItem.js
import { useState } from "react";
import PropTypes from 'prop-types';
import "./TodoList.css";

function TodoItem({ item, onEdit, onMarkAsDone, onDelete }) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleDescription = () => {
		setIsExpanded(!isExpanded);
	};

	const convertDate = (date) => {
		let newDate = new Date(date);

		// Extract the day, month, and year from the date object
		const day = newDate.getDate().toString().padStart(2, "0");
		const month = (newDate.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-indexed
		const year = newDate.getFullYear();

		// Format the date as dd/mm/yyyy
		const formattedDate = `${day}/${month}/${year}`;
		return formattedDate;
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
			<p>Due by: {convertDate(item.dueDate)}</p>
			<p>Status: {item.isDone ? "Done" : "Pending"}</p>
			<div>
				<button onClick={() => onEdit(item.ItemID)}>Edit</button>
				<button onClick={() => onMarkAsDone(item.ItemID)}>
					{item.isDone ? "Undo" : "Mark as Done"}
				</button>
				<button onClick={() => onDelete(item.ItemID)}>Delete</button>
			</div>
		</div>
	);
}

TodoItem.propTypes = {
    item: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        dueDate: PropTypes.string,
        isDone: PropTypes.bool,
        ItemID: PropTypes.string
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onMarkAsDone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default TodoItem;
