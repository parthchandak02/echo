export function Legend() {
  return (
    <div className="chrome legend" aria-label="Frequency color legend">
      <span className="legend__item">
        <span className="legend__dot legend__dot--bass" />
        bass
      </span>
      <span className="legend__item">
        <span className="legend__dot legend__dot--mid" />
        mid
      </span>
      <span className="legend__item">
        <span className="legend__dot legend__dot--high" />
        high
      </span>
    </div>
  )
}
