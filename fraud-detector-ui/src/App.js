import React, { useState } from 'react';
import axios from 'axios';

// Helper component for consistent Input styling
const FormInput = ({ name, placeholder, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={name} className="text-sm font-medium text-slate-700 capitalize">
      {name.replace(/_/g, ' ')}
    </label>
    <input
      type="number"
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-inner focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-150 outline-none"
      step="any"
    />
  </div>
);

// Helper component for the Transaction Type Toggles (UX Improvement)
const TypeToggle = ({ name, value, onChange }) => {
  const isChecked = value === 1;
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
      <span className="text-sm font-medium text-slate-700 capitalize">
        Is {name.replace('type_', '').replace(/_/g, ' ')}?
      </span>
      <button
        type="button"
        onClick={() => onChange({ target: { name: name, value: isChecked ? 0 : 1 } })}
        className={`${isChecked ? 'bg-indigo-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
      >
        <span className={`${isChecked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
      </button>
    </div>
  );
};


function App() {
  const [formData, setFormData] = useState({
    step: 1, amount: '', oldbalanceOrg: '', newbalanceOrig: '',
    oldbalanceDest: '', newbalanceDest: '', error_orig: 0, error_dest: 0,
    type_CASH_IN: 0, type_CASH_OUT: 1, type_DEBIT: 0, type_PAYMENT: 0, type_TRANSFER: 0
  });
  const [result, setResult] = useState(null);
  // Loading state for animation
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === '' ? '' : parseFloat(value) 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start animation
    setResult(null); // Hide previous result

    try {
      // Formatted payload sent to backend
      const payload = {
        ...formData,
        step: parseInt(formData.step) || 0,
        amount: parseFloat(formData.amount) || 0,
        oldbalanceOrg: parseFloat(formData.oldbalanceOrg) || 0,
        newbalanceOrig: parseFloat(formData.newbalanceOrig) || 0,
        oldbalanceDest: parseFloat(formData.oldbalanceDest) || 0,
        newbalanceDest: parseFloat(formData.newbalanceDest) || 0,
        error_orig: parseFloat(formData.error_orig) || 0,
        error_dest: parseFloat(formData.error_dest) || 0,
      };

      // Live Render API Endpoint
      const response = await axios.post('https://soulfraud-detector.onrender.com/predict', payload);
      setResult(response.data.is_fraud);
    } catch (error) {
      console.error("Error connecting to API:", error);
      setResult('error');
    } finally {
      setIsLoading(false); // Stop animation
    }
  };

  // Group inputs for cleaner layout
  const numericInputs = ['step', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest'];
  const typeInputs = ['type_CASH_IN', 'type_CASH_OUT', 'type_DEBIT', 'type_PAYMENT', 'type_TRANSFER'];
  const errorInputs = ['error_orig', 'error_dest'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between pb-6 border-b border-slate-200">
        <h1 className="text-4xl font-bold tracking-tight">Fraud<span className='text-indigo-600'>Detector</span>.ai</h1>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          API Status: <span className="text-emerald-600 font-medium">● Connected</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* Main Input Card */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-semibold mb-8 text-slate-950">Transaction Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {numericInputs.map(input => (
              <FormInput 
                key={input} 
                name={input} 
                value={formData[input]} 
                onChange={handleChange} 
              />
            ))}
            {errorInputs.map(input => (
              <FormInput 
                key={input} 
                name={input} 
                value={formData[input]} 
                onChange={handleChange} 
              />
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold mb-5">Transaction Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {typeInputs.map(input => (
                <TypeToggle key={input} name={input} value={formData[input]} onChange={handleChange} />
              ))}
            </div>
          </div>
        </div>

        {/* Action Card (Sticky) */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-8">
            <h3 className="text-lg font-semibold mb-5">Analyze Risk</h3>
            <p className="text-sm text-slate-600 mb-6">Review the details and click the button below to run the AI fraud analysis model.</p>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-2xl text-lg shadow-md hover:bg-indigo-700 transition duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Run Analysis'}
            </button>
          </div>

          {/* Results Area */}
          <div className={`bg-white p-6 rounded-3xl shadow-inner border border-slate-200 min-h-[150px] flex items-center justify-center transition-all duration-500 ease-in-out ${result !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {result === 'error' && (
              <div className='text-center text-red-600'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                <p className='font-semibold'>Connection Error</p>
                <p className='text-sm'>Could not reach API</p>
              </div>
            )}
            {result === 1 && (
              <div className='text-center text-amber-600'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.376 1.948 3.376h14.718c1.731 0 2.814-1.876 1.948-3.376L13.5 3.94c-.866-1.5-3.032-1.5-3.898 0L2.697 16.376ZM12 12.75h.008v.008H12v-.008Z" /></svg>
                <p className='font-bold text-3xl'>High Risk (Fraud)</p>
                <p className='text-sm mt-1'>Immediate review recommended</p>
              </div>
            )}
            {result === 0 && (
              <div className='text-center text-emerald-600'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <p className='font-bold text-3xl'>Safe</p>
                <p className='text-sm mt-1'>No anomalies detected</p>
              </div>
            )}
            {result === null && !isLoading && (
              <div className='text-center text-slate-400'>
                <p>Awaiting analysis...</p>
              </div>
            )}
          </div>
        </div>
      </form>

      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} FraudDetector.ai Advanced Transaction Monitoring.</p>
        <p className='mt-1'>Internal Tool - Confidential</p>
      </footer>
    </div>
  );
}

export default App;