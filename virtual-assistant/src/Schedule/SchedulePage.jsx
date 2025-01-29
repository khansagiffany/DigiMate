import React from 'react';

const SchedulePage = () => {
  const daysInMonth = 31; 
  const startDayOffset = 3; 

  return (
    <div className="task-page">
      <header>
        <span className="title">DigiMate: Your Internship Companion</span>
      </header>

      <div className="card">
        <h2>January 2025</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div
              key={`header-${index}`}
              style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '12px',
                padding: '5px',
              }}
            >
              {day}
            </div>
          ))}
          {Array(startDayOffset).fill(null).map((_, index) => (
            <div key={`offset-${index}`} />
          ))}
          {Array(daysInMonth)
            .fill(null)
            .map((_, index) => (
              <div
                key={`day-${index}`}
                style={{
                  textAlign: 'center',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  ...(index + 1 === 29
                    ? {
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                      }
                    : {}),
                }}
              >
                {index + 1}
              </div>
            ))}
        </div>

        <h2>Upcoming Event</h2>
        <div className="events">
          <div className="event-item">
            <span>Interview</span>
            <span className="date">30 Jan</span>
          </div>
          <div className="event-item">
            <span>Pengumuman akhir</span>
            <span className="date">03 Feb</span>
          </div>
          <div className="event-item">
            <span>Onboarding</span>
            <span className="date">10 Feb</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
