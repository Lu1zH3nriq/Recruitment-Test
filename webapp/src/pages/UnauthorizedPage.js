import React from 'react';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import '../styles/UnauthorizedPage.css';

function Unauthorized() {
  return (
    <div className="unauthorized-bg">
      <Container fluid className="h-100 d-flex align-items-center justify-content-center unauthorized-main-container">
        <Row className="w-100 justify-content-center align-items-center">
          <Col xs={12} md={8} lg={6} xl={5} className="d-flex flex-column align-items-center">
            <Card className="unauthorized-card w-100">
              <CardBody className="text-center">
                <h2 className="unauthorized-title mb-3">Não autorizado</h2>
                <p className="unauthorized-text mb-4">
                  Você precisa estar logado para acessar esta página.
                </p>
                <Button
                  color="primary"
                  className="unauthorized-btn"
                  href="/login"
                >
                  Ir para Login
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Unauthorized;