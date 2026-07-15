import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '100px auto', padding: '0 32px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '24px' }}>Privacy Policy</h1>
      <p style={{ color: '#6B6B6F', lineHeight: '1.6', marginBottom: '16px' }}>
        Effective Date: {new Date().toLocaleDateString()}
      </p>
      
      <h2 style={{ fontSize: '24px', marginTop: '32px', marginBottom: '16px' }}>1. Introduction</h2>
      <p style={{ color: '#3D3D40', lineHeight: '1.6', marginBottom: '16px' }}>
        Welcome to Rent. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.
      </p>
      
      <h2 style={{ fontSize: '24px', marginTop: '32px', marginBottom: '16px' }}>2. Data Collection</h2>
      <p style={{ color: '#3D3D40', lineHeight: '1.6', marginBottom: '16px' }}>
        We collect data that you provide directly, such as account details and property information, to ensure the optimal functioning of our services.
      </p>

      <h2 style={{ fontSize: '24px', marginTop: '32px', marginBottom: '16px' }}>3. Data Usage</h2>
      <p style={{ color: '#3D3D40', lineHeight: '1.6', marginBottom: '16px' }}>
        Your data is used to provide, maintain, and improve our services, as well as to communicate with you effectively.
      </p>

      <div style={{ marginTop: '48px' }}>
        <a href="/" style={{ color: '#0B0B0C', fontWeight: '600', textDecoration: 'none' }}>&larr; Back to Home</a>
      </div>
    </div>
  );
}
