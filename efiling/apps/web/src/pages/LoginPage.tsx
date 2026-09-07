import { useState } from 'react';
import { useAuth } from '../lib/auth';
import './login.css';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
      setBusy(false);
    }
  }

  return (
    <div className="login">
      {/*
        ส่วนหัวนี้จำลองบล็อกควบคุมเอกสารที่อยู่หัวกระดาษของระเบียบปฏิบัติงานจริง
        เจ้าหน้าที่คุณภาพคุ้นกับรูปแบบนี้ทันทีว่ากำลังดูเอกสารอะไร ฉบับไหน
      */}
      <section className="login__masthead">
        <div className="login__ident">
          <p className="login__org">มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา</p>
          <h1>ทะเบียนเอกสารคุณภาพ</h1>
          <p className="login__sub">
            ระบบบริหารงานคุณภาพ ISO 9001:2015 สำนักงานคณบดีคณะวิศวกรรมศาสตร์
          </p>
        </div>

        {/* สามระเบียบปฏิบัติงานที่ระบบนี้รองรับ — บอกขอบเขตด้วยภาษาที่ผู้ใช้ใช้จริง */}
        <dl className="login__control">
          <div>
            <dt className="code">QP-2301-0107</dt>
            <dd>การควบคุมเอกสาร</dd>
          </div>
          <div>
            <dt className="code">QP-2301-0102</dt>
            <dd>การตรวจติดตามคุณภาพภายใน</dd>
          </div>
          <div>
            <dt className="code">QP-2301-0109</dt>
            <dd>การแก้ไขและการป้องกัน</dd>
          </div>
        </dl>
      </section>

      <form className="login__form sheet" onSubmit={submit}>
        <h2>เข้าสู่ระบบ</h2>

        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="email">อีเมล</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">รหัสผ่าน</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'กำลังตรวจสอบ' : 'เข้าสู่ระบบ'}
        </button>

        <p className="login__hint">
          ยังไม่มีบัญชี ติดต่อเจ้าหน้าที่ควบคุมเอกสารของสำนักงานคณบดี
        </p>
      </form>
    </div>
  );
}
