import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import CircularGallery from '../../components/InfiniteScrollGallery';
import Hero from '../../components/Hero';



const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleContact = () => {
    navigate('/contact');
  };

  // Gallery items for CircularGallery
  const galleryItems = [
    { image: '/imgCarousel_1.jpg', text: '' },
    { image: '/imgCarousel_6.png', text: '' },
    { image: '/imgCarousel_3.png', text: '' },
    { image: '/imgCarousel_4.png', text: '' },
    { image: '/imgCarousel_5.png', text: '' },
    { image: '/imgCarousel_2.jpg', text: '' },
    { image: '/imgCarousel_7.png', text: '' },
    { image: '/imgCarousel_8.png', text: '' },
    { image: '/imgCarousel_9.png', text: '' },
    { image: '/imgCarousel_5.png', text: '' },
  ];

  // Placeholder sponsors - you can replace these with actual sponsor logos later
  const sponsors = [
    { id: 1, name: 'Sponsor 1', logo: '/marrakechHoopsLogo.png' },
    { id: 2, name: 'Sponsor 2', logo: '/rchimLogo.png' },
    { id: 3, name: 'Sponsor 3', logo: '/drywichLogo.png' },
    { id: 4, name: 'Sponsor 1', logo: '/wearbasketballLogo.png' },
    { id: 5, name: 'Sponsor 2', logo: '/rchimLogo.png' },
    { id: 6, name: 'Sponsor 3', logo: '/drywichLogo.png' },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <Hero />
      </div>

      {/* Circular Gallery Section */}      
      <div style={{ height: '40vw', position: 'relative' }}>
        <CircularGallery 
          items={galleryItems}
          bend={5} 
          textColor="#C42A2D" 
          borderRadius={.05} 
          scrollEase={0.02}
          autoScrollEnabled={true}
          autoScrollSpeed={0.08}
        />
      </div>

     {/* About Section */}
     <section className="about-section">
        <div className="container">
          <h2 className="section-title">About Moroccan Court Kings</h2>
          <br />
          <div className="about-content">
            <div className="about-text">
              <p>
                Moroccan Court Kings is a passionate community born from the streets of Marrakech in 2022,
                where we ignited Marrakech Hoops and transformed a 1v1 tournament into a powerful movement.
              </p>
              <p>Led by founders Moulay Rachid El Adnani and Abdellah Oueldeghzal, alongside a dedicated team
                of over 30 creatives, sports managers, photographers, and filmmakers, we've grown into a
                national force, uniting players and enthusiasts through the first-ever 1v1 basketball
                tournament in the African diaspora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section with Infinite Carousel */}
      <section className="sponsors-section">
        <div className="container">
          <h2 className="section-title">Our Partners & Sponsors</h2>
          <div className="sponsors-carousel">
            <div className="sponsors-track">
              {/* Duplicate sponsors twice for seamless infinite scroll */}
              {[...sponsors, ...sponsors].map((sponsor, index) => (
                <div key={`${sponsor.id}-${index}`} className="sponsor-item">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="sponsor-logo"
                  />
                </div>
              ))}
            </div>
          </div>
            <p className="sponsors-note">
              Interested in partnering with MCK? <button className="link-button" onClick={handleContact}>Contact us</button> to learn more.
            </p>
        </div>
      </section>

      {/* Founders Section */}
      <section className="founders-section">
        <div className="container">
          <h2 className="section-title">Meet Our Founders</h2>
          <br />
          <div className="founders-grid">
            <div className="founder-card">
              <div className="founder-image">
                <div className="founder-placeholder">
                  <span>M.R</span>
                </div>
              </div>
              <div className="founder-info">
                <h3>Moulay Rachid EL ADNANI</h3>
                <p className="founder-title">Co-Founder & Tournament Director</p>
                <p className="founder-description">
                  Passionate about basketball and community development, Moulay Rachid brings years of
                  experience in sports management and event organization. His vision for MCK stems from
                  a deep love for the game and a desire to elevate Moroccan basketball talent.
                </p>
              </div>
            </div>

            <div className="founder-card">
              <div className="founder-image">
                <div className="founder-placeholder">
                  <span>A.O</span>
                </div>
              </div>
              <div className="founder-info">
                <h3>Abdollah Oueldleghzal</h3>
                <p className="founder-title">Co-Founder & Operations Manager</p>
                <p className="founder-description">
                  With expertise in sports technology and player development, Abdollah focuses on creating
                  innovative tournament formats and ensuring smooth operations. His commitment to excellence
                  drives MCK's continuous growth and success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission-card">
              <div className="card-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To expand the Moroccan Court Kings movement across Morocco, continuously refine its unique 1v1
                tournament concept, and export the dynamic Moroccan street basketball scene worldwide, fostering
                unity, talent, and innovation within a growing community of over 30 dedicated members.
              </p>
            </div>

            <div className="vision-card">
              <div className="card-icon">🌟</div>
              <h3>Our Vision</h3>
              <p>
                To transform Moroccan Court Kings into a global symbol of street basketball evolution, showcasing
                Morocco's vibrant basketball culture and creativity on the international stage while uniting
                communities through the power of 1v1 battles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Word from Founders */}
      <section className="founders-message">
        <div className="container">
          <h2 className="section-title">Our Story</h2>
          <div className="message-card">
            <div className="quote-icon">"</div>
            <div className="message-content">
              <p>Everything started in Marrakech, 2022. That's where we created the first
                real basketball community: Marrakech Hoops. We brought people together through a 3x3 tournament
                that became more than just a game it became the seed of a movement."</p>

              <p><h3 style={{fontWeight: 'bold'}}>The words we believe in: Basketball Culture Evolution.</h3></p>


              <p>At first, it was only Marrakech. Not Morocco. Why? Because at that time, Marrakech carried
                the energy, the visibility, the identity. And from there, the dream started to grow.</p>

              <p>Two childhood friends, Moulay Rachid El Adnani and Abdellah Oueldeghzal, pushed the idea
                further: what if we created a 1v1 tournament?</p>

              <p>We soon discovered it wasn't just new to Morocco it was the first ever 1v1 basketball
                tournament in the African diaspora. We developed our own rules, our own format, and gave
                birth to something original.</p>

              <p>Today, we are no longer just two individuals. We are a team of more than 30 people:
                creatives, sports managers, photographers, filmmakers… a full package. Because we believe
                that unity is power and we want to grow together.
              </p>
              <div className="message-signatures">
                <span>- Moulay Rachid EL ADNANI & Abdollah Oueldleghzal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Tournament Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏀</div>
              <h3>1v1 Competition</h3>
              <p>Pure individual skill showcase with intense one-on-one matchups</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Championship Format</h3>
              <p>Professional tournament structure with elimination rounds</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Live Scoring</h3>
              <p>Real-time game updates and comprehensive player statistics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎖️</div>
              <h3>Recognition</h3>
              <p>Awards, prizes, and recognition for outstanding performance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Community</h3>
              <p>Building Morocco's basketball community and fostering talent</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Digital Platform</h3>
              <p>Modern tournament management and player engagement tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Compete?</h2>
            <p>Join the Moroccan Court Kings community and take your basketball skills to the next level</p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-large" onClick={handleLogin}>
                Join Tournament
              </button>
              <button className="btn btn-secondary btn-large" onClick={handleContact}>
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;