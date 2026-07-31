from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware # Move import to top
import joblib
import pandas as pd

app = FastAPI()

# Add middleware immediately after app is defined
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define your data structure
class Transaction(BaseModel):
    step: int
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    error_orig: float
    error_dest: float
    type_CASH_IN: int
    type_CASH_OUT: int
    type_DEBIT: int
    type_PAYMENT: int
    type_TRANSFER: int

model = joblib.load('./data/fraud_model.pkl')

@app.post("/predict")
def predict_fraud(transaction: Transaction):
    input_dict = transaction.dict()
    df = pd.DataFrame([input_dict])
    
    expected_features = [
        'step', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 
        'oldbalanceDest', 'newbalanceDest', 'error_orig', 'error_dest', 
        'type_CASH_IN', 'type_CASH_OUT', 'type_DEBIT', 'type_PAYMENT', 'type_TRANSFER'
    ]
    
    df = df.reindex(columns=expected_features)
    df = df.fillna(0)
        
    prediction = model.predict(df)
    return {"is_fraud": int(prediction[0])}