import React, { useState, useContext } from 'react';
import { Button, Form, FormGroup, Label, Input, Card, CardBody, Modal, ModalHeader, ModalBody } from 'reactstrap';
import '../styles/Login.css';
import axios from 'axios';
import UserContext from '../context/userContext.js';

function Login() {
  const APIURL = process.env.API_URL || 'http://localhost:3001';
  const [form, setForm] = useState({ usuario: '', senha: '' });
  const { setUserData } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setShowErrorModal(false);

    try {
      const response = await axios.post(`${APIURL}/user/login`, {
        email: form.usuario,
        senha: form.senha
      });

      if (response.status === 200) {
        const userData = response.data;
        setUserData(userData);
        window.location.href = '/roteiros';
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
        'Usuário ou senha inválidos. Tente novamente.'
      );
      setShowErrorModal(true);
    }
    setLoading(false);
  };

  const handleCloseError = () => {
    setShowErrorModal(false);
    setErrorMsg('');
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <CardBody>
          <h2 className="text-center mb-4">Login</h2>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="usuario">Usuário</Label>
              <Input
                type="text"
                name="usuario"
                id="usuario"
                className="video-input"
                placeholder="E-mail"
                value={form.usuario}
                onChange={handleChange}
                required
                autoFocus
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <Label for="senha">Senha</Label>
              <Input
                type="password"
                name="senha"
                id="senha"
                className="video-input"
                placeholder="Digite sua senha"
                value={form.senha}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </FormGroup>
            <Button color="primary" block type="submit" className="video-btn-continue" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        </CardBody>
      </Card>

      
      <Modal isOpen={showErrorModal} toggle={handleCloseError} centered className="video-modal">
        <ModalHeader toggle={handleCloseError} className="video-modal-header">
          Erro no Login
        </ModalHeader>
        <ModalBody className="text-danger text-center video-modal-body">
          <p>{errorMsg}</p>
          <Button color="danger" className="video-btn-continue" onClick={handleCloseError}>
            Fechar
          </Button>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default Login;