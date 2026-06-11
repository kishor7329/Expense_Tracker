import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./style/Notes.css";

const Notes = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskContent, setTaskContent] = useState("");
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);
   const [, setError] = useState(null);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const API_URL = "http://localhost:5000/api";

  // Helper function to normalize date format to YYYY-MM-DD
  const normalizeDate = (dateInput) => {
    if (!dateInput) return null;
    
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const fetchNotes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        console.log('Fetched tasks from backend:', response.data.tasks);
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    fetchTasks();
  }, [fetchNotes, fetchTasks]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate({
      date: dateKey,
      day,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    });
    setTaskTitle("");
    setTaskContent("");
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }
    if (taskTitle && selectedDate) {
      try {
        setIsSavingTask(true);
        const formattedDate = selectedDate.date;
        console.log('Saving task with date:', formattedDate);

        const response = await axios.post(
          `${API_URL}/calendar`,
          {
            task_date: formattedDate,
            title: taskTitle,
            content: taskContent,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          console.log('Task saved successfully:', response.data.task);

          // Normalize the returned task date to ensure consistency
          const normalizedTask = {
            ...response.data.task,
            task_date: normalizeDate(response.data.task.task_date) || response.data.task.task_date
          };

          setTasks(prev => [...prev, normalizedTask]);
          setShowTaskModal(false);
          setTaskTitle("");
          setTaskContent("");
        }
      } catch (error) {
        console.error("Error saving task:", error);
        alert("Failed to save task. Please try again.");
      } finally {
        setIsSavingTask(false);
      }
    } else {
      alert("Please fill task title");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/calendar/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(prev => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSaveNote = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }
    if (noteTitle) {
      try {
        setIsSavingNote(true);
        if (editingNote) {
          const response = await axios.put(
            `${API_URL}/notes/${editingNote.id}`,
            {
              title: noteTitle,
              content: noteContent,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (response.data.success) {
            setNotes(prev =>
              prev.map((note) =>
                note.id === editingNote.id ? response.data.note : note,
              ),
            );
          }
        } else {
          const response = await axios.post(
            `${API_URL}/notes`,
            {
              title: noteTitle,
              content: noteContent,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (response.data.success) {
            setNotes(prev => [response.data.note, ...prev]);
          }
        }
        setNoteTitle("");
        setNoteContent("");
        setShowNoteModal(false);
        setEditingNote(null);
      } catch (error) {
        console.error("Error saving note:", error);
        alert("Failed to save note. Please try again.");
      } finally {
        setIsSavingNote(false);
      }
    } else {
      alert("Please fill note title");
    }
  };

  const handleDeleteNote = async (id) => {
    const token = localStorage.getItem("token");
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await axios.delete(`${API_URL}/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(prev => prev.filter((note) => note.id !== id));
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowNoteModal(true);
  };

  // FIXED: Enhanced date comparison for tasks with normalization
  const getTasksForDate = (dateKey) => {
    console.log('Getting tasks for date:', dateKey);
    console.log('Available tasks count:', tasks.length);
    
    return tasks.filter((task) => {
      const taskDate = task.task_date;
      const normalizedTaskDate = normalizeDate(taskDate);
      
      console.log('Comparing dates:', { 
        taskDate, 
        normalizedTaskDate, 
        dateKey, 
        match: normalizedTaskDate === dateKey 
      });
      
      return normalizedTaskDate === dateKey;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasTasks = getTasksForDate(dateKey).length > 0;
      
      console.log(`Day ${day} (${dateKey}): hasTasks = ${hasTasks}`);
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${hasTasks ? "has-tasks" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {hasTasks && <span className="task-indicator">●</span>}
        </div>,
      );
    }

    return days;
  };

 

 

// Replace your existing loading return with:
  if (loading) {
    return (
      <div className="notes-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'white', flexDirection: 'column', backgroundColor: '#0a0a0a' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.1)', borderTopColor: '#60efff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2>Loading your workspace...</h2>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1 className="notes-title">📝 Financial Workspace</h1>
        <p className="notes-subtitle">Manage your tasks, debts, and financial notes</p>
      </div>

      <div className="notes-grid">
        <div className="calendar-section">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="month-nav">◀</button>
            <h2>{currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}</h2>
            <button onClick={handleNextMonth} className="month-nav">▶</button>
          </div>
          <div className="calendar-weekdays">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="calendar-grid">{renderCalendar()}</div>
        </div>

        <div className="notes-section">
          <div className="notes-section-header">
            <h2>📔 Financial Notes</h2>
            <button
              className="add-note-btn"
              onClick={() => {
                setEditingNote(null);
                setNoteTitle("");
                setNoteContent("");
                setShowNoteModal(true);
              }}
            >
              + New Note
            </button>
          </div>
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="empty-notes">
                <p>No notes yet. Create your first financial note!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-card-header">
                    <h3>{note.title}</h3>
                    <div className="note-actions">
                      <button className="edit-note-btn" onClick={() => handleEditNote(note)}>✏️</button>
                      <button className="delete-note-btn" onClick={() => handleDeleteNote(note.id)}>🗑️</button>
                    </div>
                  </div>
                  <p className="note-content">{note.content}</p>
                  <small className="note-date">
                    {new Date(note.created_at || note.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showTaskModal && selectedDate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-cancel" onClick={() => setShowTaskModal(false)}>✕</button>
            <h2>Tasks for {selectedDate.month}/{selectedDate.day}/{selectedDate.year}</h2>

            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                placeholder="Enter task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Task Description</label>
              <textarea
                placeholder="Enter task details, debt reminder, or transaction note"
                rows="4"
                value={taskContent}
                onChange={(e) => setTaskContent(e.target.value)}
              ></textarea>
            </div>

            <button className="submit-btn" onClick={handleSaveTask} disabled={isSavingTask}>
              {isSavingTask ? "Saving..." : "Save Task"}
            </button>

            {getTasksForDate(selectedDate.date).length > 0 && (
              <div className="existing-tasks">
                <h3>Saved Tasks</h3>
                {getTasksForDate(selectedDate.date).map((task) => (
                  <div key={task.id} className="task-item">
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.content}</p>
                    </div>
                    <button className="delete-task-btn" onClick={() => handleDeleteTask(task.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-cancel" onClick={() => setShowNoteModal(false)}>✕</button>
            <h2>{editingNote ? "Edit Note" : "Create New Note"}</h2>

            <div className="form-group">
              <label>Note Title</label>
              <input
                type="text"
                placeholder="e.g., Debt Reminder, Transaction Record, Savings Goal"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Note Content</label>
              <textarea
                placeholder="Write your financial note here..."
                rows="6"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              ></textarea>
            </div>

            <button className="submit-btn" onClick={handleSaveNote} disabled={isSavingNote}>
              {isSavingNote ? "Saving..." : (editingNote ? "Update Note" : "Create Note")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
