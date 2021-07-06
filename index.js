function QuizAppModule() {
  const listQuestions = [
    "From which US city do the band The Killers originate?",
    "What was the Turkish city of Istanbul called before 1930?",
    "Name the Coffee shop in US sitcom Friends",
    "How many human players are there on each side in a polo match?",
    "In what year did Tony Blair become British Prime Minister?",
    "What is the capital of New Zealand?",
  ];
  const listAnswers = [];
  const LIMIT_ANSWER_TIME = 9;
  const LIMIT_TOTAL_TIME = listQuestions.length * (LIMIT_ANSWER_TIME + 1);
  const quizFormElement = document.querySelector(".answer-form");
  const timerWrapElement = document.querySelector(".timer-wrap");
  const timerElement = document.querySelector(".timer");
  const totalTimeElement = document.querySelector(".total-time");
  const resultWrapElement = document.querySelector(".result-wrap");
  const maxTimeElement = document.querySelector(".max-time");
  const playBtnElement = document.querySelector(".play-btn");
  let answerTimerInterval;
  let totalTimerInterval;
  let currentQuestionIndex = 0;
  let currentTotalTime = 0;
  return {
    setAnswerTimerInterval(i) {
      answerTimerInterval = i;
    },
    setTotalTimerInterval(i) {
      totalTimerInterval = i;
    },
    clearAnswerTimerInterval() {
      clearInterval(answerTimerInterval);
    },
    clearTotalTimerInterval() {
      clearInterval(totalTimerInterval);
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
    getCurrentTotalTime() {
      return currentTotalTime;
    },
    setCurrentTotalTime(seconds) {
      currentTotalTime = seconds;
    },
    getQuizzAppElement() {
      return {
        quizFormElement,
        timerWrapElement,
        timerElement,
        totalTimeElement,
        resultWrapElement,
        playBtnElement,
        maxTimeElement,
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
  clearAnswerTimerInterval,
  setAnswerTimerInterval,
  clearTotalTimerInterval,
  setTotalTimerInterval,
  setCurrentQuestionIndex,
  getCurrentQuestionIndex,
  getLimitAnswerTime,
  getLimitTotalTime,
  getCurrentTotalTime,
  setCurrentTotalTime,
  getListQuestion,
  getListAnswers,
  setListAnswers,
  setListAnswersToEmpty,
  getQuizzAppElement,
} = QuizAppModule();

renderTotalTimer();
renderMaxTime();
getQuizzAppElement().playBtnElement.addEventListener("click", handlePlayGame);
getQuizzAppElement().quizFormElement.addEventListener("submit", onSubmitAnswer);

const isTimeOver = () => getCurrentTotalTime === getLimitTotalTime();

const isLastQuestion = () =>
  getCurrentQuestionIndex() === getListQuestion().length - 1;

function renderTotalTimer(seconds = 0) {
  const html = `${formatSecondToTime(seconds)}`;
  handleWarning(seconds);
  getQuizzAppElement().totalTimeElement.innerHTML = html;
}

function renderMaxTime() {
  const html = `Max : ${formatSecondToTime(getLimitTotalTime())}`;
  getQuizzAppElement().maxTimeElement.innerHTML = html;
}

function handleWarning(seconds) {
  if (seconds >= getLimitTotalTime() - 3) {
    getQuizzAppElement().totalTimeElement.classList.add("red");
  } else {
    getQuizzAppElement().totalTimeElement.classList.remove("red");
  }
}

function handlePlayGame() {
  renderAnswerTimer(getLimitAnswerTime());
  getQuizzAppElement().playBtnElement.classList.add("is-playing");
  handleRunAnswerTimer();
  handleRunTotalTimer();
  renderQuizForm({ questionIndex: 0 });
}

function handleRunAnswerTimer() {
  let answerSecondLeft = getLimitAnswerTime();
  let currentQuestionIndex = getCurrentQuestionIndex();
  let timerInterval = setInterval(() => {
    if (answerSecondLeft === 0 && isLastQuestion()) {
      handleFinishAnswering();
      return;
    }
    if (answerSecondLeft === 0) {
      currentQuestionIndex++;
      answerSecondLeft = getLimitAnswerTime();
      nextQuestion({ questionIndex: currentQuestionIndex });
      return;
    }
    answerSecondLeft--;
    renderAnswerTimer(answerSecondLeft);
  }, 1000);
  setAnswerTimerInterval(timerInterval);
}

function handleRunTotalTimer() {
  let currentTotalSecond = getCurrentTotalTime();
  let timerInterval = setInterval(() => {
    if (isTimeOver()) {
      handleFinishAnswering();
      return;
    }
    currentTotalSecond++;
    setCurrentTotalTime(currentTotalSecond);
    renderTotalTimer(currentTotalSecond);
  }, 1000);
  setTotalTimerInterval(timerInterval);
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
  getQuizzAppElement().quizFormElement.innerHTML = html;
}

function renderAnswerTimer(seconds) {
  const html = `<span class="timer">${formatSecondToTime(seconds)}</span>`;
  getQuizzAppElement().timerWrapElement.innerHTML = html;
}

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
  clearAnswerTimerInterval();
  setCurrentQuestionIndex(questionIndex);
  renderAnswerTimer(getLimitAnswerTime());
  renderQuizForm({ questionIndex });
  handleRunAnswerTimer();
}

function handleFinishAnswering() {
  clearAnswerTimerInterval();
  clearTotalTimerInterval();
  const result = {
    seconds: getCurrentTotalTime(),
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
  setCurrentTotalTime(0);

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
