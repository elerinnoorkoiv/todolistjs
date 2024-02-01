const express = require('express')
const app = express()
const fs = require('fs');

// use ejs files to prepare templates for views
const path = require('path')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const readFile = (filename) => {
	return new Promise((resolve, reject) => {
		//get data from file
		fs.readFile(filename, 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
			//tasks list data from file
			const tasks = JSON.parse(data)
			resolve(tasks)
		});
	})
}

const writeFile = (filename, data) => {
	return new Promise((resolve, reject) => {
		// get data from file
		fs.writeFile(filename, data, 'utf-8', err => {
			if (err) {
				console.error(err);
				return;
			}
			resolve(true)
		});
	})
}

app.get('/', (req, res) => {
	// tasks list data from file
	readFile('./tasks.json')
		.then(tasks => {
			res.render('index', {
				tasks: tasks, 
				error: null
			})
		})
	})

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post('/', (req, res) => {
	// control data from form
	let error = null
	if(req.body.task.trim().length == 0){
		error = 'Please insert correct task data'
		readFile('./tasks.json')
		.then(tasks => {
			res.render('index', {
				tasks: tasks,
				error: error
			})
		})
	} else {
	// tasks list data from file
	readFile('./tasks.json')
		.then(tasks => {
			// add new task
			// create new id automatically 
			let index 
			if(tasks.length === 0)
			{
				index = 0
			} else {
				index = tasks[tasks.length-1].id + 1;
			}
			// create task object
			const newTask = {
				"id" : index,
				"task" : req.body.task
			}			
			//add form sent tasks to tasks array
			tasks.push(newTask)			
			data = JSON.stringify(tasks, null, 2)
			writeFile('tasks.json', data)
				// redirect to / to see result
				res.redirect('/')
			})
		}
	})

app.get('/delete-task/:taskId', (req, res) => {
	let deletedTaskId = parseInt(req.params.taskId)
	readFile('./tasks.json')
	.then(tasks => {
		tasks.forEach((task, index) => {
			if(task.id === deletedTaskId) {
				tasks.splice(index, 1)
			}
		})
		data = JSON.stringify(tasks, null, 2)
		writeFile('tasks.json', data)
		// redirect to / to see result
		res.redirect('/')
		})
	}) 

app.get('/delete-tasks/', (req, res) => {
		writeFile('tasks.json', JSON.stringify([]))
		// redirect to / to see result
		res.redirect('/')
	})


app.get('/update-task/:taskId', (req, res) => {
	let taskId = parseInt(req.params.taskId)
	readFile('./tasks.json')
		.then(tasks => {
			let taskText = "";
			tasks.forEach((task, index) => {
				if(task.id === taskId) {
					taskText = task.task
				}
			})

			res.render('updatetask', {
				taskText: taskText, 
				id: taskId,
				error: null
			})
		})
	})
app.post('/update-task/', (req, res) => {
	let taskId = parseInt(req.body.taskId)
	// control data from form
	let error = null
	if(req.body.task.trim().length == 0){
		error = 'Please insert correct task data'
		readFile('./tasks.json')
		.then(tasks => {
			let taskText = "";
			tasks.forEach((task, index) => {
				if(task.id === taskId) {
					taskText = task.task
				}
			})

			res.render('updatetask', {
				taskText: taskText, 
				id: taskId,
				error: error
			})
		})
	} else {
	// tasks list data from file
	readFile('./tasks.json')
		.then(tasks => {
			tasks.forEach((task, index) => {
				if(task.id == req.body.taskId) {
					task.task = req.body.task;
				}
			})

			data = JSON.stringify(tasks, null, 2)
			writeFile('tasks.json', data)
				// redirect to / to see result
				res.redirect('/') 
			})
		}
	})
		
app.listen(3001, () => {
	console.log('Example app is started at http://localhost:3001')
})