/**
 * Local calculation utilities that mirror the server-side functionality
 * These will be used when the server is not available
 */

const Calculations = {
  /**
   * Calculate polar coordinates
   * @param {number} distance - Distance in meters
   * @param {boolean} useAzimuth - Whether to use azimuth (true) or angle from East (false)
   * @param {number} degrees - Degrees for azimuth
   * @param {number} minutes - Minutes for azimuth
   * @param {number} seconds - Seconds for azimuth
   * @param {number} angle - Angle from East in degrees (used when useAzimuth is false)
   * @returns {Object} - { delta_e, delta_n, azimuth, bearing_from_east }
   */
  calculatePolar: (distance, useAzimuth, degrees, minutes, seconds, angle) => {
    // Convert to numbers
    distance = parseFloat(distance);
    degrees = parseFloat(degrees) || 0;
    minutes = parseFloat(minutes) || 0;
    seconds = parseFloat(seconds) || 0;
    angle = parseFloat(angle) || 0;

    let azimuth, bearingFromEast;
    
    if (useAzimuth) {
      // Convert DMS to decimal degrees
      azimuth = degrees + minutes / 60 + seconds / 3600;
      // Convert azimuth to bearing from East
      bearingFromEast = 90 - azimuth;
    } else {
      bearingFromEast = angle;
      // Convert bearing from East to azimuth
      azimuth = (90 - bearingFromEast) % 360;
    }

    // Calculate ΔE and ΔN from distance and bearing
    const delta_e = distance * Math.cos(bearingFromEast * Math.PI / 180);
    const delta_n = distance * Math.sin(bearingFromEast * Math.PI / 180);
    
    return {
      delta_e: parseFloat(delta_e.toFixed(6)),
      delta_n: parseFloat(delta_n.toFixed(6)),
      azimuth: parseFloat(azimuth.toFixed(6)),
      bearing_from_east: parseFloat(bearingFromEast.toFixed(6))
    };
  },

  /**
   * Calculate join between two points
   * @param {number} ea - Easting of point A
   * @param {number} na - Northing of point A
   * @param {number} eb - Easting of point B
   * @param {number} nb - Northing of point B
   * @returns {Object} - { distance, azimuth, bearing_from_east, delta_e, delta_n }
   */
  calculateJoin: (ea, na, eb, nb) => {
    // Convert to numbers
    ea = parseFloat(ea) || 0;
    na = parseFloat(na) || 0;
    eb = parseFloat(eb) || 0;
    nb = parseFloat(nb) || 0;
    
    const delta_e = eb - ea;
    const delta_n = nb - na;
    
    // Calculate distance
    const distance = Math.sqrt(delta_e ** 2 + delta_n ** 2);
    
    // Calculate angle from East (mathematical angle)
    let bearingFromEast = Math.atan2(delta_n, delta_e) * 180 / Math.PI;
    
    // Normalize bearing_from_east to [0, 360)
    bearingFromEast = (bearingFromEast + 360) % 360;
    
    // Calculate azimuth (full-circle from North, clockwise)
    const azimuth = (90 - bearingFromEast + 360) % 360;
    
    return {
      distance: parseFloat(distance.toFixed(6)),
      azimuth: parseFloat(azimuth.toFixed(6)),
      bearing_from_east: parseFloat(bearingFromEast.toFixed(6)),
      delta_e: parseFloat(delta_e.toFixed(6)),
      delta_n: parseFloat(delta_n.toFixed(6))
    };
  },

  /**
   * Convert decimal degrees to DMS (Degrees, Minutes, Seconds)
   * @param {number} decimalDegrees - Angle in decimal degrees
   * @returns {Object} - { degrees, minutes, seconds }
   */
  toDMS: (decimalDegrees) => {
    decimalDegrees = Math.abs(decimalDegrees);
    const degrees = Math.floor(decimalDegrees);
    const minutesFloat = (decimalDegrees - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;
    
    return {
      degrees,
      minutes,
      seconds: parseFloat(seconds.toFixed(2))
    };
  },

  /**
   * Format DMS as a string
   * @param {number} degrees - Degrees
   * @param {number} minutes - Minutes
   * @param {number} seconds - Seconds
   * @returns {string} Formatted DMS string (e.g., "45° 30' 15.25\"")
   */
  formatDMS: (degrees, minutes, seconds) => {
    return `${degrees}° ${minutes.toString().padStart(2, '0')}' ${seconds.toFixed(2)}\"`;
  }
};

export default Calculations;
