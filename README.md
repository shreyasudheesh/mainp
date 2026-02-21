 Project Description

MedRemind – “Never Miss a Dose, Stay in Control.”

MedRemind is a notification-driven smart medicine reminder and overdose prevention website designed to support elderly people in taking their medicines safely and on time.

The system is activated when the user clicks the medicine-time notification, which opens the website and dynamically checks whether the current time falls within the valid dosage window. It then enables the user to confirm medicine intake either manually or through AI-based pill verification.

The application continuously tracks the number of doses taken per day. If the intake exceeds the prescribed limit, a Malayalam warning is displayed and an automatic call is placed to the caregiver for immediate assistance.

The entire system is designed with a simple, login-free interface, large buttons, voice support, and offline functionality to ensure accessibility for elderly users and reliability in low-connectivity environments.

Tech Stack
Frontend

React.js

Tailwind CSS

JavaScript

Browser APIs

Web Notifications API

Speech Synthesis API (Malayalam voice alerts)

MediaDevices API (Camera access)

Storage

localStorage (for offline data persistence)

AI Integration

Client-side pill detection using camera input

 Features

 Notification-based medicine reminder

 Elderly-friendly login-free interface

 Time-window validation for delayed access

 Manual medicine intake confirmation

 AI-based pill verification using camera

 Overdose detection and prevention

 Automatic caregiver calling during emergency

 SOS emergency support

 Offline working using localStorage

 One-time setup for medicine schedule and caregiver number

 Malayalam voice guidance
 Getting Started


 Installation Commands
# 1️⃣ Clone the repository
git clone https://github.com/your-username/medremind.git

# 2️⃣ Go into the project folder
cd medremind

# 3️⃣ Install all dependencies
npm install

▶️ Run Commands
🔹 Start the development server
npm start

Use:

npm run dev

Then open:

http://localhost:5173
Screenshots


<img width="1920" height="1020" alt="Screenshot 2026-02-21 091130" src="https://github.com/user-attachments/assets/260b4c01-07b0-4711-b163-191176aa1b4e" />
<img width="1920" height="1020" alt="Screenshot 2026-02-21 091038" src="https://github.com/user-attachments/assets/630a085e-d2be-4e78-8e65-4e1bbb629ae0" />
<img width="1920" height="1020" alt="Screenshot 2026-02-21 091057" src="https://github.com/user-attachments/assets/50d90bcb-543a-4dc2-aa55-8c8687f87a68" />

project video
https://drive.google.com/file/d/12J7cop_eEYe03YrGaVk9ZK5gX-c2Naiq/view?usp=sharing

Architecture Diagram
Architecture

MedRemind
├── User Interface
│   ├── Home Page
│   │   ├── Medicine Reminder Cards
│   │   ├── Add Medicine Option
│   │   └── Scan Medicine Option
│   │
│   ├── Add Medicine Page
│   │   ├── Medicine Name Input
│   │   ├── Medicine Time Input
│   │   └── Allowed Dose Input
│   │
│   └── Camera Scan Interface
│
├── Application Logic
│   ├── Medicine Management Module
│   │   ├── Add New Medicine
│   │   └── Store Medicine Schedule
│   │
│   ├── Reminder Display Engine
│   │   └── Generate Flashcard Reminders
│   │
│   ├── Time Validation Engine
│   │   └── Check Current Time with Medicine Time
│   │
│   ├── Dose Tracking System
│   │   ├── Update Taken Count
│   │   └── Compare with Allowed Dose
│   │
│   └── Medicine Verification Module
│       └── Camera Based Pill Detection
│
├── Data Layer
│   └── Local Storage
│       ├── Medicine Details
│       ├── Dosage Limit
│       ├── Daily Taken Count
│       └── Caregiver Number
│
└── Device Services
    ├── Notification Alarm
    ├── Camera Access
    ├── Speech Alert
    └── Phone Call Trigger

 API Documentation

This project does not use a custom backend API.

MedRemind is an offline-first frontend application that uses browser-provided APIs for its core functionality.

 Browser APIs Used

 1. Web Notifications API
Used to trigger medicine-time reminders that open the website when clicked.

Purpose:
- Notify the user at scheduled medicine time.

 2. Speech Synthesis API
Used to provide Malayalam voice guidance for elderly users.

Purpose:
- Voice reminder for medicine intake
- Emergency warning voice alert

3. MediaDevices API (Camera Access)
Used for AI-based pill verification.
Method Used:
``js

Team Members
1.Elizabeth Shiju

2.Shreya S


License

This project is licensed under the MIT License.

You are free to use, modify, and distribute this software with proper attribution.

See the LICENSE file for more details.
