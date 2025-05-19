import React from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    Spinner,
    Button
} from 'reactstrap';
import { FaTimesCircle } from 'react-icons/fa';
import './loadingRoteiroModal.css';

function RegenerateModal({ isOpen, onClose, message }) {
    const isNoCredits = message && message.toLowerCase().includes('não possui mais créditos');

    return (
        <Modal
            isOpen={isOpen}
            centered
            size="md"
            className="regenerate-modal"
            contentClassName="regenerate-modal-content"
            backdrop="static"
            toggle={onClose}
        >
            <ModalHeader className="regenerate-modal-header" style={{ borderBottom: 'none', justifyContent: 'center' }}>
                <span className="regenerate-title">Gerando roteiro</span>
            </ModalHeader>
            <ModalBody className="regenerate-modal-body d-flex flex-column align-items-center justify-content-center">
                <div className="regenerate-spinner-box" style={{ minHeight: '64px' }}>
                    {isNoCredits ? (
                        <FaTimesCircle size={64} color="#dc3545" />
                    ) : (
                        <Spinner
                            color="primary"
                            style={{ width: '4rem', height: '4rem' }}
                            className="regenerate-spinner"
                        />
                    )}
                </div>
                <div className="regenerate-text mt-4 text-center">
                    {message}
                </div>
                {isNoCredits && (
                    <Button
                        color="danger"
                        className="mt-4"
                        style={{ fontWeight: 'bold', borderRadius: '10px', fontSize: '1rem', padding: '0.7rem 1.5rem' }}
                        onClick={onClose}
                    >
                        Fechar
                    </Button>
                )}
            </ModalBody>
        </Modal>
    );
}

export default RegenerateModal;