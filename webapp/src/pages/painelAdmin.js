import React, { useEffect, useState } from 'react';
import '../styles/painelAdmin.css';

function PainelAdmin() {
  const [stats, setStats] = useState({
    usuariosCadastrados: 0,
    pedidosPagos: 0,
    faturamentoTotal: 0,
    mediaRoteirosPorUsuario: 0,
    totalRoteirosGerados: 0,
    cliquesGerarRoteiroVendas: 0,
    cliquesVerRoteiroCompleto: 0,
  });

  useEffect(() => {
    fetch('/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontWeight: 'bold' }}>Painel ADM</h2>
      <div style={{ border: '1px solid #bbb', borderRadius: 4, marginTop: 16 }}>
        <div className="painel-row">Usuários cadastrados: <b>{stats.usuariosCadastrados}</b></div>
        <div className="painel-row">Pedidos pagos: <b>{stats.pedidosPagos}</b></div>
        <div className="painel-row">Faturamento total: <b>R$ {stats.faturamentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</b></div>
        <div className="painel-row">Média de roteiros gerados por usuário: <b>{stats.mediaRoteirosPorUsuario}</b></div>
        <div className="painel-row">Total de roteiros gerados: <b>{stats.totalRoteirosGerados}</b></div>
        <div className="painel-row">Cliques em gerar roteiro página de vendas: <b>{stats.cliquesGerarRoteiroVendas}</b></div>
        <div className="painel-row">Cliques em ver roteiro completo: <b>{stats.cliquesVerRoteiroCompleto}</b></div>
      </div>
    </div>
  );
}

export default PainelAdmin;
