import React, { useState, useEffect } from 'react';
import './App.css';

// Define a Rating type for our app
type Rating = -1 | 0 | 1;

// Define an Action interface to store a single rated action
interface Action {
  id: string;
  timestamp: string; // ISO timestamp
  rating: Rating;
}

// Define a DayActions interface to group actions by date
interface DayActions {
  date: string;
  actions: Action[];
}

function App() {
  // State to store all days with actions
  const [allDays, setAllDays] = useState<DayActions[]>([]);
  // State for showing undo popup
  const [showUndoPopup, setShowUndoPopup] = useState<boolean>(false);
  // State to store the latest action id for undo functionality
  const [latestActionId, setLatestActionId] = useState<string | null>(null);
  
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
    const newActionId = generateId();
    
    // Create a new action with just the rating
    const newAction: Action = {
      id: newActionId,
      timestamp: new Date().toISOString(),
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
    
    // Set latest action id for undo functionality
    setLatestActionId(newActionId);
    
    // Show undo popup
    setShowUndoPopup(true);
    
    // Hide popup after 5 seconds
    setTimeout(() => {
      setShowUndoPopup(false);
    }, 5000);
  };

  // Function to undo the latest action
  const undoLatestAction = () => {
    if (!latestActionId) return;
    
    deleteAction(latestActionId);
    setShowUndoPopup(false);
    setLatestActionId(null);
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

  // Format time to be more readable
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate summary as a string of all ratings
  const getRatingSummaryString = (actions: Action[]): string => {
    if (actions.length === 0) return '';
    
    // Map each action to its rating symbol
    const ratingsString = actions.map(action => {
      switch(action.rating) {
        case -1: return '-1';
        case 0: return '0';
        case 1: return '1';
        default: return '';
      }
    }).join(', ');
    
    // Calculate sum
    const sum = actions.reduce((total, action) => total + action.rating, 0);
    
    return `${ratingsString} = ${sum}`;
  };

  return (
    <div className="App">
      <main className="App-content">
        <section className="rating-section">
          <div className="rating-buttons">
            <button 
              className="rating-button rating-negative"
              onClick={() => submitAction(-1)}
            >
              -1
            </button>
            
            <button 
              className="rating-button rating-neutral"
              onClick={() => submitAction(0)}
            >
              0
            </button>
            
            <button 
              className="rating-button rating-positive"
              onClick={() => submitAction(1)}
            >
              1
            </button>
          </div>
          
          {/* Undo Popup */}
          {showUndoPopup && (
            <div className="undo-popup">
              <p>Rating saved! </p>
              <button onClick={undoLatestAction}>Undo</button>
            </div>
          )}
          
          {todayActions.length > 0 && (
            <div className="today-actions">
              <h3>Today</h3>
              <ul className="actions-list">
                {todayActions.map((action) => (
                  <li key={action.id} className={`action-item rating-${action.rating}`}>
                    <div className="action-content">
                      <div className="action-header">
                        <span className="action-time">{formatTime(action.timestamp)}</span>
                        <span className="action-rating">
                          {action.rating}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="delete-action" 
                      onClick={() => deleteAction(action.id)}
                      title="Delete this rating"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="today-summary">
                <h4>Summary</h4>
                <div className="summary-text">
                  {getRatingSummaryString(todayActions)}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
