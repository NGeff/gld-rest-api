import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { FiCheck } from 'react-icons/fi';

const Billing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payment, setPayment] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkInterval, setCheckInterval] = useState(null);
  const [expirationTimer, setExpirationTimer] = useState(null);

  const plans = [
    {
      name: 'Basic',
      price: 4.90,
      features: ['1.000 requisições/dia', 'Múltiplas API keys', 'API keys personalizadas', 'Suporte por email']
    },
    {
      name: 'Pro',
      price: 9.90,
      features: ['10.000 requisições/dia', 'API keys ilimitadas', 'API keys personalizadas', 'Suporte prioritário']
    },
    {
      name: 'Enterprise',
      price: 19.90,
      features: ['50.000 requisições/dia', 'API keys ilimitadas', 'API keys personalizadas', 'Suporte premium 24/7']
    }
  ];

  useEffect(() => {
    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (expirationTimer) clearTimeout(expirationTimer);
    };
  }, [checkInterval, expirationTimer]);

  const createPayment = async (plan) => {
    try {
      const response = await axios.post('/payments', {
        plan: plan.name.toLowerCase(),
        amount: plan.price
      });
      setPayment(response.data.payment);
      setSelectedPlan(plan);
      startStatusCheck(response.data.payment.id);
      startExpirationTimer(response.data.payment.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao criar pagamento');
    }
  };

  const startStatusCheck = (paymentId) => {
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        const response = await axios.get(`/payments/${paymentId}/status`);
        if (response.data.status === 'approved') {
          clearInterval(interval);
          alert('Pagamento aprovado! Seu plano foi atualizado.');
          setPayment(null);
          setSelectedPlan(null);
          window.location.reload();
        }
      } catch (error) {
        clearInterval(interval);
      } finally {
        setChecking(false);
      }
    }, 5000);

    setCheckInterval(interval);
  };

  const startExpirationTimer = (paymentId) => {
    const timer = setTimeout(async () => {
      try {
        await axios.post(`/payments/${paymentId}/cancel`);
        alert('Pagamento expirado. Por favor, gere um novo pagamento.');
        setPayment(null);
        setSelectedPlan(null);
      } catch (error) {
        console.error('Erro ao cancelar pagamento:', error);
      }
    }, 10 * 60 * 1000);

    setExpirationTimer(timer);
  };

  const cancelPayment = async () => {
    if (checkInterval) clearInterval(checkInterval);
    if (expirationTimer) clearTimeout(expirationTimer);
    
    try {
      await axios.post(`/payments/${payment.id}/cancel`);
      setPayment(null);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Planos e Pagamentos</h1>
        <p className="page-description">Escolha o plano ideal para suas necessidades</p>
      </div>

      {!payment ? (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
          {plans.map((plan, idx) => (
            <div key={idx} className="card">
              <h3 style={{fontSize: '24px', marginBottom: '8px'}}>{plan.name}</h3>
              <div style={{fontSize: '36px', fontWeight: 'bold', marginBottom: '24px'}}>
                R$ {plan.price.toFixed(2)}<span style={{fontSize: '16px', fontWeight: 'normal'}}>/mês</span>
              </div>
              <ul style={{listStyle: 'none', marginBottom: '24px'}}>
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <FiCheck color="var(--green)" /> {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => createPayment(plan)} className="btn btn-primary" style={{width: '100%'}}>
                Escolher {plan.name}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{textAlign: 'center', maxWidth: '500px', margin: '0 auto'}}>
          <h3 style={{marginBottom: '16px'}}>Finalizar Pagamento</h3>
          <p style={{color: 'var(--warning)', marginBottom: '16px'}}>
            Este pagamento expira em 10 minutos
          </p>
          <img src={`data:image/png;base64,${payment.qrCodeImage}`} alt="QR Code" style={{maxWidth: '300px', margin: '0 auto 24px'}} />
          <p style={{marginBottom: '16px'}}>Escaneie o QR Code com seu app PIX</p>
          <div className="code-block" style={{textAlign: 'left', marginBottom: '16px'}}>
            <code style={{wordBreak: 'break-all'}}>{payment.pixCopyPaste}</code>
          </div>
          <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
            <button onClick={() => navigator.clipboard.writeText(payment.pixCopyPaste)} className="btn btn-secondary">
              Copiar Código PIX
            </button>
            <button onClick={cancelPayment} className="btn btn-danger">
              Cancelar
            </button>
          </div>
          {checking && <p style={{marginTop: '16px', color: 'var(--text-secondary)'}}>Verificando status do pagamento...</p>}
        </div>
      )}
    </Layout>
  );
};

export default Billing;
