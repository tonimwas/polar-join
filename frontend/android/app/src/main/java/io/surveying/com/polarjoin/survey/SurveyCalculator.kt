package com.polarjoin.survey

import kotlin.math.*

object SurveyCalculator {

    // Result for Join Method
    data class JoinResult(
        val distance: Double,
        val bearingFromEast: Double,
        val azimuth: Double,
        val deltaE: Double,
        val deltaN: Double
    )

    /**
     * Calculates distance and bearings between two points (Join Method).
     * EA, NA = Easting/Northing of point A
     * EB, NB = Easting/Northing of point B
     */
    fun joinMethod(ea: Double, na: Double, eb: Double, nb: Double): JoinResult {
        val deltaE = eb - ea
        val deltaN = nb - na
        val distance = sqrt(deltaE * deltaE + deltaN * deltaN)
        // Mathematical angle from East (0° = East, counter-clockwise positive)
        var bearingFromEast = Math.toDegrees(atan2(deltaN, deltaE))
        if (bearingFromEast < 0) bearingFromEast += 360
        // Azimuth from North (0° = North, clockwise positive)
        var azimuth = (90 - bearingFromEast)
        if (azimuth < 0) azimuth += 360
        return JoinResult(distance, bearingFromEast, azimuth, deltaE, deltaN)
    }

    // Result for Polar Method
    data class PolarResult(
        val eb: Double,
        val nb: Double,
        val deltaE: Double,
        val deltaN: Double
    )

    /**
     * Calculates new coordinates from a start point, distance, and direction (Polar Method).
     * EA, NA = Easting/Northing of start point
     * distance = distance to new point
     * bearingFromEast = direction (angle from East, decimal degrees)
     */
    fun polarMethod(ea: Double, na: Double, distance: Double, bearingFromEast: Double): PolarResult {
        val rad = Math.toRadians(bearingFromEast)
        val deltaE = distance * cos(rad)
        val deltaN = distance * sin(rad)
        val eb = ea + deltaE
        val nb = na + deltaN
        return PolarResult(eb, nb, deltaE, deltaN)
    }
}
