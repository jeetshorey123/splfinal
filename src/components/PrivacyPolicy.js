import React from 'react';

const PrivacyPolicy = () => (
  <div className="container py-5" style={{maxWidth:700}}>
    <h2 className="mb-4">🔐 Privacy Policy</h2>
    <p><b>Effective Date:</b> 31 July 2025<br/>
    <b>Website:</b> <a href="https://poonamsagarcharaja.vercel.app" target="_blank" rel="noopener noreferrer">https://poonamsagarcharaja.vercel.app</a><br/>
    <b>Owner:</b> Jeet Shorey (<a href="mailto:shoreyjeet@gmail.com">shoreyjeet@gmail.com</a>)</p>
    <p>At SPL (Poonam Sagar Premier League), we value your privacy. This Privacy Policy outlines how we collect, use, and protect your personal data.</p>
    <ol>
      <li><b>Information We Collect</b><br/>We collect the following personal information during player registration:
        <ul>
          <li>Name</li>
          <li>Age</li>
          <li>Phone number</li>
          <li>Building name, Wing & Flat number</li>
        </ul>
      </li>
      <li><b>Purpose of Data Collection</b><br/>Your information is collected solely for:
        <ul>
          <li>Registering participants for SPL matches</li>
          <li>Contacting players regarding schedules or team information</li>
          <li>Managing tournament logistics</li>
        </ul>
      </li>
      <li><b>Data Sharing</b><br/>We do not sell or share your personal data with third parties. Only the SPL organizing team will have access to your information.</li>
      <li><b>Data Storage</b><br/>All data is securely stored using Supabase and local storage methods. We take appropriate steps to protect it from unauthorized access.</li>
      <li><b>Your Rights</b><br/>You can request to update or delete your data at any time by contacting us at <a href="mailto:shoreyjeet@gmail.com">shoreyjeet@gmail.com</a>.</li>
      <li><b>Updates to Policy</b><br/>We may update this Privacy Policy. The latest version will always be available on our website.</li>
    </ol>
  </div>
);

export default PrivacyPolicy;
