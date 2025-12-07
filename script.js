let questions = [];
let index = 0;
let score = 0;
let answered = false;
let timer;
let timeLeft = 15;

const optionLetters = ['A.', 'B.', 'C.', 'D.'];

// Load questions from backend and randomize
async function loadQuestions() {
    const level = localStorage.getItem("level");
    const res = await fetch(`http://localhost:5000/api/questions?level=${level}`);
    questions = await res.json();

    // Randomize questions
    questions = questions.sort(() => Math.random() - 0.5);

    showQuestion();
}

// Show current question
function showQuestion() {
    const level = localStorage.getItem("level") || "Easy";
document.getElementById("quiz-level").innerText = `Level: ${level}`;
    answered = false;

    if (index >= questions.length) {
        localStorage.setItem("score", score);
        window.location.href = "result.html";
        return;
    }

    const q = questions[index];

    // Display question number and progress
    document.getElementById("question").innerText = `Q${index + 1}. ${q.question}`;
    document.getElementById("question-number").innerText = `Question ${index + 1} of ${questions.length}`;
    const progressPercent = ((index) / questions.length) * 100;
    document.getElementById("progress-bar").style.width = `${progressPercent}%`;

    // Display options
    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    q.options.forEach((opt, i) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("option-wrapper");

        const letterSpan = document.createElement("span");
        letterSpan.classList.add("option-letter");
        letterSpan.innerText = optionLetters[i];

        const btn = document.createElement("button");
        btn.innerText = opt;
        // Pass index i (position) and correct answer from backend
        btn.onclick = () => checkAnswer(i, q.answer, btn);

        wrapper.appendChild(letterSpan);
        wrapper.appendChild(btn);
        optionsDiv.appendChild(wrapper);
    });

    // document.getElementById("nextBtn").style.display = "none";

    // Start timer
    startTimer(q.answer);
}

// Check selected answer
function checkAnswer(selectedIndex, correctIndex, button) {
    if (answered) return;
    answered = true;

    clearInterval(timer); // Stop timer

    const buttons = document.querySelectorAll("#options button");
    buttons.forEach(btn => btn.disabled = true); // Disable all buttons

    if (selectedIndex === correctIndex) {
        score++;
        button.classList.add("correct");
    } else {
        button.classList.add("incorrect");
        // Highlight correct button
        buttons[correctIndex].classList.add("correct");
    }

    document.getElementById("score-display").innerText = `Score: ${score}`;
    document.getElementById("nextBtn").style.display = "block";
}

// Move to next question manually
function nextQuestion() {
    // Stop timer if running
    clearInterval(timer);

    // Move to next question
    index++;
    showQuestion();
}

// Timer function
function startTimer(correctIndex) {
    timeLeft = 30;
    document.getElementById("timer").innerText = `Time: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Time: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            answered = true;

            const buttons = document.querySelectorAll("#options button");
            buttons.forEach(btn => btn.disabled = true);

            // Highlight correct answer
            // buttons[correctIndex].classList.add("correct");

            // Auto-move to next question after 1 second
            setTimeout(() => {
                index++;
                showQuestion();
            }, 1000);
        }
    }, 1000);
}

// Initialize quiz
if (window.location.pathname.includes("quiz.html")) {
    loadQuestions();
}
