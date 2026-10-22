from flask import Flask, render_template, jsonify, request
import json
from pathlib import Path

app = Flask(__name__)
DATA = Path(__file__).parent / "data" / "questions.json"

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/questions")
def questions():
    return jsonify(json.loads(DATA.read_text(encoding="utf-8")))

@app.post("/api/check")
def check():
    payload = request.get_json(silent=True) or {}
    question_id = payload.get("id")
    answer = payload.get("answer")
    bank = json.loads(DATA.read_text(encoding="utf-8"))
    item = next((q for q in bank if q["id"] == question_id), None)
    if item is None:
        return jsonify({"error": "Pregunta no encontrada"}), 404
    correct = answer == item["answer"]
    return jsonify({
        "correct": correct,
        "explanation": item["explanation"],
        "correctAnswer": item["options"][item["answer"]]
    })

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "10000")), debug=False)
