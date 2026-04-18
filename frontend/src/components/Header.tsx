'use client';

import { House } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getCurrentUser, login, logout, register } from '../services/authService';

type CurrentUser = {
  id: number;
  email: string;
};

const Header = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      setCurrentUser(response && typeof response === 'object' ? response : null);
    } catch {
      setCurrentUser(null);
    }
  };

  const clearCredentials = () => {
    setEmail('');
    setPassword('');
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);

    try {
      await login(email, password);
      await fetchCurrentUser();
      clearCredentials();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error logging in';
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);

    try {
      await register(email, password);
      await login(email, password);
      await fetchCurrentUser();
      clearCredentials();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error registering account';
      toast.error(message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error logging out';
      toast.error(message);
    }
  };

  useEffect(() => {
    void fetchCurrentUser();
  }, []);

  return (
    <header className="border-bottom">
      <Container className="py-4">
        <Row className="align-items-center justify-content-between">
          <Col md={4} className="d-flex align-items-center gap-2 mb-4 mb-md-0">
            <Link href={'/'} className='d-flex align-items-center gap-2'>
              <House className="h-6 w-6" />
              <h1 className="h4 font-weight-bold mb-0">Funny Movies</h1>
            </Link>
          </Col>
          <Col md={8} className="d-flex align-items-center justify-content-end gap-4 flex-wrap">
            {currentUser ? (
              <>
                <h4 className='mb-0'>Welcome {currentUser.email}</h4>
                <Link href={'/share'} className="btn btn-primary">Share a movie</Link>
                <Button variant="danger" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Form.Control
                  type="email"
                  placeholder="email"
                  className="w-auto"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Form.Control
                  type="password"
                  placeholder="password"
                  className="w-auto"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Button variant="primary" onClick={handleLogin} disabled={isLoggingIn || isRegistering || !email || !password}>
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </Button>
                <Button variant="secondary" onClick={handleRegister} disabled={isLoggingIn || isRegistering || !email || !password}>
                  {isRegistering ? 'Registering...' : 'Register'}
                </Button>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default Header;