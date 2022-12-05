import Todo from "./components/Todo";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import React, { useState, useEffect, useRef } from 'react';
import { nanoid } from "nanoid";

// heres that custom hook again,
// for tracking previous state of a component
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

  // the constants below are defined outside
  // App(), because we don't need them to be
  // recalculated everytime App rerenders. 


  // an object whose values are functions
  // used to filter the tasks data array
  const FILTER_MAP = {
    // return true for all tasks
    All: () => true, 
    // shows tasks whose completed prop is false
    Active: (task) => !task.completed,
    // shows tasks whose completed prop is true
    Completed: (task) => task.completed
  };
  
  const FILTER_NAMES = Object.keys(FILTER_MAP);

function App(props) {

  const [tasks, setTasks] = useState(props.tasks);
  const [filter, setFilter] = useState('All');
  
  useEffect(() => {
    localStorage.setItem('savedTasks', JSON.stringify(tasks));
  }, [tasks]);

  function addTask(name) {
    const newTask = {id: `todo-${nanoid()}`, name: name, completed: false};
    setTasks([...tasks, newTask]); // adds new task at the very end
  }

  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      if (id === task.id) {
        return {
          ...task, completed: !task.completed
        }
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    console.log(id);
    // filter to only include tasks that don't match the id
    const remainingTasks = tasks.filter((task) => task.id !== id);
    setTasks(remainingTasks);

  }

  function editTask(id, newName) {
    const editedTaskList = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task, name: newName
        }
      }
      return task;
    });
    setTasks(editedTaskList);
  }

  // when making it stateful, i replaced props.tasks with just tasks,
  // now that tasks is a state variable
  const taskList = tasks
    .filter(FILTER_MAP[filter])  
    .map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        completed={task.completed}
        key={task.id}
        toggleTaskCompleted={toggleTaskCompleted}
        deleteTask={deleteTask}
        editTask={editTask}
      />
  ));

  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton 
    key={name} 
    name={name}
    isPressed={name === filter}
    setFilter={setFilter}/>
  ))

  // dynamic heading text
  const tasksNoun = taskList.length !== 1 ? 'tasks' : 'task';
  const headingText = `${taskList.length} ${tasksNoun} remaining`;

  const listHeadingRef = useRef(null);

  // by storing the tasks we previously had,
  // we can set up a useEffect hook to run when
  // our number of tasks change...
  // and if the number of tasks we have now is
  // less than it previously was (we deleted a task),
  // we'll focus the heading!
  const prevTaskLength = usePrevious(tasks.length);

  useEffect(() => {
    if (tasks.length - prevTaskLength === -1) {
      listHeadingRef.current.focus();
    }
  }, [tasks.length, prevTaskLength]);
  // the dependencies ^ ensure useEffect will run
  // if either of these values change
  
  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask}/>
      <div className="filters btn-group stack-exception">
        {filterList}
      </div>
      <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}>
        {headingText}
      </h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {taskList}
      </ul>
    </div>
  );
}

export default App;
