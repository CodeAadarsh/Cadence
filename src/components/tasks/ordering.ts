/** Fractional positioning between two neighbours for cheap single-row reorders. */
export function positionBetween(prev?: number, next?: number): number {
  if (prev != null && next != null) return (prev + next) / 2;
  if (prev != null) return prev + 1000;
  if (next != null) return next - 1000;
  return 1000;
}
