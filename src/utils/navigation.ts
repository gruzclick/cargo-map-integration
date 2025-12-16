export const openYandexNavigator = (address: string) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `yandexnavi://build_route_on_map?lat_to=&lon_to=&address=${encodedAddress}`;
  
  window.location.href = url;
  
  setTimeout(() => {
    const fallbackUrl = `https://yandex.ru/maps/?rtext=~&rtt=auto&text=${encodedAddress}`;
    window.open(fallbackUrl, '_blank');
  }, 1500);
};

export const openYandexMaps = (address: string) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://yandex.ru/maps/?rtext=~&rtt=auto&text=${encodedAddress}`;
  window.open(url, '_blank');
};
