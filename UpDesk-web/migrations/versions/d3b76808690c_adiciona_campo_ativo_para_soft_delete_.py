"""
Arquivo de Migração do Banco de Dados (Automático)

Responsabilidade:
- Representa uma versão específica do esquema do banco de dados.
- Contém as funções `upgrade()` e `downgrade()` que aplicam e revertem as alterações no esquema.
- Este arquivo é gerado automaticamente pelo Alembic (Flask-Migrate) e não deve ser editado manualmente,
  a menos que você tenha um conhecimento profundo de como as migrações funcionam.
"""
"""Adiciona campo ativo para soft delete de usuario

Revision ID: d3b76808690c
Revises: 830dd10a1945
Create Date: 2025-09-09 12:23:30.707963

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# identificadores de revisão, usados pelo Alembic.
revision = 'd3b76808690c'
down_revision = '830dd10a1945'
branch_labels = None
depends_on = None


def upgrade():
    # ### comandos gerados automaticamente pelo Alembic - ajuste se necessário! ###
    with op.batch_alter_table('Usuario', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ativo', sa.Boolean(), nullable=False, server_default='1'))

    # ### fim dos comandos Alembic ###


def downgrade():
    # ### comandos gerados automaticamente pelo Alembic - ajuste se necessário! ###
    with op.batch_alter_table('Usuario', schema=None) as batch_op:
        batch_op.drop_column('ativo')
    # ### fim dos comandos Alembic ###
