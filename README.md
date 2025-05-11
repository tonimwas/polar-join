# Polar & Join Calculator App

This project is a cross-platform calculator for polar coordinates and join operations, built with a Django (Python) backend and a React (JS/JSX) frontend. The web app can be packaged as an Android app using Capacitor.

---

## Project Structure

```
polarjoin/
├── backend/      # Django backend (API, calculations)
├── frontend/     # React frontend (UI, AJAX)
├── README.md     # Project overview and setup instructions
```

---

## Setup Instructions

### 1. Backend (Django)

- Navigate to the backend directory and set up a virtual environment.
- Install dependencies: `pip install django djangorestframework`
- Run migrations: `python manage.py migrate`
- Start the server: `python manage.py runserver`

### 2. Frontend (React)

- Navigate to the `frontend` folder.
- Run `npx create-react-app .` if not already initialized.
- Start the frontend: `npm start`

### 3. Android Packaging (Capacitor)

- Follow [Capacitor documentation](https://capacitorjs.com/docs/getting-started) to wrap the frontend as an Android app.

---

## Communication

- The React frontend communicates with the Django backend via AJAX calls to `/api/calculate/`.

---

## Next Steps

- Implement calculation logic in Django (`/api/calculate/` endpoint)
- Build React components for input and result display
- Integrate and test web-to-Android packaging