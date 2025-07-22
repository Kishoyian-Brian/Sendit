import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy, AfterViewInit, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Parcel } from '../../../models/parcel.model';

interface DeliveryLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'pickup' | 'delivery' | 'driver';
  status?: string;
  address?: string;
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.html',
  styles: `
    .map-container {
      height: 400px;
      width: 100%;
    }
  `
})
export class MapView implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() parcels: Parcel[] = [];
  @Input() driverLocation: { lat: number, lng: number } | null = null;
  @Output() mapLocationSelected = new EventEmitter<{ lat: number, lng: number }>();
  @Input() centerLat: number = -1.2921;
  @Input() centerLng: number = 36.8219;
  @Input() zoom: number = 12;

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private deliveryLocations: DeliveryLocation[] = [];

  constructor() {
    this.fixLeafletIcons();
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['parcels'] || changes['driverLocation']) && this.map) {
      this.transformParcelsToLocations();
      this.addMarkersToMap();
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
    this.map = L.map(this.mapContainer.nativeElement).setView([this.centerLat, this.centerLng], this.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.mapLocationSelected.emit(e.latlng);
    });

    this.transformParcelsToLocations();
    this.addMarkersToMap();
  }

  private transformParcelsToLocations() {
    this.deliveryLocations = this.parcels.flatMap(parcel => {
      const locations: DeliveryLocation[] = [];
      locations.push({
        id: `pickup-${parcel.id}`,
        lat: this.getRandomLatLng().lat, // Replace with actual coords if available
        lng: this.getRandomLatLng().lng,
        title: `Pickup: ${parcel.sender}`,
        type: 'pickup',
        status: parcel.status,
        address: parcel.pickupAddress
      });
      locations.push({
        id: `delivery-${parcel.id}`,
        lat: this.getRandomLatLng().lat, // Replace with actual coords if available
        lng: this.getRandomLatLng().lng,
        title: `Delivery: ${parcel.recipient}`,
        type: 'delivery',
        status: parcel.status,
        address: parcel.deliveryAddress
      });
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

  private addMarkersToMap() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.deliveryLocations.forEach(location => {
      const marker = this.createMarker(location);
      this.markers.push(marker);
    });
  }

  private createMarker(location: DeliveryLocation): L.Marker {
    const icon = this.getMarkerIcon(location);
    const marker = L.marker([location.lat, location.lng], { icon })
      .addTo(this.map)
      .bindPopup(this.createPopupContent(location));
    return marker;
  }
  
  private getMarkerIcon(location: DeliveryLocation): L.DivIcon {
    let iconColor = 'blue';
    if (location.type === 'delivery') {
      iconColor = location.status === 'delivered' ? 'green' : 'red';
    } else if (location.type === 'driver') {
      iconColor = 'orange';
    }
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${iconColor};"></div>`,
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
