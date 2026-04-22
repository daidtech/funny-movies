'use client';

import Image from 'next/image';
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

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
    <header className="border-bottom sticky-top bg-white shadow-sm">
      <Container className="py-2 py-md-3">
        {currentUser ? (
          <div className="d-flex align-items-center justify-content-between gap-2">
            <Link href={'/'} className="d-flex align-items-center gap-2 text-decoration-none text-dark flex-shrink-0">
              <Image src="/icon.svg" alt="Funny Movies" width={24} height={24} priority className="flex-shrink-0" />
              <h1 className="h5 fw-bold mb-0">Funny Movies</h1>
            </Link>
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <span className="text-muted small text-truncate d-none d-sm-block" style={{ maxWidth: '200px' }}>
                {currentUser.email}
              </span>
              <Link href={'/share'} className="flex-shrink-0">
                <Button variant="primary" size="sm">
                  <span className="d-none d-sm-inline">Share a movie</span>
                  <span className="d-sm-none">Share</span>
                </Button>
              </Link>
              <Button variant="outline-danger" size="sm" onClick={handleLogout} className="flex-shrink-0">
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <Row className="align-items-center g-2">
            <Col xs={12} md={4} className="d-flex align-items-center">
              <Link href={'/'} className="d-flex align-items-center gap-2 text-decoration-none text-dark">
                <Image src="/icon.svg" alt="Funny Movies" width={24} height={24} priority className="flex-shrink-0" />
                <h1 className="h5 fw-bold mb-0">Funny Movies</h1>
              </Link>
            </Col>
            <Col xs={12} md={8}>
              <Form onSubmit={handleLogin}>
                <Row className="g-2">
                  <Col xs={6} md>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      size="sm"
                    />
                  </Col>
                  <Col xs={6} md>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      size="sm"
                    />
                  </Col>
                  <Col xs={6} md="auto">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isLoggingIn || isRegistering || !email || !password}
                      className="w-100"
                    >
                      {isLoggingIn ? 'Logging in...' : 'Login'}
                    </Button>
                  </Col>
                  <Col xs={6} md="auto">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleRegister}
                      disabled={isLoggingIn || isRegistering || !email || !password}
                      className="w-100"
                    >
                      {isRegistering ? 'Registering...' : 'Register'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        )}
      </Container>
    </header>
  );
};

export default Header;
