document.addEventListener("DOMContentLoaded", function() {
  const guessInputs = document.querySelectorAll('.answer-inputs input');
  const submitButton = document.querySelector('.guess-container button');
  const pixelatedImage = document.getElementById('pixelated-image');
  const timerDisplay = document.getElementById('timer');
  const correctAnswer = "CASTLE";
 
 
  let timeLeft = 90;
  let gameEnded = false;
  let countdownTimer;
  let welcomePopup;
  const SCORE_STORAGE_KEY = 'blrdGameScores';
  let userScores = loadUserScores();
  const LAST_PLAY_DATE_KEY = 'blrdLastPlayDate';
 
  function canPlayGameToday() {
    const lastPlayTimestamp = localStorage.getItem(LAST_PLAY_DATE_KEY);
    if (!lastPlayTimestamp) {
      return true; // User hasn't played before
    }
  
    const todayTimestamp = new Date().setHours(0, 0, 0, 0); // Get the timestamp for the start of today
  
    return todayTimestamp > parseInt(lastPlayTimestamp);
  }
  

  function setLastPlayDate() {
    const timestamp = new Date().getTime(); // Get the current timestamp
    localStorage.setItem(LAST_PLAY_DATE_KEY, timestamp);
  }
 
  function loadUserScores() {
    const storedScores = localStorage.getItem(SCORE_STORAGE_KEY);
    return storedScores ? JSON.parse(storedScores) : [];
  }
 
  function saveUserScores(scores) {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
  }
 
  function getUserStats() {
    const bestScore = Math.min(...userScores);
    const worstScore = Math.max(...userScores);
    const lastFiveScores = userScores.slice(-5);
    const averageLastFive = lastFiveScores.length > 0 ? lastFiveScores.reduce((sum, score) => sum + score, 0) / lastFiveScores.length : 0;
 
 
    return {
      bestScore,
      worstScore,
      averageLastFive
    };
  }
 
 
  function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
 
 
    timerDisplay.textContent = `Time left: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
 
 
    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      timerDisplay.textContent = 'Time is up!';
      gameEnded = true;
      revealCorrectAnswer();
      disableGuessSubmission();
      pixelatedImage.style.filter = 'none';
      showScoreCard(90); // Display score card with fixed score of 90 when time is up
    } else {
      timeLeft--;
      updateImageClarity();
    }
  }
 
 
  function startGame() {
    welcomePopup.style.display = 'none';
    if (canPlayGameToday()) {
      countdownTimer = setInterval(updateTimer, 1000);
      updateTimer();
      guessInputs[0].focus();
      setLastPlayDate();
    } else {
      // User has already played today, show scorecard with the actual score
      revealCorrectAnswer(); // Ensure the correct answer is revealed
      pixelatedImage.style.filter = 'none'; // Ensure the image remains clear
      showScoreCard(getUserScore()); // Display the user's actual score
      disableGuessSubmission();
    }
  }  
  
  function getUserScore() {
    const lastScore = userScores.length > 0 ? userScores[userScores.length - 1] : 0;
    return lastScore;
  }
 
 
  welcomePopup = document.createElement('div');
  welcomePopup.id = 'welcomePopup';
  welcomePopup.classList.add('popup', 'overlay');
  welcomePopup.innerHTML = `
    <div class="popup-content">
      <h2>Welcome to BLRD!</h2>
      <p>A game where you guess the photo before time runs out.</p>
      <p>How to play:</p>
      <ul>
        <li>Click the "Start" button below to begin.</li>
        <li>Try to figure out what the blurred photo is.</li>
        <li>Type your guesses in the boxes below the photo. (Hint: there is one letter per box).</li>
        <li>As the timer counts down, the photo will get clearer, making it easier to see what it is.</li>
        <li>The goal is to correctly guess the photo in the least amount of time. Good luck!</li>
      </ul>
      <button id="startButton">Start</button>
    </div>
  `;
 
 
  document.body.appendChild(welcomePopup);
 
 
  welcomePopup.querySelector('#startButton').addEventListener('click', startGame);
 
 
  function focusOnFirstInput() {
    guessInputs[0].focus();
  }
 
 
  focusOnFirstInput();
 
 
  function handleInput(event) {
    const input = event.target;
    const maxLength = parseInt(input.getAttribute('maxlength'));
    const inputValue = input.value;
     if (inputValue.length >= maxLength) {
      moveFocusToNextInput(input);
    }
     const index = Array.from(guessInputs).indexOf(input);
    guesses[index] = inputValue;
  }
 
 
  function moveFocusToNextInput(currentInput) {
    const index = Array.from(guessInputs).indexOf(currentInput);
    const nextIndex = index + 1;
 
 
    if (nextIndex < guessInputs.length) {
      guessInputs[nextIndex].focus();
    }
  }
 
 
  function handleBackspace(event) {
    const input = event.target;
    if (input.value === '' && event.code === 'Backspace') {
      moveFocusToPreviousInput(input);
    }
  }
 
 
  function moveFocusToPreviousInput(currentInput) {
    const index = Array.from(guessInputs).indexOf(currentInput);
    const prevIndex = index - 1;
 
 
    if (prevIndex >= 0) {
      guessInputs[prevIndex].focus();
      guessInputs[prevIndex].value = '';
    }
  }
 
 
  function handleEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      checkGuess();
    }
  }
 
 
  function showScoreCard(score) {
    const scoreCard = document.createElement('div');
    scoreCard.classList.add('score-card');
     const scoreMessage = document.createElement('p');
    scoreMessage.textContent = `Your score is ${score} seconds!`;
 
 
    const userStats = getUserStats();
    const userStatsMessage = document.createElement('p');
    userStatsMessage.classList.add('user-stats');
    userStatsMessage.innerHTML = `
    <h3><u>Your Stats</u></h3>
    <div class="stat">
      <span class="stat-label">Best Score:</span>
      <span class="stat-value">${userStats.bestScore} seconds</span>
    </div>
    <div class="stat">
      <span class="stat-label">Worst Score:</span>
      <span class="stat-value">${userStats.worstScore} seconds</span>
    </div>
    <div class="stat">
      <span class="stat-label">Average of Last 5 Scores:</span>
      <span class="stat-value">${userStats.averageLastFive.toFixed(2)} seconds</span>
    </div>
  `;
 
 
    const socialMediaIcons = document.createElement('div');
    socialMediaIcons.classList.add('social-icons');
     const facebookCaption = encodeURIComponent(`I solved today's BLRD game in ${score} seconds! Try it out at blrdgame.com`);
    const facebookIcon = createSocialMediaIcon('Facebook', `https://www.facebook.com/sharer/sharer.php?u=https://blrdgame.com&quote=${facebookCaption}`, 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Facebook_Logo_2023.png');
    socialMediaIcons.appendChild(facebookIcon);
     const twitterCaption = encodeURIComponent(`I solved today's BLRD game in ${score} seconds! Try it out at blrdgame.com #game #fun #daily #gamedev #blrd #blrdgame`);
    const twitterIcon = createSocialMediaIcon('Twitter', `https://twitter.com/intent/tweet?url=https://blrdgame.com&text=${twitterCaption}`, 'https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg?w=996&t=st=1705632141~exp=1705632741~hmac=7a1c4054cea68cfc136d5291e138b992449bcfa9cc2b86392006442ea0ad01c0');
    socialMediaIcons.appendChild(twitterIcon);
     const shareViaTextCaption = encodeURIComponent(`I solved today's BLRD game in ${score} seconds! Try it out at blrdgame.com`);
    const shareViaTextIcon = createSocialMediaIcon('Share via Text', `sms:&body=${shareViaTextCaption}`, 'https://cdn.iconscout.com/icon/free/png-256/free-messenger-1859958-1575946.png?f=webp');
    socialMediaIcons.appendChild(shareViaTextIcon);
     scoreCard.appendChild(scoreMessage);
    scoreCard.appendChild(userStatsMessage);
    scoreCard.appendChild(socialMediaIcons);
     document.body.appendChild(scoreCard);
  }
   function createSocialMediaIcon(platform, url, imageUrl) {
    const socialMediaIcon = document.createElement('a');
    socialMediaIcon.href = url;
    socialMediaIcon.target = '_blank';
     const iconImg = document.createElement('img');
    iconImg.src = imageUrl;
    iconImg.alt = `Share on ${platform}`;
    iconImg.style.width = '50px';
     socialMediaIcon.appendChild(iconImg);
     return socialMediaIcon;
  } 
 
 
  function showIncorrectGuessNotification() {
    const notification = document.createElement('div');
    notification.textContent = 'Incorrect guess. Try again!';
    notification.classList.add('notification');
 
 
    document.body.appendChild(notification);
 
 
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }
 
 
  function checkGuess(event) {
    event.preventDefault();
    let userGuess = '';
    guessInputs.forEach(input => {
      userGuess += input.value;
    });
     if (userGuess.toLowerCase() === correctAnswer.toLowerCase()) {
      const score = 90 - timeLeft;
      userScores.push(score);
      saveUserScores(userScores);
       showScoreCard(score);
      clearInterval(countdownTimer);
      pixelatedImage.style.filter = 'none';
    } else {
      clearIncorrectGuess();
      showIncorrectGuessNotification();
    }
  }
 
 
  function clearIncorrectGuess() {
    guessInputs.forEach(input => {
      input.value = '';
    });
 
 
    guessInputs[0].focus();
  }
 
 
  function disableGuessSubmission() {
    submitButton.disabled = true;
    guessInputs.forEach(input => {
      input.disabled = true;
    });
  }
 
 
  function revealCorrectAnswer() {
    for (let i = 0; i < guessInputs.length; i++) {
      const input = guessInputs[i];
      const letter = correctAnswer[i] || '';
       input.value = letter;
      if (gameEnded) {
        input.style.color = '#FFFFFF';
      }
    }
  }
 
 
  function updateImageClarity() {
    const initialBlur = 15;
    const finalBlur = 0;
    const totalTime = 90;
   
    const timeElapsed = 90 - timeLeft;
     if (timeElapsed <= totalTime) {
      const blurPercentage = (timeElapsed / totalTime) * 100;
      const currentBlur = ((100 - blurPercentage) * initialBlur) / 100;
       pixelatedImage.style.filter = `blur(${currentBlur}px)`;
    } else {
      pixelatedImage.style.filter = `blur(${finalBlur}px)`;
    }
  }
   guessInputs.forEach(input => {
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', function(event) {
      const key = event.key;
      if (!/^[a-zA-Z0-9]$/.test(key) && key !== 'Backspace' && key !== 'Delete') {
        event.preventDefault();
      }
      if (key === 'Enter') {
        checkGuess(event);
      }
    });
    input.addEventListener('keyup', handleBackspace);
  });
 
 
  submitButton.addEventListener('click', checkGuess);
 
 
  function handleGuessSubmission(event) {
    event.preventDefault();
    checkGuess();
    clearIncorrectGuess();
    alert('Incorrect guess. Try again!');
  }
 
 
  submitButton.addEventListener('click', function(event) {
    handleGuessSubmission(event);
  });
 
 
  function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
 
 
    timerDisplay.textContent = `Time left: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
 
 
    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      timerDisplay.textContent = 'Time is up!';
      gameEnded = true;
      revealCorrectAnswer();
      disableGuessSubmission();
      pixelatedImage.style.filter = 'none';
      showScoreCard(90);
    } else {
      timeLeft--;
      updateImageClarity();
    }
  }
 
 
 });
