import React, { useState } from "react";
import "./App.css";

export const parseInputText = (inputText) => {
  const rawQuestions = inputText
    .split(/\n(?=\d+\.\s)/)
    .filter((q) => q.trim());

  return rawQuestions.map((q) => {
    const lineChoiceMatch = q.match(/^\s*[A-Za-z]\.\s.*$/m);
    const inlineChoiceMatch = q.match(/[.?!:]\s+([A-Za-z]\.\s)/);

    let firstChoiceIndex = -1;

    if (lineChoiceMatch && typeof lineChoiceMatch.index === "number") {
      firstChoiceIndex = lineChoiceMatch.index;
    } else if (inlineChoiceMatch && typeof inlineChoiceMatch.index === "number") {
      firstChoiceIndex =
        inlineChoiceMatch.index + inlineChoiceMatch[0].lastIndexOf(inlineChoiceMatch[1]);
    }

    const questionText =
      firstChoiceIndex === -1 ? q.trim() : q.slice(0, firstChoiceIndex).trim();

    const choicesText = firstChoiceIndex === -1 ? "" : q.slice(firstChoiceIndex).trim();
    const normalizedChoicesText = choicesText.replace(/\s+(?=[A-Za-z]\.\s)/g, "\n");
    const choices = normalizedChoicesText.match(/^\s*[A-Za-z]\.\s.*$/gm) || [];

    return {
      question: questionText,
      choices: choices.map((choice) => choice.trim()),
      correct: null,
    };
  });
};

export const shuffleArray = (items) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

export const prepareQuizAttempt = (questions, shouldShuffle) =>
  shouldShuffle ? shuffleArray(questions) : [...questions];

