// src/components/icons/paypal.tsx
import React from "react";
import paypalIcon from "../../assets/PayPal.svg.png";

export const PayPalIcon: React.FC<{ className?: string }> = () => (
<img src={paypalIcon} alt="Icon PayPal" className="w-20" />
);
