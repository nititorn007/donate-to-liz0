import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzrFwEPXJx6RsuiJPt48TMd6YwTr8bno0",
  authDomain: "donation-liz0.firebaseapp.com",
  databaseURL: "https://donation-liz0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "donation-liz0",
  storageBucket: "donation-liz0.firebasestorage.app",
  messagingSenderId: "471861664830",
  appId: "1:471861664830:web:cedf5d595ede7046cf456f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const AUTH_TOKEN = "F994BFAF5606972823FCD67ACDA9667654A102B11C03B59A91A81B16BD28DA45";

// Cooldown variables
let cooldownInterval;
const COOLDOWN_DURATION = 60;
const submitButton = document.getElementById("submitButton");
const cooldownLabel = document.getElementById("cooldownLabel");
const countdownDisplay = document.getElementById("countdown");

function startCooldown(secondsLeft) {
  submitButton.disabled = true;
  cooldownLabel.style.display = "block";
  countdownDisplay.textContent = `${secondsLeft}s`;

  cooldownInterval = setInterval(() => {
    secondsLeft--;
    countdownDisplay.textContent = `${secondsLeft}s`;

    if (secondsLeft <= 0) {
      clearInterval(cooldownInterval);
      submitButton.disabled = false;
      cooldownLabel.style.display = "none";
      localStorage.removeItem('cooldownEndTime');
    }
  }, 1000);
}

window.addEventListener('load', () => {
  const cooldownEndTime = localStorage.getItem('cooldownEndTime');
  if (cooldownEndTime) {
    const secondsLeft = Math.floor((cooldownEndTime - Date.now()) / 1000);
    if (secondsLeft > 0) {
      startCooldown(secondsLeft);
    } else {
      localStorage.removeItem('cooldownEndTime');
    }
  }
});

document.getElementById('donation-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  try {
    // Validate inputs
    const name = e.target.name.value.trim();
    const amount = parseFloat(e.target.amount.value);
    const text = e.target.text.value.trim();
    
    if (!name || name.length > 50) {
      throw new Error('ชื่อต้องมีความยาว 1-50 ตัวอักษร');
    }
    
    if (isNaN(amount) {
      throw new Error('กรุณากรอกจำนวนเงินที่ถูกต้อง');
    }

    // Prepare data EXACTLY matching your rules
    const donationData = {
      name: name,
      amount: amount,
      timestamp: Date.now(),
      _authToken: AUTH_TOKEN
    };

    // Only add text if not empty (null as per your rules)
    if (text) {
      if (text.length > 150) {
        throw new Error('ข้อความยาวเกิน 150 ตัวอักษร');
      }
      donationData.text = text;
    } else {
      donationData.text = null;
    }

    // Start cooldown
    const cooldownEndTime = Date.now() + (COOLDOWN_DURATION * 1000);
    localStorage.setItem('cooldownEndTime', cooldownEndTime);
    startCooldown(COOLDOWN_DURATION);

    // Debug: Log the exact data structure
    console.log("Submitting:", JSON.stringify(donationData, null, 2));

    // Push to Firebase
    await push(ref(database, 'donations'), donationData);
    
    alert('ขอบคุณสำหรับการโดเนท!');
    e.target.reset();

  } catch (err) {
    console.error("Submission error:", err);
    
    // Reset cooldown on error
    clearInterval(cooldownInterval);
    submitButton.disabled = false;
    cooldownLabel.style.display = "none";
    localStorage.removeItem('cooldownEndTime');
    
    alert('เกิดข้อผิดพลาด: ' + err.message);
  }
});
