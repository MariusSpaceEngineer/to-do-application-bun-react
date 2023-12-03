# Project Overview

This project is a to-do application that uses the BUN framework for the backend and React for the frontend. The application allows you to view created tasks, each consisting of a description and a date. You can also update and delete tasks.

## Running the Application on Windows

1. Start the docker-compose file using the command: `docker compose up`
2. Navigate to the React project with the command: `cd .\react_frontend`
3. Install the dependencies with the command: `npm install`
4. Start the React project with the command: `npm start`

## Running the Application on Linux

1. Navigate to the BUN backend project folder with the command: `cd ./bun_backend`
2. Start the BUN project with the command: `bun start run`
3. Navigate to the React project with the command: `cd ./react_frontend`
4. Install the dependencies with the command: `npm install`
5. Start the React project with the command: `npm start`

Please note that the frontend runs on `http://localhost:3000/` and the backend on `http://localhost:3500/`
