import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Rocket, TrendingUp, DollarSign, BarChart2, Zap } from "lucide-react";

interface HowItWorksPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const HowItWorksPopup: React.FC<HowItWorksPopupProps> = ({
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"></div>
  );
};

export default HowItWorksPopup;
