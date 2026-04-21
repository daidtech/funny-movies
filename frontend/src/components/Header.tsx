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
    <header className="border-bottom sticky-top bg-white">
      <Container className="py-3">
        <Row className="align-items-center g-3">
          <Col xs={12} md={4} className="d-flex align-items-center gap-2">
            <Link href={'/'} className="d-flex align-items-center gap-2 text-decoration-none text-dark">
              <House className="h-6 w-6" />
              <h1 className="h5 fw-bold mb-0">Funny Movies</h1>
            </Link>
          </Col>
          <Col xs={12} md={8}>
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-end gap-3 w-100">
              {currentUser ? (
                <>
                  <span className="d-none d-md-inline text-muted">Welcome {currentUser.email}</span>
                  <Link href={'/share'} className="w-100 w-md-auto">
                    <Button variant="primary" size="sm" className="w-100 w-md-auto">
                      Share a movie
                    </Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={handleLogout} className="w-100 w-md-auto">
                    Logout
                  </Button>
                </>
              ) : (
                <Form className="w-100 d-flex flex-column flex-md-row gap-2">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    size="sm"
                    className="flex-grow-1"
                  />
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    size="sm"
                    className="flex-grow-1"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleLogin}
                    disabled={isLoggingIn || isRegistering || !email || !password}
                    className="w-100 w-md-auto"
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRegister}
                    disabled={isLoggingIn || isRegistering || !email || !password}
                    className="w-100 w-md-auto"
                  >
                    {isRegistering ? 'Registering...' : 'Register'}
                  </Button>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
