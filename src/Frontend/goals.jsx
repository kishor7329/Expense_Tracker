import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./style/Goals.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const Goals = () => {
  const auroraRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [goalsList, setGoalsList] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [editingGoal, setEditingGoal] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editSaved, setEditSaved] = useState("");
  const [selectedCardForAnalytics, setSelectedCardForAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
 const [, setError] = useState(null);  
  const [totalSaved, setTotalSaved] = useState(0);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

 const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const fetchGoals = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        // Ensure all numeric values are proper numbers
        const formattedGoals = response.data.goals.map(goal => ({
          ...goal,
          target_amount: parseFloat(goal.target_amount) || 0,
          saved_amount: parseFloat(goal.saved_amount) || 0,
        }));
        setGoalsList(formattedGoals);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError("Failed to load goals. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Update total saved when goals list changes
  useEffect(() => {
    const calculateTotalSaved = () => {
      if (!goalsList || goalsList.length === 0) return 0;
      
      return goalsList.reduce((sum, g) => {
        const savedAmount = g.saved_amount;
        if (savedAmount === null || savedAmount === undefined || savedAmount === '') return sum;
        const parsed = parseFloat(savedAmount);
        return sum + (isNaN(parsed) ? 0 : parsed);
      }, 0);
    };
    
    setTotalSaved(calculateTotalSaved());
  }, [goalsList]);

  // Aurora effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (auroraRef.current) {
        const hue = (Date.now() * 0.05) % 360;
        auroraRef.current.style.setProperty("--hue", hue);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Currency formatting with proper locale
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const goalOptions = [
    "Education", "Travel", "Emergency Fund",
    "Electronics", "Vehicle", "Investment", "Personal",
  ];

  const handleSetGoal = () => {
    setShowModal(true);
  };

  const handleSubmitGoal = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    if (selectedGoal && goalAmount && goalDeadline) {
      try {
        setIsSavingGoal(true);
        const response = await axios.post(
          `${API_URL}/goals`,
          {
            name: selectedGoal,
            target_amount: parseFloat(goalAmount),
            saved_amount: parseFloat(savedAmount) || 0,
            deadline: goalDeadline,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          const newGoal = {
            ...response.data.goal,
            target_amount: parseFloat(response.data.goal.target_amount),
            saved_amount: parseFloat(response.data.goal.saved_amount) || 0,
          };
          setGoalsList(prev => [...prev, newGoal]);
          setShowModal(false);
          resetForm();
        }
      } catch (error) {
        console.error("Error saving goal:", error);
        alert("Failed to save goal. Please try again.");
      } finally {
        setIsSavingGoal(false);
      }
    } else {
      alert("Please fill all required fields");
    }
  };

  const resetForm = () => {
    setSelectedGoal("");
    setGoalAmount("");
    setGoalDeadline("");
    setSavedAmount("");
  };

  const handleCancel = () => {
    setShowModal(false);
    resetForm();
  };

  const handleCompleteGoal = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_URL}/goals/${id}`,
        { status: "completed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setGoalsList(prev =>
        prev.map((goal) =>
          goal.id === id ? { ...goal, status: "completed" } : goal,
        ),
      );
    } catch (error) {
      console.error("Error completing goal:", error);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setEditAmount(goal.target_amount.toString());
    setEditSaved((goal.saved_amount || 0).toString());
  };

  const handleUpdateGoal = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }
    if (editingGoal && editAmount) {
      try {
        setIsUpdatingGoal(true);
        const response = await axios.put(
          `${API_URL}/goals/${editingGoal.id}`,
          {
            target_amount: parseFloat(editAmount),
            saved_amount: parseFloat(editSaved) || 0,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          const updatedGoal = {
            ...response.data.goal,
            target_amount: parseFloat(response.data.goal.target_amount),
            saved_amount: parseFloat(response.data.goal.saved_amount) || 0,
          };
          setGoalsList(prev =>
            prev.map((goal) =>
              goal.id === editingGoal.id ? updatedGoal : goal,
            ),
          );
          setEditingGoal(null);
          setEditAmount("");
          setEditSaved("");
          if (selectedCardForAnalytics?.id === editingGoal.id) {
            setSelectedCardForAnalytics(null);
          }
        }
      } catch (error) {
        console.error("Error updating goal:", error);
        alert("Failed to update goal. Please try again.");
      } finally {
        setIsUpdatingGoal(false);
      }
    } else {
      alert("Please fill all required fields");
    }
  };

  const handleDeleteGoal = async (id) => {
    const token = localStorage.getItem("token");
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await axios.delete(`${API_URL}/goals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGoalsList(prev => prev.filter((goal) => goal.id !== id));
        if (selectedCardForAnalytics?.id === id) {
          setSelectedCardForAnalytics(null);
        }
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  const handleCardClick = (goal) => {
    setSelectedCardForAnalytics(
      selectedCardForAnalytics?.id === goal.id ? null : goal,
    );
  };

  const getActiveGoals = () => goalsList.filter((g) => g.status === "active");
  const getCompletedGoals = () => goalsList.filter((g) => g.status === "completed");

  const getUpcomingDeadlines = () => {
    const today = new Date();
    return getActiveGoals().filter((g) => new Date(g.deadline) > today);
  };

  // Enhanced Total Saved calculation with better error handling
 

  const getProgressPercentage = (goal) => {
    if (!goal || goal.target_amount === 0) return 0;
    return ((goal.saved_amount || 0) / goal.target_amount) * 100;
  };

  const getPieChartData = () => {
    if (!selectedCardForAnalytics) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#4a5568"],
            borderColor: ["#4a5568"],
            borderWidth: 1,
          },
        ],
      };
    }

    const saved = selectedCardForAnalytics.saved_amount || 0;
    const remaining = selectedCardForAnalytics.target_amount - saved;

    return {
      labels: [
        `Saved (₹${saved.toLocaleString()})`,
        `Remaining (₹${remaining.toLocaleString()})`,
      ],
      datasets: [
        {
          data: [saved, remaining],
          backgroundColor: ["#00ff87", "#ff6b6b"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 2,
        },
      ],
    };
  };

  const getBarChartData = () => {
    if (!selectedCardForAnalytics) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [0],
            backgroundColor: ["#4a5568"],
          },
        ],
      };
    }

    const target = selectedCardForAnalytics.target_amount;
    const saved = selectedCardForAnalytics.saved_amount || 0;
    const remaining = target - saved;

    return {
      labels: ["Target Amount", "Saved Amount", "Remaining"],
      datasets: [
        {
          label: "Amount (₹)",
          data: [target, saved, remaining],
          backgroundColor: ["#60efff", "#00ff87", "#ff6b6b"],
          borderColor: ["#ffffff", "#ffffff", "#ffffff"],
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.6,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "white",
          font: { size: 11 },
          boxWidth: 12,
          padding: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            let value = context.raw;
            if (label) {
              return `${label}: ₹${value.toLocaleString()}`;
            }
            return `₹${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "white",
          callback: function (value) {
            return "₹" + value.toLocaleString();
          },
        },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: {
          display: true,
          text: "Amount (₹)",
          color: "white",
          font: { size: 11 },
        },
      },
      x: {
        ticks: { color: "white", rotation: 0 },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "white",
          font: { size: 11 },
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `₹${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

 
 

  

  if (loading) {
    return (
      <div className="goals-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'white', flexDirection: 'column', backgroundColor: '#050505', position: 'relative', overflow: 'hidden' }}>
        <div className="aurora-background" ref={auroraRef}>
          <div className="aurora-layer aurora-layer-1"></div>
          <div className="aurora-layer aurora-layer-2"></div>
          <div className="aurora-layer aurora-layer-3"></div>
          <div className="aurora-layer aurora-layer-4"></div>
          <div className="aurora-overlay"></div>
        </div>
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.1)', borderTopColor: '#00ff87', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h2>Loading your goals...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="goals-container">
      <div className="aurora-background" ref={auroraRef}>
        <div className="aurora-layer aurora-layer-1"></div>
        <div className="aurora-layer aurora-layer-2"></div>
        <div className="aurora-layer aurora-layer-3"></div>
        <div className="aurora-layer aurora-layer-4"></div>
        <div className="aurora-overlay"></div>
      </div>

      <div className="goals-content">
        <div className="headline-section">
          <h1 className="goals-title">🎯 Set Your Financial Goals</h1>
          <p className="goals-subtitle">Dream it, Plan it, Achieve it with SynTropy</p>
          <button className="set-goal-btn" onClick={handleSetGoal}>
            ✨ Set Goals Now
          </button>
        </div>

        <div className="analytics-cards">
          <div className="analytics-card">
            <h3>Active Goals</h3>
            <p className="analytics-number">{getActiveGoals().length}</p>
          </div>
          <div className="analytics-card">
            <h3>Completed Goals</h3>
            <p className="analytics-number">{getCompletedGoals().length}</p>
          </div>
          <div className="analytics-card">
            <h3>Upcoming Deadlines</h3>
            <p className="analytics-number">{getUpcomingDeadlines().length}</p>
          </div>
          <div className="analytics-card">
            <h3>Total Saved</h3>
            <p className="analytics-number">
              {formatCurrency(totalSaved)}
            </p>
          </div>
        </div>

        <div className="goals-tabs">
          <button
            className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active Goals
          </button>
          <button
            className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed Goals
          </button>
        </div>

        <div className="goals-list">
          {(activeTab === "active" ? getActiveGoals() : getCompletedGoals()).map((goal) => (
            <div
              key={goal.id}
              className={`goal-card ${selectedCardForAnalytics?.id === goal.id ? "selected" : ""}`}
            >
              <div className="goal-card-header">
                <h3>{goal.name}</h3>
                <div className="goal-actions">
                  <button
                    className="dashboard-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(goal);
                    }}
                  >
                    📊 Dashboard
                  </button>
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGoal(goal);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGoal(goal.id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                  {goal.status === "active" && (
                    <button
                      className="complete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteGoal(goal.id);
                      }}
                    >
                      ✓ Complete
                    </button>
                  )}
                </div>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(getProgressPercentage(goal), 100)}%`,
                    }}
                  ></div>
                </div>
                <p>
                  ₹{(goal.saved_amount || 0).toLocaleString()} / ₹
                  {goal.target_amount.toLocaleString()} (
                  {getProgressPercentage(goal).toFixed(1)}%)
                </p>
              </div>
              <div className="goal-deadline">
                <span>📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedCardForAnalytics && (
          <div className="analytics-panel">
            <div className="analytics-header">
              <h2>{selectedCardForAnalytics.name} - Analytics</h2>
              <button
                className="close-analytics"
                onClick={() => setSelectedCardForAnalytics(null)}
              >
                ✕
              </button>
            </div>
            <div className="analytics-content">
              <div className="chart-container">
                <Doughnut data={getPieChartData()} options={pieOptions} />
              </div>
              <div className="chart-container">
                <Bar data={getBarChartData()} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Set New Goal</h2>
              <div className="form-group">
                <label>Goal Category</label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {goalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Target Amount (₹)</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="Enter target amount"
                />
              </div>
              <div className="form-group">
                <label>Already Saved (₹)</label>
                <input
                  type="number"
                  value={savedAmount}
                  onChange={(e) => setSavedAmount(e.target.value)}
                  placeholder="Enter amount already saved (optional)"
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleSubmitGoal} disabled={isSavingGoal}>
                  {isSavingGoal ? "Saving..." : "Save Goal"}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingGoal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Goal</h2>
              <div className="form-group">
                <label>Target Amount (₹)</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Enter target amount"
                />
              </div>
              <div className="form-group">
                <label>Saved Amount (₹)</label>
                <input
                  type="number"
                  value={editSaved}
                  onChange={(e) => setEditSaved(e.target.value)}
                  placeholder="Enter saved amount"
                />
              </div>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingGoal(null);
                    setEditAmount("");
                    setEditSaved("");
                  }}
                >
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleUpdateGoal} disabled={isUpdatingGoal}>
                  {isUpdatingGoal ? "Updating..." : "Update Goal"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
