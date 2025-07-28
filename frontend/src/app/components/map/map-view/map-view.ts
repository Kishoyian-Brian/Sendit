import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy, AfterViewInit, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Parcel } from '../../../models/parcel.model';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';

interface DeliveryLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'pickup' | 'delivery' | 'driver' | 'route';
  status?: string;
  address?: string;
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './map-view.html',
  styles: `
    .map-container {
      height: 400px;
      width: 100%;
      min-height: 400px;
      border: 1px solid #ccc;
      background-color: #f0f0f0;
      position: relative;
    }
  `
})
export class MapView implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Input() parcels: Parcel[] = [];
  @Input() driverLocation: { lat: number, lng: number } | null = null;
  @Output() mapLocationSelected = new EventEmitter<{ lat: number, lng: number }>();
  @Input() centerLat: number = -1.2921;
  @Input() centerLng: number = 36.8219;
  @Input() zoom: number = 12;
  @Input() hideExtras: boolean = false;

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private deliveryLocations: DeliveryLocation[] = [];
  private routePolyline: L.Polyline | null = null;
  dataLoaded = false;
  routeDistance: number = 0;
  routeDuration: string = '';
  routeLoading: boolean = false;

  faq = [
    {
      question: "What Is a Tracking Number & Where Can I Find It?",
      answer: "A tracking number is a unique code assigned to your parcel. You can find it in your confirmation email or receipt.",
      open: false
    },
    {
      question: "When will my tracking information appear?",
      answer: "Tracking information appears as soon as your parcel is registered and scanned by our system.",
      open: false
    },
    {
      question: "Why is my tracking number/ID not working?",
      answer: "Please double-check your tracking number. If it still doesn't work, contact our support team for assistance.",
      open: false
    },
    {
      question: "If I do not have my tracking number, is it still possible to track my shipment?",
      answer: "Tracking is only possible with a valid tracking number. Please contact the sender or our support for help.",
      open: false
    }
  ];

  toggleFaq(index: number) {
    this.faq[index].open = !this.faq[index].open;
  }

  constructor(private route: ActivatedRoute, private userService: UserService) {
    this.fixLeafletIcons();
  }

  ngOnInit() {
    console.log('MapView ngOnInit - parcels:', this.parcels);
    if (!this.parcels || this.parcels.length === 0) {
      const trackingNumber = this.route.snapshot.paramMap.get('trackingNumber');
      console.log('Tracking number from route:', trackingNumber);
      if (trackingNumber) {
        console.log('Calling trackParcel API...');
        this.userService.trackParcel(trackingNumber).subscribe({
          next: (result) => {
            console.log('TrackParcel API response:', result);
            if (result && result.data) {
              this.parcels = [result.data];
              console.log('Parcels set:', this.parcels);
            }
            this.dataLoaded = true;
            console.log('Data loaded:', this.dataLoaded);
          },
          error: (error) => {
            console.error('Error tracking parcel:', error);
            this.dataLoaded = true;
          }
        });
      } else {
        console.log('No tracking number found in route');
        this.dataLoaded = true;
      }
    } else {
      console.log('Parcels already provided:', this.parcels);
      this.dataLoaded = true;
    }
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    console.log('dataLoaded:', this.dataLoaded);
    console.log('mapContainer:', this.mapContainer);
    
    // Wait for both dataLoaded and DOM to be ready before initializing the map
    const initializeWhenReady = () => {
      console.log('Checking if ready to initialize map...');
      console.log('dataLoaded:', this.dataLoaded);
      console.log('mapContainer exists:', !!this.mapContainer);
      console.log('mapContainer element exists:', !!this.mapContainer?.nativeElement);
      
      if (this.dataLoaded && this.mapContainer?.nativeElement) {
        console.log('Ready to initialize map!');
        this.initializeMap();
      } else {
        console.log('Not ready yet, retrying in 100ms...');
        setTimeout(initializeWhenReady, 100);
      }
    };
    initializeWhenReady();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['parcels'] || changes['driverLocation']) && this.map) {
      this.transformParcelsToLocations();
      this.addMarkersToMap();
    }
    
    // If dataLoaded changes and we have a map container but no map, initialize it
    if (changes['dataLoaded'] && this.dataLoaded && this.mapContainer?.nativeElement && !this.map) {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private fixLeafletIcons() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }

  private initializeMap() {
    console.log('Initializing map...');
    console.log('Map container:', this.mapContainer);
    console.log('Map container element:', this.mapContainer?.nativeElement);
    
    if (!this.mapContainer?.nativeElement) {
      console.error('Map container element not found!');
      return;
    }
    
    try {
      // Ensure the container is visible and has dimensions
      const container = this.mapContainer.nativeElement;
      if (container.offsetHeight === 0) {
        console.log('Container has no height, setting minimum height');
        container.style.minHeight = '400px';
      }
      
      this.map = L.map(container).setView([this.centerLat, this.centerLng], this.zoom);
      console.log('Map created successfully:', this.map);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.mapLocationSelected.emit(e.latlng);
      });

      // Force map to refresh after a short delay to ensure proper rendering
      setTimeout(async () => {
        this.map.invalidateSize();
        console.log('Parcels to process:', this.parcels);
        this.transformParcelsToLocations();
        await this.addMarkersToMap();
        console.log('Map initialization complete');
      }, 100);
      
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private transformParcelsToLocations() {
    this.deliveryLocations = this.parcels.flatMap(parcel => {
      const locations: DeliveryLocation[] = [];
      
      // Helper function to check if location is an object with lat/lng
      const isLocationObject = (loc: any): loc is { lat: number; lng: number } => {
        return loc && typeof loc === 'object' && typeof loc.lat === 'number' && typeof loc.lng === 'number';
      };
      
      // Use real pickupLocation if available
      if (parcel.pickupLocation && isLocationObject(parcel.pickupLocation)) {
        locations.push({
          id: `pickup-${parcel.id}`,
          lat: parcel.pickupLocation.lat,
          lng: parcel.pickupLocation.lng,
          title: `Pickup: ${parcel.pickupAddress}`,
          type: 'pickup',
          status: parcel.status,
          address: parcel.pickupAddress
        });
      } else {
        locations.push({
          id: `pickup-${parcel.id}`,
          lat: this.getRandomLatLng().lat,
          lng: this.getRandomLatLng().lng,
          title: `Pickup: ${parcel.pickupAddress}`,
          type: 'pickup',
          status: parcel.status,
          address: parcel.pickupAddress
        });
      }
      
      // Use real deliveryLocation if available
      if (parcel.deliveryLocation && isLocationObject(parcel.deliveryLocation)) {
        locations.push({
          id: `delivery-${parcel.id}`,
          lat: parcel.deliveryLocation.lat,
          lng: parcel.deliveryLocation.lng,
          title: `Delivery: ${parcel.recipientName}`,
          type: 'delivery',
          status: parcel.status,
          address: parcel.deliveryAddress
        });
      } else {
        locations.push({
          id: `delivery-${parcel.id}`,
          lat: this.getRandomLatLng().lat,
          lng: this.getRandomLatLng().lng,
          title: `Delivery: ${parcel.recipientName}`,
          type: 'delivery',
          status: parcel.status,
          address: parcel.deliveryAddress
        });
      }
      
      // Use currentLocation for live parcel location if available
      if (parcel.currentLocation && isLocationObject(parcel.currentLocation)) {
        locations.push({
          id: `current-${parcel.id}`,
          lat: parcel.currentLocation.lat,
          lng: parcel.currentLocation.lng,
          title: `Current Location`,
          type: 'driver',
          status: parcel.status
        });
      }
      
      // Add all route points as 'route' type markers
      if (parcel.route && Array.isArray(parcel.route)) {
        parcel.route.forEach((point: any, idx: number) => {
          locations.push({
            id: `route-${parcel.id}-${idx}`,
            lat: point.lat,
            lng: point.lng,
            title: `Route Point ${idx + 1}`,
            type: 'route',
            status: parcel.status
          });
        });
      }
      return locations;
    });

    if (this.driverLocation) {
      this.deliveryLocations.push({
        id: 'driver-location',
        lat: this.driverLocation.lat,
        lng: this.driverLocation.lng,
        title: 'Current Location',
        type: 'driver'
      });
    }
  }

  private async addMarkersToMap() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.deliveryLocations.forEach(location => {
      const marker = this.createMarker(location);
      this.markers.push(marker);
    });
    
    // Draw route polyline if available
    if (this.parcels.length && this.parcels[0].route && Array.isArray(this.parcels[0].route) && this.parcels[0].route.length > 1) {
      const latlngs = this.parcels[0].route.map((p: any) => [p.lat, p.lng]) as [number, number][];
      L.polyline(latlngs, { color: 'blue', weight: 4, opacity: 0.7 }).addTo(this.map);
    } else {
      // Generate route between pickup and delivery if no predefined route
      await this.drawRouteBetweenLocations();
    }
  }

  private async drawRouteBetweenLocations() {
    const pickupLocation = this.deliveryLocations.find(loc => loc.type === 'pickup');
    const deliveryLocation = this.deliveryLocations.find(loc => loc.type === 'delivery');
    
    if (pickupLocation && deliveryLocation) {
      // Remove existing route polyline
      if (this.routePolyline) {
        this.map.removeLayer(this.routePolyline);
      }
      
      this.routeLoading = true;
      
      try {
        // Generate route points using real road routing
        const routePoints = await this.generateRoutePoints(pickupLocation, deliveryLocation);
        
        // Calculate route statistics
        this.routeDistance = this.calculateDistance(pickupLocation, deliveryLocation);
        this.routeDuration = this.estimateDuration(this.routeDistance);
        
        // Draw the route polyline
        this.routePolyline = L.polyline(routePoints, { 
          color: '#3B82F6', 
          weight: 4, 
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(this.map);
        
        // Add route information popup
        const midPoint = this.getMidPoint(pickupLocation, deliveryLocation);
        L.marker([midPoint.lat, midPoint.lng])
          .addTo(this.map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-sm">Route Information</h3>
              <p class="text-xs">Distance: ${this.routeDistance.toFixed(1)} km</p>
              <p class="text-xs">Estimated Time: ${this.routeDuration}</p>
              <p class="text-xs">Status: ${this.parcels[0]?.status || 'pending'}</p>
            </div>
          `);
      } catch (error) {
        console.error('Error drawing route:', error);
      } finally {
        this.routeLoading = false;
      }
    }
  }

  private async generateRoutePoints(start: DeliveryLocation, end: DeliveryLocation): Promise<[number, number][]> {
    try {
      // Use OSRM (Open Source Routing Machine) for real road routing
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        
        // Convert GeoJSON coordinates to Leaflet format [lat, lng]
        return coordinates.map((coord: number[]) => [coord[1], coord[0]]) as [number, number][];
      } else {
        // Fallback to straight line if routing fails
        console.warn('Routing service failed, using straight line');
        return this.generateStraightLineRoute(start, end);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback to straight line
      return this.generateStraightLineRoute(start, end);
    }
  }

  private generateStraightLineRoute(start: DeliveryLocation, end: DeliveryLocation): [number, number][] {
    const points: [number, number][] = [];
    points.push([start.lat, start.lng]);
    
    // Add intermediate points for a more realistic route
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const ratio = i / steps;
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      points.push([lat, lng]);
    }
    
    points.push([end.lat, end.lng]);
    return points;
  }

  private calculateDistance(start: DeliveryLocation, end: DeliveryLocation): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(end.lat - start.lat);
    const dLng = this.toRadians(end.lng - start.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(start.lat)) * Math.cos(this.toRadians(end.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private estimateDuration(distance: number): string {
    // Rough estimation: 30 km/h average speed
    const hours = distance / 30;
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else {
      return `${Math.round(hours)} hours`;
    }
  }

  private getMidPoint(start: DeliveryLocation, end: DeliveryLocation): { lat: number; lng: number } {
    return {
      lat: (start.lat + end.lat) / 2,
      lng: (start.lng + end.lng) / 2
    };
  }

  private createMarker(location: DeliveryLocation): L.Marker {
    const icon = this.getMarkerIcon(location);
    const marker = L.marker([location.lat, location.lng], { icon })
      .addTo(this.map)
      .bindPopup(this.createPopupContent(location));
    return marker;
  }
  
  private getMarkerIcon(location: DeliveryLocation): L.DivIcon {
    let iconColor = '#3B82F6'; // blue
    let iconText = '📍';
    
    if (location.type === 'pickup') {
      iconColor = '#10B981'; // green
      iconText = '📦';
    } else if (location.type === 'delivery') {
      iconColor = location.status === 'delivered' ? '#10B981' : '#EF4444'; // green or red
      iconText = '🏠';
    } else if (location.type === 'driver') {
      iconColor = '#F59E0B'; // orange
      iconText = '🚚';
    }
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${iconColor}; 
        border: 2px solid white; 
        border-radius: 50%; 
        width: 20px; 
        height: 20px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${iconText}</div>`,
    });
  }

  private createPopupContent(location: DeliveryLocation): string {
    return `
      <div class="p-1">
        <h3 class="font-bold text-sm">${location.title}</h3>
        ${location.address ? `<p class="text-xs">${location.address}</p>` : ''}
        ${location.status ? `<p class="text-xs">Status: ${location.status}</p>` : ''}
      </div>
    `;
  }

  private getRandomLatLng(): { lat: number; lng: number } {
    const baseLat = -1.2921;
    const baseLng = 36.8219;
    const range = 0.1;
    return {
      lat: baseLat + (Math.random() - 0.5) * range,
      lng: baseLng + (Math.random() - 0.5) * range
    };
  }
}
