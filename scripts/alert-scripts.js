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

// TTS Configuration
const ttsConfig = {
  volume: 1,
  rate: 1.0,
  pitch: 1.0,
  voice: null, // Will be set to Thai voice if available
  lang: 'th-TH'
};

donationSound.volume = 0.2;

let isFirstLoad = true;
let lastKey = null;

// Initialize speech synthesis and find Thai voice
function initSpeechSynthesis() {
  return new Promise((resolve) => {
    const checkVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const thaiVoice = voices.find(voice => voice.lang === 'th-TH' || voice.lang.startsWith('th-'));
        ttsConfig.voice = thaiVoice || voices[0];
        console.log('Using voice:', ttsConfig.voice.name);
        resolve();
      }
    };
    
    speechSynthesis.onvoiceschanged = checkVoices;
    checkVoices(); // Check immediately in case voices are already loaded
  });
}

// Speak text with TTS
function speak(text) {
  return new Promise((resolve, reject) => {
    if (!text || !speechSynthesis) {
      resolve();
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = ttsConfig.volume;
    utterance.rate = ttsConfig.rate;
    utterance.pitch = ttsConfig.pitch;
    utterance.lang = ttsConfig.lang;
    utterance.voice = ttsConfig.voice;
    
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      reject(event.error);
    };
    
    speechSynthesis.speak(utterance);
  });
}

// Format donation message
function formatDonationMessage(data) {
  return `🤑💰💹 ${data.name} โดเนท ${data.amount} บาท\n"${data.text || ''}"`;
}

// Initialize the app
initSpeechSynthesis().then(() => {
  database.ref("donations").limitToLast(1).once("child_added", (snapshot) => {
    lastKey = snapshot.key;
    isFirstLoad = false;
  });

  database.ref("donations").on("child_added", async (snapshot) => {
    if (isFirstLoad || snapshot.key === lastKey) {
      return;
    }

    const data = snapshot.val();
    const donationMessage = formatDonationMessage(data);
    donationText.innerText = donationMessage;

    alertBox.style.display = "block";
    donationSound.currentTime = 0;
    donationSound.play();

    setTimeout(async () => {
      if (data.text) {
        try {
          await speak(data.text);
        } catch (error) {
          console.error("TTS Error:", error);
        }
      }
    }, 3000);

    setTimeout(() => {
      if (alertBox.style.display !== "none") {
        alertBox.style.display = "none";
      }
    }, 10000);
  });
}).catch(error => {
  console.error("Initialization failed:", error);
});