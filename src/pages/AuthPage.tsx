import React, { useState } from 'react';
import { Button, Input, Checkbox } from '../components/common';

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (mode === 'login') {
      if (!email || !password) {
        setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessage({ type: 'success', text: 'Đăng nhập thành công! Đang chuyển hướng...' });
      }, 1200);
    } else if (mode === 'register') {
      if (!fullName || !email || !password || !confirmPassword) {
        setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các thông tin đăng ký.' });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' });
        return;
      }
      if (!agreeTerms) {
        setMessage({ type: 'error', text: 'Bạn cần đồng ý với Điều khoản dịch vụ.' });
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessage({ type: 'success', text: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.' });
        setMode('login');
      }, 1200);
    } else if (mode === 'forgot-password') {
      if (!email) {
        setMessage({ type: 'error', text: 'Vui lòng nhập Email để nhận liên kết khôi phục.' });
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessage({ type: 'success', text: 'Mã xác minh đặt lại mật khẩu đã được gửi đến Email của bạn!' });
      }, 1200);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        {/* Brand / Logo Header */}
        <div className="auth-header">
          <h1 className="custom-title-h2">PigFamily</h1>
          <p className="custom-subtitle">
            {mode === 'login' && 'Đăng nhập hệ thống quản lý trang trại heo nái.'}
            {mode === 'register' && 'Tạo tài khoản quản lý mới.'}
            {mode === 'forgot-password' && 'Nhập email để nhận hướng dẫn khôi phục mật khẩu.'}
          </p>
        </div>


        {/* Tab Selector */}
        {mode !== 'forgot-password' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setMessage(null); }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setMessage(null); }}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Feedback Message */}
        {message && (
          <div className={`auth-alert auth-alert-${message.type}`}>
            {message.type === 'success' ? '✓ ' : '⚠️ '}
            {message.text}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <Input
              label="Họ và tên"
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="example@campmanager.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {mode !== 'forgot-password' && (
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {mode === 'register' && (
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          {/* Form Options */}
          {mode === 'login' && (
            <div className="auth-options">
              <Checkbox
                label="Ghi nhớ đăng nhập"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <button
                type="button"
                className="auth-link"
                onClick={() => { setMode('forgot-password'); setMessage(null); }}
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="auth-options">
              <Checkbox
                label="Tôi đồng ý với Điều khoản & Chính sách"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (
              mode === 'login' ? 'Đăng nhập' :
              mode === 'register' ? 'Đăng ký tài khoản' : 'Gửi yêu cầu khôi phục'
            )}
          </Button>

          {/* Back to login if in forgot-password mode */}
          {mode === 'forgot-password' && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                className="auth-link"
                onClick={() => { setMode('login'); setMessage(null); }}
              >
                ← Quay lại Đăng nhập
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
