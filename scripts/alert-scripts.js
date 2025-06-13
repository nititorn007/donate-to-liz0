// Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyCzrFwEPXJx6RsuiJPt48TMd6YwTr8TMd6YwTr8bno0",
      authDomain: "donation-liz0.firebaseapp.com",
      databaseURL: "https://donation-liz0-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "donation-liz0",
      storageBucket: "donation-liz0.firebasestorage.app",
      messagingSenderId: "471861664830",
      appId: "1:471861664830:web:cedf5d595ede7046cf456f"
    };
  
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
  
    const alertBox = document.getElementById('alertBox');
    const donationText = document.getElementById('donationText');
    const donationSound = document.getElementById('donationSound');
  
    donationSound.volume = 0.2;
  
    let isFirstLoad = true;
    let lastKey = null;
  
    database.ref("donations").limitToLast(1).once("child_added", (snapshot) => {
      lastKey = snapshot.key;
      isFirstLoad = false;
    });
  
    database.ref("donations").on("child_added", (snapshot) => {
      if (isFirstLoad || snapshot.key === lastKey) {
        // ถ้าเพิ่งโหลดครั้งแรก หรือเป็นตัวสุดท้ายตอนโหลด ไม่ต้องเล่น
        return;
      }
  
      const data = snapshot.val();
      const donationMessage = `🤑💰💹 ${data.name} โดเนท ${data.amount} บาท\n"${data.text || ''}"`;
      donationText.innerText = donationMessage;
  
      alertBox.style.display = "block";
      donationSound.currentTime = 0;
      donationSound.play();
  
      const utterance = new SpeechSynthesisUtterance(data.text || "");
      utterance.lang = 'th-TH';
      utterance.rate = 1.0;
  
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        alert("Sorry, speech synthesis failed.");
      };
  
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, 3000);
  
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 10000);
    });
