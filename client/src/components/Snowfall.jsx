import { useEffect, useState } from "react";

const Snowfall = ({ count = 50 }) => {
  const [flakes, setFlakes] = useState([]);

  useEffect(() => {
    const newFlakes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percent
      duration: 5 + Math.random() * 5, // seconds
      delay: Math.random() * 5,
      size: 10 + Math.random() * 10, // px
    }));
    setFlakes(newFlakes);
  }, [count]);

  return (
    <>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            fontSize: `${flake.size}px`,
          }}
        >
          ❄
        </div>
      ))}
    </>
  );
};

export default Snowfall;
