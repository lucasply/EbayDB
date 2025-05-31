@echo off
echo Installing backend dependencies...
cd web-backend
npm install

echo Starting server...
start node server.js