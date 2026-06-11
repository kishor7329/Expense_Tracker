import React, { useState } from "react";
import "./style/Footer.css";

const Footer = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const accordionItems = [
    {
      question: "How does the AI Advisor help me manage my finances?",
      answer: "Our AI Advisor analyzes your spending patterns, notes, and financial goals to provide personalized suggestions, budgeting tips, and actionable insights that help you make smarter financial decisions."
    },
    {
      question: "Is my financial data secure and private?",
      answer: "Absolutely. Your data is stored securely and is only used to provide you with personalized insights. We prioritize privacy and ensure that your information remains under your control."
    },
    {
      question: "Can I track both expenses and savings goals?",
      answer: "Yes. You can monitor daily expenses, categorize transactions, and set financial goals to track your progress and stay motivated toward achieving your targets."
    },
    {
      question: "Why should I use financial notes?",
      answer: "Financial notes help you capture ideas, record important expenses, plan purchases, and document goals. Combined with AI insights, your notes become a powerful tool for better money management."
    },
    {
      question: "How can this platform improve my spending habits?",
      answer: "By visualizing where your money goes and highlighting trends in your spending behavior, the platform helps you identify unnecessary expenses and build healthier financial habits over time."
    },
    {
      question: "Who is this platform designed for?",
      answer: "Whether you're a student managing a budget, a professional planning future goals, or anyone looking for better financial organization, our platform provides the tools and guidance to help you stay in control of your finances."
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">FAQ</div>
         
        </div>

        <div className="footer-accordion">
          {accordionItems.map((item, index) => (
            <div 
              key={index} 
              className={`accordion-item ${activeIndex === index ? 'active' : ''}`}
            >
              <div className="accordion-header">
                <button 
                  className="accordion-trigger"
                  onClick={() => toggleAccordion(index)}
                >
                  {item.question}
                </button>
              </div>
              <div className="accordion-content">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="footer-copyright">
          <p>&copy; 2026 ExpenseTracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;