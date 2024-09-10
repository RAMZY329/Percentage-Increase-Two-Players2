// script.js

// Global variables for game state
const correctPassword = "123II23GHL"; // Set the correct password
let players = [
    { id: "player1", score: 0, currentProblem: null, controls: ['A', 'S', 'D', 'F'], handler: null },
    { id: "player2", score: 0, currentProblem: null, controls: ['H', 'J', 'K', 'L'], handler: null }
];
let gameTime = 60;
let gameInterval;
let gameSummary = [];

// Event listeners
document.getElementById("submit-password").addEventListener("click", checkPassword);
document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("show-summary").addEventListener("click", showSummary);
document.getElementById("back-to-menu").addEventListener("click", backToMenu);

// Check password and proceed if correct
function checkPassword() {
    const enteredPassword = document.getElementById("password").value;
    if (enteredPassword === correctPassword) {
        document.getElementById("password-screen").classList.add("hidden");
        document.getElementById("default-screen").classList.remove("hidden");
    } else {
        document.getElementById("password-error").classList.remove("hidden");
    }
}

// Start the game
function startGame() {
    // Get the selected game time
    gameTime = parseInt(document.getElementById("game-time").value);

    // Reset scores and problems
    players.forEach(player => {
        player.score = 0;
        player.currentProblem = null;
    });

    // Hide default screen and show game screen
    document.getElementById("default-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");

    // Initialize problems for each player and attach handlers
    players.forEach(player => {
        generateNewProblem(player);
        attachKeyHandler(player);
    });

    // Start game timer
    updateTimerDisplay();
    gameInterval = setInterval(updateGameTimer, 1000);
}

// Generate a new problem for a player
function generateNewProblem(player) {
    let oldValue, newValue, percentageIncrease;

    do {
        oldValue = getRandomInteger(1, 30);  // Old value from 1 to 30
        newValue = getRandomInteger(1, 30);  // New value from 1 to 30

        // Calculate percentage increase
        percentageIncrease = Math.round(((newValue - oldValue) / oldValue) * 100);
    } while (percentageIncrease < 0 || percentageIncrease > 60);  // Ensure the answer is positive and no more than 60%

    player.currentProblem = {
        oldValue: oldValue,
        newValue: newValue,
        correctAnswer: percentageIncrease
    };

    // Display the problem and options
    displayProblem(player);
}

// Get a random integer between min and max, inclusive
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Display the problem and options for a player
function displayProblem(player) {
    const problemDiv = document.querySelector(`#${player.id} .problem`);
    const optionsDiv = document.querySelector(`#${player.id} .options`);

    // Display the problem in a single line with reduced text size
    problemDiv.innerHTML = `
        <p style="font-size: 1.5em;">The Old Value is ${player.currentProblem.oldValue} and the New Value is ${player.currentProblem.newValue}.</p>
    `;

    // Generate random options including the correct answer
    const options = generateOptions(player.currentProblem.correctAnswer);
    optionsDiv.innerHTML = "";

    options.forEach((option, index) => {
        const button = document.createElement("button");
        button.innerText = `${option}%`;
        button.dataset.index = index;
        button.addEventListener('click', () => checkAnswer(player, parseInt(option)));
        optionsDiv.appendChild(button);
    });
}

// Generate multiple-choice options including the correct answer
function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    while (options.length < 4) {
        const randomOption = getRandomInteger(1, 60);  // Options restricted to 1% - 60%
        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
}

// Handle key press to select answer
function attachKeyHandler(player) {
    // Remove any previous event listener to avoid duplicates
    if (player.handler) {
        window.removeEventListener('keydown', player.handler);
    }

    // Create and attach a new handler
    player.handler = (event) => {
        const key = event.key.toUpperCase();
        const controlIndex = player.controls.indexOf(key);

        if (controlIndex !== -1) {
            const selectedOption = document.querySelector(`#${player.id} .options button[data-index="${controlIndex}"]`).innerText.replace('%', '');
            checkAnswer(player, parseInt(selectedOption));
        }
    };

    window.addEventListener('keydown', player.handler);
}

// Check if the selected answer is correct
function checkAnswer(player, selectedAnswer) {
    if (selectedAnswer === player.currentProblem.correctAnswer) {
        player.score++;
    } else {
        player.score--;
    }

    // Log the question and answer to the summary
    gameSummary.push({
        player: player.id,
        oldValue: player.currentProblem.oldValue,
        newValue: player.currentProblem.newValue,
        correctAnswer: player.currentProblem.correctAnswer,
        selectedAnswer: selectedAnswer
    });

    // Update the player's score and generate a new problem
    updateScore(player);
    generateNewProblem(player);
}

// Update the player's score
function updateScore(player) {
    const scoreDiv = document.querySelector(`#${player.id} .score`);
    scoreDiv.innerText = `Score: ${player.score}`;
}

// Update the game timer display
function updateTimerDisplay() {
    const timerDiv = document.getElementById("timer");
    timerDiv.innerText = `Time Left: ${gameTime}s`;
}

// Update the game timer
function updateGameTimer() {
    gameTime--;
    updateTimerDisplay();
    if (gameTime <= 0) {
        clearInterval(gameInterval);
        endGame();
    }
}

// End the game and show the rankings
function endGame() {
    // Detach all key handlers to prevent further input after game ends
    players.forEach(player => {
        if (player.handler) {
            window.removeEventListener('keydown', player.handler);
        }
    });

    document.getElementById("game-screen").classList.add("hidden");

    // Sort players by score in descending order
    players.sort((a, b) => b.score - a.score);

    const rankingDiv = document.getElementById("summary");
    rankingDiv.innerHTML = "<h2>Player Rankings</h2>";
    players.forEach((player, index) => {
        rankingDiv.innerHTML += `<p>${index + 1}. ${player.id.toUpperCase()} - Score: ${player.score}</p>`;
    });

    // Show the summary screen
    document.getElementById("summary-screen").classList.remove("hidden");
}

// Show the game summary when the summary button is clicked
function showSummary() {
    const summaryDiv = document.getElementById("summary");
    summaryDiv.innerHTML = "<h2>Game Summary</h2>";

    gameSummary.forEach(entry => {
        summaryDiv.innerHTML += `
            <p><strong>${entry.player}</strong>: Old Value: ${entry.oldValue}, New Value: ${entry.newValue}, 
            Correct Answer: ${entry.correctAnswer}%, Selected Answer: ${entry.selectedAnswer}%</p>
        `;
    });

    // Show the summary screen
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("summary-screen").classList.remove("hidden");
}

// Back to menu
function backToMenu() {
    document.getElementById("summary-screen").classList.add("hidden");
    document.getElementById("default-screen").classList.remove("hidden");

    // Reset the game state
    players.forEach(player => {
        player.score = 0;
        player.currentProblem = null;
        if (player.handler) {
            window.removeEventListener('keydown', player.handler);
        }
    });
    gameSummary = [];
}
