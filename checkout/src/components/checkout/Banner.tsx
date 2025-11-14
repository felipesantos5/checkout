// src/components/checkout/Banner.tsx
interface BannerProps {
  imageUrl?: string;
}

export const Banner: React.FC<BannerProps> = ({ imageUrl }) => {
  if (!imageUrl) {
    return null; // Não renderiza nada se não houver banner
  }
  return <img src={imageUrl} alt="Banner da oferta" className="w-full rounded-t-xl" />;
};
