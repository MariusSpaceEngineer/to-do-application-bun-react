import Bun from 'bun';
import { readFile } from 'node:fs/promises';

const tasksFile = 'tasks.json';
let tasks: Task[];
let id: string;

async function loadTasksFromFile() {
    let tasks = [];
    try {
        const data = JSON.parse(await readFile(tasksFile, 'utf-8'));
        tasks = data.tasks;
        if (!Array.isArray(tasks)) {
            console.error('tasks.json does not contain a valid JSON array');
            tasks = [];
        }
    } catch (error) {
        console.error('Failed to read or parse tasks.json:', error);
    }
    return tasks;
}

interface Task {
    id: string;
    date: string;
    description: string;
}

// Usage
tasks = await loadTasksFromFile();


const server = Bun.serve({
    port: 3500,
    async fetch(req: Request) {
        const url = new URL(req.url);
        const responseInit: ResponseInit = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
        id = tasks[tasks.length - 1].id;

        if (req.method === 'GET' && url.pathname === '/tasks') {
            // Get all tasks
            if (tasks.length === 0) {
                return new Response('Tasks not found', { status: 404, ...responseInit });
            } else {
                return new Response(JSON.stringify(tasks), { status: 200, ...responseInit });
            }
        }

        if (req.method === 'GET' && url.pathname.startsWith('/tasks/')) {
            // Get a specific task
            const id = url.pathname.split('/')[2];
            const task = tasks.find(t => t.id === id);
            if (task) {
                return new Response(JSON.stringify(task), { status: 200, ...responseInit });
            } else {
                return new Response('Task not found', { status: 404, ...responseInit });
            }
        }

        if (req.method === 'PUT' && url.pathname.startsWith('/tasks/')) {
            // Update a task
            const pathId = url.pathname.split('/')[2];
            const taskIndex = tasks.findIndex(t => t.id === pathId);
            if (taskIndex === -1) {
                return new Response('Task not found', { status: 404, ...responseInit });
            }
            if (req.body) {
                const stream = req.body;
                const taskData: Task = await Bun.readableStreamToJSON(stream);
                const updatedTask: Task =
                {
                    id: pathId,
                    date: taskData.date,
                    description: taskData.description
                };
                tasks[taskIndex] = updatedTask;
                await Bun.write(tasksFile, JSON.stringify({ tasks: tasks }));

                return new Response(JSON.stringify(tasks[taskIndex]), { status: 200, ...responseInit });
            } else {
                return new Response('No task data provided', { status: 400, ...responseInit });
            }
        }

        if (req.method === 'POST' && url.pathname === '/tasks') {
            // Create a new task
            if (req.body) {
                const stream = req.body;
                const taskData: Task = await Bun.readableStreamToJSON(stream);
                const newTask: Task = {
                    id: (parseInt(id) + 1).toString(),
                    date: taskData.date,
                    description: taskData.description
                };
                tasks.push(newTask);
                id = (parseInt(id) + 1).toString();

                await Bun.write(tasksFile, JSON.stringify({ tasks: tasks }))
                return new Response(JSON.stringify(newTask), { status: 201, ...responseInit });
            } else {
                return new Response('No task data provided', { status: 400, ...responseInit });
            }
        }

        if (req.method === 'DELETE' && url.pathname.startsWith('/tasks/')) {
            // Delete a task
            const id = url.pathname.split('/')[2];
            const task = tasks.find(t => t.id === id);

            if (!task) {
                return new Response('Task not found', { status: 404, ...responseInit });
            }

            tasks = tasks.filter(t => t.id !== id);
            await Bun.write(tasksFile, JSON.stringify({ tasks: tasks }))
            return new Response('Task deleted', { status: 200, ...responseInit });
        }


        return new Response('404!', responseInit);
    },
});

