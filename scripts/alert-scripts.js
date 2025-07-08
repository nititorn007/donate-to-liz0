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
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
}
const database = firebase.database();

const alertBox = document.getElementById('alertBox');
const donationText = document.getElementById('donationText');
const donationSound = document.getElementById('donationSound');

if (!alertBox || !donationText || !donationSound) {
  console.error('DOM elements missing:', { alertBox, donationText, donationSound });
}

// TTS Configuration
const ttsConfig = {
  volume: 1,
  rate: 1.0,
  pitch: 1.0,
  lang: 'th-TH',
  voices: [],
  currentVoiceIndex: 0
};

// Set audio volume
donationSound.volume = 0.2;

let isFirstLoad = true;
let lastKey = null;
let isAudioUnlocked = false;

// Preload audio
function preloadAudio() {
  return new Promise((resolve) => {
    donationSound.play().then(() => {
      donationSound.pause();
      donationSound.currentTime = 0;
      isAudioUnlocked = true;
      console.log('Audio preloaded');
      resolve();
    }).catch(error => {
      console.warn('Audio preload failed:', error);
      resolve();
    });
  });
}

// Initialize speech synthesis
function initSpeechSynthesis() {
  return new Promise((resolve) => {
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        ttsConfig.voices = voices.filter(voice => voice.lang === 'th-TH' || voice.lang.startsWith('th-'));
        if (!ttsConfig.voices.length) {
          ttsConfig.voices = [voices[0]];
          ttsConfig.rate = 1.2; // Adjust for fallback voice
          ttsConfig.pitch = 0.8;
        }
        console.log('Available voices:', ttsConfig.voices.map(v => v.name));
        resolve();
      }
    };
    
    window.speechSynthesis.onvoiceschanged = checkVoices;
    checkVoices();
    setTimeout(resolve, 5000);
  });
}

// Speak text
function speak(text) {
  return new Promise((resolve, reject) => {
    if (!text || !window.speechSynthesis || !ttsConfig.voices.length) {
      console.warn('TTS unavailable');
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = ttsConfig.volume;
    utterance.rate = ttsConfig.rate;
    utterance.pitch = ttsConfig.pitch;
    utterance.lang = ttsConfig.lang;
    utterance.voice = ttsConfig.voices[ttsConfig.currentVoiceIndex];
    
    utterance.onend = () => {
      ttsConfig.currentVoiceIndex = (ttsConfig.currentVoiceIndex + 1) % ttsConfig.voices.length;
      console.log('Next voice index:', ttsConfig.currentVoiceIndex);
      resolve();
    };
    utterance.onerror = (event) => {
      console.error('TTS error:', event.error);
      reject(event.error);
    };
    
    window.speechSynthesis.speak(utterance);
  });
}

// Format donation message
function formatDonationMessage(data) {
  return `🤑💰💹 ${data.name} โดเนท ${data.amount} บาท\n"${data.text || ''}"`;
}

// Play donation sound
async function playDonationSound() {
  try {
    if (!isAudioUnlocked) await preloadAudio();
    donationSound.currentTime = 0;
    await donationSound.play();
    console.log('Sound played');
  } catch (error) {
    console.error('Sound error:', error);
  }
}

// Show alert box
function showAlertBox(message) {
  if (!alertBox || !donationText) {
    console.error('Cannot show alert: elements missing');
    return;
  }
  donationText.innerText = message;
  alertBox.style.display = 'block';
  alertBox.classList.remove('hide');
  alertBox.classList.add('show');
  console.log('Alert shown:', message);
}

// Hide alert box
function hideAlertBox() {
  if (!alertBox) return;
  if (alertBox.classList.contains('show')) {
    alertBox.classList.remove('show');
    alertBox.classList.add('hide');
    setTimeout(() => {
      alertBox.style.display = 'none';
      console.log('Alert hidden');
    }, 500);
  }
}

// Initialize
Promise.all([initSpeechSynthesis(), preloadAudio()]).then(() => {
  database.ref("donations").limitToLast(1).once("value", (snapshot) => {
    const data = snapshot.val();
    if (data) lastKey = Object.keys(data)[0];
    isFirstLoad = false;
    console.log('Initial lastKey:', lastKey);
  });

  database.ref("donations").on("child_added", async (snapshot) => {
    if (isFirstLoad || snapshot.key === lastKey) {
      console.log('Skipping:', snapshot.key);
      return;
    }

    const data = snapshot.val();
    lastKey = snapshot.key;
    
    if (!data || !data.name || !data.amount) {
      console.log('Invalid data:', data);
      return;
    }

    const donationMessage = formatDonationMessage(data);
    showAlertBox(donationMessage);
    await playDonationSound();

    setTimeout(async () => {
      if (data.text) {
        try {
          await speak(data.text);
        } catch (error) {
          console.error('TTS error:', error);
        }
      }
    }, 3000);

    setTimeout(hideAlertBox, 10000);
  });
}).catch(error => {
  console.error('Init failed:', error);
});

// Unlock audio on click
document.addEventListener('click', () => {
  if (!isAudioUnlocked) preloadAudio();
}, { once: true });