// src/components/TodoList.js
import TodoItem from "./TodoItem";
import PropTypes from 'prop-types';
import './TodoList.css'

function TodoList({ items, onEdit, onMarkAsDone, onDelete }) {
	return (
		<div className="todo-list-container">
			{items && items.map((item, index) => (
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

TodoList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
    })).isRequired,
    onEdit: PropTypes.func.isRequired,
    onMarkAsDone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default TodoList;
