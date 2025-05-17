import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import CartesianPlot from './CartesianPlot';

// Configure API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? ''  // In production, use relative paths
  : 'http://localhost:8000';  // In development, use local server URL

function App() {
  const [precision, setPrecision] = useState(2);
  const [endpointNameError, setEndpointNameError] = useState(false);
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
    nb: '',
    nameA: '',
    nameB: '',
    polarEa: '',
    polarNa: '',
    polarNameA: '',
    polarEndName: ''
  });

  const [savedPoints, setSavedPoints] = useState([]);
  const [pendingDuplicate, setPendingDuplicate] = useState(null);

  const [showDMS, setShowDMS] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedStatus, setSavedStatus] = useState({ A: false, B: false, polarEnd: false }); // To track save icon state
  const [endpointCoords, setEndpointCoords] = useState({ e: null, n: null }); // Track endpoint coordinates

  // Effect to update endpoint coordinates and endpoint save/tick logic
  useEffect(() => {
    if (form.type === 'polar' && form.polarEa && form.polarNa) {
      // Always recalculate endpoint from current inputs
      let delta_e = 0, delta_n = 0;
      if (result && typeof result.delta_e !== 'undefined' && typeof result.delta_n !== 'undefined') {
        delta_e = result.delta_e;
        delta_n = result.delta_n;
      } else {
        let angleRad = 0;
        if (form.useAzimuth && form.degrees !== '' && form.minutes !== '' && form.seconds !== '') {
          const decimalDegrees = parseFloat(form.degrees || 0) + parseFloat(form.minutes || 0) / 60 + parseFloat(form.seconds || 0) / 3600;
          angleRad = ((90 - decimalDegrees) * Math.PI) / 180;
          if (angleRad < 0) angleRad += 2 * Math.PI;
        } else if (!form.useAzimuth && form.angle !== '') {
          angleRad = parseFloat(form.angle || 0) * Math.PI / 180;
        }
        const distance = parseFloat(form.distance || 0);
        delta_e = distance * Math.cos(angleRad);
        delta_n = distance * Math.sin(angleRad);
      }
      // Calculate endpoint coordinates with proper precision
      const newEndE = (parseFloat(form.polarEa) + (delta_e || 0)).toFixed(precision);
      const newEndN = (parseFloat(form.polarNa) + (delta_n || 0)).toFixed(precision);
      setEndpointCoords({ e: newEndE, n: newEndN });

      // Improved comparison to find matching saved point
      // Convert both to the same precision and format for reliable comparison
      const match = savedPoints.find(pt => {
        const savedE = parseFloat(pt.e).toFixed(precision);
        const savedN = parseFloat(pt.n).toFixed(precision);
        return savedE === newEndE && savedN === newEndN;
      });

      if (match) {
        // If coordinates match a saved point:
        // 1. Always update the name to match the saved point
        // 2. Always show the tick icon
        setForm(f => ({ ...f, polarEndName: match.name }));
        setSavedStatus(prev => ({ ...prev, polarEnd: true }));
      } else {
        // Only clear name if coordinates don't match any saved point
        // and we previously had a saved status
        if (savedStatus.polarEnd) {
          setForm(f => ({ ...f, polarEndName: '' }));
          setSavedStatus(prev => ({ ...prev, polarEnd: false }));
        }
      }
    } else {
      // Only clear name if we had a name and we're not in polar mode
      if (form.polarEndName !== '' && savedStatus.polarEnd) {
        setForm(f => ({ ...f, polarEndName: '' }));
        setSavedStatus(prev => ({ ...prev, polarEnd: false }));
      }
    }
  }, [form.type, form.polarEa, form.polarNa, form.distance, form.angle, form.degrees, form.minutes, form.seconds, form.useAzimuth, result, savedPoints]);

  // Effect to update startpoint save/tick logic in polar mode
  useEffect(() => {
    if (form.type === 'polar' && form.polarEa && form.polarNa) {
      const match = savedPoints.find(pt =>
        Number(pt.e).toFixed(3) === Number(form.polarEa).toFixed(3) &&
        Number(pt.n).toFixed(3) === Number(form.polarNa).toFixed(3)
      );
      if (match) {
        if (form.polarNameA !== match.name || !savedStatus.polarA) {
          setForm(f => ({ ...f, polarNameA: match.name }));
          setSavedStatus(prev => ({ ...prev, polarA: true }));
        }
      } else {
        // Only clear name if we had a name and it no longer matches
        if (form.polarNameA !== '' && savedStatus.polarA) {
          setForm(f => ({ ...f, polarNameA: '' }));
          setSavedStatus(prev => ({ ...prev, polarA: false }));
        }
      }
    } else {
      // Only clear name if we had a name and we're not in polar mode
      if (form.polarNameA !== '' && savedStatus.polarA) {
        setForm(f => ({ ...f, polarNameA: '' }));
        setSavedStatus(prev => ({ ...prev, polarA: false }));
      }
    }
  }, [form.type, form.polarEa, form.polarNa, savedPoints]);

  // Save individual point handler (prevent duplicate coordinates)
  const handleSavePoint = (name, e, n, pointKey) => {
    const pt = { name: name.trim(), e, n };
    // Prevent empty point name for endpoint: set error state for input, not global error
    if (pointKey === 'polarEnd' && !pt.name) {
      setEndpointNameError(true);
      setSavedStatus(prev => ({ ...prev, polarEnd: false }));
      return;
    }
    // Prevent empty point name for other points (keep previous behavior)
    if (pointKey !== 'polarEnd' && !pt.name) {
      setError('Error: Point name cannot be empty');
      return;
    }
    // Check for name match
    if (savedPoints.some(saved => saved.name === pt.name)) {
      setError(`Error: "${pt.name}" already exists`);
      return;
    }
    // Prevent saving if coordinates already exist (even if name is different)
    if (savedPoints.some(saved => Number(saved.e).toFixed(3) === Number(pt.e).toFixed(3) && Number(saved.n).toFixed(3) === Number(pt.n).toFixed(3))) {
      setError('Error: A point with these coordinates already exists.');
      // Also set error state for the coordinate inputs
      if (pointKey === 'polarEnd') {
        setForm(f => ({
          ...f,
          polarEa: f.polarEa,
          polarNa: f.polarNa
        }));
      } else {
        setForm(f => ({
          ...f,
          ea: f.ea,
          na: f.na
        }));
      }
      return;
    }
    setSavedPoints([...savedPoints, pt]);
    setSavedStatus((prev) => ({ ...prev, [pointKey]: true }));
    setEndpointNameError(false);
    setError(null);
  };

  // CSV download helper
  const downloadCSV = (points) => {
    const rows = [
      ['Name', 'Easting', 'Northing'],
      ...points.map(pt => [pt.name || 'Unnamed', pt.e, pt.n])
    ];
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'points.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to check for duplicate single points
  const isDuplicatePoint = (pt) => {
    return savedPoints.some(saved =>
      saved.name === pt.name && saved.e === pt.e && saved.n === pt.n
    );
  };

  // Helper to check for coordinate-only matches
  const findCoordMatch = (pt) => {
    for (const saved of savedPoints) {
      if (
        saved.e === pt.e && saved.n === pt.n &&
        saved.name !== pt.name
      ) {
        return saved;
      }
    }
    return null;
  };

  // Delete point handler
  const handleDeletePoint = (idx) => {
    setSavedPoints(savedPoints.filter((_, i) => i !== idx));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Reset save icon to clipboard for the relevant point if any input changes
    if (['nameA', 'ea', 'na'].includes(e.target.name)) {
      // For start point, only reset saved status if coordinates change
      if (['ea', 'na'].includes(e.target.name)) {
        setSavedStatus((prev) => ({ ...prev, A: false }));
      }
    }
    if (['nameB', 'eb', 'nb'].includes(e.target.name)) {
      setSavedStatus((prev) => ({ ...prev, B: false }));
    }
    // Reset endpoint save status for polar tab if relevant fields change
    if (['polarEndName', 'polarEa', 'polarNa', 'distance', 'angle', 'degrees', 'minutes', 'seconds'].includes(e.target.name)) {
      setSavedStatus((prev) => ({ ...prev, polarEnd: false }));
    }
    setError(null); // Clear error on input change
  };

  const handleTypeChange = (e) => {
    setForm({ ...form, type: e.target.value });
    setResult(null);
    setError(null);
    setEndpointCoords({ e: null, n: null }); // Reset endpoint coordinates when switching tabs
    setSavedStatus(prev => ({ ...prev, polarEnd: false })); // Reset endpoint saved status
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

  // Utility for DMS formatting
  function toDMS(angle) {
    const deg = Math.floor(Math.abs(angle));
    const minFloat = (Math.abs(angle) - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(2);
    const sign = angle < 0 ? '-' : '';
    return `${sign}${deg}° ${min}' ${sec}\"`;
  }

  return (
    <div className="app-container">
      <div className="calculator-container">
      <div className="header-section">
        <h1 className="header-title">Polar & Join Calculator</h1>
      </div>
      <form onSubmit={handleSubmit} className="calculator-form">
        <div className="tab-section">
          <button
            type="button"
            className={`tab-button ${form.type === 'polar' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleTypeChange({ target: { value: 'polar' } });
            }}
            tabIndex="-1"
            style={{ outline: 'none' }}
          >
            Polar
          </button>
          <button
            type="button"
            className={`tab-button ${form.type === 'join' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleTypeChange({ target: { value: 'join' } });
            }}
            tabIndex="-1"
            style={{ outline: 'none' }}
          >
            Join
          </button>
        </div>

        <div className="precision-row">
          <label htmlFor="precision-input" className="precision-label">Decimal Places:</label>
          <input
            id="precision-input"
            type="number"
            min="0"
            max="10"
            value={typeof precision === 'number' ? precision : ''}
            onChange={e => {
              const val = e.target.value;
              // Allow blank or temporarily invalid input for editing
              if (val === '') {
                setPrecision('');
                setError('Decimal places required');
                return;
              }
              // Only allow integers 0-10
              const num = Number(val);
              if (!Number.isInteger(num) || num < 0 || num > 10) {
                setPrecision(val);
                setError('Decimal places must be an integer 0-10');
                return;
              }
              setError(null);
              setPrecision(num);
            }}
            className={`precision-input${error && error.toLowerCase().includes('decimal') ? ' input-error' : ''}`}
            style={{ width: 50, marginLeft: 8, borderColor: error && error.toLowerCase().includes('decimal') ? 'red' : undefined }}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>

        <div className="calculator-operations">
          <div className="cartesian-plot-box">
            <CartesianPlot
              data={form.type === 'polar' && result ? {
                ea: form.polarEa || '0',
                na: form.polarNa || '0',
                eb: endpointCoords.e || (parseFloat(form.polarEa || 0) + (result?.delta_e || 0)).toFixed(precision),
                nb: endpointCoords.n || (parseFloat(form.polarNa || 0) + (result?.delta_n || 0)).toFixed(precision)
              } : form}
              type={form.type}
              nameA={form.type === 'polar' ? form.polarNameA : form.nameA}
              nameB={form.type === 'polar' ? (form.polarEndName || '') : form.nameB}
              precision={precision}
            />

{result && (
        <div className="result-box">
          <h3>Result:</h3>
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
                  <p><strong>Distance:</strong> {Number(result.distance).toFixed(precision)} m</p>
                </div>

                <div className="result-section">
                  <h4>Bearings</h4>
                  <p><strong>Azimuth (from North, clockwise):</strong> {toDMS(result.azimuth)}</p>
                  <p><strong>Bearing from East (math angle):</strong> {Number(result.bearing_from_east).toFixed(6)}°</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
          </div>
          
          {/* Polar start point input section */}
          {form.type === 'polar' && (
            <>
              <div className="inputs-container">
                <div className="form-group join-pair">
                  <div className="points-flex-container">
                    <div>
                      <div className="points-flex-row">
                        <label htmlFor="polarNameA">Start Point</label>
                        <select
                          className="point-select"
                          value={savedPoints.findIndex(pt => pt.name === form.polarNameA)}
                          onChange={e => {
                            const idx = Number(e.target.value);
                            if (!isNaN(idx)) {
                              const pt = savedPoints[idx];
                              setForm(f => ({ ...f, polarNameA: pt.name, polarEa: pt.e, polarNa: pt.n }));
                              setError(null);
                            }
                          }}
                        >
                          <option value="">Select</option>
                          {savedPoints.map((pt, idx) => (
                            <option key={idx} value={idx}>{pt.name || 'Unnamed'}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        id="polarNameA"
                        name="polarNameA"
                        value={form.polarNameA}
                        onChange={e => setForm(f => ({ ...f, polarNameA: e.target.value }))}
                        placeholder="Name"
                        className="point-name-input"
                      />
                    </div>
                    <span
                      className="save-icon"
                      title="Save Start Point"
                      onClick={() => handleSavePoint(form.polarNameA, form.polarEa, form.polarNa, 'polarA')}
                    >
                      {savedStatus.polarA ? '✔' : '📋'}
                    </span>
                  </div>
                  <div>
                    <label htmlFor="polarEa">Easting (X):</label>
                    <input
                      type="number"
                      id="polarEa"
                      name="polarEa"
                      value={form.polarEa}
                      onChange={e => setForm(f => ({ ...f, polarEa: e.target.value }))}
                      step="any"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="polarNa">Northing (Y):</label>
                    <input
                      type="number"
                      id="polarNa"
                      name="polarNa"
                      value={form.polarNa}
                      onChange={e => setForm(f => ({ ...f, polarNa: e.target.value }))}
                      step="any"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="distance">Distance:</label>
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    value={form.distance < 0 ? 'error' : form.distance}
                    onChange={e => {
                      const val = e.target.value;
                      if (Number(val) < 0) {
                        setForm(f => ({ ...f, distance: val }));
                        setError('Distance cannot be negative');
                      } else {
                        setForm(f => ({ ...f, distance: val }));
                        if (error && error.toLowerCase().includes('distance')) setError(null);
                      }
                    }}
                    step="any"
                    min="0"
                    required
                    className={form.distance < 0 ? 'input-error' : ''}
                    placeholder={form.distance < 0 ? 'error' : ''}
                    inputMode="decimal"
                  />
                </div>

                <div className="form-group">
                  <div className="direction-input-container">
                    <div className="direction-type-selector">
                      <button
                        type="button"
                        className={`direction-button ${!form.useAzimuth ? 'active' : ''}`}
                        onClick={() => {
                          setForm({ ...form, useAzimuth: false });
                          setShowDMS(false);
                        }}
                        style={{ outline: 'none' }}
                      >
                        Angle from East
                      </button>
                      <button
                        type="button"
                        className={`direction-button ${form.useAzimuth ? 'active' : ''}`}
                        onClick={() => {
                          setForm({ ...form, useAzimuth: true });
                          setShowDMS(true);
                        }}
                        style={{ outline: 'none' }}
                      >
                        Azimuth (from North)
                      </button>
                    </div>
                  </div>

                  {form.useAzimuth ? (
                    <div className="dms-container">
                      <label>Azimuth (DMS):</label>
                      <div className="dms-inputs">
                        <div>
                          <input
                            type="number"
                            name="degrees"
                            value={form.degrees}
                            onChange={handleChange}
                            placeholder="Degrees"
                            min="0"
                            max="359"
                            step="1"
                            required={form.useAzimuth}
                          />
                          <span>°</span>
                        </div>
                        <div>
                          <input
                            type="number"
                            name="minutes"
                            value={form.minutes}
                            onChange={handleChange}
                            placeholder="Minutes"
                            min="0"
                            max="59"
                            step="1"
                            required={form.useAzimuth}
                          />
                          <span>'</span>
                        </div>
                        <div>
                          <input
                            type="number"
                            name="seconds"
                            value={form.seconds}
                            onChange={handleChange}
                            placeholder="Seconds"
                            min="0"
                            max="59.999"
                            step="0.001"
                            required={form.useAzimuth}
                          />
                          <span>"</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="angle">Angle from East (degrees):</label>
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
                </div>
              </div>

              {/* Endpoint naming and saving UI for polar mode (moved below inputs container) */}
              {form.type === 'polar' && form.polarEa && form.polarNa && result && (
                <div className="form-group join-pair" style={{ marginTop: '16px' }}>
                  <div className="points-flex-container">
                    <div>
                      <div className="points-flex-row">
                        <label htmlFor="polarEndName">Endpoint Name</label>
                      </div>
                      <input
                        type="text"
                        id="polarEndName"
                        name="polarEndName"
                        value={form.polarEndName || ''}
                        onChange={e => {
                          setForm(f => ({ ...f, polarEndName: e.target.value }));
                          setEndpointNameError(false); // Clear error state when typing
                          // Only reset saved status if name changes, not coordinates
                          if (e.target.value !== '') {
                            setSavedStatus(prev => ({ ...prev, polarEnd: false }));
                          }
                        }}
                        placeholder="Name for endpoint"
                        className={`point-name-input${endpointNameError ? ' input-error' : ''}`}
                        style={endpointNameError ? { borderColor: 'red', color: 'red' } : {}}
                      />
                      {error && error.includes('coordinates already exist') && (
                        <div className="error-message" style={{ color: 'red', marginTop: '4px' }}>
                          {error}
                        </div>
                      )}
                    </div>
                    <span
                      className="save-icon"
                      title="Save Endpoint"
                      onClick={() => handleSavePoint(
                        form.polarEndName,
                        (parseFloat(form.polarEa) + (result.delta_e || 0)).toFixed(precision),
                        (parseFloat(form.polarNa) + (result.delta_n || 0)).toFixed(precision),
                        'polarEnd')}
                    >
                      {savedStatus.polarEnd ? '✔' : '📋'}
                    </span>
                  </div>
                  <div>
                    <label htmlFor="polarEndE">Easting (X):</label>
                    <input
                      type="number"
                      id="polarEndE"
                      name="polarEndE"
                      value={((typeof precision === 'number' && precision !== '' && !isNaN(precision)) ? (parseFloat(form.polarEa) + (result.delta_e || 0)).toFixed(precision) : (parseFloat(form.polarEa) + (result.delta_e || 0)))}
                      readOnly
                      step="any"
                    />
                  </div>
                  <div>
                    <label htmlFor="polarEndN">Northing (Y):</label>
                    <input
                      type="number"
                      id="polarEndN"
                      name="polarEndN"
                      value={((typeof precision === 'number' && precision !== '' && !isNaN(precision)) ? (parseFloat(form.polarNa) + (result.delta_n || 0)).toFixed(precision) : (parseFloat(form.polarNa) + (result.delta_n || 0)))}
                      readOnly
                      step="any"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Join calculation view */}
          {form.type === 'join' && (
            <>
              <div className="form-group join-pair">
                <div className="points-flex-container">
                  <div>
                    <div className="points-flex-row">
                      <label htmlFor="nameA">Point A </label>
                      <select
                        className="point-select"
                        value={savedPoints.findIndex(pt => pt.name === form.nameA)}
                        onChange={e => {
                          const idx = Number(e.target.value);
                          if (!isNaN(idx)) {
                            const pt = savedPoints[idx];
                            if (pt.name === form.nameB) {
                              setError(`Please choose another point. '${pt.name || 'Unnamed'}' is already input for B`);
                              return;
                            }
                            setForm(f => ({ ...f, nameA: pt.name, ea: pt.e, na: pt.n }));
                            setSavedStatus(prev => ({ ...prev, A: false }));
                            setError(null);
                          }
                        }}
                      >
                        <option value="">Select</option>
                        {savedPoints.map((pt, idx) => (
                          <option key={idx} value={idx} disabled={pt.name === form.nameB}>{pt.name || 'Unnamed'}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      id="nameA"
                      name="nameA"
                      value={form.nameA}
                      onChange={handleChange}
                      placeholder="Name"
                      className="point-name-input"
                    />
                  </div>
                  <span
                    className="save-icon"
                    title="Save Point A"
                    onClick={() => handleSavePoint(form.nameA, form.ea, form.na, 'A')}
                  >
                    {savedStatus.A ? '✔' : '📋'}
                  </span>
                </div>
                <div>
                  <label htmlFor="ea">Easting (X):</label>
                  <input
                    type="number"
                    id="ea"
                    name="ea"
                    value={form.ea}
                    onChange={(e) => {
                      handleChange(e);
                      setSavedStatus(prev => ({ ...prev, A: false }));
                    }}
                    step="any"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="na">Northing (Y):</label>
                  <input
                    type="number"
                    id="na"
                    name="na"
                    value={form.na}
                    onChange={(e) => {
                      handleChange(e);
                      setSavedStatus(prev => ({ ...prev, A: false }));
                    }}
                    step="any"
                    required
                  />
                </div>
              </div>
              <div className="form-group join-pair">
                <div className="points-flex-container">
                  <div>
                    <div className="points-flex-row">
                      <label htmlFor="nameB">Point B </label>
                      <select
                        className="point-select"
                        value={savedPoints.findIndex(pt => pt.name === form.nameB)}
                        onChange={e => {
                          const idx = Number(e.target.value);
                          if (!isNaN(idx)) {
                            const pt = savedPoints[idx];
                            if (pt.name === form.nameA) {
                              setError(`Please choose another point. '${pt.name || 'Unnamed'}' is already input for A`);
                              return;
                            }
                            setForm(f => ({ ...f, nameB: pt.name, eb: pt.e, nb: pt.n }));
                            setSavedStatus(prev => ({ ...prev, B: false }));
                            setError(null);
                          }
                        }}
                      >
                        <option value="">Select</option>
                        {savedPoints.map((pt, idx) => (
                          <option key={idx} value={idx} disabled={pt.name === form.nameA}>{pt.name || 'Unnamed'}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      id="nameB"
                      name="nameB"
                      value={form.nameB}
                      onChange={handleChange}
                      placeholder="Name"
                      className="point-name-input"
                    />
                  </div>
                  <span
                    className="save-icon"
                    title="Save Point B"
                    onClick={() => handleSavePoint(form.nameB, form.eb, form.nb, 'B')}
                  >
                    {savedStatus.B ? '✔' : '📋'}
                  </span>
                </div>
                <div>
                  <label htmlFor="eb">Easting (X):</label>
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
                  <label htmlFor="nb">Northing (Y):</label>
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
          <div className="calcbutbox">
            <button type="submit" className="calculate-button">
              Calculate
            </button>
          </div>
        </div>
      </form>

<div className="bottom-box">
      {/* Saved Points Table */}
      {savedPoints.length > 0 && (
        <div className="saved-points-section">
          <div className="saved-points-header-row">
            <span className="saved-points-title">Saved Points</span>
            <button
              className="download-csv-button"
              onClick={() => downloadCSV(savedPoints)}
            >
              Download CSV
            </button>
          </div>
          <table className="saved-points-table">
            <thead>
              <tr className="saved-points-header">
                <th className="saved-points-cell">Point</th>
                <th className="saved-points-cell">Easting (X)</th>
                <th className="saved-points-cell">Northing (Y)</th>
                <th className="saved-points-cell"></th>
              </tr>
            </thead>
            <tbody>
              {savedPoints.map((pt, idx) => (
                <tr key={idx}>
                  <td className="saved-points-cell">{pt.name || 'Unnamed'}</td>
                  <td className="saved-points-cell">{(typeof precision === 'number' && precision !== '' && !isNaN(precision)) ? Number(pt.e).toFixed(precision) : pt.e}</td>
                  <td className="saved-points-cell">{(typeof precision === 'number' && precision !== '' && !isNaN(precision)) ? Number(pt.n).toFixed(precision) : pt.n}</td>
                  <td className="saved-points-cell">
                    <span
                      className="delete-icon"
                      title="Delete point"
                      onClick={() => handleDeletePoint(idx)}
                    >
                      ×
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
      {error && (
        <div className="error-box">
          <p>Error: {error}</p>
        </div>
      )}
</div>
      <footer className="app-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Polar & Join Calculator v1.0.0</p>
          <div className="footer-links">
            <a href="#" onClick={(e) => { e.preventDefault(); /* Add about action */ }}>About</a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => { e.preventDefault(); /* Add help action */ }}>Help</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default App;