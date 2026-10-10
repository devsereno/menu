import { useNavigate } from 'react-router-dom'

export default function Mes() {
  const nav = useNavigate()
  return (
    <div className="screen">
      <button className="btn ghost" onClick={() => nav(-1)}>← Voltar</button>
      <h1>Setembro fechado</h1>
      <p className="sub">Resumo para Ricardo</p>
      <div className="cards">
        <div className="card"><div className="k">Você deveria</div><div className="v">R$ 1.836,26</div></div>
        <div className="card"><div className="k">Você pagou</div><div className="v paid">R$ 1.453,04</div></div>
        <div className="card" style={{ background: 'var(--gold-bg)' }}>
          <div className="k">Falta</div><div className="v" style={{ color: 'var(--gold)' }}>R$ 383,22</div>
        </div>
        <div className="card"><div className="k">Casa da família ainda</div><div className="v">R$ 1.456,93</div></div>
      </div>
      <p className="note">Parcelas seguem: geladeira 07/13 e retiro 05/12</p>
      <button className="btn gold">Abrir outubro</button>
    </div>
  )
}
