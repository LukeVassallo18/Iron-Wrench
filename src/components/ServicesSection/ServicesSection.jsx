import BuildIcon from "@mui/icons-material/Build";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import SpeedIcon from "@mui/icons-material/Speed";
import TireRepairIcon from "@mui/icons-material/TireRepair";
import Card from "../Card/Card";
import "./ServicesSection.css";

const cardTitles = ["Tyre & Wheel Fitting", "Brake Service", "Engine Diagnostics", "Oil Change", "Chain & Sprocket Replacement", "Electrical System Repair"];
const cardDescriptions = [
  "Professional tyre fitting and wheel balancing for optimal performance.",
  "Comprehensive brake inspection, repair, and replacement services.",
  "Advanced diagnostics to identify and resolve engine issues.",
  "High-quality oil changes to keep your engine running smoothly.",
  "Expert chain and sprocket replacement for improved performance.",
  "Skilled electrical system repair to keep your bike running reliably."
];
const cardPrices = [50, 75, 100, 40, 120, 80];

const cardIcons = [
  TireRepairIcon,
  BuildIcon,
  SpeedIcon,
  OilBarrelIcon,
  PrecisionManufacturingIcon,
  ElectricBoltIcon,
];

function ServicesSection() {
  return (
    <section className="services-section">
      <h1 className="services-title">What We Do</h1>
      <div className="card-container">
        {cardTitles.map((title, index) => (
          <Card 
            key={title} 
            title={title} 
            description={cardDescriptions[index]} 
            price={cardPrices[index]} 
            Icon={cardIcons[index]}
          />
        ))}
      </div>
    </section>
  );
}

export default ServicesSection; 
