
# Internal HR System

This is a **FullStack HR Management System** built with [Next.js](https://nextjs.org), [React](https://reactjs.org), and [TypeScript](https://www.typescriptlang.org/).

It provides features for user authentication, role-based access, and employee management.
The application is **deployed on AWS EC2** with automated **CI/CD using GitHub Actions**.

---

## Features

### User Authentication

* Sign-in & Sign-out
* Role-based access: Admin and Employee

### Employee Management

* Admin:
  * Add a new employee (Name, Email, Position, Department, Salary)
  * Edit employee details
  * Delete employees

* Employee:
  * View profile 

### Tech Stack

* **Frontend**: Next.js, React, and Bootstrap
* **Backend**: Next.js API Routes (Node.js)
* **Database**: PostgreSQL
* **Version Control:**: GitHub
* **Deployment**: **AWS (EC2)**
* **CI/CD**: **GitHub Actions**

---

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Roles & Access

* **Admin Dashboard**: Full control over employee management
* **Employee Dashboard**: View personal data

---

## Deployment & CI/CD

* **Deployment**: Hosted on **AWS EC2**
* **CI/CD**: Configured with **GitHub Actions** for automatic build and deployment on push

---

## Project Structure

```
/.github
  /workflows
    deploy.yml         → GitHub Actions workflow for CI/CD

/components           → Reusable UI components

/public
  /uploads             → Uploaded files (e.g., profile pictures)

/scripts
  seed.ts              → Database seeding script

/src
  /lib                 → Database and authentication utilities

  /pages
    /api               → API routes (backend logic)
    /auth              → Sign-in/Sign-out pages
    /admin             → Admin dashboard
    /employee          → Employee dashboard
    index.tsx          → Landing page

  /styles              → Global and modular CSS

```

---

## Resources

* [Next.js Documentation](https://nextjs.org/docs)
* [React Docs](https://reactjs.org/)
* [PostgreSQL Docs](https://www.postgresql.org/docs/)
* [GitHub Actions](https://docs.github.com/en/actions)
* [AWS EC2 Docs](https://docs.aws.amazon.com/ec2/)

