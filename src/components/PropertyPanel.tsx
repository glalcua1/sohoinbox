import type { PropertyInfo } from '../types/inbox'

interface Props {
  property?: PropertyInfo
  onCollapse?: () => void
}

export default function PropertyPanel({ property, onCollapse }: Props) {
  return (
    <aside className="h-full w-full overflow-y-auto border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Property</h2>
        {onCollapse && (
          <button className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={onCollapse} title="Hide property panel">Hide</button>
        )}
      </div>
      {!property ? (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No property selected</div>
      ) : (
        <div className="p-4 space-y-6">
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Overview</p>
            <div className="mt-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{property.name}</p>
              {(property.rating || property.reviewsCount) && (
                <p className="mt-0.5 text-sm text-gray-600">
                  {property.rating ? `★ ${property.rating.toFixed(1)}` : ''}
                  {property.reviewsCount ? ` • ${property.reviewsCount.toLocaleString()} reviews` : ''}
                </p>
              )}
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p className="text-gray-600 dark:text-gray-400"><span className="text-gray-500">Address:</span> {property.address}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="text-gray-500">Contact:</span> {property.contact}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs">
                  {property.website && (
                    <a className="text-indigo-700 underline" href={property.website} target="_blank" rel="noreferrer">Website</a>
                  )}
                  {property.email && (
                    <a className="text-indigo-700 underline" href={`mailto:${property.email}`}>{property.email}</a>
                  )}
                  {property.timezone && <span className="text-gray-500">TZ: {property.timezone}</span>}
                </div>
              </div>
            </div>
          </section>
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Rooms & Rates</p>
            <ul className="space-y-1 text-sm">
              {property.rooms.map((r) => (
                <li key={r.name} className="flex justify-between">
                  <span>{r.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{r.price}</span>
                </li>
              ))}
            </ul>
          </section>
          {property.restaurants && property.restaurants.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Dining & Restaurants</p>
              <ul className="space-y-1 text-sm">
                {property.restaurants.map((r, idx) => (
                  <li key={`${r.type}-${idx}`} className="flex justify-between">
                    <span>{r.type}</span>
                    <span className="text-gray-500 dark:text-gray-400">{r.hours}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {property.amenities && property.amenities.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs">{a}</span>
                ))}
              </div>
            </section>
          )}
          {(property.poolHours || property.parking) && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Facilities</p>
              <div className="space-y-1 text-sm">
                {property.poolHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Pool</span>
                    <span className="text-gray-500 dark:text-gray-400">{property.poolHours}</span>
                  </div>
                )}
                {property.parking && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Parking</span>
                    <span className="text-gray-500 dark:text-gray-400">{property.parking}</span>
                  </div>
                )}
              </div>
            </section>
          )}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Policies</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Check-in {property.policies.checkIn} • Check-out {property.policies.checkOut}</p>
          </section>
        </div>
      )}
    </aside>
  )
}

