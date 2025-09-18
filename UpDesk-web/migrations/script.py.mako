# Este é um template Mako usado pelo Alembic para gerar scripts de migração de banco de dados.
# Ele define a estrutura para gerenciar a evolução do esquema do banco de dados de forma controlada.

"""${message}
# Descrição da migração, fornecida pelo desenvolvedor.

Revision ID: ${up_revision}
# Identificador único para esta migração, crucial para o controle de versão do esquema.
Revises: ${down_revision | comma,n}
# Identificador da migração anterior, estabelecendo a ordem das migrações.
Create Date: ${create_date}
# Data e hora da criação desta migração.

"""
from alembic import op
# 'op' fornece operações de banco de dados (DDL) para modificar o esquema.
import sqlalchemy as sa
# 'sa' (SQLAlchemy) é usado para definir tipos de dados e construções de esquema.
${imports if imports else ""}

# Identificadores de revisão, usados pelo Alembic para rastrear o histórico.
revision = ${repr(up_revision)}
# O ID da revisão atual.
down_revision = ${repr(down_revision)}
# O ID da revisão para a qual esta migração reverte.
branch_labels = ${repr(branch_labels)}
# Rótulos de ramificação, úteis para migrações em ambientes de desenvolvimento paralelos.
depends_on = ${repr(depends_on)}
# Dependências de outras migrações, garantindo a ordem de execução.


def upgrade():
    # A função 'upgrade' é responsável por aplicar as mudanças no esquema do banco de dados.
    # Ela contém as operações DDL (Data Definition Language) que evoluem o banco de dados
    # para a próxima versão.
    ${upgrades if upgrades else "pass"}


def downgrade():
    # A função 'downgrade' é responsável por reverter as mudanças aplicadas pela função 'upgrade'.
    # É essencial para a reversibilidade do esquema, permitindo desfazer migrações
    # em caso de erros ou necessidade de retornar a um estado anterior.
    ${downgrades if downgrades else "pass"}
