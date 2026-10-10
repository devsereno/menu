import SenhaVendedorCard from "./SenhaVendedorCard";

export default function TelaVendedor({ vendedor }) {
  async function resetarNoBackend({ senhaTemporaria, expiresAt, mustChangePassword }) {
    const res = await fetch(`/api/vendedores/${vendedor.id}/reset-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senhaTemporaria,
        expiresAt,
        mustChangePassword,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Falha ao salvar o reset");
    }
  }

  return (
    <SenhaVendedorCard vendedor={vendedor} onResetar={resetarNoBackend} />
  );
}
