# 📚 Prayer Cell Library

A web-based library portal designed for prayer cell communities to manage and request spiritual books. Users can register, log in, browse the collection, and request physical books to be delivered, with return tracking. Admins can manage inventory, approve requests, and maintain records.

---

## 🌐 Live Demo

[Visit the Live Site](https://prayercell-library.netlify.app/)


---

## 🛠️ Tech Stack

- **Frontend**: Next.js (React + TypeScript), Tailwind CSS, ShadCN UI
- **Backend**: Firebase (Auth, Firestore, Storage), ImageKit (for images)
- **Hosting**: Netlify
- **State Management**: React Context API

---

## 🚀 Features

### 👤 User

- Signup/Login with email and password
- Browse available books
- Request books (with borrowing period)
- View and track requests
- Return book status updates
- Dark mode / Light mode toggle, but now its only working on dark mode.
- Responsive UI for all devices

### 🔐 Admin

- Secure Admin Signup with secret code
- Add, edit, delete books with cover image (ImageKit)
- Approve/reject book requests
- Monitor borrowing and returns
- View registered users

---

## ⚙️ Setup Instructions

### 🔧 1. Clone the Repository

-bash
git clone https://github.com/your-username/prayer-cell-library.git
cd prayer-cell-library

### 2. Install Dependencies
   
npm install

### 3. Set Up Environment Variables
Create a .env.local file in the root directory and add:

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_msg_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

ADMIN_SECRET_CODE=your_admin_secret_code

NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

> 📝 Make sure Firebase and ImageKit are properly configured in the Firebase Console and ImageKit dashboard respectively.


### 4. Run the App
   
```bash
npm run dev
```

## 📁 Folder Structure

```
├── app/                   # Pages and routing
├── components/            # Reusable UI components
├── lib/                   # Firebase, utilities
├── public/                # Static assets
├── styles/                # Global styles
├── .env.local             # Environment variables
etc.
```

### 👥 Contributors

Pavan Kumar K – Full-stack Developer | Firebase, Netlify, ImageKit Integration 

You! – Open for contributions and suggestions 😊


## 🙏 Acknowledgements

- [Firebase](https://firebase.google.com)
- [ImageKit](https://imagekit.io)
- [Netlify](https://www.netlify.com)
- [Next.js](https://nextjs.org)

- With heartfelt gratitude to God for His guidance and grace throughout the development of this project.
