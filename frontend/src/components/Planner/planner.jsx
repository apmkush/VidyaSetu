import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
// import {ReactTooltip} from 'react-tooltip';
const ReactTooltip = await import('react-tooltip').then(module => module.Tooltip);

import 'react-calendar-heatmap/dist/styles.css';
import '../../App.css'; // Minimal custom styles if needed

const ActivityCalendar = () => {
    // Sample data for activity history
    const activityData = [
      { date: '2023-10-01', count: 3 },
      { date: '2023-10-02', count: 5 },
      { date: '2023-10-03', count: 2 },
      // Add more dates with counts
    ];
  
    const getTooltipDataAttrs = (value) => {
      // Check if value exists, otherwise return an empty object
      if (!value || !value.date) return { 'data-tip': 'No activity' };
      // Format tooltip content
      return {
        'data-tip': `${value.date}: ${value.count} submissions`
      };
    };
  
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-center mb-4">Activity Calendar</h2>
        <CalendarHeatmap
          startDate={new Date('2023-01-01')}
          endDate={new Date('2023-12-31')}
          values={activityData}
          classForValue={(value) => {
            if (!value) return 'bg-gray-200';
            if (value.count >= 4) return 'bg-green-700';
            if (value.count >= 3) return 'bg-green-500';
            if (value.count >= 2) return 'bg-green-300';
            if (value.count >= 1) return 'bg-green-100';
            return 'bg-gray-200';
          }}
          showWeekdayLabels
          gutterSize={2}
          tooltipDataAttrs={getTooltipDataAttrs} // Add tooltip data attributes
        />
        <ReactTooltip />
      </div>
    );
  };
  
  export default ActivityCalendar;
