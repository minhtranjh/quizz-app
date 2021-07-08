function QuizAppModule() {
  let quizFormElement;
  let timerWrapElement;
  let totalTimeElement;
  let resultWrapElement;
  let maxTimeElement;
  let playBtnElement;
  let questionNumElement;
  let answerElement;
  let listQuestions = [];
  let listFinish = {};
  let listAnswers = {};
  let limitTotalTime = 0;
  let currentQuestionIndex = 0;
  let currentTotalTime = 0;
  let currentAnswerTimeLeft = 0;
  let answerTimerInterval;
  let totalTimerInterval;

  function initialQuizApp(value) {
      wrapQuizAppToElement(value.wrapperHtml, value.title);
      styleQuizApp(value.style);
      createElementVariables();
      listQuestions = value.listQuestions || [];
      limitTotalTime = caculateTotalTime(value.listQuestions);
      currentAnswerTimeLeft = listQuestions[0].limit;
      triggerInititalFunction();
  }
  function wrapQuizAppToElement(wrapper, title) {
    const wrapperElement = document.querySelector(wrapper);
    wrapperElement.innerHTML = renderQuizApp(title);
  }
  function caculateTotalTime(list) {
    let totalTime = 0;
    list.forEach((item, index) => {
      totalTime += item.limit + 1;
    });
    return totalTime;
  }
  function createElementVariables() {
    quizFormElement = document.querySelector(".answer-form");
    timerWrapElement = document.querySelector(".timer-wrap");
    timerElement = document.querySelector(".timer");
    totalTimeElement = document.querySelector(".total-time");
    resultWrapElement = document.querySelector(".result-wrap");
    maxTimeElement = document.querySelector(".max-time");
    playBtnElement = document.querySelector(".play-btn");
  }
  function triggerInititalFunction() {
    renderTotalTimer();
    renderMaxTime();
    playBtnElement.addEventListener("click", handlePlayGame);
  }

  function renderQuizApp(title) {
    return `
    <div  class="container">
      <div class="total-time-wrapper">
        <p class="total-time"></p>
        <p class="max-time"></p>
      </div>
      <h1>${title ? title : "Add a title"}</h1>
      <div class="timer-wrap">
      </div>
      <div class="">
        <button class="play-btn">Play</button>
      </div>
      <div class="answer-form">
      </div>
      <div class="question-order">
                      
      </div>
      <div class="result-wrap">
      </div>
  </div>`;
  }
  function styleQuizApp(styleObj) {
    for (let value in styleObj) {
      document.querySelector(".container").style[value] = styleObj[value];
    }
  }
  function renderTotalTimer(seconds = 0) {
    const html = `${formatSecondToTime(seconds)}`;
    handleWarning(seconds);
    totalTimeElement.innerHTML = html;
  }

  function renderMaxTime() {
    const html = `Max : ${formatSecondToTime(limitTotalTime)}`;
    maxTimeElement.innerHTML = html;
  }

  function handleWarning(seconds) {
    if (seconds >= limitTotalTime - 3) {
      return totalTimeElement.classList.add("red");
    }
    totalTimeElement.classList.remove("red");
  }

  function handlePlayGame() {
    const countDownFrom = listQuestions[0].limit;
    renderAnswerTimer(countDownFrom);
    removePlayButton();
    handleRunAnswerTimer(countDownFrom);
    handleRunTotalTimer();
    renderQuizForm({ questionIndex: 0 });
    addQuestionOrderElement();
    addQuestionNumColor(0);
  }
  function removePlayButton() {
    playBtnElement.classList.add("is-playing");
  }
  function handleRunAnswerTimer(countDownFrom) {
    currentAnswerTimeLeft = countDownFrom;
    answerTimerInterval = setInterval(() => {
      if (currentAnswerTimeLeft === 0) {
        if (!isLastQuestion()) {
          currentAnswerTimeLeft = listQuestions[currentQuestionIndex + 1].limit;
        }
        addToListFinish();
        addTimeoutQuestionColor(currentQuestionIndex);
        nextQuestion();
        return;
      }
      currentAnswerTimeLeft--;
      renderAnswerTimer(currentAnswerTimeLeft);
    }, 1000);
  }
  function addToListFinish() {
    listFinish[currentQuestionIndex] = currentQuestionIndex;
  }
  function checkIfNextQuestionIsFinish() {
    for (item in listFinish) {
      if (currentQuestionIndex + 1 in listFinish) {
        currentQuestionIndex++;
      }
    }
  }
  function isTimeOver() {
    return currentTotalTime === limitTotalTime;
  }
  function isLastQuestion() {
    return currentQuestionIndex === listQuestions.length - 1;
  }
  function handleRunTotalTimer() {
    totalTimerInterval = setInterval(() => {
      if (isTimeOver()) {
        handleFinishAnswering();
        return;
      }
      currentTotalTime++;
      renderTotalTimer(currentTotalTime);
    }, 1000);
  }

  function renderQuizForm({ questionIndex = 0, value = "" }) {
    const question = listQuestions[questionIndex].question;
    const html = `<div class="question-box">
                  <p class="question">
                    ${question}
                  </p>
                </div>
                <textarea name="answer" id="answer" placeholder="Write your answer here">${value}</textarea>
                <div class="submit-wrap">
                  <button  class="next-btn">${
                    questionIndex >= listQuestions.length - 1
                      ? "Submit"
                      : "Next"
                  }</button>
                </div>
                  
                `;
    quizFormElement.innerHTML = html;
    answerElement = document.querySelector("#answer");
    addNextQuestionEvent();
  }
  function addQuestionOrderElement() {
    const html = listQuestions
      .map(
        (item, index) =>
          `<div class="question-num">
            <p>${index + 1}</p>
          </div>
        `
      )
      .join("");
    document.querySelector(".question-order").innerHTML = html;
    addClickEventToQuestionNum();
  }
  function addClickEventToQuestionNum() {
    questionNumElement = document.querySelectorAll(".question-num");
    questionNumElement.forEach((item, index) => {
      questionNumElement[index].addEventListener("click", () =>
        handleOnQuestionNumClick(currentQuestionIndex, index)
      );
    });
  }
  function getChoosenAnswerItem(newIndex) {
    let currentAnswer;
    let currentTimeLeft;
    const currentAnswerItem = listAnswers[newIndex];
    if (currentAnswerItem) {
      currentTimeLeft = currentAnswerItem.currentAnswerTimeLeft;
      currentAnswer = currentAnswerItem.answer;
    } else {
      currentTimeLeft = listQuestions[currentQuestionIndex].limit;
      currentAnswer = "";
    }
    return { currentAnswer, currentTimeLeft };
  }
  function handleOnQuestionNumClick(oldIndex, newIndex) {
    pauseAnswerTimer();
    submitAnswer();
    showQuestionByIndex(oldIndex, newIndex);
  }
  function showQuestionByIndex(oldIndex, newIndex) {
    const { currentAnswer, currentTimeLeft } = getChoosenAnswerItem(newIndex);
    currentQuestionIndex = newIndex;
    currentAnswerTimeLeft = currentTimeLeft;

    removeQuestionNumColor(oldIndex);
    addQuestionNumColor(newIndex);
    renderAnswerTimer(currentAnswerTimeLeft);
    renderQuizForm({
      questionIndex: newIndex,
      value: currentAnswer,
    });

    handleRunAnswerTimer(currentAnswerTimeLeft);
  }
  function addQuestionNumColor(questionIndex) {
    questionNumElement[questionIndex].classList.add("is-answering");
  }
  function removeQuestionNumColor(questionIndex) {
    questionNumElement[questionIndex].classList.remove("is-answering");
  }
  function addTimeoutQuestionColor(questionIndex) {
    questionNumElement[questionIndex].classList.remove("is-answering");
    questionNumElement[questionIndex].classList.add("is-timeout");
  }
  function addNextQuestionEvent() {
    document.querySelector(".next-btn").addEventListener("click", nextQuestion);
  }
  function renderAnswerTimer(seconds) {
    const html = `<span class="timer">${formatSecondToTime(seconds)}</span>`;
    timerWrapElement.innerHTML = html;
  }

  function submitAnswer() {
    const answer = answerElement.value;
    addToListAnswer(answer);
  }
  function addToListAnswer(answer) {
    listAnswers[currentQuestionIndex] = {
      answer,
      questionId: listQuestions[currentQuestionIndex].id,
      currentAnswerTimeLeft,
    };
  }
  function nextQuestion() {
    pauseAnswerTimer();
    submitAnswer();
    if (isLastQuestion()) {
      if (currentTotalTime < limitTotalTime && !isSubmitConfirm()) {
        const newIndex = findFirstAvailableIndex();
        showQuestionByIndex(currentQuestionIndex, newIndex);
        handleRunTotalTimer();
        return;
      }
      handleFinishAnswering();
      return;
    }
    checkIfNextQuestionIsFinish();
    showQuestionByIndex(currentQuestionIndex, ++currentQuestionIndex);
  }
  function findFirstAvailableIndex() {
    for (let i = 0; i <= listQuestions.length - 1; i++) {
      if (i in listFinish) {
        continue;
      }
      return i;
    }
  }
  function isSubmitConfirm() {
    pauseTotalTimer();
    return window.confirm(
      "You haven't finish but still have time ? Do you still want to submit ?"
    );
  }
  function handleFinishAnswering() {
    const result = {
      seconds: currentTotalTime,
      answers: Object.keys(listAnswers).length,
      totalQuestions: listQuestions.length,
    };

    pauseAnswerTimer();
    pauseTotalTimer();
    renderResultBox(result);
    addPlayAgainEvent();
  }
  function pauseAnswerTimer() {
    clearInterval(answerTimerInterval);
  }
  function pauseTotalTimer() {
    clearInterval(totalTimerInterval);
  }
  function handlePlayAgain() {
    setAllToDefault();
    handlePlayGame();
  }

  function setAllToDefault() {
    currentQuestionIndex = 0;
    listAnswers = {};
    listFinish = {};
    currentTotalTime = 0;
    renderTotalTimer();
    renderAnswerTimer(listQuestions[0].limit);
    removeResultBox();
  }
  function renderResultBox({ seconds, answers, totalQuestions }) {
    const html = `<div class="result-box">
                    <h1>Thank you </h1>
                    <h1>You've done the quiz game</h1>
                    <p>Total time : ${formatSecondToTime(seconds)}</p>
                    <p>Total submission : ${answers}/${totalQuestions}</p>
                    <button  class="play-again-btn">Play again</button>
                  </div>`;
    resultWrapElement.innerHTML = html;
  }
  function addPlayAgainEvent() {
    const playAgainElement = document.querySelector(".play-again-btn");
    playAgainElement.addEventListener("click", handlePlayAgain);
  }
  function removeResultBox() {
    resultWrapElement.innerHTML = ``;
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

  return {
    initialQuizApp,
  };
}

const { initialQuizApp } = QuizAppModule();

const listQuestions = [
  {
    id: 1,
    question: "From which US city do the band The Killers originate?",
    limit: 10,
  },
  {
    id: 2,
    question: "What was the Turkish city of Istanbul called before 1930?",
    limit: 10,
  },
  {
    id: 3,
    question: "Name the Coffee shop in US sitcom Friends",
    limit: 10,
  },
  {
    id: 4,
    question: "How many human players are there on each side in a polo match?",
    limit: 20,
  },
  {
    id: 5,
    question: "In what year did Tony Blair become British Prime Minister?",
    limit: 20,
  },
  {
    id: 6,
    question: "What is the capital of New Zealand?",
    limit: 20,
  },
];

initialQuizApp({
  wrapperHtml: ".wrapper",
  title: "Awesome Quiz",
  style: {
    backgroundColor: "rgb(163, 220, 233)",
  },
  listQuestions,
});
