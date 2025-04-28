import React, { useState, useEffect } from 'react';
import './App.css';

// Define a Rating type for our app
type Rating = -1 | 0 | 1;

// Define an Action interface to store a single rated action
interface Action {
  id: string;
  timestamp: string; // ISO timestamp
  description: string;
  rating: Rating;
}

// Define a DayActions interface to group actions by date
interface DayActions {
  date: string;
  actions: Action[];
}

// Predefined list of actions to choose from
const PREDEFINED_ACTIONS = [
  "Exercise",
  "Healthy meal",
  "Work task completed",
  "Meditation/Mindfulness",
  "Learning/Reading",
  "Social interaction",
  "Sleep schedule",
  "Household chores",
  "Creative activity",
  "Self-care",
];

function App() {
  // State to store all days with actions
  const [allDays, setAllDays] = useState<DayActions[]>([]);
  // State for selected action
  const [selectedAction, setSelectedAction] = useState<string>(PREDEFINED_ACTIONS[0]);
  
  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get today's date formatted
  const today = formatDate(new Date());

  // Get today's actions
  const todayActions = allDays.find(day => day.date === today)?.actions || [];

  // Generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Load actions from local storage on initial render
  useEffect(() => {
    const savedActions = localStorage.getItem('selfRatingActions');
    if (savedActions) {
      setAllDays(JSON.parse(savedActions));
    }
  }, []);

  // Save actions to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('selfRatingActions', JSON.stringify(allDays));
  }, [allDays]);

  // Function to handle action submission
  const submitAction = (value: Rating) => {
    // Create a new action with the selected predefined action
    const newAction: Action = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      description: selectedAction,
      rating: value
    };
    
    // Check if we have actions for today already
    const dayIndex = allDays.findIndex(day => day.date === today);
    
    if (dayIndex >= 0) {
      // Update existing day
      const updatedDays = [...allDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        actions: [...updatedDays[dayIndex].actions, newAction]
      };
      setAllDays(updatedDays);
    } else {
      // Add new day
      setAllDays([...allDays, {
        date: today,
        actions: [newAction]
      }]);
    }
  };

  // Function to delete an action
  const deleteAction = (actionId: string) => {
    const dayIndex = allDays.findIndex(day => 
      day.actions.some(action => action.id === actionId)
    );
    
    if (dayIndex >= 0) {
      const updatedDays = [...allDays];
      const updatedActions = updatedDays[dayIndex].actions.filter(
        action => action.id !== actionId
      );
      
      if (updatedActions.length === 0) {
        // Remove the day if no actions left
        updatedDays.splice(dayIndex, 1);
      } else {
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          actions: updatedActions
        };
      }
      
      setAllDays(updatedDays);
    }
  };

  // Function to get a descriptive label for a rating
  const getRatingLabel = (rating: Rating): string => {
    switch(rating) {
      case -1: return 'Negative';
      case 0: return 'Neutral';
      case 1: return 'Positive';
      default: return '';
    }
  };

  // Function to get emoji for a rating
  const getRatingEmoji = (rating: Rating): string => {
    switch(rating) {
      case -1: return '😞';
      case 0: return '😐';
      case 1: return '😊';
      default: return '';
    }
  };

  // Calculate daily summary for previous days
  const getDailySummary = (actions: Action[]): {
    positive: number;
    neutral: number;
    negative: number;
    overall: string;
  } => {
    const summary = {
      positive: 0,
      neutral: 0,
      negative: 0,
      overall: ''
    };
    
    actions.forEach(action => {
      if (action.rating === 1) summary.positive++;
      else if (action.rating === 0) summary.neutral++;
      else summary.negative++;
    });
    
    const total = summary.positive - summary.negative;
    if (total > 0) summary.overall = 'Positive';
    else if (total < 0) summary.overall = 'Negative';
    else summary.overall = 'Neutral';
    
    return summary;
  };

  // Format time to be more readable
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get previous days, sorted by date (most recent first)
  const previousDays = [...allDays]
    .filter(day => day.date !== today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="App">
      <header className="App-header">
        <h1>Self Rating App</h1>
      </header>
      
      <main className="App-content">
        <section className="rating-section">
          <h2>Rate Your Actions: {today}</h2>
          
          <div className="action-input">
            <label htmlFor="action-selection">Choose an action to rate:</label>
            <select
              id="action-selection"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="action-select"
            >
              {PREDEFINED_ACTIONS.map((action, index) => (
                <option key={index} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          
          <div className="rating-buttons">
            <button 
              className="rating-button rating-negative"
              onClick={() => submitAction(-1)}
            >
              😞 Negative (-1)
            </button>
            
            <button 
              className="rating-button rating-neutral"
              onClick={() => submitAction(0)}
            >
              😐 Neutral (0)
            </button>
            
            <button 
              className="rating-button rating-positive"
              onClick={() => submitAction(1)}
            >
              😊 Positive (1)
            </button>
          </div>
          
          {todayActions.length > 0 && (
            <div className="today-actions">
              <h3>Today's Actions</h3>
              <ul className="actions-list">
                {todayActions.map((action) => (
                  <li key={action.id} className={`action-item rating-${action.rating}`}>
                    <div className="action-content">
                      <div className="action-header">
                        <span className="action-time">{formatTime(action.timestamp)}</span>
                        <span className="action-rating">
                          {getRatingEmoji(action.rating)} {getRatingLabel(action.rating)}
                        </span>
                      </div>
                      <p className="action-description">{action.description}</p>
                    </div>
                    <button 
                      className="delete-action" 
                      onClick={() => deleteAction(action.id)}
                      title="Delete this action"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="today-summary">
                <h4>Today's Summary</h4>
                <div className="summary-counts">
                  <span className="positive-count">
                    😊 {todayActions.filter(a => a.rating === 1).length} Positive
                  </span>
                  <span className="neutral-count">
                    😐 {todayActions.filter(a => a.rating === 0).length} Neutral
                  </span>
                  <span className="negative-count">
                    😞 {todayActions.filter(a => a.rating === -1).length} Negative
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
        
        <section className="history-section">
          <h2>Previous Days</h2>
          {previousDays.length === 0 ? (
            <p>No previous actions yet.</p>
          ) : (
            <ul className="days-list">
              {previousDays.map((day) => {
                const summary = getDailySummary(day.actions);
                return (
                  <li key={day.date} className={`day-item summary-${summary.overall.toLowerCase()}`}>
                    <div className="day-header">
                      <span className="day-date">{day.date}</span>
                      <span className="day-summary">{summary.overall} Day</span>
                    </div>
                    
                    <div className="day-counts">
                      <span className="positive-count">
                        😊 {summary.positive} Positive
                      </span>
                      <span className="neutral-count">
                        😐 {summary.neutral} Neutral
                      </span>
                      <span className="negative-count">
                        😞 {summary.negative} Negative
                      </span>
                    </div>
                    
                    <details className="day-details">
                      <summary>View all actions</summary>
                      <ul className="actions-list">
                        {day.actions.sort((a, b) => 
                          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                        ).map((action) => (
                          <li key={action.id} className={`action-item rating-${action.rating}`}>
                            <div className="action-content">
                              <div className="action-header">
                                <span className="action-time">{formatTime(action.timestamp)}</span>
                                <span className="action-rating">
                                  {getRatingEmoji(action.rating)} {getRatingLabel(action.rating)}
                                </span>
                              </div>
                              <p className="action-description">{action.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
