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

      const cooldownEndTime = Date.now() + (COOLDOWN_DURATION * 1000);
      localStorage.setItem('cooldownEndTime', cooldownEndTime);
      startCooldown(COOLDOWN_DURATION);

      push(ref(database, 'donations'), {
        name,
        amount,
        text,
        timestamp: Date.now()
      })
      .then(() => {
        const randomImages = [
          'http://nititorn007.github.io/donate-to-liz0/assets/puth-go-crazy.jpg',
          'http://nititorn007.github.io/donate-to-liz0/assets/put-smile.jpg',
          'http://nititorn007.github.io/donate-to-liz0/assets/puth-bla.jpg'
        ];
        
        const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
        
        const popup = document.getElementById('imagePopup');
        const customAlert = document.getElementById('customAlert');
        document.getElementById('popupRandomImage').src = randomImage;
        popup.classList.remove('hide');
        popup.classList.add('show');
        
        setTimeout(() => {
          customAlert.classList.remove('hide');
          customAlert.classList.add('show');
        }, 500);
        
        setTimeout(() => {
          customAlert.classList.remove('show');
          customAlert.classList.add('hide');
          setTimeout(() => {
            customAlert.style.display = 'none';
            popup.classList.remove('show');
            popup.classList.add('hide');
            setTimeout(() => {
              popup.style.display = 'none';
            }, 400);
          }, 400);
        }, 3000);
        
        e.target.reset();
      })
      .catch((err) => {
        console.error(err);
        const customAlert = document.getElementById('customAlert');
        customAlert.textContent = 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง';
        customAlert.classList.remove('hide');
        customAlert.classList.add('show');
        setTimeout(() => {
          customAlert.classList.remove('show');
          customAlert.classList.add('hide');
          setTimeout(() => {
            customAlert.style.display = 'none';
          }, 400);
        }, 2000);
      });
    });

    document.getElementById('imagePopup').addEventListener('click', function() {
      this.classList.remove('show');
      this.classList.add('hide');
      document.getElementById('customAlert').classList.remove('show');
      document.getElementById('customAlert').classList.add('hide');
      setTimeout(() => {
        this.style.display = 'none';
        document.getElementById('customAlert').style.display = 'none';
      }, 400);
    });

    const emojis = ['🤑', '💰', '💸', '🎉', '💎', '🙏', '❤️', '✨'];
    const emojiPopup = document.createElement('div');
    emojiPopup.className = 'emoji-popup';
    document.body.appendChild(emojiPopup);

    document.getElementById('submitButton').addEventListener('mouseenter', () => {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      emojiPopup.textContent = randomEmoji;
      
      emojiPopup.style.opacity = '1';
      emojiPopup.style.transform = 'scale(1) translateY(-30px)';
      emojiPopup.style.animation = 'none';
      
      void emojiPopup.offsetWidth;
      
      emojiPopup.style.animation = 'float 3s ease-in-out infinite';
      
      setTimeout(() => {
        emojiPopup.style.opacity = '0';
      }, 1500);
    });