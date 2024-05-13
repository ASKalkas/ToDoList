// src/components/TodoList.js
import React from "react";
import TodoItem from "./TodoItem";
import './TodoList.css'

function TodoList({ items, onEdit, onMarkAsDone, onDelete }) {
	return (
		<div className="todo-list-container">
			{items.map((item, index) => (
				<TodoItem
					key={index}
					item={item}
					onEdit={onEdit}
					onMarkAsDone={onMarkAsDone}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}

export default TodoList;
