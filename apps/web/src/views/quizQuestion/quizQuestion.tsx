"use client";

import {
  ICreateQuizQuestionDto,
  quizQuestionTypeEnum,
} from "@tournament-app/types";
import SingleCorrect from "./singleCorrect/singleCorrect";
import TrueFalseQuestion from "./trueFalse/trueFalse";

export default function QuizQuestion({
  question,
}: {
  question: ICreateQuizQuestionDto;
}) {
  switch (question.questionType) {
    case quizQuestionTypeEnum.TRUE_FALSE:
      return (
        <TrueFalseQuestion
          order={question.order}
          image={question.image ?? undefined}
          correctAnswer={(question.correctAnswers?.[0] ?? "false") === "true"}
          question={question.question}
          explanation={question.explanation ?? undefined}
        />
      );
    case quizQuestionTypeEnum.MULTIPLE_CHOICE:
      return (
        <SingleCorrect
          order={question.order}
          image={question.image ?? undefined}
          question={question.question}
          explanation={question.explanation ?? undefined}
          options={question.options ?? []}
        />
      );
  }
}
