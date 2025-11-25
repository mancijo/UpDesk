"""Constantes centrais para reduzir repetições.
Curto e direto; manter nomes em PT para coerência com modelo.
"""
# Conjunto de cargos considerados staff (atendimento / triagem)
# Somente cargos reais do sistema: Supervisor, N1, N2
STAFF_ROLES = {'supervisor', 'n1', 'n2'}

# Status padronizados usados nas telas (mantém strings atuais para não quebrar nada)
STATUS_CHOICES = [
    'Aberto',
    'Em Atendimento',
    'Resolvido',
    'Resolvido por IA',
    'Transferido',
    'Agendado'
]

# Prioridades possíveis (mistura IA + manual)
PRIORIDADES = [
    'Não Classificada', 'Baixa', 'Média', 'Alta', 'Urgente', 'Crítica'
]

# Setores válidos
SETORES = [
    'Administrativos e Estratégicos',
    'Operacionais',
    'Comerciais e de Relacionamento',
    'Tecnologia e Inovação',
    'Serviços Internos'
]

# Cargos válidos
CARGOS = ['Usuário', 'Supervisor', 'N1', 'N2']

# Regras para coerência setor/cargo (função simples)
def validar_setor_cargo(setor: str, cargo: str) -> tuple[bool, str | None]:
    """Valida combinação setor/cargo.
    Retorna (ok, msg_erro)"""
    if setor not in SETORES:
        return False, 'Setor inválido.'
    if cargo not in CARGOS:
        return False, 'Cargo inválido.'
    if setor != 'Tecnologia e Inovação' and cargo != 'Usuário':
        return False, 'Setor diferente de Tecnologia exige cargo Usuário.'
    if setor == 'Tecnologia e Inovação' and cargo == 'Usuário':
        return False, 'Tecnologia e Inovação deve usar Supervisor, N1 ou N2.'
    return True, None

def is_staff(cargo: str) -> bool:
    return (cargo or '').strip().lower() in STAFF_ROLES
