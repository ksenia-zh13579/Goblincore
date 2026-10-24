import { useEffect, useState } from 'react';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { placesApi, Place } from '../api/placesApi';

export function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    placesApi.list()
      .then(({ data }) => setPlaces(data))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Не удалось загрузить магазины');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>Магазины</h1>
          <p className="muted">Все магазины и источники, добавленные в записях</p>
        </div>
        <span className="stat-card__label">{places.length}</span>
      </header>

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : places.length === 0 ? (
        <EmptyState text="Магазинов пока нет" />
      ) : (
        <ul className="categories">
          {places.map((place) => (
            <li key={place.place_id} className="category-row">
              <span className="category-row__name">{place.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
