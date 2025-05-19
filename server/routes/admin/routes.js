const express = require('express');
const router = express.Router();
const { container } = require('../../db_config/db_config.js');


router.get('/dashboard-stats', async (req, res) => {
  try {
    
    const { resources: users } = await container.items.query('SELECT * FROM c').fetchAll();
    const usuariosCadastrados = users.length;

    
    const pedidosPagos = users.filter(u => u.licensed && u.licensed.vip).length;
    
    const faturamentoTotal = users.reduce((acc, u) => {
      if (u.licensed && u.licensed.vip) {
        if (u.licensed.licenssType === 'premium') return acc + 236.00;
        if (u.licensed.licenssType === 'basic') return acc + 99.00;
      }
      return acc;
    }, 0);

    
    const totalRoteirosGerados = users.reduce((acc, u) => acc + (u.IdeiasVideos ? u.IdeiasVideos.length : 0), 0);

    
    const mediaRoteirosPorUsuario = usuariosCadastrados > 0 ? (totalRoteirosGerados / usuariosCadastrados).toFixed(2) : 0;

    const cliquesGerarRoteiroVendas = users.reduce((acc, u) => acc + (u.cliquesGerarRoteiroVendas || 0), 0);

    
    const cliquesVerRoteiroCompleto = users.reduce((acc, u) => acc + (u.cliquesVerRoteiroCompleto || 0), 0);

    res.json({
      usuariosCadastrados,
      pedidosPagos,
      faturamentoTotal,
      mediaRoteirosPorUsuario,
      totalRoteirosGerados,
      cliquesGerarRoteiroVendas,
      cliquesVerRoteiroCompleto,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

module.exports = router;