import React, { useContext, useEffect, useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Progress,
    Badge
} from 'reactstrap';
import '../styles/Roteiros.css';
import UserContext from '../context/userContext';
import VideoFormModal from '../components/videoFormModal/videoFormModal';
import PlanModal from '../components/planModal/PlanModal';
import PaymentConfirmationModal from '../components/planModal/PaymentConfirmationModal';
import RegenerateModal from '../components/loadingRoteiroModal/loadingRoteiroModal';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function Roteiros() {
    const API_URL = process.env.API_URL || process.env.REACT_APP_API_URL;
    const { userData, setUserData } = useContext(UserContext);
    const ideiasVideos = userData?.IdeiasVideos || [];
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [progressStates, setProgressStates] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const licenssType = userData?.licensed?.licenssType;
    const credits = userData?.licensed?.credits;
    const isVip = userData?.licensed?.vip;
    const isFree = licenssType === 'free';
    const isBasicOrPremium = licenssType === 'basic' || licenssType === 'premium';
    const allConcluidos = ideiasVideos.length > 0 && ideiasVideos.every(v => v.state === 'complete');
    const [regenerateModal, setRegenerateModal] = useState(false);
    const [regenerateMsg, setRegenerateMsg] = useState('Estamos regerando seu roteiro...');

    const getUserData = async () => {
        axios.get(`${API_URL}/user/getUserData`, {
            params: {
                email: userData?.email,
                nome: userData?.nome,
            }
        }).then((response) => {
            if (response.data?.user) {
                setUserData(response.data.user);
                sessionStorage.setItem('userData', JSON.stringify(response.data.user));
            } else {
                console.error('Dados do usuário não encontrados.');
            }
        }).catch((error) => {
            console.error('Erro ao obter dados do usuário:', error);
        });
    };

    useEffect(() => {
        getUserData();
    }, []);


    useEffect(() => {
        if (userData?.email) {
            const evtSource = new EventSource(`${API_URL}/user/user-updates?email=${encodeURIComponent(userData.email)}`);
            evtSource.onmessage = (event) => {
                try {
                    const updatedUser = JSON.parse(event.data);
                    setUserData(updatedUser);
                    sessionStorage.setItem('userData', JSON.stringify(updatedUser));
                } catch (e) { }
            };
            return () => evtSource.close();
        }
    }, [userData?.email, API_URL, setUserData]);


    useEffect(() => {
        setProgressStates(
            ideiasVideos.map(video =>
                video.state === 'complete' ? 100 : 10
            )
        );
    }, [ideiasVideos]);
    useEffect(() => {
        const intervals = [];
        ideiasVideos.forEach((video, idx) => {
            if (video.state !== 'complete') {
                intervals[idx] = setInterval(() => {
                    setProgressStates(prev => {
                        const newProgress = [...prev];
                        if (newProgress[idx] < 95) {
                            newProgress[idx] += 5;
                        }
                        return newProgress;
                    });
                }, 600);
            }
        });
        return () => intervals.forEach(i => clearInterval(i));
    }, [ideiasVideos]);
    useEffect(() => {
        setProgressStates(prev =>
            ideiasVideos.map((video, idx) =>
                video.state === 'complete' ? 100 : prev[idx] || 10
            )
        );
    }, [ideiasVideos]);

    const handleExpand = (idx) => {
        setExpanded(expanded === idx ? null : idx);
    };

    const getHalfScript = (roteiro) => {
        if (!roteiro) return ['', ''];
        const meio = Math.floor(roteiro.length / 2);
        return [roteiro.slice(0, meio), roteiro.slice(meio)];
    };



    const regenerateRoteiro = async (video) => {
        setRegenerateMsg('Estamos regerando seu roteiro...');
        setRegenerateModal(true);

        axios.post(`${API_URL}/video/regenerateRoteiro`, {
            email: userData?.email,
            nome: userData?.nome,
            video: video
        }).then((response) => {
            if (response.data.success) {
                getUserData();
                setRegenerateModal(false);
            } else {
                if (
                    response.data.message &&
                    response.data.message.includes('não possui mais créditos')
                ) {
                    setRegenerateMsg('Você não possui mais créditos para regerar roteiro de vídeo.');
                } else {
                    setRegenerateModal(false);
                    console.error('Erro ao regerar roteiro:', response.data.message);
                }
            }
        }).catch((error) => {
            if (
                error.response?.data?.message &&
                error.response.data.message.includes('não possui mais créditos')
            ) {
                setRegenerateMsg('Você não possui mais créditos para regerar roteiro de vídeo.');
            } else {
                setRegenerateModal(false);
                console.error('Erro ao regerar roteiro:', error);
            }
        });
    };

    return (
        <div className="roteiros-bg">
            <Container fluid className="h-100 d-flex align-items-center justify-content-center roteiros-main-container">
                <Row className="w-100 justify-content-center align-items-center">
                    <Col xs={12} md={10} lg={8} xl={6} className="d-flex flex-column align-items-center">
                        <div className="roteiros-header mb-4 text-center">
                            {isVip ? (
                                <>
                                    <span>
                                        <b>Olá, {userData?.nome || 'Usuário'}. Parabéns, você é membro </b>
                                        <Badge color="warning" style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: '1rem', verticalAlign: 'middle' }}>
                                            VIP
                                        </Badge>
                                        .
                                    </span>
                                    <div className="mt-2" style={{ fontSize: '1.1rem' }}>
                                        Plano: <b style={{ textTransform: 'capitalize' }}>{licenssType}</b>
                                        <span style={{ marginLeft: 12 }}>
                                            Créditos restantes: <b>{credits}</b>
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <span>
                                    <b>Olá, {userData?.nome || 'Usuário'}.</b> {allConcluidos ? ("Você já concluiu todos os roteiros disponíveis!") : ("Estamos gerando seu roteiro, por favor aguarde!")}
                                </span>
                            )}
                        </div>
                        <div className="mb-4 d-flex justify-content-center">
                            {isFree && credits === 0 ? (
                                <div className="alert alert-warning text-center w-100" style={{ fontWeight: 'bold', fontSize: '1.1rem', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setPlanModalOpen(true)}
                                >
                                    Faça upgrade para gerar novos roteiros
                                </div>
                            ) : (isBasicOrPremium && credits === 0 ? (
                                <div className="alert alert-danger text-center w-100" style={{ fontWeight: 'bold', fontSize: '1.1rem', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setPlanModalOpen(true)}>
                                    Seu limite foi excedido, volte a gerar em 30 dias.
                                </div>
                            ) : (
                                <Button
                                    color="primary"
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        borderRadius: '12px',
                                        minWidth: '200px',
                                        boxShadow: '0 2px 8px #2221'
                                    }}
                                    onClick={() => setVideoModalOpen(true)}
                                >
                                    Criar novo roteiro
                                </Button>
                            ))}
                        </div>
                        {ideiasVideos.length === 0 ? (
                            <Card className="roteiros-card w-100 mb-4">
                                <CardBody className="text-center">
                                    <p>Ainda não existe nenhum roteiro de vídeo para este usuário.</p>
                                </CardBody>
                            </Card>
                        ) : (
                            ideiasVideos.map((video, idx) => {
                                const data = video.date
                                    ? new Date(video.date).toLocaleDateString('pt-BR')
                                    : new Date().toLocaleDateString('pt-BR');
                                const concluido = video.state === 'complete';
                                const isExpanded = expanded === idx;
                                const roteiro = video.roteiro || '';
                                const [metade1, metade2] = getHalfScript(roteiro);
                                const progress = progressStates[idx] || (concluido ? 100 : 10);

                                return (
                                    <Card className="roteiros-card w-100 mb-4" key={idx}>
                                        <div className="roteiros-card-header d-flex justify-content-between align-items-center">
                                            <span>Vídeo {idx + 1} - {video.tema}</span>
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
                                                            : <>Gerando roteiro...</>
                                                        }
                                                    </div>
                                                    <Progress
                                                        value={progress}
                                                        color={concluido ? "info" : "success"}
                                                        animated={!concluido}
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
                                                    {isExpanded ? 'Fechar roteiro' : 'Ver roteiro'}
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
                                                                <span>
                                                                    <ReactMarkdown>
                                                                        {metade1}
                                                                    </ReactMarkdown>
                                                                </span>
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
                                                                <div className="roteiro-upgrade-box mt-3 text-center d-flex justify-content-center gap-2">
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
                                                                    <Button
                                                                        color="secondary"
                                                                        className="roteiro-fechar-btn"
                                                                        style={{
                                                                            fontWeight: 'bold',
                                                                            borderRadius: '10px',
                                                                            fontSize: '1rem',
                                                                            marginTop: '10px',
                                                                            padding: '0.7rem 1.5rem'
                                                                        }}
                                                                        onClick={() => setExpanded(null)}
                                                                    >
                                                                        Fechar roteiro
                                                                    </Button>
                                                                </div>
                                                                <div className="roteiro-upgrade-msg mt-2 w-100 text-center" style={{ fontSize: '0.95rem', color: '#555' }}>
                                                                    Faça upgrade de plano para acessar o roteiro completo!
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="roteiro-completo markdown-body">
                                                                <ReactMarkdown>
                                                                    {roteiro}
                                                                </ReactMarkdown>
                                                                {isBasicOrPremium && (
                                                                    <div className="d-flex justify-content-center mt-3 gap-2">
                                                                        <Button
                                                                            color="secondary"
                                                                            style={{
                                                                                fontWeight: 'bold',
                                                                                borderRadius: '10px',
                                                                                fontSize: '1rem',
                                                                                padding: '0.6rem 1.4rem'
                                                                            }}
                                                                            onClick={() => {
                                                                                setRegenerateModal(true);
                                                                                regenerateRoteiro(video);
                                                                            }}
                                                                        >
                                                                            Gerar Novamente
                                                                        </Button>
                                                                        <Button
                                                                            color="light"
                                                                            style={{
                                                                                fontWeight: 'bold',
                                                                                borderRadius: '10px',
                                                                                fontSize: '1rem',
                                                                                padding: '0.6rem 1.4rem',
                                                                                border: '1px solid #ccc'
                                                                            }}
                                                                            onClick={() => setExpanded(null)}
                                                                        >
                                                                            Fechar roteiro
                                                                        </Button>
                                                                    </div>
                                                                )}
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
            />

            <PaymentConfirmationModal
                isOpen={showPaymentModal}
                toggle={() => {
                    setShowPaymentModal(false);
                    setPlanModalOpen(false);
                }}
                userName={userData?.nome}
                planType={userData?.licensed?.licenssType}
            />

            <RegenerateModal
                isOpen={regenerateModal}
                onClose={() => setRegenerateModal(false)}
                message={regenerateMsg}
            />

        </div>
    );
}

export default Roteiros;