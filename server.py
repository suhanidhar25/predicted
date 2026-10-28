
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
import pandas as pd

app = Flask(__name__)
CORS(app)

# Small sample dataset for demonstration only
data = pd.DataFrame({
    "hours": [1, 2, 3, 4, 5, 6, 7, 8, 3, 5, 7, 9],
    "attendance": [40, 50, 60, 65, 70, 75, 80, 90, 70, 80, 85, 95],
    "previous": [25, 30, 40, 45, 55, 60, 70, 80, 45, 65, 75, 90],
    "final": [28, 33, 42, 48, 57, 64, 73, 84, 48, 67, 78, 94]
})

X = data[["hours", "attendance", "previous"]]
y = data["final"]

model = LinearRegression()
model.fit(X, y)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        values = request.get_json()

        hours = float(values["hours"])
        attendance = float(values["attendance"])
        previous = float(values["previous"])

        if not (0 <= hours <= 24 and
                0 <= attendance <= 100 and
                0 <= previous <= 100):
            return jsonify({"error": "Values are out of range"}), 400

        student = pd.DataFrame([{
            "hours": hours,
            "attendance": attendance,
            "previous": previous
        }])

        score = float(model.predict(student)[0])
        score = max(0, min(100, score))

        if score >= 75:
            level = "High"
        elif score >= 50:
            level = "Moderate"
        else:
            level = "Needs Improvement"

        return jsonify({
            "predicted_score": round(score, 1),
            "performance": level
        })

    except (ValueError, TypeError, KeyError):
        return jsonify({"error": "Please enter valid numbers"}), 400

@app.route("/")
def home():
    return jsonify({"message": "Student Predictor API is running"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
