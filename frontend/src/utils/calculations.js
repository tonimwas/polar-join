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
   * @returns {Object} - Polar calculation results
   */
  calculatePolar: (distance, useAzimuth, degrees, minutes, seconds, angle) => {
    // Convert to numbers
    distance = parseFloat(distance);
    degrees = parseFloat(degrees) || 0;
    minutes = parseFloat(minutes) || 0;
    seconds = parseFloat(seconds) || 0;
    angle = parseFloat(angle) || 0;

    let bearingFromEast;
    let azimuth;
    
    if (useAzimuth) {
      // Convert DMS to decimal degrees for azimuth
      azimuth = degrees + minutes / 60 + seconds / 3600;
      // Convert azimuth to bearing from East (90 - azimuth)
      bearingFromEast = 90 - azimuth;
    } else {
      // Use the angle directly if not using azimuth
      bearingFromEast = angle;
      // Convert bearing from East to azimuth
      azimuth = (90 - bearingFromEast + 360) % 360;
    }

    // Calculate ΔE and ΔN from distance and bearing
    const delta_e = distance * Math.cos(bearingFromEast * Math.PI / 180);
    const delta_n = distance * Math.sin(bearingFromEast * Math.PI / 180);
    
    // Convert azimuth to DMS for display
    const azimuthDeg = Math.floor(azimuth);
    const azimuthMin = Math.floor((azimuth - azimuthDeg) * 60);
    const azimuthSec = ((azimuth - azimuthDeg - azimuthMin / 60) * 3600).toFixed(2);
    
    return {
      method: 'polar',
      distance: parseFloat(distance.toFixed(6)),
      bearing_from_east: parseFloat(bearingFromEast.toFixed(6)),
      azimuth: parseFloat(azimuth.toFixed(6)),
      azimuth_dms: {
        degrees: azimuthDeg,
        minutes: azimuthMin,
        seconds: parseFloat(azimuthSec)
      },
      delta_e: parseFloat(delta_e.toFixed(6)),
      delta_n: parseFloat(delta_n.toFixed(6)),
      start_point: {
        e: 0,
        n: 0
      },
      end_point: {
        e: parseFloat(delta_e.toFixed(6)),
        n: parseFloat(delta_n.toFixed(6))
      }
    };
  },

  /**
   * Calculate join between two points
   * @param {number} ea - Easting of point A
   * @param {number} na - Northing of point A
   * @param {number} eb - Easting of point B
   * @param {number} nb - Northing of point B
   * @returns {Object} - Join calculation results
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
    
    // Convert azimuth to DMS for display
    const azimuthDeg = Math.floor(azimuth);
    const azimuthMin = Math.floor((azimuth - azimuthDeg) * 60);
    const azimuthSec = ((azimuth - azimuthDeg - azimuthMin / 60) * 3600).toFixed(2);
    
    return {
      method: 'join',
      distance: parseFloat(distance.toFixed(6)),
      bearing_from_east: parseFloat(bearingFromEast.toFixed(6)),
      azimuth: parseFloat(azimuth.toFixed(6)),
      azimuth_dms: {
        degrees: azimuthDeg,
        minutes: azimuthMin,
        seconds: parseFloat(azimuthSec)
      },
      delta_e: parseFloat(delta_e.toFixed(6)),
      delta_n: parseFloat(delta_n.toFixed(6)),
      start_point: {
        e: ea,
        n: na
      },
      end_point: {
        e: eb,
        n: nb
      }
    };
  },

  /**
   * Convert decimal degrees to DMS (Degrees, Minutes, Seconds)
   * @param {number} decimalDegrees - Angle in decimal degrees
   * @returns {Object} - { degrees, minutes, seconds }
   */
  toDMS: (decimalDegrees) => {
    const absDegrees = Math.abs(decimalDegrees);
    const degrees = Math.floor(absDegrees);
    const minutesFloat = (absDegrees - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;
    
    return {
      degrees: decimalDegrees < 0 ? -degrees : degrees,
      minutes,
      seconds: parseFloat(seconds.toFixed(2))
    };
  },

  /**
   * Format DMS as a string
   * @param {number} degrees - Degrees
   * @param {number} minutes - Minutes
   * @param {number} seconds - Seconds
   * @returns {string} Formatted DMS string (e.g., "45° 30' 15.25"")
   */
  formatDMS: (degrees, minutes, seconds) => {
    const sign = degrees < 0 ? '-' : '';
    const absDegrees = Math.abs(degrees);
    return `${sign}${absDegrees}° ${minutes.toString().padStart(2, '0')}' ${seconds.toFixed(2).padStart(5, '0')}"`;
  }


};

export default Calculations;
