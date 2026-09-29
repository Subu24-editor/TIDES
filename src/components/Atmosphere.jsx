import { useRef } from 'react';
import useParticles from '../hooks/useParticles.js';

export default function Atmosphere() {
  const particlesRef = useRef(null);
  useParticles(particlesRef);

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__stars"></div>
      <div className="atmosphere__moon"></div>
      <div className="atmosphere__mist atmosphere__mist--a"></div>
      <div className="atmosphere__mist atmosphere__mist--b"></div>
      <div className="atmosphere__particles" ref={particlesRef}></div>
      <div className="atmosphere__vignette"></div>
    </div>
  );
}
