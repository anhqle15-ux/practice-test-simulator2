import { render, screen } from "@testing-library/react";
import App, { parseInputText, prepareQuizAttempt, shuffleArray } from "./App";

test("renders quiz generator heading", () => {
  render(<App />);
  expect(screen.getByText(/quiz generator/i)).toBeInTheDocument();
});

test("does not treat sentence endings like answer choices", () => {
  const parsed = parseInputText(`1. I like banana. What fruit do you like?
A. Apple
B. Orange
E. Mango`);

  expect(parsed).toHaveLength(1);
  expect(parsed[0].question).toBe("1. I like banana. What fruit do you like?");
  expect(parsed[0].choices).toEqual(["A. Apple", "B. Orange", "E. Mango"]);
});

test("separates inline answer choices from the question", () => {
  const parsed = parseInputText(
    "1. What fruit do you like? a. Apple b. Orange e. Mango"
  );

  expect(parsed).toHaveLength(1);
  expect(parsed[0].question).toBe("1. What fruit do you like?");
  expect(parsed[0].choices).toEqual(["a. Apple", "b. Orange", "e. Mango"]);
});

test("shuffleArray returns all items without mutating the original array", () => {
  const original = [1, 2, 3, 4];
  const shuffled = shuffleArray(original);

  expect(shuffled).toHaveLength(original.length);
  expect([...shuffled].sort()).toEqual([...original].sort());
  expect(original).toEqual([1, 2, 3, 4]);
});

test("prepareQuizAttempt returns a copied array when shuffle is off", () => {
  const original = [{ id: 1 }, { id: 2 }];
  const prepared = prepareQuizAttempt(original, false);

  expect(prepared).toEqual(original);
  expect(prepared).not.toBe(original);
});
