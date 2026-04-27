# Mirae Daw

## Information about this repository

This is the repository that you are going to use **individually** for developing your project. Please use the resources provided in the module to learn about **plagiarism** and how plagiarism awareness can foster your learning.

Regarding the use of this repository, once a feature (or part of it) is developed and **working** or parts of your system are integrated and **working**, define a commit and push it to the remote repository. You may find yourself making a commit after a productive hour of work (or even after 20 minutes!), for example. Choose commit message wisely and be concise.

Please choose the structure of the contents of this repository that suits the needs of your project but do indicate in this file where the main software artefacts are located.

# Project README

## Overview

This project consists of a **Python backend** and a **frontend (Vite + React)**.

You can run the project locally, but for full functionality it is recommended to use the deployed version due to environment variable configuration.

---

## ⚠️ Important Note

Some environment variables are **not included in the `.env` files** and are instead configured in the deployed environment.

Because of this:

* Running locally may require additional manual setup
* The **deployed version is the best way to fully test the application**

---

## 🌐 Deployed Application

To test the application with full functionality, use:

https://mirae-daw-auo7-njtr2g00r-koroxellas-projects.vercel.app/

---

## 🖥️ Running Locally

### 1. Backend Setup (Python)

#### Install dependencies

Make sure you have Python installed, then run:

```bash
pip install -r requirements.txt
```

#### Run the backend

```bash
python run.py
```

The backend will start (typically on `http://localhost:5000`).

---

### 2. Frontend Setup

#### Install dependencies

```bash
npm install
```

#### Run the frontend

```bash
npm run dev
```

---

## 🔧 Environment Variables (Local Setup)

If you want to run the project locally with full functionality:

1. Create a `.env` file in the frontend (if not already present)
2. Add the required environment variables (based on the deployed setup)
3. **Update API URLs**

Example:

```env
VITE_API_URL=http://localhost:5000
```

Important:

* Replace any deployed backend URLs with:

  ```
  http://localhost:5000
  ```

---

## Summary

| Option        | Recommendation               |
| ------------- | ---------------------------- |
| Quick testing | Use deployed site            |
| Development   | Run locally (with env setup) |

---

## Notes

* Backend runs via `run.py`
* Frontend runs via Vite (`npm run dev`)
* Missing environment variables may cause partial functionality locally

---

## Final Advice

If something doesn’t work locally, **it’s likely due to missing environment variables** — in that case, use the deployed version instead.

