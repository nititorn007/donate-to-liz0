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

// TTS Configuration with multiple voice options
const ttsConfig = {
  volume: 1,
  rate: 1.0,
  pitch: 1.0,
  lang: 'th-TH',
  voices: [], // Store available Thai voices
  currentVoiceIndex: 0 // Track current voice for cycling
};

// Set audio volume
donationSound.volume = 0.2;

let isFirstLoad = true;
let lastKey = null;
let isAudioUnlocked = false;

// Preload audio to bypass autoplay restrictions
function preloadAudio() {
  return new Promise((resolve) => {
    donationSound.play().then(() => {
      donationSound.pause();
      donationSound.currentTime = 0;
      isAudioUnlocked = true;
      console.log('Audio preloaded successfully');
      resolve();
    }).catch(error => {
      console.warn('Audio preload failed:', error);
      resolve(); // Continue even if preload fails
    });
  });
}

// Initialize speech synthesis and find Thai voices
function initSpeechSynthesis() {
  return new Promise((resolve) => {
    const checkVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        ttsConfig.voices = voices.filter(voice => voice.lang === 'th-TH' || voice.lang.startsWith('th-'));
        if (ttsConfig.voices.length === 0) {
          ttsConfig.voices = [voices[0]]; // Fallback to first available voice
        }
        console.log('Available Thai voices:', ttsConfig.voices.map(v => v.name));
        resolve();
      }
    };
    
    speechSynthesis.onvoiceschanged = checkVoices;
    checkVoices();
    setTimeout(resolve, 5000); // Fallback if voices don't load
  });
}

// Speak text with TTS, cycling through voices for variety
function speak(text) {
  return new Promise((resolve, reject) => {
    if (!text || !speechSynthesis || ttsConfig.voices.length === 0) {
      console.warn('TTS not available or no text provided');
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
      // Cycle to next voice for the next donation
      ttsConfig.currentVoiceIndex = (ttsConfig.currentVoiceIndex + 1) % ttsConfig.voices.length;
      console.log('Next voice index:', ttsConfig.currentVoiceIndex);
      resolve();
    };
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

// Play donation sound with error handling
async function playDonationSound() {
  try {
    if (!isAudioUnlocked) {
      await preloadAudio();
    }
    donationSound.currentTime = 0;
    await donationSound.play();
    console.log('Donation sound played successfully');
  } catch (error) {
    console.error('Error playing donation sound:', error);
  }
}

// Show and hide alert box
function showAlertBox(message) {
  donationText.innerText = message;
  alertBox.style.display = 'block';
  alertBox.classList.remove('hide');
  alertBox.classList.add('show');
}

// Hide alert box
function hideAlertBox() {
  if (alertBox.classList.contains('show')) {
    alertBox.classList.remove('show');
    alertBox.classList.add('hide');
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 500);
  }
}

// Initialize the app
Promise.all([initSpeechSynthesis(), preloadAudio()]).then(() => {
  // Get the most recent donation to set lastKey
  database.ref("donations").limitToLast(1).once("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      lastKey = Object.keys(data)[0];
    }
    isFirstLoad = false;
    console.log('Initial lastKey:', lastKey);
  });

  // Listen for new donations
  database.ref("donations").on("child_added", async (snapshot) => {
    if (isFirstLoad || snapshot.key === lastKey) {
      console.log('Skipping initial or duplicate donation:', snapshot.key);
      return;
    }

    const data = snapshot.val();
    lastKey = snapshot.key;
    
    if (!data || !data.name || !data.amount) {
      console.log("Skipping - invalid donation data:", data);
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
          console.error("TTS Error:", error);
        }
      }
    }, 3000);

    setTimeout(hideAlertBox, 10000);
  });
}).catch(error => {
  console.error("Initialization failed:", error);
});

// Unlock audio on first user interaction
document.addEventListener('click', () => {
  if (!isAudioUnlocked) {
    preloadAudio();
  }
}, { once: true });