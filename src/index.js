const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ error: "Username not exists" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const findUsernameAlreadyExists = users.find(user => user.username === username);

  if(findUsernameAlreadyExists) {
    return response.status(400).json({error: 'Mensagem do erro'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const user = request.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {id} = request.params;
  const user = request.user;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1){
    return response.status(404).json({error: 'Mensagem de erro'})
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = deadline;

  return response.status(200).json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const user = request.user;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1){
    return response.status(404).json({error: 'Mensagem de erro'})
  }

  user.todos[todoIndex].done = true;

  return response.status(200).json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const user = request.user;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Mensagem de erro'})
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;