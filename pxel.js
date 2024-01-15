document.addEventListener("DOMContentLoaded", function() {
  const guessInputs = document.querySelectorAll('.answer-inputs input');
  const submitButton = document.querySelector('.guess-container button');
  const pixelatedImage = document.getElementById('pixelated-image'); // Assuming this is your image element
  const timerDisplay = document.getElementById('timer');
  const correctAnswer = "STONEHENGE"; // Replace with the actual correct answer
  const localStorageKey = 'blrd_last_played'; // Unique key for storing the last played date

  function canPlayGame() {
    const lastPlayedDate = localStorage.getItem(localStorageKey);

    if (!lastPlayedDate) {
      return true; // User has not played before
    }

    const currentDate = new Date();
    const lastPlayed = new Date(lastPlayedDate);

    // Check if the current date is later than the last played date
    return currentDate > lastPlayed;
  }

  function setLastPlayedDate() {
    const currentDate = new Date();
    localStorage.setItem(localStorageKey, currentDate.toISOString());
  }

  function startGame() {
    if (canPlayGame()) {
      welcomePopup.style.display = 'none';
      countdownTimer = setInterval(updateTimer, 1000);
      updateTimer();
      guessInputs[0].focus();
      setLastPlayedDate(); // Record the date when the game starts
    } else {
      alert('You can only play once per day. Try again tomorrow!');
    }
  }

  welcomePopup.querySelector('#startButton').addEventListener('click', startGame);

  let timeLeft = 90;
  let gameEnded = false;
  let countdownTimer; // Declare countdownTimer here

  let welcomePopup; // Declare welcomePopup in the global scope

  function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    timerDisplay.textContent = `Time left: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      timerDisplay.textContent = 'Time is up!';
      gameEnded = true;
      revealCorrectAnswer(); // Reveal the correct answer if time is up
      disableGuessSubmission();
      pixelatedImage.style.filter = 'none'; // Make the image fully clear
    } else {
      timeLeft--;
      updateImageClarity(); // Update image clarity on each timer tick
    }
  }

  function startGame() {
    welcomePopup.style.display = 'none'; // Hide the welcome popup
    countdownTimer = setInterval(updateTimer, 1000); // Start the timer
    updateTimer(); // Update the timer immediately upon starting the game
    guessInputs[0].focus(); // Focus on the first input field
  }

  welcomePopup = document.createElement('div'); // Define welcomePopup in the global scope
  welcomePopup.id = 'welcomePopup';
  welcomePopup.classList.add('popup', 'overlay'); // Added 'overlay' class for styling
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
        <!-- Add your game rules here -->
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
      guessInputs[prevIndex].value = ''; // Clear content of previous input
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
  
    const socialMediaIcons = document.createElement('div');
    socialMediaIcons.classList.add('social-icons');
  
    const facebookCaption = encodeURIComponent(`I solved today's BLRD game in ${score} seconds! Try is out at blrdgame.com`);
    const facebookIcon = createSocialMediaIcon('Facebook', `https://www.facebook.com/sharer/sharer.php?u=https://blrdgame.com&quote=${facebookCaption}`, 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Facebook_Logo_2023.png');
    socialMediaIcons.appendChild(facebookIcon);
  
    const twitterCaption = encodeURIComponent(`I solved today's BLRD game in ${score} seconds! Try is out at blrdgame.com`);
    const twitterIcon = createSocialMediaIcon('Twitter', `https://twitter.com/intent/tweet?url=https://blrdgame.com&text=${twitterCaption}`, 'https://upload.wikimedia.org/wikipedia/commons/9/95/Twitter_new_X_logo.png');
    socialMediaIcons.appendChild(twitterIcon);
  
    const instagramCaption = encodeURIComponent(`I solved today's BLRD game in ${score} seconds! Try is out at blrdgame.com`);
    const instagramIcon = createSocialMediaIcon('Instagram', `https://www.instagram.com/?url=https://blrdgame.com&caption=${instagramCaption}`, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png');
    socialMediaIcons.appendChild(instagramIcon);
  
    scoreCard.appendChild(scoreMessage);
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
    iconImg.style.width = '50px'; // Adjust the width as needed
  
    socialMediaIcon.appendChild(iconImg);
  
    return socialMediaIcon;
  }  

  function showIncorrectGuessNotification() {
    const notification = document.createElement('div');
    notification.textContent = 'Incorrect guess. Try again!';
    notification.classList.add('notification'); // Add a class for styling

    document.body.appendChild(notification);

    // Automatically remove the notification after a delay (e.g., 2 seconds)
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
      const score = 90 - timeLeft; // Calculate score based on time taken
      showScoreCard(score);
      clearInterval(countdownTimer); // Stop the timer for correct answer
      pixelatedImage.style.filter = 'none'; // Remove the blur effect from the image
    } else {
      clearIncorrectGuess();
      showIncorrectGuessNotification(); // Show the incorrect guess notification
    }
  }

  function clearIncorrectGuess() {
    guessInputs.forEach(input => {
      input.value = ''; // Clear all inputs
    });

    guessInputs[0].focus(); // Focus on the first input
  }

  function disableGuessSubmission() {
    submitButton.disabled = true;
    guessInputs.forEach(input => {
      input.disabled = true;
    });
  }

  function revealCorrectAnswer() {
    // Logic to reveal the correct answer (e.g., displaying it)
    // For example:
    for (let i = 0; i < guessInputs.length; i++) {
      const input = guessInputs[i];
      const letter = correctAnswer[i] || '';
  
      input.value = letter;
      if (gameEnded) {
        // Change the font color to light gray for revealed correct answer
        input.style.color = '#ccc'; // Adjust the color as needed
      }
    }
  }

  function updateImageClarity() {
    const initialBlur = 15; // Initial blur amount
    const finalBlur = 0; // Final blur amount
    const totalTime = 90; // Total time in seconds
    
    const timeElapsed = 90 - timeLeft; // Calculate time elapsed
  
    if (timeElapsed <= totalTime) {
      const blurPercentage = (timeElapsed / totalTime) * 100;
      const currentBlur = ((100 - blurPercentage) * initialBlur) / 100;
  
      pixelatedImage.style.filter = `blur(${currentBlur}px)`;
    } else {
      pixelatedImage.style.filter = `blur(${finalBlur}px)`;
    }
  }

    window.addEventListener('resize', () => {
    // Call the function to scale the image on window resize
    scaleImageProportionally();
  });
  
  guessInputs.forEach(input => {
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', function(event) {
      const key = event.key;
      if (!/^[a-zA-Z0-9]$/.test(key) && key !== 'Backspace' && key !== 'Delete') {
        event.preventDefault();
      }
      if (key === 'Enter') {
        checkGuess(event); // Trigger checkGuess for Enter key presses
      }
    });
    input.addEventListener('keyup', handleBackspace); // Listen for backspace key
  });

  submitButton.addEventListener('click', checkGuess);

  function handleGuessSubmission(event) {
    event.preventDefault();
    checkGuess();
    clearIncorrectGuess();
    alert('Incorrect guess. Try again!');
  }

  guessInputs.forEach(input => {
    // ... (existing event listeners)
  });

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
      pixelatedImage.style.filter = 'none'; // Make the image fully clear
    } else {
      timeLeft--;
      updateImageClarity();
    }
  }

}); 
