import { useState } from 'react';
import './App.css';

// Configure API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? ''  // In production, use relative paths
  : 'http://localhost:8000';  // In development, use local server URL

function App() {
  const [form, setForm] = useState({
    type: 'polar',
    distance: '',
    angle: '',
    useAzimuth: false,
    degrees: '',
    minutes: '',
    seconds: '',
    ea: '',
    na: '',
    eb: '',
    nb: ''
  });

  const [showDMS, setShowDMS] = useState(false);
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

    // Validate required fields
    if (form.type === 'polar' && !form.distance) {
      setError('Please enter a distance');
      return;
    }

    if (form.type === 'polar') {
      if (form.useAzimuth) {
        if (
          form.degrees === '' || form.degrees === null ||
          form.minutes === '' || form.minutes === null ||
          form.seconds === '' || form.seconds === null
        ) {
          setError('Please enter all DMS values (Degrees, Minutes, Seconds)');
          return;
        }
      } else {
        if (!form.angle) {
          setError('Please enter an angle from East');
          return;
        }
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/calculate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          ...form,
          type: form.type,
          useAzimuth: form.useAzimuth,
          distance: parseFloat(form.distance),
          angle: form.useAzimuth ? null : parseFloat(form.angle),
          degrees: form.useAzimuth ? parseFloat(form.degrees === '' ? '0' : form.degrees) : null,
          minutes: form.useAzimuth ? parseFloat(form.minutes === '' ? '0' : form.minutes) : null,
          seconds: form.useAzimuth ? parseFloat(form.seconds === '' ? '0' : form.seconds) : null,
        }),
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
        <div className="calculation-tabs">
          <button
            type="button"
            className={`tab-button ${form.type === 'polar' ? 'active' : ''}`}
            onClick={() => handleTypeChange({ target: { value: 'polar' } })}
          >
            Polar
          </button>
          <button
            type="button"
            className={`tab-button ${form.type === 'join' ? 'active' : ''}`}
            onClick={() => handleTypeChange({ target: { value: 'join' } })}
          >
            Join
          </button>
        </div>

        <div className="calculation-view">
          {/* Polar calculation view */}
          {form.type === 'polar' && (
            <>
              <div className="form-group">
                <label htmlFor="distance">Distance:</label>
                <input
                  type="number"
                  id="distance"
                  name="distance"
                  value={form.distance}
                  onChange={handleChange}
                  step="any"
                  required
                />
              </div>

              <div className="form-group">
                <label>Direction Type:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="directionType"
                      checked={!form.useAzimuth}
                      onChange={() => {
                        setForm(prev => ({ ...prev, useAzimuth: false }));
                        setShowDMS(false);
                      }}
                    />
                    Angle from East
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="directionType"
                      checked={form.useAzimuth}
                      onChange={() => {
                        setForm(prev => ({ ...prev, useAzimuth: true }));
                        setShowDMS(true);
                      }}
                    />
                    Azimuth (DMS)
                  </label>
                </div>
              </div>

              {showDMS ? (
                <div className="form-group dms-inputs">
                  <label>DMS Direction:</label>
                  <div className="dms-container">
                    <div className="dms-field">
                      <label>Degrees:</label>
                      <input
                        type="number"
                        id="degrees"
                        name="degrees"
                        value={form.degrees}
                        onChange={handleChange}
                        min="0"
                        max="359"
                        required
                      />
                    </div>
                    <div className="dms-field">
                      <label>Minutes:</label>
                      <input
                        type="number"
                        id="minutes"
                        name="minutes"
                        value={form.minutes}
                        onChange={handleChange}
                        min="0"
                        max="59"
                        required
                      />
                    </div>
                    <div className="dms-field">
                      <label>Seconds:</label>
                      <input
                        type="number"
                        id="seconds"
                        name="seconds"
                        value={form.seconds}
                        onChange={handleChange}
                        min="0"
                        max="59.999"
                        step="0.001"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="angle">Angle from East:</label>
                  <input
                    type="number"
                    id="angle"
                    name="angle"
                    value={form.angle}
                    onChange={handleChange}
                    step="0.001"
                    required
                  />
                </div>
              )}
              
              {/* Empty space to maintain consistent height */}
              <div className="spacer"></div>
            </>
          )}

          {/* Join calculation view */}
          {form.type === 'join' && (
            <>
              <div className="form-group join-pair">
                <div>
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
                <div>
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
              </div>
              <div className="form-group join-pair">
                <div>
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
                <div>
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
              </div>
              
              {/* Empty space to maintain consistent height */}
              <div className="spacer"></div>
              <div className="spacer"></div>
            </>
          )}
        </div>

        <button type="submit" className="calculate-button">
          Calculate
        </button>
      </form>

      {result && (
        <div className="result-box">
          <h3>Result:</h3>
          {/* Utility for DMS formatting */}
          {(() => {
            function toDMS(angle) {
              const deg = Math.floor(Math.abs(angle));
              const minFloat = (Math.abs(angle) - deg) * 60;
              const min = Math.floor(minFloat);
              const sec = ((minFloat - min) * 60).toFixed(2);
              const sign = angle < 0 ? '-' : '';
              return `${sign}${deg}° ${min}' ${sec}\"`;
            }
            return (
              <div className="results">
                {result && (
                  <>
                    {(result.method === 'join' || result.method === 'polar') && (
                      <div className="result-section">
                        <h4>Change in Eastings and Northings</h4>
                        <p><strong>ΔE (Change in Eastings):</strong> {Number(result.delta_e).toFixed(2)} m</p>
                        <p><strong>ΔN (Change in Northings):</strong> {Number(result.delta_n).toFixed(2)} m</p>
                      </div>
                    )}

                    <div className="result-section">
                      <h4>Distance</h4>
                      <p><strong>Distance:</strong> {Number(result.distance).toFixed(2)} m</p>
                    </div>

                    <div className="result-section">
                      <h4>Bearings</h4>
                      <p><strong>Azimuth (from North, clockwise):</strong> {toDMS(result.azimuth)}</p>
                      <p><strong>Bearing from East (math angle):</strong> {Number(result.bearing_from_east).toFixed(6)}°</p>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

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
