import { useState } from 'react';
import { ShieldCheck, Droplets, Zap, Scissors, Paintbrush, Hammer, Wrench, Bug } from 'lucide-react';

const CategoryCard = ({ title, count, type }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Icon mapping with specific colors
  const iconMap = {
    cleaning: <ShieldCheck size={24} color="#60a5fa" />,
    plumbing: <Droplets size={24} color="#60a5fa" />,
    electrical: <Zap size={24} color="#60a5fa" />,
    salon: <Scissors size={24} color="#60a5fa" />,
    painting: <Paintbrush size={24} color="#60a5fa" />,
    carpentry: <Hammer size={24} color="#60a5fa" />,
    appliance: <Wrench size={24} color="#60a5fa" />,
    pest: <Bug size={24} color="#60a5fa" />,
  };

  const styles = {
    card: {
      backgroundColor: '#0f172a', // slate-900
      border: `1px solid ${isHovered ? '#1d4ed8' : '#1e293b'}`, // hover: blue-700
      padding: '24px',
      borderRadius: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
    },
    iconContainer: {
      backgroundColor: '#1e293b', // slate-800
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      marginBottom: '4px',
    },
    title: {
      color: 'white',
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0,
      fontFamily: 'sans-serif',
    },
    count: {
      color: '#64748b', // slate-500
      fontSize: '0.9rem',
      margin: 0,
      fontFamily: 'sans-serif',
    }
  };

  return (
    <div 
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.iconContainer}>
        {iconMap[type] || <Zap size={24} color="#60a5fa" />}
      </div>
      <div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.count}>{count} services</p>
      </div>
    </div>
  );
};

export default CategoryCard;