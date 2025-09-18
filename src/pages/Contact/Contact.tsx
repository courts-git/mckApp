import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Contact.css';


interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  // EmailJS Configuration - Replace with your actual values
  const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID
  const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Check if EmailJS is configured
      if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || 
          EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || 
          EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.warn('EmailJS not configured properly. Please update the configuration constants.');
        
        // Fallback to mailto link
        const subject = encodeURIComponent(`MCK Contact: ${formData.subject}`);
        const body = encodeURIComponent(
          `Name: ${formData.name}\n` +
          `Email: ${formData.email}\n` +
          `Subject: ${formData.subject}\n\n` +
          `Message:\n${formData.message}`
        );
        
        const mailtoLink = `mailto:moroccancourtkings@gmail.com?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        
        setSubmitStatus('success');
      } else {
        // Send email using EmailJS
        const templateParams = {
          to_email: 'moroccancourtkings@gmail.com',
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        setSubmitStatus('success');
      }
      
      // Clear form immediately after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && 
                     formData.email.trim() && 
                     formData.subject.trim() && 
                     formData.message.trim();

  return (
    <div className="contact">
      <div className="contact-hero">
        <div className="container">
          <div className="back-to-home">
            <Link to="/" className="back-link montserrat">
              <span className="back-arrow">←</span>
              Back to Home
            </Link>
          </div>
          <h1 className="contact-title sahara-scrolls">Get In Touch</h1>
          <p className="contact-subtitle montserrat">
            Ready to join the MCK movement? Have questions about tournaments? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2 className="info-title sahara-scrolls">Contact Information</h2>
              
              <div className="info-card">
                <div className="info-icon">📍</div>
                <div className="info-content">
                  <h3 className="sahara-scrolls">Location</h3>
                  <p className="montserrat">Marrakech, Morocco</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📧</div>
                <div className="info-content">
                  <h3 className="sahara-scrolls">Email</h3>
                  <p className="montserrat">moroccancourtkings@gmail.com</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📱</div>
                <div className="info-content">
                  <h3 className="sahara-scrolls">Social Media</h3>
                  <a 
                    href="https://www.instagram.com/moroccancourtkings/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link montserrat"
                  >
                    @moroccancourtkings
                  </a>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">🏀</div>
                <div className="info-content">
                  <h3 className="sahara-scrolls">Tournament Info</h3>
                  <p className="montserrat">1v1 Basketball Championships</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2 className="form-title sahara-scrolls">Send Us a Message</h2>
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label montserrat">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input montserrat"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label montserrat">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input montserrat"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label montserrat">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-select montserrat"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="tournament-registration">Tournament Registration</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="sponsorship">Sponsorship Inquiry</option>
                    <option value="media">Media & Press</option>
                    <option value="general">General Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label montserrat">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea montserrat"
                    rows={6}
                    placeholder="Tell us about your inquiry..."
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className={`btn btn-primary montserrat ${!isFormValid ? 'disabled' : ''}`}
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="btn-loading">
                        <span className="spinner"></span>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>

                {submitStatus === 'success' && (
                  <div className="form-message success">
                    <div className="message-icon">✅</div>
                    <p>Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="form-message error">
                    <div className="message-icon">❌</div>
                    <p>Sorry, there was an error sending your message. Please try again or contact us directly.</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="contact-cta">
        <div className="container">
          <h2 className="cta-title sahara-scrolls">Join the Movement</h2>
          <p className="cta-text montserrat">
            Be part of Morocco's basketball revolution. Follow us on social media for the latest updates, 
            tournament announcements, and behind-the-scenes content.
          </p>
          <div className="cta-actions">
            <a 
              href="https://www.instagram.com/moroccancourtkings/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary montserrat"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
