// Firebase logic
// NOTE: Replace the configuration below with your actual Firebase project details

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db;
let app;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized");
} catch (e) {
    console.warn("Firebase initialization failed. Check config in js/firebase.js", e);
}

export async function saveScore(timeMs) {
    if (!db) return;
    try {
        const name = prompt("ENTER INITIALS FOR LEADERBOARD:", "AAA") || "UNK";
        await addDoc(collection(db, "leaderboard"), {
            name: name.substring(0, 3).toUpperCase(),
            time: timeMs,
            date: new Date()
        });
        console.log("Score saved!");
        await loadLeaderboard();
    } catch (e) {
        console.error("Error adding score: ", e);
    }
}

export async function loadLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!db) {
        list.innerHTML = "Connect Firebase to see scores.";
        return;
    }

    list.innerHTML = "Loading...";
    
    try {
        const q = query(collection(db, "leaderboard"), orderBy("time", "asc"), limit(5));
        const querySnapshot = await getDocs(q);
        
        let html = "<ol style='list-style: none; padding: 0;'>";
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const timeStr = formatTime(data.time);
            html += `<li style="margin-bottom: 5px;">${data.name} - ${timeStr}</li>`;
        });
        html += "</ol>";
        list.innerHTML = html;
    } catch (e) {
        console.error("Error loading leaderboard: ", e);
        list.innerHTML = "Error loading scores.";
    }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${pad(minutes)}:${pad(seconds)}:${pad(millis)}`;
}

function pad(n) {
    return n < 10 ? '0' + n : n;
}

