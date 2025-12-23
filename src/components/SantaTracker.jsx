import { useState, useEffect } from 'react';
import './SantaTracker.css';

function SantaTracker() {
  const [santaData, setSantaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [currentDestination, setCurrentDestination] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isLiveTracking, setIsLiveTracking] = useState(false);

  useEffect(() => {
    checkSantaStatus();
    const pollInterval = isLiveTracking ? 10000 : 30000;
    const interval = setInterval(checkSantaStatus, pollInterval);
    return () => clearInterval(interval);
  }, [isLiveTracking]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const christmas = new Date(now.getFullYear(), 11, 25, 0, 0, 0);

      if (now > christmas) {
        christmas.setFullYear(christmas.getFullYear() + 1);
      }

      const diff = christmas - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkSantaStatus = async () => {
    try {
      const now = new Date();
      const isChristmasEve = now.getMonth() === 11 && now.getDate() === 24;
      const isChristmas = now.getMonth() === 11 && now.getDate() === 25;

      if (isChristmasEve || isChristmas) {
        setIsLiveTracking(true);
        try {
          const response = await fetch('https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media');
          const data = await response.json();
          setSantaData(data);
        } catch (error) {
          console.error('Error fetching Santa data:', error);
          setSantaData(createMockSantaData());
          setIsLiveTracking(false);
        }
      } else {
        setIsLiveTracking(false);
        setSantaData(createMockSantaData());
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setSantaData(createMockSantaData());
      setIsLiveTracking(false);
      setLoading(false);
    }
  };

  const createMockSantaData = () => {
    const destinations = [
      { city: 'North Pole', region: 'Arctic', arrival: Date.now(), departure: null, presentsDelivered: 0, lat: 90, lng: 0 },
    ];

    return {
      destinations: destinations,
      status: 'At the North Pole preparing toys and getting ready for Christmas 2025!',
      presentsDelivered: 0
    };
  };

  useEffect(() => {
    if (santaData?.destinations && santaData.destinations.length > 1) {
      const interval = setInterval(() => {
        setCurrentDestination((prev) =>
          (prev + 1) % santaData.destinations.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [santaData]);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 8000);
    return () => clearInterval(factInterval);
  }, []);

  const funFacts = [
    "Santa travels at approximately 650 miles per second to visit all the children in one night!",
    "Rudolph's red nose helps guide Santa through fog and storms.",
    "Santa's sleigh is powered by Christmas magic and reindeer enthusiasm!",
    "Santa checks his list twice to make sure every child gets exactly what they deserve.",
    "The elves at the North Pole work year-round preparing toys for Christmas.",
    "Santa's workshop uses 100% renewable energy powered by Northern Lights!",
    "Each reindeer can pull up to 1,000 pounds of presents through the sky.",
    "Santa's favorite cookies are chocolate chip, but he loves all kinds!",
    "The North Pole timezone is used to coordinate Santa's global journey.",
    "Santa's beard has magical properties that keep him warm in any weather."
  ];

  const calculateSpeed = () => {
    if (!santaData?.destinations || santaData.destinations.length < 2) return 0;
    return Math.floor(Math.random() * 200) + 450;
  };

  const calculateNextStop = () => {
    if (!santaData?.destinations || !isLiveTracking) return null;
    const nextIndex = currentDestination + 1;
    if (nextIndex < santaData.destinations.length) {
      return santaData.destinations[nextIndex];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="tracker-container">
        <div className="loading-box">
          <div className="santa-sleigh">🎅🦌🦌🦌</div>
          <p className="loading-text">LOADING SANTA DATA...</p>
        </div>
      </div>
    );
  }

  const currentLoc = santaData?.destinations?.[currentDestination];

  return (
    <div className="tracker-container">
      <div className="countdown-box">
        <h2 className="countdown-title">🎄 CHRISTMAS COUNTDOWN 🎄</h2>
        {countdown && (
          <div className="countdown-display">
            <div className="countdown-item">
              <div className="countdown-number">{countdown.days}</div>
              <div className="countdown-label">DAYS</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-number">{countdown.hours}</div>
              <div className="countdown-label">HRS</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-number">{countdown.minutes}</div>
              <div className="countdown-label">MIN</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-number">{countdown.seconds}</div>
              <div className="countdown-label">SEC</div>
            </div>
          </div>
        )}
      </div>

      <div className="santa-status-box">
        <div className="status-header">
          <div className="santa-icon">🎅</div>
          <h2 className="status-title">SANTA STATUS</h2>
        </div>
        <div className="status-content">
          <p className="status-message">{santaData?.status || 'Getting ready for Christmas!'}</p>
          {currentLoc && (
            <div className="current-location">
              <div className="location-marker">📍</div>
              <div className="location-details">
                <h3 className="location-name">{currentLoc.city}</h3>
                <p className="location-region">{currentLoc.region}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon">🎁</div>
          <div className="stat-value">
            {santaData?.presentsDelivered?.toLocaleString() || 0}
          </div>
          <div className="stat-label">Presents Delivered</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">🎄</div>
          <div className="stat-value">
            {countdown ? countdown.days : '---'}
          </div>
          <div className="stat-label">Days Until Christmas</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">🦌</div>
          <div className="stat-value">9</div>
          <div className="stat-label">Reindeer Ready</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">100%</div>
          <div className="stat-label">Magic Level</div>
        </div>
      </div>

      {isLiveTracking && (
        <div className="live-stats-grid">
          <div className="stat-box live-stat">
            <div className="stat-icon">🚀</div>
            <div className="stat-value">{calculateSpeed()}</div>
            <div className="stat-label">Miles Per Second</div>
          </div>
          <div className="stat-box live-stat">
            <div className="stat-icon">🌍</div>
            <div className="stat-value">
              {santaData?.destinations?.length || 0}
            </div>
            <div className="stat-label">Cities Visited</div>
          </div>
          <div className="stat-box live-stat">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">LIVE</div>
            <div className="stat-label">Tracking Active</div>
          </div>
          {calculateNextStop() && (
            <div className="stat-box live-stat">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{calculateNextStop().city}</div>
              <div className="stat-label">Next Stop</div>
            </div>
          )}
        </div>
      )}

      {santaData?.destinations && santaData.destinations.length > 1 && (
        <div className="destinations-box">
          <h2 className="destinations-title">🗺️ SANTA'S ROUTE</h2>
          <div className="destinations-list">
            {santaData.destinations.map((dest, index) => (
              <div
                key={index}
                className={`destination-item ${index === currentDestination ? 'active' : ''} ${index < currentDestination ? 'visited' : ''}`}
              >
                <div className="destination-number">{index + 1}</div>
                <div className="destination-info">
                  <div className="destination-name">{dest.city}</div>
                  <div className="destination-region">{dest.region}</div>
                </div>
                {index === currentDestination && (
                  <div className="current-indicator">🎅</div>
                )}
                {index < currentDestination && (
                  <div className="visited-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fun-facts-box">
        <h2 className="fun-facts-title">🎉 DID YOU KNOW?</h2>
        <div className="fun-fact active-fact">
          {funFacts[currentFactIndex]}
        </div>
        <div className="fact-indicator">
          {funFacts.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentFactIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SantaTracker;
