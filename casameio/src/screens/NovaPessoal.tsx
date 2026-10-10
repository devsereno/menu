import { useNavigate } from 'react-router-dom'

export default function NovaPessoal() {
  const nav = useNavigate()
  return (
    <div className="screen">
      <button className="btn ghost" onClick={() => nav(-1)}>← Voltar</button>
      <h1>Nova conta pessoal</h1>
      <div className="field"><label>Descrição</label><input defaultValue="Joana" /></div>
      <div className="field"><label>Valor</label><input defaultValue="60,00" /></div>
      <div className="field"><label>Data</label><input defaultValue="18/09/2026" /></div>
      <div className="field">
        <label>Recorrência</label>
        <div className="seg">
          <button className="on" type="button">Só este mês</button>
          <button type="button">Todo mês</button>
          <button type="button">Parcelado</button>
        </div>
      </div>
      <p className="note">O responsável da família pode ver esta conta.</p>
      <button className="btn" onClick={() => nav('/pessoal')}>Salvar</button>
    </div>
  )
}
