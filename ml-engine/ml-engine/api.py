from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
import uvicorn

# 1. Initialize the FastAPI application
app = FastAPI(
    title="Customer Churn AI Decision Support API",
    description="Primary API for the Bank Churn predictive model.",
    version="1.0.0"
)

# Global variables to hold our model and preprocessor in memory
ai_model = None
data_preprocessor = None

# 2. Define the strict JSON schema expected from the React Frontend
class CustomerPayload(BaseModel):
    CreditScore: int = Field(..., example=650)
    Geography: str = Field(..., example="France")
    Gender: str = Field(..., example="Female")
    Age: int = Field(..., example=42)
    Tenure: int = Field(..., example=5)
    Balance: float = Field(..., example=100000.50)
    NumOfProducts: int = Field(..., example=2)
    HasCrCard: int = Field(..., example=1)
    IsActiveMember: int = Field(..., example=1)
    EstimatedSalary: float = Field(..., example=85000.00)
    
    # We use aliases here because Pandas expects spaces in these column names
    Satisfaction_Score: int = Field(..., alias="Satisfaction Score", example=3)
    Card_Type: str = Field(..., alias="Card Type", example="DIAMOND")
    Point_Earned: int = Field(..., alias="Point Earned", example=400)

# 3. Load models into memory when the server wakes up (ensures 45ms response times)
@app.on_event("startup")
async def load_ml_assets():
    global ai_model, data_preprocessor
    try:
        print("⏳ Loading Primary Bank Churn Model into memory...")
        ai_model = load_model('models/bank_churn_model.keras')
        data_preprocessor = joblib.load('models/bank_churn_preprocessor.pkl')
        print("✅ AI Models successfully loaded and ready for inference!")
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        print("Make sure your Jupyter Notebook finished saving the files to the /models folder!")

# 4. The main Prediction Endpoint
@app.post("/predict")
async def predict_churn(customer: CustomerPayload):
    if not ai_model or not data_preprocessor:
        raise HTTPException(status_code=500, detail="AI Model is not loaded into the server.")

    try:
        # Convert the incoming JSON into a dictionary, keeping the space aliases
        input_data = customer.model_dump(by_alias=True)
        
        # Convert the dictionary into a Pandas DataFrame (1 row)
        df = pd.DataFrame([input_data])
        
        # Pass the raw data through the exact same scaler/encoder used in training
        processed_features = data_preprocessor.transform(df)
        
        # Run inference through the Neural Network
        prediction_prob = ai_model.predict(processed_features, verbose=0)[0][0]
        
        # Convert the numpy float to a standard Python float for JSON compatibility
        churn_probability = float(prediction_prob)
        is_churning = bool(churn_probability > 0.50)

        # 5. Return the JSON payload to be consumed by the Node.js Rules Engine
        return {
            "status": "success",
            "data": {
                "churn_probability": round(churn_probability, 4),
                "ai_prediction": is_churning,
                "risk_level": "HIGH" if churn_probability > 0.70 else "MEDIUM" if churn_probability > 0.40 else "LOW"
            },
            "message": "Prediction generated successfully in milliseconds."
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

# 6. The Direct Script Execution (Alternative method to wake up the server)
if __name__ == "__main__":
    print("🚀 Waking up the Uvicorn server on port 8000...")
    uvicorn.run(app, host="127.0.0.1", port=8000)