document.getElementById('add-todo').addEventListener('click', function() {
    const todoInput = document.getElementById('todo-input');
    const todoText = todoInput.value;
    if (todoText) {
        const todoList = document.getElementById('todo-list');
        const newTodo = document.createElement('li');
        newTodo.textContent = todoText;
        todoList.appendChild(newTodo);
        todoInput.value = '';
    }
});