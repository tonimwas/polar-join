import { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({
    type: 'polar',
    easting: '',
    northing: '',
    ea: '',
    na: '',
    eb: '',
    nb: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    setForm({ ...form, type: e.target.value });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/calculate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
      } else {
        setError(data.error || 'Calculation failed');
      }
    } catch (err) {
      setError('Network error: Could not connect to server');
    }
  };

  return (
    <div className="calculator-container">
      <h1>Polar & Join Calculator</h1>
      <form onSubmit={handleSubmit} className="calculator-form">
        <div className="form-group">
          <label htmlFor="type">Calculation Type:</label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleTypeChange}
            required
          >
            <option value="polar">Polar to Cartesian</option>
            <option value="join">Join (Line)</option>
          </select>
        </div>

        {form.type === 'polar' && (
          <>
            <div className="form-group">
              <label htmlFor="easting">Easting (ΔE):</label>
              <input
                type="number"
                id="easting"
                name="easting"
                value={form.easting}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="northing">Northing (ΔN):</label>
              <input
                type="number"
                id="northing"
                name="northing"
                value={form.northing}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
          </>
        )}

        {form.type === 'join' && (
          <>
            <div className="form-group">
              <label htmlFor="ea">EA:</label>
              <input
                type="number"
                id="ea"
                name="ea"
                value={form.ea}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="na">NA:</label>
              <input
                type="number"
                id="na"
                name="na"
                value={form.na}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="eb">EB:</label>
              <input
                type="number"
                id="eb"
                name="eb"
                value={form.eb}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nb">NB:</label>
              <input
                type="number"
                id="nb"
                name="nb"
                value={form.nb}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="calculate-button">
          Calculate
        </button>
      </form>

      {result && (
        <div className="result-box">
          <h3>Result:</h3>
          <div className="results-container">
            <div className="result-section">
              <h4>Distance</h4>
              <p><strong>Distance:</strong> {result.distance} m</p>
            </div>

            <div className="result-section">
              <h4>Bearings</h4>
              <p><strong>Azimuth (from North, clockwise):</strong> {result.azimuth}°</p>
              <p><strong>Bearing from East (math angle):</strong> {result.bearing_from_east}°</p>
            </div>

            {result.method === 'join' && (
              <div className="result-section">
                <h4>Coordinate Changes</h4>
                <p><strong>ΔE:</strong> {result.delta_e} m</p>
                <p><strong>ΔN:</strong> {result.delta_n} m</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="error-box">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}

export default App;
