import axios from 'axios';

export interface SyncData {
  cursor: string;
  hasMore: boolean;
  property: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    city: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    facilities: string[];
    coverImageUrl: string | null;
  };
  rooms: Array<{
    id: string;
    name: string;
    description: string | null;
    area: number | null;
    bedType: string;
    maxGuests: number;
    amenities: string[];
    basePrice: number;
    currency: string;
    coverImageUrl: string | null;
    imageUrls: string[];
    minNights: number;
    maxNights: number | null;
    cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  }>;
}

export class SyncClient {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash
  }

  async sync(cursor?: string): Promise<SyncData> {
    const url = `${this.endpoint}/api/public/sync`;
    const params: any = {};
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get(url, { params, timeout: 30000 });
    return response.data.data;
  }

  async getProperty(propertyId: string): Promise<any> {
    const url = `${this.endpoint}/api/public/property/${propertyId}`;
    const response = await axios.get(url, { timeout: 10000 });
    return response.data.data;
  }

  async getRooms(propertyId: string): Promise<any[]> {
    const url = `${this.endpoint}/api/public/rooms`;
    const response = await axios.get(url, {
      params: { propertyId },
      timeout: 10000,
    });
    return response.data.data;
  }
}

export default SyncClient;
