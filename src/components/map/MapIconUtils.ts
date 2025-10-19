export const getCargoIcon = (cargoType?: string) => {
  if (cargoType === 'pallet') {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M8 4 L8 20 L16 20 L16 4 Z M8 4 L10 2 L14 2 L16 4 M8 20 L10 22 L14 22 L16 20" stroke-linejoin="round"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="16" x2="16" y2="16"/></svg>';
  } else if (cargoType === 'oversized') {
    return '<text x="12" y="16" font-size="18" font-weight="bold" fill="white" text-anchor="middle" font-family="monospace">Н</text>';
  }
  return '<svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><rect x="7" y="7" width="10" height="10" rx="1"/></svg>';
};

export const getVehicleIcon = (vehicleCategory?: string, vehicleStatus?: string) => {
  let color = '#22c55e';
  if (vehicleStatus === 'has_space') color = '#eab308';
  if (vehicleStatus === 'full') color = '#ef4444';
  
  if (vehicleCategory === 'truck') {
    return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="1" y="6" width="15" height="12" rx="1"/><path d="M16 8h3l3 3v5h-3"/><circle cx="5.5" cy="18.5" r="2.5" fill="${color}"/><circle cx="18.5" cy="18.5" r="2.5" fill="${color}"/></svg>`;
  } else if (vehicleCategory === 'semi') {
    return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="1" y="6" width="10" height="10" rx="1"/><path d="M11 8h4l4 4v4h-2"/><rect x="15" y="14" width="8" height="4" rx="1"/><circle cx="5" cy="18" r="2" fill="${color}"/><circle cx="15" cy="18" r="2" fill="${color}"/><circle cx="20" cy="18" r="2" fill="${color}"/></svg>`;
  }
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V14a2 2 0 0 0 2 2h2"/><circle cx="6.5" cy="16.5" r="2.5" fill="${color}"/><circle cx="16.5" cy="16.5" r="2.5" fill="${color}"/></svg>`;
};
