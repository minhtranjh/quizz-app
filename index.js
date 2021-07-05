function QuizAppState() {
  const listQuestions = [
    "From which US city do the band The Killers originate?",
    "What was the Turkish city of Istanbul called before 1930?",
    "Name the Coffee shop in US sitcom Friends",
    "How many human players are there on each side in a polo match?",
    "In what year did Tony Blair become British Prime Minister?",
    // "What is the capital of New Zealand?",
    // "Street artist Banksy is originally associated with which British city?"
  ];
  const listAnswers = [];
  const LIMIT_ANSWER_TIME = 10;
  const LIMIT_TOTAL_TIME = listQuestions.length * LIMIT_ANSWER_TIME;
  const answerFormElement = document.querySelector(".answer-form");
  const timerWrapElement = document.querySelector(".timer-wrap");
  const timerElement = document.querySelector(".timer");
  const totalTimeElement = document.querySelector(".total-time");
  const resultWrapElement = document.querySelector(".result-wrap");
  const playBtnElement = document.querySelector(".play-btn");
  let timerInterval;
  let currentQuestionIndex = 0;
  let currentCountDown = LIMIT_TOTAL_TIME;
  return {
    getTimerInterval() {
      return timerInterval;
    },
    setTimerInterval(i) {
      timerInterval = i;
    },
    clearTimerInterval() {
      clearInterval(timerInterval);
    },
    getListAnswers() {
      return listAnswers;
    },
    setListAnswers(answer) {
      listAnswers.push(answer);
    },
    setListAnswersToEmpty() {
      listAnswers.length = 0;
    },
    getCurrentQuestionIndex() {
      return currentQuestionIndex;
    },
    setCurrentQuestionIndex(index) {
      currentQuestionIndex = index;
    },
    getCurrentCountDown() {
      return currentCountDown;
    },
    setCurrentCountDown(seconds) {
      currentCountDown = seconds;
    },
    getQuizzAppElement() {
      return {
        answerFormElement,
        timerWrapElement,
        timerElement,
        totalTimeElement,
        resultWrapElement,
        playBtnElement,
      };
    },
    getLimitAnswerTime() {
      return LIMIT_ANSWER_TIME;
    },
    getLimitTotalTime() {
      return LIMIT_TOTAL_TIME;
    },
    getListQuestion() {
      return listQuestions;
    },
  };
}

const {
  clearTimerInterval,
  setTimerInterval,
  setCurrentQuestionIndex,
  getCurrentQuestionIndex,
  getLimitAnswerTime,
  getLimitTotalTime,
  getCurrentCountDown,
  setCurrentCountDown,
  getListQuestion,
  getListAnswers,
  setListAnswers,
  setListAnswersToEmpty,
  getQuizzAppElement,
} = QuizAppState();

renderAnswerTimer(getLimitAnswerTime());
renderTotalTimer();
getQuizzAppElement().playBtnElement.addEventListener("click", handlePlayGame);

function renderTotalTimer(seconds = getLimitTotalTime()) {
  const html = `${formatSecondToTime(seconds)}`;
  getQuizzAppElement().totalTimeElement.innerHTML = html;
}

function handlePlayGame() {
  getQuizzAppElement().playBtnElement.classList.add("is-playing");
  handleRunTimer();
  renderQuizForm({ questionIndex: 0 });
}
const isTimeOver = () =>
  getLimitTotalTime() - getCurrentCountDown() === getLimitTotalTime();
const isLastQuestion = () =>
  getCurrentQuestionIndex() === getListQuestion().length - 1;
function handleRunTimer() {
  let tempAnswerSeconds = getLimitAnswerTime();
  let currentCountdown = getCurrentCountDown();
  let currentQuestionIndex = getCurrentQuestionIndex();

  let timerInterval = setInterval(() => {
    if (isTimeOver() || (tempAnswerSeconds === 0 && isLastQuestion())) {
      handleFinishAnswering();
      return;
    }
    if (tempAnswerSeconds === 0) {
      currentQuestionIndex++;
      tempAnswerSeconds = getLimitAnswerTime();
      nextQuestion({ questionIndex: currentQuestionIndex });
      return;
    }
    currentCountdown--;
    setCurrentCountDown(currentCountdown);
    renderTotalTimer(currentCountdown);
    renderAnswerTimer(--tempAnswerSeconds);
  }, 1000);
  setTimerInterval(timerInterval);
}

function renderQuizForm({ questionIndex }) {
  const question = getListQuestion()[questionIndex];
  const html = `<div class="question-box">
                  <p class="question">
                    ${question}
                  </p>
                </div>
                <textarea name="answer" id="answer" placeholder="Write your answer here"></textarea>
                <div class="submit-wrap">
                  <button type="submit" class="submit-btn">Next</button>
                </div>`;
  getQuizzAppElement().answerFormElement.innerHTML = html;
}

function renderAnswerTimer(seconds) {
  const html = `<span class="timer">${formatSecondToTime(seconds)}</span>`;
  getQuizzAppElement().timerWrapElement.innerHTML = html;
}

getQuizzAppElement().answerFormElement.addEventListener(
  "submit",
  onSubmitAnswer
);

function onSubmitAnswer(e) {
  e.preventDefault();
  let currentQuestionIndex = getCurrentQuestionIndex();
  const answer = e.target.answer.value;
  answer && setListAnswers(answer);

  if (isLastQuestion()) {
    handleFinishAnswering();
    return;
  }
  currentQuestionIndex++;
  nextQuestion({ questionIndex: currentQuestionIndex });
}

function nextQuestion({ questionIndex }) {
  clearTimerInterval();
  setCurrentQuestionIndex(questionIndex);
  renderAnswerTimer(getLimitAnswerTime());
  renderQuizForm({ questionIndex });
  handleRunTimer();
}

function handleFinishAnswering() {
  clearTimerInterval();
  const result = {
    seconds: getLimitTotalTime() - getCurrentCountDown(),
    answers: getListAnswers().length,
    totalQuestions: getListQuestion().length,
  };
  renderResultBox(result);
}

function handlePlayAgain() {
  setAllToDefault();
  handlePlayGame();
}

function setAllToDefault() {
  setCurrentQuestionIndex(0);
  setListAnswersToEmpty();
  setCurrentCountDown(getLimitTotalTime());

  renderTotalTimer();
  renderAnswerTimer(getLimitAnswerTime());
  removeResultBox();
}
function renderResultBox({ seconds, answers, totalQuestions }) {
  const html = `
  <div class="result-box">
    <h1>Finish</h1>
    <p>Total time : ${formatSecondToTime(seconds)}</p>
    <p>Total answer ${answers}/${totalQuestions}</p>
    <button onclick="handlePlayAgain()" class="play-again-btn">Play again</button>
  </div>`;
  getQuizzAppElement().resultWrapElement.innerHTML = html;
}
function removeResultBox() {
  getQuizzAppElement().resultWrapElement.innerHTML = ``;
}
function formatSecondToTime(second) {
  let sec_num = parseInt(second, 10);
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - hours * 3600) / 60);
  let seconds = sec_num - hours * 3600 - minutes * 60;
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  return minutes + ":" + seconds;
}
