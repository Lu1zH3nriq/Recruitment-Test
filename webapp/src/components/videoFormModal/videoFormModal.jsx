import React, { useState, useContext, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import './videoFormModal.css';
import UserContext from '../../context/userContext.js';

function VideoFormModal({ isOpen, toggle, selectPlan }) {
    const APIURL = process.env.API_URL || process.env.REACT_APP_API_URL;
    const [form, setForm] = useState({
        tema: '',
        formato: '',
        tempo: '',
        ideias: ''
    });
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const { userData, isLoggedIn } = useContext(UserContext);
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetAll = () => {
        setForm({ tema: '', formato: '', tempo: '', ideias: '' });
        setSuccessMsg('');
        setErrorMsg('');
        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');

        if (userData.licensed.licenssType === "free" && userData.licensed.credits <= 0) {
            setLoading(false);
            resetAll();
            selectPlan();
            return;
        }

        if (userData.licensed.credits <= 0) {
            setErrorMsg('Você não possui mais créditos disponíveis.');
            setLoading(false);
            return;
        }

        const novaIdeia = {
            tema: form.tema,
            formato: form.formato,
            tempo: Number(form.tempo),
            ideias: form.ideias,
            roteiro: '',
            date: new Date().toISOString()
        };


        if (isLoggedIn === false) {
            setSuccessMsg('Parabéns. Seu roteiro está sendo gerado. Aguarde e acompanhe pelo seu e-mail.');
            setLoading(false);

            axios.post(`${APIURL}/video/ideiaDeVideo`, {
                nome: userData?.nome || '',
                email: userData?.email || '',
                IdeiaVideos: novaIdeia
            }).catch(() => { });
            return;
        }

        resetAll();
        toggle();
        axios.post(`${APIURL}/video/ideiaDeVideo`, {
            nome: userData?.nome || '',
            email: userData?.email || '',
            IdeiaVideos: novaIdeia
        }).catch(() => { });
        setLoading(false);
    };

    const handleContinue = () => {
        resetAll();
        toggle();

        if (isLoggedIn === false || sessionStorage.getItem('token') === null) {
            navigate('/login');
        }
    };

    const handleCloseError = () => {
        resetAll();
        toggle();
    };

    const handleToggle = () => {
        resetAll();
        toggle();
    };

    let modalTitle = 'Criar Ideia de Vídeo';
    if (successMsg) modalTitle = 'Sucesso';
    else if (errorMsg) modalTitle = 'Erro';

    return (
        <Modal
            isOpen={isOpen}
            toggle={handleToggle}
            centered
            className="video-modal"
            size="lg"
            contentClassName="video-modal-content"
        >
            <ModalHeader toggle={handleToggle} className="video-modal-header">
                {modalTitle}
            </ModalHeader>
            <ModalBody className="video-modal-body">
                {successMsg ? (
                    <div className="text-success mb-2 text-center">
                        <p>{successMsg}</p>
                        <Button
                            color="success"
                            className="video-btn-continue"
                            onClick={handleContinue}
                        >
                            Continuar
                        </Button>
                    </div>
                ) : errorMsg ? (
                    <div className="text-danger mb-2 text-center">
                        <p>{errorMsg}</p>
                        <Button
                            color="danger"
                            className="video-btn-continue"
                            onClick={handleCloseError}
                        >
                            Sair
                        </Button>
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="tema" className="video-label">Tema do vídeo</Label>
                            <Input
                                type="text"
                                name="tema"
                                id="tema"
                                className="video-input"
                                placeholder="Digite o tema do vídeo"
                                value={form.tema}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="formato" className="video-label">Formato</Label>
                            <Input
                                type="select"
                                name="formato"
                                id="formato"
                                className="video-input"
                                value={form.formato}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecione o formato</option>
                                <option value="youtube">Vídeo Youtube</option>
                                <option value="reels">Reels</option>
                                <option value="aula">Aula</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for="tempo" className="video-label">Tempo do vídeo (minutos)</Label>
                            <Input
                                type="number"
                                name="tempo"
                                id="tempo"
                                className="video-input"
                                placeholder="Ex: 10"
                                value={form.tempo}
                                onChange={handleChange}
                                min={1}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="ideias" className="video-label">Ideias</Label>
                            <Input
                                type="textarea"
                                name="ideias"
                                id="ideias"
                                className="video-input"
                                placeholder="Descreva suas ideias para o vídeo"
                                value={form.ideias}
                                onChange={handleChange}
                                rows={5}
                                required
                            />
                        </FormGroup>
                        <ModalFooter className="video-modal-footer">
                            <Button color="primary" type="submit" className="video-btn-continue" disabled={loading}>
                                {loading ? 'Enviando...' : 'Continuar'}
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </ModalBody>
        </Modal>
    );
}

export default VideoFormModal;