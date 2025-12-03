export const CountryFlag = ({ countryCode }: { countryCode?: string }) => {
  if (!countryCode) return <span>🌐</span>;
  return (
    <img src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`} alt={countryCode} className="inline-block mr-2" title={countryCode} />
  );
};
