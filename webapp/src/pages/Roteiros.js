import React from 'react';
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

function Roteiros() {
    // Exemplo de dados (substitua pelos dados reais do seu contexto/estado)
    const nome = "Fulano";
    const data = "01/02/2025";
    const tema = "";
    const formato = "";
    const tempo = "";
    const tempoMedio = "";
    const segundosRestantes = 21;
    const progresso = Math.max(0, 100 - segundosRestantes * 4.5);

    return (
        <div className="roteiros-bg">
            <Container fluid className="h-100 d-flex align-items-center justify-content-center roteiros-main-container">
                <Row className="w-100 justify-content-center align-items-center">
                    <Col xs={12} md={10} lg={8} xl={6} className="d-flex flex-column align-items-center">
                        <div className="roteiros-header mb-4 text-center">
                            <span>
                                <b>Olá, {nome}.</b> Seu vídeo está sendo gerado, aguarde.
                            </span>
                        </div>
                        <Card className="roteiros-card w-100">
                            <div className="roteiros-card-header d-flex justify-content-between align-items-center">
                                <span>Vídeo 1</span>
                                <span>{data}</span>
                            </div>
                            <CardBody className="p-0">
                                <div className="roteiros-card-row d-flex justify-content-between align-items-center">
                                    <b>Tema do vídeo:</b>
                                    <span>{tema}</span>
                                </div>
                                <div className="roteiros-card-row d-flex justify-content-between align-items-center">
                                    <b>Formato:</b>
                                    <span>{formato}</span>
                                </div>
                                <div className="roteiros-card-row d-flex justify-content-between align-items-center">
                                    <b>Tempo do vídeo:</b>
                                    <span>{tempo}</span>
                                </div>
                                <div className="roteiros-card-row d-flex justify-content-between align-items-center">
                                    <b>Tempo médio do vídeo:</b>
                                    <span>{tempoMedio}</span>
                                </div>
                                <div className="roteiros-card-footer d-flex flex-column flex-md-row justify-content-between align-items-center">
                                    <div className="roteiros-progress-info w-100 w-md-75 mb-3 mb-md-0">
                                        <div className="mb-1">Ainda faltam {segundosRestantes} segundos.</div>
                                        <Progress
                                            value={progresso}
                                            color="success"
                                            style={{ height: '8px', background: '#e0e0e0' }}
                                        />
                                    </div>
                                    <Button
                                        color="warning"
                                        className="roteiros-btn-roteiro"
                                        disabled
                                        style={{
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            borderRadius: '12px',
                                            minWidth: '170px',
                                            boxShadow: '0 2px 8px #2221',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        VER ROTEIRO <span role="img" aria-label="cadeado">🔒</span>
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        <Button
                            color="warning"
                            className="roteiros-btn-novo-roteiro"
                            disabled
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
                                marginTop: '5rem'
                            }}
                        >
                            VER ROTEIRO <span role="img" aria-label="cadeado">🔒</span>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Roteiros;