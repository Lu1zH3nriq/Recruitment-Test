import React, { useContext, useEffect, useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Progress
} from 'reactstrap';
import '../styles/Roteiros.css';
import UserContext from '../context/userContext';
import VideoFormModal from '../components/videoFormModal/videoFormModal';
import PlanModal from '../components/planModal/PlanModal';
import axios from 'axios';

function Roteiros() {

    const API_URL = process.env.API_URL || process.env.REACT_APP_API_URL;

    const { userData, setUserData } = useContext(UserContext);
    const ideiasVideos = userData?.IdeiasVideos || [];

    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [temposRestantes, setTemposRestantes] = useState(
        ideiasVideos.map((video) =>
            typeof video.segundosRestantes === 'number'
                ? video.segundosRestantes
                : 21
        )
    );
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        setTemposRestantes(
            ideiasVideos.map((video) =>
                typeof video.segundosRestantes === 'number'
                    ? video.segundosRestantes
                    : 21
            )
        );
    }, [ideiasVideos]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTemposRestantes((tempos) =>
                tempos.map((tempo) => (tempo > 0 ? tempo - 1 : 0))
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [ideiasVideos.length]);

    const allConcluidos = temposRestantes.length > 0 && temposRestantes.every((t) => t === 0);

    const handleExpand = (idx) => {
        setExpanded(expanded === idx ? null : idx);
    };

    const getHalfScript = (roteiro) => {
        if (!roteiro) return ['', ''];
        const meio = Math.floor(roteiro.length / 2);
        return [roteiro.slice(0, meio), roteiro.slice(meio)];
    };

    const _refreshRoteiros = () => {
        axios.get(`${API_URL}/user/getUser`, {
            params: {
                nome: userData?.nome,
                email: userData?.email
            }
        })
            .then((response) => {
                console.log('User Atualizado:', response.data.user);
                setUserData(response.data.user);
            })
            .catch((error) => {
                console.error('Erro ao atualizar roteiros:', error);
            });
    };


    return (
        <div className="roteiros-bg">
            <Container fluid className="h-100 d-flex align-items-center justify-content-center roteiros-main-container">
                <Row className="w-100 justify-content-center align-items-center">
                    <Col xs={12} md={10} lg={8} xl={6} className="d-flex flex-column align-items-center">
                        <div className="roteiros-header mb-4 text-center">
                            <span>
                                <b>Olá, {userData?.nome || 'Usuário'}.</b> Seu vídeo está sendo gerado, aguarde.
                            </span>
                        </div>
                        {ideiasVideos.length === 0 ? (
                            <Card className="roteiros-card w-100 mb-4">
                                <CardBody className="text-center">
                                    <p>Ainda não existe nenhum roteiro de vídeo para este usuário.</p>
                                </CardBody>
                            </Card>
                        ) : (
                            ideiasVideos.map((video, idx) => {
                                const segundosRestantes = temposRestantes[idx] ?? 0;
                                const progresso = Math.max(0, 100 - segundosRestantes * 4.5);
                                const data = video.date
                                    ? new Date(video.date).toLocaleDateString('pt-BR')
                                    : new Date().toLocaleDateString('pt-BR');
                                const concluido = segundosRestantes === 0;
                                const isExpanded = expanded === idx;
                                const roteiro = video.roteiro || '';
                                const [metade1, metade2] = getHalfScript(roteiro);
                                const isFree = userData?.licensed?.licenssType === 'free';

                                return (
                                    <Card className="roteiros-card w-100 mb-4" key={idx}>
                                        <div className="roteiros-card-header d-flex justify-content-between align-items-center">
                                            <span>Vídeo {idx + 1}</span>
                                            <span>{data}</span>
                                        </div>
                                        <CardBody className="p-0">
                                            <div className="roteiros-card-row d-flex justify-content-between align-items-center">
                                                <b>Tema do vídeo:</b>
                                                <span>{video.tema || '-'}</span>
                                            </div>
                                            <div className="roteiros-card-row d-flex justify-content-between align-items-center">
                                                <b>Formato:</b>
                                                <span>{video.formato || '-'}</span>
                                            </div>
                                            <div className="roteiros-card-row d-flex justify-content-between align-items-center">
                                                <b>Tempo do vídeo:</b>
                                                <span>{video.tempo ? `${video.tempo} min` : '-'}</span>
                                            </div>
                                            <div className="roteiros-card-row d-flex justify-content-between align-items-center">
                                                <b>Tempo médio do vídeo:</b>
                                                <span>{video.tempo ? `${video.tempo} min` : '-'}</span>
                                            </div>
                                            <div className="roteiros-card-footer d-flex flex-column flex-md-row justify-content-between align-items-center">
                                                <div className="roteiros-progress-info w-100 w-md-75 mb-3 mb-md-0">
                                                    <div className="mb-1">
                                                        {concluido
                                                            ? <span style={{ color: '#22bb33', fontWeight: 'bold' }}>Concluído!</span>
                                                            : <>Ainda faltam {segundosRestantes} segundos.</>
                                                        }
                                                    </div>
                                                    <Progress
                                                        value={concluido ? 100 : progresso}
                                                        color={concluido ? "info" : "success"}
                                                        style={{ height: '8px', background: '#e0e0e0' }}
                                                    />
                                                </div>
                                                <Button
                                                    color="warning"
                                                    className="roteiros-btn-roteiro"
                                                    disabled={!concluido}
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: '1.1rem',
                                                        borderRadius: '12px',
                                                        minWidth: '170px',
                                                        boxShadow: '0 2px 8px #2221',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        opacity: concluido ? 1 : 0.6,
                                                        cursor: concluido ? 'pointer' : 'not-allowed'
                                                    }}
                                                    onClick={() => handleExpand(idx)}
                                                >
                                                    VER ROTEIRO{' '}
                                                    <span role="img" aria-label={concluido ? "destrancado" : "cadeado"}>
                                                        {concluido ? '🔓' : '🔒'}
                                                    </span>
                                                </Button>
                                            </div>
                                            {isExpanded && concluido && (
                                                <div className="roteiro-expand mt-3 mb-2">
                                                    <div className="roteiro-expand-inner">
                                                        <div className="roteiro-titulo mb-2">
                                                            <b>Roteiro gerado:</b>
                                                        </div>
                                                        {isFree ? (
                                                            <div className="roteiro-metade">
                                                                <span>{metade1}</span>
                                                                <span
                                                                    className="roteiro-blur"
                                                                    style={{
                                                                        display: 'block',
                                                                        filter: 'blur(6px)',
                                                                        background: 'linear-gradient(90deg, #fff 60%, #f5f5f5 100%)',
                                                                        margin: '12px 0',
                                                                        minHeight: '2.5em'
                                                                    }}
                                                                >
                                                                    {metade2}
                                                                </span>
                                                                <div className="roteiro-upgrade-box mt-3 text-center">
                                                                    <Button
                                                                        color="primary"
                                                                        className="roteiro-upgrade-btn"
                                                                        style={{
                                                                            fontWeight: 'bold',
                                                                            borderRadius: '10px',
                                                                            fontSize: '1rem',
                                                                            marginTop: '10px',
                                                                            padding: '0.7rem 1.5rem'
                                                                        }}
                                                                        onClick={() => setPlanModalOpen(true)}
                                                                    >
                                                                        Desbloquear roteiro completo
                                                                    </Button>
                                                                    <div className="roteiro-upgrade-msg mt-2" style={{ fontSize: '0.95rem', color: '#555' }}>
                                                                        Faça upgrade de plano para acessar o roteiro completo!
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="roteiro-completo">
                                                                <span>{roteiro}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                );
                            })
                        )}
                        {allConcluidos && (
                            <Button
                                color="primary"
                                className="mt-3"
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    borderRadius: '12px',
                                    minWidth: '170px',
                                    boxShadow: '0 2px 8px #2221',
                                    marginBottom: '20px',
                                }}
                                onClick={() => {
                                    setVideoModalOpen(true);
                                }}
                            >
                                Novo roteiro
                            </Button>
                        )}
                    </Col>
                </Row>
            </Container>

            <VideoFormModal
                isOpen={videoModalOpen}
                toggle={() => {
                    setVideoModalOpen(!videoModalOpen);
                }}
                selectPlan={() => {
                    setVideoModalOpen(false);
                    setPlanModalOpen(true);
                }}
            />

            <PlanModal
                isOpen={planModalOpen}
                toggle={() => {
                    setPlanModalOpen(!planModalOpen);
                }}
                refreshRoteiros={() => {
                    _refreshRoteiros();
                }}
            />

        </div>
    );
}

export default Roteiros;