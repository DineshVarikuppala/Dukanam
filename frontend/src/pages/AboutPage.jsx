import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Database, Server, Smartphone, Mail, ShoppingBag } from 'lucide-react';

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>About DUKANAM</h1>

            {/* Application Overview */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <ShoppingBag size={48} color="var(--primary)" />
                    <div>
                        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Your Local Shop</h2>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Connecting local businesses with customers</p>
                    </div>
                </div>
                <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                    DUKANAM is a comprehensive e-commerce platform designed to empower local businesses and provide customers
                    with a seamless shopping experience. The platform enables store owners to manage their inventory, process
                    orders, and grow their business online, while customers can discover local products, place orders, and
                    track deliveries with ease.
                </p>
                <p style={{ lineHeight: '1.8', margin: 0 }}>
                    With features like real-time notifications, secure checkout, saved addresses, and order tracking,
                    DUKANAM bridges the gap between traditional local shopping and modern e-commerce convenience.
                </p>
            </div>

            {/* Technologies Used */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Technologies Used</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {/* Frontend */}
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <Code size={24} color="#61dafb" />
                            <h3 style={{ margin: 0 }}>Frontend</h3>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                            <li>React.js</li>
                            <li>React Router</li>
                            <li>Axios</li>
                            <li>React Hot Toast</li>
                            <li>Lucide Icons</li>
                        </ul>
                    </div>

                    {/* Backend */}
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <Server size={24} color="#6aad3d" />
                            <h3 style={{ margin: 0 }}>Backend</h3>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                            <li>Spring Boot</li>
                            <li>Spring Security</li>
                            <li>Spring Data JPA</li>
                            <li>Hibernate</li>
                            <li>JavaMail</li>
                        </ul>
                    </div>

                    {/* Database */}
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <Database size={24} color="#00758f" />
                            <h3 style={{ margin: 0 }}>Database</h3>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                            <li>MySQL</li>
                            <li>JPA/Hibernate ORM</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Developer Info */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: 'white' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>About the Developer</h2>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--primary)',
                        flexShrink: 0
                    }}>
                        VD
                    </div>
                    <div>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Varikuppala Dinesh</h3>
                        <p style={{ margin: 0, marginBottom: '1rem', opacity: 0.9 }}>Full Stack Developer</p>
                        <p style={{ lineHeight: '1.8', margin: 0, opacity: 0.95 }}>
                            I built DUKANAM as a comprehensive full-stack e-commerce platform to demonstrate modern web
                            development practices and solve real-world problems for local businesses. The project showcases
                            my expertise in React, Spring Boot, database design, RESTful APIs, authentication, and creating
                            intuitive user experiences.
                        </p>
                        <p style={{ lineHeight: '1.8', marginTop: '1rem', marginBottom: 0, opacity: 0.95 }}>
                            This application features role-based access control, real-time notifications, email integration,
                            secure checkout flows, order management, and responsive design - all built from the ground up
                            with scalability and user experience in mind.
                        </p>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline">
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default AboutPage;
