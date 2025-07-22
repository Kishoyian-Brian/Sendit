import { Injectable } from '@angular/core';

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapsService {

  constructor() { }

  /**
   * Mock geocoding service for demonstration
   * In a real application, you could use a free geocoding service like:
   * - Nominatim (OpenStreetMap)
   * - MapBox Geocoding API (free tier)
   * - HERE Geocoding API (free tier)
   */
  async geocodeAddress(address: string): Promise<MapLocation | null> {
    // Mock implementation - returns random coordinates around Nairobi
    const baseLat = -1.2921;
    const baseLng = 36.8219;
    const range = 0.1;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      lat: baseLat + (Math.random() - 0.5) * range,
      lng: baseLng + (Math.random() - 0.5) * range,
      address: address
    };
  }

  /**
   * Mock reverse geocoding service
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const areas = [
      'Westlands, Nairobi',
      'CBD, Nairobi',
      'Karen, Nairobi',
      'Kilimani, Nairobi',
      'Parklands, Nairobi',
      'Lavington, Nairobi'
    ];
    
    return areas[Math.floor(Math.random() * areas.length)];
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: MapLocation, point2: MapLocation): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get route between two points
   * In a real application, you could use:
   * - OpenRouteService API
   * - MapBox Directions API
   * - OSRM (Open Source Routing Machine)
   */
  async getRoute(origin: MapLocation, destination: MapLocation): Promise<MapLocation[]> {
    // Mock implementation - returns a simple straight line with some waypoints
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const waypoints: MapLocation[] = [];
    const steps = 5;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      waypoints.push({
        lat: origin.lat + (destination.lat - origin.lat) * ratio,
        lng: origin.lng + (destination.lng - origin.lng) * ratio
      });
    }
    
    return waypoints;
  }

  /**
   * Get estimated travel time between two points
   */
  getEstimatedTravelTime(origin: MapLocation, destination: MapLocation): number {
    const distance = this.calculateDistance(origin, destination);
    const averageSpeed = 30; // km/h in city traffic
    return Math.round((distance / averageSpeed) * 60); // Return time in minutes
  }
}