export default function App() {
  const [step, setStep] = useState(1);
  const [inputText, setInputText] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [baseQuizData, setBaseQuizData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState([]);

  // Parse pasted text
  const parseQuestions = () => {
    const parsedQuestions = parseInputText(inputText);
    setQuizData(parsedQuestions);
    setBaseQuizData(parsedQuestions);
    setAttemptHistory([]);
    setAnswers({});
    setScore(null);
    setStep(2);
  };

  // Set correct answer manually
  const setCorrect = (qIndex, letter) => {
    const updated = [...quizData];
    updated[qIndex].correct = letter;
    setQuizData(updated);
  };

  // Apply answer string
  const applyAnswerString = (str) => {
    const updated = [...quizData];
    str.toUpperCase().split("").forEach((letter, i) => {
      if (updated[i]) updated[i].correct = letter;
    });
    setQuizData(updated);
  };

  // Start quiz
  const startQuiz = () => {
    if (quizData.some(q => !q.correct)) {
      alert("Set all answers first!");
      return;
    }

    const sourceQuizData = baseQuizData.length ? baseQuizData : quizData;
    const nextQuizData = prepareQuizAttempt(sourceQuizData, shuffleQuestions);

    setQuizData(nextQuizData);
    setAnswers({});
    setScore(null);
    setStep(3);
  };

  // Submit quiz
  const submitQuiz = () => {
    let correct = 0;
    quizData.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const nextScore = `${correct} / ${quizData.length}`;

    setScore(nextScore);
    setAttemptHistory((currentHistory) => [
      {
        id: currentHistory.length + 1,
        quizData: quizData.map((question) => ({ ...question })),
        answers: { ...answers },
        score: nextScore,
      },
      ...currentHistory,
    ]);
    setStep(4);
  };

  const retryQuiz = () => {
    const sourceQuizData = baseQuizData.length ? baseQuizData : quizData;
    const nextQuizData = prepareQuizAttempt(sourceQuizData, shuffleQuestions);

    setQuizData(nextQuizData);
    setAnswers({});
    setScore(null);
    setStep(3);
  };

  const restartApp = () => {
    setStep(1);
    setInputText("");
    setQuizData([]);
    setBaseQuizData([]);
    setAnswers({});
    setScore(null);
    setShuffleQuestions(false);
    setAttemptHistory([]);
  };

  return (
    <div className="app-shell">
      <h1>Quiz Generator</h1>

      {/* STEP 1: INPUT */}
      {step === 1 && (
        <>
          <textarea
            rows={15}
            style={{ width: "100%" }}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste your questions here..."
          />
          <br /><br />
          <button onClick={parseQuestions}>Next</button>
        </>
      )}

      {/* STEP 2: SET ANSWERS */}
      {step === 2 && (
        <>
          <h2>Set Answer Key</h2>

          <input
            placeholder="Paste answer string (e.g. ABADBCD)"
            onBlur={(e) => applyAnswerString(e.target.value)}
          />

          <label className="shuffle-toggle">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
            />
            Shuffle questions before starting the quiz
          </label>

          {quizData.map((q, i) => (
            <div key={i} className="question-card">
              <b>{i + 1}. {q.question}</b>

              {q.choices.map(choice => {
                const letter = choice[0].toUpperCase();
                return (
                  <div key={letter}>
                    <label>
                      <input
                        type="radio"
                        name={`key-${i}`}
                        checked={q.correct === letter}
                        onChange={() => setCorrect(i, letter)}
                      />
                      {choice}
                    </label>
                  </div>
                );
              })}
            </div>
          ))}

          <br />
          <button onClick={startQuiz}>Start Quiz</button>
        </>
      )}

      {/* STEP 3: TAKE QUIZ */}
      {step === 3 && (
        <>
          <h2>Quiz</h2>

          {quizData.map((q, i) => (
            <div key={i} className="question-card">
              <b>{i + 1}. {q.question}</b>

              {q.choices.map(choice => {
                const letter = choice[0].toUpperCase();
                return (
                  <div key={letter}>
                    <label>
                      <input
                        type="radio"
                        name={`q-${i}`}
                        checked={answers[i] === letter}
                        onChange={() =>
                          setAnswers({ ...answers, [i]: letter })
                        }
                      />
                      {choice}
                    </label>
                  </div>
                );
              })}
            </div>
          ))}

          <br />
          <button onClick={submitQuiz}>Submit</button>
        </>
      )}

      {/* STEP 4: RESULTS */}
      {step === 4 && (
        <>
          <h2>Score: {score}</h2>

          {quizData.map((q, i) => {
            const userAnswer = answers[i];
            const gotItRight = userAnswer === q.correct;

            return (
              <div
                key={i}
                className={`question-card result-card ${gotItRight ? "result-card-correct" : "result-card-wrong"}`}
              >
                <div className="result-header">
                  <b>Q{i + 1}. {q.question}</b>
                  <span className={gotItRight ? "status-correct" : "status-wrong"}>
                    {gotItRight ? "Correct" : "Wrong"}
                  </span>
                </div>

                <div className="result-summary">
                  <span className={gotItRight ? "status-correct" : "status-wrong"}>
                    Your answer: {userAnswer || "No answer"}
                  </span>
                  {!gotItRight && (
                    <span className="status-correct">Correct answer: {q.correct}</span>
                  )}
                </div>

                <div className="choices-list">
                  {q.choices.map((choice) => {
                    const letter = choice[0].toUpperCase();
                    const isCorrectChoice = letter === q.correct;
                    const isWrongSelectedChoice =
                      letter === userAnswer && userAnswer !== q.correct;

                    return (
                      <div
                        key={letter}
                        className={`choice-pill ${
                          isCorrectChoice
                            ? "choice-correct"
                            : isWrongSelectedChoice
                              ? "choice-wrong"
                              : ""
                        }`}
                      >
                        {choice}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {attemptHistory.length > 1 && (
            <>
              <h3>Previous Attempts</h3>
              <div className="attempt-history">
                {attemptHistory.slice(1).map((attempt) => (
                  <div key={attempt.id} className="question-card attempt-card">
                    <b>Attempt {attempt.id}</b>
                    <div>Score: {attempt.score}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <br />
          <div className="action-row">
            <button onClick={retryQuiz}>Retry Quiz</button>
            <button onClick={restartApp}>Restart</button>
          </div>
        </>
      )}
    </div>
  );
}
