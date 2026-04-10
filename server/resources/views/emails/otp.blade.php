<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'DM Sans', Arial, sans-serif; background: #f8f8f8; margin: 0; padding: 0; }
    .wrapper { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #4e0f1a, #6B1829); padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 1.5rem; margin: 0; letter-spacing: 0.02em; }
    .header p  { color: rgba(255,255,255,0.75); font-size: 0.85rem; margin: 6px 0 0; }
    .body { padding: 32px; text-align: center; }
    .body p { color: #4a4850; font-size: 0.95rem; margin: 0 0 1.5rem; }
    .otp-box { display: inline-block; background: #faf7f2; border: 2px dashed #6B1829; border-radius: 10px; padding: 18px 40px; margin-bottom: 1.5rem; }
    .otp-code { font-size: 2.2rem; font-weight: 700; letter-spacing: 0.18em; color: #6B1829; font-family: monospace; }
    .expiry { color: #d97706; font-size: 0.82rem; font-weight: 600; }
    .movie  { color: #6B1829; font-weight: 700; }
    .footer { background: #f0eff0; padding: 16px 32px; text-align: center; font-size: 0.72rem; color: #8e8b90; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎬 CineBook</h1>
      <p>Your One-Time Password</p>
    </div>
    <div class="body">
      <p>You're booking tickets for <span class="movie">{{ $movieTitle }}</span>.<br>Use the code below to confirm your payment:</p>
      <div class="otp-box">
        <div class="otp-code">{{ $otp }}</div>
      </div>
      <p class="expiry">⏱ This code expires in 1 minute.</p>
      <p style="font-size:0.8rem;color:#8e8b90;">If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">Copyright © 2026 CineBook Limited. All Rights Reserved.</div>
  </div>
</body>
</html>