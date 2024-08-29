
![Automated_License_Plate_Recognition_System_with_Integrated_Parking_Management](https://github.com/user-attachments/assets/80f83382-93b7-4ad4-b330-ad7e7ecd8520)

## Description
This project is a prototype application designed for automatic license plate recognition and aims to replace traditional parking tickets. Although the application is not currently connected to any payment gateway or IoT devices, it already has a solid use case with a prediction model, an admin app for monitoring status, and a user app for purchasing and viewing history.

## Features
- **Plate Recognition**: Utilizes YOLOv8 for detecting and recognizing vehicle license plates.
- **Parking Management**: Integrated parking management system with admin and mobile applications.

## Installation

### Prerequisites
- **YOLOv8**: Set up YOLOv8 for license plate detection.
- **OpenCV**: Required for reading and processing license plates.
- **Uvicorn**: Install the Uvicorn package to run the model API.
- **Backend**: Set up a standard Express.js application for the backend.
- **Admin Frontend**: Set up the admin frontend using React with Vite.
- **Mobile App**: Set up the mobile app using React Native.
- **Firebase**: Configure Firebase for database management and ensure you have the necessary credentials and configuration files.

### Installation Steps
1. Clone the repository:
   ```bash
   git clone [https://github.com/username/Paperless-Parking-Plate-Recognition.git](https://github.com/frederick542/Paperless-Parking-Plate-Recognition.git)
2. Navigate to the project directory:
    ```bash
    cd Paperless-Parking-Plate-Recognition
3. Install dependencies for the backend:
    ```bash
    cd Backend
    npm install
4. Set up the admin frontend:
    ```bash
    cd ../"Admin App"
    npm install
5. Set up the mobile app:
    ```bash
    cd ../mobile_app
    npm install
Run Tutorial
1. Model API: Start the model API using Uvicorn:
   ```bash
   cd ../"Object Detection"
   uvicorn api:app --reload
2. Backend: Start the backend server:
   ```bash
   cd ../Backend
   npm run server
3. Admin Frontend: Start the admin frontend:
   ```bash
   cd ../"Admin App"
   npm run dev
4. Mobile App: Start the mobile app:
   ```bash
   cd ../mobile_app
   npm start
Usage
* Add Vehicle: Add a vehicle by sending an API request to the readPlate route in the backend.
* Admin App: Use the admin app to modify license plates and monitor parking spaces.
* Mobile App: Use the mobile app to make payments and view parking history.
