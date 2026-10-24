import { api } from '../../../shared/api/client';

export interface Place {
  place_id: string;
  name: string;
}

export const placesApi = {
  list: () => api.get<Place[]>('/places'),
};
