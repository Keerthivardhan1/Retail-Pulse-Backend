# Backend Intern Assignment

This project is a server-side application that processes images using a queue-based architecture, powered by **Express**, **BullMQ**, and **Sharp**. It supports asynchronous task processing and job status tracking, making it suitable for handling high volumes of image processing requests.

## Features

- **Queue Management**: Efficient task queuing with BullMQ.
- **Image Processing**: Download, analyze, and simulate GPU processing for images.
- **Job Tracking**: Monitor the status of each processing job.
- **RESTful API**: Simple and intuitive endpoints for submitting and checking job statuses.

## Prerequisites

Ensure the following are installed on your system:

- Node.js (16 or later)
- Redis server (running on `localhost:6379`)


