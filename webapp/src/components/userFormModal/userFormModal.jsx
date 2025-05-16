import React, { useState, useContext } from 'react';
import UserContext from '../../context/userContext.js';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import axios from 'axios';
import './UserFormModal.css';

function UserFormModal({ isOpen, toggle, onSubmit, onContinue }) {

  const { setUserData } = useContext(UserContext);
  const APIURL = process.env.API_URL || 'http://localhost:3001';

  const [form, setForm] = useState({ nome: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [alreadyExistsMsg, setAlreadyExistsMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetAll = () => {
    setForm({ nome: '', email: '' });
    setSuccessMsg('');
    setErrorMsg('');
    setAlreadyExistsMsg('');
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setAlreadyExistsMsg('');
    try {
      const response = await axios.post(`${APIURL}/user/cadastro`, form);
      if (response.status === 200) {
        if (
          response.data &&
          response.data.message === "Usuário já cadastrado."
        ) {
          setAlreadyExistsMsg(
            `O e-mail "${response.data.user.email}" já está cadastrado.`
          );
        } else {
          setSuccessMsg('Seu cadastro foi registrado!');
          setForm({ nome: '', email: '' });
          if (onSubmit) onSubmit(form);
        }

        setUserData(response.data.user);

      } else {
        setErrorMsg('Erro ao registrar cadastro. Tente novamente!');
      }
    } catch (err) {
      setErrorMsg('Erro ao conectar com o servidor.');
    }
    setLoading(false);
  };

  const handleContinue = () => {
    resetAll();
    toggle();
    onContinue();
  };

  const handleCloseError = () => {
    resetAll();
    toggle();
  };

  const handleCloseAlreadyExists = () => {
    resetAll();
    toggle();
  };

  const handleToggle = () => {
    resetAll();
    toggle();
  };

  let modalTitle = 'Preencha seus dados';
  if (successMsg) modalTitle = 'Sucesso';
  else if (alreadyExistsMsg) modalTitle = 'Usuário já cadastrado';
  else if (errorMsg) modalTitle = 'Erro';

  return (
    <Modal isOpen={isOpen} toggle={handleToggle} centered className="custom-modal">
      <ModalHeader toggle={handleToggle}>{modalTitle}</ModalHeader>
      <ModalBody>
        {successMsg ? (
          <div className="text-success mb-2 text-center">
            <p>{successMsg}</p>
            <Button
              color="success"
              className="btn-action-success"
              onClick={handleContinue}
            >
              Continuar
            </Button>
          </div>
        ) : alreadyExistsMsg ? (
          <div className="text-warning mb-2 text-center">
            <p>{alreadyExistsMsg}</p>
            <Button
              color="warning"
              className="btn-action-warning"
              onClick={handleCloseAlreadyExists}
            >
              Sair
            </Button>
          </div>
        ) : errorMsg ? (
          <div className="text-danger mb-2 text-center">
            <p>{errorMsg}</p>
            <Button
              color="danger"
              className="btn-action-error"
              onClick={handleCloseError}
            >
              Sair
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="nome" className="form-label">Nome</Label>
              <Input
                type="text"
                name="nome"
                id="nome"
                className="form-control"
                placeholder="Digite seu nome"
                value={form.nome}
                onChange={handleChange}
                required
                autoFocus
              />
            </FormGroup>
            <FormGroup>
              <Label for="email" className="form-label">E-mail</Label>
              <Input
                type="email"
                name="email"
                id="email"
                className="form-control"
                placeholder="Digite seu e-mail"
                value={form.email}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <ModalFooter>
              <Button color="primary" type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </ModalBody>
    </Modal>
  );
}

export default UserFormModal;