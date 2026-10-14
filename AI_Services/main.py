import os
import json

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from mistralai.client import Mistral

load_dotenv()
app = FastAPI(title="AI Mock Interviewer")
api_key = os.getenv("MISTRAL_API_KEY")
model_name = os.getenv("MISTRAL_MODEL", "mistral-small-latest")

client = Mistral(api_key=api_key) if api_key else None


class InterviewRequest(BaseModel):
    jobRole: str = Field(min_length=1)
    experienceLevel: str = "Fresher"
    interviewType: str = "Technical"
    skills: list[str] = Field(default_factory=list)
    difficulty: str = "Medium"
    totalQuestions: int = Field(default=10, ge=1, le=30)


@app.get("/health")
def health():
    return {"success": True, "service": "AI question generator"}


@app.post("/generate-questions")
def generate_questions(data: InterviewRequest):
    if client is None:
        raise HTTPException(
            status_code=500,
            detail="MISTRAL_API_KEY is not configured"
        )

    prompt = f"""
Generate exactly {data.totalQuestions} interview questions.

Job role: {data.jobRole}
Experience level: {data.experienceLevel}
Interview type: {data.interviewType}
Skills: {", ".join(data.skills)}
Difficulty: {data.difficulty}

Return a JSON object in this format:
{{
  "questions": [
    {{
      "questionText": "Question text",
      "category": "Technical",
      "difficulty": "Medium",
      "expectedAnswer": "Concise reference answer"
    }}
  ]
}}

Allowed categories: Technical, HR, Behavioral, Project, Other.
Allowed difficulties: Easy, Medium, Hard.

Generate original, relevant questions. Match the candidate's
experience level and requested difficulty. Return JSON only.
"""

    try:
        response = client.chat.complete(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert interviewer. "
                        "Generate relevant questions and return valid JSON."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )

        content = response.choices[0].message.content

        if not isinstance(content, str):
            raise ValueError("Empty response from Mistral")

        result = json.loads(content)
        questions = result.get("questions")

        if not isinstance(questions, list):
            raise ValueError("Response must contain a questions array")

        if len(questions) != data.totalQuestions:
            raise ValueError("Incorrect number of generated questions")

        categories = {
            "Technical", "HR", "Behavioral", "Project", "Other"
        }
        difficulties = {"Easy", "Medium", "Hard"}

        for question in questions:
            if not isinstance(question, dict):
                raise ValueError("Invalid question object")

            if not isinstance(question.get("questionText"), str):
                raise ValueError("Question text must be a string")

            if not question["questionText"].strip():
                raise ValueError("Question text cannot be empty")

            if question.get("category") not in categories:
                raise ValueError("Invalid question category")

            if question.get("difficulty") not in difficulties:
                raise ValueError("Invalid question difficulty")

            if not isinstance(question.get("expectedAnswer", ""), str):
                raise ValueError("Expected answer must be a string")

        return {
            "success": True,
            "questions": questions
        }

    except (ValueError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=502,
            detail=f"Invalid AI response: {error}"
        ) from error

    except Exception as error:
        print(f"Mistral generation error: {error}")

        raise HTTPException(
            status_code=502,
            detail="Question generation failed"
        ) from error
