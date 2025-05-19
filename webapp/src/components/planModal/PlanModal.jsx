import React, { useContext, useState } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    Button,
    Row,
    Col,
    Alert,
    Spinner
} from 'reactstrap';
import './planModal.css';
import UserContext from '../../context/userContext.js';
import axios from 'axios';

function PlanModal({ isOpen, toggle }) {
    const APIURL = process.env.API_URL || process.env.REACT_APP_API_URL;
    const { userData } = useContext(UserContext);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [feedbackType, setFeedbackType] = useState('success');
    const [loadingPlan, setLoadingPlan] = useState(null);

    const handleSelectPlan = async (planType) => {
        setFeedbackMsg('');
        setLoadingPlan(planType);
        try {
            const response = await axios.post(`${APIURL}/plans/subscribeToPlan`, {
                name: userData?.nome,
                email: userData?.email,
                planType: planType,
            });
            if (response.data?.message) {
                setFeedbackType('success');
                setFeedbackMsg(response.data.message);
            } else {
                setFeedbackType('danger');
                setFeedbackMsg('Erro inesperado. Tente novamente.');
            }
        } catch (error) {
            setFeedbackType('danger');
            setFeedbackMsg('Erro ao adquirir plano. Tente novamente.');
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            centered
            className="plan-modal"
            size="lg"
            contentClassName="plan-modal-content"
        >
            <ModalHeader toggle={toggle} className="plan-modal-header">
                Planos de Roteiros
            </ModalHeader>
            <ModalBody className="plan-modal-body">
                <div className="plan-modal-greeting text-center mb-4">
                    <span>
                        <b>Olá, {userData?.nome || '(nome)'}. O seu plano atual "{userData?.licensed?.licenssType}". Sendo assim, escolha o melhor plano para você e comece a gerar roteiros todos os dias.</b>
                    </span>
                </div>
                {feedbackMsg && (
                    <Alert color={feedbackType} className="text-center">
                        {feedbackMsg}
                    </Alert>
                )}
                <Row className="justify-content-center">
                    <Col xs={12} md={6} lg={5} className="d-flex justify-content-center mb-4 mb-md-0">
                        <div className="plan-card">
                            <div className="plan-title">
                                <b>Gerar até 2 roteiros por mês</b>
                            </div>
                            <div className="plan-details">
                                <ul>
                                    <li>Plano Basic</li>
                                    <li>2 créditos mensais</li>
                                </ul>
                            </div>
                            <Button
                                color="dark"
                                className="plan-btn"
                                onClick={() => handleSelectPlan('basic')}
                                disabled={loadingPlan === 'basic' || loadingPlan === 'premium'}
                            >
                                {loadingPlan === 'basic' ? (
                                    <>
                                        <Spinner size="sm" /> Processando...
                                    </>
                                ) : (
                                    'COMPRAR'
                                )}
                            </Button>
                        </div>
                    </Col>
                    <Col xs={12} md={6} lg={5} className="d-flex justify-content-center">
                        <div className="plan-card">
                            <div className="plan-title">
                                <b>Gerar até 5 roteiros por mês</b>
                            </div>
                            <div className="plan-details">
                                <ul>
                                    <li>Plano Premium</li>
                                    <li>5 créditos mensais</li>
                                </ul>
                            </div>
                            <Button
                                color="dark"
                                className="plan-btn"
                                onClick={() => handleSelectPlan('premium')}
                                disabled={loadingPlan === 'basic' || loadingPlan === 'premium'}
                            >
                                {loadingPlan === 'premium' ? (
                                    <>
                                        <Spinner size="sm" /> Processando...
                                    </>
                                ) : (
                                    'COMPRAR'
                                )}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    );
}

export default PlanModal;