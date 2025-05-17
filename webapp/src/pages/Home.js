import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import UserFormModal from '../components/userFormModal/userFormModal.jsx';
import VideoFormModal from '../components/videoFormModal/videoFormModal.jsx';
import '../styles/Home.css';

function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);


  return (
    <div className="home-bg">
      <Container fluid className="h-100">
        <Row className="h-100 justify-content-center align-items-center">
          <Col xs="12" className="text-center">
            <Button
              className="venda-btn"
              onClick={() => {
                setModalOpen(true);
              }}
            >
              Venda
            </Button>

            <Button
              className="venda-btn"
              onClick={() => {
                setVideoModalOpen(true);
              }}
            >
              Criar Ideia de Vídeo
            </Button>

            <Button
              className="venda-btn"
              onClick={() => {
                window.location.href = '/login';
              }}
            >
              Login
            </Button>

          </Col>
        </Row>
      </Container>
      <UserFormModal isOpen={modalOpen} toggle={() => {
        setModalOpen(!modalOpen);
      }}
        onContinue={() => {
          setVideoModalOpen(true);
        }}
      />

      <VideoFormModal
        isOpen={videoModalOpen}
        toggle={() => {
          setVideoModalOpen(false);
        }}
      />

    </div>
  );
}

export default Home;