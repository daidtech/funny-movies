'use client';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { House } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentUser, login, logout, register } from '../services/authService';
import Link from 'next/link';
import { toast } from 'react-toastify';

const Header = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const fetchCurrentUser = async () => {
    await getCurrentUser().then((res) => {
      setCurrentUser(res);
    })
  }

  const handleLogin = () => {
    login(email, password).then(() => {
      fetchCurrentUser();
    }).catch((err) => {
      toast.error(err.toString());
    });
  }

  const handleRegister = () => {
    register(email, password).then((res) => {
      console.log(res);
      handleLogin();
    }).catch((err) => {
      toast.error(err.toString());
    });
  }
  const handleLogout = () => {
    logout().then((res) => {
      console.log(res);
      setCurrentUser(null);
    }).catch((err) => { console.log(err) });
  }

  useEffect(() => {
    fetchCurrentUser();
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
            <Col md={8} className="d-flex align-items-center justify-content-end gap-4">
              <>
                {
                  // @ts-expect-error //Todo: fix ts-ignore
                  currentUser?.id ? (
                    <>
                      {/* @ts-expect-error //Todo: fix ts-ignore*/}
                      <h4 className='mb-0'>Welcome {currentUser?.email}</h4>
                      <Link href={'/share'} className="btn btn-primary">Share a movie</Link>
                      <Button variant="danger" onClick={() => handleLogout()}>Logout</Button>
                    </>
                  ) : (
                    <>
                      <Form.Control
                        type="email"
                        placeholder="email"
                        className="w-25"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Form.Control
                        type="password"
                        placeholder="password"
                        className="w-25"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button variant="primary" onClick={() => handleLogin()}>Login</Button>
                      <Button variant="secondary" onClick={() => handleRegister()}>Register</Button>
                    </>
                  )
                }
              </>
            </Col>
        </Row>
      </Container>
    </header>
  )
}
export default Header;