import React, { useEffect, useState } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import './paymentConfirmationModal.css';

function Balloon({ style, delay }) {
    return (
        <div
            className="balloon"
            style={{
                ...style,
                animationDelay: `${delay}s`
            }}
        />
    );
}

function PaymentConfirmationModal({ isOpen, toggle, userName, planType }) {
    const [showBalloons, setShowBalloons] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowBalloons(true);
        } else {
            setShowBalloons(false);
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            centered
            className="payment-confirmation-modal"
            contentClassName="payment-confirmation-modal-content"
            backdrop="static"
        >
            <ModalBody className="payment-confirmation-modal-body">
                {/* Balões laterais animados */}
                {showBalloons && (
                    <>
                        <div className="balloons-left">
                            <Balloon style={{ left: '10%', background: '#ffb347' }} delay={0} />
                            <Balloon style={{ left: '30%', background: '#87ceeb' }} delay={0.5} />
                            <Balloon style={{ left: '20%', background: '#ff6961' }} delay={1} />
                        </div>
                        <div className="balloons-right">
                            <Balloon style={{ right: '10%', background: '#77dd77' }} delay={0.3} />
                            <Balloon style={{ right: '30%', background: '#f49ac2' }} delay={0.8} />
                            <Balloon style={{ right: '20%', background: '#fdfd96' }} delay={1.2} />
                        </div>
                    </>
                )}
                <div className="payment-confirmation-content text-center">
                    <div className="payment-checkmark">
                        <span role="img" aria-label="confetti" style={{ fontSize: 54 }}>🎉</span>
                    </div>
                    <h2 className="payment-title mb-3">Pagamento confirmado!</h2>
                    <div className="payment-message mb-2">
                        <b>Parabéns, {userName || 'usuário'}!</b>
                    </div>
                    <div className="payment-message mb-4">
                        Seu plano <span className="plan-type">{planType}</span> foi ativado com sucesso.<br />
                        Agora você é <span className="vip-badge">VIP</span> e pode aproveitar todos os benefícios!
                    </div>
                    <button className="btn btn-success btn-lg px-5" onClick={toggle}>
                        Começar a usar 🚀
                    </button>
                </div>
            </ModalBody>
        </Modal>
    );
}

export default PaymentConfirmationModal;