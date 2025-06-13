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

    // Add your auth token here
    const AUTH_TOKEN = "F994BFAF5606972823FCD67ACDA9667654A102B11C03B59A91A81B16BD28DA45";

    const submitButton = document.getElementById("submitButton");
    const cooldownLabel = document.getElementById("cooldownLabel");
    const countdownDisplay = document.getElementById("countdown");
    const COOLDOWN_DURATION = 60;

    function startCooldown(secondsLeft) {
      submitButton.disabled = true;
      cooldownLabel.style.display = "block";
      countdownDisplay.textContent = `${secondsLeft}s`;

      const countdownInterval = setInterval(() => {
        secondsLeft--;
        countdownDisplay.textContent = `${secondsLeft}s`;

        if (secondsLeft <= 0) {
          clearInterval(countdownInterval);
          submitButton.disabled = false;
          cooldownLabel.style.display = "none";
          localStorage.removeItem('cooldownEndTime');
        }
      }, 1000);
    }

    window.addEventListener('load', () => {
      const cooldownEndTime = localStorage.getItem('cooldownEndTime');
      if (cooldownEndTime) {
        const now = Date.now();
        const secondsLeft = Math.floor((cooldownEndTime - now) / 1000);
        if (secondsLeft > 0) {
          startCooldown(secondsLeft);
        } else {
          localStorage.removeItem('cooldownEndTime');
        }
      }
    });

    document.getElementById('donation-form').addEventListener('submit', function(e) {
      e.preventDefault();

      const name = e.target.name.value;
      const amount = parseFloat(e.target.amount.value);
      const text = e.target.text.value;

      // Start cooldown
      const cooldownEndTime = Date.now() + (COOLDOWN_DURATION * 1000);
      localStorage.setItem('cooldownEndTime', cooldownEndTime);
      startCooldown(COOLDOWN_DURATION);

      // Push data to Firebase with auth token
      push(ref(database, 'donations'), {
        name,
        amount,
        text: text || null,
        timestamp: Date.now(),
        _authToken: AUTH_TOKEN  // Add the auth token here
      })
      .then(() => {
        alert('ขอบคุณสำหรับการโดเนท!');
        e.target.reset();
      })
      .catch((err) => {
        console.error(err);
        alert('เกิดข้อผิดพลาด: ' + err.message);
        // Reset cooldown on error
        clearInterval(countdownInterval);
        submitButton.disabled = false;
        cooldownLabel.style.display = "none";
        localStorage.removeItem('cooldownEndTime');
      });
    });
